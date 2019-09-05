React = require 'react'
_l = require 'lodash'

Topbar = require('../pagedraw/topbar')
{Sidebar} = require '../editor/sidebar'
LayerList = require '../editor/layer-list'
ErrorSidebar = require '../pagedraw/errorsidebar'


# Base class for EditorModes to override

exports.EditorMode = class EditorMode
    willMount: (editor) ->
        # Implement me in subclasses!

    topbar: (editor, defaultTopbar) ->
        React.createElement("div", null, React.createElement(Topbar, {"editor": (editor), "whichTopbar": (defaultTopbar)}))

    canvas: (editor) ->
        # Implment me in subclasses!
        React.createElement("div", null)

    sidebar: (editor) ->
        React.createElement(Sidebar, { \
            "editor": (editor),  \
            "value": (editor.getSelectedBlocks()),  \
            "selectBlocks": (editor.selectBlocks),  \
            "editorCache": (editor.editorCache),  \
            "sidebarMode": "draw",  \
            "doc": (editor.doc),  \
            "setEditorMode": (editor.setEditorMode),  \
            "onChange": (editor.handleDocChanged)
            })

    leftbar: (editor) ->
        React.createElement(React.Fragment, null,
            React.createElement(LayerList, { \
                "doc": (editor.doc),  \
                "selectedBlocks": (editor.getSelectedBlocks()),  \
                "onBlocksSelected": (editor.handleLayerListSelectedBlocks),  \
                "onLayerItemMouseDown": (editor.setEditorStateToDefault),  \
                "highlightedBlock": (editor.highlightedBlock),  \
                "setHighlightedblock": (editor.setHighlightedblock),  \
                "onChange": (editor.handleDocChanged)}),

            (if editor.errors.length > 0 or editor.warnings.length > 0
                React.createElement("div", {"style": (maxHeight: 314)},
                    React.createElement(ErrorSidebar, {"errors": (editor.errors), "warnings": (editor.warnings)})
                )
            )
        )

    # when we 'toggle' a mode, we'll use this to compare to the existing mode,
    # to see if we think we're going to the same mode
    isAlreadySimilarTo: (other) -> false

    keepBlockSelectionOnEscKey: -> no

    # called once per Editor.render
    rebuild_render_caches: ->
