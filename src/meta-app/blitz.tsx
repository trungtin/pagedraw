React = require 'react'
createReactClass = require 'create-react-class'
_l = require 'lodash'
ReactMarkdown = require 'react-markdown'

TextButton = require '../pagedraw/textbutton'

{server} = require '../editor/server'
SplitPane = require '../frontend/split-pane'
ShouldSubtreeRender = require '../frontend/should-subtree-render'
CodeShower = require '../frontend/code-shower'
config = require '../config'
{PdButtonOne, Modal} = require '../editor/component-lib'
modal = require '../frontend/modal'
analytics = require '../frontend/analytics'

ErrorPage = require './error-page'

{Editor} = require '../editor/edit-page'
StackBlitz = require '../frontend/stackblitz'

core = require '../core'
{Doc} = require '../doc'


module.exports = createReactClass
    render: ->
        return React.createElement(ErrorPage, {"message": "404 not found"}) if @loadError
        return @renderLoading() unless @loaded

        return @renderReadme() if @props.mobile and @readme?

        if @props.mobile # and we don't have a readme
            return React.createElement(ErrorPage, { \
                "message": "Sorry, our editor isn't optimized for mobile yet",  \
                "detail": "Try opening this link in Chrome on a laptop or desktop!"
                })

        return @renderReadmeOnTheSide() if @readme?
        return @renderPDandBlitz()

    renderPDandBlitz: ->
        overlayFontStyles = {color: '#fff', fontSize: 50, fontFamily: 'Lato, Helvetica Neue'}
        overlayStyles =
            position: 'absolute'
            backgroundColor: 'rgba(30, 30, 30, 0.8)'
            top: -2, left: 0, right: 0, bottom: 0
            zIndex: 5000

        React.createElement(SplitPane, {"split": "horizontal", "defaultSize": ("55%")},
            React.createElement("div", {"style": (position: 'relative', width: '100%', height: '100%')},
                (if @overlay
                    [
                        React.createElement("div", {"onClick": (@hideOverlay), "style": (_l.extend {}, overlayFontStyles, {cursor: 'pointer', zIndex: 5001, position: 'absolute', top: 30, right: 30})}, "x")
                        React.createElement("div", {"onClick": (@hideOverlay), "style": (_l.extend {}, overlayStyles, overlayFontStyles, {display: 'flex', alignItems: 'center', justifyContent: 'center'})},
                            React.createElement("div", null, "Pagedraw Editor")
                        )
                    ]
                ),
                React.createElement(ShouldSubtreeRender, {"shouldUpdate": (false), "subtree": (=>
                    React.createElement(Editor, { \
                        "initialDocJson": (@latest_pagedraw_docjson),  \
                        "onChange": (@handlePagedrawChanged),  \
                        "editorOuterStyle": (height: '100%', width: '100%'),  \
                        "defaultTopbar": (if @props.tutorial then 'tutorial' else 'stackblitz-default'),  \
                        "onStackBlitzShare": (@handleShare)
                        })
                )})
            ),

            React.createElement("div", {"className": "blitz-sb-mount-parent", "style": (position: 'relative', width: '100%', height: '100%')},
                (if @overlay
                    React.createElement("div", {"onClick": (@hideOverlay), "style": (_l.extend {}, overlayStyles, overlayFontStyles, {display: 'flex', alignItems: 'center', justifyContent: 'space-around'})},
                        React.createElement("div", null, "Your code"),
                        React.createElement("div", null, "Live App")
                    )
                ),

                React.createElement(StackBlitz, {"ref": "stackblitz",  \
                    "style": (height: '100%', width: '100%'),  \
                    "sb_template": (@sb_template),  \
                    "overlayFS": (@latest_compiled_fs),  \
                    "initialFS": (@initial_stackblitz_fs),  \
                    "dependencies": (@blitz_dependencies)
                    })
            )
        )

    componentWillMount: ->
        @enableSoftUrlChangingWithoutBreakingBackButton()
        @instanceId = String(Math.random()).slice(2)
        [@loaded, @loadError] = [false, false]

        analytics.track("Opened blitz", {blitz_id: @props.blitz_id})
        server.loadStackBlitz(@props.blitz_id)
        .then (initial_values) =>
            @latest_pagedraw_docjson = initial_values.pagedraw
            @latest_compiled_fs = initial_values.compiled
            @initial_stackblitz_fs = initial_values.stackblitz
            @blitz_dependencies = initial_values.dependencies
            @readme = initial_values.stackblitz["README.md"]
            @sb_template = initial_values.sb_template

            # old ones don't have a sb_template, but are all react
            @sb_template ?= 'create-react-app'

            @overlay = @readme?.trim().match(/__show_overlay__\n/)?
            if @overlay
                @readme = @readme.replace(/__show_overlay__\n/, "")
                window.setTimeout @hideOverlay, 5000

            @loaded = true
            setTimeout => # we don't want errors from here hitting the catch below
                @forceUpdate()

        .catch (e) =>
            @loadError = true
            @forceUpdate()

    hideOverlay: ->
        @overlay = false
        @forceUpdate()

    handlePagedrawChanged: (docjson) ->
        @latest_pagedraw_docjson = docjson

        analytics.track("Made change in blitz Pagedraw editor", {blitz_id: @props.blitz_id})

        compiled = core.compileDoc Doc.deserialize(docjson)
        @latest_compiled_fs = _l.fromPairs compiled.map ({filePath, contents}) -> [filePath, contents]
        @forceUpdate() # push it to StackBlitz

    handleShare: ->
        alert("saving fiddles is disabled")
        return

        @refs.stackblitz.getSbVmState().then ([sb_fs, dependencies]) =>
            blitz_package = {
                pagedraw: @latest_pagedraw_docjson
                stackblitz: sb_fs
                compiled: @latest_compiled_fs
                sb_template: @sb_template
                dependencies: dependencies
            }

            # TODO compare with initially loaded package.  Re-use url if nothing changed.

            server.saveStackBlitz(blitz_package)

            .then (new_blitz_id) =>
                analytics.track("New blitz", {blitz_id: new_blitz_id, parent_id: @props.blitz_id})

                new_blitz_link = "/fiddle/#{new_blitz_id}"
                @softChangeUrl(new_blitz_link)

                modal.show (closeHandler) => [
                    React.createElement("div", {"style": (userSelect: 'text', lineHeight: '2.4em')},
                        React.createElement(Modal.Header, {"style": (textAlign: 'center')},
                            React.createElement(Modal.Title, null, "Your Fiddle was saved")
                        ),
                        React.createElement(Modal.Body, null,
                            React.createElement("p", null, "Link to this Fiddle:"),
                            React.createElement("div", {"style": (marginBottom: 15)},
                                React.createElement(CodeShower, {"content": "https://pagedraw.io#{new_blitz_link}"})
                            ),
                            React.createElement("hr", null),
                            React.createElement("p", null,
                                ("Ready to start using Pagedraw in real a codebase? "),
                                React.createElement("a", {"href": "https://documentation.pagedraw.io/install_existing/"}, """
                                    Learn how to use Pagedraw with git and your regular IDE or text editor.
""")
                            )
                        ),
                        React.createElement(Modal.Footer, {"style": (textAlign: 'center')},
                            React.createElement("p", null, """
                                Continue working and collaborate with other users in real time
                                by """, React.createElement("a", {"href": "/apps"}, "signing up"), " or ", React.createElement("a", {"href": "/apps"}, "logging in"), """.
"""),
                            React.createElement("a", {"href": "/apps"}, React.createElement(PdButtonOne, {"stretch": (true), "type": "primary"}, "Login"))
                        )
                    )
                ]

        .catch (err) ->
            console.error "error saving", err
            # FIXME pop up a modal or something
            alert("save failed")


    renderLoading: ->
        React.createElement("div", null)

    ##

    enableSoftUrlChangingWithoutBreakingBackButton: ->
        window.history.replaceState({location: window.location.toString()}, null, window.location.pathname)
        window.onpopstate = (evt) -> if (location = evt.state?.location)? then window.location = location

    softChangeUrl: (new_path) ->
        # Change the url.  Explicitly save the current url so handleBackButton knows where to redirect to
        window.history.pushState({location: new_path}, null, new_path)

    ##

    renderReadmeOnTheSide: ->
        React.createElement(SplitPane, {"split": "vertical", "defaultSize": "400px"},
            (@renderReadme()),
            (@renderPDandBlitz())
        )

    renderReadme: ->
        readme = @readme.trim()
        next_fiddle_regex = /\nnext: (.*)$/
        next_url_regex = /\nnext-url: (.*)$/

        inner_next_content =
            React.createElement("div", {"style": (display: 'flex', alignItems: 'center')},
                React.createElement("span", {"style": (fontSize: 16, marginRight: 12)}, "NEXT"),
                React.createElement("span", {"style": (fontSize: 22, fontWeight: 100)}, "→")
            )

        [readme, next_button] =
            if (next_fiddle_id = readme.match(next_fiddle_regex)?[1])?
                next_button =
                    React.createElement("a", {"href": (next_fiddle_id), "style": (marginTop: 50, display: 'block')},
                        React.createElement(TextButton, {"text": (inner_next_content)})
                    )

                [readme.replace(next_fiddle_regex, "").trim(), next_button]
            else if (next_url = readme.match(next_url_regex)?[1])?
                next_button =
                    React.createElement("a", {"href": (next_url), "style": (marginTop: 50, display: 'block')},
                        React.createElement(TextButton, {"text": (inner_next_content)})
                    )

                [readme.replace(next_url_regex, "").trim(), next_button]

            else
                [readme, undefined]

        React.createElement("div", {"className": "fiddle-readme-bar"},
            React.createElement("header", null,
                React.createElement("img", {"className": "pagedog-logo", "src": ("#{config.static_server}/assets/favicon.png")}),
                React.createElement("div", null,
                    React.createElement("span", {"className": "logotype"}, "Pagedraw"),
                    (" "),
                    React.createElement("span", {"className": "productname"}, "Intro")
                )
            ),
            React.createElement("div", {"className": "scroll-pane"},
                React.createElement("div", {"className": "content"},
                    (React.createElement("h2", null, "Visit this link on a computer to try the Pagedraw editor out") if @props.mobile),
                    React.createElement(ReactMarkdown, { \
                        "source": (readme),  \
                        "escapeHtml": (false),  \
                        "renderers": ({
                            code: CodeBlock
                            link: ReadmeLink
                        })})
                ),
                (next_button if next_button?)
            )
        )

##

hljs = require 'highlight.js'

ReadmeLink = createReactClass
    render: -> React.createElement("a", {"href": (@props.href), "target": "_blank"}, (@props.children))

CodeBlock = createReactClass
    render: -> React.createElement("pre", null, React.createElement("code", {"ref": "code", "className": (this.props.language)}, (@props.value)))
    componentDidMount: -> hljs.highlightBlock(@refs.code)
    shouldComponentUpdate: -> false
