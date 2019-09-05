/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import { makeLibAtVersion, Library } from '../libraries';
import { Modal, PdButtonOne } from './component-lib';
import modal from '../frontend/modal';
import FormControl from '../frontend/form-control';
import { Glyphicon, PdButtonBar, PdSpinner, PdCheckbox } from './component-lib';
import { LibraryAutoSuggest } from '../frontend/autosuggest-library';
import { InstanceBlock } from '../blocks/instance-block';
import { server } from './server';
import { libraryCliAlive } from '../lib-cli-client';
import Tooltip from '../frontend/tooltip';
import { prod_assert } from '../util';

// FIXME: Refresh should only happen after closing the modal once the user is done with all changes
const LibManager = createReactClass({
    displayName: 'LibManager',
    getInitialState() {
        return {
            error: null,
            uploadingLib: false,
            page: 'main',
            confirm: null,
            newVersionName: null,
            cliAlive: false,
            newLibName: '',
            serverSnapshot: {
                editableLibraryIds: null,
                publicLibraryIds: null
            }
        };
    },

    linkState(attr) {
        return {
            value: this.state[attr],
            requestChange: nv => this.setState(_l.fromPairs([[attr, nv]]))
        };
    },

    libVl(lib, attr) {
        return {
            value: lib[attr],
            requestChange: nv => {
                lib[attr] = nv;
                return this.props.onChange();
            }
        };
    },

    checkCliAlive() {
        return libraryCliAlive().then(cliAlive => {
            if (!this.canPoll) { return; }
            return this.setState({cliAlive}, () => {
                return window.setTimeout(this.checkCliAlive, 200);
            });
        });
    },

    componentWillMount() {
        this.canPoll = true;
        this.checkCliAlive();

        return server.librariesRPC('libraries_of_app', {app_id: window.pd_params.app_id}).then(({ret}) => {
            return this.setState({serverSnapshot: {
                editableLibraryIds: ret.map(({id}) => String(id)),
                publicLibraryIds: ret.filter(({is_public}) => is_public).map(({id}) => String(id)),
                latestVersionById: _l.fromPairs(ret.map(({id, latest_version}) => [String(id), latest_version]))
            }});
        });
    },

    componentWillUnmount() {
        return this.canPoll = false;
    },

    render() {
        if (this.state.confirm != null) {
            return React.createElement(React.Fragment, null,
                React.createElement(Modal.Header, {"closeButton": true},
                    React.createElement(Modal.Title, null, (this.state.confirm.title != null ? this.state.confirm.title : 'Are you sure?'))
                ),
                React.createElement(Modal.Body, null,
                    (this.state.confirm.body)
                ),
                React.createElement(Modal.Footer, null,
                    React.createElement(PdButtonOne, {"onClick": (() => this.setState({confirm: null}))}, (this.state.confirm.no != null ? this.state.confirm.no : 'Back')),
                    React.createElement(PdButtonOne, {"type": (this.state.confirm.yesType != null ? this.state.confirm.yesType : "primary"), "onClick": (this.state.confirm.callback)}, (this.state.confirm.yes != null ? this.state.confirm.yes : 'Yes'))
                )
            );
        }

        return React.createElement(React.Fragment, null,
            React.createElement(Modal.Header, {"closeButton": true},
                React.createElement(Modal.Title, null, "My External Libraries")
            ),
            React.createElement(Modal.Body, null,
                (this.renderBody())
            ),
            React.createElement(Modal.Footer, null,
                React.createElement(PdButtonOne, {"onClick": (this.props.closeHandler)}, "Close")
            )
        );
    },

    renderBody() {
        if ((this.state.serverSnapshot.editableLibraryIds == null) || (this.state.serverSnapshot.publicLibraryIds == null)) { return React.createElement(PdSpinner, null); }

        const dev_lib = this.props.doc.libCurrentlyInDevMode();
        return React.createElement("div", {"style": ({display: 'flex', flexDirection: 'column', justifyContent: 'space-between'})},
            React.createElement("div", null,
                (this.state.cliAlive ? React.createElement("div", {"style": ({color: 'green', marginBottom: '6px'})}, "Detected ", React.createElement("code", null, "pagedraw develop"), " CLI server :)") : undefined),
                (dev_lib && !this.state.cliAlive ? React.createElement("div", {"style": ({color: 'orange', marginBottom: '6px'})}, "You have a library in dev mode but your CLI is not running ", React.createElement("code", null, "pagedraw develop"), " :(") : undefined),
                (this.state.uploadingLib ? React.createElement("div", null, React.createElement("div", {"style": ({marginBottom: '6px'})}, "Uploading library to the Pagedraw servers"), React.createElement(PdSpinner, null)) : undefined),
                (this.state.error ? React.createElement("div", {"style": ({color: 'red', marginBottom: '6px'})}, (this.state.error.message)) : undefined),
                (this.props.doc.libraries.map(lib => {
                    let vl;
                    const publicVl = this.publicVl(lib);
                    return React.createElement("div", {"key": (lib.uniqueKey)},
                        React.createElement("hr", null),
                        React.createElement("div", {"style": ({display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'})},
                            React.createElement("span", null, (lib.name())),
                            (!lib.didLoad(window) ? React.createElement("span", null, "Did not load!") : undefined),
                            (
                                Array.from(this.state.serverSnapshot.editableLibraryIds).includes(lib.library_id) && (dev_lib !== lib) ?
                                    React.createElement("label", {"style": ({margin: 'none'})},
                                        React.createElement("input", {"type": "checkbox", "disabled": (this.state.doingWork || (dev_lib != null)),  
                                            "checked": (false), "onChange": (() => this.enterDevMode(lib))}),
                                        React.createElement("span", null, " Enter development mode")
                                    )
                                : Array.from(this.state.serverSnapshot.editableLibraryIds).includes(lib.library_id) && (dev_lib === lib) ?
                                    React.createElement(React.Fragment, null,
                                        React.createElement("label", null, "In dev mode"),

                                        React.createElement("label", {"style": ({display: 'flex', flexDirection: 'column'})}, `\
New version:\
`, React.createElement(FormControl, {"disabled": (this.state.doingWork), "style": ({width: '100px'}), "type": "text", "placeholder": "New version", "valueLink": (this.newVersionNameVl(lib))})
                                        ),
                                        React.createElement("div", {"style": ({display: 'flex', flexDirection: 'column'})},
                                            React.createElement(PdButtonOne, {"disabled": (this.state.doingWork || !lib.didLoad(window)),  
                                                "type": "warning", "onClick": (() => this.discardDevModeChanges(lib))}, "Discard changes"),
                                            React.createElement(PdButtonOne, {"disabled": (this.state.doingWork || !lib.didLoad(window) || !this.state.cliAlive),  
                                                "type": "primary", "onClick": (() => this.publishDevModeChanges(lib))}, "Publish changes")
                                        )
                                    )
                                :
                                    React.createElement("span", null, "Not owned by this project")
                            ),
                            (
                                Array.from(this.state.serverSnapshot.editableLibraryIds).includes(lib.library_id) && (lib !== dev_lib) ?
                                    React.createElement("label", {"style": ({margin: 'none'})},
                                        React.createElement("input", {"type": "checkbox", "disabled": (this.state.doingWork || (!lib.didLoad(window))),  
                                            "checked": (publicVl.value), "onChange": (e => publicVl.requestChange(!publicVl.value))}),
                                        React.createElement("span", null, " Public")
                                    ) : undefined
                            ),
                            React.createElement(Glyphicon, {"glyph": "remove", "onClick": (() => {
                                return this.confirm({
                                    body: React.createElement("span", null, "Removing this library will delete ", React.createElement("strong", null, (this.blocksOfLib(lib).length), " blocks"), " tied to it. Wish to proceed?"),
                                    yesType: 'danger',
                                    yes: 'Remove'
                                }, () => {
                                    return this.removeLibrary(lib);
                            });
                            }
                            )})
                        ),
                        React.createElement("div", {"style": ({marginBottom: '6px'})},
                            (lib.inDevMode ? [
                                    React.createElement(Tooltip, {"key": "1", "position": "right", "content": ("Require path for Pagedraw generated code. Can be local or an npm package.")},
                                        React.createElement(FormControl, {"style": ({marginRight: '10px'}), "type": "text", "placeholder": "require-path", "valueLink": (this.libVl(lib, 'devModeRequirePath'))})
                                    ),
                                    React.createElement("label", {"key": "2", "style": ({margin: 'none'})},
                                        React.createElement("input", {"type": "checkbox", "checked": ((vl = this.libVl(lib, 'devModeIsNodeModule')).value), "onChange": (e => vl.requestChange(!vl.value))}),
                                        React.createElement("span", null, "Is a node module")
                                    )
                            ] :
                                React.createElement("span", null, (lib.isNodeModule() ? 'Node module import path:' : 'Local import path:'), React.createElement("code", null, (lib.requirePath())))
                            )
                        )
                    );
                })),
                React.createElement("hr", null)
            ),
            React.createElement("div", {"style": ({display: 'flex', justifyContent: 'space-between'})},
                React.createElement("div", null,
                    ((dev_lib == null) ? React.createElement(FormControl, {"style": ({marginRight: '10px'}), "type": "text", "placeholder": "New lib name", "valueLink": (this.linkState('newLibName'))}) : undefined),
                    React.createElement(Tooltip, {"position": "right", "content": ((dev_lib != null) ? "You can't create a new lib while you have another in dev mode." : undefined)},
                        React.createElement(PdButtonOne, {"type": "primary",  
                            "disabled": (_l.isEmpty(this.state.newLibName) || this.state.doingWork || (dev_lib != null)),  
                            "onClick": (this.createLibrary)}, "Create Library")
                    )
                )
            )
        );
    },

    confirm(data, callback) {
        return this.setState({confirm: _l.extend({callback: () => { callback(); return this.setState({confirm: null}); }}, data)});
    },

    blocksOfLib(lib) {
        return this.props.doc.blocks.filter(b => (typeof b.getSourceLibrary === 'function' ? b.getSourceLibrary() : undefined) === lib);
    },

    removeLibrary(lib) {
        for (let block of Array.from(this.blocksOfLib(lib))) { this.props.doc.removeBlock(block); }
        this.props.doc.removeLibrary(lib);
        return this.props.onChange();
    },

    createLibrary() {
        const name = this.state.newLibName;
        this.setState({newLibName: ''});
        return server.createLibrary(window.pd_params.app_id, name).then(({err, data}) => {
            if (err != null) {
                return this.showError('Library creation failed: ' + err.message);
            }

            this.props.doc.addLibrary(new Library({
                library_id: String(data.id), library_name: data.name, version_name: data.latest_version.name,
                version_id: String(data.latest_version.id), inDevMode: true
            }));
            this.props.needsRefresh();
            this.state.serverSnapshot.editableLibraryIds.push(String(data.id));
            return this.props.onChange();
        });
    },


    publicVl(lib) {
        let lib_id, needle;
        return {
            value: ((needle = lib_id = lib.library_id), Array.from(this.state.serverSnapshot.publicLibraryIds).includes(needle)),
            requestChange: nv => {
                if (nv === true) {
                    return this.confirm({body: 'Publishing this library will make it visible to all Pagedraw users. Click yes to proceed.'}, () => {
                        this.setState({doingWork: true, error: null});
                        return server.librariesRPC('make_public', {hi: 'there', lib_id}).then(({ret}) => {
                            prod_assert(() => ret === 'success');
                            const serverSnapshot = _l.set(this.state.serverSnapshot, 'publicLibraryIds', _l.union(this.state.serverSnapshot.publicLibraryIds, [lib_id]));
                            return this.setState({doingWork: false, serverSnapshot});
                        });
                    });
                } else {
                    return this.confirm({body: 'Unpublishing this library will disallow new users from seeing it in the component store. The only users who will be able to see it are those in your Pagedraw project. Click yes to proceed.'}, () => {
                        this.setState({doingWork: true, error: null});
                        return server.librariesRPC('make_unpublic', {lib_id}).then(({ret}) => {
                            prod_assert(() => ret === 'success');
                            const serverSnapshot = _l.set(this.state.serverSnapshot, 'publicLibraryIds', this.state.serverSnapshot.publicLibraryIds.filter(id => id !== lib_id));
                            return this.setState({doingWork: false, serverSnapshot});
                        });
                    });
                }
            }
        };
    },

    devModeVl(lib) {
        return {
            value: lib.inDevMode,
            requestChange: nv => {}
        };
    },

    newVersionNameVl(lib) {
        const patch = function(version) {
            const numbers = version.split('.');
            prod_assert(() => numbers.length >= 1);
            numbers[numbers.length - 1] = String(Number(numbers[numbers.length - 1]) + 1);
            return numbers.join('.');
        };

        const latest_version = this.state.serverSnapshot.latestVersionById[lib.library_id];
        return{
            value: this.state.newVersionName != null ? this.state.newVersionName : (latest_version != null) ? patch(latest_version.name) : '0.0.0',
            requestChange: nv => this.setState({newVersionName: nv})
        };
    },

    discardDevModeChanges(lib) {
        lib.inDevMode = false;
        this.props.needsRefresh();
        return this.props.onChange();
    },

    publishNewVersion(lib, version_name) {
        return lib.publish(window).then(({err, hash}) => {
            if (err != null) { return {err}; }

            if ((hash == null)) { throw new Error("bundle hash must be present to publish library"); }

            const new_version = {
                name: version_name, bundle_hash: hash, is_node_module: lib.devModeIsNodeModule,
                // we keep the cache for the unchecked one and update the checked one
                npm_path: lib.devModeIsNodeModule ? lib.devModeRequirePath : lib.npm_path,
                local_path: lib.devModeIsNodeModule ? lib.local_path : lib.devModeRequirePath
            };

            return server.createLibraryVersion(lib, new_version).then(({err, data}) => ({
                err,
                data: _l.extend({}, data, {hash})
            }));
    });
    },

    publishDevModeChanges(lib) {
        const version_name = this.newVersionNameVl(lib).value;

        const isValidVersionName = function(name) {
            const numbers = name.split('.');
            return _l.every(numbers, n => _l.isFinite(Number(n)));
        };

        // FIXME: Should also enforce on the server
        if (!isValidVersionName(version_name)) { return this.showError(`Invalid version name ${version_name}`); }

        return this.confirm({body: 'This will make a prod bundle and upload a new version of this library to your Pagedraw project. Click yes to proceed.'}, () => {
            this.setState({doingWork: true, uploadingLib: true, error: null});
            return this.publishNewVersion(lib, version_name).then(({err, data}) => {
                if (err != null) {
                    return this.showError("Unable to publish library: " + err.message);
                }

                if (String(data.library_id) !== lib.library_id) {
                    throw new Error('Something went wrong publishing the library');
                }

                return makeLibAtVersion(window, lib.library_id, data.id).then(lib => {
                    this.setState({doingWork: false, uploadingLib: false});

                    this.props.doc.addLibrary(lib);

                    this.props.needsRefresh();
                    return this.props.onChange();
                }).catch(err => {
                    // We shouldn't get here because the lib was succesfully published.
                    throw err;
                });
            });
        });
    },


    enterDevMode(lib) {
        lib.devModeRequirePath = lib.requirePath();
        lib.devModeIsNodeModule = lib.is_node_module;
        lib.inDevMode = true;

        this.props.needsRefresh();
        return this.props.onChange();
    },

    showError(msg) {
        return this.setState({error: new Error(msg)});
    }
});

export default function(doc, onChange) {
    let willRefresh = false;
    return modal.show((closeHandler => [React.createElement(LibManager, {"doc": (doc), "onChange": (onChange), "willRefresh": (willRefresh), "needsRefresh"() { return willRefresh = true; }, "closeHandler": (closeHandler)})]), (function() {
        if (willRefresh) {
            return window.requestAnimationFrame(() => modal.show((closeHandler => [
                React.createElement(Modal.Header, null,
                    React.createElement(Modal.Title, null, "About to refresh")
                ),
                React.createElement(Modal.Body, null, `\
The changes you did require a refresh. Closing this window will refresh the screen.\
`),
                React.createElement(Modal.Footer, null,
                    React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Ok")
                )
            ]), () => window.location = window.location));
        }
    }));
};
