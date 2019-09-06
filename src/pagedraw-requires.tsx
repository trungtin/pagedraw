// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import CodeShower from './frontend/code-shower';
import queryString from 'query-string';
import { PdButtonOne, Modal, Tabs, Tab } from './editor/component-lib';
import { track_error, assert } from './util';
import analytics from './frontend/analytics';
import { default as Dropzone } from 'react-dropzone';
import SketchImporterView from './pagedraw/sketch-importer';
import modal from './frontend/modal';
import { server } from './editor/server';
import FormControl from './frontend/form-control';
import { figma_import } from './figma-import';
import PagedrawnPricingCards from './pagedraw/pricingcards';
import config from './config';
const defaultExport = {};


defaultExport.SketchDropzone = createReactClass({
    componentWillMount() {
        this.current_state = 'none'; // | 'loading' | 'error'
        this.error_message = null; // a string, if @current_state == 'error'
        return this.import_canceler = null;
    }, // a function, if @current_state == 'loading'

    render() {
        if (config.disableFigmaSketchImport) {
            return (
                <div
                    onClick={function() { return alert("Sketch importing is only available in the Open Source version!  Check us out on Github: https://github.com/Pagedraw/pagedraw"); }}>
                    {this.props.children}
                </div>
            );
        }

        return (
            <div>
                <div className="bootstrap">
                    <div ref="modal_container" />
                </div>
                {(() => { 
                        // we do the modal_container shenanigans for bootstrap css...
                        switch (this.current_state) {
                            case 'none':
                                // no modal
                                return <Modal show={false} container={this.refs.modal_container} />;

                            case 'loading':
                                return (
                                    <Modal show={true} container={this.refs.modal_container}>
                                        <Modal.Header>
                                            <Modal.Title>
                                                Importing Sketch...
                                            </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <SketchImporterView importing={true} />
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <div style={{textAlign: 'left'}}>
                                                <PdButtonOne onClick={this.cancelImport}>
                                                    Cancel
                                                </PdButtonOne>
                                            </div>
                                        </Modal.Footer>
                                    </Modal>
                                );

                            case 'error':
                                return (
                                    <Modal show={true} container={this.refs.modal_container} onHide={this.errorOkay}>
                                        <Modal.Header>
                                            <Modal.Title>
                                                Error
                                            </Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <SketchImporterView error={this.error_message != null ? this.error_message : ""} />
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <PdButtonOne type="primary" onClick={this.errorOkay}>
                                                Okay
                                            </PdButtonOne>
                                        </Modal.Footer>
                                    </Modal>
                                );
                    
                        } })()}
                <Dropzone
                    onDrop={this.handleDrop}
                    style={{display: 'flex', flexDirection: 'column'}}>
                    {this.props.children}
                </Dropzone>
            </div>
        );
    },

    handleDrop(files) {
        assert(() => (files != null ? files.length : undefined) > 0);

        let doc_name = files[0].name;
        if (doc_name.endsWith('.sketch')) { doc_name = doc_name.slice(0, -('.sketch'.length)); }

        assert(() => this.current_state === 'none');

        this.current_state = 'loading';
        this.forceUpdate();

        // use local variable to track cancellation so it's per-run of import
        let should_cancel = false;
        this.import_canceler = () => should_cancel = true;

        return server.importFromSketch(files[0], (doc_json => {
            if (should_cancel) { return; }

            if (Object.keys(doc_json.blocks).length <= 1) { return this.showError(this.sketchImportErrorMessage, new Error('Returned empty doc')); }

            return server.createNewDoc(this.props.app.id, doc_name, this.props.app.default_language, _l.cloneDeep(doc_json))
            .then(({docRef, docjson}) => {
                return server.saveLatestSketchImportForDoc(docRef, docjson)
                .then(() => {
                    return window.location = `/pages/${docRef.page_id}`;
                });
        }).catch(e => {
                return this.showError(this.metaserverUnreachableErrorMessage, e);
            });
        }

        ), (err => {
            // Assume any non 500 error comes with a custom responseText
            return this.showError(((() => { 
                switch (err.status) {
                    case 500: return this.sketchImportErrorMessage;
                    case 0: return this.sketchServerUnavailableErrorMessage;
                    default: return err.responseText;
            
                } })()), new Error(`sketch server error ${err.status}`));
        }));
    },


    showError(msg, err) {
        assert(() => ['none', 'loading'].includes(this.current_state));

        track_error(err, msg);
        analytics.track("Sketch importer error", {msg, where: 'dashboard'});

        this.current_state = 'error';
        this.error_message = msg;
        return this.forceUpdate();
    },


    cancelImport() {
        assert(() => this.current_state === 'loading');

        // do the cancel
        if (typeof this.import_canceler === 'function') {
            this.import_canceler();
        }

        this.current_state = 'none';
        return this.forceUpdate();
    },


    errorOkay() {
        assert(() => this.current_state === 'error');

        this.current_state = 'none';
        return this.forceUpdate();
    },


    sketchImportErrorMessage: `\
We weren't able to recognize your upload as a Sketch file.

If this problem persists, please contact the Pagedraw team at team@pagedraw.io\
`,

    metaserverUnreachableErrorMessage: `\
Unable to create a new doc.

If this problem persists, please contact us at team@pagedraw.io\
`,

    sketchServerUnavailableErrorMessage: `\
Couldn't reach the server to do a Sketch import.  Please try again.

If this problem persists, please contact the Pagedraw team at team@pagedraw.io\
`
});


