/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import _l from 'lodash';
import $ from 'jquery';
import analytics from '../frontend/analytics';
import config from '../config';
import { server } from '../editor/server';
import { Doc } from '../doc';
import modal from '../frontend/modal';
import { Modal, Button } from "react-bootstrap";
import { recommended_pagedraw_json_for_app_id } from '../recommended_pagedraw_json';
import PagedrawnDashboard from '../pagedraw/meta-app-index-view';

export default createReactClass({
    getInitialState() {
        return {collaboratorField: '', pageField: '', app: window.pd_params.app != null ? window.pd_params.app : _l.first(window.pd_params.apps)};
    },

    render() {
        const props = _l.extend({}, this, this.props, this.state, {
            pagedrawJsonBody: recommended_pagedraw_json_for_app_id(this.state.app.id, 'src/pagedraw'),
            figma_importing: true
        });
        return React.createElement(PagedrawnDashboard, Object.assign({},  props ));
    },

    handleAppChanged(id) {
        return $.get(`/apps/${id}.json`, data => {
            return this.setState({
                app : data});
        });
    },

    handleCollaboratorSubmit() {
        return $.post(`/apps/${this.state.app.id}/collaborators.json`, {app: {collaborator: this.state.collaboratorField, name: this.state.app.name}}, data => {
            analytics.track('Added collaborator', {app: {name: this.state.app.name, id: this.state.app.id}, collaborator: {email: this.state.collaboratorField}});

            return this.setState({
                app: _l.extend({}, this.state.app, {users: data}),
                collaboratorField: ''
            });
        });
    },

    handleNewDoc() {
        const fresh_docjson = new Doc({blocks: []}).serialize();
        return server.createNewDoc(this.state.app.id, 'Untitled', this.state.app.default_language, fresh_docjson).then(({docRef}) => {
            return window.location = `/pages/${docRef.page_id}`;
        });
    },

    handlePageSubmit() {
        const fresh_docjson = new Doc({blocks: []}).serialize();
        return server.createNewDoc(this.state.app.id, this.state.pageField, this.state.app.default_language, fresh_docjson).then(({docRef, metaserver_rep}) => {
            return this.setState({
                app: _l.extend({}, this.state.app, {pages: this.state.app.pages.concat([metaserver_rep])}),
                pageField: ''
            });
        });
    },


    handleCollaboratorDelete(id) {
        return $.ajax({url: `/apps/${this.state.app.id}/collaborators/${id}.json`, method:"DELETE"}).done(data => {
            const collaborator = _l.find(this.state.app.users, {id});
            analytics.track('Deleted collaborator', {app: {name: this.state.app.name, id: this.state.app.id}, collaborator: {id, email: collaborator.email}});

            return this.setState({
                app: _l.extend({}, this.state.app, {users: data})});
    });
    },

    edit_page_path(page) { return `/pages/${page.id}`; },

    logout() {
        return server.logOutAndRedirect();
    },

    handlePageDelete(page) {
        return modal.show(closeHandler => [
            React.createElement(Modal.Header, null,
                React.createElement(Modal.Title, null, "Confirm Deletion")
            ),
            React.createElement(Modal.Body, null,
                React.createElement("p", null, "Are you sure you want to delete the page ", React.createElement("code", null, (page.url)))
            ),
            React.createElement(Modal.Footer, null,
                React.createElement(Button, {"style": ({float: 'left'}), "onClick": (closeHandler)}, "Cancel"),
                React.createElement(Button, {"bsStyle": "danger", "children": "Delete", "onClick": (() => {
                    return $.ajax({url: `/pages/${page.id}.json`, method:"DELETE", data: {app_id: this.state.app.id}}).done(data => {
                        analytics.track('Deleted doc', {app: {name: this.state.app.name, id: this.state.app.id}, doc: {name: page.url, id: page.id}});
                        this.setState({app: _l.extend({}, this.state.app, {pages: data})});
                        return closeHandler();
                });
                }
                )})
            )
        ]);
    }});
