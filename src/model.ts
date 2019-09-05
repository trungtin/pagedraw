/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS203: Remove `|| {}` from converted for-own loops
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let deserialize, isEqual, Model, nameForType, rebase, rebaseSetsOfModels, serialize, setsOfModelsAreEqual, subtypeOf, Tuple, tuple_named, ValueType;
import _ from 'underscore';
import _l from 'lodash';
import { zip_sets_by, assert } from './util';

Function.prototype.property = function(prop, desc) {
  return Object.defineProperty(this.prototype, prop, desc);
};

Function.prototype.const_property = function(prop, val) {
  return Object.defineProperty(this.prototype, prop, {get() { return val; }, set() {}});
};

//# Models code

const registeredModels = {};

const defaultExport = {};

defaultExport.deserialize = (deserialize = function(ty, json) {
    if (ty === String) {
        if (_.isString(json)) { return json; }
        throw new Error("bad deserialize string");

    } else if (ty === Number) {
        if (_.isNumber(json)) { return json; }
        throw new Error("bad deserialize number");

    } else if (ty === Boolean) {
        if (_.isBoolean(json)) { return json; }
        throw new Error("bad deserialize boolean");

    } else if (_.isArray(ty) && (ty.length === 1)) {
        const typaram = ty[0];
        if (!_.isArray(json)) { throw new Error; }
        return json.map(el => deserialize(typaram, el));

    } else {
        if (ty.deserialize != null) { return ty.deserialize(json); }
        throw new Error("unknown type deserialized");
    }
});

defaultExport.serialize = (serialize = function(ty, value) {
    if ((value === null) || (value === undefined)) {
        // figure out optionals...
        return value;
    }

    if (ty === String) {
        if (_.isString(value)) { return value; }
        throw new Error(`bad serialize string ${value}`);

    } else if (ty === Number) {
        if (_.isNumber(value)) { return value; }
        throw new Error(`bad serialize number ${value}`);

    } else if (ty === Boolean) {
        if (_.isBoolean(value)) { return value; }
        throw new Error(`bad serialize boolean ${value}`);

    } else if (_.isArray(ty) && (ty.length === 1)) {
        const typaram = ty[0];
        if (!_.isArray(value)) {
            throw new Error(`bad serialize array ${value}`);
        }
        return value.map(el => serialize(typaram, el));

    } else if (value instanceof ty) {
        return value.serialize();

    } else {
        throw new Error(`unknown type serialized. ty = ${ty} value = ${value}`);
    }
});

defaultExport.fresh_representation = (ty, value) => deserialize(ty, serialize(ty, value));

defaultExport.nameForType = (nameForType = function(ty) {
    if (ty === String) { return 's';
    } else if (ty === Number) { return 'n';
    } else if (ty === Boolean) { return 'b';
    } else if (_.isArray(ty) && (ty.length === 1)) { return `[${nameForType(ty[0])}]`;
    } else if (ty.prototype instanceof ValueType) { return ty.__tag;
    } else { throw new Error("unknown type"); }
});

// this function is similar to Model.supertypeOf but it also works
// with primitive types like String and Number as well as Array types
// Model.supertypeOf doesn't work for those types
defaultExport.subtypeOf = (subtypeOf = (a, b) => ((a === Number) && (b === Number)) || 
((a === String) && (b === String)) || 
((a === Boolean) && (b === Boolean)) || 
(_.isArray(a) && _.isArray(b) && (a.length === 1) && (b.length === 1) && subtypeOf(a[0], b[0])) 
|| (typeof b.supertypeOf === 'function' ? b.supertypeOf(a) : undefined));

//# Equality

// isEqual :: (Serializable) -> (Serializable) -> Bool
defaultExport.isEqual = (isEqual = function(a, b) {
    if ((a === null) || (a === undefined) || _.isString(a) || _.isNumber(a) || _.isBoolean(a)) { return a === b;
    } else if (_l.isArray(a)) { return _l.isArray(b) && (a.length === b.length) && _l.every(_l.zip(a, b), function(...args) { const [ea, eb] = Array.from(args[0]); return isEqual(ea, eb); });
    } else if (a instanceof ValueType) { return a.isEqual(b);
    } else { throw new Error('Unexpected type'); }
});

