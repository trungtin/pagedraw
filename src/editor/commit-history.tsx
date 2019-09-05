/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let HistoryView;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';
import FormControl from '../frontend/form-control';
import { Model } from '../model';
import { Doc } from '../doc';
import { server, CommitRef } from './server';
import config from '../config';
const defaultExport = {};

defaultExport.HistoryView = (HistoryView = createReactClass({
    linkState(attr) {
        return {
            value: this.state[attr],
            requestChange: nv => {
                return this.setState({[attr]: nv});
            }
        };
    },

    getInitialState() {
        return {commitMessage: ''};
    },

    render() {
        const ByLineFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"';
        // ByLineFont = 'Helvetica'
        // ByLineFont = 'Open Sans'
        const commitRefs = server.getCommitRefsAsync(this.props.docRef);

        return React.createElement("div", null,
            React.createElement("div", {"style": ({marginBottom: 10})},
                React.createElement(FormControl, {"tag": "textarea", "style": ({width: '100%'}), "placeholder": "Commit message", "type": "text", "valueLink": (this.linkState('commitMessage'))}),
                React.createElement("button", {"style": ({width: '100%'}), "disabled": (_l.isEmpty(this.state.commitMessage)), "onClick": (this.commit)}, "Commit")
            ),

            (commitRefs != null ? commitRefs.map(commit => {
                return React.createElement("div", {"key": (commit.uniqueKey), "style": ({marginTop: '1.3em', marginBottom: '1.3em'})},
                    (config.diffView ? React.createElement("button", {"onClick": (() => this.showDiff(commit)), "style": ({float: 'right', marginLeft: '0.2em', height: '2.4em', fontSize: '0.7em', border: 'none'})}, `\
Show Diff\
`) : undefined),
                    React.createElement("button", {"onClick": (() => this.restore(commit)), "style": ({float: 'right', marginLeft: '0.2em', height: '2.4em', fontSize: '0.7em', border: 'none'})}, `\
Restore\
`),
                    React.createElement("div", {"style": ({fontFamily: 'Helvetica', fontWeight: 'bold', fontSize: '1.1em'})},
                        (commit.message)
                    ),
                    React.createElement("div", {"style": ({clear: 'both', fontFamily: ByLineFont, fontWeight: '300', fontSize: '0.8em', marginBottom: '0.4em'})},
                        (moment(commit.timestamp).fromNow()), " by ", React.createElement("span", {"style": ({fontWeight: 'bold'})}, (commit.authorName))
                    )
                );
            }) : undefined)
        );
    },

    commit() {
        // FIXME: timestamp should actually come from the server once the serializedDoc is saved
        const commit = new CommitRef({
            message: this.state.commitMessage,
            authorId: this.props.user.id,
            authorName: this.props.user.name,
            authorEmail: this.props.user.email,
            timestamp: new Date().getTime()
        });
        this.setState({commitMessage: ''});

        // Callback does nothing since onChange is already called in server.getCommitRefs while watching the commit refs
        return server.saveCommit(this.props.docRef, commit, this.props.doc.serialize(), (function() {}));
    },

    showDiff(commit_ref) {
        return server.getCommit(this.props.docRef, commit_ref).then(serializedDoc => {
            return this.props.showDocjsonDiff(serializedDoc);
        });
    },

    restore(commit_ref) {
        return server.getCommit(this.props.docRef, commit_ref).then(serializedDoc => {
            try {
                // This could be flakey if we failed to correctly do a migration or something
                return this.props.setDocJson(serializedDoc);
            } catch (error) {
                // FIXME this should only catch if the deserialize fails, and not otherwise.  It can actually be
                // really dangerous to silently ignore other failures.
                // let the user know we bailed.  Should really be nicer than an alert(), but this should
                // never happen.
                // Should also do this if getting the doc from firebase fails
                return alert("[error] couldn't restore doc");
            }
        });
    }
}));

export default defaultExport;

