_l = require 'lodash'
React = require 'react'
createReactClass = require 'create-react-class'
config = require '../config'
{Glyphicon} = require '../editor/component-lib'

{ ChromePicker } = require 'react-color'
tinycolor = require 'tinycolor2'
PDStyleGuide = {PdSearchableDropdown, PdSidebarButton, PdDropdown, PdDropdownTwo, PdButtonGroup} = require './component-lib'

ListComponent = require '../frontend/list-component'
{Font, fontsByName, allFonts, GoogleWebFont} = require '../fonts'
{allCursors} = require '../cursors'
ToggleIcon = require '../frontend/toggle-icon'
{handleAddCustomFonts} = require '../frontend/custom-font-modal'
{filePathTextStyle} = require './code-styles'
Tooltip = require '../frontend/tooltip'

fuzzysearch = require 'fuzzysearch'

FormControl = require '../frontend/form-control'
ColorPickerDebounced = require '../frontend/react-input-color'
{Popover} = require '../frontend/popover'

model = {Model} = require '../model'


## Control utilities
exports.valueLinkTransformer = valueLinkTransformer = ({forwards, backwards}) -> (valueLink) ->
    value: forwards(valueLink.value)
    requestChange: (newVal_t) -> valueLink.requestChange(backwards(newVal_t))

exports.NumberToStringTransformer = NumberToStringTransformer = valueLinkTransformer
    forwards: (num) -> num?.toString() ? "0"
    backwards: Number

# control A :: (label, valueLink A) -> React element
# transformControl :: (valueLinkTransformer A, B) -> (control A) -> (control B)
exports.transformControl = transformControl = _l.curry (valueLinkTransformer, control) -> (label, valueLink) ->
    control(label, valueLinkTransformer valueLink)

# propValueLinkTransformer :: (prop :: String) -> (valueLink A) -> (valueLink A[prop])
exports.propValueLinkTransformer = propValueLinkTransformer = _l.curry (prop, valueLink) ->
        value: valueLink.value[prop]
        requestChange: (new_val) ->
            valueLink.requestChange(valueLink.value.freshRepresentationWith _l.fromPairs [[prop, new_val]])

# dotVlt :: (valueLink A) -> (members :: [String] | String) -> (valueLink A[member1][member2]...)
exports.dotVlt = dotVlt = (valueLink, members) ->
    return propValueLinkTransformer(members, valueLink) if _l.isString(members)
    return valueLink if members.length == 0
    dotVlt(propValueLinkTransformer(_l.head(members), valueLink), _l.tail(members))

exports.listValueLinkTransformer = listValueLinkTransformer = _l.curry (i, valueLink) ->
        value: valueLink.value[i]
        requestChange: (new_val) ->
            new_list = _l.clone valueLink.value
            new_list[i] = new_val
            valueLink.requestChange(new_list)

# propControlTransformer :: (prop :: String) -> (control A) -> (control A[prop])
exports.propControlTransformer = propControlTransformer = _l.curry (prop, control) ->
    transformControl(propValueLinkTransformer(prop), control)


exports.LabeledControl = LabeledControl = createReactClass
    displayName: 'LabeledControl'
    render: ->
        React.createElement("div", {"className": "ctrl-wrapper"},
            React.createElement("h5", {"className": "sidebar-ctrl-label"}, (@props.label)),
            React.createElement("div", {"className": "ctrl"}, (@props.control(@props.valueLink)))
        )

exports.labeledControl = labeledControl = (control) -> (label, valueLink) ->
    React.createElement(LabeledControl, {"control": (control), "label": (label), "valueLink": (valueLink)})

