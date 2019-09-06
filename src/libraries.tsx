// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS203: Remove `|| {}` from converted for-own loops
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let CheckboxPropControl, ColorPropControl, componentOfExternalSpec, DropdownPropControl, ExternalCodeSpec, FunctionPropControl, isExternalComponent, Library, ListPropControl, NumberPropControl, ObjectPropControl, ObjectPropValue, PropInstance, PropSpec, StringPropControl;
import _l from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
({PropSpec, ObjectPropValue, PropInstance, ColorPropControl, DropdownPropControl, FunctionPropControl, PropSpec, CheckboxPropControl, ListPropControl, StringPropControl, NumberPropControl, ObjectPropControl} = require('./props'));
import { Model, setsOfModelsAreEqual, rebaseSetsOfModels } from './model';
import config from './config';
import { server } from './editor/server';
import { loadProdLibrary, loadDevLibrary, publishDevLibrary } from './lib-cli-client';
import { log_assert as assert } from './util';
import { assert as non_prod_assert } from './util';
import { track_error } from './util';

const modelIsEqualModuloUniqueKeys = function(one, other) {
    if ((one == null)) { throw Error('One cant be undefined'); }
    // models are never equal to null or undefined
    if (other == null) { return false; }

    // verify they're the same type type
    if (other.constructor !== one.constructor) { return false; }

    // verify all their properties match by isEqual, or a custom check if it's overridden
    const customEqualityChecks = one.getCustomEqualityChecks();
    for (let prop of Object.keys(one.constructor.__properties || {})) {
        const ty = one.constructor.__properties[prop];
        if (prop === 'uniqueKey') { continue; }
        if (!(customEqualityChecks[prop] != null ? customEqualityChecks[prop] : isEqualModuloUniqueKeys)(one[prop], other != null ? other[prop] : undefined)) {
            // get that short circuiting behavior
            return false;
        }
    }

    // all checks passed; they're equal
    return true;
};

// FIXME: Until we fix the model system unique key stuff...
var isEqualModuloUniqueKeys = function(a, b) {
    if ((a === null) || (a === undefined) || _.isString(a) || _.isNumber(a) || _.isBoolean(a)) { return a === b;
    } else if (_l.isArray(a)) { return _l.isArray(b) && (a.length === b.length) && _l.every(_l.zip(a, b), function(...args) { const [ea, eb] = Array.from(args[0]); return isEqualModuloUniqueKeys(ea, eb); });
    } else if (a instanceof Model) { return modelIsEqualModuloUniqueKeys(a, b);
    } else { throw new Error('Unexpected type'); }
};

//# NOTES: TODOS for external code
// - A plan for supporting bundled code updates forever
// - serialize_pdom should work on dynamic pdoms and should deserialize on the other end so evalPdom works since it uses
// instanceof Dynamic
// - normalizeAsync should setup the doc.ExternalCodeSpecTrees and stuff
//
// - Move users to mycompany.pagedraw.io (Huge for security)
// - Decide where the iframe boundary should go
// - Performance (?)

const controlForType = type => {
    if (type === 'Text') {                               return StringPropControl;
    } else if (type === 'Number') {                        return NumberPropControl;
    } else if ((type === 'Boolean') || (type === 'Checkbox')) { return CheckboxPropControl;
    } else if (type === 'Function') {                      return FunctionPropControl;
    } else if ((type === 'Enum') || (type === 'Dropdown')) {    return DropdownPropControl;
    } else if (type === 'Color') {                         return ColorPropControl;
    } else if (_l.isArray(type)) {                        return ListPropControl;
    } else if (_l.isObject(type)) {                       return ObjectPropControl; }
};

// NOTE: This is not passing down key to supportLegacy and that's weird but that shouldn't change the .type of the output
const stringifyPropType = propType => supportLegacyPropType(propType).type;

var supportLegacyPropType = function(propType, key) {
    if (_l.isString(propType)) {            return {type: propType, name: key};
    } else if (propType.__ty === 'Enum') {     return {type: 'Enum', options: propType.options};
    } else {                                return propType; }
};

