/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import Dynamic from './dynamic';
import config from './config';
import { assert } from './util';
import { isExternalComponent } from './libraries';
import { constraintAttrs, externalPositioningAttrs, pdom_tag_is_component } from './pdom';

//# Eval Pdom / Interpreter

const TypeChecked = ((specs => _l.mapValues(specs, (pred, name_of_expected_type) => (function(val) {
    if (pred(val) === false) { throw new Error(`${val} is not a ${name_of_expected_type}`);
    } else { return val; }
}))))({
    string: _l.isString,
    number: _l.isNumber,
    boolean: _l.isBoolean,
    list(v) { return ((v != null ? v.map : undefined) != null); }, // ensure v is list-ish, as defined by implementing .map
    any() { return true; }
});

// http://perfectionkills.com/global-eval-what-are-the-options/
const global_eval = eval;

var evalJsonDynamic = function(value, scope, evalCode) {
    if (value instanceof Dynamic) { return evalCode(value.code, scope);
    } else if (_l.isArray(value)) { return value.map(v => evalJsonDynamic(v, scope, evalCode));
    } else if (_l.isPlainObject(value)) { return _l.mapValues(value, v => evalJsonDynamic(v, scope, evalCode));
    } else { return value; }
};


export default function(pdom, getCompiledComponentByUniqueKey, language, page_width, allow_external_code) {
    let scope, value, code;
    if (allow_external_code == null) { allow_external_code = false; }
    const evalInScope = function(code, scope) {
        if (_l.isEmpty(code)) { throw new Error("Empty dynamicable attribute"); }

        let [args, values] = Array.from(_l.zip(...Array.from(_l.toPairs(_l.omit(scope, 'this')) || [])));
        if (args == null) { args = []; } if (values == null) { values = []; } // if _l.toPairs returns [], zip has no idea how many empty arrays to return

        // FIXME try/catch here to safely eval
        // FIXME(security) run eval in different js context (iframe on no/different origin) to actually be safe (!)
        return global_eval(`(function(${args.join(", ")}) { ${code} })`).apply(scope.this, values);
    };

    // createScope :: {Id: Value} -> Data
    // extendScope :: (Data -> Id -> Value -> Data)
    // evalCode :: (Code -> Data -> Value)
    // type Code = String
    // type Data = PlainObject aka Object aka JSONData
    // type Value = Object|String|Number|Array|any
    const {createScope, extendScope, evalCode} = (() => { switch (language) {
        case 'JSX': case 'React': case 'TSX':
            return {
                createScope(var_name_to_val) {
                    if (config.supportPropsOrStateInEvalForInstance) { return {this: {props: var_name_to_val, state: var_name_to_val}};
                    } else { return {this: {props: var_name_to_val}}; }
                },
                extendScope(scope, new_var, value) {
                    return _l.extend({}, scope, _l.fromPairs([[new_var, value]]));
                },
                evalCode(code, scope) {
                    return evalInScope(`return ${code};`, scope);
                }
            };

        case 'CJSX':
            // coffeescript support
            var {compile_coffee_expression} = require('./frontend/coffee-compiler');

            return {
                createScope(var_name_to_val) {
                    if (config.supportPropsOrStateInEvalForInstance) { return {this: {props: var_name_to_val, state: var_name_to_val}};
                    } else { return {this: {props: var_name_to_val}}; }
                },
                extendScope(scope, new_var, value) {
                    return _l.extend({}, scope, _l.fromPairs([[new_var, value]]));
                },
                evalCode: (code, scope) => {
                    const compiled = compile_coffee_expression(code);
                    return evalInScope(`return ${compiled}`, scope);
                }
            };

        case 'Angular2':
            return {
                createScope(var_name_to_val) { return {this: var_name_to_val}; },
                extendScope(scope, new_var, value) {  return _l.extend({}, scope, _l.fromPairs([[new_var, value]])); },
                evalCode(code, scope) { return evalInScope(`return ${code};`, scope); }
            };

        default:
            return {
                createScope(var_name_to_val) { return {}; },
                extendScope(scope, new_var, value) { throw new Error(`Not supported for ${language}`); },
                evalCode(code, scope) { throw new Error(`Not supported for ${language}`); }
            };
    } })();


    // evalPdom :: Pdom -> Data -> [Pdom]
    var _evalPdom = function(pdom, scope, max_stack_depth) {
        if (max_stack_depth == null) { max_stack_depth = 500; }
        const evalPdom = function(_pdom, _scope) {
            try {
                if (max_stack_depth < 1) { throw new Error("max component depth exceeded"); }
                return _evalPdom(_pdom, _scope, max_stack_depth - 1);
            } catch (e) {
                if (config.warnOnEvalPdomErrors) { console.warn(e); }

                // FIXME: This throws in the case of a showIf failing since showIf pdoms have no backingBlock
                if ((_pdom.backingBlock == null)) { throw e; }

                // return a Gray if you're a block where we can't figure out what you are
                return [_l.extend({tag: 'div', children: [], backgroundColor: '#d8d8d8', textContent: e.message},
                    _l.pick(_pdom, externalPositioningAttrs.concat(constraintAttrs)),
                    _l.pick(_pdom.backingBlock, ['height']))];
            }
        };

        // TODO on errors, report where it came from:
        //  - which backing block (can we highlight it?)
        //  - which code
        //  - which sidebar property (can we highlight it?)
        //  - use the staticValue for rendering, but highlight it (?)
        if ((pdom.media_query_min_width != null) && (page_width < pdom.media_query_min_width)) { return []; }
        if ((pdom.media_query_max_width != null) && (page_width >= pdom.media_query_max_width)) { return []; }
        if (pdom.tag === 'showIf') {
            assert(() => _l.every(Array.from(_l.keys(pdom)).map((k) => ['tag', 'show_if', 'backingBlock', 'children'].includes(k))));
            if (TypeChecked.boolean(evalCode(pdom.show_if, scope))) {
                // we only expect pdom.children.length == 1, I think
                return _l.flatMap(pdom.children, child => evalPdom(child, scope));
            } else { return []; }

        } else if (pdom.tag === 'repeater') {
            // assert ->
            //     _l.every(k in ['tag', 'repeat_variable', 'instance_variable', 'backingBlock', 'children'] for k in _l.keys pdom)
            assert(() => pdom.children.length === 1);

            return _l.flatMap((TypeChecked.list(evalCode(pdom.repeat_variable, scope))), function(elem, i) {
                const subscope = extendScope(scope, pdom.instance_variable, elem);
                const subscope_with_i = extendScope(subscope, "i", i);

                // we only expect children.length == 1, I think
                return _l.flatMap(pdom.children, child => evalPdom(child, subscope_with_i));
            });

        } else if ((pdom.tag != null) === false) {
            // FIXME may be a deleted source component
            throw new Error("unknown tag");

        } else if (pdom_tag_is_component(pdom.tag) && isExternalComponent(pdom.tag)) {
            return _l.extend({}, pdom, {props: evalJsonDynamic(pdom.props, scope, evalCode)});

        // Function calls (!)
        } else if (pdom_tag_is_component(pdom.tag)) {
            const componentBody = getCompiledComponentByUniqueKey(pdom.tag.uniqueKey);
            const functionBodyScope = createScope(evalJsonDynamic(pdom.props, scope, evalCode));
            return evalPdom(componentBody, functionBodyScope);

        } else {
            const evaled_pdom = _l.mapValues(pdom, function(value, prop) {
                if (prop === "children") {
                    return _l.flatMap(value, child => evalPdom(child, scope));

                } else {
                    const typeChecker = ((typeCheckers => typeCheckers[prop] != null ? typeCheckers[prop] : TypeChecked.any))({
                        textContent: TypeChecked.string
                    });

                    return typeChecker(evalJsonDynamic(value, scope, evalCode));
                }
            });

            return [evaled_pdom];
        }
    };

    // evalPdom must take as input a pdom who, when evaled, returns a list of 1 pdom.
    // Our call to evalPdom should always return a list of 1 pdom as long as our input pdom is an instance of
    // something returned from compileComponentForInstanceEditor.
    return _evalPdom(pdom, createScope({}))[0];
};