# DynamicableControl :: (control A) -> (control (A.staticValue, A.isDynamic))
exports.DynamicableControl = DynamicableControl = (control) -> (label, valueLink) ->
    dynamicValueLink = propValueLinkTransformer('isDynamic', valueLink)
    is_dynamic = dynamicValueLink.value

    tooltip_content =
        React.createElement("span", {"style": (
            padding: '0.5em'
            fontSize: '16px'
        )},
            (if is_dynamic then "Make static" else "Control with code")
        )

    clickable_label =
        React.createElement(Tooltip, {"position": "right", "content": (tooltip_content)},
            React.createElement("span", {"className": "dynamicable-control-label", "style": (cursor: 'pointer'), "onClick": (=>
                dynamicValueLink.requestChange(not dynamicValueLink.value)
            )},
                React.createElement("span", {"style": (
                    if is_dynamic then {
                        color: '#e27fe2'
                        fontWeight: 'bold'
                        letterSpacing: '-0.5px'
                    } else {

                    }
                )},
                    (label)
                ),
                (" "),
                React.createElement("i", { \
                    "className": ("material-icons md-14 dynamicable-icon-#{if is_dynamic then 'on' else 'off'}"),  \
                    "children": "code",  \
                    "style": (
                        fontSize: '14px'
                        verticalAlign: '-3.2px'
                    )
                })
            )
        )

    control(clickable_label, staticValueLinkTransformer(valueLink))

exports.staticValueLinkTransformer = staticValueLinkTransformer = (valueLink) ->
    propValueLinkTransformer('staticValue', valueLink)


## Controls
exports.TextControlWithDefault = (dfault) -> labeledControl (valueLink) ->
    React.createElement(FormControl, {"type": "text", "placeholder": (dfault), "valueLink": (valueLink)})

exports.DebouncedTextControlWithDefault = (dfault) -> labeledControl (valueLink) ->
    React.createElement(FormControl, {"debounced": (true), "type": "text", "placeholder": (dfault), "valueLink": (valueLink)})

exports.DebouncedTextControl = labeledControl (valueLink) ->
    React.createElement(FormControl, {"debounced": (true), "type": "text", "valueLink": (valueLink)})

exports.TextControl = TextControl = labeledControl (valueLink) ->
    React.createElement(FormControl, {"type": "text", "valueLink": (valueLink)})

exports.PDTextControlWithConfirmation = PDTextControlWithConfirmation = createReactClass
    linkState: (attr) ->
        value: @state[attr]
        requestChange: (nv) =>
            @setState {"#{attr}": nv}

    getInitialState: ->
        tmpValue: @props.valueLink.value
        editing: no

    render: ->
        textStyle = {display: 'flex', justifyContent: 'space-between'}
        textStyle = _l.extend(textStyle, {cursor: "pointer"}) if @props.showEditButton?

        React.createElement("div", null,
            ( if @state.editing
                React.createElement("div", {"style": (display: 'flex', width: "100%", justifyContent: 'space-between', position: 'relative', zIndex: 11)},
                    React.createElement("form", {"style": (width: '100%'), "onSubmit": ((e) =>
                        # this form is here so we pick up an 'enter' in the text field
                        @handleSubmit()
                        e.preventDefault()
                    )},
                        React.createElement(FormControl, {"type": "text", "valueLink": (@linkState('tmpValue')),  \
                            "style": (
                                _l.extend {
                                    width: '100%', wordBreak: 'break-all',
                                    fontFamily: 'monospace'
                                }, @props.style
                            ),  \
                            "autoFocus": true,  \
                            "onBlur": (@handleSubmit)})
                    )
                )
            else
                React.createElement("div", {"onClick": (@startEditing), "style": (textStyle)},
                    React.createElement("div", {"style": (
                        _l.extend {
                            width: '100%', wordBreak: 'break-all', marginRight: 8
                            fontFamily: 'monospace'
                        }, @props.style
                    )},
                        (@props.valueLink.value)
                    ),
                    (React.createElement("div", null, "Edit") if @props.showEditButton)
                )
            )
        )

    componentWillUnmount: ->
        @handleSubmit()

    startEditing: ->
        @setState {editing: yes, tmpValue: @props.valueLink.value}

    handleSubmit: ->
        return unless @state.editing == true
        @props.valueLink.requestChange(@state.tmpValue)
        @setState editing: no

exports.TextControlWithConfirmation = labeledControl (valueLink) ->
    React.createElement(PDTextControlWithConfirmation, {"valueLink": (valueLink), "showEditButton": (true)})

