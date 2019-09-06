// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import createReactClass from 'create-react-class';
import ToggleIcon from './toggle-icon';

export default createReactClass({
    displayName: 'LockToggle',

    render() {
        const checkedIcon = <i className="locker material-icons md-14 md-dark">
            lock_outline
        </i>;
        var uncheckedIcon = (uncheckedIcon = <i className="locker material-icons md-14 md-dark">
            lock_open
        </i>);
        return (
            <ToggleIcon
                valueLink={this.props.valueLink}
                checkedIcon={checkedIcon}
                uncheckedIcon={uncheckedIcon} />
        );
    }
});
