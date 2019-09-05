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
let assert, dfs, find_unused, firebase_safe_decode, firebase_safe_encode, FixedSizeStack, flatten_tree, flatten_trees_preorder_to_depth_list, getPngDimensions, getPngDimensionsFromDataUri, getPngUriFromBlob, if_changed, log_assert, map_tree, memoize_on, memoized_on, propLink, propLinkWithMutatedBlocks, sorted_buckets, track_error, track_warning, zip_dicts, zip_sets_by;
import _ from 'underscore';
import _l from 'lodash';
import config from './config';
import nodeUtil from 'util';
import md5 from 'blueimp-md5';
const defaultExport = {};

defaultExport.capitalize_first_char = str => `${str.slice(0,1).toUpperCase()}${str.slice(1)}`;

defaultExport.lowercase_first_char = str => `${str.slice(0,1).toLowerCase()}${str.slice(1)}`;

defaultExport.propLink = (propLink = (obj, prop, onChange) => ({
    value: obj[prop],

    requestChange(newval) {
        obj[prop] = newval;
        return onChange();
    }
}));

defaultExport.find_unused = (find_unused = function(existing_items, elem_gen, i) {
    let candidate, needle;
    if (i == null) { i = 0; }
    if (((needle = candidate = elem_gen(i)), !Array.from(existing_items).includes(needle))) { return candidate; } else { return find_unused(existing_items, elem_gen, i+1); }
});

// zip_dicts :: [{String: Object}] -> {String: [Object]}
// An array of dictionaries -> A dictionary of arrays
// assert zip_dicts([{a: 1, b: 2}, {a: 'foo', b: 'bar'}, {a: 'nyan', b: 'cat'}])
//   == {a: [1, 'foo', 'nyan'], b: [2, 'bar', 'cat']}
// assert zip_dicts([{a: 1, b: 2}, {a: 10, c: 99}])
//   == {a: [1, 10], b: [2, undefined], c: [undefined, 99]}
// assert zip_dicts([]) == {}
// assert zip_dicts([{a: 1, b: 2, c: 3}]) == {a: [1], b: [2], c: [3]}
defaultExport.zip_dicts = (zip_dicts = function(dicts) {
    const all_keys = _l.uniq(_l.flatten(_l.map(dicts, _l.keys)));
    return _l.fromPairs(_l.map(all_keys, key => [key, _l.map(dicts, key)]));
});

// zip_sets_by :: (Object -> String) -> [Set Object] -> Set [Object]
//   where Set a = [a], but the order of the array has no meaning
// zip_sets_by takes an ordered list of N sets with combined M unique elements and returns
//   a set of M ordered lists each of length N.  zip_sets_by effectively takes the transpose
//   of the list of sets, with the wrinkle that since the sets are unordered, we have to
//   match up the corresponding elements.  Elements in two sets correspond if they have the
//   same index() result.  We want to return a set of lists where each list's objects are in
//   the same equivalence class under index(), and each element in the list came from the set
//   in the same ordinal position.  That is, in each list in the set we return, the i-th
//   element of the list came from the i-th input set.  If the i-th input set has no elements
//   in the right equivalence class, the value is `undefined`.  If multiple elements in the
//   same input set are in the same equivalence class, one is selected.
// index :: (Object -> String).  `index` takes an element and returns a string
//   identifying the element.  Each element of a set in will be matched with its
//   counterparts in the other sets with the same index().
//   Technically an `index` is an underscore iteratee (http://underscorejs.org/#iteratee),
//   so index will often be a string.
/*
assert _.isEqual zip_sets_by('k', [
    [{k: 'a', num: 100}, {k: 'f', otro: 98}, {k: 'yo', more: 43}]
    [{k: 'yo', v: 'alice'}, {k: 'bob', v: 'katie'}, {k: 'a', qoux: 34}]
]), [
    [{k: 'a', num: 100}, {k: 'a', qoux: 34}]
    [{k: 'yo', v: more: 43}, {k: 'yo', v: 'alice'}]
    [{k: 'f', otro: 98}, undefined]
    [undefined, {k: 'bob', v: 'katie'}]
]

assert _.isEqual zip_sets_by(_.identity, [
    ['a', 'b', 'c', 'd']
    ['b', 'z', 'q', 'c', 'b']
]), [
    ['a', undefined]
    ['b', 'b']
    ['c', 'c']
    ['d', undefined]
    [undefined, 'z']
    [undefined, 'q']
]
*/
defaultExport.zip_sets_by = (zip_sets_by = function(index_key, sets) {
    const set_of_indexes = sets.map(set => _.indexBy(set, index_key));
    const index_of_per_object_lists = zip_dicts(set_of_indexes);
    const per_object_lists = _.values(index_of_per_object_lists);
    return per_object_lists;
});


