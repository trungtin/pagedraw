React = require 'react'
{Modal, PdButtonOne} = require '../editor/component-lib'
modal = require '../frontend/modal'

# FIXME: Maybe should be a mixin?
module.exports = class Refreshable
    constructor: ->
        @willRefresh = false

    needsRefresh: -> @willRefresh = true

    refreshIfNeeded: ->
        if @willRefresh
            window.requestAnimationFrame ->
                modal.show(((closeHandler) -> [
                    React.createElement(Modal.Header, null,
                        React.createElement(Modal.Title, null, "About to refresh")
                    )
                    React.createElement(Modal.Body, null, """
                        The changes you did require a refresh. Closing this window will refresh the screen.
""")
                    React.createElement(Modal.Footer, null,
                        React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Ok")
                    )
                ]), ->
                    window.location = window.location
                )

