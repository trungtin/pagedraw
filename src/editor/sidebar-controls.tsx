// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let BooleanSelectControl, BoxShadowsControl, CheckboxControl, ColorControl, CursorControl, CustomSliderControl, dotVlt, DynamicableControl, FontControl, FontWeightControl, ImageControl, LabelBelowControl, labeledControl, LabeledControl, LeftCheckboxControl, ListControl, listValueLinkTransformer, Model, NumberControl, NumberToStringTransformer, ObjectSelectControl, PdButtonGroup, PDColorControl, PdDropdown, PdDropdownTwo, PDFontControl, PdSearchableDropdown, PdSidebarButton, PDTextControlWithConfirmation, propControlTransformer, propValueLinkTransformer, SelectControl, ShadowsControl, staticValueLinkTransformer, TextControl, TextShadowsControl, TextStyleVariantControlGroup, transformControl, valueLinkTransformer;
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import config from '../config';
import { Glyphicon } from '../editor/component-lib';
import { ChromePicker } from 'react-color';
import tinycolor from 'tinycolor2';
const PDStyleGuide = ({PdSearchableDropdown, PdSidebarButton, PdDropdown, PdDropdownTwo, PdButtonGroup} = require('./component-lib'));

import ListComponent from '../frontend/list-component';
import { Font, fontsByName, allFonts, GoogleWebFont } from '../fonts';
import { allCursors } from '../cursors';
import ToggleIcon from '../frontend/toggle-icon';
import { handleAddCustomFonts } from '../frontend/custom-font-modal';
import { filePathTextStyle } from './code-styles';
import Tooltip from '../frontend/tooltip';
import fuzzysearch from 'fuzzysearch';
import FormControl from '../frontend/form-control';
import ColorPickerDebounced from '../frontend/react-input-color';
import { Popover } from '../frontend/popover';

const model = ({Model} = require('../model'));


const defaultExport = {};


//# Control utilities
defaultExport.valueLinkTransformer = (valueLinkTransformer = ({forwards, backwards}) => valueLink => ({
    value: forwards(valueLink.value),
    requestChange(newVal_t) { return valueLink.requestChange(backwards(newVal_t)); }
}));

defaultExport.NumberToStringTransformer = (NumberToStringTransformer = valueLinkTransformer({
    forwards(num) { let left;
    return (left = (num != null ? num.toString() : undefined)) != null ? left : "0"; },
    backwards: Number
}));

// control A :: (label, valueLink A) -> React element
// transformControl :: (valueLinkTransformer A, B) -> (control A) -> (control B)
defaultExport.transformControl = (transformControl = _l.curry((valueLinkTransformer, control) => (label, valueLink) => control(label, valueLinkTransformer(valueLink))));

// propValueLinkTransformer :: (prop :: String) -> (valueLink A) -> (valueLink A[prop])
defaultExport.propValueLinkTransformer = (propValueLinkTransformer = _l.curry((prop, valueLink) => ({
    value: valueLink.value[prop],

    requestChange(new_val) {
        return valueLink.requestChange(valueLink.value.freshRepresentationWith(_l.fromPairs([[prop, new_val]])));
    }
})));

// dotVlt :: (valueLink A) -> (members :: [String] | String) -> (valueLink A[member1][member2]...)
defaultExport.dotVlt = (dotVlt = function(valueLink, members) {
    if (_l.isString(members)) { return propValueLinkTransformer(members, valueLink); }
    if (members.length === 0) { return valueLink; }
    return dotVlt(propValueLinkTransformer(_l.head(members), valueLink), _l.tail(members));
});

defaultExport.listValueLinkTransformer = (listValueLinkTransformer = _l.curry((i, valueLink) => ({
    value: valueLink.value[i],

    requestChange(new_val) {
        const new_list = _l.clone(valueLink.value);
        new_list[i] = new_val;
        return valueLink.requestChange(new_list);
    }
})));

// propControlTransformer :: (prop :: String) -> (control A) -> (control A[prop])
defaultExport.propControlTransformer = (propControlTransformer = _l.curry((prop, control) => transformControl(propValueLinkTransformer(prop), control)));


defaultExport.LabeledControl = (LabeledControl = createReactClass({
    displayName: 'LabeledControl',
    render() {
        return React.createElement("div", {"className": "ctrl-wrapper"},
            React.createElement("h5", {"className": "sidebar-ctrl-label"}, (this.props.label)),
            React.createElement("div", {"className": "ctrl"}, (this.props.control(this.props.valueLink)))
        );
    }
}));

