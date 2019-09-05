React = require 'react'
createReactClass = require 'create-react-class'
_l = require 'lodash'
ReactTooltip = require 'react-tooltip'

Block = require '../block'
{Dynamicable} = require '../dynamicable'
programs = require '../programs'

exports.AlignmentControls = AlignmentControls = createReactClass
    displayName: 'AlignmentControls'
    render: ->
        # assume we're already in a .bootstrap so namespaced-bootstrap things work
        React.createElement("div", {"className": "ctrl"},
            React.createElement("div", {"className": "sidebar-select-control btn-group btn-group-sm", "style": (borderColor: "rgb(228, 228, 228)", borderWidth: '0px 0px 1px 0px', borderStyle: 'solid')},
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('left')), "disabled": (not @canPositionBlock()), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-left", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "left", "data-tip-disable": (not @canPositionBlock())}),
                    React.createElement(ReactTooltip, {"id": "left"}, "Align Left")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (@handleCenterHorizontally), "disabled": (not @canPositionBlock()), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-vertical", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "horizontal", "data-tip-disable": (not @canPositionBlock())}),
                    React.createElement(ReactTooltip, {"id": "horizontal"}, "Align Horizontally")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('right')), "disabled": (not @canPositionBlock()), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-right", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "right", "data-tip-disable": (not @canPositionBlock())}),
                    React.createElement(ReactTooltip, {"id": "right"}, "Align Right")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('top')), "disabled": (not @canPositionBlock()), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-top", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "top", "data-tip-disable": (not @canPositionBlock())}),
                    React.createElement(ReactTooltip, {"id": "top"}, "Align Top")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (@handleCenterVertically), "disabled": (not @canPositionBlock()), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-horizontal", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "vertical", "data-tip-disable": (not @canPositionBlock())}),
                    React.createElement(ReactTooltip, {"id": "vertical"}, "Align Vertically")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('bottom')), "disabled": (not @canPositionBlock()), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon glyphicon-object-align-bottom", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "bottom", "data-tip-disable": (not @canPositionBlock())}),
                    React.createElement(ReactTooltip, {"id": "bottom"}, "Align Bottom")
                )
            )
        )

    handleAlign: (side) ->
        blocks = @props.blocks
        if blocks.length == 1
            if not (artboard = blocks[0].getEnclosingArtboard())?
                # FIXME: Alert the user or something
                return

            blocks[0][side] = artboard[side]
        else
            originals = blocks.map (block) -> block[side]
            aligned = Math.min.apply(null, originals) if side in ['top', 'left']
            aligned = Math.max.apply(null, originals) if side in ['bottom', 'right']
            (block[side] = aligned) for block in blocks
        @props.onChange()

    handleCenterHorizontally: ->
        programs.make_centered_horizontally(@props.blocks)
        @props.onChange()

    handleCenterVertically: ->
        programs.make_centered_vertically(@props.blocks)
        @props.onChange()

    canPositionBlock: ->
        return false if @props.blocks.length <= 0
        return false if not (artboard = @props.blocks[0].getEnclosingArtboard())?
        return (@props.blocks.length == 1) or (@props.blocks.every (block) => artboard == block.getEnclosingArtboard())


exports.ExpandAlignmentControls = ExpandAlignmentControls = createReactClass
    displayName: 'ExpandAlignmentControls'
    render: ->
        # assume we're already in a .bootstrap so namespaced-bootstrap things work
        React.createElement("div", {"className": "ctrl"},
            React.createElement("div", {"className": "sidebar-select-control btn-group btn-group-sm", "style": (borderColor: "rgb(228, 228, 228)", borderWidth: '0px 0px 1px 0px', borderStyle: 'solid')},
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('left')), "disabled": (@props.blocks.length < 2), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-left", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "expand-left", "data-tip-disable": (@props.blocks.length < 2)}),
                    React.createElement(ReactTooltip, {"id": "expand-left", "ref": ((node) => @tooltip = node)}, "Expand Align Left")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('left'); @handleAlign('right')), "disabled": (@props.blocks.length < 2), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-vertical", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "expand-vertical", "data-tip-disable": (@props.blocks.length < 2)}),
                    React.createElement(ReactTooltip, {"id": "expand-vertical"}, "Expand Align Vertically")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('right')), "disabled": (@props.blocks.length < 2), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-right", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "expand-right", "data-tip-disable": (@props.blocks.length < 2)}),
                    React.createElement(ReactTooltip, {"id": "expand-right"}, "Expand Align Right")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('top')), "disabled": (@props.blocks.length < 2), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-top", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "expand-top", "data-tip-disable": (@props.blocks.length < 2)}),
                    React.createElement(ReactTooltip, {"id": "expand-top"}, "Expand Align Top")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('top'); @handleAlign('bottom')), "disabled": (@props.blocks.length < 2), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon-object-align-horizontal", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "expand-horizontal", "data-tip-disable": (@props.blocks.length < 2)}),
                    React.createElement(ReactTooltip, {"id": "expand-horizontal"}, "Expand Align Horizontally")
                ),
                React.createElement("button", {"type": "button", "className": "btn btn-alignment", "onClick": (=> @handleAlign('bottom')), "disabled": (@props.blocks.length < 2), "style": (borderRadius: '0px')},
                    React.createElement("span", {"className": "glyphicon glyphicon glyphicon-object-align-bottom", "style": (color: "dodgerblue"), "aria-hidden": "true", "data-tip": true, "data-for": "expand-bottom", "data-tip-disable": (@props.blocks.length < 2)}),
                    React.createElement(ReactTooltip, {"id": "expand-bottom"}, "Expand Align Bottom")
                )
            )
        )

    handleAlign: (side) ->
        blocks = @props.blocks
        if blocks.length == 1
            if not (artboard = blocks[0].getEnclosingArtboard())?
                # FIXME: Alert the user or something
                return

            blocks[0][side] = artboard[side]
        else
            originals = blocks.map (block) -> block[side]
            if side in ['top', 'left']
                aligned = Math.min.apply(null, originals)
                for block in blocks
                    if side == 'left'
                        block['width'] += (block[side] - aligned)
                        block.left -= (block[side] - aligned)
                    if side == 'top'
                        block['height'] += (block[side] - aligned)
                        block.top -= (block[side] - aligned)
            if side in ['bottom', 'right']
                aligned = Math.max.apply(null, originals)
                for block in blocks
                    (block['width'] += (aligned - block[side])) if side == 'right'
                    (block['height'] += (aligned - block[side])) if side == 'bottom'
        @props.onChange()
