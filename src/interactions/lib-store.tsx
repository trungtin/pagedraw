// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LibStoreInteraction;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { PdButtonOne, Glyphicon, PdSpinner } from '../editor/component-lib';
import { makeLibAtVersion, Library } from '../libraries';
import { Doc } from '../doc';
import { WrapInIframe } from '../frontend/wrap-in-iframe';
import propTypes from 'prop-types';
import confirm from '../frontend/confirm';
import openLibManagerModal from '../editor/lib-manager-modal';
import Refreshable from '../frontend/refreshable';
import Block from '../block';
import { CodeInstanceBlock } from '../blocks/instance-block';
import config from '../config';
import { server } from '../editor/server';
import { prod_assert } from '../util';
import { EditorMode } from './editor-mode';
import { IdleMode } from './layout-editor';
import createReactClass from 'create-react-class';
import { layoutViewForBlock } from '../editor/layout-view';
import StoreFront from '../pagedraw/store/storefront';
import LibDetails from '../pagedraw/store/libdetails';
import LibsSidebar from '../pagedraw/store/libssidebar';

export default LibStoreInteraction = class LibStoreInteraction extends EditorMode {
    sidebar() {
        return null;
    }

    canvas(editor) {
        // Overrides the CSS coming from editor
        return React.createElement("div", {"style": ({overflow: 'auto', userSelect: 'text', display: 'flex', flexGrow: '1'})},
            React.createElement(LibStore, {"editor": (editor)})
        );
    }

    leftbar(editor) {
        const mapLibrary = lib => {
            return {
                title: lib.library_name,
                version: lib.version_name,
                onRemove: () => confirm({
                    body: React.createElement("span", null, `\
Removing this library will delete\
`, React.createElement("strong", null, " ", (this.blocksOfLib(editor.doc, lib).length), " blocks "), `\
tied to it. Wish to proceed?\
`),
                    yesType: 'danger',
                    yes: 'Remove'
                }, () => this.removeLibrary(editor, lib))
            };
        };

        return React.createElement(LibsSidebar, {"libraries": (_l.map(editor.doc.libraries, mapLibrary))});
    }

    blocksOfLib(doc, lib) {
        return doc.blocks.filter(b => (typeof b.getSourceLibrary === 'function' ? b.getSourceLibrary() : undefined) === lib);
    }

    removeLibrary(editor, lib) {
        for (let block of Array.from(this.blocksOfLib(editor.doc, lib))) { editor.doc.removeBlock(block); }
        editor.doc.removeLibrary(lib);
        editor.setEditorMode(new IdleMode());
        return editor.handleDocChanged();
    }
};

