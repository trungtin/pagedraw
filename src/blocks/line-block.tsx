// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LineBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import { propLink } from '../util';
import config from '../config';
import Block from '../block';
import { Dynamicable } from '../dynamicable';
import { DebouncedTextControl, NumberControl, CheckboxControl, ColorControl } from '../editor/sidebar-controls';
import { wrapPdom } from '../core';

export default Block.register('line-block', (LineBlock = (function() {
    LineBlock = class LineBlock extends Block {
        static initClass() {
            this.prototype.properties = {};
    
            this.userVisibleLabel = 'Line';
            this.keyCommand = 'L';
    
            this.property('thickness', {
                get() { if (this.height < this.width) { return this.height; } else { return this.width; } },
                set(nv) {
                    if (this.height < this.width) {
                        return this.height = nv;
                    } else {
                        return this.width = nv;
                    }
                }
            }
            );
    
            this.property('resizableEdges',
                {get() { if (this.width < this.height) { return ['top', 'bottom']; } else { return ['left', 'right']; } }});
        }

        getDefaultColor() { return '#D8D8D8'; }

        specialSidebarControls() { return [
            ["thickness", 'thickness', NumberControl],
            ...Array.from(this.fillSidebarControls())
        ]; }
    };
    LineBlock.initClass();
    return LineBlock;
})()));
