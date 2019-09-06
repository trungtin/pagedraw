// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let previewOfInstance;
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import imagesLoaded from 'imagesloaded';
import { font_loading_head_tags_for_doc } from '../fonts';

// initialize the compiler
import '../load_compiler';

import { assert, memoize_on } from '../util';
import { Doc } from '../doc';
import { InstanceBlock } from '../blocks/instance-block';
import LayoutBlock from '../blocks/layout-block';
import ArtboardBlock from '../blocks/artboard-block';
import { assert_valid_compiler_options } from '../compiler-options';
import { LayoutEditorContextProvider } from './layout-editor-context-provider';
import { LayoutView } from './layout-view';
import { pdomToReact } from './pdom-to-react';
import programs from '../programs';
import config from '../config';

import {
    evalPdomForInstance,
    compileComponentForInstanceEditor,
    blocks_from_block_tree,
    postorder_walk_block_tree,
} from '../core';

window.normalizeDocjson = function(docjson, skipBrowserDependentCode) {
    if (skipBrowserDependentCode == null) { skipBrowserDependentCode = false; }
    const {Editor} = require('./edit-page');
    return new Promise(function(resolve, reject) {

        // FIXME: use the util.assertHandler hook for the usual util.assert
        assert = function(fn) { if (!fn()) { return reject(new Error("Assertion failed in normalize check")); } };

        return ReactDOM.render(
            <Editor
                normalizeCheckMode={{docjson, callback: resolve, assert}}
                skipBrowserDependentCode={skipBrowserDependentCode} />,
            document.getElementById('app'));
    });
};


window.loadEditor = function(docjson) {
    const {Editor} = require('./edit-page');
    return new Promise(function(resolve, reject) {
        config.warnOnEvalPdomErrors = false;

        window.didEditorCrashBeforeLoading = function(didCrash) {
            // called when the Editor finishes loading, or on window.onerror
            if (didCrash) { return reject(new Error("loading crashed, you dummy!")); }
            if ((__guard__(editorInstance != null ? editorInstance.doc : undefined, x => x.serialize) == null)) { return reject(new Error("Something went wrong in load doc")); }
            const justLoaded = editorInstance.doc.serialize();
            editorInstance.normalizeForceAll();
            return resolve([justLoaded, editorInstance.doc.serialize()]);
        };

        window.addEventListener('error', err => reject(err.toString()));

        var editorInstance = null;
        return ReactDOM.render(
            <Editor
                ref={function(_instance) { return editorInstance = _instance; }}
                initialDocJson={docjson} />,
            document.getElementById('app'));
    });
};

//# FIXME previewOfInstance and previewOfArtboard are **very** similar

window.previewOfInstance = (previewOfInstance = function(instanceUniqueKey, docjson) {
    const doc = Doc.deserialize(docjson);
    doc.enterReadonlyMode();
    const instanceBlock = doc.getBlockByKey(instanceUniqueKey);

    var compile_options = {
        for_editor: false,
        for_component_instance_editor: true,
        templateLang: doc.export_lang,
        getCompiledComponentByUniqueKey(uniqueKey) {
            const componentBlockTree = doc.getBlockTreeByUniqueKey(uniqueKey);
            if (componentBlockTree === undefined) { return undefined; }
            return compileComponentForInstanceEditor(componentBlockTree, compile_options);
        }
    };
    assert_valid_compiler_options(compile_options);

    assert(() => instanceBlock instanceof InstanceBlock && (instanceBlock.getSourceComponent() != null));
    const pdom = instanceBlock.toPdom(compile_options);

    //# FIXME this is not being recomputed whenever the window size changes, which means we won't accurately
    // represent ScreenSizeGroups
    // We should normally try catch around the next line, but in this case we are assuming no errors will happen so not
    // try catching makes the stack trace easier to debug.
    const evaled_pdom = evalPdomForInstance(
        pdom,
        compile_options.getCompiledComponentByUniqueKey,
        compile_options.templateLang,
        window.innerWidth);

    return (
        <div>
            {font_loading_head_tags_for_doc(doc)}
            {pdomToReact(evaled_pdom)}
        </div>
    );
});


const defaultExport = {};


