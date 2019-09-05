/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let OvalBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import { propLink } from '../util';
import config from '../config';
import Block from '../block';
import { Dynamicable } from '../dynamicable';
import { DebouncedTextControl, NumberControl, CheckboxControl, ColorControl } from '../editor/sidebar-controls';
import { wrapPdom } from '../core';

export default Block.register('oval-block', (OvalBlock = (function() {
    OvalBlock = class OvalBlock extends Block {
        static initClass() {
            this.prototype.properties = {};
    
            this.userVisibleLabel = 'Oval';
            this.keyCommand = 'O';
            this.prototype.canContainChildren = true;
        }

        getDefaultColor() { return '#D8D8D8'; }

        specialSidebarControls() { return [
            ...Array.from(this.fillSidebarControls())
        ]; }

        renderHTML(pdom, options) {
            super.renderHTML(...arguments);
            return pdom.borderRadius = '100%';
        }
    };
    OvalBlock.initClass();
    return OvalBlock;
})())
);
