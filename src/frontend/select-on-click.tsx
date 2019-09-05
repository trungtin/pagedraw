/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SelectOnClick;
import React from 'react';
import createReactClass from 'create-react-class';

export default SelectOnClick = createReactClass({
    displayName: 'ExportView',
    render() {
        return React.createElement("div", {"onClick": (this.selectSelf), "style": ({userSelect: 'auto'}), "ref": "children"}, (this.props.children));
    },

    selectSelf() {
        return window.getSelection().selectAllChildren(this.refs.children);
    }
});
