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
                React.createElement(Modal.Header, null,
                    React.createElement(Modal.Title, null, "About to refresh")
                ),
                React.createElement(Modal.Body, null, `\
The changes you did require a refresh. Closing this window will refresh the screen.\
`),
                React.createElement(Modal.Footer, null,
                    React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Ok")
                )
            ]), () => window.location = window.location));
        }
    }
};