const LibShower = createReactClass({
    displayName: 'LibShower',

    getInitialState() {
        return {
            error: null,
            loadedInstances: null
        };
    },

    onIframeLoad(iframe) {
        this.iframe = iframe;
        return makeLibAtVersion(this.iframe.contentWindow, this.props.library.id, this.props.version.id).then(lib => {
            const doc = new Doc({libraries: [lib]});
            return this.setState({doc, loadedInstances: lib.getCachedExternalCodeSpecs().map(spec => {
                return _l.extend(new CodeInstanceBlock({sourceRef: spec.ref}), {doc, propValues: spec.propControl.default(), name: spec.name});
            })
            });
        }).catch(error => {
            return this.setState({error});
        });
    },


    // FIXME: We are getting some doc not in readonly mode errors when doing setState in this component
    render() {
        if (this.state.error != null) { return React.createElement("div", {"style": ({padding: '50px'})}, React.createElement("h1", null, (this.state.error.message))); }

        const currentUser = __guard__(window.pd_params != null ? window.pd_params.current_user : undefined, x => x.id);

        return React.createElement(LibDetails, { 
            "components": ((this.state.loadedInstances != null ? this.state.loadedInstances : []).map(instance => ({
                title: instance.name
            }))),  
            "renderPreviews": (this.renderPreviews),  
            "title": (this.props.library.name),  
            "version": (this.props.version.name),  
            "owner": (this.props.library.owner_name),  
            "starCount": (this.props.library.users_who_starred.length),  
            "installCount": (this.props.library.users_who_installed.length),  
            "starred": (Array.from(this.props.library.users_who_starred).includes(currentUser)),  
            "installed": (this.installedState()),  
            "onToggleStar": (this.props.onToggleStar),  
            "onInstall": (this.addLib),  
            "onNavigateBack": (this.props.onNavigateBack)
        });
    },

    installedState() {
        let needle, needle1;
        const docLibsIds = _l.map(this.props.editor.doc.libraries, 'library_id');
        const docVersionsIds = _l.map(this.props.editor.doc.libraries, 'version_id');

        if ((needle = String(this.props.version.id), Array.from(docVersionsIds).includes(needle))) { return 'installed'; 
               } else if ((needle1 = String(this.props.library.id), Array.from(docLibsIds).includes(needle1))) { return 'upgrade'; 
               } else { return 'default'; }
    },


    renderPreviews() {
        const inside = () => {
            if ((this.state.loadedInstances == null)) {
                return React.createElement("div", {"style": ({flexGrow: '1', padding: '300px'})}, React.createElement(PdSpinner, null));
            }

            return React.createElement("div", {"style": ({display: 'flex', flexDirection: 'column', padding: '10px'})},
                (this.state.loadedInstances.map(instance => React.createElement("div", null,
                React.createElement("h1", null, (instance.name)),
                (layoutViewForBlock(instance, {}, {}, null))
            )))
            );
        };

        return React.createElement(WrapInIframe, {"style": ({border: '1px solid #ccc', flexGrow: '1'}), "registerIframe": (this.onIframeLoad), "render": (inside)});
    },

    addLib() {
        let found;
        switch (this.installedState()) {
            case 'default':
                var lib = this.state.doc.libraries[0];
                if ((_l.find(this.props.editor.doc.libraries, l => l.matches(lib))) != null) {
                    throw new Error("Lib shouldn't be installed");
                }

                prod_assert(() => (lib.cachedExternalCodeSpecs != null));
                this.props.editor.doc.addLibrary(lib);

                this.props.onInstall();
                return this.props.editor.handleDocChanged();
            case 'upgrade':
                lib = this.state.doc.libraries[0];
                var existing = _l.find(this.props.editor.doc.libraries, l => l.matches(lib));
                if ((existing == null)) {
                    throw new Error("Can't upgrade lib if it doesn't already exist");
                }

                prod_assert(() => (lib.cachedExternalCodeSpecs != null));

                var newCodeSpecRefs = lib.cachedExternalCodeSpecs.map(({ref}) => ref);

                // FIXME: Should give user a wizard that helps them do this if they want later
                if ((found = _l.find(existing.cachedExternalCodeSpecs, ({ref}) => !Array.from(newCodeSpecRefs).includes(ref))) != null) {
                    return this.setState({error: new Error(`Upgrading this lib would delete component ${found.name}. Not proceeding.`)});
                }

                this.props.editor.doc.addLibrary(lib);

                this.props.onInstall();
                return this.props.editor.handleDocChanged();

            case 'installed':
                throw new Error("Can't install lib that's already installed");
            default:
                throw new Error('Unkown installed state');
        }
    }
});

