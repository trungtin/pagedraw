/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let CommitRef, server_for_config;
import $ from 'jquery';
import _l from 'lodash';
import jsondiffpatch from 'jsondiffpatch';
import util from '../util';
import config from '../config';
import { Model } from '../model';

const parseJsonString = function(json_string, accept, reject) {
    let docjson;
    try {
        docjson = JSON.parse(json_string);
    } catch (e) {
        return reject(e);
    }
    return accept(docjson);
};

const fetchJsonFromRails = (url, params) => fetch(url, _l.extend({credentials: 'same-origin'}, params, {
    headers: _l.extend({
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }, params.headers),
    body: JSON.stringify(params.body)
}));

class DocRef {
    constructor(page_id, docserver_id) {
        this.page_id = page_id;
        this.docserver_id = docserver_id;
    }
}

const defaultExport = {};

// A CommitRef is actually only a reference to a commit. It doesn't contain
// the information necessary to restore to that point in history since
// it'd be too expensive to have all of that in the realtime database.
// In order to get that information, you must use this commit's uniqueKey
// and fetch it from the server
defaultExport.CommitRef = Model.register('commit-ref', (CommitRef = (function() {
    CommitRef = class CommitRef extends Model {
        static initClass() {
            this.prototype.properties = {
                authorId: Number,
                authorName: String,
                authorEmail: String,
                timestamp: Number,
                message: String
            };
        }

        static sortedByTimestamp(commits) {
            return _l.sortBy(commits, ['timestamp', 'uniqueKey']);
        }
    };
    CommitRef.initClass();
    return CommitRef;
})()));

const firebaseAppsByHost = {};

class ServerClient {
    static initClass() {
    
        this.prototype.ABORT_TRANSACTION = {};
    }
    /*
    firebase structure:
        cli_info/
        pages/
            :docserver_id/
                history/
                    :rev_id/        - stringified {a: author string, d: patch json, t: timestamp}
                snapshot/           - stringified {doc: doc json, rev: number, t: timestamp}
                last_sketch/        - stringified doc json of the last Sketch import
                commit_refs/
                    :commit_hash/   - stringified serialized CommitRef
                commit_data/
                    :commit_hash/   - stringified doc json

    Everything is null in firebase until it's set.
    The (implicit) revision 0 of every doc is null.  It is not the empty hash {}, the string
    "null", or anything else.  It is always just the singleton null.  The first delta, saved
    as A0, assumes the prior doc was null.
    */

    constructor(metaserver, metaserver_csrf_token, docserver_host, compileserver_host, sketch_importer_server_host) {
        this.createMetaPage = this.createMetaPage.bind(this);
        this.createNewDoc = this.createNewDoc.bind(this);
        this.saveMetaPage = this.saveMetaPage.bind(this);
        this.compileDocjson = this.compileDocjson.bind(this);
        this.importFromSketch = this.importFromSketch.bind(this);
        this.watchPage = this.watchPage.bind(this);
        this.casPage = this.casPage.bind(this);
        this.metaserver = metaserver;
        this.metaserver_csrf_token = metaserver_csrf_token;
        this.docserver_host = docserver_host;
        this.compileserver_host = compileserver_host;
        this.sketch_importer_server_host = sketch_importer_server_host;
        this.firebase = require('firebase');

        // Firebase app complains if you have multiple clients with the same name so we memoize them here
        // FIXME: this is a hack. Feel free to fix/refactor it
        if (firebaseAppsByHost[this.docserver_host] == null) { firebaseAppsByHost[this.docserver_host] = this.firebase.initializeApp({databaseURL: this.docserver_host}, this.docserver_host); }
        this.fbaseDB = firebaseAppsByHost[this.docserver_host].database();

        this.clientId = String(Math.random()).slice(2);

        // commit watching state
        this.cachedCommitRefsByDocserverId = {};
        this.commitListeners = [];

        this.externalCodeCache = {};
    }

