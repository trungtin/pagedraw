/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TextInputBlock;
import _l from 'lodash';
import React from 'react';
import Block from '../block';
import { Dynamicable } from '../dynamicable';

import {
    BooleanSelectControl,
    CheckboxControl,
    ColorControl,
    CustomSliderControl,
    FontControl,
    FontWeightControl,
    NumberControl,
    SelectControl,
    TextControl,
    TextShadowsControl,
    TextStyleVariantControlGroup,
    labeledControl,
    propControlTransformer,
} from '../editor/sidebar-controls';

import { Glyphicon } from '../editor/component-lib';
import { TextShadowType } from './text-block';
import { Font, fontsByName } from '../fonts';

export default Block.register('text-input', (TextInputBlock = (function() {
    TextInputBlock = class TextInputBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Text Input';
            this.prototype.properties = {
                placeholder: Dynamicable(String),
                value: Dynamicable(String),
                defaultValue: Dynamicable(String),
                ref: String,
                isPasswordInput: Boolean,
    
                //# Text Block properties
                // TODO: Add Placeholder color which isn't trivial because it requires using
                // a different modern CSS selector which depends on the browser
                fontColor: Dynamicable(String),
                fontSize: Dynamicable(Number),
                fontFamily: Font,
                textShadows: [TextShadowType],
                kerning: Dynamicable(Number),
    
                isBold: Boolean,
                isItalics: Boolean,
                isUnderline: Boolean,
                isStrikethrough: Boolean,
    
                textAlign: String,
    
                hasCustomFontWeight: Boolean,
                fontWeight: Dynamicable(String),
    
                //# Text input layout properties, because text inputs implicitly have a border
                // around them.  Note this probably shouldn't be how they work, but the amount
                // of work it would take to fix that is very not worth it right now, especially
                // because you can just turn the border off.
                hasCustomPadding: Boolean,
                paddingLeft: Dynamicable(Number),
                paddingRight: Dynamicable(Number),
                paddingTop: Dynamicable(Number),
                paddingBottom: Dynamicable(Number),
    
                disableFocusRing: Boolean,
    
                // background image
                image: Dynamicable(String),
    
                isMultiline: Boolean
            };
        }

        specialSidebarControls(linkAttr, onChange) { return [
            ["Value", 'value', TextControl],
            ["Default Value", 'defaultValue', TextControl],
            ["Placeholder", 'placeholder', TextControl],

            ["font", 'fontFamily', FontControl(this.doc, onChange)],

            // isUnderline and isStrikethrough are disabled because they're not supported on input[type=text]
            ...Array.from(TextStyleVariantControlGroup(this.fontFamily, linkAttr, [
                'isBold', 'isItalics', 'hasCustomFontWeight', 'fontWeight'
            ])),

            ["text color", "fontColor", ColorControl],
            ["font size", 'fontSize', NumberControl],
            ["kerning", 'kerning', CustomSliderControl({min: -20, max: 50})],
            ["text shadows", "textShadows", TextShadowsControl],

            ["align", "textAlign", SelectControl({multi: false, style: 'segmented'}, [
                [React.createElement(Glyphicon, {"glyph": "align-left"}), 'left'],
                [React.createElement(Glyphicon, {"glyph": "align-center"}), 'center'],
                [React.createElement(Glyphicon, {"glyph": "align-right"}), 'right'],
                [React.createElement(Glyphicon, {"glyph": "align-justify"}), 'justify']
            ])],

            ['Hide focus ring', 'disableFocusRing', CheckboxControl],

            !this.isMultiline ? ["Is password input", 'isPasswordInput', CheckboxControl] : undefined,
            ['multiline', 'isMultiline', CheckboxControl],

            ['Use custom padding', 'hasCustomPadding', CheckboxControl],
            this.hasCustomPadding ? ['padding left', 'paddingLeft', NumberControl] : undefined,
            this.hasCustomPadding ? ['padding right', 'paddingRight', NumberControl] : undefined,
            this.hasCustomPadding && this.isMultiline ? ['padding top', 'paddingTop', NumberControl] : undefined,
            this.hasCustomPadding && this.isMultiline ? ['padding bottom', 'paddingBottom', NumberControl] : undefined,

            React.createElement("hr", null),

            ...Array.from(this.fillSidebarControls())
        ]; }

        constructor(json) {
            {
              // Hack: trick Babel/TypeScript into allowing this before super.
              if (false) { super(); }
              let thisFn = (() => { return this; }).toString();
              let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
              eval(`${thisName} = this;`);
            }
            if (this.borderRadius == null) { this.borderRadius = 4; }
            if (this.borderThickness == null) { this.borderThickness = 1; }
            if (this.borderColor == null) { this.borderColor = '#cccccc'; }

            if (this.placeholder == null) { this.placeholder = Dynamicable(String).from("Placeholder"); }
            if (this.value == null) { this.value = Dynamicable(String).from(""); }
            if (this.defaultValue == null) { this.defaultValue = Dynamicable(String).from(""); }
            if (this.isPasswordInput == null) { this.isPasswordInput = false; }

            //# text block properties
            if (this.kerning == null) { this.kerning = Dynamicable(Number).from(0); }
            if (this.fontColor == null) { this.fontColor = Dynamicable(String).from('#000000'); }
            if (this.fontSize == null) { this.fontSize = Dynamicable(Number).from(14); }
            if (this.hasCustomFontWeight == null) { this.hasCustomFontWeight = false; }
            if (this.fontWeight == null) { this.fontWeight = Dynamicable(String).from('400'); }

            if (this.fontFamily == null) { this.fontFamily = fontsByName["Helvetica Neue"]; }
            if (this.textShadows == null) { this.textShadows = []; }
            if (this.textAlign == null) { this.textAlign = 'left'; }
            if (this.contentDeterminesWidth == null) { this.contentDeterminesWidth = false; }

            if (this.isBold == null) { this.isBold = false; }
            if (this.isItalics == null) { this.isItalics = false; }
            //# end text block properties

            if (this.disableFocusRing == null) { this.disableFocusRing = false; }
            if (this.image == null) { this.image = Dynamicable(String).from(''); }

            if (this.paddingLeft == null) { this.paddingLeft = Dynamicable(Number).from(0); }
            if (this.paddingRight == null) { this.paddingRight = Dynamicable(Number).from(0); }
            if (this.paddingTop == null) { this.paddingTop = Dynamicable(Number).from(0); }
            if (this.paddingBottom == null) { this.paddingBottom = Dynamicable(Number).from(0); }

            super(json);
        }

        getDefaultColor() { return '#FFFFFF'; }

        renderHTML(pdom, param) {
            let needle;
            if (param == null) { param = {}; }
            const {for_editor, for_component_instance_editor} = param;
            super.renderHTML(...arguments);

            _l.extend(pdom, {
                // font properties must always be explicitly given (never undefined) or core.percolate_inherited_css_properties
                // will break.
                fontFamily: this.fontFamily,
                color: this.fontColor,
                fontSize: this.fontSize,

                fontWeight: this.hasCustomFontWeight && (needle = this.fontWeight.staticValue, Array.from(this.fontFamily.get_font_variants()).includes(needle)) ? this.fontWeight : (this.isBold ? '700' : '400'),
                fontStyle: this.isItalics ? 'italic' : 'normal',

                textAlign: this.textAlign,
                letterSpacing: this.kerning,

                textShadow: [].concat(
                    this.textShadows.map(s => `${s.offsetX}px ${s.offsetY}px ${s.blurRadius}px ${s.color}`)
                ).join(', '),

                outline: this.disableFocusRing ? 'none' : undefined,

                lineHeight: 'normal',
                wordWrap: 'normal'
            });

            // FIXME: Layout vs Content bug. Right now if you manually shrink the height of this block and go to content mode,
            // it increases in size
            // FIXME for React, valueAttr needs to be named defaultValueAttr... or we need a way to set onChange
            if (this.hasCustomPadding) {
                _l.extend(pdom, {
                    paddingLeft: this.paddingLeft,
                    paddingRight: this.paddingRight
                });
                if (this.isMultiline) {
                    _l.extend(pdom, {
                        paddingBottom: this.paddingBottom,
                        paddingTop: this.paddingTop
                    });
                }
            } else {
                _l.extend(pdom, {
                    padding: '6px 12px'
                });
            }

            if (this.isMultiline && this.isPasswordInput) {
                // FIXME: We cannot do multiline password input
                _l.extend(pdom, {
                    tag: 'textarea',
                    placeholderAttr: this.placeholder,
                    valueAttr: this.value
                });
            } else if (this.isMultiline && !this.isPasswordInput) {
                _l.extend(pdom, {
                    tag: 'textarea',
                    placeholderAttr: this.placeholder,
                    valueAttr: this.value
                });
            } else if (!this.multiline && this.isPasswordInput) {
                _l.extend(pdom, {
                    tag: 'input',
                    typeAttr: 'password',
                    placeholderAttr: this.placeholder,
                    valueAttr: this.value
                });
            } else if (!this.isMultiline && !this.isPasswordInput) {
                _l.extend(pdom, {
                    tag: 'input',
                    typeAttr: 'text',
                    placeholderAttr: this.placeholder,
                    valueAttr: this.value
                });
            }

            if (!for_editor) { _l.extend(pdom, {
                // FIXME name/ref/valueLink is weird and not consistant with other input types
                nameAttr: this.ref
            }); }

            if (for_editor || for_component_instance_editor) { _l.extend(pdom, {
                readOnlyAttr: true
            }); }

            if (this.image.isDynamic || !_l.isEmpty(this.image.staticValue)) {
                _l.extend(pdom, {
                    backgroundImage: this.image.cssImgUrlified(),
                    'backgroundSize': 'cover',
                    'backgroundPositionX': '50%'
                }
                );
            }

            if (this.flexWidth) {
                const {wrapPdom} = require('../core');
                wrapPdom(pdom, {tag: 'div'});
                delete pdom.display;
                delete pdom.children[0].flexGrow;
                return pdom.children[0].width = '100%';
            }
        }
    };
    TextInputBlock.initClass();
    return TextInputBlock;
})())
);
