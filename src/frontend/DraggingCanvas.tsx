// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MouseStateMachine, windowMouseMachine;
import _ from 'underscore';
import $ from 'jquery';
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import config from '../config';
import { distanceSquared } from '../util';
const defaultExport = {};

// This file's purpose in life is to expose an onDrag interface via DraggingCanvas
// For that purpose, we map the browser's mouse events to our own implementation of a mouse state machine


// events :: {onDrag, onClick}
defaultExport.MouseStateMachine = (MouseStateMachine = function() {
    // states: up, down, dragged
    let state = 'up';
    let initialPosition = null;
    let dragHandler = null;
    let events = null;
    let target = null;
    let lastClick = {location: null, time: null};
    let currentMousePositionInWindow = {top: 0, left: 0};
    let currentModifierKeysPressed = {altKey: false, shiftKey: false, metaKey: false, ctrlKey: false, capsLockKey: false};

    const setCurrentModifierKeysPressed = e => currentModifierKeysPressed = {
        altKey: e.altKey, shiftKey: e.shiftKey, metaKey: e.metaKey, ctrlKey: e.ctrlKey,
        capsLockKey: e.getModifierState('CapsLock')
    };


    const getMousePositionForDiv = function(_target) {
        const mouse = currentMousePositionInWindow;

        // NOTE: _target is the thing we're clicking on. The only reason we use it is to calculate how zoomed in we are
        // so we can compensate for zoom
        const target_bounds = _target.getBoundingClientRect();
        const [logical_height, logical_width] = Array.from([_target.clientHeight, _target.clientWidth]);
        return {
            top: Math.round(((mouse.top - target_bounds.top) / target_bounds.height) * logical_height),
            left: Math.round(((mouse.left - target_bounds.left) / target_bounds.width) * logical_width)
        };
    };

    const targetOffseted = fn => (function(e) {
        currentMousePositionInWindow = {left: e.clientX, top: e.clientY};
        setCurrentModifierKeysPressed(e);

        if ((target == null)) { return; }
        const interactedHandler = events.onInteracted; // save this in case it changes in fn

        const {top, left} = getMousePositionForDiv(target);
        fn({top, left, evt: e, ctx: e.context});

        return interactedHandler();
    });

    return {
        setCurrentModifierKeysPressed,
        getCurrentModifierKeysPressed() { return currentModifierKeysPressed; },

        getMousePositionForDiv,

        down(_target, e, _events) {
            if (state !== 'up') { console.warn('down mouse went down'); }

            target = _target;
            events = _events;

            setCurrentModifierKeysPressed(e);
            currentMousePositionInWindow = {left: e.clientX, top: e.clientY};
            const {top, left} = getMousePositionForDiv(target);
            const where = {top, left, evt: e, ctx: e.context};

            state = 'down';
            initialPosition = where;
            dragHandler = null;
            return events.onInteracted();
        },

        move: targetOffseted(function(where) {
            if (state === 'up') {
                // mouse is moving without a drag; do nothing
                return;

            } else if (state === 'down') {
                // transition from ambiguous mouse down to drag event

                // NOTE: here we use evt.clientX/Y instead of top/left since we care about absolute mouse position
                // top, left are relative and take zoom into account
                if (config.ignoreDragsWithinTolerance && (distanceSquared([where.evt.clientX, where.evt.clientY], [initialPosition.evt.clientX, initialPosition.evt.clientY]) < config.maxSquaredDistanceForIgnoredDrag)) { return; }

                // start the drag handler
                dragHandler = {moved() {}, ended() {}};
                events.onDrag(initialPosition,
                    (h => dragHandler.moved = h),
                    (h => dragHandler.ended = h));

                state = 'dragged';
            }

            if (state === 'dragged') { // or down, but if it was down we would be dragged now
                where.delta = {top: where.top - initialPosition.top, left: where.left - initialPosition.left};
                return dragHandler.moved(where);
            }
        }),

        up: targetOffseted(function(where) {
            if (state === 'up') {
                console.warn('up mouse went up');

            } else if (state === 'down') {
                if ((lastClick.location != null) && (distanceSquared([where.left, where.top], lastClick.location) < config.maxSquaredDistanceBetweenDoubleClick) && ((Date.now() - lastClick.time) < config.maxTimeBetweenDoubleClick)) {
                    events.onDoubleClick(initialPosition);
                } else {
                    events.onClick(initialPosition);
                }

                lastClick = {location: [where.left, where.top], time: Date.now()};

            } else if (state === 'dragged') {
                dragHandler.ended(where);
            }

            // no matter where we were, we're now up
            state = 'up';
            dragHandler = null;
            initialPosition = null;
            target = null;
            return events = null;
        }),


        reset() {
            // we might want to clear out state after eg. a crash
            state = 'up';
            dragHandler = null;
            initialPosition = null;
            target = null;
            return events = null;
        }
    };
});



