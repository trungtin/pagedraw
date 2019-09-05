// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import _l from 'lodash';
import CL from './editor/component-lib';
import createReactClass from 'create-react-class';

//FIXME: Having .txt copies of these files just for the sake of webpack loading is a huge hack
import editor_css from './editor-css.txt';

import bootstrap_css from './bootstrap-css.txt';

const Enum = options => (({__ty: 'Enum', options}));

const PdButtonOne = createReactClass({
    render() {
        return React.createElement("div", {"className": "bootstrap"},
            React.createElement(CL.PdButtonOne, Object.assign({},  this.props, {"stretch": (true)}))
        );
    }
});

PdButtonOne.pdResizable = ['width'];
PdButtonOne.pdPropControls = {'children': 'Text', disabled: 'Boolean', type: Enum(['default', 'primary', 'success', 'info', 'warning', 'danger', 'link'])};

const defaultExport = {};

defaultExport.default = {
    PdButtonOne
};
export default defaultExport;