var LibStore = createReactClass({
    displayName: 'LibStore',
    rerender() {
        return this.forceUpdate();
    },

    componentWillMount() {
        this.showingLibId = null;

        this.current_user_id = window.pd_params.current_user.id;
        this.refreshable = new Refreshable();

        this.serverSnapshot = {
            appLibraries: null,
            mostStarredLibraries: null
        };
        this.optimisticUpdates = {};
        this.last_uid = -1;

        // FIXME: security. The data returned from these endpoints contains the metaserver IDs
        // of all users who installed/starred the libraries. This is probably a security concern
        server.librariesForApp(window.pd_params.app_id).then(data => {
            this.serverSnapshot.appLibraries = data;
            return this.rerender();
        });

        return server.librariesMostStarred().then(data => {
            this.serverSnapshot.mostStarredLibraries = data;
            return this.rerender();
        });
    },

    componentWillUnmount() {
        return this.refreshable.refreshIfNeeded();
    },

    uid() {
        this.last_uid += 1;
        return this.last_uid;
    },

    rpc(action, args, optimisticUpdate, onComplete) {
        let update_uid;
        if (onComplete == null) { onComplete = data => {
            // By default we ignore the returned data and apply the optimistic update
            return this.serverSnapshot = optimisticUpdate(this.serverSnapshot);
        }; }

        this.optimisticUpdates[(update_uid = this.uid())] = optimisticUpdate;

        server.librariesRPC(action, args).then(data => {
            return onComplete(data);
        }).finally(() => {
            delete this.optimisticUpdates[update_uid];
            return this.rerender();
        });

        return this.rerender();
    },

    reducedServerState() {
        // FIXME: the order here might matter
        return _l.values(this.optimisticUpdates).reduce(((acc, update) => update(acc)), this.serverSnapshot);
    },

    render() {
        const {mostStarredLibraries, appLibraries} = this.reducedServerState();
        if ((mostStarredLibraries == null) || (appLibraries == null)) { return 'Loading...'; }

        const docLibsIds = _l.map(this.props.editor.doc.libraries, 'library_id');
        const docVersionsIds = _l.map(this.props.editor.doc.libraries, 'version_id');

        const mapLibraries = lib => {
            let needle, needle1;
            const installed = (needle = String(lib.latest_version.id), Array.from(docVersionsIds).includes(needle)) ? 'installed' 
                : (needle1 = String(lib.id), Array.from(docLibsIds).includes(needle1)) ? 'upgrade' 
                : 'default';
            return {
                title: lib.name,
                starCount: lib.users_who_starred.length,
                installCount: lib.users_who_installed.length,
                starred: Array.from(lib.users_who_starred).includes(this.current_user_id),
                componentCount: 420,
                repository: lib.latest_version.homepage,
                owner: lib.owner_name,
                installed,
                version: lib.latest_version.name,
                onDetails: () => { this.showingLibId = lib.id; return this.rerender(); }
            };
        };

        if (this.showingLibId != null) {
            const lib = [...Array.from(mostStarredLibraries), ...Array.from(appLibraries)].find(l => l.id === this.showingLibId);

            return React.createElement(LibShower, { 
                "editor": (this.props.editor),  
                "library": (lib),  
                "version": (lib.latest_version),  
                "onNavigateBack": (() => { this.showingLibId = null; return this.rerender(); }),  
                "onToggleStar": (() => {
                    if (Array.from(lib.users_who_starred).includes(this.current_user_id)) {
                        this.unstar(this.showingLibId);
                    } else {
                        this.star(this.showingLibId);
                    }
                    return this.rerender();
                }
                ),  
                "onInstall": (() => {
                    this.trackInstall(this.showingLibId);
                    return this.refreshable.needsRefresh();
                }
                )
            });
        } else {
            return React.createElement(StoreFront, { 
                "popularLibraries": (_l.map(mostStarredLibraries, mapLibraries)),  
                "teamLibraries": (_l.map(appLibraries, mapLibraries)),  
                "onSearch": (search => console.log(`Searching for '${search}'`)),  
                "onCreateNewLibrary": (() => openLibManagerModal(this.props.editor.doc, this.props.editor.handleDocChanged))
            });
        }
    },

    star(lib_id) {
        return this.mutateSingleLib('star', lib_id, lib => {
            return _l.extend({}, lib, {users_who_starred: _l.union(lib.users_who_starred, [this.current_user_id])});
    });
    },

    unstar(lib_id) {
        return this.mutateSingleLib('unstar', lib_id, lib => {
            return _l.extend({}, lib, {users_who_starred: lib.users_who_starred.filter(id => id !== this.current_user_id)});
    });
    },

    trackInstall(lib_id) {
        return this.mutateSingleLib('track_install', lib_id, lib => {
            return _l.extend({}, lib, {users_who_installed: _l.union(lib.users_who_installed, [this.current_user_id])});
    });
    },

    mutateSingleLib(rpc_action, lib_id, lib_updater) {
        return this.rpc(rpc_action, {lib_id}, serverSnapshot => this.updateLibraryById(serverSnapshot, lib_id, lib_updater));
    },

    updateLibraryById(serverSnapshot, lib_id, update_fn) {
        const updateLibList = list => list.map(function(lib) { if (lib.id === lib_id) { return update_fn(lib); } else { return lib; } });
        return _l.extend({}, serverSnapshot, {
            appLibraries: updateLibList(serverSnapshot.appLibraries),
            mostStarredLibraries: updateLibList(serverSnapshot.mostStarredLibraries)
        });
    }});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}