defaultExport.labeledControl = (labeledControl = control => (label, valueLink) => React.createElement(LabeledControl, {"control": (control), "label": (label), "valueLink": (valueLink)}));

// DynamicableControl :: (control A) -> (control (A.staticValue, A.isDynamic))
defaultExport.DynamicableControl = (DynamicableControl = control => (function(label, valueLink) {
    const dynamicValueLink = propValueLinkTransformer('isDynamic', valueLink);
    const is_dynamic = dynamicValueLink.value;

    const tooltip_content =
        React.createElement("span", {"style": ({
            padding: '0.5em',
            fontSize: '16px'
        })},
            (is_dynamic ? "Make static" : "Control with code")
        );

    const clickable_label =
        React.createElement(Tooltip, {"position": "right", "content": (tooltip_content)},
            React.createElement("span", {"className": "dynamicable-control-label", "style": ({cursor: 'pointer'}), "onClick": (() => {
                return dynamicValueLink.requestChange(!dynamicValueLink.value);
            }
            )},
                React.createElement("span", {"style": (
                    is_dynamic ? {
                        color: '#e27fe2',
                        fontWeight: 'bold',
                        letterSpacing: '-0.5px'
                    } : {

                    }
                )},
                    (label)
                ),
                (" "),
                React.createElement("i", { 
                    "className": (`material-icons md-14 dynamicable-icon-${is_dynamic ? 'on' : 'off'}`),  
                    "children": "code",  
                    "style": ({
                        fontSize: '14px',
                        verticalAlign: '-3.2px'
                    })
                })
            )
        );

    return control(clickable_label, staticValueLinkTransformer(valueLink));
}));

defaultExport.staticValueLinkTransformer = (staticValueLinkTransformer = valueLink => propValueLinkTransformer('staticValue', valueLink));


//# Controls
defaultExport.TextControlWithDefault = dfault => labeledControl(valueLink => React.createElement(FormControl, {"type": "text", "placeholder": (dfault), "valueLink": (valueLink)}));

defaultExport.DebouncedTextControlWithDefault = dfault => labeledControl(valueLink => React.createElement(FormControl, {"debounced": (true), "type": "text", "placeholder": (dfault), "valueLink": (valueLink)}));

defaultExport.DebouncedTextControl = labeledControl(valueLink => React.createElement(FormControl, {"debounced": (true), "type": "text", "valueLink": (valueLink)}));

defaultExport.TextControl = (TextControl = labeledControl(valueLink => React.createElement(FormControl, {"type": "text", "valueLink": (valueLink)})));

defaultExport.PDTextControlWithConfirmation = (PDTextControlWithConfirmation = createReactClass({
    linkState(attr) {
        return {
            value: this.state[attr],
            requestChange: nv => {
                return this.setState({[attr]: nv});
            }
        };
    },

    getInitialState() {
        return {
            tmpValue: this.props.valueLink.value,
            editing: false
        };
    },

    render() {
        let textStyle = {display: 'flex', justifyContent: 'space-between'};
        if (this.props.showEditButton != null) { textStyle = _l.extend(textStyle, {cursor: "pointer"}); }

        return React.createElement("div", null,
            ( this.state.editing ?
                React.createElement("div", {"style": ({display: 'flex', width: "100%", justifyContent: 'space-between', position: 'relative', zIndex: 11})},
                    React.createElement("form", {"style": ({width: '100%'}), "onSubmit": (e => {
                        // this form is here so we pick up an 'enter' in the text field
                        this.handleSubmit();
                        return e.preventDefault();
                    }
                    )},
                        React.createElement(FormControl, {"type": "text", "valueLink": (this.linkState('tmpValue')),  
                            "style": (
                                _l.extend({
                                    width: '100%', wordBreak: 'break-all',
                                    fontFamily: 'monospace'
                                }, this.props.style)
                            ),  
                            "autoFocus": true,  
                            "onBlur": (this.handleSubmit)})
                    )
                )
            :
                React.createElement("div", {"onClick": (this.startEditing), "style": (textStyle)},
                    React.createElement("div", {"style": (
                        _l.extend({
                            width: '100%', wordBreak: 'break-all', marginRight: 8,
                            fontFamily: 'monospace'
                        }, this.props.style)
                    )},
                        (this.props.valueLink.value)
                    ),
                    (this.props.showEditButton ? React.createElement("div", null, "Edit") : undefined)
                )
            )
        );
    },

    componentWillUnmount() {
        return this.handleSubmit();
    },

    startEditing() {
        return this.setState({editing: true, tmpValue: this.props.valueLink.value});
    },

    handleSubmit() {
        if (this.state.editing !== true) { return; }
        this.props.valueLink.requestChange(this.state.tmpValue);
        return this.setState({editing: false});
    }
}));

