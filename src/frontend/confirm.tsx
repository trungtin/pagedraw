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
    <Modal.Header closeButton={true}>
        <Modal.Title>
            {data.title != null ? data.title : 'Are you sure?'}
        </Modal.Title>
    </Modal.Header>,
    <Modal.Body>
        {data.body}
    </Modal.Body>,
    <Modal.Footer>
        <PdButtonOne onClick={closeHandler}>
            {data.no != null ? data.no : 'Back'}
        </PdButtonOne>
        <PdButtonOne
            type={data.yesType != null ? data.yesType : "primary"}
            onClick={function() { callback(); return closeHandler(); }}>
            {data.yes != null ? data.yes : 'Yes'}
        </PdButtonOne>
    </Modal.Footer>
]), (function() {}));
