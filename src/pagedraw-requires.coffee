_l = require 'lodash'
React = require 'react'
createReactClass = require 'create-react-class'
CodeShower = require './frontend/code-shower'

queryString = require 'query-string'

{PdButtonOne, Modal, Tabs, Tab} = require './editor/component-lib'
{track_error, assert} = require './util'
analytics = require './frontend/analytics'

Dropzone = require('react-dropzone').default
SketchImporterView = require './pagedraw/sketch-importer'
modal = require './frontend/modal'
{server} = require './editor/server'
FormControl = require './frontend/form-control'
{figma_import} = require './figma-import'
PagedrawnPricingCards = require './pagedraw/pricingcards'

config = require './config'


exports.SketchDropzone = createReactClass
    componentWillMount: ->
        @current_state = 'none' # | 'loading' | 'error'
        @error_message = null # a string, if @current_state == 'error'
        @import_canceler = null # a function, if @current_state == 'loading'

    render: ->
        if config.disableFigmaSketchImport
            return React.createElement("div", {"onClick": (-> alert "Sketch importing is only available in the Open Source version!  Check us out on Github: https://github.com/Pagedraw/pagedraw")},
                (@props.children)
            )

        React.createElement("div", null,
            React.createElement("div", {"className": "bootstrap"},
                React.createElement("div", {"ref": "modal_container"})
            ),
            (
                # we do the modal_container shenanigans for bootstrap css...
                switch @current_state
                    when 'none'
                        # no modal
                        React.createElement(Modal, {"show": (false), "container": (@refs.modal_container)})

                    when 'loading'
                        React.createElement(Modal, {"show": true, "container": (@refs.modal_container)},
                            React.createElement(Modal.Header, null,
                                React.createElement(Modal.Title, null, "Importing Sketch...")
                            ),
                            React.createElement(Modal.Body, null,
                                
                                React.createElement(SketchImporterView, {"importing": (yes)})
                            ),
                            React.createElement(Modal.Footer, null,
                                React.createElement("div", {"style": (textAlign: 'left')},
                                    React.createElement(PdButtonOne, {"onClick": (@cancelImport)}, "Cancel")
                                )
                            )
                        )

                    when 'error'
                        React.createElement(Modal, {"show": true, "container": (@refs.modal_container), "onHide": (@errorOkay)},
                            React.createElement(Modal.Header, null,
                                React.createElement(Modal.Title, null, "Error")
                            ),
                            React.createElement(Modal.Body, null,
                                React.createElement(SketchImporterView, {"error": (@error_message ? "")})
                            ),
                            React.createElement(Modal.Footer, null,
                                React.createElement(PdButtonOne, {"type": "primary", "onClick": (@errorOkay)}, "Okay")
                            )
                        )
            ),

            React.createElement(Dropzone, {"onDrop": (@handleDrop), "style": (display: 'flex', flexDirection: 'column')},
                (@props.children)
            )
        )

    handleDrop: (files) ->
        assert -> files?.length > 0

        doc_name = files[0].name
        doc_name = doc_name.slice(0, -('.sketch'.length)) if doc_name.endsWith('.sketch')

        assert => @current_state == 'none'

        @current_state = 'loading'
        @forceUpdate()

        # use local variable to track cancellation so it's per-run of import
        should_cancel = false
        @import_canceler = ->
            should_cancel = true

        server.importFromSketch(files[0], ((doc_json) =>
            return if should_cancel

            return @showError(@sketchImportErrorMessage, new Error('Returned empty doc')) if Object.keys(doc_json.blocks).length <= 1

            server.createNewDoc(@props.app.id, doc_name, @props.app.default_language, _l.cloneDeep(doc_json))
            .then ({docRef, docjson}) =>
                server.saveLatestSketchImportForDoc(docRef, docjson)
                .then =>
                    window.location = "/pages/#{docRef.page_id}"

            .catch (e) =>
                @showError(@metaserverUnreachableErrorMessage, e)

        ), ((err) =>
            # Assume any non 500 error comes with a custom responseText
            @showError((
                switch err.status
                    when 500 then @sketchImportErrorMessage
                    when 0 then @sketchServerUnavailableErrorMessage
                    else err.responseText
            ), new Error("sketch server error #{err.status}"))
        ))


    showError: (msg, err) ->
        assert => @current_state in ['none', 'loading']

        track_error(err, msg)
        analytics.track("Sketch importer error", {msg, where: 'dashboard'})

        @current_state = 'error'
        @error_message = msg
        @forceUpdate()


    cancelImport: ->
        assert => @current_state == 'loading'

        # do the cancel
        @import_canceler?()

        @current_state = 'none'
        @forceUpdate()


    errorOkay: ->
        assert => @current_state == 'error'

        @current_state = 'none'
        @forceUpdate()


    sketchImportErrorMessage: """
        We weren't able to recognize your upload as a Sketch file.

        If this problem persists, please contact the Pagedraw team at team@pagedraw.io
    """

    metaserverUnreachableErrorMessage: """
        Unable to create a new doc.

        If this problem persists, please contact us at team@pagedraw.io
    """

    sketchServerUnavailableErrorMessage: """
        Couldn't reach the server to do a Sketch import.  Please try again.

        If this problem persists, please contact the Pagedraw team at team@pagedraw.io
    """


