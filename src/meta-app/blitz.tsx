/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import createReactClass from 'create-react-class';
import _l from 'lodash';
import ReactMarkdown from 'react-markdown';
import TextButton from '../pagedraw/textbutton';
import { server } from '../editor/server';
import SplitPane from '../frontend/split-pane';
import ShouldSubtreeRender from '../frontend/should-subtree-render';
import CodeShower from '../frontend/code-shower';
import config from '../config';
import { PdButtonOne, Modal } from '../editor/component-lib';
import modal from '../frontend/modal';
import analytics from '../frontend/analytics';
import ErrorPage from './error-page';
import { Editor } from '../editor/edit-page';
import StackBlitz from '../frontend/stackblitz';
import core from '../core';
import { Doc } from '../doc';

export default createReactClass({
    render() {
        if (this.loadError) { return React.createElement(ErrorPage, {"message": "404 not found"}); }
        if (!this.loaded) { return this.renderLoading(); }

        if (this.props.mobile && (this.readme != null)) { return this.renderReadme(); }

        if (this.props.mobile) { // and we don't have a readme
            return React.createElement(ErrorPage, { 
                "message": "Sorry, our editor isn't optimized for mobile yet",  
                "detail": "Try opening this link in Chrome on a laptop or desktop!"
                });
        }

        if (this.readme != null) { return this.renderReadmeOnTheSide(); }
        return this.renderPDandBlitz();
    },

    renderPDandBlitz() {
        const overlayFontStyles = {color: '#fff', fontSize: 50, fontFamily: 'Lato, Helvetica Neue'};
        const overlayStyles = {
            position: 'absolute',
            backgroundColor: 'rgba(30, 30, 30, 0.8)',
            top: -2, left: 0, right: 0, bottom: 0,
            zIndex: 5000
        };

        return React.createElement(SplitPane, {"split": "horizontal", "defaultSize": ("55%")},
            React.createElement("div", {"style": ({position: 'relative', width: '100%', height: '100%'})},
                (this.overlay ?
                    [
                        React.createElement("div", {"onClick": (this.hideOverlay), "style": (_l.extend({}, overlayFontStyles, {cursor: 'pointer', zIndex: 5001, position: 'absolute', top: 30, right: 30}))}, "x"),
                        React.createElement("div", {"onClick": (this.hideOverlay), "style": (_l.extend({}, overlayStyles, overlayFontStyles, {display: 'flex', alignItems: 'center', justifyContent: 'center'}))},
                            React.createElement("div", null, "Pagedraw Editor")
                        )
                    ] : undefined
                ),
                React.createElement(ShouldSubtreeRender, {"shouldUpdate": (false), "subtree": (() => {
                    return React.createElement(Editor, { 
                        "initialDocJson": (this.latest_pagedraw_docjson),  
                        "onChange": (this.handlePagedrawChanged),  
                        "editorOuterStyle": ({height: '100%', width: '100%'}),  
                        "defaultTopbar": (this.props.tutorial ? 'tutorial' : 'stackblitz-default'),  
                        "onStackBlitzShare": (this.handleShare)
                        });
                }
                )})
            ),

            React.createElement("div", {"className": "blitz-sb-mount-parent", "style": ({position: 'relative', width: '100%', height: '100%'})},
                (this.overlay ?
                    React.createElement("div", {"onClick": (this.hideOverlay), "style": (_l.extend({}, overlayStyles, overlayFontStyles, {display: 'flex', alignItems: 'center', justifyContent: 'space-around'}))},
                        React.createElement("div", null, "Your code"),
                        React.createElement("div", null, "Live App")
                    ) : undefined
                ),

                React.createElement(StackBlitz, {"ref": "stackblitz",  
                    "style": ({height: '100%', width: '100%'}),  
                    "sb_template": (this.sb_template),  
                    "overlayFS": (this.latest_compiled_fs),  
                    "initialFS": (this.initial_stackblitz_fs),  
                    "dependencies": (this.blitz_dependencies)
                    })
            )
        );
    },

    componentWillMount() {
        this.enableSoftUrlChangingWithoutBreakingBackButton();
        this.instanceId = String(Math.random()).slice(2);
        [this.loaded, this.loadError] = Array.from([false, false]);

        analytics.track("Opened blitz", {blitz_id: this.props.blitz_id});
        return server.loadStackBlitz(this.props.blitz_id)
        .then(initial_values => {
            this.latest_pagedraw_docjson = initial_values.pagedraw;
            this.latest_compiled_fs = initial_values.compiled;
            this.initial_stackblitz_fs = initial_values.stackblitz;
            this.blitz_dependencies = initial_values.dependencies;
            this.readme = initial_values.stackblitz["README.md"];
            this.sb_template = initial_values.sb_template;

            // old ones don't have a sb_template, but are all react
            if (this.sb_template == null) { this.sb_template = 'create-react-app'; }

            this.overlay = ((this.readme != null ? this.readme.trim().match(/__show_overlay__\n/) : undefined) != null);
            if (this.overlay) {
                this.readme = this.readme.replace(/__show_overlay__\n/, "");
                window.setTimeout(this.hideOverlay, 5000);
            }

            this.loaded = true;
            return setTimeout(() => { // we don't want errors from here hitting the catch below
                return this.forceUpdate();
            });
    }).catch(e => {
            this.loadError = true;
            return this.forceUpdate();
        });
    },

    hideOverlay() {
        this.overlay = false;
        return this.forceUpdate();
    },

    handlePagedrawChanged(docjson) {
        this.latest_pagedraw_docjson = docjson;

        analytics.track("Made change in blitz Pagedraw editor", {blitz_id: this.props.blitz_id});

        const compiled = core.compileDoc(Doc.deserialize(docjson));
        this.latest_compiled_fs = _l.fromPairs(compiled.map(({filePath, contents}) => [filePath, contents]));
        return this.forceUpdate();
    }, // push it to StackBlitz

    handleShare() {
        alert("saving fiddles is disabled");
        return;

        return this.refs.stackblitz.getSbVmState().then((...args) => {
            const [sb_fs, dependencies] = Array.from(args[0]);
            const blitz_package = {
                pagedraw: this.latest_pagedraw_docjson,
                stackblitz: sb_fs,
                compiled: this.latest_compiled_fs,
                sb_template: this.sb_template,
                dependencies
            };

            // TODO compare with initially loaded package.  Re-use url if nothing changed.

            return server.saveStackBlitz(blitz_package)

            .then(new_blitz_id => {
                analytics.track("New blitz", {blitz_id: new_blitz_id, parent_id: this.props.blitz_id});

                const new_blitz_link = `/fiddle/${new_blitz_id}`;
                this.softChangeUrl(new_blitz_link);

                return modal.show(closeHandler => [
                    React.createElement("div", {"style": ({userSelect: 'text', lineHeight: '2.4em'})},
                        React.createElement(Modal.Header, {"style": ({textAlign: 'center'})},
                            React.createElement(Modal.Title, null, "Your Fiddle was saved")
                        ),
                        React.createElement(Modal.Body, null,
                            React.createElement("p", null, "Link to this Fiddle:"),
                            React.createElement("div", {"style": ({marginBottom: 15})},
                                React.createElement(CodeShower, {"content": `https://pagedraw.io${new_blitz_link}`})
                            ),
                            React.createElement("hr", null),
                            React.createElement("p", null,
                                ("Ready to start using Pagedraw in real a codebase? "),
                                React.createElement("a", {"href": "https://documentation.pagedraw.io/install_existing/"}, `\
Learn how to use Pagedraw with git and your regular IDE or text editor.\
`)
                            )
                        ),
                        React.createElement(Modal.Footer, {"style": ({textAlign: 'center'})},
                            React.createElement("p", null, `\
Continue working and collaborate with other users in real time
by `, React.createElement("a", {"href": "/apps"}, "signing up"), " or ", React.createElement("a", {"href": "/apps"}, "logging in"), `.\
`),
                            React.createElement("a", {"href": "/apps"}, React.createElement(PdButtonOne, {"stretch": (true), "type": "primary"}, "Login"))
                        )
                    )
                ]);
        });
    })

        .catch(function(err) {
            console.error("error saving", err);
            // FIXME pop up a modal or something
            return alert("save failed");
        });
    },


    renderLoading() {
        return React.createElement("div", null);
    },

    //#

    enableSoftUrlChangingWithoutBreakingBackButton() {
        window.history.replaceState({location: window.location.toString()}, null, window.location.pathname);
        return window.onpopstate = function(evt) { let location;
        if ((location = evt.state != null ? evt.state.location : undefined) != null) { return window.location = location; } };
    },

    softChangeUrl(new_path) {
        // Change the url.  Explicitly save the current url so handleBackButton knows where to redirect to
        return window.history.pushState({location: new_path}, null, new_path);
    },

    //#

    renderReadmeOnTheSide() {
        return React.createElement(SplitPane, {"split": "vertical", "defaultSize": "400px"},
            (this.renderReadme()),
            (this.renderPDandBlitz())
        );
    },

    renderReadme() {
        let next_button;
        let readme = this.readme.trim();
        const next_fiddle_regex = /\nnext: (.*)$/;
        const next_url_regex = /\nnext-url: (.*)$/;

        const inner_next_content =
            React.createElement("div", {"style": ({display: 'flex', alignItems: 'center'})},
                React.createElement("span", {"style": ({fontSize: 16, marginRight: 12})}, "NEXT"),
                React.createElement("span", {"style": ({fontSize: 22, fontWeight: 100})}, "→")
            );

        [readme, next_button] =
            Array.from((() => {
            let next_fiddle_id, next_url;
            if ((next_fiddle_id = __guard__(readme.match(next_fiddle_regex), x => x[1])) != null) {
                next_button =
                    React.createElement("a", {"href": (next_fiddle_id), "style": ({marginTop: 50, display: 'block'})},
                        React.createElement(TextButton, {"text": (inner_next_content)})
                    );

                return [readme.replace(next_fiddle_regex, "").trim(), next_button];
            } else if ((next_url = __guard__(readme.match(next_url_regex), x1 => x1[1])) != null) {
                next_button =
                    React.createElement("a", {"href": (next_url), "style": ({marginTop: 50, display: 'block'})},
                        React.createElement(TextButton, {"text": (inner_next_content)})
                    );

                return [readme.replace(next_url_regex, "").trim(), next_button];

            } else {
                return [readme, undefined];
            }
        })());

        return React.createElement("div", {"className": "fiddle-readme-bar"},
            React.createElement("header", null,
                React.createElement("img", {"className": "pagedog-logo", "src": (`${config.static_server}/assets/favicon.png`)}),
                React.createElement("div", null,
                    React.createElement("span", {"className": "logotype"}, "Pagedraw"),
                    (" "),
                    React.createElement("span", {"className": "productname"}, "Intro")
                )
            ),
            React.createElement("div", {"className": "scroll-pane"},
                React.createElement("div", {"className": "content"},
                    (this.props.mobile ? React.createElement("h2", null, "Visit this link on a computer to try the Pagedraw editor out") : undefined),
                    React.createElement(ReactMarkdown, { 
                        "source": (readme),  
                        "escapeHtml": (false),  
                        "renderers": ({
                            code: CodeBlock,
                            link: ReadmeLink
                        })})
                ),
                ((next_button != null) ? next_button : undefined)
            )
        );
    }
});

//#

const hljs = require('highlight.js');

var ReadmeLink = createReactClass({
    render() { return React.createElement("a", {"href": (this.props.href), "target": "_blank"}, (this.props.children)); }});

var CodeBlock = createReactClass({
    render() { return React.createElement("pre", null, React.createElement("code", {"ref": "code", "className": (this.props.language)}, (this.props.value))); },
    componentDidMount() { return hljs.highlightBlock(this.refs.code); },
    shouldComponentUpdate() { return false; }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}