exports.FilePathControl = labeledControl (valueLink) ->
    React.createElement(PDTextControlWithConfirmation, {"valueLink": (valueLink), "showEditButton": (true), "style": (filePathTextStyle)})

exports.DebouncedTextAreaControlWithPlaceholder = (placeholder, options = {}) -> (label, valueLink) ->
    textarea = React.createElement(FormControl, {"debounced": (true), "tag": "textarea", "valueLink": (valueLink), "placeholder": (placeholder), "style": (width: '100%', height: options.height ? '20em')})
    return textarea if _l.isEmpty label
    React.createElement("div", null,
        React.createElement("div", {"className": "ctrl-wrapper", "style": (alignItems: 'baseline')},
            React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label))
        ),
        (textarea)
    )

exports.NumberControl = NumberControl = (label, valueLink) ->
    React.createElement("div", {"className": 'ctrl-wrapper', "style": (
        display: 'flex'
        flexDirection: 'row'
        alignItems: 'baseline'
        flex: '1'
    )},
        React.createElement("h5", {"className": "sidebar-ctrl-label", "style": (flexGrow: 1)}, (label)),
        React.createElement(FormControl, {"valueLink": (NumberToStringTransformer(valueLink)),  \
            "type": "number",  \
            "className": "underlined-number-input"})
    )


exports.CustomSliderControl = CustomSliderControl = ({min, max}) -> (label, valueLink) ->
    React.createElement("div", {"className": "ctrl-wrapper", "style": (flexDirection: 'column', alignItems: 'normal')},
        React.createElement("div", {"style": (
            display: 'flex'
            flexDirection: 'row'
            alignItems: 'baseline'
            flex: '1'
        )},
            React.createElement("h5", {"className": "sidebar-ctrl-label", "style": (flexGrow: 1)}, (label)),
            React.createElement(FormControl, {"valueLink": (NumberToStringTransformer(valueLink)),  \
                "type": "number",  \
                "className": "underlined-number-input"})
        ),
        React.createElement("div", null,
            React.createElement(FormControl, {"type": "range", "min": (min), "max": (max), "valueLink": (NumberToStringTransformer(valueLink))})
        )
    )

exports.SliderControl = CustomSliderControl(min: 0, max: 100)

exports.CheckboxControl = CheckboxControl = (label, valueLink) ->
    React.createElement("div", {"className": "ctrl-wrapper", "style": (alignItems: 'center')},
      React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label)),
      React.createElement(FormControl, {"type": "checkbox", "valueLink": (valueLink), "label": (label)})
    )

exports.LeftCheckboxControl = LeftCheckboxControl = (label, valueLink) ->
    React.createElement("label", {"style": (fontSize: '12px', fontWeight: 'normal', display: 'flex', alignItems: 'center', flex: '1')},
      React.createElement(FormControl, {"style": (margin: '0'), "type": "checkbox", "valueLink": (valueLink), "label": (label)}), """
       
""", React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label))
    )

exports.PDFontControl = PDFontControl = createReactClass
    render: ->
        React.createElement(PdSearchableDropdown, { \
            "text": (@props.valueLink.value?.get_user_visible_name() ? 'None'),  \
            "options": (_l.flatten [
                @props.doc.fonts.map((font) => {
                    text: font.get_user_visible_name()
                    style: {fontFamily: font.get_css_string()}
                    matches: (query) => fuzzysearch(query.toLowerCase(), font.get_user_visible_name().toLowerCase())
                    onSelect: => @props.valueLink.requestChange(font)
                })
                [{
                    text: "Add more fonts"
                    matches: (query) => yes
                    onSelect: => handleAddCustomFonts(@props.doc, @props.onChange)
                }]
            ])})

    componentDidMount: -> @updateRenderedFonts()
    componentDidUpdate: -> @updateRenderedFonts()
    updateRenderedFonts: ->
        @renderedFonts = model.fresh_representation([Font], @props.doc.fonts)

    shouldComponentUpdate: (nextProps) ->
        nextProps.valueLink.value != @props.valueLink.value or not model.isEqual(@props.doc.fonts, @renderedFonts)


