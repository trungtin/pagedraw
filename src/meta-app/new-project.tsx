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
import analytics from '../frontend/analytics';
import config from '../config';
import { server } from '../editor/server';
import PagedrawnView from '../pagedraw/meta-app-new-project';

export default createReactClass({
    getInitialState() { return {
        name: this.props.initial_name,
        framework: 'JSX',
        collaborators: [{email: this.props.current_user.email, is_me: true}],
        collaboratorField: '',
        apps: this.props.apps
    }; },

    render() {
        return React.createElement("div", {"style": ({
            // We need this extra CSS gross hacks because the compiler has some issues, I think.
            // Alternatively, .app should always have this on it.  Not sure, but don't want to make such a
            // potentially dangerous change right now.
            display: 'flex',
            flexGrow: '1'
        })},
            React.createElement(PagedrawnView, { 
                "current_user": (this.props.current_user),  
                "logout": (this.logout),  

                "apps": (this.state.apps),  
                "handleAppChanged": (app_id => {
                    return window.location = `/apps/${app_id}`;
                }
                ),  

                "projectNameField": (this.state.name),  
                "handleProjectNameChange": (new_name => this.setState({name: new_name})),  

                "angular_support": (config.angular_support),  
                "framework": (this.state.framework),  
                "handleFrameworkChange": (new_val => this.setState({framework: new_val})),  

                "collaborators": (this.state.collaborators),  
                "handleCollaboratorDelete": (email => {
                    return this.setState({collaborators: this.state.collaborators.filter(c => c.email !== email)});
                }
                ),  

                "newCollaboratorField": (this.state.collaboratorField),  
                "handleNewCollaboratorChanged": (new_val => this.setState({collaboratorField: new_val})),  
                "handleAddCollaborator": (() => {
                    // no-op if the field is empty
                    if (this.state.collaboratorField === '') { return; }

                    // don't allow duplicates
                    if (_l.find(this.state.collaborators.filter(c => c.email === this.state.collaboratorField)) != null) {
                        this.setState({collaboratorField: ''});
                        return;
                    }

                    return this.setState({
                        collaborators: this.state.collaborators.concat({email: this.state.collaboratorField, is_me: false}),
                        collaboratorField: ''
                    });
                }
                ),  

                "handleSubmit": (this.handleSubmit)

                })
        );
    },

    logout() {
        return server.logOutAndRedirect();
    },

    handleSubmit() {
        // do a classic html form submit.  In fact, this whole thing should be one big form...
        return server.createProjectAndRedirect({
            name: this.state.name,
            framework: this.state.framework,
            collaborators_emails: _l.map(this.state.collaborators, 'email')
        });
    }
});
