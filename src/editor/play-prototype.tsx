/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { assert } from '../util';
import config from '../config';

// initialize the compiler
import '../load_compiler';

import { assert_valid_compiler_options } from '../compiler-options';

//#

import { Doc } from '../doc';

import ArtboardBlock from '../blocks/artboard-block';
import { InstanceBlock } from '../blocks/instance-block';
import { font_loading_head_tags_for_doc } from '../fonts';
import { compileComponentForInstanceEditor, pdomDynamicableToPdomStatic } from '../core';
import evalPdom from '../eval-pdom';
import { WindowContextProvider, pdomToReactWithPropOverrides } from '../editor/pdom-to-react';
import programs from '../programs';
import { server } from './server';
import ErrorPage from '../meta-app/error-page';

const if_changed_cache = function() {
    let [is_initialized, initial_value] = Array.from([false, undefined]);
    return function(current_value, if_changed_handler) {
        if (is_initialized === false) {
            is_initialized = true;
            return initial_value = current_value;
        } else if (current_value !== initial_value) { // should probably _l.isEqual or something
            return if_changed_handler();
        }
        else {}
    };
};
// all good; no-op


const defaultExport = {};


defaultExport.run = function() {
    const mount_point = document.getElementById('app');
    const show = react_element => ReactDOM.render(react_element, mount_point);

    const {page_id, docserver_id, preview_id} = window.pd_params;

    // start off with the initial preview_id
    // declare this up here so it's shared by all functions
    let active_screen_key = preview_id;

    const if_externalCode_changed = if_changed_cache();

    return server.watchPage(server.getDocRefFromId(page_id, docserver_id), function(...args) {
        const [cas_token, docjson] = Array.from(args[0]);
        const doc = Doc.deserialize(docjson);
        doc.enterReadonlyMode();

        if (config.editorGlobalVarForDebug) {
            window.doc = doc;
        }

        // if the extenalCode changed, evaled is out of date.  It's not safe to re-eval(), so refresh the page to be safe.
        // FIXME watch the libraries instead
        if_externalCode_changed(doc.externalCodeHash, () => window.location = window.location);

        return Promise.all(doc.libraries.map(lib => lib.load(window))).catch(function() { throw new Error('Lib loading shouldnt throw'); }).then(function() {

            const compile_options = {
                for_editor: false,
                for_component_instance_editor: true, // I'm not sure about this one
                templateLang: doc.export_lang,
                getCompiledComponentByUniqueKey(uniqueKey) {
                    // if you're getting a crash because you tried to see a preview with nested instance blocks... now you know why
                    return assert(() => false);
                }
            };
            assert_valid_compiler_options(compile_options);

            // FIXME: be lazy+memoizing about this
            const compiled_pdoms_by_unique_key = _l.fromPairs(doc.getComponents().map(c => [c.uniqueKey, compileComponentForInstanceEditor(c.blockTree, compile_options)]));

            var render_screen = function() {
                const active_screen_block = doc.getBlockByKey(active_screen_key);

                if ((active_screen_block == null)) {
                    return show(React.createElement(ErrorPage, { 
                        "message": "404 Not Found",  
                        "detail": "This prototype may have been deleted from the doc it was living in"}
                    )
                    );
                }

                if (active_screen_block instanceof InstanceBlock && ((active_screen_block.getSourceComponent() != null) === false)) {
                    return show(React.createElement(ErrorPage, { 
                        "message": "404 Not Found",  
                        "detail": "This screen of the prototype was derived from another, and it looks like the source one was deleted"}
                    )
                    );
                }

                const pdom_to_preview =
                    (() => {
                    if (active_screen_block instanceof ArtboardBlock) {
                        const bt = programs.all_static_blocktree_clone(active_screen_block.blockTree);
                        // even if the user forgets to mark is_screenfull, do it for them
                        bt.block.is_screenfull = true;
                        for (let fl of ['flexWidth', 'flexHeight']) { bt.block[fl] = true; }
                        return compileComponentForInstanceEditor(bt, compile_options);

                    } else if (active_screen_block instanceof InstanceBlock) {
                        return pdomDynamicableToPdomStatic(active_screen_block.toPdom(compile_options));

                    } else {
                        // some kind of error
                        return null;
                    }
                })();

                if ((pdom_to_preview == null)) {
                    return show(React.createElement(ErrorPage, { 
                        "message": "418 Bad Link",  
                        "detail": "You have a link to a piece of a prototype that isn't a whole screen, and can't meaningfully be previewed."}
                    )
                    );
                }


                //# FIXME this should be recomputed whenever the window size changes
                // If you have screen size groups, you'll need to refresh the screen to see changes after resizing the window
                const evaled_pdom = evalPdom(
                    pdom_to_preview,
                    (key => compiled_pdoms_by_unique_key[key]),
                    doc.export_lang,
                    window.innerWidth,
                    true
                );

                const react_with_events = pdomToReactWithPropOverrides(evaled_pdom, undefined, function(pdom, props) {
                    let transition_target;
                    if (((transition_target = pdom.backingBlock != null ? pdom.backingBlock.protoComponentRef : undefined) != null) && (doc.getBlockByKey(transition_target) != null)) {
                        // FIXME: what if props.style/props.onClick don't exist or mean something entirely different!!?!?!
                        props.style.cursor = 'pointer';
                        props.onClick = function() {
                            // Set the active screen.  We persist this so if the doc updates, we refresh to the same screen.
                            active_screen_key = transition_target;

                            // Update the url, so if the user refreshes or shares a link, their friend will see the same
                            // screen as the person who sent the link.
                            // Note we're leaking "/play" instead of "/preview".  I don't think anyone will notice / care.
                            // Idea: I wonder if we could / should do live collab previews...
                            window.history.replaceState({}, "", `/pages/${page_id}/play/${active_screen_key}/`);

                            return render_screen();
                        };
                    }

                    return props;
                });

                //# FIXME: add error boundaries, so we can do a nice message if the user's code crashes, like this:
                // <ErrorPage
                //     message="Preview failed to load"
                //     detail="Ask the creator of this preview to fix their code.">
                //     <small>They may find this error useful:</small> <code>{e.message}</code>
                // </ErrorPage>

                return show(React.createElement(React.Fragment, null,
                    ( font_loading_head_tags_for_doc(doc) ),
                    React.createElement(WindowContextProvider, {"window": (window)}, (react_with_events))
                )
                );
            };

            return render_screen();
        });
    });
};
export default defaultExport;
