// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import { Modal, PdButtonOne } from '../editor/component-lib';
import modal from './modal';

export default (data, callback) => modal.show((closeHandler => [
    React.createElement(Modal.Header, {"closeButton": true},
        React.createElement(Modal.Title, null, (data.title != null ? data.title : 'Are you sure?'))
    ),
    React.createElement(Modal.Body, null,
        (data.body)
    ),
    React.createElement(Modal.Footer, null,
        React.createElement(PdButtonOne, {"onClick": (closeHandler)}, (data.no != null ? data.no : 'Back')),
        React.createElement(PdButtonOne, {"type": (data.yesType != null ? data.yesType : "primary"), "onClick"() { callback(); return closeHandler(); }}, (data.yes != null ? data.yes : 'Yes'))
    )
]), (function() {}));
