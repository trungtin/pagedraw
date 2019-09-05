React = require 'react'
createReactClass = require 'create-react-class'
{ SidebarHeaderAddButton } = require '../editor/component-lib'

module.exports = ListComponent = createReactClass
    render: ->
        React.createElement("div", {"style": (@props.labelRowStyle)},
            React.createElement("div", {"style": (display: 'flex', flexDirection: 'row', alignItems: 'center')},
                React.createElement("span", {"style": (flex: 1)}, (@props.label)),
                React.createElement(SidebarHeaderAddButton, {"onClick": (@handleAdd)})
            ),
            React.createElement("div", null,
                ( @props.valueLink.value.map (elem, i) =>
                    React.createElement(React.Fragment, {"key": (i)},
                        (@props.elem({value: elem, requestChange: @handleUpdate(i)}, (=> @handleRemove(i)), i))
                    )
                )
            )
        )

    handleAdd: -> @update @getVal().concat([@props.newElement()])
    handleRemove: (i) -> @splice(i, 1)
    handleUpdate: (i) -> (nv) => @splice(i, 1, nv)

    getVal: -> @props.valueLink.value
    update: (nv) -> @props.valueLink.requestChange(nv)

    splice: (args...) ->
        list_copy = @props.valueLink.value.slice()
        list_copy.splice(args...)
        @props.valueLink.requestChange(list_copy)
