# FIXME: This whole file should probably be in frontend/
React = require 'react'
createReactClass = require 'create-react-class'
_l = require 'lodash'
{Glyphicon, Tabs, Tab, Modal, DropdownButton, MenuItem, Glyphicon, ButtonGroup, Button, ButtonToolbar} = require 'react-bootstrap'
{Dropdown} = require 'semantic-ui-react'

Bp = require '@blueprintjs/core'
_l.extend exports, {'MenuDivider': Bp.MenuDivider, 'Menu': Bp.Menu, 'MenuItem': Bp.MenuItem}

FormControl = require '../frontend/form-control'

exports.pdSidebarHeaderFont = pdSidebarHeaderFont = {fontFamily: 'inherit', fontSize: 14, fontWeight: '500'}

exports.PdButtonOne = PdButtonOne = ({type, onClick, children, disabled, stretch, submit}) ->
    React.createElement(Button, {"type": (if submit then 'submit' else 'button'), "bsStyle": (type), "active": (false),  \
        "onClick": (onClick), "disabled": (disabled), "block": (stretch)},
        (children)
    )

exports.PdSidebarButton = PdSidebarButton = ({onClick, children}) ->
    React.createElement("button", {"style": (width: '100%'), "onClick": (onClick)}, (children))

exports.PdButtonGroup = PdButtonGroup = ({buttons}) ->
    React.createElement(ButtonGroup, {"className": "sidebar-select-control", "bsSize": "sm"},
    (_l.compact(buttons).map((buttonProps, i) ->
        React.createElement(PdButtonOne, Object.assign({"key": (i)}, (_l.omit buttonProps, 'label')), (buttonProps.label))
    ))
    )

exports.PdButtonBar = ButtonToolbar

exports.PdIconGroup = PdButtonGroup

exports.PdSpinner = ({size}) ->
    React.createElement("svg", {"className": "spinner", "width": "#{size ? 40}px", "height": "#{size ? 40}px", "viewBox": "0 0 66 66", "xmlns": "http://www.w3.org/2000/svg"},
        React.createElement("circle", {"className": "spinner-path", "fill": "none", "strokeWidth": "6", "strokeLinecap": "round", "cx": "33", "cy": "33", "r": "30"})
    )

exports.PdCheckbox = ({label, valueLink, disabled}) ->
    React.createElement(Bp.Checkbox, {"label": (label), "checked": (valueLink.value), "onChange": ((evt) -> valueLink.requestChange(!valueLink.value)), "disabled": (disabled)})

#PdDropdown A :: ({
#  value: A,
#  options: [A],
#  label: (A) -> ReactElement,
#  onSelect: (A) -> IO ()
#}) -> ReactElement
exports.PdDropdown = PdDropdown = ({value, onSelect, options, label, id}) ->
    React.createElement(DropdownButton, {"title": (label(value)), "onSelect": (onSelect), "id": (id)},
        (
            options.map (value, i) => React.createElement(MenuItem, {"eventKey": (value), "key": (i)}, (label(value)))
        )
    )

exports.PdDropdownTwo = PdDropdownTwo = ({value, options, onSelect, stretch, style}) ->
    React.createElement("select", { \
        "className": "sidebar-select",  \
        "style": (_l.extend {width: if stretch then '100%' else undefined}, style),  \
        "value": (value),  \
        "onChange": ((evt) -> onSelect(evt.target.value, evt))
    },
        (options.map ({value, label}, i) -> React.createElement("option", {"key": (i), "value": (value)}, (label)))
    )

exports.PdVlDropdownTwo = PdVlDropdownTwo = ({valueLink, options, stretch, style}) ->
    React.createElement(PdDropdownTwo, { \
        "value": (valueLink.value),  \
        "onSelect": (valueLink.requestChange),  \
        "stretch": (stretch),  \
        "style": (style),  \
        "options": (options)
    })

