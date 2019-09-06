// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
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
        if (this.loadError) { return <ErrorPage message="404 not found" />; }
        if (!this.loaded) { return this.renderLoading(); }

        if (this.props.mobile && (this.readme != null)) { return this.renderReadme(); }

        if (this.props.mobile) { // and we don't have a readme
            return (
                <ErrorPage
                    message="Sorry, our editor isn't optimized for mobile yet"
                    detail="Try opening this link in Chrome on a laptop or desktop!" />
            );
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

        return (
            <SplitPane split="horizontal" defaultSize="55%">
                <div style={{position: 'relative', width: '100%', height: '100%'}}>
                    {this.overlay ?
                            [
                                <div
                                    onClick={this.hideOverlay}
                                    style={_l.extend({}, overlayFontStyles, {cursor: 'pointer', zIndex: 5001, position: 'absolute', top: 30, right: 30})}>
                                    x
                                </div>,
                                <div
                                    onClick={this.hideOverlay}
                                    style={_l.extend({}, overlayStyles, overlayFontStyles, {display: 'flex', alignItems: 'center', justifyContent: 'center'})}>
                                    <div>
                                        Pagedraw Editor
                                    </div>
                                </div>
                            ] : undefined}
                    <ShouldSubtreeRender
                        shouldUpdate={false}
                        subtree={() => {
                            return (
                                <Editor
                                    initialDocJson={this.latest_pagedraw_docjson}
                                    onChange={this.handlePagedrawChanged}
                                    editorOuterStyle={{height: '100%', width: '100%'}}
                                    defaultTopbar={this.props.tutorial ? 'tutorial' : 'stackblitz-default'}
                                    onStackBlitzShare={this.handleShare} />
                            );
                        }} />
                </div>
                <div
                    className="blitz-sb-mount-parent"
                    style={{position: 'relative', width: '100%', height: '100%'}}>
                    {this.overlay ?
                            <div
                                onClick={this.hideOverlay}
                                style={_l.extend({}, overlayStyles, overlayFontStyles, {display: 'flex', alignItems: 'center', justifyContent: 'space-around'})}>
                                <div>
                                    Your code
                                </div>
                                <div>
                                    Live App
                                </div>
                            </div> : undefined}
                    <StackBlitz
                        ref="stackblitz"
                        style={{height: '100%', width: '100%'}}
                        sb_template={this.sb_template}
                        overlayFS={this.latest_compiled_fs}
                        initialFS={this.initial_stackblitz_fs}
                        dependencies={this.blitz_dependencies} />
                </div>
            </SplitPane>
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
                    <div style={{userSelect: 'text', lineHeight: '2.4em'}}>
                        <Modal.Header style={{textAlign: 'center'}}>
                            <Modal.Title>
                                Your Fiddle was saved
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>
                                Link to this Fiddle:
                            </p>
                            <div style={{marginBottom: 15}}>
                                <CodeShower content={`https://pagedraw.io${new_blitz_link}`} />
                            </div>
                            <hr />
                            <p>
                                {"Ready to start using Pagedraw in real a codebase? "}
                                <a href="https://documentation.pagedraw.io/install_existing/">
                                    {`\
    Learn how to use Pagedraw with git and your regular IDE or text editor.\
    `}
                                </a>
                            </p>
                        </Modal.Body>
                        <Modal.Footer style={{textAlign: 'center'}}>
                            <p>
                                {`\
    Continue working and collaborate with other users in real time
    by `}
                                <a href="/apps">
                                    signing up
                                </a>
                                {" or "}
                                <a href="/apps">
                                    logging in
                                </a>
                                {`.\
    `}
                            </p>
                            <a href="/apps">
                                <PdButtonOne stretch={true} type="primary">
                                    Login
                                </PdButtonOne>
                            </a>
                        </Modal.Footer>
                    </div>
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
        return <div />;
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
        return (
            <SplitPane split="vertical" defaultSize="400px">
                {this.renderReadme()}
                {this.renderPDandBlitz()}
            </SplitPane>
        );
    },

    renderReadme() {
        let next_button;
        let readme = this.readme.trim();
        const next_fiddle_regex = /\nnext: (.*)$/;
        const next_url_regex = /\nnext-url: (.*)$/;

        const inner_next_content =
            <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={{fontSize: 16, marginRight: 12}}>
                    NEXT
                </span>
                <span style={{fontSize: 22, fontWeight: 100}}>
                    →
                </span>
            </div>;

        [readme, next_button] =
            Array.from((() => {
            let next_fiddle_id, next_url;
            if ((next_fiddle_id = __guard__(readme.match(next_fiddle_regex), x => x[1])) != null) {
                next_button =
                    <a href={next_fiddle_id} style={{marginTop: 50, display: 'block'}}>
                        <TextButton text={inner_next_content} />
                    </a>;

                return [readme.replace(next_fiddle_regex, "").trim(), next_button];
            } else if ((next_url = __guard__(readme.match(next_url_regex), x1 => x1[1])) != null) {
                next_button =
                    <a href={next_url} style={{marginTop: 50, display: 'block'}}>
                        <TextButton text={inner_next_content} />
                    </a>;

                return [readme.replace(next_url_regex, "").trim(), next_button];

            } else {
                return [readme, undefined];
            }
        })());

        return (
            <div className="fiddle-readme-bar">
                <header>
                    <img
                        className="pagedog-logo"
                        src={`${config.static_server}/assets/favicon.png`} />
                    <div>
                        <span className="logotype">
                            Pagedraw
                        </span>
                        {" "}
                        <span className="productname">
                            Intro
                        </span>
                    </div>
                </header>
                <div className="scroll-pane">
                    <div className="content">
                        {this.props.mobile ? <h2>
                            Visit this link on a computer to try the Pagedraw editor out
                        </h2> : undefined}
                        <ReactMarkdown
                            source={readme}
                            escapeHtml={false}
                            renderers={{
                                code: CodeBlock,
                                link: ReadmeLink
                            }} />
                    </div>
                    {(next_button != null) ? next_button : undefined}
                </div>
            </div>
        );
    }
});

//#

const hljs = require('highlight.js');

var ReadmeLink = createReactClass({
    render() { return (
        <a href={this.props.href} target="_blank">
            {this.props.children}
        </a>
    ); }});

var CodeBlock = createReactClass({
    render() { return (
        <pre>
            <code ref="code" className={this.props.language}>
                {this.props.value}
            </code>
        </pre>
    ); },
    componentDidMount() { return hljs.highlightBlock(this.refs.code); },
    shouldComponentUpdate() { return false; }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}