// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import util from '../util';
import { server } from './server';
import { default as Dropzone } from 'react-dropzone';
import SketchImporterView from '../pagedraw/sketch-importer';
import analytics from '../frontend/analytics';

export default createReactClass({
    getInitialState() {
        return {
            importing: false,
            error: undefined
        };
    },

    render() {
        return (
            <Dropzone
                onDrop={this.handleDrop}
                style={{display: 'flex', flexDirection: 'column'}}>
                <SketchImporterView error={this.state.error} importing={this.state.importing} />
            </Dropzone>
        );
    },

    handleDrop(files) {
        util.assert(() => (files != null ? files.length : undefined) > 0);
        this.setState({importing: true});

        return server.importFromSketch(files[0], (doc_json => {
            if (Object.keys(doc_json.blocks).length <= 1) { return this.showError(); }
            this.setState({importing: false});
            return this.props.onImport(doc_json);
        }),
        err => this.showError());
    },

    showError() {
        analytics.track("Sketch importer error", {where: 'editor'});
        return this.setState({error: true});
    }
});

