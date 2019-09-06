// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let showConfigEditorModal;
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, PdButtonOne } from '../editor/component-lib';
import modal from './modal';
import FormControl from './form-control';
const defaultExport = {};

defaultExport.ConfigEditor = createReactClass({
    linkState(attr) {
        return {
            value: this.state[attr],
            requestChange: nv => {
                return this.setState({[attr]: nv});
            }
        };
    },
        
    displayName: "ConfigEditor",

    render() {
        return (
            <form onSubmit={this.updateConfig}>
                <FormControl
                    tag="textarea"
                    style={{width: '100%', height: '8em', fontFamily: 'monospace'}}
                    valueLink={this.linkState('updated_config')} />
                <button style={{float: 'right', marginBottom: '3em'}}>
                    Update config
                </button>
            </form>
        );
    },

    getInitialState() {
        return {updated_config: window.localStorage.config};
    },

    updateConfig() {
        window.localStorage.config = this.state.updated_config;
        // for some reason this only works with a timeout...
        return window.setTimeout(() => window.location.reload());
    }
});


defaultExport.showConfigEditorModal = (showConfigEditorModal = function() {
        let updated_config = window.localStorage.config;

        return modal.show(closeHandler => { return [
            <Modal.Header closeButton={true}>
                <Modal.Title>
                    Set config flags
                </Modal.Title>
            </Modal.Header>,
            <Modal.Body>
                <FormControl
                    tag="textarea"
                    style={{width: '100%', height: '60vh', fontFamily: 'monospace'}}
                    valueLink={{
                        value: updated_config,
                        requestChange: nv => { updated_config = nv; return modal.forceUpdate(); }
                    }} />
            </Modal.Body>,
            <Modal.Footer>
                <PdButtonOne onClick={closeHandler}>
                    Close
                </PdButtonOne>
                <PdButtonOne
                    type="primary"
                    onClick={() => {
                        window.localStorage.config = updated_config;
                        return window.setTimeout(() => window.location.reload());
                    }}>
                    Update
                </PdButtonOne>
            </Modal.Footer>
        ]; });
    });

export default defaultExport;

// let us open the config editor from the devtools console
window.__openConfigEditor = showConfigEditorModal;