const isSetOfModel = a => _l.isArray(a) && _l.every(a, m => m instanceof Model);

// setsOfModelsAreEqual :: (Set Model) -> (Set Model) -> Bool
// useful for overridden Model.customEqualityChecks
defaultExport.setsOfModelsAreEqual = (setsOfModelsAreEqual = function(a, b) {
    assert(() => isSetOfModel(a) && isSetOfModel(b));
    const counterparts = zip_sets_by('uniqueKey', [a, b]);
    // counterparts :: [counterpart]
    // each counterpart is [object_from_a, object_from_b], where object_from_a and object_from_b
    // refer to the same semantic object because they have the same uniqueKey
    return _.all(counterparts, function(...args) { const [object_from_a, object_from_b] = Array.from(args[0]); return isEqual(object_from_a, object_from_b); });
});

//# Merging / Rebasing

// rebase :: (Serializable) -> (Serializable) -> (Serializable) -> (Serializable)
defaultExport.rebase = (rebase = function(left, right, base) {
    // This is a policy choice that deleting a Model (like a block) takes precedence in rebasing
    if (base instanceof ValueType && (base !== undefined) && ((left === undefined) || (right === undefined))) { return undefined;

    } else if (base instanceof ValueType && ((left != null ? left.constructor : undefined) === (right != null ? right.constructor : undefined) && (right != null ? right.constructor : undefined) === (base != null ? base.constructor : undefined))) {
        // if the value is a model, and all values are the same type, dispatch to a custom
        // rebase mechanism.
        // Do this even if left == base or right == base, because testing for equality
        // should be almost as expensive as just doing the rebase.  If it isn't, the custom
        // rebase mechanism can check for equality itself manually.
        return base.constructor.rebase(left, right, base);

    } else if (isEqual(left, base)) { return right;
//   else if isEqual(right, base) then left # included for readability
    } else { return left; } // conflict!  We have no way to resolve it, since this type has no special
});
// rebase mechanism.  Prefer left.  By picking one atomically, at least the
// types will match.  This is reasonable default behavior.

// rebaseSetsOfModels :: (Set Model) -> (Set Model) -> (Set Model) -> (Set Model)
// useful for overridden Model.customRebaseMechanisms
defaultExport.rebaseSetsOfModels = (rebaseSetsOfModels = function(left, right, base) {
    assert(() => isSetOfModel(left) && isSetOfModel(right) && isSetOfModel(base));
    const counterparts = zip_sets_by('uniqueKey', [left, right, base]);
    const rebased_objects = counterparts.map(function(...args) { const [l, r, b] = Array.from(args[0]); return rebase(l, r, b); });
    // deleted objects will be result in an `undefined`
    const rebased_objects_with_deletions_removed = _.compact(rebased_objects);
    return rebased_objects_with_deletions_removed;
});

//# Root Object

