// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LibraryTheme;
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import { server } from '../../editor/server';
import { LibraryAutoSuggest } from '../../frontend/autosuggest-library';

export default LibraryTheme = createReactClass({
    value: '',
    suggestions: [],

    showLogout: false,

    renderSuggestion(suggestion) {
        if (suggestion.isVersion) {
            return (
                <span>
                    {`${suggestion.lib_name} v${suggestion.name}`}
                </span>
            );
        } else {
            return (
                <span>
                    {suggestion.name}
                </span>
            );
        }
    },

    render() {
        return (
            <div style={{fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'}}>
                <div style={{minHeight: 'calc(100vh - 80px)'}}>
                    <div style={{backgroundColor: '#2B2B58', height: '80px', width: '100%'}}>
                        <div
                            style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '80%', margin: '0 auto', height: '80px'}}>
                            <div
                                className="bootstrap"
                                style={{height: '100%', width: '70%', flex: '4 2 1', display: 'flex'}}>
                                <img
                                    src="https://ucarecdn.com/f8b3ff29-bde2-4e98-b67e-bfa1f4cfbe04/"
                                    style={{maxWidth: '100%', maxHeight: '100%', flex: '1 1 1'}} />
                                <div style={{marginBottom: 10, alignSelf: 'flex-end', flexGrow: 2}}>
                                    <LibraryAutoSuggest
                                        focusOnMount={false}
                                        textColor="white"
                                        onChange={() => this.forceUpdate(() => {})} />
                                </div>
                            </div>
                            {this.props.current_user ?
                                    <div>
                                        <div
                                            onClick={() => { this.showLogout = !this.showLogout; return this.forceUpdate(); }}
                                            style={{
                                                height: 60,
                                                width: 60,
                                                borderRadius: 100,
                                                backgroundColor: '#77DFC2',
                                                color: '#2B2B58',
                                                fontSize: 25,

                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flex: '1 1 1',
                                                cursor: 'pointer'
                                                }}>
                                            <p>
                                                {this.props.current_user.name.split(' ').map(name => name[0].toUpperCase())}
                                            </p>
                                        </div>
                                        {this.showLogout ? <div
                                            style={{position: 'absolute', backgroundColor: 'white', width: 100, cursor: 'pointer', borderRadius: 10, textAlign: 'center'}}
                                            className="signout"
                                            onClick={() => server.logOutAndRedirect()}>
                                            Log out
                                        </div> : undefined}
                                    </div>
                                 :
                                    <div className="bootstrap">
                                        <a href="/users/sign_out" className="btn btn-default">
                                            Sign In
                                        </a>
                                    </div>}
                        </div>
                    </div>
                    <div style={{backgroundColor: '#F1F1F1', height: 65, width: '100%'}}>
                        <div
                            style={{width: '80%', margin: '0 auto', display: 'flex', height: '100%', alignItems: 'flex-end'}}>
                            <a
                                href="https://documentation.pagedraw.io/"
                                style={{padding: 10, fontSize: 16, color: '#313131', textDecoration: 'none'}}>
                                Documentation
                            </a>
                            <a
                                href="/tutorials/basics"
                                style={{padding: 10, fontSize: 16, color: '#313131', textDecoration: 'none'}}>
                                Tutorial
                            </a>
                            <a
                                href="/"
                                style={{padding: 10, fontSize: 16, color: '#313131', textDecoration: 'none'}}>
                                What is Pagedraw
                            </a>
                        </div>
                    </div>
                    {this.props.children}
                </div>
                <div style={{backgroundColor: '#2B2B58', height: '80px', width: '100%'}}>
                    <img
                        src="https://ucarecdn.com/f8b3ff29-bde2-4e98-b67e-bfa1f4cfbe04/"
                        style={{maxWidth: '100%', maxHeight: '100%', float: 'right'}} />
                </div>
            </div>
        );
    }
});
