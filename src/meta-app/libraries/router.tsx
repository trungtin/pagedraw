/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import ReactDOM from 'react-dom';
import _l from 'lodash';
import { Helmet } from 'react-helmet';
import { ModalComponent, registerModalSingleton } from '../../frontend/modal';
import createReactClass from 'create-react-class';


const pages = {
    library_landing() { return require('./landing'); },
    library_page() { return require('./show'); }
};

const AppWrapper = createReactClass({
    render() {
        const Route = pages[this.props.route]();
        return React.createElement("div", null,
            React.createElement(Helmet, null,
                React.createElement("link", {"rel": "stylesheet", "type": "text/css", "href": `${window.pd_config.static_server}/library.css`}),
                React.createElement("link", {"rel": "stylesheet", "href": `${window.pd_config.static_server}/bootstrap-namespaced.css`})
            ),
            React.createElement("div", null,
                React.createElement(ModalComponent, {"ref": "modal"}),
                React.createElement(Route, Object.assign({},  window.pd_params ))
            )
        );
    },

    componentDidMount() {
        return registerModalSingleton(this.refs.modal);
    }
});

ReactDOM.render(React.createElement(AppWrapper, {"route": (window.pd_params.route)}), document.getElementById('app'));
