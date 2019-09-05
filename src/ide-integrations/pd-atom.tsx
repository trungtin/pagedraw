/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import createReactClass from 'create-react-class';
import _l from 'lodash';
import { Editor } from '../editor/edit-page';
import { Doc } from '../doc';


const atom_rpc_send = data => // atom can pick up console messages
console.log("atomrpc:" + JSON.stringify(data));

export default createReactClass({
    componentWillMount() {
        this.loaded = false;
        window.__atom_rpc_recv = this.atom_rpc_recv;
        return atom_rpc_send({msg: "ready"});
    },

    render() {
        if (!this.loaded) { return React.createElement("div", null); }
        return React.createElement(Editor, { 
            "initialDocJson": (this.initialDocjson),  
            "onChange": (this.handleDocjsonChanged)
            });
    },

    handleDocjsonChanged(docjson) {
        return atom_rpc_send({msg: "write", fileContents: JSON.stringify(docjson)});
    },

    atom_rpc_recv(data) {
        switch (data.msg) {
            case 'load':
                this.loaded = true;
                this.initialDocjson =
                    data.fileContents !== "" 
                    ? JSON.parse(data.fileContents) 
                    : new Doc().serialize();
                return this.forceUpdate();
        }
    }
});