    //# We should use docserver_id when talking to firebase and page_id when talking to rails
    getDocRefFromId(page_id, docserver_id) {
        return new DocRef(page_id, docserver_id);
    }

    docRefFromPageId(page_id, callback) {
        return $.ajax({
            url: `/pages/${page_id}.json`,
            type: "get",
            success: data => {
                return callback(this.getDocRefFromId(page_id, data.pd_params.docserver_id));
            }
        });
    }

    /* Metaserver methods */

    createMetaPage(app_id, doc_name) {
        return new Promise((resolve, reject) => {
            return $.post(`/apps/${app_id}/pages.json`, {page: {url: doc_name}}, data => resolve(data)).fail(() => {
                return reject();
            });
        });
    }

    createNewDoc(app_id, doc_name, lang, docjson) {
        return new Promise((resolve, reject) => {
            return this.createMetaPage(app_id, doc_name).then(data => {
                const docRef = this.getDocRefFromId(data.id, data.docserver_id);

                docjson = _l.extend({}, docjson, {
                    metaserver_id: `${data.id}`,
                    export_lang: lang,
                    url: doc_name // actually the source of truth for the doc name, but called .url for historical reasons
                });

                return this._initializeDocserverJSON(docRef, docjson, () => {
                    return resolve({docRef, docjson, metaserver_rep: data});
                });
            });
        });
    }

    saveMetaPage(docRef, params, callback) {
        // Because of the way the Page Controller works in Rails, we need to pass all page
        // params inside a 'page' key
        const json = { page: params };
        return $.ajax({
            url: `/pages/${docRef.page_id}.json/`,
            type: 'put',
            headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
            data: json,
            success: callback
        });
    }

    createProjectAndRedirect({name, framework, collaborators_emails}) {
        const form = _l.extend(window.document.createElement('form'), {method: 'POST', action: '/apps'});
        const field = (name, value) => form.appendChild(_l.extend(window.document.createElement('input'), {name, value}));

        field('authenticity_token', this.metaserver_csrf_token);
        field('app[name]', name);
        field('app[default_language]', framework);
        for (let i = 0; i < collaborators_emails.length; i++) { const email = collaborators_emails[i]; field(`collaborators[${i}]`, email); }

        form.style.display = 'none';
        window.document.body.appendChild(form);
        return form.submit();
    }

    logOutAndRedirect() {
        const [href, method] = Array.from(['/users/sign_out', 'delete']);
        const form = $('<form method="post" action="' + href + '"></form>');
        let metadataInput = '<input name="_method" value="' + method + '" type="hidden" />';
        metadataInput += '<input name="authenticity_token" value="' + this.metaserver_csrf_token + '" type="hidden" />';
        form.hide().append(metadataInput).appendTo('body');
        return form.submit();
    }


    /* Compileserver methods */

    compileDocjson(docjson, callback) {
        return $.ajax({
            method: "POST",
            url: `${this.compileserver_host}/v1/compile-docjson`,
            contentType: "application/json",
            data: JSON.stringify({client: 'editor', user_info: (window.pd_params != null ? window.pd_params.current_user : undefined), docjson}), // FIXME: Shouldn't touch window here
            success: callback
        });
    }

    importFromSketch(file, callback, error) {
        const data = new FormData();
        data.append('sketch_file', file);

        // FIXME shouldn't touch window here
        data.append('data', JSON.stringify({user_info: (window.pd_params != null ? window.pd_params.current_user : undefined), docserver_id: (window.pd_params != null ? window.pd_params.docserver_id : undefined)}));

        return $.ajax({
            method: "POST",
            data,
            url: `${this.sketch_importer_server_host}/v1/import/`,
            processData: false,
            contentType: false,
            success: callback,
            error
        });
    }

    /* Docserver methods */

