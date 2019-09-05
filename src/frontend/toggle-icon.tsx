// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import createReactClass from 'create-react-class';

export default createReactClass({
    displayName: 'ToggleIcon',

    render() {
        const icon = this.props.valueLink.value === true ? this.props.checkedIcon : this.props.uncheckedIcon;
        return React.cloneElement(icon, {onClick: this.toggle});
    },

    toggle(e) {
        this.props.valueLink.requestChange(!this.props.valueLink.value);
        e.stopPropagation();
        return e.preventDefault();
    }
});