var propSpecOfExternalPropTypes = (key, propType, prefix) => {
    if (prefix == null) { prefix = ''; }
    propType = supportLegacyPropType(propType, key);

    const {type, name, defaultValue} = propType;
    const required = _l.defaultTo(propType.required, false);
    const hasUnpresentValue = (defaultValue == null);
    const presentByDefault = (defaultValue != null);
    const Control = controlForType(type);

    if (type === 'Enum') {
        const {options} = propType;
        if (!_l.isArray(options)) {
            throw new Error('Enum type should specify "options" as an Array');
        }
        if (!_l.every(options, _l.isString)) {
            throw new Error('Enum type only supports string in "options" Array');
        }

        return new PropSpec({
            name: key,
            title: name,
            hasUnpresentValue,
            presentByDefault,
            required,
            uniqueKey: `${prefix}->${key}:En`,
            control: new Control({options, defaultValue})
        });

    } else if (_l.isArray(type)) {
        if (_l.isEmpty(type)) {
            throw new Error('List type should define at least one element as the list shape');
        }

        return new PropSpec({
            name: key,
            title: name,
            hasUnpresentValue,
            required,
            uniqueKey: `${prefix}->${key}:[]`,
            control: new Control({
                elemType: propSpecOfExternalPropTypes(null, type[0], `${prefix}->${key}:[]`).control
            })
        });

    } else if (_l.isObject(type)) {
        return new PropSpec({
            name: key,
            title: name,
            hasUnpresentValue,
            presentByDefault,
            required,
            uniqueKey: `${prefix}->${key}:{}`,
            control: new Control({
                attrTypes: _l.map(type, (memberType, k) => propSpecOfExternalPropTypes(k, memberType, `${prefix}.${k}->${stringifyPropType(memberType)}`))
            })
        });

    } else if (Control != null) {
        return new PropSpec({
            name: key,
            title: name,
            required,
            hasUnpresentValue,
            presentByDefault,
            uniqueKey: `${prefix}->${key}:${type}`,
            control: new Control({defaultValue})
        });

    } else {
        throw new Error(`Invalid control type '${type}' for key '${key}'`);
    }
};

// UserSpec :: {
//   pdUniqueKey: String?
//
//   pdIsDefaultExport: Boolean?
//
//   # like prop types, but for controls
//   pdPropControls: PropControlsObject?
//
//   # array containing 'width' and/or 'height'
//   pdResizable: [String]?
//
//   # Like [['css_a_id', full_css_string_for_a], ['css_b_id', full_css_string_for_b]]
//   pdIncludeCSS: [(String, String)]?
// }
// and UserSpec instanceof React.Component
//
// user_specs :: {
//   [component_name]: UserSpec
// }
const parseUserSpecs = (user_specs, lib_name) => _l.map(user_specs, function(UserSpec, component_name) {
    //throw new Error("User exported `#{name}` is not a React Component") if UserSpec not instanceof React.Component

    const ref = (UserSpec.pdUniqueKey != null ? UserSpec.pdUniqueKey : component_name + lib_name);
    const resizable = UserSpec.pdResizable != null ? UserSpec.pdResizable : ['width', 'height'];
    const propControl = propSpecOfExternalPropTypes(
        null, {type: UserSpec.pdPropControls != null ? UserSpec.pdPropControls : {}},
        `${ref}:Component`
    ).control;

    return {
        ref, name: component_name,
        render(props) { return <UserSpec {...props} />; },
        flexWidth: Array.from(resizable).includes('width'),
        flexHeight: Array.from(resizable).includes('height'),
        propControl
    };
});

const defaultExport = {};

defaultExport.isExternalComponent = (isExternalComponent = component => (component != null ? component.componentSpec : undefined) instanceof ExternalCodeSpec);