// flatten_trees_preorder_to_depth_list :: [Tree] -> (Tree -> [Tree]) -> [{node: Tree, depth: Int}]
// depths start at 0
// Fun fact: the *inverse* of this function, a depth-list -> tree, is the pre-processing step
// indentation-aware languages like Python use to transform indented lines indentations to a
// meaningful tree.
defaultExport.flatten_trees_preorder_to_depth_list = (flatten_trees_preorder_to_depth_list = function(roots, get_children_iteratee) {
    const get_children_fn = _l.iteratee(get_children_iteratee);

    const depth_list = [];
    var walk = function(node, depth) {
        depth_list.push({node, depth});
        return Array.from(get_children_fn(node)).map((child) => walk(child, depth + 1));
    };
    for (let root of Array.from(roots)) { walk(root, 0); }
    return depth_list;
});


// map_tree :: A -> (A -> [A]) -> (A -> [B] -> B) -> B
// A and B are typically tree-ish types.  With this approach, the types don't have to a-priori be structurally
// trees, as long as you can provide a children_iteratee that returns the edges of a node as-if it were a tree.
// More typically, this is just nice because we don't have to assume a .children, and can parameterize over any
// concrete tree type.
// children_iteratee is a lodash iteratee, so you can pass it the string 'children' to have this operate over a
// tree where child nodes are a list off of the .children property
// map_tree preserves the ordering of the children it's handed.  You may, of course, reorder the children in the
// children_iteratee, and we will preserve the reordering.
var _map_tree = (root, getChildren, fn) => fn(root, getChildren(root).map(child => _map_tree(child, getChildren, fn)));
defaultExport.map_tree = (map_tree = (root, children_iteratee, fn) => _map_tree(root, _l.iteratee(children_iteratee), fn));


// flatten_tree :: A -> (A -> [A]) -> [A]
defaultExport.flatten_tree = (flatten_tree = function(root, getChildren) {
    const accum = [];
    _flatten_tree(root, getChildren, accum);
    return accum;
});

var _flatten_tree = function(root, getChildren, accum) {
    accum.push(root);
    return Array.from(getChildren(root)).map((child) => _flatten_tree(child, getChildren, accum));
};



// truth_table :: [Bool] -> String
// truth_table maps a list of bools into a string with a 't' for every true and an
//   'f' for every false.
// assert truth_table([true, true, false]) = "ttf"
// assert truth_table([false, false]) = "ff"
// assert truth_table([true]) = "t"
// assert truth_table([true, false, false, true]) = "tfft"
// assert truth_table([true, true, true, true]) = "tttt"
// assert truth_table([true, false]) = "tf"
defaultExport.truth_table = bools => (bools.map(function(b) { if (b) { return 't'; } else { return f; } })).join('');


//# Tools for dealing with firebase's not-quite JSON shenanigans
//  The following are all unused in the codebase as of 2/11/2017, but they should work

defaultExport.dropEmpty = function(n) {
    if (_l.isArray(n) || (_l.isObject(n) && (n.prototype === undefined) && (n.constructor === Object))) {
        return Array.from(_l.keys(n)).map((key) =>
            _l.isEmpty(n[key]) ?
                delete n[key]
            :
                dropEmpty(n[key]));
    }
};


