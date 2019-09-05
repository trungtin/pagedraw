// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Tooltip;
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import _l from 'lodash';

export default Tooltip = createReactClass({
    render() {
        const positionClass = (() => { switch (this.props.position) {
            case 'top': return 'tooltip-top';
            case 'bottom': return 'tooltip-bottom';
            case 'left': return 'tooltip-left';
            case 'right': return 'tooltip-right';
            case undefined: return 'tooltip-top';
            default: throw new Error('Wrong props.position');
        } })();

        if (_l.isEmpty(this.props.content)) { return this.props.children; }
        return React.createElement("div", {"className": "pd-tooltip"},
            React.createElement("div", {"className": `pd-tooltiptext ${positionClass}`}, (this.props.content)),
            (this.props.children)
        );
    }
});