    // Returns an unsubscribe :: () -> () function
    // callback :: ([cas_token, json_value]) -> ()
    // If there's no doc there (yet), json_value = null.  Otherwise, json_value will be the
    // doc json stored on the server.
    // The callback is called once as soon as we load a doc, then every time after when the
    // server has an update.
    // The cas_token should be different on every callback.  Passing a cas_token to casPage
    // will do a write iff the server state hasn't changed since callback() was called with
    // that cas_token.
    watchPage(docRef, callback, fail_to_load_callback) {
        if (fail_to_load_callback == null) { fail_to_load_callback = undefined; }
        const ref = this.fbaseDB.ref(`pages/${docRef.docserver_id}`);

        let [canceled, watch_id, history_ref] = Array.from([false, null, null]);

        ref.child('snapshot').once('value', snapshot_ref => {
            let doc, rev;
            if (canceled) { return; }

            const [snapshot, initial_doc_snapshot, pending_deltas] = Array.from([snapshot_ref.val(), {doc: null, rev: 0}, {}]);

            // JSON.parse may throw here if the snapshot is corrupted
            try {
                ({doc, rev} = (snapshot != null) ? JSON.parse(snapshot) : initial_doc_snapshot);

            } catch (error) {
                // this is the only place we can really, really fail.  Any other failures are deltas that are bad,
                // which can just be ignored
                canceled = true; // just to be safe
                if (typeof fail_to_load_callback === 'function') {
                    fail_to_load_callback();
                }
                return;
            }

            const handle_received_deltas = always_notify => {
                if (always_notify == null) { always_notify = false; }
                if (canceled) { return; }

                const consume_pending_deltas = fn => {
                    return (() => {
                        let next_delta, next_rev, next_rev_id;
                        const result = [];
                        while ((next_delta = pending_deltas[(next_rev_id = revToFirebaseId(next_rev = rev + 1))]) != null) {

                        // we want to safely parse a delta in case of bad clients
                            var a, d;
                            let delta_is_valid = false;
                            try {

                                // next_delta :: {a: String /* author id */, d: JSONDelta, t: unix timestamp }
                                ({d, a} = JSON.parse(next_delta));

                                // if we got here by parsing and getting .d and .a without throwing
                                delta_is_valid = true;

                            } catch (error1) {
                                // log and treat it as a no-op
                                util.track_warning('delta failed to parse', {next_rev, next_delta});
                            }

                            // Call the iterator.  If we got a bad delta, treat it as a no-op.
                            if (delta_is_valid !== false) { fn(d, a, next_rev); }

                            // delete the delta and move to the next one
                            delete pending_deltas[next_rev_id];
                            result.push(rev = next_rev);
                        }
                        return result;
                    })();
                };

                let notify_watchers_of_update = false;

                consume_pending_deltas((delta, author, next_rev) => {
                    try {
                        doc = jsondiffpatch.patch(doc, delta);

                    } catch (error1) {
                        util.track_warning('delta was malformed', {next_rev, delta, doc: JSON.stringify(doc)});
                    }

                        // if jsondiffpatch.patch fails, doc will not be mutated, and won't be overwritten,
                        // so we're in a good state.  Just treat the bad delta as a no-op.

                    // Don't notify listeners if the last change we're seeing was one we ourselves made.  That
                    // should come through an ACK instead.
                    return notify_watchers_of_update = (author !== this.clientId);
                });

                if (notify_watchers_of_update || always_notify) {
                    const immutable_json_clone = _l.cloneDeep(doc);
                    const cas_token = [rev + 1, immutable_json_clone];

                    // call the listener with the latest data.  It's all leading up to this.
                    return callback([cas_token, immutable_json_clone]);
                }
            };


            // we want to get all the deltas after the snapshot we're starting from
            history_ref = ref.child('history').startAt(null, revToFirebaseId(rev));


            let buffering_initial_deltas_for_load = true;

            // This fires on all children, including ones that buffering_initial_deltas_for_load exist when the watcher is attached.
            // It would more appropriately be named .on('child'), since it isn't just fired when a new child
            // is added.
            watch_id = history_ref.on('child_added', delta => {
                if (canceled) { return; }
                pending_deltas[delta.key] = delta.val();

                // Notify the listener that we have an update. Do the callback async so exceptions thrown
                // in the callback aren't caught by firebase.  Firebase likes to log and re-throw errors,
                // losing the line numbers from the exception trace, which screws up rollbar
                if (!buffering_initial_deltas_for_load) { return setTimeout(() => handle_received_deltas(false)); }
            });

            // This will fire only once all of the initial children have been added.  This is modeled after
            // https://github.com/firebase/firepad/blob/a8676c2979e5c189483720eacd50e52b8c3c60cd/lib/firebase-adapter.js#L240
            // I believe there's a guarantee that it will not fire before .on('child_added') has finished adding
            // all of the initial children.  Even if it does, it's not technically wrong, the Editor will just
            // load and then "receive updates" that had already happened before it loaded.  In a distributed systems
            // sense, this isn't even wrong.
            return history_ref.once('value', () => {
                if (canceled) { return; }

                // Notify the listener that we have an update. Do the callback async so exceptions thrown
                // in the callback aren't caught by firebase.  Firebase likes to log and re-throw errors,
                // losing the line numbers from the exception trace, which screws up rollbar
                return setTimeout(function() {
                    buffering_initial_deltas_for_load = false;
                    return handle_received_deltas(true);
                });
            });
        });


        const unsubscribe_fn = function() {
            canceled = true;
            if (watch_id != null) { return history_ref.off('child_added', watch_id); }
        };

        return unsubscribe_fn;
    }


