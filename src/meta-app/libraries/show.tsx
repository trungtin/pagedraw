// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LibraryPage;
import React from 'react';
import _l from 'lodash';
import $ from 'jquery';
import ReactMarkdown from 'react-markdown';
import moment from 'moment';
import LibraryTheme from './theme';
import modal from '../../frontend/modal';
import { Modal } from '../../editor/component-lib';
import FormControl from '../../frontend/form-control';
import createReactClass from 'create-react-class';

export default LibraryPage = createReactClass({
    displayName: 'LibraryPage',
    componentDidMount() {
        this.changelogOpen = false;
        return this.readmeState = this.props.readme;
    },

    linkAttr(prop, update) { return {
        value: this[prop],
        requestChange: newVal => {
            this[prop] = newVal;
            this.forceUpdate();
            return update();
        }
        }; },

    render() {
        return React.createElement(LibraryTheme, {"current_user": (this.props.current_user)},
            React.createElement("div", {"style": ({width: '80%', margin: '50px auto'})},
                React.createElement("div", {"style": ({display: 'flex', justifyContent: 'space-between'})},
                    React.createElement("div", {"style": ({display: 'flex', alignItems: 'baseline'})},
                        React.createElement("p", {"style": ({fontSize: 43, color:'rgb(4, 4, 4, .88)', margin: 0})}, (this.props.name)),
                        React.createElement("p", {"style": ({color: 'rgb(49, 49, 49, .88)'})}, (this.props.version_name))
                    ),
                    ( !this.props.is_public ?
                        React.createElement("div", {"style": ({width: 140, height: 40, backgroundColor: '#F1F1F1', borderRadius: 3, color: 'rgb(4, 4, 4, .7)', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'})},
                            React.createElement("span", null, "Private")
                        ) : undefined
                    )
                ),
                React.createElement("p", {"style": ({color: 'rgb(49, 49, 49, .6)'})}, (this.props.description)),
                React.createElement("div", {"style": ({display: 'flex', justifyContent: 'space-between'})},
                    React.createElement("div", null,
                        React.createElement("button", {"className": ('library-btn'), "onClick": (() => {})}, "TRY IT OUT"),
                        React.createElement("button", {"className": ('library-btn'), "onClick": (() => { this.changelogOpen = !this.changelogOpen; return this.forceUpdate(); })}, "CHANGELOG")
                    ),
                    React.createElement("div", null,
                        React.createElement("button", {"className": ('library-btn'), "onClick": (() => {
                            return modal.show(closeHandler => { return [
                                React.createElement(Modal.Header, {"closeButton": true},
                                    React.createElement(Modal.Title, null, "Edit README")
                                ),
                                React.createElement(Modal.Body, null,
                                    React.createElement(FormControl, {"tag": "textarea", "style": ({height: 400, width: '100%'}), "valueLink": (this.linkAttr('readmeState', modal.forceUpdate))})
                                ),
                                React.createElement(Modal.Footer, null,
                                    React.createElement("button", {"className": ('library-btn'), "style": ({width: 100, margin: 5}), "onClick": (closeHandler)}, "Close"),
                                    React.createElement("button", {"className": ('library-btn-primary'), "style": ({width: 100, margin: 5}), "onClick": (() => {
                                        return $.ajax({
                                            url: `/libraries/${this.props.library_id}/versions/${this.props.version_id}`,
                                            method: 'PUT',
                                            headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
                                            data: {readme: this.readmeState}
                                        }).done(data => {
                                            this.readmeState = data.readme;
                                            this.forceUpdate();
                                            return closeHandler();
                                    });
                                    })}, `\
Publish`)
                                )
                            ]; });
                        })}, "EDIT README"),
                        React.createElement("button", {"className": ('library-btn-primary'), "onClick": (() => {
                            return modal.show(closeHandler => [
                                React.createElement(Modal.Header, {"closeButton": true},
                                    React.createElement(Modal.Title, null, "Publish New Version")
                                ),
                                React.createElement(Modal.Body, null,
                                    React.createElement("div", {"className": "bootstrap"},
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "versionName"}, "Version Name"),
                                            React.createElement(FormControl, {"type": "text", "style": ({width: '100%'}), "valueLink": ({value: null, requestChange: () => {}}), "id": "versionName"})
                                        ),
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "uploadCode"}, "Upload Code"),
                                            React.createElement("input", {"type": "text", "className": "form-control", "style": ({width: '100%'}), "id": "uploadCode"})
                                        ),
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "changelog"}, "Changelog"),
                                            React.createElement("textarea", {"type": "text", "className": "form-control", "style": ({width: '100%'}), "id": "changelog", "placeholder": "What's new in this update?"})
                                        ),

                                        React.createElement("hr", null),

                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "description"}, "Description"),
                                            React.createElement("input", {"type": "text", "className": "form-control", "style": ({width: '100%'}), "id": "description"})
                                        ),
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "homepage"}, "Homepage"),
                                            React.createElement("input", {"type": "text", "className": "form-control", "style": ({width: '100%'}), "id": "homepage"})
                                        ),
                                        React.createElement("div", {"className": "form-group"},
                                            React.createElement("label", {"htmlFor": "readme"}, "README"),
                                            React.createElement("textarea", {"type": "text", "className": "form-control", "style": ({width: '100%'}), "id": "readme"})
                                        )
                                    )
                                ),
                                React.createElement(Modal.Footer, null,
                                    React.createElement("button", {"className": ('library-btn'), "style": ({width: 100, margin: 5}), "onClick": (closeHandler)}, "Close"),
                                    React.createElement("button", {"className": ('library-btn-primary'), "style": ({width: 100, margin: 5}), "onClick": (() => {})}, "Publish")
                                )
                            ]);
                        })}, "PUBLISH UPDATE")
                    )
                ),
                (!this.props.is_public ? React.createElement("p", {"style": ({float: 'right'})}, "A part of your private project ", React.createElement("a", {"href": (`/apps/${this.props.app_id}`)}, (this.props.app_name))) : undefined)
            ),

            ( this.changelogOpen ?
                React.createElement("div", {"style": ({width: '85%', maxHeight: 400, height: '100%', backgroundColor: '#F1F1F1', margin: '20px auto', borderRadius: 3, overflowY: 'scroll'})},
                    React.createElement("p", {"style": ({fontSize: 27, color: 'rgb(4, 4, 4, .77)', padding: 4})}, "Changelog"),
                    (this.props.changelog.map((item, i) => {
                        return React.createElement("div", {"style": ({width: '90%', display: 'flex', margin: '0 auto'}), "key": (i)},
                            React.createElement("div", null,
                                React.createElement("p", {"style": ({fontWeight: 'bold'})}, (item.name)),
                                React.createElement("p", {"style": ({fontSize: 14})}, (moment(item.created_at).format('MMM DD YYYY')))
                            ),
                            React.createElement(ReactMarkdown, {"source": (item.updates), "escapeHtml": (false)})
                        );
                    }))
                ) : undefined
            ),

            React.createElement("div", {"style": ({width: '85%', height: '100%', backgroundColor: '#F1F1F1', margin: '0 auto', borderRadius: 3})},
                React.createElement("div", {"style": ({padding: 5})},
                    React.createElement("p", {"style": ({color: 'rgb(49, 49, 49, .88)'})}, "How to install"),
                    React.createElement("p", {"style": ({color: 'rgb(49, 49, 49, .6)'})}, "Some installation content here.  Not sure what it is yet.  Probably fairly in-depth.  Lorem, ipsum, dolor et m is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page")
                )
            ),
            React.createElement("div", {"style": ({width: '80%', margin: '0 auto'})},
                React.createElement(ReactMarkdown, {"source": (this.props.readme), "escapeHtml": (false)})
            )
        );
    }
});