defaultExport.FixedSizeStack = (FixedSizeStack = class FixedSizeStack {
    constructor(size) {
        this.size = size;
        this.data = [];
    }
    push(elem) {
        if (this.data.length >= this.size) { this.data.shift(); }
        return this.data.push(elem);
    }
    pop() { return this.data.pop(); }
    peek() { return _l.last(this.data); }
    clear() {
        return this.data = [];
    }
    length() { return this.data.length; }
});



defaultExport.firebase_safe_encode = (firebase_safe_encode = function(json) {
    if (_l.isArray(json)) {
        return {t: 'a', v: json.map(firebase_safe_encode)};

    } else if (_l.isPlainObject(json)) {
        return {t: 'o', v: _l.mapValues(json, firebase_safe_encode)};

    } else if (_l.isString(json)) {
        return {t: 's', v: json};

    } else if (_l.isBoolean(json)) {
        return {t: 'b', v: json};

    } else if (_l.isNumber(json)) {
        return {t: 'i', v: json};

    } else if (json === null) {
        return {t: 'e'};

    } else {
        throw new Error("unknown json type");
    }
});


defaultExport.firebase_safe_decode = (firebase_safe_decode = function(json) {
    if (((json != null ? json.t : undefined) == null)) { return {}; }
    switch (json.t) {
        case 'a':
            return new Array(json.v).map(firebase_safe_decode);

        case 'o':
            return _l.mapValues(json.v, firebase_safe_decode);

        case 's':
            return json.v;

        case 'b':
            return json.v;

        case 'i':
            return json.v;

        case 'e':
            return null;

        default:
            throw new Error("unknown type from firebase");
    }
});

defaultExport.memoize_on = (memoize_on = (cache, name, getter) => cache[name] != null ? cache[name] : (cache[name] = getter()));

defaultExport.memoized_on = (memoized_on = function(indexer, expensive_fn) {
    const cache = {};
    const index_fn = _l.iteratee(indexer);
    return function() {
        const index = index_fn(...arguments);
        return cache[index] != null ? cache[index] : (cache[index] = expensive_fn(...arguments));
    };
});



defaultExport.parseSvg = function(plain_text) {
    let parsed_xml, svg;
    try {
        parsed_xml = (new DOMParser()).parseFromString(plain_text, "image/svg+xml");
    } catch (error) {
        return null;
    }
    if (__guard__((svg = _l.head(parsed_xml.children)), x => x.tagName) === 'svg') { return svg; } else { return null; }
};

defaultExport.getDimensionsFromParsedSvg = parsed_svg => ({
    width: __guard__(parsed_svg.width != null ? parsed_svg.width.baseVal : undefined, x => x.value) != null ? __guard__(parsed_svg.width != null ? parsed_svg.width.baseVal : undefined, x => x.value) : 100,
    height: __guard__(parsed_svg.height != null ? parsed_svg.height.baseVal : undefined, x1 => x1.value) != null ? __guard__(parsed_svg.height != null ? parsed_svg.height.baseVal : undefined, x1 => x1.value) : 100
});

const getDimensionsFromB64Png = function(base64) {
  const header = atob(base64.slice(0, 50)).slice(16,24);
  const uint8 = Uint8Array.from(header, c => c.charCodeAt(0));
  const dataView = new DataView(uint8.buffer);
  return {
    width: dataView.getInt32(0),
    height: dataView.getInt32(4)
  };
};

// Expects dataUri to be of the form data:image/png;base64,encoded_image
defaultExport.getPngDimensionsFromDataUri = (getPngDimensionsFromDataUri = function(dataUri) {
    const encoded_image = dataUri.split(',')[1];
    return getDimensionsFromB64Png(encoded_image);
});


// Expects pngBlob to be a Web API Blob
defaultExport.getPngUriFromBlob = (getPngUriFromBlob = function(pngBlob, callback) {
    const reader = new FileReader();
    reader.onload = event => {
        const png_as_url = event.target.result;
        return callback(png_as_url);
    };
    return reader.readAsDataURL(pngBlob);
});

// Expects pngBlob to be a Web API Blob
defaultExport.getPngDimensions = (getPngDimensions = (pngBlob, callback) => getPngUriFromBlob(pngBlob, dataUri => callback(getPngDimensionsFromDataUri(dataUri))));

