/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let StackBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import { propLink } from '../util';
import config from '../config';
import Block from '../block';
import { Dynamicable } from '../dynamicable';
import { DebouncedTextControl, NumberControl, CheckboxControl, BooleanSelectControl } from '../editor/sidebar-controls';
import { wrapPdom } from '../core';

export default Block.register('stack', (StackBlock = (function() {
    StackBlock = class StackBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Stack';
    
            this.prototype.properties =
                {directionHorizontal: Boolean};
    
            this.property('main_length',
                {get() { if (this.directionHorizontal) { return 'width'; } else { return 'height'; } }});
    
            this.property('space_between', {
                get() { return this.spaceAvailable() / (this.children.length + 1); },
                set(val) {
                    return this[this.main_length] = ((this.children.length + 1) * val) + _l.sumBy(this.children, this.main_length);
                }
            }
            );
    
            this.prototype.canContainChildren = true;
        }

        spaceAvailable() {
            return this[this.main_length] - _l.sumBy(this.children, this.main_length);
        }

        constructor(json) {
            super(json);
            if (this.directionHorizontal == null) { this.directionHorizontal = true; }
        }

        defaultSidebarControls(linkAttr) { return []; }

        specialSidebarControls() { return [
            ["Space between", 'space_between', NumberControl],
            ["Direction", "directionHorizontal", BooleanSelectControl('Horizontal', 'Vertical')]
        ]; }
    };
    StackBlock.initClass();
    return StackBlock;
})()));