const parseLibLoad = function({status, error, data, userError}, uniqueKeyToAppend) {
    let err, externalCodeSpecs, user_specs;
    if (status === 'user-err') {
        assert(() => (userError != null));
        return {err: userError, status};
    }

    assert(() => (userError == null));

    if (status === 'net-err') {
        return {err: error, status};
    }

    if ((status !== 'ok') && (status !== 'no-op')) {
        throw new Error(`Unknown status while loading library: ${status}`);
    }

    if (!_l.isObject(data)) { return {err: new Error('pagedraw develop exported something that is not an object')}; }

    if (_l.isEmpty(_l.keys(data))) { return {err: new Error('pagedraw develop exported empty object')}; }

    // FIXME: This should probably not mutate the library
    // We should just compute the specs and asser that it didnt change wrt the "official"
    // library load (upon publish)
    try {
        user_specs = parseUserSpecs(data, uniqueKeyToAppend);
    } catch (error1) {
        err = error1;
        return {err};
    }

    if (_l.isEmpty(user_specs)) { return {err: new Error('Library has 0 components')}; }

    try {
        externalCodeSpecs = user_specs.map(spec => ExternalCodeSpec.from(spec));
    } catch (e) {
        return {err};
    }

    non_prod_assert(() => _l.every(user_specs, ({ref, render}) => (render != null) && (_l.find(externalCodeSpecs, {ref}) != null)));

    return {err: null, externalCodeSpecs, renderByRef: _l.fromPairs(user_specs.map(({ref, render}) => [ref, render]))};
};

const parseLibLoadNonStrict = function({status, error, data, userError}, uniqueKeyToAppend) {
    let err, externalCodeSpecs, user_specs;
    try {
        user_specs = parseUserSpecs(data, uniqueKeyToAppend);
        externalCodeSpecs = user_specs.map(spec => ExternalCodeSpec.from(spec));
    } catch (error1) {
        err = error1;
        return {err};
    }

    non_prod_assert(() => _l.every(user_specs, ({ref, render}) => (render != null) && (_l.find(externalCodeSpecs, {ref}) != null)));

    return {err: null, externalCodeSpecs, renderByRef: _l.fromPairs(user_specs.map(({ref, render}) => [ref, render]))};
};

// Gives something of type component :: {componentSpec} out of an external code spec.
// This is useful so we can have external components which are compatible with regular components
defaultExport.componentOfExternalSpec = (componentOfExternalSpec = spec => ({
    componentSpec: spec,
    isComponent: true,
    componentSymbol: spec.name
}));

// NOTE: This whole model is not really needed
defaultExport.ExternalCodeSpec = Model.register('ext-code-spec', (ExternalCodeSpec = (function() {
    ExternalCodeSpec = class ExternalCodeSpec extends Model {
        static initClass() {
            this.prototype.properties = {
                ref: String,
    
                name: String,
                propControl: ObjectPropControl,
    
                flexWidth: Boolean,
                flexHeight: Boolean
            };
        }

        static from(user_spec) { return new ExternalCodeSpec(_l.extend({}, user_spec, {uniqueKey: user_spec.ref})); }

        constructor(json) {
            super(json);
            if (this.name == null) { this.name = ''; }
            if (this.flexWidth == null) { this.flexWidth = false; }
            if (this.flexHeight == null) { this.flexHeight = false; }
        }
    };
    ExternalCodeSpec.initClass();
    return ExternalCodeSpec;
})())
);