defaultExport.isPermutation = (arr1, arr2) => (arr1.length === arr2.length) && (_l.intersection(arr1, arr2).length === arr1.length);

defaultExport.splice = function(arr, ...args) {
        const ret = arr.slice();
        ret.splice(...Array.from(args || []));
        return ret;
    };

defaultExport.log_assert = (log_assert = function(expr) {
    let passes;
    let error = null;
    try {
        passes = expr();
        if (!passes) { error = new Error(expr.toString()); }
    } catch (e) {
        passes = false;
        error = e;
    }

    if (!passes) {
        if (config.assertHandler != null) { return config.assertHandler(expr); }
        if (config.environment === 'production') {
            return track_error(error, 'Assertion failed: ' + error.message);
        } else {
            return console.assert(false, expr.toString());
        }
    }
});

defaultExport.prod_assert = log_assert;

// Use this only if expr is expensive to compute. Favor log_assert instead.
defaultExport.assert = (assert = function(expr) {
    // FIXME these assertions should go somewhere or something
    // FIXME2: These asserts throw in all cases but the editor in production
    // Right now they will also throw in the compileserver since it doesnt get config.environment
    let passes;
    if ((config.asserts === false) || (config.environment === 'production')) { return; }

    try {
        passes = expr();
    } catch (error) {
        passes = false;
    }

    if (!passes) {
        if (config.assertHandler != null) { return config.assertHandler(expr); }

        // debugger
        // throw
        return console.assert(false, expr.toString());
    }
});

defaultExport.log = (msg, json) => console.log(nodeUtil.inspect(_l.extend({}, json, {msg}), {depth: 10}));

let registeredErrorTracker = undefined;
defaultExport.registerErrorTracker = rollbar => registeredErrorTracker = rollbar.handleErrorWithPayloadData;

// Track a warning without throwing it
defaultExport.track_warning = (track_warning = function(msg, json) {
    console.warn(msg, json);
    if (config.environment !== 'production') { return; }

    if (registeredErrorTracker != null) {
        return registeredErrorTracker(new Error(msg), {level: 'warning', json});
    } else if ((typeof window !== 'undefined' && window !== null ? window.Rollbar : undefined) != null) {
        return window.Rollbar.warning(msg, json);
    } else {
        return console.warn('No registered error tracker');
    }
});

defaultExport.track_error = (track_error = function(error, msg) {
    console.warn(msg, error);
    if (config.environment !== 'production') { return; }

    if (registeredErrorTracker != null) {
        return registeredErrorTracker(error, {level: 'error', json: {msg}});
    } else if ((typeof window !== 'undefined' && window !== null ? window.Rollbar : undefined) != null) {
        return window.Rollbar.error(msg, error);
    } else {
        return console.warn('No registered error tracker');
    }
});

defaultExport.collisions = function(list, iteratee) {
    if (iteratee == null) { iteratee = _l.identity; }
    const set = new Set();
    const collisions = [];
    list.forEach(function(elem) {
        let it;
        if (set.has((it = iteratee(elem)))) {
            collisions.push(it);
        }
        return set.add(it);
    });
    return collisions;
};

defaultExport.find_connected = function(start_points, get_neighbors) {
    const seen = new Set();
    var explore = function(node) {
        if (seen.has(node)) { return; }
        seen.add(node);
        return Array.from(get_neighbors(node)).map((neighbor) => explore(neighbor));
    };
    for (let start_point of Array.from(start_points)) { explore(start_point); }
    return Array.from(seen);
};

defaultExport.dfs = (dfs = function(node, match, get_next) {
    if (match(node)) {
        return node;
    } else {
        for (let child of Array.from(get_next(node))) {
            const found = dfs(child, match, get_next);
            if (found != null) { return found; }
        }
        return undefined;
    }
});

defaultExport.distanceSquared = (coordsA, coordsB) => Math.pow(coordsB[1] - coordsA[1], 2) + Math.pow(coordsB[0] - coordsA[0], 2);