    casPage(log_id, docRef, cas_token, new_json, callback, user_name) {
        // declare this out here so we can set it in one callback and read it in another
        if (user_name == null) { user_name = undefined; }
        let next_cas_token = null;

        return setTimeout(() => {

            const [next_rev, prev_json] = Array.from(cas_token);

            return this.fbaseDB.ref(`pages/${docRef.docserver_id}/history/${revToFirebaseId(next_rev)}`).transaction((val_on_server => {
                // tell firebase to fail the transaction if someone else's written here first
                if (val_on_server !== null) { return undefined; }

                const data = JSON.stringify({
                    d: jsondiffpatch.diff(prev_json, new_json),
                    a: this.clientId,

                    // u (user id) and t (current timestamp) are metadata, and not required by the protocol
                    u: __guard__(__guard__(typeof window !== 'undefined' && window !== null ? window.pd_params : undefined, x1 => x1.current_user), x => x.id) != null ? __guard__(__guard__(typeof window !== 'undefined' && window !== null ? window.pd_params : undefined, x1 => x1.current_user), x => x.id) : user_name,
                    t: Date.now()
                });

                if (config.logOnSave) { console.log(`[${log_id}] sending delta`, data.length, data); }

                next_cas_token = [next_rev + 1, new_json];

                // tell firebase we want to write `data`
                return data;
            }

            ), ((err, succeeded) => {
                if (err && (err.message === 'disconnect')) {
                    if (config.logOnSave) { console.log(`[${log_id}] transactionn failed with disconnect; retrying`); }
                    // https://github.com/firebase/firepad/blob/a8676c2979e5c189483720eacd50e52b8c3c60cd/lib/firebase-adapter.js#L141
                    // it's not exactly clear what we're doing here, but the semantics of transactions and deltas
                    // means it should never be *wrong* to retry a transaction.
                    setTimeout(() => {
                        return this.casPage(log_id, docRef, cas_token, new_json, callback);
                    });
                    return;
                }

                if (err) {
                    if (config.logOnSave) { console.log(`[${log_id}] transaction errored`, err, cas_token, new_json); }
                    return;
                }

                // This should happen when our firebase.transaction updateFunction returns undefined
                if (!succeeded) {
                    if (config.logOnSave) { console.log(`[${log_id}] transaction did not go through, but did not error`); }
                    return;
                }

                // snapshot policy heuristic: every 100th delta, the author makes a snapshot
                if ((next_rev % config.snapshotFrequency) === 0) {
                    // set a snapshot
                    const snapshot_data = JSON.stringify({
                        doc: new_json,
                        rev: next_rev,
                        t: Date.now()
                    });
                    if (config.logOnSave) { console.log(`[${log_id}] snapshotting`, snapshot_data.length, snapshot_data); }
                    this.fbaseDB.ref(`pages/${docRef.docserver_id}/snapshot`).set(snapshot_data);
                }

                // the transaction went through successfully.  ACK it
                return callback(next_cas_token);
            }
            ), false);
        });
    }

