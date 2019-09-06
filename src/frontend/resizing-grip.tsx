// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ResizingFrame, ResizingGrip, resizingGrips;
import React from 'react';
import createReactClass from 'create-react-class';
import _l from 'lodash';
const defaultExport = {};


defaultExport.ResizingGrip = (ResizingGrip = createReactClass({
    displayName: 'ResizingGrip',
    render() {
        return (
            <div
                style={_l.extend({}, this.props.positioning, {
                    position: 'absolute',
                    width: 0, height: 0
                })}>
                <div
                    className="gabe-grip unzoomed-control"
                    onMouseDown={this.flagEvent}
                    style={{cursor: `${this.props.cursor}-resize`}} />
            </div>
        );
    },

    flagEvent(evt) {
        return evt.nativeEvent.context = this.props.clickFlag;
    },

    // This is just a fixed widget
    shouldComponentUpdate() { return false; }
}));

defaultExport.resizingGrips = (resizingGrips = [
    {label: 'tl', sides: ['top', 'left'], positioning: {top: 0, left: 0}, cursor: 'nwse'},
    {label: 'l',  sides: ['left'], positioning: {top: '50%', left: 0}, cursor: 'ew'},
    {label: 'bl', sides: ['bottom', 'left'], positioning: {bottom: 0, left: 0}, cursor: 'nesw'},
    {label: 'b',  sides: ['bottom'], positioning: {bottom: 0, left: '50%'}, cursor: 'ns'},
    {label: 'br', sides: ['bottom', 'right'], positioning: {bottom: 0, right: 0}, cursor: 'nwse'},
    {label: 'r',  sides: ['right'], positioning: {top: '50%', right: 0}, cursor: 'ew'},
    {label: 'tr', sides: ['top', 'right'], positioning: {top: 0, right: 0}, cursor: 'nesw'},
    {label: 't',  sides: ['top'], positioning: {top: 0, left: '50%'}, cursor: 'ns'}
]);

defaultExport.ResizingFrame = (ResizingFrame = ({style, resizable_edges, flag}) => // style must include either position:absolute or position:relative
<div className="resizing-frame" style={style}>
    {(() => {
        const result = [];
        
        for (let grip of Array.from(resizingGrips)) {
            if (_l.every(grip.sides, grip => Array.from(resizable_edges).includes(grip))) {
                result.push(<ResizingGrip
                    key={grip.label}
                    positioning={grip.positioning}
                    cursor={grip.cursor}
                    clickFlag={flag(grip)} />);
            }
        }

        return result;
    })()}
</div>);
export default defaultExport;