defaultExport.TextControlWithConfirmation = labeledControl(valueLink => React.createElement(PDTextControlWithConfirmation, {"valueLink": (valueLink), "showEditButton": (true)}));

defaultExport.FilePathControl = labeledControl(valueLink => React.createElement(PDTextControlWithConfirmation, {"valueLink": (valueLink), "showEditButton": (true), "style": (filePathTextStyle)}));

defaultExport.DebouncedTextAreaControlWithPlaceholder = function(placeholder, options) { if (options == null) { options = {}; } return function(label, valueLink) {
    const textarea = React.createElement(FormControl, {"debounced": (true), "tag": "textarea", "valueLink": (valueLink), "placeholder": (placeholder), "style": ({width: '100%', height: options.height != null ? options.height : '20em'})});
    if (_l.isEmpty(label)) { return textarea; }
    return React.createElement("div", null,
        React.createElement("div", {"className": "ctrl-wrapper", "style": ({alignItems: 'baseline'})},
            React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label))
        ),
        (textarea)
    );
}; };

defaultExport.NumberControl = (NumberControl = (label, valueLink) => React.createElement("div", {"className": 'ctrl-wrapper', "style": ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: '1'
})},
    React.createElement("h5", {"className": "sidebar-ctrl-label", "style": ({flexGrow: 1})}, (label)),
    React.createElement(FormControl, {"valueLink": (NumberToStringTransformer(valueLink)),  
        "type": "number",  
        "className": "underlined-number-input"})
));


defaultExport.CustomSliderControl = (CustomSliderControl = ({min, max}) => (label, valueLink) => React.createElement("div", {"className": "ctrl-wrapper", "style": ({flexDirection: 'column', alignItems: 'normal'})},
    React.createElement("div", {"style": ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        flex: '1'
    })},
        React.createElement("h5", {"className": "sidebar-ctrl-label", "style": ({flexGrow: 1})}, (label)),
        React.createElement(FormControl, {"valueLink": (NumberToStringTransformer(valueLink)),  
            "type": "number",  
            "className": "underlined-number-input"})
    ),
    React.createElement("div", null,
        React.createElement(FormControl, {"type": "range", "min": (min), "max": (max), "valueLink": (NumberToStringTransformer(valueLink))})
    )
));

defaultExport.SliderControl = CustomSliderControl({min: 0, max: 100});

defaultExport.CheckboxControl = (CheckboxControl = (label, valueLink) => React.createElement("div", {"className": "ctrl-wrapper", "style": ({alignItems: 'center'})},
  React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label)),
  React.createElement(FormControl, {"type": "checkbox", "valueLink": (valueLink), "label": (label)})
));

defaultExport.LeftCheckboxControl = (LeftCheckboxControl = (label, valueLink) => React.createElement("label", {"style": ({fontSize: '12px', fontWeight: 'normal', display: 'flex', alignItems: 'center', flex: '1'})},
  React.createElement(FormControl, {"style": ({margin: '0'}), "type": "checkbox", "valueLink": (valueLink), "label": (label)}), `\
   \
`, React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label))
));

defaultExport.PDFontControl = (PDFontControl = createReactClass({
    render() {
        let left;
        return React.createElement(PdSearchableDropdown, { 
            "text": ((left = (this.props.valueLink.value != null ? this.props.valueLink.value.get_user_visible_name() : undefined)) != null ? left : 'None'),  
            "options": (_l.flatten([
                this.props.doc.fonts.map(font => ({
                    text: font.get_user_visible_name(),
                    style: {fontFamily: font.get_css_string()},
                    matches: query => fuzzysearch(query.toLowerCase(), font.get_user_visible_name().toLowerCase()),
                    onSelect: () => this.props.valueLink.requestChange(font)
                })),
                [{
                    text: "Add more fonts",
                    matches: query => true,
                    onSelect: () => handleAddCustomFonts(this.props.doc, this.props.onChange)
                }]
            ]))});
    },

    componentDidMount() { return this.updateRenderedFonts(); },
    componentDidUpdate() { return this.updateRenderedFonts(); },
    updateRenderedFonts() {
        return this.renderedFonts = model.fresh_representation([Font], this.props.doc.fonts);
    },

    shouldComponentUpdate(nextProps) {
        return (nextProps.valueLink.value !== this.props.valueLink.value) || !model.isEqual(this.props.doc.fonts, this.renderedFonts);
    }
}));