defaultExport.ValueType = (ValueType = (function() {
    ValueType = class ValueType {
        static initClass() {
            // the property '__ty' is reserved
    
            // the root model class (Model)'s properties
            // these properties are inherited by all models
            this.__properties = {};
    
            this.__tag = "v";
        }
        // tags may not contain '/'s, as they are reserved for namespacing

        static compute_previously_persisted_property(prop, desc) {
            // remove the property from the list of computed properties
            this.prototype.properties[prop] = undefined;

            // set up the computed property
            return this.property(prop, desc);
        }

        static register(name, cls) {
            const superclass = cls.__super__ != null ? cls.__super__.constructor : undefined;

            // give the class a fully qualified name
            // assert '/' not in cls.__tag
            return this.register_with_absolute_tag(superclass.__tag + '/' + name, cls);
        }

        static register_with_legacy_absolute_tag(absolute_tag, cls) { return this.register_with_absolute_tag(absolute_tag, cls); }

        static register_with_absolute_tag(absolute_tag, cls) {
            const superclass = cls.__super__ != null ? cls.__super__.constructor : undefined;

            // only inherit from registered models, with Model as the root
            // assert superclass.__isRegisteredModel

            // assert cls::properties['__ty']? == false

            // even if it's empty, every Model subclass must define its properties
            assert(() => cls.prototype.hasOwnProperty('properties'));

            // inherit properties from parent
            cls.__properties = _.extend({}, superclass.__properties, cls.prototype.properties);

            // Subclasses can remove a parent's property by redefining it's type to be undefined.
            // This is useful for compute_previously_persisted_property.
            for (let p in cls.__properties) { const type = cls.__properties[p]; if (type === undefined) { delete cls.__properties[p]; } }

            cls.__tag = absolute_tag;

            // it's an error to have two models with the same name
            // otherwise we don't know which to use when deserializing
            if (registeredModels[cls.__tag] != null) { throw new Error('Model already registered'); }

            // register the subclass for deserialization
            registeredModels[cls.__tag] = cls;

            // for debugging purposes, mark that we've registered cls
            // assert cls.__isRegisteredModel? == false
            cls.__isRegisteredModel = true;

            // mark the superclass as polymorphic.  We may want to not write
            // a tag/__ty to json if there's no possible polymorphism
            superclass.__hasVariants = true;

            // in case we accidentally inherited __hasVariants from our superclass,
            // explicitly set it to false.  We're asserting that we haven't been
            // registered yet up top, and any child inheriting from us will have
            // asserted that we (the superclass) had been registered, so we can
            // assume we don't have any variants yet
            cls.__hasVariants = false;

            return cls;
        }

        constructor(json) {
            // debug assert @constructor.__isRegisteredModel
            if (json == null) { json = {}; }
            for (let prop of Object.keys(this.constructor.__properties || {})) {
                const ty = this.constructor.__properties[prop];
                if (json[prop] != null) { this[prop] = json[prop]; }
            }
        }


        serialize() {
            // debug assert @constructor.__isRegisteredModel
            const json = {__ty: this.constructor.__tag};
            for (let prop of Object.keys(this.constructor.__properties || {})) {
                const ty = this.constructor.__properties[prop];
                if (this[prop] != null) { json[prop] = serialize(ty, this[prop]); }
            }
            return json;
        }

        static deserialize(json) {
            // debug assert @constructor.__isRegisteredModel
            if (!_l.isPlainObject(json)) { throw new Error("tried to deserialize a non-object"); }
            if (json.__ty == null) { throw new Error("serialized object does not have a __ty"); }

            const type = registeredModels[json.__ty];

            if (type == null) { throw new Error(`Type ${json.__ty} not registered`); }

            // ask this, the type we're trying to deserialize, if we should trust `type` is a valid alternative
            if (!this.supertypeOf(type)) { throw new Error(`${nameForType(type)} is not a subtype of ${nameForType(this)}`); }

            // if type is a proper subtype, fully delegate deserialization to it
            if (this !== type) { return type.deserialize(json); }

            // recursively deserialize members
            const deserialized_members = {};
            for (let prop of Object.keys(type.__properties || {})) {
                const ty = type.__properties[prop];
                if (json[prop] != null) { deserialized_members[prop] = deserialize(ty, json[prop]); }
            }

            // construct the new instance
            return new type(deserialized_members);
        }

        // this function is used to ask a Model what types it accepts.
        // A.supertypeOf(B) means that A knows how to deserialize objects of type B
        static supertypeOf(type) {
            return (type === this) || type.prototype instanceof this;
        }

        freshRepresentation() { return this.constructor.deserialize(this.serialize()); }
        freshRepresentationWith(props) { return _l.extend(this.freshRepresentation(), props); }

        clone() {
            // @constructor gets the class of the current element (in this case, Block, LayoutBlock, etc)
            const clone = this.freshRepresentation();
            return clone;
        }

        cloneWith(props) { return _l.extend(this.clone(), props); }

        // override this with
        //   getCustomEqualityChecks: -> _l.extend {}, super(), {prop: customCheck}
        // where
        //   customCheck :: (a -> a -> Bool)
        // getCustomEqualityChecks :: -> {prop: (a -> a -> Bool)}
        getCustomEqualityChecks() { return {}; }

        isEqual(other) {
            // models are never equal to null or undefined
            if (other == null) { return false; }

            // verify they're the same type type
            if (other.constructor !== this.constructor) { return false; }

            // verify all their properties match by isEqual, or a custom check if it's overridden
            const customEqualityChecks = this.getCustomEqualityChecks();
            for (let prop of Object.keys(this.constructor.__properties || {})) {
                const ty = this.constructor.__properties[prop];
                if (!(customEqualityChecks[prop] != null ? customEqualityChecks[prop] : isEqual)(this[prop], other != null ? other[prop] : undefined)) {
                    // get that short circuiting behavior
                    return false;
                }
            }

            // all checks passed; they're equal
            return true;
        }

        static rebase(left, right, base) {
            // construct a new fresh empty object to return so this function is pure
            const fresh_object = new (this)();
            fresh_object.rebase(left, right, base);
            return fresh_object;
        }

        // override this with
        //   getCustomRebaseMechanisms: _l.extend {}, super(), {prop: customMechanism}
        // where
        //   customMechanism :: ((left :: a, right :: a, base :: a) -> a)
        // getCustomRebaseMechanisms :: -> {prop: (a -> a -> a -> a)}
        getCustomRebaseMechanisms() { return {}; }

        rebase(left, right, base) {
            const customRebaseMechanisms = this.getCustomRebaseMechanisms();
            return Array.from(_.keys(this.constructor.__properties)).map((prop) =>
                (this[prop] = (customRebaseMechanisms[prop] != null ? customRebaseMechanisms[prop] : rebase)(left[prop], right[prop], base[prop])));
        }
    };
    ValueType.initClass();
    return ValueType;
})());