exports.FigmaModal = createReactClass
    componentWillMount: ->
        @show = false
        @import_in_flight = false
        @status = 'default' # | 'loading' | 'error'
        @figma_url = ""

    componentDidMount: ->
        if @props.show_figma_modal
            @show = true
            @forceUpdate()

    figma_url_vl: ->
        value: @figma_url
        requestChange: (newVal) => @figma_url = newVal; @forceUpdate()

    render: ->
        if config.disableFigmaSketchImport
            return React.createElement("div", {"onClick": (-> alert "Figma importing is only available in the Open Source version!  Check us out on Github: https://github.com/Pagedraw/pagedraw")},
                (@props.children)
            )

        if not @props.figma_access_token
            React.createElement("a", {"href": "/oauth/figma_redirect?app_id=#{@props.app.id}"},
                (@props.children)
            )
        else
            React.createElement("div", null,
                React.createElement("form", {"onSubmit": ((evt) =>
                    evt.preventDefault()


                    figma_import(@figma_url_vl().value, @props.figma_access_token)
                    .then ({doc_json, fileName}) =>
                        server.createNewDoc(@props.app.id, fileName, @props.app.default_language, _l.cloneDeep(doc_json))
                        .then ({docRef, docjson}) =>
                            server.saveLatestFigmaImportForDoc(docRef, docjson)
                            .then =>
                                window.location = "/pages/#{docRef.page_id}"
                        .catch (e) =>
                            throw new Error()
                    .catch (e) =>
                        @status = "error"
                    .then =>
                        @import_in_flight = false
                        @forceUpdate()

                    @import_in_flight = true
                    @status = "loading"
                    @forceUpdate()

                )},
                    React.createElement("div", {"className": "bootstrap"},
                        React.createElement("div", {"ref": "modal_container"})
                    ),
                    React.createElement(Modal, {"show": (@show), "container": (@refs.modal_container)},
                        React.createElement(Modal.Header, null,
                            React.createElement(Modal.Title, null, "Import from Figma")
                        ),
                        React.createElement(Modal.Body, null,
                            (
                                if @status == "default"
                                    React.createElement("div", null,
                                        React.createElement("p", null, "Paste the URL of the Figma design you\'d like to import"),
                                        React.createElement("label", {"htmlFor": "figma_url"}, "Figma link"),
                                        React.createElement(FormControl, {"tag": "input", "valueLink": (@figma_url_vl()),  \
                                            "name": "figma_url", "style": (width: '100%'),  \
                                            "placeholder": "https://figma.com/file/XXXXXXXXXXXXXXXXXXXXXX/Sample-File-Name"})
                                    )
                                else if @status == "loading"
                                    React.createElement("img", {"style": (display: 'block', marginLeft: 'auto', marginRight: 'auto'), "src": "https://ucarecdn.com/59ec0968-b6e3-4a00-b082-932b7fcf41a5/"})
                                else
                                    React.createElement("p", {"style": (color: 'red')}, """We weren\'t able to recognize your upload as a Figma file.

                                    If this problem persists, please contact the Pagedraw team at team@pagedraw.io""")
                            )
                        ),
                        React.createElement(Modal.Footer, null,
                            (React.createElement(PdButtonOne, {"onClick": (=> @show = false; @status = "default"; @forceUpdate())}, "Close") if @status in ["default", "error"]),
                            (React.createElement(PdButtonOne, {"type": "primary", "submit": true, "disabled": (@import_in_flight)}, "Import") if @status == "default")
                        )
                    )
                ),
                React.createElement("div", {"onClick": (=> @show = true; @forceUpdate())},
                    (@props.children)
                )
            )

exports.PricingCardsWrapper = (props) ->
    React.createElement("div", {"style": (position: 'relative', flexGrow: '1')},
        React.createElement("div", {"style": (position: 'absolute', top: 0, left: 0)},
            React.createElement(PagedrawnPricingCards, null)
        )
    )
