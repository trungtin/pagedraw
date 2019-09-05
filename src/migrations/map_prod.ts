// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ABORT_TRANSACTION, default_address_fetcher, default_throttle, foreachDoc, getAddressesForDocRefs, getAddressesForFilesInDir, getAddressesForTestDocs, nameAddress, noWriteMapProd, serializeAddress, transactionFile;
import '../../coffeescript-register-web';
import 'colors';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import _l from 'lodash';
import url from 'url';
import request from 'request';
import { zip_dicts, assert, throttled_map } from '../util';
import ProgressBar from 'progress';
import jsondiffpatch from 'jsondiffpatch';
import jsdiff from 'diff';
import config from '../config';
import compile from '../../compiler-blob-builder/compile';
import migrate_blitz from './migrate_blitz';
import prod_docs from '../../deploy-checks/fetch-prod-docs';
import { load_currently_deployed_compiler, load_compiler_by_hash } from '../../deploy-checks/fetch-other-compiler-build';
import server from '../editor/server';
const docserver_host = process.env['DOCSERVER_HOST'] || 'https://pagedraw-1226.firebaseio.com/';
const client = server.server_for_config({docserver_host});

//# Docs

const getMainAddressForDocRef = docRef => ({
    ty: 'main',
    docRef
});

const getAddressesForDocRef = docRef => Promise.all([
    client.getCommitRefs(docRef),
    client.getLastSketchImportForDoc(docRef) // FIXME: change to doesLastSketchImportExist
])
.then(function(...args) {
    const [commitRefs, sketchjson] = Array.from(args[0]);
    return _l.compact([
        sketchjson !== null ? {ty: 'sketch', docRef} : undefined,
        ...Array.from((commitRefs.map(commitRef => ({
            ty: 'commit',
            docRef,
            commitRef
        })))),
        getMainAddressForDocRef(docRef)
    ]);
});


const defaultExport = {};


defaultExport.getAddressesForDocRefs = (getAddressesForDocRefs = docRefs => Promise.all(docRefs.map(getAddressesForDocRef)).then(results => _l.flatten(results)));


//# Files

const get_all_subdirs = root_dir => Promise.resolve().then(() => promisify(fs.readdir)(root_dir).then(dirs => Promise.all(dirs.map(subdir => promisify(fs.lstat)(path.resolve(root_dir, subdir)).then(function(subdir_stat) {
    if     (subdir_stat.isDirectory()) { return subdir; }
    if (!subdir_stat.isDirectory()) { return undefined; }}))).then(subdir_or_undef => _l.compact(subdir_or_undef))));

defaultExport.getAddressesForFilesInDir = (getAddressesForFilesInDir = dir_path => promisify(fs.readdir)(dir_path).then(filenames => (() => {
    const result = [];
    for (let filename of Array.from(filenames)) {
        if (filename.endsWith('.json')) {
            result.push({ty: 'repofile', path: path.resolve(dir_path, filename)});
        }
    }

    return result;
})()));

defaultExport.getAddressesForTestDocs = (getAddressesForTestDocs = function() {
    // collect all test-data/*/*.json
    const root_dir = path.resolve(__dirname, '../../test-data');
    return get_all_subdirs(root_dir).then(subdirs => Promise.all(subdirs.map(subdir => getAddressesForFilesInDir(path.resolve(root_dir, subdir))))).then(files_by_dir => _l.flatten(files_by_dir));
});

defaultExport.transactionFile = (transactionFile = (addr, mapDocjson) => promisify(fs.readFile)(addr.path, 'utf8').then(initial_bytes => Promise.resolve(mapDocjson(JSON.parse(initial_bytes), addr)).then(function(mapped_json) {
    if (mapped_json === ABORT_TRANSACTION) {
        return null;
    } else {
        return promisify(fs.writeFile)(addr.path, JSON.stringify(mapped_json), 'utf8');
    }
})));

//#

defaultExport.serializeAddress = (serializeAddress = address => JSON.stringify(address));
const addrsMatch = (lhs, rhs) => _l.isEqual(lhs, rhs);

// a "safe" name that has only letters and hyphens.  These shouldn't be treated as stable yet.
defaultExport.nameAddress = (nameAddress = function(address) {
    switch (address.ty) {
        case 'main':     return `${address.docRef.page_id}`;
        case 'sketch':   return `sketch-${address.docRef.page_id}`;
        case 'commit':   return `commit-${address.docRef.page_id}-${address.commitRef.uniqueKey}`;
        case 'blitz':    return `blitz-${address.blitz_id}`;
        case 'repofile': return `file-${address.path}`;
        default:                 return Promise.reject(new Error(`Unknown type of DocjsonAddress ${address.ty}`));
    }
});