// tuple_named :: {String: Model}
defaultExport.tuple_named = (tuple_named = {});
defaultExport.Tuple = (Tuple = function(name, members) {
    const tuple_model = Model.register(name, (Tuple = (function() {
        Tuple = class Tuple extends Model {
            static initClass() {
                this.prototype.properties = members;
            }
        };
        Tuple.initClass();
        return Tuple;
    })())
    );

    // save the tuple by name so other people can new() it later
    Model.tuple_named[name] = tuple_model;

    return tuple_model;
});


// We didn't use to have ValueType so model's absolute tag was just ''
defaultExport.Model = ValueType.register_with_legacy_absolute_tag('', (Model = (function() {
    Model = class Model extends ValueType {
        static initClass() {
            this.prototype.properties =
                {uniqueKey: String};
    
            // This is legacy stuff. Use the exported globals instead
            this.tuple_named = tuple_named;
            this.Tuple = Tuple;
        }

        constructor(json) {
            super(json);

            // give every model a uniqueKey
            if (this.uniqueKey == null) { this.regenerateKey(); }
        }

        regenerateKey() {
            // We want these keys to be GUIDs
            return this.uniqueKey = String(Math.random()).slice(2);
        }

        clone() {
            // @constructor gets the class of the current element (in this case, Block, LayoutBlock, etc)
            const clone = super.clone();
            clone.regenerateKey();
            return clone;
        }
    };
    Model.initClass();
    return Model;
})())
);


/* NOTE: UNUSED and UNTESTED */
defaultExport.register_singleton = function(name, PrivateClass) {
    // Register the class and give it a name
    Model.register(name, PrivateClass);

    // Remove uniqueKey and any other registered properties from PrivateClass.
    // This way it will serialize to just a {__ty: tag}
    PrivateClass.__properties = {};

    // overload regenerateKey to be a no-op, so we don't accidentally give this a uniqueKey
    PrivateClass.prototype.regenerateKey = function() {};

    // create the only instance of this class that should ever be created.
    // it should be an error to create a new instance of this class after here.
    const singleton = new PrivateClass();

    // give the singleton a unique, deterministic uniqueKey, so we can keep our guarantee
    // that all instances of Model have a unique uniqueKey
    singleton.uniqueKey = `S:${PrivateClass.__tag}`;

    // all deserialize()s of this singleton class should return the same singleton object
    PrivateClass.deserialize = function(json) {
        if (json.__ty === PrivateClass.__tag) { return singleton; }
        if (json.__ty !== PrivateClass.__tag) { throw new Error(`${JSON.toString()} is not a ${PrivateClass.__tag}`); }
    };

    return singleton;
};
export default defaultExport;