exports.PdPopupMenu = PdPopupMenu = ({label, iconName, options, onSelect}) ->
    React.createElement("select", { \
        "onChange": ((evt) => onSelect(evt.target.value)),  \
        "style": (
            width: '14px'
            appearance: 'none'
            WebkitAppearance: 'none'
            fontFamily: 'Material Icons'
            outline: 'none'
            border: 'none'
            background: 'none'
        ),  \
        "value": (label)
    },
        React.createElement("option", {"disabled": true, "hidden": true, "value": (label)}, (iconName)),
        React.createElement("option", {"disabled": true, "value": "no-value"}, (label)),
        (options.map (title, index) =>
            React.createElement("option", {"key": (title), "value": (index)},
                (title)
            )
        )
    )
# props:
#   defaultIndex: Number
#   options: [{value: String, handler: (->)}]

# defaultIndex is misnamed; it should just be selectedIndex

exports.PdIndexDropdown = PdIndexDropdown = createReactClass
    render: ->
        React.createElement(PdDropdownTwo, {"value": (@props.defaultIndex), "onSelect": (@handleSelect), "stretch": (@props.stretch),  \
            "options": (@props.options.map ({value, handler}, i) -> {value: i, label: value})})

    handleSelect: (val) ->
        try @props.options[parseInt(val)].handler()
        catch e then console.log e.toString()


exports.PdSearchableDropdown = ({search, options, text, onChange}) ->
    # Semantic UI does this stupid thing where they make value be a string.  Since that's obviously not something we want,
    # let's give all options index-based values, then look up the original option before telling our caller.
    s_ui_opts = options.map (opt, i) ->
        o = _l.extend({key: i}, opt, {value: i})
        delete o.matches
        delete o.onSelect
        return o

    React.createElement("div", {"className": "semantic"},
        
        React.createElement(Dropdown, {"style": ('margin': '0 -1px 0 -1.5px'), "className": ("pd-searchable-dropdown"),  \
            "fluid": true, "selection": true, "searchInput": ({type: 'string'}),  \
            "id": (
                # Dropdown button's 'id' prop is required for accessibility or will warn
                "pd-searchable-dropdown"
            ),  \
            "text": (text),  \
            "options": (s_ui_opts),  \
            "search": ((menuItems, query) => menuItems.filter (item) -> options[item.value].matches(query)),  \
            "onChange": ((evt, {value}) =>
                # I genuinely have no idea what these types are, and can't find docs anywhere.
                # I *think* the second parameter is the selected value
                options[value].onSelect()
            )
        })
    )

exports.PdTabBar = PdTabBar = ({tabs}) ->
    React.createElement("div", {"style": (_l.extend {}, pdSidebarHeaderFont, {display: 'flex', height: 30})},
        (tabs.map ({open, label, onClick, key}, i) ->
            common = {flexGrow: '1', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center'}
            if open
                React.createElement("div", {"key": (key), "style": (_l.extend {}, common, {color: '#444'})}, (label))
            else
                style = _l.extend {}, common, borderBottom: '1px solid #c4c4c4', color: '#aaa'
                _l.extend style, {borderRight: '1px solid #c4c4c4', borderBottomRightRadius: 3} if i < tabs.length - 1 and tabs[i + 1].open
                _l.extend style, {borderLeft: '1px solid #c4c4c4', borderBottomLeftRadius: 3} if i > 0 and tabs[i-1].open
                React.createElement("div", {"key": (key), "onClick": (onClick), "style": (style)}, (label))
        )
    )

# FIXME: Rename these to PdModal, PdTab, etc to be consistent
exports.Modal = Modal
exports.Tabs = Tabs
exports.Tab = Tab
exports.Glyphicon = Glyphicon


## Sidebar

exports.SidebarHeaderAddButton = SidebarHeaderAddButton = ({style, onClick}) ->
    React.createElement("i", {"className": "material-icons md-14", "style": (style), "onClick": (onClick)}, "add")

exports.SidebarHeaderRemoveButton = SidebarHeaderRemoveButton = ({style, onClick}) ->
    React.createElement("i", {"className": "material-icons md-14", "style": (style), "onClick": (onClick)}, "remove")