//#

defaultExport.ABORT_TRANSACTION = (ABORT_TRANSACTION = client.ABORT_TRANSACTION);

const dispatchTransaction = function(nameOfOperation, addr, mapDocjson) {
    switch (addr.ty) {
        case 'main':     return client.transactionPage(`migration-${nameOfOperation}`, addr, mapDocjson);
        case 'sketch':   return client.transactionLastSketch(addr, mapDocjson);
        case 'commit':   return client.transactionCommit(addr, mapDocjson);
        case 'blitz':    return migrate_blitz.blitz_transaction(ABORT_TRANSACTION, addr, mapDocjson);
        case 'repofile': return transactionFile(addr, mapDocjson);
        default:                 return Promise.reject(new Error(`Unknown type of DocjsonAddress ${addr.ty}`));
    }
};

//#

const mapProd = function(n_throttle, nameOfOperation, addresses, mapDocjson) {
    const bar = new ProgressBar('[:bar] :rate docs/sec :percent done :etas remain', {
        total: addresses.length, width: 50
    });

    const safeMapDocjson = process.env['MIGRATION'] ? mapDocjson : (docjson, addr) => mapDocjson(docjson, addr).then(function(result) {
        if (result !== ABORT_TRANSACTION) {
            console.warn('Trying to write without env var MIGRATION set. Aborting write.');
        }
        return ABORT_TRANSACTION;
    });

    return throttled_map(n_throttle, addresses, addr => dispatchTransaction(nameOfOperation, addr, safeMapDocjson)

    .catch(function(err) {
        console.error(`\nError on transaction ${serializeAddress(addr)}`);
        console.error(err);
        return process.exit(1);}).then(() => bar.tick()));
};



defaultExport.noWriteMapProd = (noWriteMapProd = (n_throttle, nameOfOperation, addresses, mapDocjson) => mapProd(n_throttle, nameOfOperation, addresses, (docjson, addr) => mapDocjson(docjson, addr).then(_mapped => ABORT_TRANSACTION)));

const _migration = (n_throttle, nameOfOperation, addresses, mapDocjson) => new Promise(function(accept, reject) {
    assert(() => process.env.MIGRATION != null);
    config.logOnSave = false; // tell server.coffee to shut up

    const ty_counts = {};

    return mapProd(n_throttle, nameOfOperation, addresses, (docjson, addr) => mapDocjson(_l.cloneDeep(docjson), addr).then(function(migrated) {
        if (ty_counts[addr.ty] == null) { ty_counts[addr.ty] = [0, 0]; }
        if (!_l.isEqual(migrated, docjson)) { ty_counts[addr.ty][0] += 1; }
        ty_counts[addr.ty][1] += 1;
        return migrated;}).catch(function(err) {
        console.error(`\nError mapping ${serializeAddress(addr)}`);
        console.error(err);
        process.exit(1);

        // really important we don't return undefined, or we might delete the doc
        return ABORT_TRANSACTION;})).then(function() {
        console.log("Migration done - Reporting # Mutated / Total");
        for (let ty in ty_counts) {
            const [mutated, total] = ty_counts[ty];
            console.log(`${_l.capitalize(ty)}: ${mutated}/${total} `);
        }
        console.log(`Total mutated: ${_l.sum(_l.values(ty_counts).map(function(...args) { let mutated, total; [mutated, total] = Array.from(args[0]); return mutated; }))}`);

        const total_docjsons = _l.sum(_l.values(ty_counts).map(function(...args) { let mutated, total; [mutated, total] = Array.from(args[0]); return total; }));
        console.log(`Total docjsons: ${total_docjsons}`);
        return accept();
    });
});

