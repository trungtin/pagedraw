// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LayoutBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import { find_unused, propLink } from '../util';
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
import { PropSpec, CheckboxPropControl, ListPropControl } from '../props';

export default Block.register('layout', (LayoutBlock = (function() {
    LayoutBlock = class LayoutBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Rectangle';
            this.keyCommand = 'R';
    
            this.prototype.properties = {
                is_repeat: Boolean,
                is_optional: Boolean,
                is_form: Boolean,
    
                repeat_variable: String,
                repeat_direction: String,
                instance_variable: String,
                space_between: Number,
                repeat_element_react_key_expr: String,
    
                show_if: String,
                occupies_space_if_hidden: Boolean,
    
                form_action: String,
                form_method: String,
                form_encoding: String,
    
                is_screenfull: Boolean
            };
    
            this.prototype.canContainChildren = true;
        }

        constructor(json) {
            super(json);
            if (this.borderColor == null) { this.borderColor = '#979797'; }

            // set all of these so we never have to worry in the compiler if they're undefined
            if (this.is_repeat == null) { this.is_repeat = false; }
            if (this.is_optional == null) { this.is_optional = false; }
            if (this.is_form == null) { this.is_form = false; }

            if (this.repeat_variable == null) { this.repeat_variable = ''; }
            if (this.repeat_direction == null) { this.repeat_direction = 'vertical'; }
            if (this.instance_variable == null) { this.instance_variable = ''; }
            if (this.space_between == null) { this.space_between = 0; }
            if (this.repeat_element_react_key_expr == null) { this.repeat_element_react_key_expr = "i"; }

            if (this.show_if == null) { this.show_if = ""; }
            if (this.occupies_space_if_hidden == null) { this.occupies_space_if_hidden = false; }

            if (this.form_action == null) { this.form_action = ""; }
            if (this.form_method == null) { this.form_method = ""; }
            if (this.form_encoding == null) { this.form_encoding = ""; }
        }

        getDefaultColor() { return '#D8D8D8'; }

        specialSidebarControls() { return [
            ['Repeats', 'is_repeat', (label, valueLink) => {
                let rootComponentSpec;
                if (((rootComponentSpec = __guard__(this.getRootComponent(), x => x.componentSpec)) == null)) { return CheckboxControl(label, valueLink); }

                const [base_name, prop_control] = Array.from(['list', new ListPropControl()]);
                const variableCreatorValueLink = {
                    value: valueLink.value,
                    requestChange: nv => {
                        if ((nv === true) && _l.isEmpty(this.repeat_variable)) {
                            const new_prop_name = find_unused(_l.map(rootComponentSpec.propControl.attrTypes, 'name'), function(i) {
                                if (i === 0) { return base_name; } else {  return `${base_name}${i+1}`; }
                            });
                            rootComponentSpec.addSpec(new PropSpec({name: new_prop_name, control: prop_control}));

                            this.repeat_variable = (() => { switch ((this.doc != null ? this.doc.export_lang : undefined)) {
                                case 'JSX': case 'React': case 'CJSX': case 'TSX': return `this.props.${new_prop_name}`;
                                case 'Angular2':                    return `this.${new_prop_name}`;
                                default: return '';
                            } })();
                            this.instance_variable = 'elem';

                        } else if (nv === false) {
                            // Try to see if there was a PropSpec added by the above mechanism, if so delete it
                            // FIXME: this.props is React specific
                            // FIXME2: The whole heuristic of when to remove a Spec can be improved. One thing we should probably do is
                            // check that prop_name is unused in other things in the code sidebar. Not doing this right now because
                            // getting all possible code things that appear in the code sidebar is a mess today.
                            // ANGULAR TODO: will this always work?
                            if (this.repeat_variable.startsWith('this.props.')) {
                                const prop_name = this.repeat_variable.substr('this.props.'.length);
                                const added_spec =  _l.find(rootComponentSpec.propControl.attrTypes, spec => (spec.name === prop_name) && (spec.control.ValueType === prop_control.ValueType));

                                if ((prop_name.length > 0) && (added_spec != null)) {
                                    rootComponentSpec.removeSpec(added_spec);
                                    this.repeat_variable = '';
                                    this.instance_variable = '';
                                }
                            }
                        }

                        return valueLink.requestChange(nv);
                    }
                };

                return CheckboxControl(label, variableCreatorValueLink);
            }
            ],
            config.horizontal_repeat && this.is_repeat ? ["Direction", 'repeat_direction', SelectControl(
                {multi: false, style: 'segmented'},
                [['Vertical', 'vertical'], ['Horizontal', 'horizontal']]
            )] : undefined,
            this.is_repeat ? ["Space between", 'space_between', NumberControl] : undefined,

            ['Optional', 'is_optional', (label, valueLink) => {
                let rootComponentSpec;
                if (((rootComponentSpec = __guard__(this.getRootComponent(), x => x.componentSpec)) == null)) { return CheckboxControl(label, valueLink); }

                const [base_name, prop_control] = Array.from(['show', new CheckboxPropControl()]);
                const variableCreatorValueLink = {
                    value: valueLink.value,
                    requestChange: nv => {
                        if ((nv === true) && _l.isEmpty(this.show_if)) {
                            const new_prop_name = find_unused(_l.map(rootComponentSpec.propControl.attrTypes, 'name'), function(i) {
                                if (i === 0) { return base_name; } else {  return `${base_name}${i+1}`; }
                            });
                            rootComponentSpec.addSpec(new PropSpec({name: new_prop_name, control: prop_control}));

                            this.show_if = (() => { switch ((this.doc != null ? this.doc.export_lang : undefined)) {
                                case 'JSX': case 'React': case 'CJSX': case 'TSX': return `this.props.${new_prop_name}`;
                                case 'Angular2': return `this.${new_prop_name}`;
                                default: return '';
                            } })();

                        } else if (nv === false) {
                            // Try to see if there was a PropSpec added by the above mechanism, if so delete it
                            // FIXME: this.props is React specific
                            // FIXME2: The whole heuristic of when to remove a Spec can be improved. One thing we should probably do is
                            // check that prop_name is unused in other things in the code sidebar. Not doing this right now because
                            // getting all possible code things that appear in the code sidebar is a mess today.
                            // ANGULAR TODO: Does this always work?
                            if (this.show_if.startsWith('this.props.')) {
                                const prop_name = this.show_if.substr('this.props.'.length);
                                const added_spec =  _l.find(rootComponentSpec.propControl.attrTypes, spec => (spec.name === prop_name) && (spec.control.ValueType === prop_control.ValueType));

                                if ((prop_name.length > 0) && (added_spec != null)) {
                                    rootComponentSpec.removeSpec(added_spec);
                                    this.show_if = '';
                                }
                            }
                        }

                        return valueLink.requestChange(nv);
                    }
                };

                return CheckboxControl(label, variableCreatorValueLink);
            }

            ],
            this.is_optional ? ['Occupies space if hidden', 'occupies_space_if_hidden', CheckboxControl] : undefined,

            React.createElement("hr", null),

            ...Array.from(this.fillSidebarControls())
        ]; }

        constraintControls(linkAttr, onChange) { return _l.concat(super.constraintControls(linkAttr, onChange), [
            ["Scroll independently", 'is_scroll_layer', CheckboxControl],
            ["Is full window height", 'is_screenfull', CheckboxControl]
        ]); }

        specialCodeSidebarControls(onChange) { return _l.compact(_l.flatten([
            this.is_repeat ? _l.compact([
                ["List", propLink(this, 'repeat_variable', onChange), ''],
                ["Iterator var", propLink(this, 'instance_variable', onChange), ''],
                ['JSX', 'React', 'CJSX', 'TSX'].includes(this.doc.export_lang) ? ["Iterator React key",  propLink(this, 'repeat_element_react_key_expr', onChange), ''] : undefined
            ]) : undefined,

            this.is_optional ? [
                ["Show if", propLink(this, 'show_if', onChange), '']
            ] : undefined
        ])); }

        renderHTML(pdom, param) {
            if (param == null) { param = {}; }
            const {for_editor, for_component_instance_editor} = param;
            super.renderHTML(...arguments);

            if (this.is_screenfull && !for_editor) {
                pdom.minHeight = '100vh';
            }

            if (this.is_form && !for_editor) {
                pdom.tag = "form";
                pdom.actionAttr = this.form_action;
                pdom.methodAttr = __guard__(this.form_method != null ? this.form_method.trim() : undefined, x => x.toUpperCase());
                if (_l.isEmpty(pdom.methodAttr)) { pdom.methodAttr = 'POST'; }
                pdom.enctypeAttr = this.form_encoding;
            }

            if (this.is_repeat && ((!for_editor) || for_component_instance_editor)) {
                /*
                 * This block is repeated
                 * Strategy: turn this node into a wrapper that will give the geometry
                 * for the list.  Make the actual node to be repeated a child.
                 * If the original pdom is
                 * <x margin-left="4" foo="bar"><y /></x>
                 * replace it with
                 *   <div margin-left="4">
                 *     <repeater>
                 *       <x foo="bar"><y /></x>
                 *     </repeater>
                 *   </div>
                 * To preserve the geometry, we're going put in the wrapper:
                 * - width
                 * - marginTop
                 * - marginLeft
                 * We're not including any of the height ones because they should be the right height
                 * of an individual list element.
                 * This is very ad-hoc and frankly scary.  We need a better solution; this is quite
                 * likely to break.
                 */
                const flex_direction = {
                    vertical: 'column',
                    horizontal: 'row'
                };

                const margin_before = {
                    vertical: 'marginTop',
                    horizontal: 'marginLeft'
                };

                wrapPdom(pdom, {
                    tag: 'repeater',
                    repeat_variable: this.repeat_variable,
                    instance_variable: this.instance_variable
                });

                if (this.space_between != null) { pdom.children[0][margin_before[this.repeat_direction]] = this.space_between; }

                // FIXME React specific 'key' prop.
                // Ignored in pdomToReact which sets its own keys
                if (['JSX', 'React', 'CJSX', 'TSX'].includes(this.doc.export_lang)) { pdom.children[0].keyAttr = Dynamicable.code(this.repeat_element_react_key_expr); }

                // Wrap the repeat pdom with a column flex parent to make sure the list is vertical
                wrapPdom(pdom, {
                    tag: 'div',
                    display: 'flex',
                    flexDirection: flex_direction[this.repeat_direction]
                });

                if (this.space_between != null) { pdom[margin_before[this.repeat_direction]] = -this.space_between; }
            }

            if (this.is_optional && ((!for_editor) || for_component_instance_editor)) {
                wrapPdom(pdom, {tag: 'showIf', show_if: this.show_if});
                if (this.occupies_space_if_hidden) { return wrapPdom(pdom, {tag: 'div', width: this.width, height: this.height}); }
            }
        }
    };
    LayoutBlock.initClass();
    return LayoutBlock;
})())
);

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}