// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let EditableText;
import _ from 'underscore';
import React from 'react';
import createReactClass from 'create-react-class';
import { assert } from '../util';

export default EditableText = createReactClass({
    displayName: 'EditableText',

    render() {
        if (this.props.isEditing) {
            return (
                <input
                    type="text"
                    autoFocus={true}
                    value={this.newValue}
                    onChange={this.handleChange}
                    style={_.extend({color:'black'}, this.props.editingStyle)}
                    onKeyDown={this.inputKeyDown}
                    onBlur={this.finish}
                    onFocus={this.inputHandleFocus} />
            );
        } else {
            return (
                <span
                    style={_.extend({
                            display:'block',
                            width:'100%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }, this.props.readOnlyStyle)}
                    onMouseDown={this.textMouseDown}>
                    {this.props.valueLink.value}
                </span>
            );
        }
    },

    handleChange(e) {
        // store value from input field for our internal usage
        this.newValue = e.target.value;
        return this.forceUpdate();
    },

    inputKeyDown(e) {
        switch (e.key) {
            case "Escape":
                this.newValue = this.props.valueLink.value;
                return this.finish();
            case "Enter":
                return this.finish();
        }
    },

    inputHandleFocus(e) {
        return e.target.setSelectionRange(0, e.target.value.length);
    },

    textMouseDown(e) {
        if ((this.props.isEditable === undefined) || (this.props.isEditable === true)) {
            e.preventDefault();
            this.newValue = this.props.valueLink.value;
            return this.props.onSwitchToEditMode(true);
        }
    },

    finish() {
        assert(() => this.props.isEditing);
        if (this.newValue !== this.props.valueLink.value) { this.props.valueLink.requestChange(this.newValue); }
        return this.props.onSwitchToEditMode(false);
    }
});
