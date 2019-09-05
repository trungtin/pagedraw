// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let BooleanSelectControl, CheckboxControl, ColorControl, CustomSliderControl, FontControl, FontWeightControl, Glyphicon, labeledControl, NumberControl, propControlTransformer, SelectControl, TextBlock, TextControl, TextShadowsControl, TextStyleVariantControlGroup;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import Block from '../block';
import { Model } from '../model';
import LayoutBlock from './layout-block';
import { Dynamicable } from '../dynamicable';
import { Font, fontsByName, WebFont } from '../fonts';
import Tooltip from '../frontend/tooltip';
import config from '../config';

const PDStyleGuide = ({Glyphicon} = require('../editor/component-lib'));
import tinycolor from 'tinycolor2';

const SidebarControls = ({
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
    propControlTransformer
} = require('../editor/sidebar-controls'));
import { pdomDynamicableToPdomStatic } from '../core';

const TextShadowType = Model.Tuple('text-shadow',
    {color: String, offsetX: Number, offsetY: Number, blurRadius: Number, spreadRadius: Number}
);

Number.prototype.px = function() { return `${this}px`; };

export default Block.register('text', (TextBlock = (function() {
    TextBlock = class TextBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Text';
            this.keyCommand = 'T';
    
            this.prototype.properties = {
                //# FIXME: Right now Quill is adding linebreaks at the end of the textContent and we have to
                // explicitly remove those in renderHTML(). We should instead remove them at the source of the
                // problem which is when Quill populates @textContent. This requires a migration.
                textContent: Dynamicable(String),
    
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
    
                overflowEllipsis: Boolean,
                contentDeterminesWidth: Boolean,
    
                // see the note about subpixel widths in renderHTML
                computedSubpixelContentWidth: Number, // :: Number | Null
    
                hasCustomFontWeight: Boolean,
                fontWeight: Dynamicable(String),
    
                legacyLineHeightBehavior: Boolean,
                hasCustomLineHeight: Boolean,
                lineHeight: Number
            };
    
            // because we `module.exports=`-ed TextBlock, this is the only convenient way to export TextShadowType
            this.TextShadowType = TextShadowType; // ensure nothing dynamicable is left
    
            this.property('resizableEdges',
                {get() { if (this.contentDeterminesWidth) { return []; } else { return ['left', 'right']; } }});
        }

        constructor() {
            super(...arguments);
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

            // FIXME: The following two are mutually exclusive. Right now isUnderline takes precedence
            if (this.isUnderline == null) { this.isUnderline = false; }
            if (this.isStrikethrough == null) { this.isStrikethrough = false; }

            // Default Quill value for empty content
            if (this.textContent == null) { this.textContent = Dynamicable(String).from(""); }

            if (this.legacyLineHeightBehavior == null) { this.legacyLineHeightBehavior = false; }
            if (this.lineHeight == null) { this.lineHeight = 16; }
            if (this.hasCustomLineHeight == null) { this.hasCustomLineHeight = false; }
        }

        fontHasWeightVariants() { return !_l.isEmpty(this.fontFamily.get_font_variants()); }

        specialSidebarControls(linkAttr, onChange) {
            return [
                React.createElement("div", {"style": ({display: 'flex', flexDirection: 'row', alignItems: 'stretch'})},
                    React.createElement("div", {"style": ({flex: 1, marginRight: 8})},
                        React.createElement(SidebarControls.PDFontControl, { 
                            "valueLink": (linkAttr('fontFamily')),  
                            "doc": (this.doc),  
                            "onChange": (onChange)
                        })
                    ),

                    React.createElement(SidebarControls.PDColorControl, { 
                        "valueLink": (SidebarControls.staticValueLinkTransformer(linkAttr('fontColor'))),  
                        "color_well_style": ({height: ""})
                    })
                ),


                ...Array.from(((() => {
                    const fontHasWeightVariants = !_l.isEmpty(this.fontFamily.get_font_variants());
                    const hasCustomFontWeight = fontHasWeightVariants && (linkAttr('hasCustomFontWeight').value === true);

                    return [
                        React.createElement("div", {"className": "ctrl-wrapper"},
                            React.createElement("h5", {"className": "sidebar-ctrl-label"}, "style"),
                            React.createElement("div", {"className": "ctrl"},
                                React.createElement(PDStyleGuide.PdButtonGroup, {"buttons": ([
                                        [React.createElement("i", null, "I"), 'isItalics'],
                                        [React.createElement("u", null, "U"), 'isUnderline'],
                                        [React.createElement("s", null, "S"), 'isStrikethrough']
                                    ].map((...args) => {
                                        const [label, attr] = Array.from(args[0]), i = args[1];
                                        const vlink = linkAttr(attr);
                                        return {
                                            type: vlink.value ? 'primary' : 'default',
                                            label,
                                            onClick(e) { vlink.requestChange(!vlink.value); e.preventDefault(); return e.stopPropagation(); }
                                        };
                                })
                                )})
                            )
                        ),

                        fontHasWeightVariants ? ["use custom font weight", 'hasCustomFontWeight', CheckboxControl] : undefined,
                        hasCustomFontWeight ? ["font weight", 'fontWeight', FontWeightControl(this.fontFamily)] : undefined
                    ];
                }
                )())),

                React.createElement("div", {"style": ({
                    display: 'flex',
                    justifyContent: 'stretch',
                    width: '100%'
                })},
                    React.createElement(SidebarControls.LabelBelowControl, { 
                        "label": "Size",  
                        "vl": (SidebarControls.NumberToStringTransformer(SidebarControls.staticValueLinkTransformer(linkAttr('fontSize')))),  
                        "ctrlProps": ({type: 'number', className: 'underlined-number-input'})
                    }),
                    React.createElement("div", {"style": ({width: 16})}),
                    (React.createElement(SidebarControls.LabelBelowControl, {
                        label: React.createElement("span", {"style": ({color: !this.hasCustomLineHeight ? '#555' : ""})}, "Line"),
                        vl: SidebarControls.NumberToStringTransformer(linkAttr('lineHeight')),
                        ctrlProps: {type: 'number', className: 'underlined-number-input', disabled: !this.hasCustomLineHeight, style:
                            !this.hasCustomLineHeight ? {
                                // disabled
                                backgroundColor: 'rgb(236, 236, 236)',
                                borderRadius: 3,
                                color: '#0000005c'
                            } : {
                                // not disabled
                            }
                        }
                    })),
                    React.createElement("div", {"style": ({width: 16})}),
                    React.createElement(SidebarControls.LabelBelowControl, { 
                        "label": "Kerning",  
                        "vl": (SidebarControls.NumberToStringTransformer(SidebarControls.staticValueLinkTransformer(linkAttr('kerning')))),  
                        "ctrlProps": ({type: 'number', className: 'underlined-number-input'})
                    })
                ),
                ["use custom line height", 'hasCustomLineHeight', CheckboxControl],

                React.createElement("hr", null),
                ["text shadows", "textShadows", TextShadowsControl],

                React.createElement("hr", null),

                // this is all just so we can get a dynamicable around content
                ["Content", "textContent", labeledControl((() => {
                    return React.createElement("div", {"style": ({height: 24, display: 'flex', alignItems: 'center'})},
                        React.createElement(Tooltip, {"content": "Double click text block on canvas to edit content"},
                            React.createElement("div", {"style": ({whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: 14, fontFamily: this.fontFamily.get_css_string()})},
                                (this.textContent.staticValue)
                            )
                        )
                    );
                })
                )]
            ];
        }

        // FIXME: Disable or remove flexWidth if in auto, flex height in text doesnt make sense and whatnot
        constraintControls(linkAttr, onChange) { return _l.concat(super.constraintControls(linkAttr, onChange), [
                ["align", "textAlign", SelectControl({multi: false, style: 'segmented'}, [
                    [React.createElement(Glyphicon, {"glyph": "align-left"}), 'left'],
                    [React.createElement(Glyphicon, {"glyph": "align-center"}), 'center'],
                    [React.createElement(Glyphicon, {"glyph": "align-right"}), 'right'],
                    [React.createElement(Glyphicon, {"glyph": "align-justify"}), 'justify']
                ])],

                // For text block's textContent we have to add a dynamic checkbox
                // explicitly since there is no control for textContent in the sidebar
                ["width", "contentDeterminesWidth", BooleanSelectControl('Auto', 'Fixed')],

                !this.contentDeterminesWidth ? ["cut off long text with `...`", 'overflowEllipsis', CheckboxControl] : undefined
        ]); }

        // Text blocks shouldn't have these
        boxStylingSidebarControls() { return []; }

        renderHTML(dom, param) {
            let needle;
            if (param == null) { param = {}; }
            const {for_editor, for_component_instance_editor} = param;
            super.renderHTML(...arguments);

            const content = this.textContent.mapStatic(function(staticContent) {
                // FIXME: Right now Quill is adding linebreaks at the end that we have to explicitly remove. We should compensate
                // for these in TextBlockEditor, but since there are already TextBlocks with the newlines, this requires a migration.
                const text_content = staticContent.endsWith('\n') ? staticContent.slice(0, -1) : staticContent;

                // make sure even blank text content is at least 1 line tall.  Unicode 160 corresponds to the &nbsp; char.
                if (_l.isEmpty(text_content)) { return String.fromCharCode(160); } else { return text_content; }
            });

            const text_properties = {
                // font properties must always be explicitly given (never undefined) or core.percolate_inherited_css_properties
                // will break.
                'fontFamily': this.fontFamily,
                'color': this.fontColor,
                'fontSize': this.fontSize,

                // We need to explicitly give lineHeight units, or in the editor,
                // React will, in a special case, treat it as a unitless multiple,
                // while we compile it with "px"
                'lineHeight': this.hasCustomLineHeight ? (this.lineHeight != null ? this.lineHeight.px() : undefined) : this.legacyLineHeightBehavior ? 'normal' : Math.round(1.14 * this.fontSize.staticValue).px(),
                'letterSpacing': this.kerning.mapStatic(staticVal => staticVal != null ? staticVal : 'normal'),

                'fontWeight': this.hasCustomFontWeight && (needle = this.fontWeight.staticValue, Array.from(this.fontFamily.get_font_variants()).includes(needle)) ? this.fontWeight : (this.isBold ? '700' : '400'),
                'fontStyle': this.isItalics ? 'italic' : 'normal',
                'textDecoration': this.isUnderline ? 'underline' : this.isStrikethrough ? 'line-through' : 'none',

                'textAlign': this.textAlign,

                textShadow: [].concat(
                    this.textShadows.map(s => `${s.offsetX}px ${s.offsetY}px ${s.blurRadius}px ${s.color}`)
                ).join(', '),

                // wrap word across multiple lines if it's too long to fit on one
                'wordWrap': 'break-word'
            };

            const extra_properties = _l.fromPairs(_l.flatten(_l.compact([
                this.overflowEllipsis && !this.contentDeterminesWidth ? [
                    ['overflow', 'hidden'],
                    ['textOverflow', 'ellipsis'],
                    ['whiteSpace', 'nowrap']
                ] : undefined,

                for_editor && !for_component_instance_editor && _l.isEmpty(content.staticValue.trim()) ? [
                    ['outline', '1px dashed grey']
                ] : undefined,

                this.contentDeterminesWidth && for_editor && !for_component_instance_editor ? [
                    ['width', 'max-content']
                ] : undefined,

                !for_editor || (!!for_component_instance_editor) ? _l.compact([
                    this.contentDeterminesWidth && (this.computedSubpixelContentWidth != null) ? ['paddingRight', this.width - this.computedSubpixelContentWidth] : undefined
                ]) : undefined
            ])));

            // Core gives all elements with no children fixed height/width, but
            // text blocks' content determines the height of the block
            delete dom.height;
            if (this.contentDeterminesWidth) { for (let prop of ['width', 'minWidth']) { delete dom[prop]; } }

            return _l.extend(dom, text_properties, extra_properties, {textContent: content});
        }

        pdomForGeometryGetter(instanceEditorCompilerOptions) {
            // Quill has a behavior where if there's no textContent, Quill will put "<div><br/></div>" there.
            // This is necessary for there to be a min hieght of one line on the text block.
            // Without Quill's 1-line minimum, we get content vs layout issues, and irrecoverably 0-height TextBlocks.

            const pdom = this.toPdom(instanceEditorCompilerOptions);

            if (this.contentDeterminesWidth) {
                pdom.width = "max-content";
                delete pdom.paddingRight;
            } else {
                pdom.width = this.width; // have to set explicit width since renderHTML doesn't do that for us
            }
            return pdomDynamicableToPdomStatic(pdom);
        }

        chooseContrastingColor() {
            if (!(this.parent instanceof LayoutBlock)) { return; } // since we can't trust other blocks have colors
            const color = tinycolor(this.parent.color.staticValue).toHex();

            const [r, g, b] = Array.from([0, 2, 4].map(num => parseInt(color.slice(num, num + 2), 16)));
            return this.fontColor = this.fontColor.freshRepresentationWith(_l.fromPairs([['staticValue', (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186 ? '#000000' : '#FFFFFF')]]));
        }

        wasDrawnOntoDoc() { return this.chooseContrastingColor(); }

        editContentMode(double_click_location) {
            const { TypingMode } = require('../interactions/layout-editor');
            return new TypingMode(this, {mouse: double_click_location});
        }
    };
    TextBlock.initClass();
    return TextBlock;
})())
);
