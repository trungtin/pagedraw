// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let StackBlitz;
import React from 'react';
import createReactClass from 'create-react-class';
import _l from 'lodash';
import { zip_dicts } from '../util';
import { default as StackBlitzSDK } from '@stackblitz/sdk'; // ES6 `export default` makes us require(...).default

export default StackBlitz = createReactClass({
    render() {
        return React.createElement("div", {"ref": "sb_mount_node", "style": (_l.extend({}, this.props.style, {
                overflow: 'hidden',
                height: '100%'
                // overflow:hidden + funky height are to hide stackblitz bar on the bottom
            }))},
            React.createElement("div", {"ref": (node => { return this.node = node; })})
        );
    },

    componentWillMount() {
        this.stackBlitzConnector = null; // null if not loaded | StackBlitzVM
        this.sbStatus = 'not-loaded'; // | 'ready' | 'update-pending' | 'read-pending'
        this.currentOverlayFS = {};
        return this.pendingReads = [];
    },

    componentDidMount() {
        this.currentOverlayFS = _l.clone(this.props.overlayFS);
        const project = {
            title: "Pagedraw blitz",
            files: _l.extend({}, this.props.initialFS, this.currentOverlayFS),
            description: "Pagedraw blitz",
            template: this.props.sb_template,
            dependencies: this.props.dependencies
        };

        let embedOptions = {
            height: '100%',
            forceEmbedLayout: true
        };

        // Show preview only on small screen widths. Ofc this won't work on screen resizing
        if (window.innerWidth <= '1024') { embedOptions =  _l.extend({}, {view: 'preview'}, embedOptions); }

        return StackBlitzSDK.embedProject(this.node, project, embedOptions)
            .then(conn => {
                this.stackBlitzConnector = conn;
                this.sbStatus = 'ready';
                return this.runSync();
        });
    },

    componentDidUpdate() {
        return this.runSync();
    },

    getSbVmState() {
        // FIXME need a way to throw instead of hang
        return new Promise((resolve, reject) => {
            this.pendingReads.push(resolve);
            return this.runSync();
        });
    },

    computeDiff(old_fs, new_fs) {
        let filepath;
        return {
            create: _l.pickBy(new_fs, (new_contents, filepath) => old_fs[filepath] !== new_contents),
            destroy: ((() => {
                const result = [];
                for (filepath in old_fs) {
                    const contents = old_fs[filepath];
                    if (!new_fs[filepath]) {
                        result.push(filepath);
                    }
                }
                return result;
            })())
        };
    },

    runSync() {
        if (this.sbStatus !== 'ready') { return; }

        const diff = this.computeDiff(this.currentOverlayFS, this.props.overlayFS);

        // if there are writes to do, do them
        if (!_l.isEmpty(diff.create) || !_l.isEmpty(diff.destroy)) {

            let inFlightOverlayFS;
            [this.sbStatus, inFlightOverlayFS] = Array.from(['update-pending', _l.clone(this.props.overlayFS)]);

            return this.stackBlitzConnector.applyFsDiff(diff).then(() => {

                [this.sbStatus, this.currentOverlayFS] = Array.from(['ready', inFlightOverlayFS]);

                // in case there are queued changes
                return this.runSync();
            });


        // if there are reads to do, and no writes, do the reads.  Prioritize them below writes.
        } else if (this.pendingReads.length > 0) {

            this.sbStatus = 'read-pending';

            return this.stackBlitzConnector.getFsSnapshot().then(sb_fs_state => {
                return this.stackBlitzConnector.getDependencies().then(dependencies => {
                    const non_overlay_fs = _l.omit(sb_fs_state, _l.keys(this.currentOverlayFS));
                    for (let pendingRead of Array.from(this.pendingReads)) { pendingRead([non_overlay_fs, dependencies]); }
                    [this.pendingReads, this.sbStatus] = Array.from([[], 'ready']);
                    return this.runSync();
                });
            });
        }
    }
});