defaultExport.FontControl = (FontControl = (doc, onChange) => labeledControl(valueLink => React.createElement(PDFontControl, {"valueLink": (valueLink), "doc": (doc), "onChange": (onChange)})));


const StringToTinycolorTransformer = valueLinkTransformer({
    forwards(str) { return tinycolor(str != null ? str : 'rgba(0,0,255,1)').toRgb(); },
    backwards(color) { return tinycolor(color.rgb).toRgbString(); }
});

defaultExport.PDColorControl = (PDColorControl = createReactClass({
    render() {
        // NOTE I would inline color_well and picker into <Popover />, but there's a bug
        // in coffee-react that incorrectly parses that syntax
        const color_value_link = StringToTinycolorTransformer(this.props.valueLink);

        const color_well =
            React.createElement("div", {"style": (_l.extend({}, {
                    padding: '5px',
                    background: '#fff',
                    borderRadius: '1px',
                    boxShadow: '0 0 0 1px rgba(0,0,0,.4)',
                    display: 'inline-flex',
                    cursor: 'pointer',
                    lineHeight: 0,
                    width: 46,
                    height: 24
                }, this.props.color_well_style))},
                React.createElement("div", {"style": ({
                    flex: 1,
                    borderRadius: '2px',
                    background: this.props.valueLink.value
                })})
            );

        const popover = () => React.createElement(ChromePicker, {"color": (color_value_link.value),  
                      "onChange"(c) { return color_value_link.requestChange(c); }});

        return React.createElement(Popover, {"trigger": (color_well), "popover": (popover), "popover_position_for_trigger_rect"(trigger_rect) { return {
            top: trigger_rect.bottom,
            right: document.documentElement.clientWidth - trigger_rect.right
        }; }});
    }
}));

const ColorControlCaseSandberg = (label, valueLink) => React.createElement("div", {"className": "ctrl-wrapper", "style": ({alignItems: 'flex-start'})},
    React.createElement("h5", {"className": "sidebar-ctrl-label", "style": ({paddingTop: 7})}, (label)),
    React.createElement(PDColorControl, {"valueLink": (valueLink)})
);


const ColorControlUndebounced = labeledControl(valueLink => React.createElement(FormControl, {"type": "color", "valueLink": (valueLink)}));

const ColorControlDebounced = labeledControl(valueLink => React.createElement(ColorPickerDebounced, {"valueLink": (valueLink)}));

defaultExport.ColorControl = (ColorControl = (() => { switch (config.colorPickerImplementation) {
    case 'CaseSandberg':
        return ColorControlCaseSandberg;
    case 'Native':
        return ColorControlUndebounced;
    case 'NativeDebounced':
        return ColorControlDebounced;
} })());


defaultExport.ImageControl = (ImageControl = labeledControl(valueLink => // FIXME: allow folks to change an image instead of having to recreate a block
// to choose a new image
React.createElement(
    "div",
    {"style": ({display: 'flex', justifyContent: 'flex-end'})},
    React.createElement(Glyphicon, {"glyph": "open-file"})
)));


defaultExport.SelectControl = (SelectControl = ({multi, style}, opts) => labeledControl(function(valueLink) {
    if (style === 'segmented') {
        return React.createElement(PdButtonGroup, {"buttons": (opts.map(function(...args) { const [label, value] = Array.from(args[0]), i = args[1]; return {
                type: valueLink.value === value ? 'primary' : 'default',
                onClick(e) { valueLink.requestChange(value); e.preventDefault(); return e.stopPropagation(); },
                label
            }; })
        )});
    } else if (style === 'dropdown') {
        return React.createElement(FormControl, {"tag": "select", "valueLink": (valueLink)},
        (
            opts.map(function(...args) {
                const [label, value] = Array.from(args[0]), i = args[1];
                return React.createElement("option", {"key": (i), "value": (value)}, (label));})
        )
        );
    } else {
        throw new Error("unknown SelectControl style");
    }
}));