    transactionPage(log_id, addr, mapper) { return new Promise((callback, reject) => {
        let unsubscribe;
        return unsubscribe = this.watchPage(addr.docRef, (...args) => {
            const [cas_token, docjson] = Array.from(args[0]);
            return mapper(docjson, addr)
            .then((mapped => {
                if ((mapped === this.ABORT_TRANSACTION) || _l.isEqual(docjson, mapped)) {
                    unsubscribe();
                    return callback();
                }

                return this.casPage(log_id, addr.docRef, cas_token, mapped, (function(_next_cas_token) {
                    unsubscribe();
                    return callback();
                }), log_id);
            }

            ), (function(mapper_err) {
                unsubscribe();
                return reject(mapper_err);
            }));
        });
    }); }

    transactionCommit(addr, mapper) {
        return this.getCommit(addr.docRef, addr.commitRef)
            .then(docjson => {
                return mapper(docjson, addr).then(mapped => {
                    if ((mapped === this.ABORT_TRANSACTION) || _l.isEqual(docjson, mapped)) {
                        return undefined;
                    }

                    return new Promise((callback, reject) => {
                        return this.saveCommit(addr.docRef, addr.commitRef, mapped, callback);
                    });
                });
        });
    }

    transactionLastSketch(addr, mapper) {
        return this.getLastSketchImportForDoc(addr.docRef)
        .then(docjson => {
            util.assert(() => docjson !== null);
            return mapper(docjson, addr).then(mapped => {
                if ((mapped === this.ABORT_TRANSACTION) || _l.isEqual(docjson, mapped)) {
                    return undefined;
                }

                return this.saveLatestSketchImportForDoc(addr.docRef, mapped);
            });
        });
    }

    // getPage :: docRef -> [error, JSON], asynchronously, in a one-off read
    // utility function that calls watchPage just long enough to get one full up to date JSON
    // used by compileserver
    getPage(docRef) { return new Promise((resolve, reject) => {
        let unsubscribe;
        return unsubscribe = this.watchPage(docRef, (function(...args) {
            // we only want to do one read, so unsubscribe immediately
            const [cas_token, json] = Array.from(args[0]);
            unsubscribe();
            return resolve(json);
        }), (() => reject('error')));
    }); }

    _initializeDocserverJSON(docRef, docjson, callback) {
        return this.casPage('create ' + Date.now(), docRef, [1, null], docjson, callback);
    }

    /* Commits */

    kickMeWhenCommitsChange(docRef, onChange) {
        return this.commitListeners.push([docRef, onChange]);
    }
        // FIXME should have a corresponding unregister(), but we just don't care

