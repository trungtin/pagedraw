/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ViewportManager;
import _l from 'lodash';
import Block from '../block';

export default ViewportManager = (function() {
    ViewportManager = class ViewportManager {
        static initClass() {
    
            this.prototype.min_zoom = 0.125;
            this.prototype.max_zoom = 8;
        }
        constructor() {
            // We must always have either a viewportOwner or an internalViewport
            this.handleZoomIn = this.handleZoomIn.bind(this);
            this.handleZoomOut = this.handleZoomOut.bind(this);
            this.handleDefaultZoom = this.handleDefaultZoom.bind(this);
            this._internalViewport = {top: 0, left: 0, width: 10, height: 10};
            this.viewportOwner = null;
        }

        registerViewportOwner(viewportOwner) {
            this.viewportOwner = viewportOwner;
            this.viewportOwner.setViewport(this._internalViewport);
            return this._internalViewport = null;
        }

        unregisterViewportOwner() {
            this._internalViewport = this.viewportOwner.getViewport();
            return this.viewportOwner = null;
        }

        getViewport() { if (this.viewportOwner) { return this.viewportOwner.getViewport(); } else { return this._internalViewport; } }
        getZoom() { if (this.viewportOwner) { return this.viewportOwner.getZoom(); } else { return 1; } }

        setViewport(viewport) { if (this.viewportOwner) { return this.viewportOwner.setViewport(viewport); } else { return this._internalViewport = viewport; } }

        // FIXME @viewportOwner should not be referenced after here

        getCenter() {
            const viewport = this.getViewport();
            return {
                x: viewport.left + (viewport.width / 2),
                y: viewport.top + (viewport.height / 2)
            };
        }

        zoomAtCenter(factor) {
            const center = this.getCenter();
            return this.zoomOnCoordinates(center.x, center.y, this.viewportOwner.zoom * factor);
        }



        zoomOnCoordinates(x, y, zoom) {
            // FIXME put this min/max clamping in one place
            // it's also in Zoomable
            let middle, middle1;
            const newZoom = _l.clamp(zoom, this.min_zoom, this.max_zoom);
            if (newZoom === this.viewportOwner.zoom) { return; }

            const currentViewport = this.viewportOwner.getViewport();
            let scrollPx = {
                top: currentViewport.top * this.viewportOwner.zoom,
                left: currentViewport.left * this.viewportOwner.zoom
            };

            // scrollTop/Left are pixel aligned, so we loose some information
            // They tend to truncate the number, but sometimes round up if it's
            // close enough.
            // We keep @lastScrollPx as our internal more precise value, and
            // use it if it looks like the last ones to set the scroll position
            // was us.
            const scrollUnchanged = this.lastScrollPx && _l.every([
                -0.5 < (middle = this.lastScrollPx.top - scrollPx.top) && middle < 1,
                -0.5 < (middle1 = this.lastScrollPx.left - scrollPx.left) && middle1 < 1
            ]);

            scrollPx = scrollUnchanged ? this.lastScrollPx : scrollPx;

            const visibleDelta = {
                top: (y * newZoom) - ((y * this.viewportOwner.zoom) - scrollPx.top),
                left: (x * newZoom) - ((x * this.viewportOwner.zoom) - scrollPx.left)
            };

            this.lastScrollPx = visibleDelta;

            this.viewportOwner.zoom = newZoom;
            this.viewportOwner.updateZoom();

            // set the scroll after the zoom, in case we need to scroll past the previous size,
            // to a point that will only exist once we've zoomed in, and made the canvas "bigger"
            const {
                scrollView
            } = this.viewportOwner.refs;
            scrollView.scrollTop = visibleDelta.top;
            return scrollView.scrollLeft = visibleDelta.left;
        }


        handleZoomIn() { return this.zoomAtCenter(1.1); }

        handleZoomOut() { return this.zoomAtCenter(0.9); }

        handleDefaultZoom() { return this.zoomAtCenter(Math.pow(this.viewportOwner.zoom, -1)); }


        centerOn(block) {
            // first set geometry, then center, so we get the current zoom level, with a new center
            return this.setViewport(_l.extend(new Block(), {geometry:  this.getViewport()}, {center: block.center}));
        }
    };
    ViewportManager.initClass();
    return ViewportManager;
})();