defaultExport.Library = (Library = Model.register('ext-lib', (Library = (function() {
    Library = class Library extends Model {
        static initClass() {
            this.prototype.properties = {
                version_id: String,
    
                inDevMode: Boolean,
                devModeRequirePath: String,
                devModeIsNodeModule: Boolean,
    
                // Everything below this line is a cache and could be computed from version_id.
                // Today we only change any of the below when we publish a new version. Be very careful to stay in sync w/
                // metaserver and the like when you change these
                cachedExternalCodeSpecs: [ExternalCodeSpec], // This one is required to be in the model by compileserver
                cachedDevExternalCodeSpecs: [ExternalCodeSpec], // This one is required to be in the model by compileserver
    
                is_node_module: Boolean,
                npm_path: String,
                local_path: String,
    
                library_id: String,
                bundle_hash: String,
                library_name: String,
                version_name: String
            };
        }

        getCustomEqualityChecks() { return _l.extend({}, super.getCustomEqualityChecks(), {cachedExternalCodeSpecs: setsOfModelsAreEqual}); }
        getCustomRebaseMechanisms() { return _l.extend({}, super.getCustomRebaseMechanisms(), {cachedExternalCodeSpecs: rebaseSetsOfModels}); }

        constructor(json) {
            super(json);
            if (this.inDevMode == null) { this.inDevMode = false; }
            if (this.devModeRequirePath == null) { this.devModeRequirePath = 'src/pagedraw-specs.js'; }
            if (this.devModeIsNodeModule == null) { this.devModeIsNodeModule = false; }
        }

        name() { return `${this.library_name}@${this.version_name}`; }
        requirePath() { if (this.inDevMode) { return this.devModeRequirePath; } else if (this.is_node_module) { return this.npm_path; } else { return this.local_path; } }
        isNodeModule() { if (this.inDevMode) { return this.devModeIsNodeModule; } else { return this.is_node_module; } }

        matches(other_lib) { return this.library_id === other_lib.library_id; } // should also include the version

        publish(contentWindow) {
            assert(() => this.inDevMode);
            assert(() => this.didLoad(contentWindow));

            // Make up a random ID here otherwise the loadProdLibrary below will hit every time the same cache for the same
            // version id. Once a hash comes back from the CLI we set it in stone metaserver
            const publish_id = this.version_id + String(Math.random()).slice(2);

            return publishDevLibrary(publish_id).then(({status, error, hash}) => {
                if (status === 'net-err') {
                    assert(() => error != null);
                    return {err: error};
                }

                if (status !== 'ok') { throw new Error(`Unknown status while publishing library: ${status}`); }

                return loadProdLibrary(contentWindow, hash).then(data => {
                    let err, externalCodeSpecs;
                    ({err, status, externalCodeSpecs} = parseLibLoad(data, this.library_id));
                    // FIXME: Both of the below could happen because of lingering load state of the dev library. Maybe the
                    // loadProdLibrary above should be done inside of an isolated iframe
                    if (err != null) { throw new Error(`Unable to load prod version of library. Make sure your library can cleanly load twice in the same window context. Error: ${err.message}`); }

                    if (!isEqualModuloUniqueKeys(externalCodeSpecs, this.cachedDevExternalCodeSpecs)) {
                        return {err: new Error("Prod version of the library resulted in a different state from the dev version. Make sure your library can cleanly load twice in the same window context.")};
                    }

                    assert(() => hash != null);
                    return {err: null, hash};
            });
            }).catch(err => ({
                err
            })); // NOTE: People above us assume this doesn't throw. Maybe that should change
        }

        failToLoad(contentWindow, err, retStatus) {
            let left;
            console.warn(`Library ${this.name()} failed to load`, err);
            const renderByRef = _l.fromPairs(((left = this.getCachedExternalCodeSpecs()) != null ? left : []).map(spec => [spec.ref, function() { throw new Error("Don't call this. Failed to load"); }]));
            err.__pdStatus = retStatus;
            return contentWindow.pd__loaded_libraries[this.version_id] = {err, lib: this, renderByRef};
        }

        load(contentWindow) {
            if ((contentWindow.pd__initted == null)) { initExternalLibraries(contentWindow); }
            if (this.didLoad(contentWindow)) { return Promise.resolve(); }

            if (this.inDevMode) {
                return loadDevLibrary(contentWindow).then(data => {
                    const {err, status, externalCodeSpecs, renderByRef} = parseLibLoad(data, this.library_id);
                    if (err != null) { return this.failToLoad(contentWindow, err, status); }
                    assert(() => (externalCodeSpecs != null));

                    this.cachedDevExternalCodeSpecs = externalCodeSpecs;
                    return contentWindow.pd__loaded_libraries[this.version_id] = {err: null, lib: this, externalCodeSpecs, renderByRef};
            });

            } else {
                return loadProdLibrary(contentWindow, this.bundle_hash).then(data => {
                    // NOTE POLICY: We parse nonStrict here because if we add new check errors
                    // to parseLibLoad we don't want to break existing published libs. We always do the strict
                    // checks in dev mode and upon publishing the lib, however.
                    const {err, status, externalCodeSpecs, renderByRef} = parseLibLoadNonStrict(data, this.library_id);
                    if (err != null) { return this.failToLoad(contentWindow, err, status); }

                    // FIXME: We should actually probably crash here, but changin parseUserSpecs today makes this fail so we
                    // need a better strategy
                    if ((this.cachedExternalCodeSpecs != null) && !isEqualModuloUniqueKeys(this.cachedExternalCodeSpecs, externalCodeSpecs)) {
                        const msg = `Library load resulted in a different state than at lib install. Lib: ${this.name()}`;
                        track_error(new Error(msg), msg);
                    }

                    return contentWindow.pd__loaded_libraries[this.version_id] = {err: null, lib: this, externalCodeSpecs, renderByRef};
            });
            }
        }


        didLoad(contentWindow) { return ((contentWindow.pd__loaded_libraries != null ? contentWindow.pd__loaded_libraries[this.version_id] : undefined) != null) && _l.isEmpty(this.loadErrors(contentWindow)); }

        loadedSpecs(contentWindow) { return _l.map(contentWindow.pd__loaded_libraries != null ? contentWindow.pd__loaded_libraries[this.version_id].externalCodeSpecs : undefined); }

        loadErrors(contentWindow) {
            assert(() => contentWindow.pd__loaded_libraries[this.version_id]);
            return _l.compact([contentWindow.pd__loaded_libraries[this.version_id].err]);
        }

        getCachedExternalCodeSpecs() { if (this.inDevMode) { return this.cachedDevExternalCodeSpecs; } else { return this.cachedExternalCodeSpecs; } }
    };
    Library.initClass();
    return Library;
})())
));

