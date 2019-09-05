/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS203: Remove `|| {}` from converted for-own loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';

// returns a delta object
var diff = function(original, newer) {
    if (_l.isPlainObject(original) && _l.isPlainObject(newer)) {
        const orig_keys = _l.keys(original);
        const new_keys = _l.keys(newer);

        const deletions = _l.difference(orig_keys, new_keys);
        const additions = _l.difference(new_keys, orig_keys);

        let mutations = _l.intersection(new_keys, orig_keys);
        mutations = mutations.filter(key => !_l.isEqual(original[key], newer[key]));

        return {
            op: 'patch',
            deletions,
            additions: _l.pick(newer, additions),
            mutations: _l.fromPairs(mutations.map(k => [k, diff(original[k], newer[k])]))
        };

    } else {
        return {op: 'replace', value: _l.cloneDeep(newer)};
    }
};


// non-mutating; returns a new json
var patch = function(json, delta) {
    if (delta.op === 'patch') {
        let key;
        const clone = _l.assign({}, json, delta.additions);

        for (key of Array.from(delta.deletions)) {
            delete clone[key];
        }

        for (key of Object.keys(delta.mutations || {})) {
            const update = delta.mutations[key];
            clone[key] = patch(json[key], update);
        }

        return clone;

    } else if (delta.op === 'replace') {
        return delta.value;

    } else {
        throw new Error('unknown patch operation');
    }
};

export default {diff, patch};
