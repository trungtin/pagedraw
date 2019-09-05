React = require 'react'
_l = require 'lodash'
$ = require 'jquery'

ReactMarkdown = require 'react-markdown'
moment = require 'moment'

LibraryTheme = require './theme'
modal = require '../../frontend/modal'
{Modal} = require '../../editor/component-lib'
FormControl = require '../../frontend/form-control'
createReactClass = require 'create-react-class'


module.exports = LibraryPage = createReactClass
    displayName: 'LibraryPage'
    componentDidMount: ->
        @changelogOpen = false
        @readmeState = @props.readme

    linkAttr: (prop, update) -> {
        value: this[prop]
        requestChange: (newVal) =>
            this[prop] = newVal
            @forceUpdate()
            update()
        }

    render: ->
        React.createElement(LibraryTheme, {"current_user": (@props.current_user)},
            React.createElement("div", {"style": (width: '80%', margin: '50px auto')},
                React.createElement("div", {"style": (display: 'flex', justifyContent: 'space-between')},
                    React.createElement("div", {"style": (display: 'flex', alignItems: 'baseline')},
                        React.createElement("p", {"style": (fontSize: 43, color:'rgb(4, 4, 4, .88)', margin: 0)}, (@props.name)),
                        React.createElement("p", {"style": (color: 'rgb(49, 49, 49, .88)')}, (@props.version_name))
                    ),
                    ( if not @props.is_public
                        React.createElement("div", {"style": (width: 140, height: 40, backgroundColor: '#F1F1F1', borderRadius: 3, color: 'rgb(4, 4, 4, .7)', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center')},
                            React.createElement("span", null, "Private")
                        )
                    )
                ),
                React.createElement("p", {"style": (color: 'rgb(49, 49, 49, .6)')}, (@props.description)),
                React.createElement("div", {"style": (display: 'flex', justifyContent: 'space-between')},
                    React.createElement("div", null,
                        React.createElement("button", {"className": ('library-btn'), "onClick": (=>)}, "TRY IT OUT"),
                        React.createElement("button", {"className": ('library-btn'), "onClick": (=> @changelogOpen = not @changelogOpen; @forceUpdate())}, "CHANGELOG")
                    ),
                    React.createElement("div", null,
                        React.createElement("button", {"className": ('library-btn'), "onClick": (=>
                            modal.show((closeHandler) => [
                                React.createElement(Modal.Header, {"closeButton": true},
                                    React.createElement(Modal.Title, null, "Edit README")
                                )
                                React.createElement(Modal.Body, null,
                                    React.createElement(FormControl, {"tag": "textarea", "style": (height: 400, width: '100%'), "valueLink": (@linkAttr('readmeState', modal.forceUpdate))})
                                )
                                React.createElement(Modal.Footer, null,
                                    React.createElement("button", {"className": ('library-btn'), "style": (width: 100, margin: 5), "onClick": (closeHandler)}, "Close"),
                                    React.createElement("button", {"className": ('library-btn-primary'), "style": (width: 100, margin: 5), "onClick": (=>
                                        $.ajax(
                                            url: "/libraries/#{@props.library_id}/versions/#{@props.version_id}"
                                            method: 'PUT'
                                            headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')}
                                            data: {readme: @readmeState}
                                        ).done (data) =>
                                            @readmeState = data.readme
                                            @forceUpdate()
                                            closeHandler())}, """
                                        Publish""")
                                )
                            ]))}, "EDIT README"),
                        React.createElement("button", {"className": ('library-btn-primary'), "onClick": (=>
                            modal.show((closeHandler) -> [
                                React.createElement(Modal.Header, {"closeButton": true},
                                    React.createElement(Modal.Title, null, "Publish New Version")
                                )
                                React.createElement(Modal.Body, null,
                                    React.createElement("div", {"className": "bootstrap"},
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "versionName"}, "Version Name"),
                                            React.createElement(FormControl, {"type": "text", "style": (width: '100%'), "valueLink": (value: null, requestChange: =>), "id": "versionName"})
                                        ),
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "uploadCode"}, "Upload Code"),
                                            React.createElement("input", {"type": "text", "className": "form-control", "style": (width: '100%'), "id": "uploadCode"})
                                        ),
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "changelog"}, "Changelog"),
                                            React.createElement("textarea", {"type": "text", "className": "form-control", "style": (width: '100%'), "id": "changelog", "placeholder": "What's new in this update?"})
                                        ),

                                        React.createElement("hr", null),

                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "description"}, "Description"),
                                            React.createElement("input", {"type": "text", "className": "form-control", "style": (width: '100%'), "id": "description"})
                                        ),
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "homepage"}, "Homepage"),
                                            React.createElement("input", {"type": "text", "className": "form-control", "style": (width: '100%'), "id": "homepage"})
                                        ),
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "readme"}, "README"),
                                            React.createElement("textarea", {"type": "text", "className": "form-control", "style": (width: '100%'), "id": "readme"})
                                        )
                                    )
                                )
                                React.createElement(Modal.Footer, null,
                                    React.createElement("button", {"className": ('library-btn'), "style": (width: 100, margin: 5), "onClick": (closeHandler)}, "Close"),
                                    React.createElement("button", {"className": ('library-btn-primary'), "style": (width: 100, margin: 5), "onClick": (=>)}, "Publish")
                                )
                            ]))}, "PUBLISH UPDATE")
                    )
                ),
                (React.createElement("p", {"style": (float: 'right')}, "A part of your private project ", React.createElement("a", {"href": ("/apps/#{@props.app_id}")}, (@props.app_name))) if not @props.is_public)
            ),

            ( if @changelogOpen
                React.createElement("div", {"style": (width: '85%', maxHeight: 400, height: '100%', backgroundColor: '#F1F1F1', margin: '20px auto', borderRadius: 3, overflowY: 'scroll')},
                    React.createElement("p", {"style": (fontSize: 27, color: 'rgb(4, 4, 4, .77)', padding: 4)}, "Changelog"),
                    (@props.changelog.map (item, i) =>
                        React.createElement("div", {"style": (width: '90%', display: 'flex', margin: '0 auto'), "key": (i)},
                            React.createElement("div", null,
                                React.createElement("p", {"style": (fontWeight: 'bold')}, (item.name)),
                                React.createElement("p", {"style": (fontSize: 14)}, (moment(item.created_at).format('MMM DD YYYY')))
                            ),
                            React.createElement(ReactMarkdown, {"source": (item.updates), "escapeHtml": (false)})
                        )
                    )
                )
            ),

            React.createElement("div", {"style": (width: '85%', height: '100%', backgroundColor: '#F1F1F1', margin: '0 auto', borderRadius: 3)},
                React.createElement("div", {"style": (padding: 5)},
                    React.createElement("p", {"style": (color: 'rgb(49, 49, 49, .88)')}, "How to install"),
                    React.createElement("p", {"style": (color: 'rgb(49, 49, 49, .6)')}, "Some installation content here.  Not sure what it is yet.  Probably fairly in-depth.  Lorem, ipsum, dolor et m is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page")
                )
            ),
            React.createElement("div", {"style": (width: '80%', margin: '0 auto')},
                React.createElement(ReactMarkdown, {"source": (@props.readme), "escapeHtml": (false)})
            )
        )