exports.FontControl = FontControl = (doc, onChange) -> labeledControl (valueLink) ->
    React.createElement(PDFontControl, {"valueLink": (valueLink), "doc": (doc), "onChange": (onChange)})


StringToTinycolorTransformer = valueLinkTransformer
    forwards: (str) -> tinycolor(str ? 'rgba(0,0,255,1)').toRgb()
    backwards: (color) -> tinycolor(color.rgb).toRgbString()

exports.PDColorControl = PDColorControl = createReactClass
    render: ->
        # NOTE I would inline color_well and picker into <Popover />, but there's a bug
        # in coffee-react that incorrectly parses that syntax
        color_value_link = StringToTinycolorTransformer(@props.valueLink)

        color_well =
            React.createElement("div", {"style": (_l.extend {}, {
                    padding: '5px'
                    background: '#fff'
                    borderRadius: '1px'
                    boxShadow: '0 0 0 1px rgba(0,0,0,.4)'
                    display: 'inline-flex'
                    cursor: 'pointer'
                    lineHeight: 0
                    width: 46
                    height: 24
                }, @props.color_well_style)},
                React.createElement("div", {"style": (
                    flex: 1
                    borderRadius: '2px'
                    background: @props.valueLink.value
                )})
            )

        popover = ->
            React.createElement(ChromePicker, {"color": (color_value_link.value),  \
                          "onChange": ((c) -> color_value_link.requestChange(c))})

        React.createElement(Popover, {"trigger": (color_well), "popover": (popover), "popover_position_for_trigger_rect": ((trigger_rect) -> {
            top: trigger_rect.bottom
            right: document.documentElement.clientWidth - trigger_rect.right
        })})

ColorControlCaseSandberg = (label, valueLink) ->
    React.createElement("div", {"className": "ctrl-wrapper", "style": (alignItems: 'flex-start')},
        React.createElement("h5", {"className": "sidebar-ctrl-label", "style": (paddingTop: 7)}, (label)),
        React.createElement(PDColorControl, {"valueLink": (valueLink)})
    )


ColorControlUndebounced = labeledControl (valueLink) ->
    React.createElement(FormControl, {"type": "color", "valueLink": (valueLink)})

ColorControlDebounced = labeledControl (valueLink) ->
    React.createElement(ColorPickerDebounced, {"valueLink": (valueLink)})

exports.ColorControl = ColorControl = switch config.colorPickerImplementation
    when 'CaseSandberg'
        ColorControlCaseSandberg
    when 'Native'
        ColorControlUndebounced
    when 'NativeDebounced'
        ColorControlDebounced


exports.ImageControl = ImageControl = labeledControl (valueLink) ->
    # FIXME: allow folks to change an image instead of having to recreate a block
    # to choose a new image
    React.createElement("div", {"style": (display: 'flex', justifyContent: 'flex-end')},
      React.createElement(Glyphicon, {"glyph": "open-file"})
    )


exports.SelectControl = SelectControl = ({multi, style}, opts) -> labeledControl (valueLink) ->
    if style == 'segmented'
        React.createElement(PdButtonGroup, {"buttons": (opts.map ([label, value], i) -> {
                type: if valueLink.value == value then 'primary' else 'default'
                onClick: (e) -> valueLink.requestChange(value); e.preventDefault(); e.stopPropagation()
                label
            }
        )})
    else if style == 'dropdown'
        React.createElement(FormControl, {"tag": "select", "valueLink": (valueLink)},
        (
            opts.map ([label, value], i) ->
                React.createElement("option", {"key": (i), "value": (value)}, (label))
        )
        )
    else
        throw new Error "unknown SelectControl style"

exports.ObjectSelectControl = ObjectSelectControl = ({isEqual, getLabel, options}) -> labeledControl (valueLink) ->
    React.createElement(FormControl, {"tag": "select", "valueLink": (
        value: _l.findIndex options, (opt) -> isEqual(opt, valueLink.value)
        requestChange: (idx) -> valueLink.requestChange(options[idx])
    )},
        ( options.map (opt, i) -> React.createElement("option", {"key": (i), "value": (i)}, (getLabel(opt))) )
    )


