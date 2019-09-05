// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let GridBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import { propLink } from '../util';
import config from '../config';
import Block from '../block';
import { Dynamicable } from '../dynamicable';
import { DebouncedTextControl, NumberControl, CheckboxControl, ColorControl } from '../editor/sidebar-controls';
import { wrapPdom } from '../core';

export default Block.register('grid', (GridBlock = (function() {
    GridBlock = class GridBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Grid';
    
            this.prototype.properties = {
                repeat_variable: String,
                instance_variable: String,
                space_between: Number,
                repeat_element_react_key_expr: String
            };
    
            this.prototype.canContainChildren = true;
        }

        constructor(json) {
            super(json);

            if (this.repeat_variable == null) { this.repeat_variable = ""; }
            if (this.instance_variable == null) { this.instance_variable = "elem"; }
            if (this.space_between == null) { this.space_between = 8; }
            if (this.repeat_element_react_key_expr == null) { this.repeat_element_react_key_expr = "i"; }
        }

        getDefaultColor() { return 'rgba(0,0,0,0)'; }

        specialSidebarControls() { return [
            ["Space between", 'space_between', NumberControl]
        ]; }

        specialCodeSidebarControls(onChange) { return [
            ["List", propLink(this, 'repeat_variable', onChange), ''],
            ["Instance var", propLink(this, 'instance_variable', onChange), ''],
            ["React key",  propLink(this, 'repeat_element_react_key_expr', onChange), '']
        ]; }

        getContentSubregion() {
            return Block.unionBlock(this.doc.blocks.filter(other => this.strictlyContains(other)));
        }

        renderHTML(pdom, param) {
            if (param == null) { param = {}; }
            const {for_editor, for_component_instance_editor} = param;
            super.renderHTML(...arguments);
            if ((!!for_editor) && !for_component_instance_editor) { return; }

            return _l.extend(pdom, {
                margin: -this.space_between,
                display: 'block',
                children: [{
                    tag: 'repeater',
                    flexGrow: '1',

                    repeat_variable: this.repeat_variable,
                    instance_variable: this.instance_variable,
                    children: [{
                        tag: 'div',
                        flexGrow: '1',

                        display: 'inline-block',
                        margin: this.space_between,

                        // FIXME React specific 'key' prop.
                        // Safely ignored by our editor's pdomToReact which sets its own keys
                        keyAttr: Dynamicable.code(this.repeat_element_react_key_expr),

                        // the original element
                        children: pdom.children
                    }]
                }],
                fontSize: 0
            });
        }
    };
    GridBlock.initClass();
    return GridBlock;
})()));