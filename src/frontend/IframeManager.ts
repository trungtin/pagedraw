// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let GeomGetterManager, messageIframe, registerIframe, RenderManager, unregisterIframe, util;
import _l from 'lodash';
const {assert} = (util = require('../util'));
import { server } from '../editor/server';
import { serialize_pdom } from '../pdom';

const iframesById = {};
const messageCallbacks = {};

const defaultExport = {};

defaultExport.registerIframe = (registerIframe = function(iframe, iframe_id, callback) {
    if (iframesById[iframe_id] == null) { iframesById[iframe_id] = {status: 'registered'}; }
    iframesById[iframe_id].onLoad = callback;
    iframesById[iframe_id].iframe = iframe;
    if (iframesById[iframe_id].status === 'loaded') { return callback(); }
});

defaultExport.unregisterIframe = (unregisterIframe = function(iframe_id) {
    // FIXME: there's a race condition where __IFRAME_LOADED might be called after the iframe was
    // unregistered
    delete messageCallbacks[iframe_id];
    return delete iframesById[iframe_id];
});

// The IframeManager abstraction assumes messageIframe is called by no one else but here
defaultExport.messageIframe = (messageIframe = (iframe_id, message) => new Promise(function(accept, reject) {
    assert(() => iframesById[iframe_id] != null);
    const message_id = String(Math.random()).slice(2);
    messageCallbacks[message_id] = [accept, reject];
    return iframesById[iframe_id].iframe.contentWindow.postMessage((_l.extend({}, message, {message_id})), '*');
})); // FIXME: figure out what the location should be for security

if (typeof window !== 'undefined' && window !== null) {
    const receiveMessage = event => {
        const {type, iframe_id, message_id} = event.data;
        if (type === 'v1/__IFRAME_LOADED') {
            if (iframesById[event.data.iframe_id] == null) { iframesById[event.data.iframe_id] = {}; }
            iframesById[event.data.iframe_id].status = 'loaded';
            if (typeof iframesById[event.data.iframe_id].onLoad === 'function') {
                iframesById[event.data.iframe_id].onLoad();
            }
        }

        return (messageCallbacks[message_id] != null ? messageCallbacks[message_id][0](event.data) : undefined);
    };

    window.addEventListener('message', receiveMessage, false);
}


/*
states:
- no iframe
- iframe loading
- iframe loaded
- iframe evaling (hash)
- iframe evaled (hash)
*/

defaultExport.GeomGetterManager = (GeomGetterManager = class GeomGetterManager {
    constructor() {
        this._iframe_started_callback = this._iframe_started_callback.bind(this);
        this.queue = [];
        this.preheat = null; // preheat functions as kind of the end of the queue
        this.iframe_id = null;

        // only schedule should touch:
        this.pending = 0;
        this.loaded_code_hash = null;
        this.loading_code_hash = null;
    }

    iframe_available(iframe, iframe_id) {
        if (this.iframe_id != null) { unregisterIframe(this.iframe_id); }

        this.iframe_id = iframe_id;
        registerIframe(iframe, this.iframe_id, this._iframe_started_callback);
        return this.schedule();
    }

    _iframe_started_callback() {
        this.loaded_code_hash = null;
        this.loading_code_hash = null;
        this.iframe_clean = true;
        return this.schedule();
    }

    preheat(code_hash) {
        server.getExternalCode(code_hash);    // just preheat the cache.  TODO: Think carefully about eviction
        this.preheat = code_hash;
        return this.schedule();
    }

    getGeomForPdom(opts, code_hash) {
        return this.with_code_hash_evaled_in_iframe(code_hash, () => {
            return messageIframe(this.iframe_id, _l.extend({type: 'v1/MIN_GEOMETRIES'}, opts, {pdom: serialize_pdom(opts.pdom)})).then(function({err, minWidth, minHeight}) {
                const notNan = function(val) { if (_l.isFinite(val)) { return val; } else { return 0; } };
                return {err, geometry: _l.mapValues({minWidth, minHeight}, notNan)};});
    });
    }

    // private
    with_code_hash_evaled_in_iframe(code_hash, action) {
        // cancel any preheats.  You're about to say *for sure* what the next thing should be.
        this.preheat = null;
        // Preheat the code cache.  TODO: Think carefully about eviction
        server.getExternalCode(code_hash);
        const [promise, fire] = Array.from(util.uninvoked_promise(action));
        // NOTE: this is implicitly scheduling.  We could pick placement in the queue differently to minimize
        // iframe reloads.  In practice, in-order should always be what we want here.
        this.queue.push({code_hash, action: fire});
        this.schedule();
        return promise;
    }

    schedule() {
        if (this.iframe_id === null) { return; }
        while ((this.queue[0] != null) && (this.queue[0].code_hash === this.loaded_code_hash)) { (() => {
            const {action} = this.queue.shift();
            this.pending += 1;
            return action().finally(() => {
                this.pending -= 1;
                // finally should only be called asynchronously, so schedule shouldn't have to be re-entrant
                return this.schedule();
            });
        })(); }
        // invariant:  (@queue[0]? and @queue[0].code_hash == @loaded_code_hash) == false
        //         ->  not (@queue[0]?) or not (@queue[0].code_hash == @loaded_code_hash)
        //         ->  _l.isEmpty(@queue) or @queue[0].code_hash != @loaded_code_hash
        if (this.pending > 0) { return; }
        if (this.queue[0] != null) {
            return this.should_be_loading_code_hash(this.queue[0].code_hash);
        } else if (this.preheat !== null) {
            // queue takes precedence over preheat because preheat is basically the end of the queue
            this.preheat = null;
            return this.should_be_loading_code_hash(this.preheat);
        } else if (this.loaded_code_hash === null) {
            // TODO it would be nice to load the iframe, without sending it code to eval
            return;
        }
    }

    should_be_loading_code_hash(hash) {
        // make sure no one tries to treat the iframe as loaded on the previous thing while
        // we should be loading
        this.loaded_code_hash = null;
        if (this.loading_code_hash === hash) {
            // we're already doing what we're doing.  Keep doing it; we're good
            return;
        } else if (this.loading_code_hash === null) {
            this.loading_code_hash = hash;
            return this.do_load_code_hash(hash).then(() => {
                [this.loaded_code_hash, this.loading_code_hash] = Array.from([hash, null]);
                return this.schedule();
            });
        } else {
            // someone else is loading.  We should to cancel it. Instead, we're just
            // going to wait for it to finish, and when it is, we'll be re-run, and
            // get a second chance to load the right thing
            return;
        }
    }

    do_load_code_hash(hash) { return new Promise((accept, reject) => {
        if (this.iframe_clean === false) {
            let new_iframe;
            const {
                iframe
            } = iframesById[this.iframe_id];
            unregisterIframe(this.iframe_id);
            iframe.parentNode.replaceChild((new_iframe = iframe.cloneNode()), iframe);
            return registerIframe(new_iframe, this.iframe_id, this._iframe_started_callback);

        } else {
            return server.getExternalCode(hash).then(code => {
                util.assert(() => (code != null));
                return messageIframe(this.iframe_id, {type: 'v1/SETUP', external_code: code}).then(() => {
                    this.iframe_clean = false;
                    return accept();
                });
            });
        }
    }); }
});