defaultExport.ObjectSelectControl = (ObjectSelectControl = ({isEqual, getLabel, options}) => labeledControl(valueLink => React.createElement(FormControl, {"tag": "select", "valueLink": ({
    value: _l.findIndex(options, opt => isEqual(opt, valueLink.value)),
    requestChange(idx) { return valueLink.requestChange(options[idx]); }
})},
    ( options.map((opt, i) => React.createElement("option", {"key": (i), "value": (i)}, (getLabel(opt)))) )
)));


defaultExport.BooleanSelectControl = (BooleanSelectControl = (trueLabel, falseLabel) => SelectControl({style: 'segmented'}, [[trueLabel, true], [falseLabel, false]]));


defaultExport.ListControl = (ListControl = (new_element, elem_renderer) => (label, valueLink) => React.createElement("div", {"className": "ctrl-wrapper"},
    React.createElement(ListComponent, { 
        "labelRowStyle": ({flex: 1}),  
        "label": (React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label))),  
        "valueLink": (valueLink),  
        "newElement": (new_element),  
        "elem": (elem_renderer)})
));


// Not a "sidebar control", but a control we use in the sidebar (see Block.defaultTopSidebarControls)
defaultExport.CompactNumberControl = createReactClass({
    render() {
        return React.createElement("div", {"style": ({width: '45%', display: 'flex', flexDirection: 'row', alignItems: 'baseline'})},
            React.createElement("span", {"style": ({fontWeight: 'bold', fontSize: '0.9em', width: 15, textAlign: 'right'})}, (this.props.label)),
            React.createElement(FormControl, {"type": "number", "valueLink": (this.props.valueLink), "style": ({marginLeft: '6px', width: '100%'})})
        );
    }
});

// Also not a "sidebar control", but used in the Block.boxStylingSidebarControls for box shadows
defaultExport.LabelBelowControl = (LabelBelowControl = createReactClass({
    render() {
        let {vl, label, tag, ctrlProps, layoutStyles} = this.props;
        const Tag = tag != null ? tag : FormControl;
        if (ctrlProps == null) { ctrlProps = {}; }
        if (Tag === FormControl) { if (ctrlProps.type == null) { ctrlProps.type = 'text'; } }
        ctrlProps.style = _l.extend({}, {
            height: 30, width: '100%'
        }, ctrlProps.style);
        return React.createElement("div", {"style": ({flex: 1})},
            React.createElement(Tag, Object.assign({"valueLink": (vl)}, ctrlProps )),
            React.createElement("div", {"style": ({textAlign: 'center', fontSize: '0.7em', color: '#555'})}, (label))
        );
    }
}));


defaultExport.CursorControl = (CursorControl = function(label, valueLink) {
    const default_new_cursor = 'pointer';

    // NOTE: setting cursor: auto is *not* the same as setting no cursor because a child will inherit
    // the cursor from its parent in the no cursor case. You need to separately handle the default case,
    // which we typically use value empty string `""` for.

    if (valueLink.value === '') {
        return React.createElement("div", {"className": "ctrl-wrapper"},
            React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label)),
            React.createElement(PDStyleGuide.SidebarHeaderAddButton, {"onClick": (() => {
                // default to pointer when we add a cursor
                return valueLink.requestChange(default_new_cursor);
            }
            )})
        );

    } else {
        return React.createElement("div", null,
            React.createElement("div", {"className": "ctrl-wrapper"},
                React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label)),
                React.createElement(PDStyleGuide.SidebarHeaderRemoveButton, {"onClick": (() => {
                    return valueLink.requestChange('');
                }
                )})
            ),
            React.createElement(PDStyleGuide.PdVlDropdownTwo, { 
                "valueLink": (valueLink),  
                "style": ({width: '100%', cursor: valueLink.value}),  
                "options": (allCursors.map(cursor => ({
                    label: cursor,
                    value: cursor
                })))
            })
        );
    }
});


const PDFontWeightControl = createReactClass({
    render() {
        //FIXME: because CJSX didn't compile this inline
        const makeSpan = val => React.createElement("span", {"style": ({fontWeight: val})}, (val));

        return React.createElement(PdDropdown, { 
            "id": "font-weight-control",  
            "value": (this.props.valueLink.value || '700'),  
            "onSelect": (this.props.valueLink.requestChange),  
            "label": (makeSpan),  
            "options": (this.props.fontFamily.get_font_variants())});
    },

    shouldComponentUpdate(nextProps) {
        return (nextProps.valueLink.value !== this.props.valueLink.value) || (nextProps.fontFamily !== this.props.fontFamily);
    }
});

