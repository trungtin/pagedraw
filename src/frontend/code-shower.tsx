// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let CodeShower;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import SelectOnClick from './select-on-click';

export default CodeShower = createReactClass({
    displayName: 'CodeShower',
    render() {
        return (
            <SelectOnClick>
                <pre {...this.props}>
                    {this.props.content}
                </pre>
            </SelectOnClick>
        );
    }
});