defaultExport.renderExternalInstance = function(contentWindow, ref, props) {
    let entry;
    assert(() => (contentWindow.pd__loaded_libraries != null));
    if (((entry = _l.find(contentWindow.pd__loaded_libraries, l => l.renderByRef[ref] != null)) == null)) {
        throw new Error(`External component with ref ${ref} not loaded by any library.`);
    } else if (entry.err != null) {
        throw new Error(`Library ${entry.lib.name()} failed to load. ` + entry.err.message);
    }

    return entry.renderByRef[ref](props);
};

var initExternalLibraries = function(contentWindow) {
    if (!contentWindow.pd__initted) {
        contentWindow.__pdReactHook = React;
        contentWindow.__pdReactDOMHook = ReactDOM;
        contentWindow.pd__loaded_libraries = {};
        return contentWindow.pd__initted = true;
    }
};

defaultExport.makeLibAtVersion = (contentWindow, lib_id, version_id) => server.getLibraryMetadata(lib_id, version_id).then(function({version, name}) {
    // Typecheck...
    if ((lib_id == null) || (name == null) || (version.id == null) || (version.name == null) 
    || (version.bundle_hash == null) || ((version.npm_path == null) && (version.local_path == null)) || (version.is_node_module == null)) { throw new Error('Invalid lib'); }

    const lib = new Library({
        library_id: String(lib_id), library_name: name,
        version_id: String(version_id), version_name: version.name,
        npm_path: version.npm_path, local_path: version.local_path, is_node_module: version.is_node_module,
        bundle_hash: version.bundle_hash, inDevMode: false
    });
    return lib.load(contentWindow).then(function() {
        if (!lib.didLoad(contentWindow)) { throw new Error(`Could not load lib ${lib.name()}`); }
        lib.cachedExternalCodeSpecs = lib.loadedSpecs(contentWindow);
        return lib;
    });
});





export default defaultExport;