const log_compile_result_diffs = (results, new_results) => (() => {
    const result = [];
    const object = zip_dicts([results, new_results].map(results => _l.keyBy(results, 'filePath')));
    for (let filePath in object) {
        var [old_result, new_result] = object[filePath];
        if ((old_result == null) || (new_result == null)) {
            result.push(console.log(`${filePath} not in ${(old_result != null) ? "new version" : "old version"}`));

        } else if (old_result.contents !== new_result.contents) {
            console.log(`${filePath} changed`);
            result.push((() => {
                const result1 = [];
                for (let part of Array.from(jsdiff.diffLines(old_result.contents, new_result.contents))) {
                    if (part.added) { result1.push(process.stdout.write(part.value.green));
                    } else if (part.removed) { result1.push(process.stdout.write(part.value.red));
                    } else {
                        // part was unchanged.  Print a few lines of it for context
                        const lines = part.value.split('\n');
                        if (lines.length < 9) {
                            result1.push(process.stdout.write(part.value.grey));
                        } else {
                            result1.push(process.stdout.write(`\
${lines.slice(0, 3).join('\n').grey}
${"...".bgCyan}
${lines.slice(-3).join('\n').grey}\
`
                            ));
                        }
                    }
                }
                return result1;
            })());

        } else if (!_l.isEqual(old_result, new_result)) {
            console.log(`the json has changed for the file at ${filePath}`);
            result.push(jsondiffpatch.console.log(jsondiffpatch.diff(old_result, new_result)));
        } else {
            result.push(undefined);
        }
    }
    return result;
})();


const file_sets_are_equal = function(old_version, new_version) {
    // shortcut if they're exactly the same
    if (_l.isEqual(old_version, new_version)) { return true; }

    // ignore whitespace-only changes if the ENV flag is set
    if (process.env["IGNORE_WHITESPACE_CHANGES"]) {
        if (_l.every(
            (_l.toPairs(zip_dicts([old_version, new_version].map(results => _l.keyBy(results, 'filePath'))))),
            function(...args) {
                const array = args[0], filePath = array[0], [old_result, new_result] = Array.from(array[1]);
                return (old_result != null) && (new_result != null) && 

                // every part is either unchanged or just whitespace
                _l.every(jsdiff.diffLines(old_result.contents, new_result.contents), part => (!(part.added || part.removed)) || _l.isEmpty(part.value != null ? part.value.trim() : undefined));
        })) { return true; }
    }

    return false;
};

const _migrationCheck = (
    n_throttle,
    print_diffs,
    compile_check_on,
    nameOfOperation,
    addresses,
    mapDocjson
) => new Promise(function(accept, reject) {
    assert(() => process.env.MIGRATION == null);

    // compile_differences :: {ty: number}
    const [compile_differences] = Array.from([{}]);
    let error_count = 0;

    // ty_counts :: {ty: [number, number]}
    const ty_counts = {};

    let determinism_error_count = 0;

    const prod_compiler_promise =
        (process.env["VERSION_TO_COMPARE"] != null)
        ? load_compiler_by_hash(process.env["VERSION_TO_COMPARE"])
        : load_currently_deployed_compiler();

    return noWriteMapProd(n_throttle, nameOfOperation, addresses, function(docjson, addr) {
        if (ty_counts[addr.ty] == null) { ty_counts[addr.ty] = [0, 0]; }
        if (compile_differences[addr.ty] == null) { compile_differences[addr.ty] = 0; }

        ty_counts[addr.ty][1] += 1;

        const migration_promise = mapDocjson(_l.cloneDeep(docjson), addr);
        const second_try = mapDocjson(_l.cloneDeep(docjson), addr);

        // migration check: diff across the migration
        const migration_check_promise = migration_promise.then(function(migrated) {
            if (!_l.isEqual(migrated, docjson)) {
                ty_counts[addr.ty][0] += 1;
                if (print_diffs) {
                    console.log(""); // clear the progress bar line
                    console.log("DIFF ON", serializeAddress(addr));
                    return jsondiffpatch.console.log(jsondiffpatch.diff(docjson, migrated));
                }
            }
        });

        // determinism check: diff migration with itself
        const determinism_check_promise = Promise.all([migration_promise, second_try]).then(function(...args) {
            const [first, second] = Array.from(args[0]);
            if (!_l.isEqual(first, second)) {
                determinism_error_count += 1;
                console.log("");
                console.log("NON-DETERMINISTIC ON", serializeAddress(addr));
                return jsondiffpatch.console.log(jsondiffpatch.diff(first, second));
            }
        });

        // compile check: old_compiler(docjson) == new_compiler(migrate(docjson))
        const compile_check_promise = !compile_check_on ? null : Promise.all([
            migration_promise,
            prod_compiler_promise
        ]).then(function(...args) {
            const [migrated, prod_compiler] = Array.from(args[0]);
            let new_results = compile(migrated);
            let old_compile_results = prod_compiler(docjson);

            // clean up the compile results
            [new_results, old_compile_results] = Array.from([new_results, old_compile_results].map(function(results) {
                let files = results;
                // .componentRef is a legacy thing.  Remove the following line once the commit adding it is deployed.
                files = files.map(file => _l.omit(file, 'componentRef'));
                // ignore files where .shouldSync is false, because the CLI would ignore them
                files = _l.filter(files, 'shouldSync');
                // make the sort order of the files irrelevant
                files = _l.sortBy(files, 'filePath');
                // if there are multiple entries for a file path, ignore all of them, because it's invalid anyway
                files = files.filter(({filePath}) => !(_l.filter(files, {filePath}).length > 1));
                // return the adjusted files
                return files;
            }));

            if (!file_sets_are_equal(old_compile_results, new_results)) {
                console.log(''); // get out of the progress bar
                console.log('FOUND COMPILE DIFFERENCE:', serializeAddress(addr));
                log_compile_result_diffs(old_compile_results, new_results);
                return compile_differences[addr.ty] += 1;
            }
        });

        // wait for all checks to finish
        return Promise.all(_l.compact([
            migration_check_promise,
            compile_check_promise,
            determinism_check_promise
        ])).catch(function(err) {
            console.error(`\nError mapping ${serializeAddress(addr)}`);
            console.error(err);
            return error_count += 1;});

    }).then(function() {
        let ty;
        console.log("Migration done - Reporting # Mutated / Total");
        for (ty in ty_counts) {
            const [mutated, total] = ty_counts[ty];
            console.log(`${_l.capitalize(ty)}: ${mutated}/${total} `);
        }
        console.log(`Total mutated: ${_l.sum(_l.values(ty_counts).map(function(...args) { let mutated, total; [mutated, total] = Array.from(args[0]); return mutated; }))}`);

        const total_docjsons = _l.sum(_l.values(ty_counts).map(function(...args) { let mutated, total; [mutated, total] = Array.from(args[0]); return total; }));
        console.log(`Total docjsons: ${total_docjsons}`);

        const report = function(error_ty_count) {
            let str = '';
            for (ty in error_ty_count) {
                const diffs = error_ty_count[ty];
                str += `${_l.capitalize(ty)}: ${diffs} `;
            }
            return str;
        };
        console.log(`Compile differences - ${report(compile_differences)}`);
        console.log(`Internal errors: ${error_count}/${total_docjsons}`);
        console.log(`Non-deterministic migrations: ${determinism_error_count}`);

        if (determinism_error_count > 0) {
            console.log("MIGRATION IS NON-DETERMINISTIC".red);
        }

        const passed = _l.every([
            error_count === 0,
            _l.sum(_l.values(compile_differences)) === 0,
            determinism_error_count === 0
        ]);

        if (passed) {
            console.log("MIGRATION OK".green);
        } else {
            console.log("MIGRATION BAD".red);
        }

        return accept(passed, ty_counts);
    });
});



