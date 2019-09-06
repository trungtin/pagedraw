// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
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
        return (
            <div>
                <Helmet>
                    <link
                        rel="stylesheet"
                        type="text/css"
                        href={`${window.pd_config.static_server}/library.css`} />
                    <link
                        rel="stylesheet"
                        href={`${window.pd_config.static_server}/bootstrap-namespaced.css`} />
                </Helmet>
                <div>
                    <ModalComponent ref="modal" />
                    <Route {...window.pd_params} />
                </div>
            </div>
        );
    },

    componentDidMount() {
        return registerModalSingleton(this.refs.modal);
    }
});

ReactDOM.render(<AppWrapper route={window.pd_params.route} />, document.getElementById('app'));