defaultExport.windowMouseMachine = (windowMouseMachine = MouseStateMachine());

let debounced_move_event = null;
let animation_frame_request = null;

// This code is also loaded on the server, so just don't load ourselves onto the window if we don't have one.
// On mobile, also don't load this code.  Huge hack, but we allow mobile to load /fiddle's READMEs, if
// they have one.  It's only the README, so they don't need a LayoutEditor/DraggingCanvas.  Unfortunately,
// on some supported mobile platforms, evt.getModifierState() does not exist, and we call it every time there's
// a mouse event we pick up.  Just by binding the windowMouseMachine, we're going to collect all mouse events,
// even if we don't want them.  This is a hack just to prevent that.
if ((typeof window !== 'undefined' && window !== null) && !__guard__(typeof window !== 'undefined' && window !== null ? window.pd_params : undefined, x => x.mobile)) {

    $(window).on('mousemove', function(e) {
        debounced_move_event = e;
        if (animation_frame_request == null) { return animation_frame_request = window.requestAnimationFrame(fire_move_event); }
    });

    var fire_move_event = function() {
        const e = debounced_move_event;

        // clear debounced_move_event, just to be clean
        debounced_move_event = null;

        // the event fired, so let's clarify that state, OR, mouseup fired, and canceled the event
        animation_frame_request = null;

        // call pass the event to windowMouseMachine
        return windowMouseMachine.move(e.originalEvent);
    };


    $(window).on('mouseup', function(e) {
        // fire the last delayed mouse move event
        if (animation_frame_request != null) {
            window.cancelAnimationFrame(animation_frame_request);
            fire_move_event();
        }

        return windowMouseMachine.up(e.originalEvent);
    });
}

defaultExport.DraggingCanvas = createReactClass({
    displayName: 'DraggingSurface',

    render() {
        // DraggingCanvas has a tabIndex not because we need it to have focus, but so that it can blur others
        return (
            <div
                className={["no-focus-outline"].concat(this.props.classes != null ? this.props.classes : []).join(' ')}
                style={this.props.style}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.props.onMouseMove}
                onContextMenu={this.onRightClick}
                ref="canvas"
                tabIndex="100">
                {this.props.children}
            </div>
        );
    },

    contextTypes: {
        focusWithoutScroll: propTypes.func
    },

    handleMouseDown(e) {
        // ignore non-left clicks
        if (e.nativeEvent.which !== 1) { return; }
        const target = ReactDOM.findDOMNode(this);

        // We register these handlers here because in case there are multiple DraggingCanvases in a screen,
        // this essentially says "the current dragging canvas owns this interaction until it ends" starting when the mouse goes down
        // mousemove and mouseup events are handled window-wide above because an interaction is allowed to start in a DraggingCanvas and
        // end somewhere else
        windowMouseMachine.down(target, e.nativeEvent, {
            onDrag: (...args) => this.props.onDrag(...Array.from(args || [])),
            onClick: (...args) => this.props.onClick(...Array.from(args || [])),
            onDoubleClick: (...args) => this.props.onDoubleClick(...Array.from(args || [])),
            onInteracted: () => this.interactionHappened()
        });

        e.preventDefault();
        return this.context.focusWithoutScroll(target);
    },

    onRightClick(evt) {
        if (config.preventRightClick) {
            return evt.preventDefault();
        }
    },

    interactionHappened() {
        return (typeof this.props.onInteractionHappened === 'function' ? this.props.onInteractionHappened() : undefined);
    }
});

export default defaultExport;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}