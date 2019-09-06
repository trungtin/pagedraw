// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let dom_node_is_in_quill;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Quill from 'quill';
const defaultExport = {};


defaultExport.QuillComponent = createReactClass({
    displayName: 'QuillComponent',
    render() {
        return (
            <div
                ref="editor"
                className="quill-editor expand-children"
                onMouseDown={this.handleMouseDown}
                onContextMenu={this.handleRightClick} />
        );
    },

    handleMouseDown(e) {
        // stop the click from bubling up, so we make sure it's used only to set the cursor position
        return e.stopPropagation();
    },

    handleRightClick(e) {
        // stop the click from bubling up, so we make sure it can open the context menu for spell checking
        return e.stopPropagation();
    },

    componentWillReceiveProps(new_props) {
        // no-op if the value we should be (from props) is what we already are
        if (new_props.value !== this._internalValue) {
            // record our new internal state
            this._internalValue = new_props.value;

            // push the new state to quill.  Note this triggers
            // a @quill.on 'text-change' below.  We must set
            // @_internalValue *before* changing quill so that
            // the change handler will see the new state of quill
            // matches our internal state, and no-op

            // Note that componentWillReceiveProps can be called before componentDidMount
            // in some circumstances.  It has been a problem when TextBlocks and
            // GroupBlocks are in the same AbsoluteBlock, as GroupBlocks (7/5/2016)
            // force a re-render when mounted.
            // When this happens, we will not have @quill set.
            return (this.quill != null ? this.quill.setText(this._internalValue != null ? this._internalValue : "") : undefined);
        }
    },


    componentDidMount() {
        this.quill = new Quill(ReactDOM.findDOMNode(this), {
            theme: 'base',
            styles: null
        });
        //quill.addModule('toolbar', { container: '#toolbar' })

        this._disable_quill_biu_keyboard_shortcuts();

        if (this._internalValue == null) { this._internalValue = this.props.value != null ? this.props.value : ""; }

        // FIXME setting the HTML here, after Quill's been initialized, will make quill think it
        // started empty, so undo immediately after entering content mode will clear the text block.
        // This also takes some time, which may be slow.
        this.quill.setText(this._internalValue);

        const throttle = (wait_ms, fn) => _.throttle(fn, wait_ms, {leading: false});

        // I'd name @didUnmount @isMounted, but React already defines that name
        this.didUnmount = false;

        return this.quill.on('text-change', throttle((this.props.throttle_ms != null ? this.props.throttle_ms : 500), () => {
            // Since the change handler is throttled, it may be deferred to after when
            // this component is removed from the screen.  Trust that the unmount handler
            // has cleaned up the remaining state appropriately.
            if (this.didUnmount) { return; }

            // get current state of Quill editor
            const new_value = this.quill.getText();

            // no-op if the value hasn't actually changed
            if (new_value === this._internalValue) { return; }

            // update our record of the Quill state
            this._internalValue = new_value;

            // push the new value back out
            return this.props.onChange(this._internalValue);
        })
        );
    },


    componentWillUnmount() {
        this.didUnmount = true;
        return window.requestIdleCallback(() => {
            const finalText = this.quill.getText();
            this.quill.destroy();
            if (finalText !== this.props.value) {
                this.props.onChange(finalText);
            }
            return this.quill = null;
        });
    },

    contextTypes: {
        focusWithoutScroll: propTypes.func
    },

    //# imperative methods called  by a parent with a ref to us
    focus() {
        return this.context.focusWithoutScroll(ReactDOM.findDOMNode(this).children[0]);
    },

    select_all_content() {
        const inner_quill_editor_node = ReactDOM.findDOMNode(this).getElementsByClassName('ql-editor')[0];
        const range = new Range();
        range.selectNodeContents(inner_quill_editor_node);
        const selection = window.getSelection();
        selection.removeAllRanges();
        return selection.addRange(range);
    },

    put_cursor_at_end() {
        const inner_quill_editor_node = ReactDOM.findDOMNode(this).getElementsByClassName('ql-editor')[0];
        const range = cursor_at_point(inner_quill_editor_node, inner_quill_editor_node.childNodes.length);

        const selection = window.getSelection();
        selection.removeAllRanges();
        return selection.addRange(range);
    },

    _disable_quill_biu_keyboard_shortcuts() {
        // Disable the cmd+b/cmd+i/cmd+u shortcuts.  For now, we're only supposed to
        // support plaint text.
        // We handle B/I/U in Editor.handleKeyDown
        // See Editor.keyEventShouldBeHandledNatively for extra work we need to do.
        // See https://github.com/quilljs/quill/blob/v0.20.0/src/modules/keyboard.coffee
        // to understand what I'm doing here.
        // This is definitely hacks, but we're **SUPER VENDORIZING**, so, you know,
        // blow this up if you ever upgrade or swap out quill.
        // Luckily, this file is the only place we wrap quill, because we did a good job
        // intentionally isolating and wrapping potentially unreliable deps.
        // Although, for what it's worth, Quill seems like really good code!
        return ['B', 'I', 'U'].map((key) =>
            delete this.quill.modules.keyboard.hotkeys[key.charCodeAt(0)]);
    }});


defaultExport.dom_node_is_in_quill = (dom_node_is_in_quill = function(dom_node) {
    // return _l.any (dom_parents dom_node), (p) -> p?.classList.contains('ql-editor')
    if (dom_node === null) { return false; }
    if ((dom_node.nodeType === dom_node.ELEMENT_NODE) && dom_node.classList.contains('ql-editor')) { return true; }
    return dom_node_is_in_quill(dom_node.parentNode);
});


export default defaultExport;


var cursor_at_point = function(container, offset) {
    const range = new Range();
    range.setStart(container, offset);
    range.setEnd(container, offset);
    return range;
};