exports.BooleanSelectControl = BooleanSelectControl = (trueLabel, falseLabel) ->
    SelectControl({style: 'segmented'}, [[trueLabel, true], [falseLabel, false]])


exports.ListControl = ListControl = (new_element, elem_renderer) -> (label, valueLink) ->
    React.createElement("div", {"className": "ctrl-wrapper"},
        React.createElement(ListComponent, { \
            "labelRowStyle": (flex: 1),  \
            "label": (React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label))),  \
            "valueLink": (valueLink),  \
            "newElement": (new_element),  \
            "elem": (elem_renderer)})
    )


# Not a "sidebar control", but a control we use in the sidebar (see Block.defaultTopSidebarControls)
exports.CompactNumberControl = createReactClass
    render: ->
        React.createElement("div", {"style": (width: '45%', display: 'flex', flexDirection: 'row', alignItems: 'baseline')},
            React.createElement("span", {"style": (fontWeight: 'bold', fontSize: '0.9em', width: 15, textAlign: 'right')}, (this.props.label)),
            React.createElement(FormControl, {"type": "number", "valueLink": (this.props.valueLink), "style": (marginLeft: '6px', width: '100%')})
        )

# Also not a "sidebar control", but used in the Block.boxStylingSidebarControls for box shadows
exports.LabelBelowControl = LabelBelowControl = createReactClass
    render: ->
        {vl, label, tag, ctrlProps, layoutStyles} = @props
        Tag = tag ? FormControl
        ctrlProps ?= {}
        ctrlProps.type ?= 'text' if Tag == FormControl
        ctrlProps.style = _l.extend({}, {
            height: 30, width: '100%'
        }, ctrlProps.style)
        React.createElement("div", {"style": (flex: 1)},
            React.createElement(Tag, Object.assign({"valueLink": (vl)}, ctrlProps )),
            React.createElement("div", {"style": (textAlign: 'center', fontSize: '0.7em', color: '#555')}, (label))
        )


exports.CursorControl = CursorControl = (label, valueLink) ->
    default_new_cursor = 'pointer'

    # NOTE: setting cursor: auto is *not* the same as setting no cursor because a child will inherit
    # the cursor from its parent in the no cursor case. You need to separately handle the default case,
    # which we typically use value empty string `""` for.

    if valueLink.value == ''
        React.createElement("div", {"className": "ctrl-wrapper"},
            React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label)),
            React.createElement(PDStyleGuide.SidebarHeaderAddButton, {"onClick": (=>
                # default to pointer when we add a cursor
                valueLink.requestChange(default_new_cursor)
            )})
        )

    else
        React.createElement("div", null,
            React.createElement("div", {"className": "ctrl-wrapper"},
                React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label)),
                React.createElement(PDStyleGuide.SidebarHeaderRemoveButton, {"onClick": (=>
                    valueLink.requestChange('')
                )})
            ),
            React.createElement(PDStyleGuide.PdVlDropdownTwo, { \
                "valueLink": (valueLink),  \
                "style": (width: '100%', cursor: valueLink.value),  \
                "options": (allCursors.map((cursor) -> {label: cursor, value: cursor}))
            })
        )


PDFontWeightControl = createReactClass
    render: ->
        #FIXME: because CJSX didn't compile this inline
        makeSpan = (val) => React.createElement("span", {"style": (fontWeight: val)}, (val))

        React.createElement(PdDropdown, { \
            "id": "font-weight-control",  \
            "value": (@props.valueLink.value or '700'),  \
            "onSelect": (@props.valueLink.requestChange),  \
            "label": (makeSpan),  \
            "options": (@props.fontFamily.get_font_variants())})

    shouldComponentUpdate: (nextProps) ->
        nextProps.valueLink.value != @props.valueLink.value or nextProps.fontFamily != @props.fontFamily