    getCommitRefsAsync(docRef) {
        if ((this.cachedCommitRefsByDocserverId[docRef.docserver_id] != null) === false) {
            this.cachedCommitRefsByDocserverId[docRef.docserver_id] = 'is_loading';
            this.fbaseDB.ref(`pages/${docRef.docserver_id}/commit_refs`).on('value', json => {
                const commitRefs = json.val();
                if (commitRefs != null) {
                    const unsortedCommitRefs = _l.map(commitRefs, s => CommitRef.deserialize(JSON.parse(s)));
                    this.cachedCommitRefsByDocserverId[docRef.docserver_id] = CommitRef.sortedByTimestamp(unsortedCommitRefs).reverse();

                    return (() => {
                        const result = [];
                        for (let [listenerDocRef, handler] of Array.from(this.commitListeners)) {                             if (listenerDocRef.docserver_id === docRef.docserver_id) {
                                result.push(handler());
                            }
                        }
                        return result;
                    })();

                } else {
                    return this.cachedCommitRefsByDocserverId[docRef.docserver_id] = [];
                }
        });
        }

        const commitRefs = this.cachedCommitRefsByDocserverId[docRef.docserver_id];

        if (commitRefs === 'is_loading') {
            // We don't return [] here so the UI can know tha we are loading instead of no commits present
            return null;
        }

        return commitRefs;
    }

    getCommitRefs(docRef) { return new Promise((accept, reject) => {
        return this.fbaseDB.ref(`pages/${docRef.docserver_id}/commit_refs`).on('value', json => {
            let unsortedCommitRefs;
            const commitRefs = json.val();
            if ((commitRefs == null)) { return accept([]); }
            try {
                unsortedCommitRefs = _l.map(commitRefs, s => CommitRef.deserialize(JSON.parse(s)));
            } catch (e) {
                reject(e);
            }
            return accept(CommitRef.sortedByTimestamp(unsortedCommitRefs).reverse());
        });
    }); }

    saveCommit(docRef, commit_ref, serialized_doc, callback) {
        //# Note: Right now this just pushes the file to regular firebase. If
        // Firebase realtime DB storage becomes an issue we can push these files to Fbase storage/AWS
        // instead. Note that this does not increase the amount of downloads of firebase data by much
        // since these are only downloaded when a user restores from a commit, not on every
        // single doc fetch
        return this.fbaseDB.ref(`pages/${docRef.docserver_id}/commit_data/${commit_ref.uniqueKey}`)
        .set(JSON.stringify(serialized_doc)).then(() => {
            return this.fbaseDB.ref(`pages/${docRef.docserver_id}/commit_refs/${commit_ref.uniqueKey}`).set(JSON.stringify(commit_ref.serialize()));
        }).then(callback).catch(function(error) { throw error; });
    }

    getCommit(docRef, commit_ref) { return new Promise((accept, reject) => {
        return this.fbaseDB.ref(`pages/${docRef.docserver_id}/commit_data/${commit_ref.uniqueKey}`).once('value', json_string => {
            return parseJsonString(json_string.val(), accept, reject);
        });
    }); }

    saveExternalCode(externalCode, hash) {
        if (config.no_remote_db_for_external_code) { return Promise.resolve(); }

        return fetch(`${this.metaserver}/sign/external_code/${hash}`).then(r => r.json()).then(({upload_url}) => {
            return fetch(upload_url, {method: 'PUT', body: externalCode}).then(() => {
                return this.externalCodeCache[hash] = ['cached', externalCode];
        });
    });
    }

    getExternalCode(hash) { return new Promise((accept, reject) => {
        const fetchRemoteExternalCode = () => // the no_remote_db_for_external_code flag ignores the hash so it's just broken but it's good for dev when
        // AWS takes too long
        (config.no_remote_db_for_external_code ? fetch(config.default_external_code_fetch_url, {mode: 'cors'})
        : fetch(`https://pagedraw-external-code.s3.amazonaws.com/${hash}`)
        ).then(function(r) {
            if (r.status === 200) { return r.text(); } else { return reject(new Error('Unable to fetch external code')); }
        });

        if (this.externalCodeCache[hash] === undefined) {
            this.externalCodeCache[hash] = ['loading', [accept]];
            return fetchRemoteExternalCode().then(externalCode => {
                const callbacks = this.externalCodeCache[hash][1];
                // FIXME: Evict this at some point
                this.externalCodeCache[hash] = ['cached', externalCode];
                return Array.from(callbacks).map((callback) => callback(externalCode));
            });

        } else if (this.externalCodeCache[hash][0] === 'loading') {
            return this.externalCodeCache[hash][1].push(accept);

        } else if (this.externalCodeCache[hash][0] === 'cached') {
            return accept(this.externalCodeCache[hash][1]);
        }
    }); }


