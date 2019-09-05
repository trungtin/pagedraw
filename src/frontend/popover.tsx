/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Popover;
import React from 'react';
import createReactClass from 'create-react-class';
import _l from 'lodash';
const defaultExport = {};

defaultExport.Popover = (Popover = createReactClass({
    getInitialState() {
        return {open: false};
    },

    closeHandler() { return this.setState({open: false}); },

    render() {
        let position;
        return React.cloneElement(this.props.trigger, {ref: 'trigger', onClick: (() => this.setState({open: !this.state.open}))}, this.props.trigger.props.children,
            (this.state.open ? // overlay preventing clicks / scroll
                React.createElement("div", {"style": ({position: 'fixed', zIndex: 1000, top: 0, right: 0, bottom: 0, left: 0}),  
                    "onClick": (() => this.setState({open: false})),  
                    "onWheel": (() => {
                        // scrolling anywhere on the page could cause geometry to change, and we're
                        // explicitly dependant on rendered geometry.  Specifically, scrolling the
                        // sidebar where a color picker lives could change the on-screen location
                        // of @props.target, which means the popover's positioning needs to change.
                        return this.forceUpdate();
                    })})
            : undefined),

            ((() => {
            if (this.state.open) {
                // the popover, positioned in window coordinates, on top of the overlay

                // We look at the position of the trigger to position the popover
                // This doesn't use position: absolute inside position: relative
                // because we want to work in the case that the trigger is inside a
                // overflow: scroll element. See https://css-tricks.com/popping-hidden-overflow/
                // We're explicitly giving window coordinates as a function of rendered page geometry.
                // This is dangerous to do without a full js layout system, because so many things could
                // cause the page layout to change, without React necessarily knowing about it.
                // For example, resizing the window will cause re-layout, but DOM doesn't change so React
                // doesn't know about it by default.
                // EditPage will listen to window.onresize and @forceUpdate so we can re-render in this case.

                const trigger_rect = this.refs.trigger != null ? this.refs.trigger.getBoundingClientRect() : undefined;
                position =
                    (trigger_rect != null) && (this.props.popover_position_for_trigger_rect != null)
                    ? this.props.popover_position_for_trigger_rect(trigger_rect)
                    : {top: 0, left: 0};

                return React.createElement("div", {"style": (_l.extend({position: 'fixed', zIndex: 1001}, position)),  
                    "onClick"(e) {
                        // prevent the click from getting to the overlay, which would close the popover
                        e.preventDefault(); return e.stopPropagation();}},
                    (this.props.popover(this.closeHandler))
                );
            } else { return undefined;
        }
        })()));
    }
}));


export default defaultExport;


