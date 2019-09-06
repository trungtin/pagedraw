// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LayoutView, layoutViewForBlock;
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import _l from 'lodash';
import ShouldSubtreeRender from '../frontend/should-subtree-render';
import { assert } from '../util';
import { pdomToReact, editorReactStylesForPdom } from './pdom-to-react';
import core from '../core';
const defaultExport = {};

defaultExport.layoutViewForBlock = (layoutViewForBlock = function(block, instance_compile_opts, editor_compile_opts, editorCache) {
    let explicit_editor;
    if ((explicit_editor = typeof block.editor === 'function' ? block.editor({editorCache, instance_compile_opts}) : undefined) != null) { return explicit_editor; }
    // If a block doesn't define .editor, we default to compiling it, and rendering the pdom to screen.
    // This probably isn't the best way to express the default.

    const div = {backingBlock: block, tag: 'div', children: [], minHeight: block.height};
    if (typeof block.renderHTML === 'function') {
        block.renderHTML(div, editor_compile_opts, editorCache);
    }

    // Shallow replace of Dynamicables with their staticValues, even if isDynamic is true.
    // In the editor, we always show the staticValue, even if it's a fake value.  The editor
    // always passes through here.
    return pdomToReact(core.pdomDynamicableToPdomStatic(div));
});

defaultExport.LayoutView = (LayoutView = createReactClass({
    contextTypes: {
        editorCache: propTypes.object,
        getInstanceEditorCompileOptions: propTypes.func,
        enqueueForceUpdate: propTypes.func
    },

    // For rendering external code
    childContextTypes: {
        contentWindow: propTypes.object
    },
    getChildContext() {
        return {contentWindow: window};
    },

    render() {
        const instance_compile_opts = this.context.getInstanceEditorCompileOptions();
        const editor_compile_opts = {
            templateLang: instance_compile_opts.templateLang,
            for_editor: true,
            for_component_instance_editor: false,
            getCompiledComponentByUniqueKey: instance_compile_opts.getCompiledComponentByUniqueKey
        };

        return (
            <ShouldSubtreeRender
                ref="children"
                shouldUpdate={// If we have subsetOfBlocksToRerender, componentDidUpdate will take care of .forceUpdate()ing them,
                // so skip rendering normally
                (this.context.editorCache.render_params.subsetOfBlocksToRerender != null) === false}
                subtree={() => {
                    const zIndexes = _l.fromPairs(this.props.doc.getOrderedBlockList().map((block, i) => [block.uniqueKey, i]));
                    return (
                        <div className="layout-view">
                            {this.props.doc.blocks.map(block => {
                                    // We wrap in a ShouldSubtreeRender so we can have something to .forceUpdate()
                                    return (
                                        <ShouldSubtreeRender
                                            key={block.uniqueKey}
                                            ref={block.uniqueKey}
                                            shouldUpdate={true}
                                            subtree={() => {
                                                assert(() => block.doc.isInReadonlyMode());
                                                return this.renderBlock(block, zIndexes[block.uniqueKey], instance_compile_opts, editor_compile_opts);
                                            }} />
                                    );
                                })}
                        </div>
                    );
                }} />
        );
    },

    componentDidUpdate() {
        if (!this.context.editorCache.render_params.subsetOfBlocksToRerender) { return; }
        if (!this.refs.children) { return; }
        const {
            refs
        } = this.refs.children;
        assert(() => _l.every(this.context.editorCache.render_params.subsetOfBlocksToRerender, uk => this.props.doc.getBlockByKey(uk).getBlock() !== null));
        return (() => {
            const result = [];
            for (let blockUniqueKey of Array.from(this.context.editorCache.render_params.subsetOfBlocksToRerender)) {
                if (refs[blockUniqueKey] != null) {
                    result.push(this.context.enqueueForceUpdate(refs[blockUniqueKey]));
                }
            }
            return result;
        })();
    },

    renderBlock(block, zIndex, instance_compile_opts, editor_compile_opts) {
        // if the doc was swapped, get the current representation for this pointer
        block = block.getBlock();

        const {
            mutated_blocks
        } = this.context.editorCache.render_params;
        const mutated = mutated_blocks ? (mutated_blocks[block.uniqueKey] != null) : true;

        return (
            <div
                className="layout-view-block expand-children"
                style={{
                    top: block.top,
                    left: block.left,
                    height: block.height,
                    width: block.width,
                    zIndex
                }}>
                <ShouldSubtreeRender
                    shouldUpdate={mutated}
                    subtree={() => {
                            let override;
                            if ((override = this.props.blockOverrides[block.uniqueKey]) != null) { return override; }

                            return layoutViewForBlock(block, instance_compile_opts, editor_compile_opts, this.context.editorCache);
                        }} />
                {this.props.overlayForBlock(block)}
            </div>
        );
    }
}));

export default defaultExport;

