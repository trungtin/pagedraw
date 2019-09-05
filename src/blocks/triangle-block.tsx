/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Triangle;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import { propLink } from '../util';
import config from '../config';
import Block from '../block';
import { Dynamicable } from '../dynamicable';

import {
    DebouncedTextControl,
    NumberControl,
    CheckboxControl,
    ColorControl,
    SelectControl,
} from '../editor/sidebar-controls';

import { wrapPdom } from '../core';

export default Block.register('triangle', (Triangle = (function() {
    Triangle = class Triangle extends Block {
        static initClass() {
            this.userVisibleLabel = 'Triangle';
    
            this.prototype.properties =
                {corner: String};
             // one of top-left|top-right|bottom-left|bottom-right
        }

        constructor(json) {
            super(json);
            if (this.corner == null) { this.corner = 'bottom-right'; }
        }


        getDefaultColor() { return '#D8D8D8'; }

        specialSidebarControls() { return [
            ["fill color", 'color', ColorControl],
            ["corner", 'corner', SelectControl({multi: false, style: 'dropdown'}, [
                ["Top Left", 'top-left'],
                ["Top Right", 'top-right'],
                ["Bottom Left", 'bottom-left'],
                ["Bottom Right", 'bottom-right']
            ])]
        ]; }

        // disable border and shadow, because they'll go on the block's rectangle, instead of on the triangle
        boxStylingSidebarControls() { return []; }

        renderHTML(pdom, options) {
            // HACK this is just copied from Block.renderHTML.  There's an assumption that everyone's calling
            // their superclass' implementation, and we are hella not.
            // We can't call super() because we'd get a backgroundColor, which would be wrong.  Instead we
            // explicitly set the fill on the SVG.  If we set a backgroundColor, the bounding rectangle of the
            // block would be filled, and the triangle of the same color would disappear into the background.
            pdom.cursor = this.cursor;

            pdom.children = [{
                tag: 'svg',
                versionAttr: '1.1',
                xmlnsAttr: 'http://www.w3.org/2000/svg',
                viewBoxAttr: `0 0 ${this.width} ${this.height}`,
                display: 'block',
                children: [{
                    tag: 'polygon',
                    children: [],
                    fill: this.color,
                    pointsAttr: (() => { switch (this.corner) {
                        case 'top-left':     return `0 ${this.height} ${this.width} 0 0 0`;
                        case 'top-right':    return `0 0 ${this.width} 0 ${this.width} ${this.height}`;
                        case 'bottom-right': return `0 ${this.height} ${this.width} 0 ${this.width} ${this.height}`;
                        case 'bottom-left':  return `0 0 0 ${this.height} ${this.width} ${this.height}`;
                    } })()
                }]
            }];

            return delete pdom.height;
        }
    };
    Triangle.initClass();
    return Triangle;
})())
);
