React = require 'react'
{Modal, PdButtonOne} = require '../editor/component-lib'
modal = require './modal'

module.exports = (data, callback) ->
    modal.show(((closeHandler) -> [
        React.createElement(Modal.Header, {"closeButton": true},
            React.createElement(Modal.Title, null, (data.title ? 'Are you sure?'))
        )
        React.createElement(Modal.Body, null,
            (data.body)
        )
        React.createElement(Modal.Footer, null,
            React.createElement(PdButtonOne, {"onClick": (closeHandler)}, (data.no ? 'Back')),
            React.createElement(PdButtonOne, {"type": (data.yesType ? "primary"), "onClick": (-> callback(); closeHandler())}, (data.yes ? 'Yes'))
        )
    ]), (->))
