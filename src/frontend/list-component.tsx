// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ListComponent;
import React from 'react';
import createReactClass from 'create-react-class';
import { SidebarHeaderAddButton } from '../editor/component-lib';

export default ListComponent = createReactClass({
    render() {
        return (
            <div style={this.props.labelRowStyle}>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <span style={{flex: 1}}>
                        {this.props.label}
                    </span>
                    <SidebarHeaderAddButton onClick={this.handleAdd} />
                </div>
                <div>
                    {this.props.valueLink.value.map((elem, i) => {
                            return (
                                <React.Fragment key={i}>
                                    {this.props.elem({value: elem, requestChange: this.handleUpdate(i)}, (() => this.handleRemove(i)), i)}
                                </React.Fragment>
                            );
                        })}
                </div>
            </div>
        );
    },

    handleAdd() { return this.update(this.getVal().concat([this.props.newElement()])); },
    handleRemove(i) { return this.splice(i, 1); },
    handleUpdate(i) { return nv => this.splice(i, 1, nv); },

    getVal() { return this.props.valueLink.value; },
    update(nv) { return this.props.valueLink.requestChange(nv); },

    splice(...args) {
        const list_copy = this.props.valueLink.value.slice();
        list_copy.splice(...Array.from(args || []));
        return this.props.valueLink.requestChange(list_copy);
    }
});