defaultExport.default_address_fetcher = (default_address_fetcher = () => new Promise(function(resolve, reject) {
    console.log(`Docserver Host: ${docserver_host}`);
    if (process.env['SINGLE_DOCSERVER_ID'] != null) {
        return resolve([getMainAddressForDocRef({docserver_id: process.env['SINGLE_DOCSERVER_ID']})]);
    }

    if (process.env['SINGLE_DOCADDR'] != null) {
        return resolve([JSON.parse(process.env['SINGLE_DOCADDR'])]);
    }

    if (process.env['TESTS_ONLY'] != null) {
        return resolve(getAddressesForTestDocs());
    }

    if (process.env['IMPORTANT_TESTS_ONLY'] != null) {
        return resolve(getAddressesForFilesInDir('test-data/important-docs'));
    }

    if (process.env['FIDDLES_ONLY'] != null) {
        return resolve(migrate_blitz.get_all_blitz_addresses());
    }

    // list the docs from dataclips
    const docRefsPromise = new Promise(function(resolve, reject) {
        const fetcher = (
            process.env['ALL_DOCS']
            ? prod_docs.fetch_all_docs
            : prod_docs.fetch_important_docs
        );

        return fetcher(doc_metas => resolve(doc_metas.map(({doc_id, docserver_id}) => client.getDocRefFromId(doc_id, docserver_id))));
    });

    // list the commits from docserver
    const docAddressesPromise = docRefsPromise.then(function(docRefs) {
        if (process.env['MAIN_ONLY']) {
        return docRefs.map(docRef => getMainAddressForDocRef(docRef));
        } else { return throttled_map(100, docRefs, getAddressesForDocRef).then(_l.flatten); }
    });

    // list the blitzes from s3
    // TODO: what about blitz staging??
    const blitzAddressesPromise = (
        process.env['ALL_DOCS'] && !process.env['MAIN_ONLY']
        ? migrate_blitz.get_all_blitz_addresses()
        : []
    );

    const fileAddressPromise = (
        process.env['ALL_DOCS'] && !process.env['MAIN_ONLY']
        ? getAddressesForTestDocs()
        : []
    );

    // combine the doc and blitz addresses
    const addressesPromise = Promise.all([
        docAddressesPromise,
        blitzAddressesPromise,
        fileAddressPromise
    ]).then(list_of_lists_of_addrs => _l.flatten(list_of_lists_of_addrs));

    const docCountPromise = Promise.all([
        docRefsPromise,
        blitzAddressesPromise,
        fileAddressPromise
    ]).then(list_of_lists_of_docishes => _l.sum(_l.map(list_of_lists_of_docishes, 'length')));


    return resolve(
        Promise.all([addressesPromise, docCountPromise])
        .then(function(...args) {
            const [addresses, doc_count] = Array.from(args[0]);
            console.log(`Going over ${doc_count} docs (${addresses.length} docjsons)`);
            return addresses;
        })
    );
}));


