// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let CheckBoxBlock;
import _l from 'lodash';
import React from 'react';
import Block from '../block';
import { Dynamicable } from '../dynamicable';
import { TextControl, NumberControl, CheckboxControl } from '../editor/sidebar-controls';

export default Block.register('checkbox', (CheckBoxBlock = (function() {
    CheckBoxBlock = class CheckBoxBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Check Box';
    
            this.prototype.properties = {
                ref: String,
                checked: Dynamicable(Boolean)
            };
    
            this.prototype.resizableEdges = [];
            // FIXME: I don't know if these numbers should ever change in different scenarios
            this.compute_previously_persisted_property('width',  {get() { return 16; }, set() {}}); // immutable.  Unclear if that works.
            this.compute_previously_persisted_property('height', {get() { return 16; }, set() {}}); // immutable.  Unclear if that works.
    
            this.prototype.canContainChildren = false;
        }

        constructor() {
            super(...arguments);
            if (this.checked == null) { this.checked = Dynamicable(Boolean).from(false); }
        }

        boxStylingSidebarControls() { return []; }
        specialSidebarControls() { return [
            ["Checked", 'checked', CheckboxControl]
        ]; }

        renderHTML(dom, options) {
            super.renderHTML(...arguments);

            return dom.children = [{
                tag: 'input',
                typeAttr: 'checkbox',
                checkedAttr: this.checked.strTrueOrUndefined(options),
                nameAttr: this.ref,
                children: [],

                // <input type="radio" /> defaults to some weird margins and it sucks
                marginTop: 0, marginBottom: 0, marginLeft: 2, marginRight: 2,

                // react gets upset if there's a checkedAttr and no onChange
                readOnlyAttr: options.for_editor || options.for_component_instance_editor ? true : undefined
            }];
        }
    };
    CheckBoxBlock.initClass();
    return CheckBoxBlock;
})()));
