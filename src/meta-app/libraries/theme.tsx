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
            return React.createElement("span", null, (`${suggestion.lib_name} v${suggestion.name}`));
        } else {
            return React.createElement("span", null, (suggestion.name));
        }
    },

    render() {
        return React.createElement("div", {"style": ({fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif'})},
            React.createElement("div", {"style": ({minHeight: 'calc(100vh - 80px)'})},
                React.createElement("div", {"style": ({backgroundColor: '#2B2B58', height: '80px', width: '100%'})},
                    React.createElement("div", {"style": ({display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '80%', margin: '0 auto', height: '80px'})},
                        React.createElement("div", {"className": "bootstrap", "style": ({height: '100%', width: '70%', flex: '4 2 1', display: 'flex'})},
                            React.createElement("img", {"src": ('https://ucarecdn.com/f8b3ff29-bde2-4e98-b67e-bfa1f4cfbe04/'), "style": ({maxWidth: '100%', maxHeight: '100%', flex: '1 1 1'})}),
                            React.createElement("div", {"style": ({marginBottom: 10, alignSelf: 'flex-end', flexGrow: 2})},
                                React.createElement(LibraryAutoSuggest, {"focusOnMount": (false), "textColor": ('white'), "onChange": (() => this.forceUpdate(() => {}))})
                            )
                        ),
                        (this.props.current_user ?
                            React.createElement("div", null,
                                React.createElement("div", {"onClick": (() => { this.showLogout = !this.showLogout; return this.forceUpdate(); }), "style": ({
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
                                    })}, React.createElement("p", null, (this.props.current_user.name.split(' ').map(name => name[0].toUpperCase())))
                                ),
                                (this.showLogout ? React.createElement("div", {"style": ({position: 'absolute', backgroundColor: 'white', width: 100, cursor: 'pointer', borderRadius: 10, textAlign: 'center'}), "className": ('signout'), "onClick": (() => server.logOutAndRedirect())}, "Log out") : undefined)
                            )
                         :
                            React.createElement("div", {"className": 'bootstrap'},
                                React.createElement("a", {"href": ('/users/sign_out'), "className": ('btn btn-default')}, "Sign In")
                            )
                        )
                    )
                ),
                React.createElement("div", {"style": ({backgroundColor: '#F1F1F1', height: 65, width: '100%'})},
                    React.createElement("div", {"style": ({width: '80%', margin: '0 auto', display: 'flex', height: '100%', alignItems: 'flex-end'})},
                        React.createElement("a", {"href": ('https://documentation.pagedraw.io/'), "style": ({padding: 10, fontSize: 16, color: '#313131', textDecoration: 'none'})}, "Documentation"),
                        React.createElement("a", {"href": ('/tutorials/basics'), "style": ({padding: 10, fontSize: 16, color: '#313131', textDecoration: 'none'})}, "Tutorial"),
                        React.createElement("a", {"href": ('/'), "style": ({padding: 10, fontSize: 16, color: '#313131', textDecoration: 'none'})}, "What is Pagedraw")
                    )
                ),

                (this.props.children)
            ),

            React.createElement("div", {"style": ({backgroundColor: '#2B2B58', height: '80px', width: '100%'})},
                React.createElement("img", {"src": ('https://ucarecdn.com/f8b3ff29-bde2-4e98-b67e-bfa1f4cfbe04/'), "style": ({maxWidth: '100%', maxHeight: '100%', float: 'right'})})
            )
        );
    }
});