    /* Last Sketch Import (for rebasing) */

    getLastSketchImportForDoc(docRef) { return new Promise((accept, reject) => {
        return this.fbaseDB.ref(`pages/${docRef.docserver_id}/last_sketch`).once('value').then(json_string => {
            return parseJsonString(json_string.val(), accept, reject);
        });
    }); }

    // Firebase has no way of checking key exists through their API without sending over an
    // entire doc json so we are forced to do this gross REST call
    doesLastSketchJsonExist(docRef) { return new Promise((accept, reject) => {
        return $.get(`${this.docserver_host}/pages/${docRef.docserver_id}.json?shallow=true`, data => {
            return accept((data != null ? data.last_sketch : undefined) != null);
        });
    }); }

    saveLatestSketchImportForDoc(docRef, doc) { return new Promise((resolve, reject) => {
        return this.fbaseDB.ref(`pages/${docRef.docserver_id}/last_sketch`).set(JSON.stringify(doc), err => {
            if (err) { return reject(); }
            return resolve();
        });
    }); }

    /* Figma Import Methods */

    getLastFigmaImportForDoc(docRef) { return new Promise((accept, reject) => {
        return this.fbaseDB.ref(`pages/${docRef.docserver_id}/last_figma`).once('value').then(json_string => {
            return parseJsonString(json_string.val(), accept, reject);
        });
    }); }

    saveLatestFigmaImportForDoc(docRef, doc, url) { return new Promise((resolve, reject) => {
        return this.fbaseDB.ref(`pages/${docRef.docserver_id}/last_figma`).set(JSON.stringify(doc), err => {
            if (err) { return reject(); }
            return resolve();
        });
    }); }


    /* StackBlitz methods */
    loadStackBlitz(blitz_id) {
        return fetch(`https://bumpy-paper.surge.sh/${blitz_id}`).then(resp => resp.json());
    }

    saveStackBlitz(blitz_package) {
        return fetch(`${this.metaserver}/sign/blitz_url.json`).then(r => r.json())
        .then(({upload_url, blitz_id}) => fetch(upload_url, {
            method: 'PUT',
            headers: new Headers({'Content-Type': 'application/json'}),
            body: JSON.stringify(blitz_package)
        }).then(() => blitz_id));
    }


    /* Libraries */

    createLibrary(app_id, name) {
        return fetchJsonFromRails(`${this.metaserver}/libraries.json`, {
            method: 'POST',
            body: {name, app_id, is_code_lib: true, is_public: false}
        }).then(function(resp) {
            if (!resp.ok) { return {err: new Error("Server error")}; }
            return resp.json();
        }).then(function(data) {
            if ((data.id == null) || (data.latest_version == null) || (data.name !== name)) { throw new Error('Unexpected response from server'); }
            return {err: null, data};
        }).catch(err => ({
            err
        }));
    }

    createLibraryVersion(lib, {name, bundle_hash, is_node_module, local_path, npm_path}) {
        return fetchJsonFromRails(`${this.metaserver}/libraries/${lib.library_id}/versions.json`, {
            method: 'POST',
            body: {name, bundle_hash, is_node_module, local_path, npm_path}
        }).then(function(resp) {
            if (!resp.ok) { return {err: new Error("Server error")}; }
            return resp.json();
        }).then(function(data) {
            if ((data.id == null) || (data.name !== name)) { throw new Error('Unexpected response from server'); }
            return {err: null, data};
        }).catch(err => ({
            err
        }));
    }

    getLibraryMetadata(lib_id, version_id) {
        return this.librariesRPC('get_version_metadata', {lib_id, version_id}).then(({ret}) => ret);
    }

