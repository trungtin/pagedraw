/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import RenderLoop from './RenderLoop';
import ShouldSubtreeRender from './should-subtree-render';

export default createReactClass({
    displayName: 'Zoomable',

    componentWillMount() {
        this.zoom = 1;
        this.shouldUpdateContents = true;

        this.cachedStyleTagZoom = undefined;
        return this.cachedStyleTag = undefined;
    },

    componentDidMount() {
        this.scalingView = ReactDOM.findDOMNode(this.refs.scaling);
        return this.props.viewportManager.registerViewportOwner(this);
    },

    componentWillUnmount() {
        return this.props.viewportManager.unregisterViewportOwner();
    },

    componentDidUpdate(prevProps, prevState) {
        if (this.props.viewportManager !== prevProps.viewportManager) {
            // we have to swap ourselves as the viewportOwner of prevProps.viewportManager
            // to the viewportOwner of @props.viewportManager
            prevProps.viewportManager.unregisterViewportOwner();
            return this.props.viewportManager.registerViewportOwner(this);
        }
    },


    render() {
        return React.createElement("div", {"ref": "scrollView", "className": "editor-scrollbar",  
            "style": ( _.extend({}, this.props.style, {
                // make this region scroll
                overflow: 'auto',

                // https://css-tricks.com/almanac/properties/o/overflow-anchor/
                overflowAnchor: 'none',

                // Without z-index higher than ref.scaling's, ref.scaling
                // will cover our scroll bars.  Don't know why.
                zIndex: 2
            }
            )),  
            "onWheel": (this.handleMousePinchScroll)},
            (this.stlyeTagForZoom(this.zoom)),
            React.createElement("div", {"style": ({position: 'relative'})},
                React.createElement("div", {"style": ({
                        position: 'absolute',
                        top: 0, left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1
                    })},
                    React.createElement("div", {"ref": "scaling", "style": ({
                            transform: `scale(${this.zoom})`,
                            minWidth: `${100/this.zoom}%`,
                            minHeight: `${100/this.zoom}%`,
                            transformOrigin: "top left"
                        })},
                        React.createElement(ShouldSubtreeRender, {"shouldUpdate": (this.shouldUpdateContents), "subtree": (() => {
                            return this.props.children;
                        }
                        )})
                    )
                )
            )
        );
    },

    stlyeTagForZoom(zoom) {
        // only cache one, but invalidate if the zoom changes
        if (this.cachedStyleTagZoom !== zoom) { delete this.cachedStyleTag; }

        // either it's already zoom or we're setting it from undefined
        this.cachedStyleTagZoom = zoom;

        // return a style tag, but cache it.  This way React will see that it's the same tag and
        // not do any updating with it.  This short circuiting is why we cache the tag, which is
        // why we have stlyeTagForZoom.  I think this improves perf, but can't really tell.  -JRP
        return this.cachedStyleTag != null ? this.cachedStyleTag : (this.cachedStyleTag =
            React.createElement("style", {"ref": "dynamicCss", "dangerouslySetInnerHTML": ({__html: `\
.unzoomed-control { transform: scale(${1/this.zoom}); }\
`})}));
    },

    updateZoom() {
        // mutate React's DOM like we're not supposed to.  It'll get cleared on the next
        // forceUpdate().  Also, it's the value forceUpdate() would make it, so we're probably okay.
        // Much faster than calling forceUpdate()
        this.scalingView.style.willChange = "transform";
        this.scalingView.style.transform = `scale(${this.zoom})`;

        // We're intentionally not going to update the other things that need to be updated on zoom
        // becuase they're expensive by causing repaint/relayout.  We defer them to the end of the
        // scroll interaction to get good zooming perf.
        return this.debouncedHandleZoomFinished();
    },

    debouncedHandleZoomFinished: ((fn => _l.debounce(fn, 100, {leading: false})))(function() {
        // NOTE UNUSED the following was used to force a repaint after zooming to fix a Chrome
        // rendering bug on zoom.  We don't need to do this because forceUpdate() does it for us.
        // @refs.scrollView.style.display = 'none'
        // @refs.scrollView.offsetHeight # force layout calculation, triggering repaint
        // @refs.scrollView.style.display = ''

        this.scalingView.style.willChange = "";
        this.shouldUpdateContents = false;
        this.forceUpdate();
        return this.shouldUpdateContents = true;
    }),

    childContextTypes: {
        zoomContainer: propTypes.object,
        focusWithoutScroll: propTypes.func
    },

    getChildContext() {
        return {
            zoomContainer: this,
            focusWithoutScroll: this.focusWithoutScroll
        };
    },

    focusWithoutScroll(elem) {
        // based on http://stackoverflow.com/a/11676673/257261
        if (document.activeElement !== elem) {
            let ref;
            const [x, y] = Array.from([this.refs.scrollView.scrollLeft, this.refs.scrollView.scrollTop]);
            elem.focus();
            return [this.refs.scrollView.scrollLeft, this.refs.scrollView.scrollTop] = Array.from(ref = [x, y]), ref;
        }
    },


    handleMousePinchScroll(e) {
        // for some reason, scroll events with ctrlKey=true are how we get pinch events
        let zoomMultiplier;
        if (e.nativeEvent.ctrlKey) {
            zoomMultiplier = 80;
        // We also consider metaKey + scroll to be zoom
        } else if (e.nativeEvent.metaKey) {
            zoomMultiplier = 2000;
        // other events are not considered zoom events
        } else {
            return;
        }

        e.preventDefault();

        // get how much we're going to zoom in by
        const pinchOut = e.deltaY;
        const newZoomFactor = 1 / (1 + (pinchOut/zoomMultiplier));
        const newZoom = this.zoom * newZoomFactor;
        if (newZoomFactor === 1) { return; }

        const target_bounds = this.scalingView.getBoundingClientRect();

        return this.props.viewportManager.zoomOnCoordinates((e.clientX - target_bounds.left) / this.zoom, (e.clientY - target_bounds.top) / this.zoom, newZoom);
    },

    getViewport() {
        const {scrollTop, scrollLeft, clientWidth, clientHeight} = this.refs.scrollView;
        return {top: scrollTop / this.zoom, left: scrollLeft / this.zoom, width: clientWidth / this.zoom, height: clientHeight / this.zoom};
    },

    getZoom() { return this.zoom; },

    setViewport({top, left, width, height}) {
        let old_zoom;
        const scrollView = ReactDOM.findDOMNode(this.refs.scrollView);

        [old_zoom, this.zoom] = Array.from([this.zoom, Math.min((scrollView.clientHeight / height), (scrollView.clientWidth / width), 1)]);
        this.zoom = _l.clamp(this.zoom, this.props.viewportManager.min_zoom, this.props.viewportManager.max_zoom);
        if (this.zoom !== old_zoom) { this.updateZoom(); }

        // Set scroll to block union distance plus a margin to center blocks
        scrollView.scrollTop = (top * this.zoom) - ((scrollView.clientHeight - (height * this.zoom)) / 2);
        return scrollView.scrollLeft = (left * this.zoom) - ((scrollView.clientWidth - (width * this.zoom)) / 2);
    }
});
