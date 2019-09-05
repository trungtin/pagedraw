/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import { assert, hash_string } from './util';
import config from './config';
import util from 'util';
import { server } from './editor/server';

// these functions should only ever run in the editor.
assert(() => typeof window === 'object');

// FIXME: These should probably be set in config
const devcodeserver = 'http://localhost:6565';
const extcodeserver = 'https://cdn.pagedraw.xyz';

const initContentWindowGlobals = function(contentWindow) {
    if ((contentWindow.pd__loaded_libs == null)) {
        contentWindow.pd__loaded_libs = new Set();
        contentWindow.pd__loading_libs = new Map();
        return contentWindow.pd__dataForId = {};
    }
};

const defaultExport = {};

defaultExport.loadDevLibrary = function(contentWindow) {
    initContentWindowGlobals(contentWindow);
    return loadLibrary(contentWindow, '__internal_dev_lib_id', `${devcodeserver}/bundle.js`);
};

defaultExport.loadProdLibrary = function(contentWindow, id) {
    initContentWindowGlobals(contentWindow);
    return loadLibrary(contentWindow, id, `${extcodeserver}/${id}`);
};


// NOTE: I'm doing window. here to guarantee our bundling process won't change the name of this function,
// since router.cjsx error handling searches for this function name to know if there was an error in user code
if (typeof window !== 'undefined' && window !== null) {
    window.__evalBundleWrapperForErrorDetector = function(contentWindow, bundle) {
    const wrapBundle = bundle => `\
{"use strict";
${bundle}
;\nreturn PagedrawSpecs;\n}\
`;
    return (contentWindow.Function(wrapBundle(bundle)))();
};
}

// loadLibrary :: (contentWindow, id, url) -> Promise<{status: 'ok', data: any} | {status: 'net-err', error} | {status: 'user-err', userError}>
// status 'ok' == data successfully loaded
// status 'no-op' == data previously loaded
// status 'net-err' == no internet connection available
// status 'user-err' == user code has errors
// promise throws == pagedraw fucked up, crash
var loadLibrary = (contentWindow, id, url) => new Promise(function(resolve, reject) {
    let callback, loading;
    if (contentWindow.pd__loaded_libs.has(id)) {
        console.warn(`Attempt to load already loaded library ${id}. Not loading.`);
        return resolve({status: 'no-op', data: contentWindow.pd__dataForId[id]});
    }

    if ((loading = contentWindow.pd__loading_libs.get(id)) != null) {
        console.warn(`Attempt to load loading library ${id}. Waiting...`);
        callback = function(specs, errType, error, userError) {
            if ((typeof err === 'undefined' || err === null)) {
            return resolve({status: 'ok', data: specs});
            } else { return resolve({status: errType, error, userError}); }
        };
        return loading.callbacks.push(callback);
    } else {
        contentWindow.pd__loading_libs.set(id, {callbacks: []});

        const get_code = () => fetch(url).then(r => r.text()).then(bundle => ({
            error: null,
            bundle
        })).catch(error => ({
            error
        }));

        const resolve_with_error = function(errType, error, userError) {
            resolve({status: errType, error, userError});
            const {
                callbacks
            } = contentWindow.pd__loading_libs.get(id);
            contentWindow.pd__loading_libs.delete(id);
            return (() => {
                const result = [];
                for (callback of Array.from(callbacks)) {                         result.push(callback(undefined, errType, error, userError));
                }
                return result;
            })();
        };

        return get_code().then(function({error, bundle}) {
            if (error != null) { return resolve_with_error('net-err', error, null);
            } else {
                const eval_result = window.__evalBundleWrapperForErrorDetector(contentWindow, bundle);
                const specs = (typeof eval_result === 'object') && (eval_result.default != null) ? eval_result.default : eval_result;

                contentWindow.pd__loaded_libs.add(id);

                // FIXME: This might leak too much memory
                contentWindow.pd__dataForId[id] = specs;

                resolve({status: 'ok', data: specs});
                const {
                    callbacks
                } = contentWindow.pd__loading_libs.get(id);
                contentWindow.pd__loading_libs.delete(id);
                return (() => {
                    const result = [];
                    for (callback of Array.from(callbacks)) {                             result.push(callback(specs));
                    }
                    return result;
                })();
            }
        }).catch(e => // we threw while evaluating user code.
        resolve_with_error('user-err', null, e));
    }
});


const connection_timeout = 20000;
const connection = {};
// subscribeToDevServer :: ((id | -1, [error]) -> ()) -> ()
defaultExport.subscribeToDevServer = function(on_build) {
    // library in development always has id == $0
    // when we add support for multiple libraries we'll need to
    // add support for more ids too, which should be of the format
    // $1, $2, $3...
    let source;
    const disconnect = function() {
        if (connection.timeout_timer != null) { clearInterval(connection.timeout_timer); }
        if (connection.source != null) {
            connection.source.close();
        }
        delete connection.source;
        return on_build("0", ['disconnected']);
    };

    connection.source = (source = new window.EventSource(`${devcodeserver}/__webpack_hmr`));
    source.onopen = () => connection.last_active = new Date();
    source.onerror = () => disconnect();
    source.onmessage = function(event) {
        connection.last_active = new Date();
        if (event.data === "\uD83D\uDC93") { return; } //dev server heartbeat
        try {
            const data = JSON.parse(event.data);
            if (data.action === 'built') { return on_build("$0", data.errors || []); }
        } catch (e) {
            return console.warn(`HR Error: ${e}`);
        }
    };

    window.addEventListener("beforeunload", disconnect);

    return connection.timeout_timer = setInterval((function() { if ((connection.last_active != null) && ((new Date() - connection.last_active) > connection_timeout)) { return disconnect(); } }), connection_timeout);
};

// publishDevLibrary :: (static_id) -> Promise<{status: 'ok', hash: string} | {status: 'net-err', error} | {status: 'user-err', error}>
// status 'ok'  == library was successfully uploaded
// status 'net-err' == Unable to reach the CLI
// status 'user-err' == user code has errors
// promise throws = pagedraw error, crash
defaultExport.publishDevLibrary = static_id => new Promise((resolve, reject) => uploadLibraryData(static_id).then(function({status, error, id}) {
    if (status ==='internal-err') { return reject(new Error("Internal error while uploading library"));
    } else { return resolve({status, error, hash: id}); }
}));


var uploadLibraryData = function(static_id) {
    const payload = { static_id, host: extcodeserver, metaserver: config.metaserver };
    return fetch(`${devcodeserver}/exit_dev`, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    }).then(function(response) {
        if (!response.ok) { throw new Error();
        } else { return response.json(); }
    }).catch(error => ({
        status: 'net-err',
        error: new Error('Unable to connect to the CLI')
    }));
};

defaultExport.libraryCliAlive = () => fetch(`${devcodeserver}/are-you-alive`).then(response => response.ok).catch(() => false);
export default defaultExport;