defaultExport.RenderManager = (RenderManager = class RenderManager {
    constructor() {
        this._iframe_started_callback = this._iframe_started_callback.bind(this);
        [this.iframe, this.iframe_id, this.next_opts, this.next_hash, this.iframe_started] = Array.from([null, null, null, null, false]);
    }

    iframe_available(iframe, iframe_id) {
        if (this.iframe_id != null) { unregisterIframe(this.iframe_id); }

        this.iframe_id = iframe_id;
        // TODO: The below did not work. Ask Jared why
        //registerIframe(iframe, @iframe_id).then(@_iframe_started_callback)
        return registerIframe(iframe, this.iframe_id, this._iframe_started_callback);
    }

    _iframe_started_callback() {
        this.current_hash = (this.current_opts = null);
        [this.iframe_clean, this.iframe_started] = Array.from([true, true]);
        return this.schedule();
    }

    render(opts, code_hash) {
        let promise;
        this.next_opts = opts;
        this.next_hash = code_hash;

        [promise, this.current_promise] = Array.from(util.CV());

        this.schedule();
        return promise;
    }


    schedule() {
        if ((this.next_opts === null) || (this.next_hash === null)) { return; }
        if ((this.iframe_id === null) || !this.iframe_started) { return; }
        if ((this.current_hash === this.next_hash) && (this.current_opts === this.next_opts)) { return; }

        if (this.current_hash === this.next_hash) {
            const pending_promise = this.current_promise;
            return this.pending_load.then(() => {
                const opts = this.next_opts;
                if (window.hello) { throw new Error('hai'); }
                return this.do_render(opts).then(() => {
                    pending_promise.accept();
                    this.current_opts = opts;
                    return this.schedule();
            });
            }).catch(err => {
                // Ignore the error if the user is trying to load a new @next_hash
                if (this.current_hash !== this.next_hash) {
                    return this.schedule();
                } else {
                    return this.current_promise.reject(err);
                }
            });

        } else {
            [this.current_hash, this.pending_load] = Array.from([this.next_hash, this.do_load_code_hash(this.next_hash)]);
            return this.schedule();
        }
    }

    do_render(opts) {
        return messageIframe(this.iframe_id, _l.extend({type: 'v1/RERENDER'}, opts));
    }

    do_load_code_hash(hash) { return new Promise((accept, reject) => {
        if (this.iframe_clean === false) {
            let new_iframe;
            const {
                iframe
            } = iframesById[this.iframe_id];
            unregisterIframe(this.iframe_id);
            iframe.parentNode.replaceChild((new_iframe = iframe.cloneNode()), iframe);
            return registerIframe(new_iframe, this.iframe_id, this._iframe_started_callback);

        } else {
            return server.getExternalCode(hash).then(code => {
                if ((code == null)) { return reject(new Error('External code not found for hash: ' + hash)); }
                return messageIframe(this.iframe_id, {type: 'v1/SETUP', external_code: code}).then(() => {
                    accept();
                    this.iframe_clean = false;
                    this.current_hash = hash;
                    return this.schedule();
                });
            });
        }
    }); }
});
export default defaultExport;