defaultExport.FontWeightControl = (FontWeightControl = fontFamily => labeledControl(valueLink => React.createElement(PDFontWeightControl, {"valueLink": (valueLink), "fontFamily": (fontFamily)})));


defaultExport.ShadowsControl = (ShadowsControl = shadowType => ListControl(
    (() => new (Model.tuple_named[shadowType])({ color: "#000", offsetX: 0, offsetY: 2, blurRadius: 4, spreadRadius: 0 })),
    (elem, handleRemove) => React.createElement("div", {"style": ({display: 'flex', justifyContent: 'space-between', width: '100%', alignItems:'center', marginTop: '9px'})},
        React.createElement(LabelBelowControl, {"label": "color", "vl": (propValueLinkTransformer('color')(elem)), "tag": (PDColorControl)}),
        React.createElement("div", {"style": ({width: 8})}),
        React.createElement(LabelBelowControl, {"label": "X", "vl": (NumberToStringTransformer(propValueLinkTransformer('offsetX')(elem))), "ctrlProps": ({type: 'number', className: 'underlined-number-input'})}),
        React.createElement("div", {"style": ({width: 8})}),
        React.createElement(LabelBelowControl, {"label": "Y", "vl": (NumberToStringTransformer(propValueLinkTransformer('offsetY')(elem))), "ctrlProps": ({type: 'number', className: 'underlined-number-input'})}),
        React.createElement("div", {"style": ({width: 8})}),
        React.createElement(LabelBelowControl, {"label": "blur", "vl": (NumberToStringTransformer(propValueLinkTransformer('blurRadius')(elem))), "ctrlProps": ({type: 'number', className: 'underlined-number-input'})}),
        (
            shadowType === "box-shadow" ?
                React.createElement(React.Fragment, null,
                    React.createElement("div", {"style": ({width: 8})}),
                    React.createElement(LabelBelowControl, {"label": "spread", "vl": (NumberToStringTransformer(propValueLinkTransformer('spreadRadius')(elem))), "ctrlProps": ({type: 'number', className: 'underlined-number-input'})})
                ) : undefined
        ),
        React.createElement("div", {"style": ({width: 8})}),
        React.createElement("i", {"role": "button", "className": "material-icons md-14", "style": ({lineHeight: '24px', color: 'black'}), "onClick": (handleRemove)}, "delete")
    )));

defaultExport.TextShadowsControl = (TextShadowsControl = ShadowsControl('text-shadow'));
defaultExport.BoxShadowsControl = (BoxShadowsControl = ShadowsControl('box-shadow'));

// NOTE: not at all a SidebarControl, according to the types (!)
defaultExport.TextStyleVariantControlGroup = (TextStyleVariantControlGroup = function(fontFamily, linkAttr, valid_attrs) {
    const fontHasWeightVariants = !_l.isEmpty(fontFamily.get_font_variants());
    const hasCustomFontWeight = fontHasWeightVariants && (linkAttr('hasCustomFontWeight').value === true);

    return [
        React.createElement("div", {"className": "ctrl-wrapper"},
            React.createElement("h5", {"className": "sidebar-ctrl-label"}, "style"),
            React.createElement("div", {"className": "ctrl"},
                React.createElement(PdButtonGroup, {"buttons": ([
                        [React.createElement("b", null, "B"), 'isBold'],
                        [React.createElement("i", null, "I"), 'isItalics'],
                        [React.createElement("u", null, "U"), 'isUnderline'],
                        [React.createElement("s", null, "S"), 'isStrikethrough']
                    ].map((...args) => {
                        // Don't render bold button if fontweight control is showing
                        const [label, attr] = Array.from(args[0]), i = args[1];
                        if ((attr === 'isBold') && hasCustomFontWeight) { return; }

                        const vlink = linkAttr(attr);
                        return {
                            type: vlink.value ? 'primary' : 'default',
                            disabled: !Array.from(valid_attrs).includes(attr),
                            label,
                            onClick(e) { vlink.requestChange(!vlink.value); e.preventDefault(); return e.stopPropagation(); }
                        };
                }))})
            )
        ),

        fontHasWeightVariants ? ["use custom font weight", 'hasCustomFontWeight', CheckboxControl] : undefined,
        hasCustomFontWeight ? ["font weight", 'fontWeight', FontWeightControl(fontFamily)] : undefined
    ];
});
export default defaultExport;