exports.FontWeightControl = FontWeightControl = (fontFamily) -> labeledControl (valueLink) ->
    React.createElement(PDFontWeightControl, {"valueLink": (valueLink), "fontFamily": (fontFamily)})


exports.ShadowsControl = ShadowsControl = (shadowType) ->
    ListControl(
        (-> new Model.tuple_named[shadowType]({ color: "#000", offsetX: 0, offsetY: 2, blurRadius: 4, spreadRadius: 0 })),
        (elem, handleRemove) ->
            React.createElement("div", {"style": (display: 'flex', justifyContent: 'space-between', width: '100%', alignItems:'center', marginTop: '9px')},
                React.createElement(LabelBelowControl, {"label": "color", "vl": (propValueLinkTransformer('color')(elem)), "tag": (PDColorControl)}),
                React.createElement("div", {"style": (width: 8)}),
                React.createElement(LabelBelowControl, {"label": "X", "vl": (NumberToStringTransformer propValueLinkTransformer('offsetX')(elem)), "ctrlProps": (type: 'number', className: 'underlined-number-input')}),
                React.createElement("div", {"style": (width: 8)}),
                React.createElement(LabelBelowControl, {"label": "Y", "vl": (NumberToStringTransformer propValueLinkTransformer('offsetY')(elem)), "ctrlProps": (type: 'number', className: 'underlined-number-input')}),
                React.createElement("div", {"style": (width: 8)}),
                React.createElement(LabelBelowControl, {"label": "blur", "vl": (NumberToStringTransformer propValueLinkTransformer('blurRadius')(elem)), "ctrlProps": (type: 'number', className: 'underlined-number-input')}),
                (
                    if shadowType == "box-shadow"
                        React.createElement(React.Fragment, null,
                            React.createElement("div", {"style": (width: 8)}),
                            React.createElement(LabelBelowControl, {"label": "spread", "vl": (NumberToStringTransformer propValueLinkTransformer('spreadRadius')(elem)), "ctrlProps": (type: 'number', className: 'underlined-number-input')})
                        )
                ),
                React.createElement("div", {"style": (width: 8)}),
                React.createElement("i", {"role": "button", "className": "material-icons md-14", "style": (lineHeight: '24px', color: 'black'), "onClick": (handleRemove)}, "delete")
            )
    )

exports.TextShadowsControl = TextShadowsControl = ShadowsControl('text-shadow')
exports.BoxShadowsControl = BoxShadowsControl = ShadowsControl('box-shadow')

# NOTE: not at all a SidebarControl, according to the types (!)
exports.TextStyleVariantControlGroup = TextStyleVariantControlGroup = (fontFamily, linkAttr, valid_attrs) ->
    fontHasWeightVariants = not _l.isEmpty fontFamily.get_font_variants()
    hasCustomFontWeight = fontHasWeightVariants and linkAttr('hasCustomFontWeight').value == true

    [
        React.createElement("div", {"className": "ctrl-wrapper"},
            React.createElement("h5", {"className": "sidebar-ctrl-label"}, "style"),
            React.createElement("div", {"className": "ctrl"},
                React.createElement(PdButtonGroup, {"buttons": ([
                        [React.createElement("b", null, "B"), 'isBold']
                        [React.createElement("i", null, "I"), 'isItalics']
                        [React.createElement("u", null, "U"), 'isUnderline']
                        [React.createElement("s", null, "S"), 'isStrikethrough']
                    ].map ([label, attr], i) =>
                        # Don't render bold button if fontweight control is showing
                        return if attr == 'isBold' and hasCustomFontWeight

                        vlink = linkAttr(attr)
                        return
                            type: if vlink.value then 'primary' else 'default'
                            disabled: attr not in valid_attrs
                            label: label
                            onClick: ((e) -> vlink.requestChange(!vlink.value); e.preventDefault(); e.stopPropagation())
                )})
            )
        )

        ["use custom font weight", 'hasCustomFontWeight', CheckboxControl] if fontHasWeightVariants
        ["font weight", 'fontWeight', FontWeightControl(fontFamily)] if hasCustomFontWeight
    ]