window.previewOfArtboard = (defaultExport.previewOfArtboard = function(artboardUniqueKey, docjson) {
    const doc = Doc.deserialize(docjson);
    doc.enterReadonlyMode();
    const artboard = doc.getBlockByKey(artboardUniqueKey);

    var compile_options = {
        // FIXME it's unclear whether for_editor should be true or false.  We should run this
        // twice, once for each.
        for_editor: false,

        for_component_instance_editor: true,
        templateLang: doc.export_lang,
        getCompiledComponentByUniqueKey(uniqueKey) {
            // FIXME: memoize?
            const componentBlockTree = doc.getBlockTreeByUniqueKey(uniqueKey);
            if (componentBlockTree === undefined) { return undefined; }
            return compileComponentForInstanceEditor(componentBlockTree, compile_options);
        }
    };
    assert_valid_compiler_options(compile_options);


    // use only static values for the toplevel to match Layout mode
    const artboard_clone_blocktree = programs.all_static_blocktree_clone(artboard.blockTree);

    // we don't want any minHeight: 100vh
    postorder_walk_block_tree(artboard_clone_blocktree, function({block}) {
        if (block instanceof ArtboardBlock || block instanceof LayoutBlock) { return block.is_screenfull = false; }
    });

    const pdom = compileComponentForInstanceEditor(artboard_clone_blocktree, compile_options);

    // We should normally try catch around the next line, but in this case we are assuming no errors will happen so not
    // try catching makes the stack trace easier to debug.
    const evaled_pdom = evalPdomForInstance(
        pdom,
        compile_options.getCompiledComponentByUniqueKey,
        compile_options.templateLang,

        // FIXME should this be artboard.width?
        window.innerWidth);

    return (
        <div
            className="expand-children"
            style={{height: artboard.height, width: artboard.width}}>
            {font_loading_head_tags_for_doc(doc)}
            {pdomToReact(evaled_pdom)}
        </div>
    );
});



window.layoutEditorOfArtboard = (defaultExport.layoutEditorOfArtboard = function(artboardUniqueKey, docjson) {
    let shifted_doc;
    const doc = Doc.deserialize(docjson);
    doc.enterReadonlyMode();
    const artboard = doc.getBlockByKey(artboardUniqueKey);
    return (
        // Pick from the existing doc instead of getting a freshRepresentation because they're not going to
        // be mutated.  Think about that if you refactor this code.
        // We can't passs {blocks} to the Doc constructor or the constructor will set block.doc
        <LayoutEditorContextProvider doc={doc}>
            {(shifted_doc = new Doc(_l.pick(doc, ['export_lang', 'fonts', 'custom_fonts'])), shifted_doc.blocks = artboard.andChildren().map(block => {
                const clone = block.freshRepresentation();
                clone.top -= artboard.top;
                clone.left -= artboard.left;

                // HACK tell the cloned blocks they belong to the source doc, so instance blocks
                // look for their source component in the source doc
                clone.doc = doc;

                return clone;
            }), // UNCLEAR what's the pointerEvents 'none' for?  @michael wrote it in the original code
            shifted_doc.enterReadonlyMode(), <div
                style={{width: artboard.width, height: artboard.height, pointerEvents: 'none'}}>
                {font_loading_head_tags_for_doc(shifted_doc)}
                <LayoutView doc={shifted_doc} blockOverrides={{}} overlayForBlock={() => null} />
            </div>)}
        </LayoutEditorContextProvider>
    );
});


export default defaultExport;


//#

const ComponentDidLoad = createReactClass({
    render() {
        return (
            <div ref="wrapper">
                {this.props.elem}
            </div>
        );
    },

    componentDidMount() {
        // Wait for images to load before considering this component "Loaded"
        return imagesLoaded(this.refs.wrapper, {background: true}, (() => window.document.fonts.ready.then(this.props.callback)));
    }
});

window.loadForScreenshotting = loader_params => new Promise(function(resolve, reject) {
    window.load_for_screenshotting_params = loader_params; // leak in case you need to debug
    const [loader, ...args] = Array.from(loader_params);
    const elem = window[loader](...Array.from(args || []));
    return ReactDOM.render(<ComponentDidLoad elem={elem} callback={resolve} />, document.getElementById('app'));
});

window.loadPreviewOfInstance = (instanceUniqueKey, docjson) => // legacy— should be using loadForScreenshotting directly
window.loadForScreenshotting(['previewOfInstance', instanceUniqueKey, docjson]);

window.loadPdom = pdom => new Promise((resolve, reject) => ReactDOM.render(<ComponentDidLoad elem={pdomToReact(pdom)} callback={resolve} />, document.getElementById('app')));

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}