defaultExport.default_throttle = (default_throttle = Number(process.env['THROTTLE'] != null ? process.env['THROTTLE'] : "10"));

// useful general purpose for running queries over docs
defaultExport.foreachDoc = (foreachDoc = function(fn, param) {
    if (param == null) { param = {}; }
    const {parallel_docs} = param;
    return default_address_fetcher().then(addrs => noWriteMapProd((parallel_docs != null ? parallel_docs : default_throttle), "load_check", addrs, (docjson, addr) => Promise.resolve(fn(docjson, addr))
    .catch(err => // print and eat errors
    console.error(`ERROR ON ${serializeAddress(addr)}:`, err)))).then(() => server.disconnect_all());
});



// migration :: [DocjsonAddress] -> (docjson -> docjson) -> ()
defaultExport.migration = function(nameOfOperation, mapDocjson_maybe_sync) {
    const mapDocjson = (docjson, addr) => new Promise(function(accept, reject) {
        let mapped;
        try {
            mapped = mapDocjson_maybe_sync(docjson, addr);
        } catch (err) {
            reject(err);
        }

        return accept(mapped);
    });

    if (process.env.DEBUG && process.env.MIGRATION) {
        console.log("ERROR: choose DEBUG or MIGRATION mode");
        return process.exit(1);

    } else if (process.env.DEBUG && !process.env.MIGRATION) {
        console.log("MIGRATION [DEBUG]: this will check the migration, not do any writes");
        const compile_check_on = (process.env['COMPILE_CHECK'] !== 'false'); // true by default
        return default_address_fetcher()
            .then(addresses => _migrationCheck(default_throttle, (process.env["DEBUG_PRINT_DIFFS"] != null), compile_check_on, nameOfOperation, addresses, mapDocjson))
            .then(() => server.disconnect_all());


    } else if (!process.env.DEBUG && process.env.MIGRATION) {
        console.log("MIGRATION: this will mutate production docs. I hope you know what you're doing");
        return default_address_fetcher()
            .then(addresses => _migration(default_throttle, nameOfOperation, addresses, mapDocjson))
            .then(() => server.disconnect_all());

    } else {
        console.log("ERROR: choose DEBUG or MIGRATION mode");
        return process.exit(1);
    }
};


defaultExport.migrationCheck = function(mapDocjson_maybe_sync) {
    const mapDocjson = (docjson, addr) => new Promise(function(accept, reject) {
        let mapped;
        try {
            mapped = mapDocjson_maybe_sync(docjson, addr);
        } catch (err) {
            reject(err);
        }

        return accept(mapped);
    });

    const compile_check_on = (process.env['COMPILE_CHECK'] !== 'false'); // true by default
    return default_address_fetcher()
        .then(addresses => _migrationCheck(default_throttle, (process.env["DEBUG_PRINT_DIFFS"] != null), compile_check_on, "check", addresses, mapDocjson))
        .then(function(passed, ty_counts) {
            server.disconnect_all();

            // it would be really good to know if this would hang if we weren't here...
            return process.exit(passed ? 0 : 1);
    });
};

//#

defaultExport.downloadDoc = addr => new Promise((resolve, reject) => dispatchTransaction("read", addr, (docjson, _addr) => Promise.resolve().then(function() {
    assert(() => addrsMatch(addr, _addr));
    setTimeout(() => resolve(docjson));
    return ABORT_TRANSACTION;
})));
export default defaultExport;