defaultExport.throttled_map = (max_parallel, base, map_fn) => new Promise(function(resolve, reject) {
    let fire;
    let [i, in_flight_promises] = Array.from([0, 0]);
    const [results, errors] = Array.from([new Array(base.length), []]);

    return (fire = function() {
        while ((i < base.length) && (in_flight_promises < max_parallel)) {
            // Avoid the javascript loop variable hoisting issue with i.  Look up the `do` syntax for coffeescript.
            let curr;
            [curr, i] = Array.from([i, i + 1]);
            (function(curr) {

                in_flight_promises += 1;

                return map_fn(base[curr]).then(
                    (val => results[curr] = val),
                    (err => errors.push(err))

                ).then(function() {
                    in_flight_promises -= 1;
                    return fire();
                });
            })(curr);
        }

        if ((in_flight_promises === 0) && (i >= base.length)) { // the i >= base.length should be redundant
            if (!!_l.isEmpty(errors)) { return resolve(results); }
            if (!_l.isEmpty(errors)) { return reject(errors); }
        }
    })();
});

defaultExport.hash_string = str => md5(str);

// uninvoked_promise :: (-> (A | Promise A)) -> (Promise A, () -> Promise A)
defaultExport.uninvoked_promise = function(action) {
    let resolver = null;
    const promise = new Promise((accept, reject) => resolver = {accept, reject});
    const fire = function() {
        const fired = Promise.resolve().then(action);
        resolver.accept(fired);
        return fired;
    };
    return [promise, fire];
};

defaultExport.CV = function() {
    let resolve = null;
    const p = new Promise((accept, reject) => resolve = {accept, reject});
    return [p, resolve];
};

// after :: (() -> ()) -> ().  `after` takes a callback, instead of a promise, because promises have
// less fine grained control over scheduling; the .then schedules a microtask, whereas a callback is
// sync with whatever invokes it.  Feel free to pass {after: (cb) -> Promise.resolve().then => cb()}.
defaultExport.if_changed = (if_changed = ({value, compare, after}) => new Promise(function(resolve, reject) {
    const original_value = value();
    return after(function() {
        const changed = compare(original_value, value());
        return resolve(changed);
    });
}));

// For Perf. Use when you're sure you know which blocks can be mutated by this valueLink
defaultExport.propLinkWithMutatedBlocks = (propLinkWithMutatedBlocks = function(object, attr, onChange, mutated_blocks) {
    assert(() => (mutated_blocks != null ? mutated_blocks.length : undefined) > 0);
    return propLink(object, attr, () => onChange({mutated_blocks: _l.keyBy(_l.map(mutated_blocks, 'uniqueKey'))}));
});



// sorted_buckets :: [a] -> (a -> Equalable) -> [[a]]
// where Equalable is a type that supports == in a meaningful way, like string or number
// The second argument is a lodash interatee, so it can be a function, or a string naming a member like
//   sorted_buckets([{top: 12, ...}, {top: 11, ...}, {top: 12, ...}, {top: 119, ...}], 'top')
// Could be implemented differently to take an (a -> a -> Bool) as a second argument.
//   sorted_buckets([3, 4, 2, 5, 6, 2, 2.3, 4.1, 5, 5], _l.identity)            == [[2, 2], [2.3], [3], [4], [4.1], [5, 5, 5], [6]]
//   sorted_buckets([3, 4, 2, 5, 6, 2, 2.3, 4.1, 5, 5], ((o) -> Math.floor(o))) == [[2, 2, 2.3], [3], [4, 4.1], [5, 5, 5], [6]]
// Does not make any guarantees about the order elements within a bucket
defaultExport.sorted_buckets = (sorted_buckets = function(lst, it) {
    const fn = _l.iteratee(it);
    const sorted = _l.sortBy(lst, fn);

    let current_value = {}; // unequalable sentinal

    const buckets = [];
    for (let elem of Array.from(sorted)) {
        const next_value = fn(elem);
        if (current_value !== next_value) { buckets.push([]); }
        _l.last(buckets).push(elem);
        current_value = next_value;
    }
    return buckets;
});

export default defaultExport;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}