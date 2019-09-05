// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SliderBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import Block from '../block';
import { Dynamicable } from '../dynamicable';
import { TextControl, NumberControl, CheckboxControl } from '../editor/sidebar-controls';

export default Block.register('slider', (SliderBlock = (function() {
    SliderBlock = class SliderBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Slider';
    
            this.prototype.properties = {
                ref: String,
                min: Dynamicable(Number),
                max: Dynamicable(Number),
                value: Dynamicable(Number)
            };
    
            this.const_property('height', 25);
            this.prototype.resizableEdges = ['left', 'right'];
    
            this.prototype.canContainChildren = false;
        }

        constructor(json) {
            super(...arguments);
            if (this.min == null) { this.min = Dynamicable(Number).from(0); }
            if (this.max == null) { this.max = Dynamicable(Number).from(100); }
            if (this.value == null) { this.value = Dynamicable(Number).from(50); }
        }

        boxStylingSidebarControls() { return []; }

        specialSidebarControls() { return [
            ['min', 'min', NumberControl],
            ['max', 'max', NumberControl],
            ['value', 'value', NumberControl]
        ]; }

        renderHTML(pdom, param) {
            if (param == null) { param = {}; }
            const {for_editor, for_component_instance_editor} = param;
            super.renderHTML(...arguments);

            _l.extend(pdom, {
                tag: 'input',
                typeAttr: 'range',
                children: [],
                minAttr: this.min.stringified(),
                maxAttr: this.max.stringified(),
                valueAttr: this.value.stringified(),
                margin: 0
            });

            if (!for_editor) { _.extend(pdom, {
                // FIXME name/ref/valueLink is weird and not consistant with other input types
                nameAttr: this.ref
            }); }

            if (for_editor || for_component_instance_editor) { return _.extend(pdom, {
                readOnlyAttr: true
            }); }
        }
    };
    SliderBlock.initClass();
    return SliderBlock;
})()));
