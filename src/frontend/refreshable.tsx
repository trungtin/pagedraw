// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Refreshable;
import React from 'react';
import { Modal, PdButtonOne } from '../editor/component-lib';
import modal from '../frontend/modal';

// FIXME: Maybe should be a mixin?
export default Refreshable = class Refreshable {
    constructor() {
        this.willRefresh = false;
    }

    needsRefresh() { return this.willRefresh = true; }

    refreshIfNeeded() {
        if (this.willRefresh) {
            return window.requestAnimationFrame(() => modal.show((closeHandler => [
                <Modal.Header>
                    <Modal.Title>
                        About to refresh
                    </Modal.Title>
                </Modal.Header>,
                <Modal.Body>
                    {`\
    The changes you did require a refresh. Closing this window will refresh the screen.\
    `}
                </Modal.Body>,
                <Modal.Footer>
                    <PdButtonOne type="primary" onClick={closeHandler}>
                        Ok
                    </PdButtonOne>
                </Modal.Footer>
            ]), () => window.location = window.location));
        }
    }
};

