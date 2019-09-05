React = require 'react'
createReactClass = require 'create-react-class'
{Modal, PdButtonOne} = require '../editor/component-lib'
modal = require './modal'

FormControl = require './form-control'

exports.ConfigEditor = createReactClass
    linkState: (attr) ->
        value: @state[attr]
        requestChange: (nv) =>
            @setState {"#{attr}": nv}
        
    displayName: "ConfigEditor"

    render: ->
        React.createElement("form", {"onSubmit": (@updateConfig)},
            React.createElement(FormControl, {"tag": "textarea", "style": ({width: '100%', height: '8em', fontFamily: 'monospace'}),  \
                "valueLink": (@linkState('updated_config'))}),
            React.createElement("button", {"style": ({float: 'right', marginBottom: '3em'})}, "Update config")
        )

    getInitialState: ->
        updated_config: window.localStorage.config

    updateConfig: ->
        window.localStorage.config = @state.updated_config
        # for some reason this only works with a timeout...
        window.setTimeout -> window.location.reload()


exports.showConfigEditorModal = showConfigEditorModal = ->
        updated_config = window.localStorage.config

        modal.show (closeHandler) => [
            React.createElement(Modal.Header, {"closeButton": true},
                React.createElement(Modal.Title, null, "Set config flags")
            )
            React.createElement(Modal.Body, null,
                React.createElement(FormControl, {"tag": "textarea", "style": ({width: '100%', height: '60vh', fontFamily: 'monospace'}),  \
                    "valueLink": (
                        value: updated_config
                        requestChange: (nv) => updated_config = nv; modal.forceUpdate()
                    )})
            )
            React.createElement(Modal.Footer, null,
                React.createElement(PdButtonOne, {"onClick": (closeHandler)}, "Close"),
                React.createElement(PdButtonOne, {"type": "primary", "onClick": (=>
                    window.localStorage.config = updated_config
                    window.setTimeout -> window.location.reload()
                )}, "Update")
            )
        ]

# let us open the config editor from the devtools console
window.__openConfigEditor = showConfigEditorModal