    librariesForApp(app_id) {
        return $.getJSON(`${this.metaserver}/apps/${app_id}/all_libraries`);
    }

    librariesMostStarred() {
        return $.getJSON(`${this.metaserver}/libraries_most_starred`);
    }

    librariesRPC(action, args) {
        return fetchJsonFromRails(`${this.metaserver}/libraries_rpc`, {
            method: 'post',
            body: {data: _l.extend({}, args, {action})}
        }).then(function(resp) {
            if (!resp.ok) { throw new Error('Server error'); }
            return resp.json();
        });
    }
}
ServerClient.initClass();



//# Firebase hacks

// The very worst of Firebase compatibility
// Taken from https://github.com/firebase/firepad/blob/a8676c2979e5c189483720eacd50e52b8c3c60cd/lib/firebase-adapter.js#L377
// Based off ideas from http://www.zanopha.com/docs/elen.pdf
// Firebase only knows how to use strings for keys.  Sorting strings means alphabetical sort, obviously </sarc>.
// We want to have revisions be sequential numbers, but we also want to be able to get them in sequential order.
// In particular, we want to be able to ask Firebase to give us all the deltas after a certain number.
// This maps integers to strings which are in the same alphabetic order as the numbers are in ordinal number.
// revToFirebaseId :: int -> string
// If n and m are integers and n < m, revToIdChars(n) < revToIdChars(m) where `<` on strings is in firebase's
// alphabetic sorting.
const revToIdChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var revToFirebaseId = function(revision) {
    if (revision === 0) {
        return 'A0';
    }
    let str = '';
    while (revision > 0) {
        const digit = revision % revToIdChars.length;
        str = revToIdChars[digit] + str;
        revision -= digit;
        revision /= revToIdChars.length;
    }
    // Prefix with length (starting at 'A' for length 1) to ensure the id's sort lexicographically.
    const prefix = revToIdChars[str.length + 9];
    return prefix + str;
};

// Unused, included for completeness.  Goes FirebaseId -> Number
const revFromFirebaseId = function(revisionId) {
    assert((revisionId.length > 0) && (revisionId[0] === revToIdChars[revisionId.length + 8]));
    let revision = 0;
    let i = 1;
    while (i < revisionId.length) {
        revision *= revToIdChars.length;
        revision += revToIdChars.indexOf(revisionId[i]);
        i++;
    }
    return revision;
};


//# Offline hack

class OfflineClient extends ServerClient {
    constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.watchPage = this.watchPage.bind(this);
        this.casPage = this.casPage.bind(this);
        super(...args);
    }

    watchPage(docRef, callback, fail_to_load_callback) {
        // null will deserialize into a fresh doc
        if (fail_to_load_callback == null) { fail_to_load_callback = undefined; }
        callback([null, null]);
        return (function() {});
    }

    casPage(log_id, docRef, cas_token, new_json, callback) {
        return callback();
    }

    //# End of core Doc stuff. Here comes commit history saving
    saveCommit(commit_ref, serialized_doc, callback) {
        throw new Error('Not implemented');
    }

    getCommit(docRef, commit_ref) {
        throw new Error('Not implemented');
    }
}


//# Module exports

defaultExport.server_for_config = (server_for_config = function(_config) {
    if (_config.offline) {
        return new OfflineClient(
            _config.metaserver,
            _config.metaserver_csrf_token,
            _config.docserver_host,
            _config.compileserver_host,
            _config.sketch_importer_server_host);
    }

    if (_l.isEmpty(_config.docserver_host)) {
        return;
    }

    return new ServerClient(
        _config.metaserver,
        _config.metaserver_csrf_token,
        _config.docserver_host,
        _config.compileserver_host,
        _config.sketch_importer_server_host);
});

defaultExport.disconnect_all = () => Array.from(_l.values(firebaseAppsByHost)).map((app) => app.delete());

defaultExport.server = server_for_config(config);

export default defaultExport;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}