defaultExport.FigmaModal = createReactClass({
    componentWillMount() {
        this.show = false;
        this.import_in_flight = false;
        this.status = 'default'; // | 'loading' | 'error'
        return this.figma_url = "";
    },

    componentDidMount() {
        if (this.props.show_figma_modal) {
            this.show = true;
            return this.forceUpdate();
        }
    },

    figma_url_vl() {
        return {
            value: this.figma_url,
            requestChange: newVal => { this.figma_url = newVal; return this.forceUpdate(); }
        };
    },

    render() {
        if (config.disableFigmaSketchImport) {
            return (
                <div
                    onClick={function() { return alert("Figma importing is only available in the Open Source version!  Check us out on Github: https://github.com/Pagedraw/pagedraw"); }}>
                    {this.props.children}
                </div>
            );
        }

        if (!this.props.figma_access_token) {
            return (
                <a href={`/oauth/figma_redirect?app_id=${this.props.app.id}`}>
                    {this.props.children}
                </a>
            );
        } else {
            return (
                <div>
                    <form
                        onSubmit={evt => {
                            evt.preventDefault();


                            figma_import(this.figma_url_vl().value, this.props.figma_access_token)
                            .then(({doc_json, fileName}) => {
                                return server.createNewDoc(this.props.app.id, fileName, this.props.app.default_language, _l.cloneDeep(doc_json))
                                .then(({docRef, docjson}) => {
                                    return server.saveLatestFigmaImportForDoc(docRef, docjson)
                                    .then(() => {
                                        return window.location = `/pages/${docRef.page_id}`;
                                    });
                            }).catch(e => {
                                    throw new Error();
                                });
                        }).catch(e => {
                                return this.status = "error";
                            }).then(() => {
                                this.import_in_flight = false;
                                return this.forceUpdate();
                            });

                            this.import_in_flight = true;
                            this.status = "loading";
                            return this.forceUpdate();
                        }}>
                        <div className="bootstrap">
                            <div ref="modal_container" />
                        </div>
                        <Modal show={this.show} container={this.refs.modal_container}>
                            <Modal.Header>
                                <Modal.Title>
                                    Import from Figma
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                {this.status === "default" ?
                                    <div>
                                        <p>
                                            Paste the URL of the Figma design you'd like to import
                                        </p>
                                        <label htmlFor="figma_url">
                                            Figma link
                                        </label>
                                        <FormControl
                                            tag="input"
                                            valueLink={this.figma_url_vl()}
                                            name="figma_url"
                                            style={{width: '100%'}}
                                            placeholder="https://figma.com/file/XXXXXXXXXXXXXXXXXXXXXX/Sample-File-Name" />
                                    </div>
                                : this.status === "loading" ?
                                    <img
                                        style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
                                        src="https://ucarecdn.com/59ec0968-b6e3-4a00-b082-932b7fcf41a5/" />
                                :
                                    <p style={{color: 'red'}}>
                                        {`We weren\'t able to recognize your upload as a Figma file.

    If this problem persists, please contact the Pagedraw team at team@pagedraw.io`}
                                    </p>}
                            </Modal.Body>
                            <Modal.Footer>
                                {["default", "error"].includes(this.status) ? <PdButtonOne
                                    onClick={() => { this.show = false; this.status = "default"; return this.forceUpdate(); }}>
                                    Close
                                </PdButtonOne> : undefined}
                                {this.status === "default" ? <PdButtonOne type="primary" submit={true} disabled={this.import_in_flight}>
                                    Import
                                </PdButtonOne> : undefined}
                            </Modal.Footer>
                        </Modal>
                    </form>
                    <div onClick={() => { this.show = true; return this.forceUpdate(); }}>
                        {this.props.children}
                    </div>
                </div>
            );
        }
    }
});

defaultExport.PricingCardsWrapper = props => <div style={{position: 'relative', flexGrow: '1'}}>
    <div style={{position: 'absolute', top: 0, left: 0}}>
        <PagedrawnPricingCards />
    </div>
</div>;
export default defaultExport;
