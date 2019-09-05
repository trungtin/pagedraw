// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Dynamicable, GenericDynamicable;
import _l from 'lodash';
import { assert, memoize_on } from './util';
import { nameForType, subtypeOf, Model } from './model';
const defaultExport = {};

// This is so people can ask foo instanceof GenericDynamicable
// which will be true iff foo is of type Dynamicable(A)
defaultExport.GenericDynamicable = (GenericDynamicable = class GenericDynamicable extends Model {});

// Dynamicable is a way to make data types (like String, Boolean, or more complex)
// dynamicable. This means that a designer can set a staticValue in the editor but
// that default Value will be overwriten by the compiler with some
// Developer specified code if isDynamic is set
// Dynamicable :: Type -> Type
//
// NOTE: If B inherits from A,
// an object of type Dynamicable(B) is not instanceof Dynamicable(A)
// and subtypeOf(Dynamicable(B), Dynamicable(A)) == false
// even though subtypeOf(B, A) == true
//
// This is similar to the behavior in C++/Java/C# per
// https://docs.oracle.com/javase/tutorial/extra/generics/subtype.html
const dynamicableCache = {};
defaultExport.Dynamicable = (Dynamicable = function(A) {
    const cls_name = `dyn(${nameForType(A)})`;
    return memoize_on(dynamicableCache, cls_name, function() {
        let DynamicableImpl;
        return Model.register(cls_name, (DynamicableImpl = (function() {
            DynamicableImpl = class DynamicableImpl extends GenericDynamicable {
                static initClass() {
                    // if isDynamic == true, code becomes the value that will replace staticValue
                    // at compile time
                    this.prototype.properties = {
                        staticValue: A,
                        code: String,
                        isDynamic: Boolean
                    };
    
                    this.A = A;
                }

                constructor(json) {
                    super(json);
                    if (this.code == null) { this.code = ''; }
                    if (this.isDynamic == null) { this.isDynamic = false; }
                    this.source = this;
                }

                static from(staticValue) { return new (this)({staticValue, isDynamic: false, code: ""}); } // Dynamicable(String).A == String

                // We include source :: Dynamicable A in the return value of mapStatic so users of this function
                // can find the initial Dynamicable that gave rise to the mappings. This is useful for i.e. mutating
                // the code of a dynamicable that was mapStatic'd in the props getDynamics sidebar
                derivedWith(members) { return _l.extend(this.cloneWith(members), {source: this.source}); }
                mapStatic(fn) { return this.derivedWith({staticValue: fn(this.staticValue)}); }


                //# Utility functions for when our internal repr doesn't line up with the JS thing.
                //  FIXME these need to support more than just JS and CJSX

                stringified() { return this.derivedWith({
                    staticValue: String(this.staticValue),
                    code: `String\(${this.code}\)`
                }); }

                cssImgUrlified() { return this.derivedWith({
                    staticValue: `url('${this.staticValue}')`,
                    code: `\"url('\"+(${this.code})+\"')\"`
                }); }

                strTrueOrUndefined({templateLang}) { return this.derivedWith({
                    staticValue: this.staticValue ? "true" : undefined,
                    code: (() => { switch (templateLang) {
                        // ANGULAR TODO: Might be wrong
                        case 'React': case 'JSX': case 'TSX': case 'Angular2': return `(${this.code}) ? 'true' : undefined`;
                        case 'CJSX': return `if (${this.code}) then 'true' else undefined`;
                        default:
                            // Only React is supported (for now).  Crash in dev, but be silently wrong in dev.
                            // Where's still like 18 docs that use Jinja2, and it's better for them to silently fail than crash.
                            // We don't care about those 18 docs.
                            assert(() => false);
                            return "";
                    } })()
                }); }



                linearGradientCssTo(endColor, direction) {
                    const code_for_dynamicable = function(dyn) {
                        if (dyn.isDynamic) { return dyn.code; } else { return JSON.stringify(dyn.staticValue); }
                    };

                    const blah = new (Dynamicable(String))({
                        staticValue: `linear-gradient(${direction.staticValue}deg, ${this.staticValue}, ${endColor.staticValue})`,
                        code: `\"linear-gradient(\"+\"(${code_for_dynamicable(direction)})\"+\"deg, \"+(${code_for_dynamicable(this)})+\", \"+(${code_for_dynamicable(endColor)})+\")\"`,
                        isDynamic: this.isDynamic || endColor.isDynamic || direction.isDynamic
                    });
                    // FIXME technically the source is *both* [this, endColor]
                    blah.source = this;
                    return blah;
                }

                // ANGULAR TODO: might be wrong
                getPropCode(name, language) {
                    switch (language) {
                        case 'JSX': case 'React': case 'CJSX': case 'TSX': return `this.props.${name}`;
                        case 'Angular2': return `this.${name}`;
                        default: return "";
                    }
                }
            };
            DynamicableImpl.initClass();
            return DynamicableImpl;
        })())
        );
    }); // HTML doesn't support dynamics
});


export default defaultExport;


// ugh. At least the ugliness is all concentrated here so folks can just use CodeType
// whenever you want an "always dynamic" dynamicable
Dynamicable.code = code => new (Dynamicable(String))({staticValue: '', isDynamic: true, code});
Dynamicable.CodeType = (Dynamicable(String));
