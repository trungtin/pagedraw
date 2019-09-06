// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let CheckboxPropControl, ColorPropControl, controlTypes, DropdownPropControl, flattenedSpecAndValue, FunctionPropControl, ImagePropControl, ListPropControl, NumberPropControl, ObjectPropControl, ObjectPropValue, PropInstance, PropSpec, StringPropControl;
import _l from 'lodash';
import React from 'react';

import {
    ColorControl,
    ImageControl,
    SelectControl,
    DynamicableControl,
    DebouncedTextControl,
    CheckboxControl,
    LeftCheckboxControl,
    NumberControl,
    propValueLinkTransformer,
    listValueLinkTransformer,
} from './editor/sidebar-controls';

import { nameForType, Model } from './model';
import { Dynamicable } from './dynamicable';
import ListComponent from './frontend/list-component';
import FormControl from './frontend/form-control';
import util from './util';
import { PdIndexDropdown, PdPopupMenu } from './editor/component-lib';
import Tooltip from './frontend/tooltip';
import Random from './random';

const indentation = 13;

//# Similar to React, Pagedraw components also have Props
// When instantiating a component the user can pass in prop values to customize
// each instance of a component.
// PropControls and PropValues correspond to prop types and values, respectively.
// The root type of every component is a ObjectPropValue.  It contains a set of
// [name, PropControl] pairs.  Think of these as [prop_name, prop_type] pairs.
// Think of a PropControl as a type in Pagedraw, and a PropValue as a value.

var PropControl = Model.register('prop-ctrl', (PropControl = (function() {
    PropControl = class PropControl extends Model {
        static initClass() {
            this.prototype.sidebarControl = null; // needs to be overridden
            this.prototype.properties = {};
            this.prototype.ValueType = null;
        }
        default() { throw new Error("PropControl is an Abstract Base Class and has no default value"); }
        static deserialize() {
            const obj = super.deserialize(...arguments);
            if (obj.constructor === PropControl) { throw new Error("PropControl is an Abstract Base Class"); }
            return obj;
        }
        customSpecControl(controlValueLink) { return null; }
    };
    PropControl.initClass();
    return PropControl;
})())
);

var PropValue = Model.register('prop-val', (PropValue = (function() {
    PropValue = class PropValue extends Model {
        static initClass() {
            this.prototype.properties = {};
        }
        static deserialize() {
            const obj = super.deserialize(...arguments);
            if (obj === PropValue) { throw new Error("PropValue is an Abstract Base Class"); }
            return obj;
        }

        getValueAsJsonDynamicable(control) { throw new Error("PropValue is an Abstract Base Class"); }
        enforceValueConformsWithSpec(control, willMutate) { throw new Error("PropValue is an Abstract Base Class"); }
        isCompatibleWith(propControl) { throw new Error("PropValue is an Abstract Base Class"); }
    };
    PropValue.initClass();
    return PropValue;
})())
);


const registerPropControl = function(ty, sidebarControl, defaultDefaultValue, userVisibleLabel, random_generator, registeredName) {
    if (registeredName == null) { registeredName = nameForType(ty); }
    var ConcretePropValue = Model.register(`prop-val(${registeredName})`, (ConcretePropValue = (function() {
        ConcretePropValue = class ConcretePropValue extends PropValue {
            static initClass() {
                this.prototype.properties =
                    {innerValue: Dynamicable(ty)};
            }

            getValueAsJsonDynamicable(control) { return this.innerValue; }
            enforceValueConformsWithSpec(control, willMutate) {} // noop
            isCompatibleWith(propControl) { return propControl.ValueType === this.constructor; }
        };
        ConcretePropValue.initClass();
        return ConcretePropValue;
    })())
    );

    var ConcretePropControl = Model.register(`prop-ctrl(${registeredName})`, (ConcretePropControl = (function() {
        ConcretePropControl = class ConcretePropControl extends PropControl {
            static initClass() {
                this.userVisibleLabel = userVisibleLabel;
                this.prototype.properties =
                    {defaultValue: ty};
    
                this.prototype.sidebarControl = sidebarControl;
                this.prototype.ValueType = ConcretePropValue;
            }

            constructor(json) {
                super(json);
                if (this.defaultValue == null) { this.defaultValue = defaultDefaultValue; }
            }
            default() { return new this.ValueType({innerValue: (Dynamicable(ty)).from(this.defaultValue)}); }
            random() { return new this.ValueType({innerValue: (Dynamicable(ty)).from(random_generator())}); }
        };
        ConcretePropControl.initClass();
        return ConcretePropControl;
    })())
    );

    return ConcretePropControl;
};

const defaultExport = {};

defaultExport.StringPropControl = (StringPropControl = registerPropControl(String, DebouncedTextControl, "", 'Text', Random.randomQuoteGenerator));
defaultExport.ImagePropControl = (ImagePropControl = registerPropControl(String, ImageControl, '', 'Image', Random.randomImageGenerator, 'img'));
defaultExport.NumberPropControl = (NumberPropControl = registerPropControl(Number, NumberControl, 0, 'Number', (() => _l.sample(__range__(0, 100, false)))));
defaultExport.CheckboxPropControl = (CheckboxPropControl = registerPropControl(Boolean, CheckboxControl, false, 'Checkbox', (() => _l.sample([true, false]))));
defaultExport.ColorPropControl = (ColorPropControl = registerPropControl(String, ColorControl, '#ffffff', 'Color', Random.randomColorGenerator, 'color'));

var FunctionPropValue = Model.register("prop-val(function)", (FunctionPropValue = (function() {
    FunctionPropValue = class FunctionPropValue extends PropValue {
        static initClass() {
            this.prototype.properties =
                {innerValue: Dynamicable.CodeType};
        }

        getValueAsJsonDynamicable(control) { return this.innerValue; }
        enforceValueConformsWithSpec(control, willMutate) {} // noop
        isCompatibleWith(propControl) { return propControl.ValueType === this.constructor; }
    };
    FunctionPropValue.initClass();
    return FunctionPropValue;
})())
);

defaultExport.FunctionPropControl = (FunctionPropControl = Model.register("prop-ctrl(function)", (FunctionPropControl = (function() {
    FunctionPropControl = class FunctionPropControl extends PropControl {
        static initClass() {
            this.userVisibleLabel = 'Function';
            this.prototype.properties =
                {defaultValue: String};
    
            this.prototype.ValueType = FunctionPropValue;
        }
        constructor(json) {
            super(json);
            if (this.defaultValue == null) { this.defaultValue = ''; }
        }

        // default value has isDynamic always on because .code sets it...
        default() { return new this.ValueType({innerValue: Dynamicable.code(this.defaultValue)}); }
        random() { return new this.ValueType({innerValue: Dynamicable.code('undefined')}); }

        // ... and no controls to change isDynamic
        totallyCustomControl(label, propValueValueLink) { return null; }
    };
    FunctionPropControl.initClass();
    return FunctionPropControl;
})())
));

// Dropdown props are more complicated since they have an internal model of "options"
// so they can't be defined by the above registerPropControl helper
var DropdownPropValue = Model.register("prop-val(dropdown)", (DropdownPropValue = (function() {
    DropdownPropValue = class DropdownPropValue extends PropValue {
        static initClass() {
            this.prototype.properties =
                {innerValue: Dynamicable(String)};
        }

        getValueAsJsonDynamicable(control) { return this.innerValue; }
        enforceValueConformsWithSpec(control, willMutate) {} // noop
        isCompatibleWith(propControl) { return propControl.ValueType === this.constructor; }
    };
    DropdownPropValue.initClass();
    return DropdownPropValue;
})())
);


defaultExport.DropdownPropControl = (DropdownPropControl = Model.register("prop-ctrl(dropdown)", (DropdownPropControl = (function() {
    DropdownPropControl = class DropdownPropControl extends PropControl {
        static initClass() {
            this.userVisibleLabel = 'Dropdown';
            this.prototype.properties = {
                options: [String],
                defaultValue: String
            };
    
            this.property('sidebarControl',
                {get() { return SelectControl({style: 'dropdown'}, this.options.map(o => [o, o])); }});
            this.prototype.ValueType = DropdownPropValue;
             // | undefined
        }

        constructor(json) {
            super(json);
            if (this.options == null) { this.options = ['option0']; }
        }
        default() { return new this.ValueType({innerValue: (Dynamicable(String)).from(this.defaultValue != null ? this.defaultValue : _l.first(this.options))}); }
        random() { return new this.ValueType({innerValue: (Dynamicable(String)).from(_l.sample(this.options))}); }

        // In the component definition, users get a customSpecControl for dropdown controls that lets them
        // add/delete options to the list of options
        customSpecControl(controlValueLink) {
            const optionsValueLink = propValueLinkTransformer('options', controlValueLink);
            const itemRenderer = (elemValueLink, handleRemove) => <div
                style={{display: 'flex', alignItems: 'center', paddingRight: '6px', marginTop: '6px'}}>
                <i
                    role="button"
                    className="material-icons md-14"
                    style={{lineHeight: '24px', color: 'black', marginRight: '6px'}}
                    onClick={handleRemove}>
                    delete
                </i>
                <FormControl
                    style={{flexGrow: '1'}}
                    debounced={true}
                    type="text"
                    valueLink={elemValueLink} />
            </div>;

            return (
                <div style={{paddingLeft: indentation}}>
                    <ListComponent
                        label={React.createElement("h5", {"className": "sidebar-ctrl-label"}, "Dropdown options")}
                        valueLink={optionsValueLink}
                        newElement={function() { return `option${optionsValueLink.value.length}`; }}
                        elem={itemRenderer} />
                </div>
            );
        }
    };
    DropdownPropControl.initClass();
    return DropdownPropControl;
})())
));

//# Generic list controls
var ListPropValue = Model.register("prop-val(list)", (ListPropValue = (function() {
    ListPropValue = class ListPropValue extends PropValue {
        static initClass() {
            this.prototype.properties =
                {innerValue: Dynamicable([PropValue])};
        }

        getValueAsJsonDynamicable(control) {
            return this.innerValue.mapStatic(pList => _l.map(pList, p => p.getValueAsJsonDynamicable(control.elemType)));
        }

        enforceValueConformsWithSpec(control, willMutate) {
            return Array.from(this.innerValue.staticValue).map((val) => val.enforceValueConformsWithSpec(control.elemType, willMutate));
        }

        isCompatibleWith(propControl) {
            // propControl must be a ListControl and its elemType must be the same as ours, or both should be empty
            return (propControl.ValueType === this.constructor) && 
                (_l.isEmpty(this.innerValue.staticValue) || this.innerValue.staticValue[0].isCompatibleWith(propControl.elemType));
        }
    };
    ListPropValue.initClass();
    return ListPropValue;
})())
);


defaultExport.ListPropControl = (ListPropControl = Model.register("prop-ctrl(list)", (ListPropControl = (function() {
    ListPropControl = class ListPropControl extends PropControl {
        static initClass() {
            this.userVisibleLabel = 'List';
            this.prototype.properties =
                {elemType: PropControl};
    
            this.property('sidebarControl', {
                get() {
                    return (label, valueLink) => {
                        const elem = (elemValueLink, handleRemove, i) => {
                            return (
                                <div style={{paddingLeft: indentation, display: 'flex', alignItems: 'center'}}>
                                    {(DynamicableControl(this.elemType.sidebarControl))(`${i}:`, propValueLinkTransformer('innerValue', elemValueLink))}
                                    <i
                                        role="button"
                                        className="material-icons md-14"
                                        style={{color: 'black', marginLeft: '6px'}}
                                        onClick={handleRemove}>
                                        delete
                                    </i>
                                </div>
                            );
                        };
                        return (
                            <ListComponent
                                label={React.createElement("h5", {"className": "sidebar-ctrl-label"}, (label))}
                                valueLink={valueLink}
                                newElement={() => this.elemType.default()}
                                elem={elem} />
                        );
                    };
                }
            }
            );
    
            this.prototype.ValueType = ListPropValue;
        }

        constructor(json) {
            super(json);
            if (this.elemType == null) { this.elemType = new StringPropControl(); }
        }
        default() { return new this.ValueType({innerValue: (Dynamicable([PropValue])).from([])}); }
        random() {
            const n = _l.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            return new this.ValueType({innerValue: (Dynamicable([PropValue])).from(__range__(0, n, true).map(i => this.elemType.random()))});
        }

        // In the component definition, users get a customSpecControl that lets them choose the type of list
        customSpecControl(controlValueLink) {
            const elemTypeValueLink = propValueLinkTransformer('elemType', controlValueLink);
            return (
                <div style={{paddingLeft: indentation}}>
                    <div className="ctrl-wrapper">
                        <h5 className="sidebar-ctrl-label">
                            Element type
                        </h5>
                        <PdIndexDropdown
                            options={controlTypes.map(ctrl => ({
                                value: ctrl.userVisibleLabel,
                                handler() { return elemTypeValueLink.requestChange(new ctrl()); }
                            }))}
                            defaultIndex={_l.findIndex(controlTypes, ctrl => elemTypeValueLink.value instanceof ctrl)} />
                    </div>
                    {this.elemType.customSpecControl(elemTypeValueLink)}
                </div>
            );
        }
    };
    ListPropControl.initClass();
    return ListPropControl;
})())
));

//# Generic object controls
const getProps = (propInstances, propSpecs) => _l.map(propSpecs, spec => {
    let foundProp = _l.find(propInstances, prop => prop.correspondsTo(spec));
    if ((foundProp == null)) {
        foundProp = spec.newInstance();
    }
    util.assert(() => foundProp != null); // ensured by normalize
    return [foundProp, spec];
});

// Don't over-think this. PropInstance is just a single (name, value) tuple representing a member of an ObjectPropValue
defaultExport.PropInstance = (PropInstance = Model.register('prop-inst', (PropInstance = (function() {
    PropInstance = class PropInstance extends Model {
        static initClass() {
            this.prototype.properties = {
                specUniqueKey: String,
                value: PropValue,
                present: Boolean
            };
        }

        constructor(json) {
            super(json);
            if (this.present == null) { this.present = false; }
        }

        correspondsTo(propSpec) {
            return (this.specUniqueKey === propSpec.uniqueKey) && this.value.isCompatibleWith(propSpec.control);
        }
    };
    PropInstance.initClass();
    return PropInstance;
})())
));

defaultExport.ObjectPropValue = (ObjectPropValue = Model.register("prop-val(obj)", (ObjectPropValue = (function() {
    ObjectPropValue = class ObjectPropValue extends PropValue {
        static initClass() {
            this.prototype.properties =
                {innerValue: Dynamicable([PropInstance])};
        }

        constructor(json) {
            super(json);
            if (this.innerValue == null) { this.innerValue = (Dynamicable([PropInstance])).from([]); }
        }

        getValueAsJsonDynamicable(control) {
            // FIXME: mapStatic is being overloaded here since its return type in this case isn't Dynamicable([PropInstance])
            // but Dynamicable(JSON)
            return this.innerValue.mapStatic(val => {
                return _l.fromPairs(_l.compact(getProps(val, control.attrTypes).map(function(...args) {
                    const [prop, spec] = Array.from(args[0]);
                    if (spec.required || prop.present) {
                        return [spec.name, prop.value.getValueAsJsonDynamicable(spec.control)];
                    } else if (spec.hasUnpresentValue) { // Should support returning an unpresent value
                        return undefined;
                    } else {
                        return [spec.name, spec.control.default().getValueAsJsonDynamicable(spec.control)];
                    }})));
        });
        }

        enforceValueConformsWithSpec(control, willMutate) {
            return (() => {
                const result = [];
                for (var spec of Array.from(control.attrTypes)) {
                    var foundProp = _l.find(this.innerValue.staticValue, prop => prop.correspondsTo(spec));

                    // Ensure we have at least one
                    if ((foundProp == null)) {
                        foundProp = spec.newInstance();
                        willMutate(() => {
                            return this.innerValue.staticValue.push(foundProp);
                        });
                    }

                    // Ensure we have exactly one
                    _l.remove(this.innerValue.staticValue, prop => prop.correspondsTo(spec) && (prop !== foundProp));
                    util.assert(() => this.innerValue.staticValue.filter(prop => prop.correspondsTo(spec)).length === 1);

                    result.push(foundProp.value.enforceValueConformsWithSpec(spec.control, willMutate));
                }
                return result;
            })();
        }

        isCompatibleWith(propControl) { return propControl.ValueType === this.constructor; }
    };
    ObjectPropValue.initClass();
    return ObjectPropValue;
})())
));

// Don't over-think this. PropSpec is just a single (name, type) tuple representing a member of an ObjectPropControl
defaultExport.PropSpec = Model.register('prop-spec', (PropSpec = (function() {
    PropSpec = class PropSpec extends Model {
        static initClass() {
            this.prototype.properties = {
                name: String,
                control: PropControl,
                required: Boolean,
                hasUnpresentValue: Boolean,
                presentByDefault: Boolean
            };
    
            this.property('title', {
                get() {
                    return _l.words(this.name).map(_l.capitalize).join(' ');
                }
            }
            );
        }

        constructor(json) {
            super(json);
            if (this.required == null) { this.required = true; }
            if (this.hasUnpresentValue == null) { this.hasUnpresentValue = false; }
            if (this.presentByDefault == null) { this.presentByDefault = false; }
        }

        newInstance() { return new PropInstance({specUniqueKey: this.uniqueKey, value: this.control.default(), present: this.presentByDefault}); }
        randomInstance() { return new PropInstance({specUniqueKey: this.uniqueKey, value: this.control.random(), present: this.presentByDefault}); } // maybe present should be random as well

        propValueSidebarControl(label, propValueValueLink) {
            if (this.control.totallyCustomControl != null) { return this.control.totallyCustomControl(label, propValueValueLink); }
            return DynamicableControl(this.control.sidebarControl)(label, propValueLinkTransformer('innerValue', propValueValueLink));
        }
    };
    PropSpec.initClass();
    return PropSpec;
})())
);

const propInstancesDotVl = (prop, propInstancesValueLink, property) => {
   return {
       value: prop[property],
       requestChange: nv => {
           // FIXME: This seems kinda jank. The below line actually mutates the array
           // and the requestChange just kicks the propInstancesValueLink to let it know
           // something changed
           prop[property] = nv;
           return propInstancesValueLink.requestChange(propInstancesValueLink.value);
       }
   };
};

defaultExport.ObjectPropControl = (ObjectPropControl = Model.register("prop-ctrl(obj)", (ObjectPropControl = (function() {
    ObjectPropControl = class ObjectPropControl extends PropControl {
        static initClass() {
            this.userVisibleLabel = 'Object';
            this.prototype.properties =
                {attrTypes: [PropSpec]};
    
            this.property('sidebarControl', {
                get() { return (label, propInstancesValueLink) => {
                    const allProps = _l.filter(getProps(propInstancesValueLink.value, this.attrTypes), (...args) => {
                        const [prop, spec] = Array.from(args[0]);
                        return !(spec.control instanceof FunctionPropControl);
                    });
    
                    if (allProps.length === 0) { return null; }
    
                    const visibleProps = _l.filter(allProps, (...args) => { const [prop, spec] = Array.from(args[0]); return prop.present || spec.required; });
                    const availableProps = _l.filter(allProps, (...args) => { const [prop, spec] = Array.from(args[0]); return !prop.present && !spec.required; });
    
                    return (
                        <div>
                            <div
                                style={{display: 'flex', alignItems: 'center', marginTop: '9px', height: '20px'}}>
                                <h5 className="sidebar-ctrl-label" style={{flex: 1}}>
                                    {label}
                                </h5>
                                {availableProps.length > 0 ?
                                        <PdPopupMenu
                                            label="Add optional properties"
                                            iconName="add"
                                            options={_l.map(availableProps, (...args) => { const [prop, spec] = Array.from(args[0]); return spec.title; })}
                                            onSelect={index => {
                                                const [prop, spec] = Array.from(availableProps[index]);
                                                prop.present = true;
                                                return propInstancesValueLink.requestChange(propInstancesValueLink.value);
                                            }} /> : undefined}
                            </div>
                            <div style={{paddingLeft: indentation}}>
                                {_l.map(visibleProps, (...args) => {
                                        const [prop, spec] = Array.from(args[0]);
                                        const valueVl = propInstancesDotVl(prop, propInstancesValueLink, 'value');
                                        const presentVl = propInstancesDotVl(prop, propInstancesValueLink, 'present');
                                        return (
                                            <div
                                                key={prop.specUniqueKey}
                                                style={{display: 'flex', alignItems: 'flex-start'}}>
                                                {spec.propValueSidebarControl(spec.title, valueVl)}
                                                {!spec.required ?
                                                        <i
                                                            className="material-icons md-14"
                                                            title="Remove this property"
                                                            style={{marginLeft: '6px', marginTop: '6px'}}
                                                            onClick={() => presentVl.requestChange(false)}>
                                                            delete
                                                        </i> : undefined}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    );
                }; }
            }
            );
    
    
            this.prototype.ValueType = ObjectPropValue;
        }

        constructor(json) {
            super(json);
            if (this.attrTypes == null) { this.attrTypes = []; }
        }
        default() { return new this.ValueType(); }
        random() {
            return new this.ValueType({innerValue: (Dynamicable([PropInstance])).from(this.attrTypes.map(spec => spec.randomInstance()))});
        }

        customSpecControl(objectControlVl, label, indent) {
            if (label == null) { label = <h5 className="sidebar-ctrl-label">
                keys
            </h5>; }
            if (indent == null) { indent = true; }
            const PropSpecControl = function(elemValueLink, handleRemove) {
                const controlValueLink = propValueLinkTransformer('control', elemValueLink);

                return (
                    <div style={{flexGrow: '1', marginBottom: '9px'}}>
                        <div style={{display: 'flex', marginBottom: '5px'}}>
                            <div
                                style={{marginRight: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                                <i
                                    role="button"
                                    className="material-icons md-14"
                                    style={{color: 'black'}}
                                    onClick={handleRemove}>
                                    delete
                                </i>
                            </div>
                            <div
                                style={{marginRight: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                                <Tooltip position="top" content="Required">
                                    <FormControl
                                        style={{margin: 0}}
                                        type="checkbox"
                                        valueLink={propValueLinkTransformer('required', elemValueLink)} />
                                </Tooltip>
                            </div>
                            <FormControl
                                debounced={true}
                                placeholder="Prop name"
                                type="text"
                                valueLink={propValueLinkTransformer('name', elemValueLink)}
                                style={{width: '100%', marginRight: '5px'}} />
                            <PdIndexDropdown
                                options={controlTypes.map(ctrl => ({
                                    value: ctrl.userVisibleLabel,
                                    handler() { return controlValueLink.requestChange(new ctrl()); }
                                }))}
                                defaultIndex={_l.findIndex(controlTypes, ctrl => controlValueLink.value instanceof ctrl)} />
                        </div>
                        {elemValueLink.value.control.customSpecControl(controlValueLink)}
                    </div>
                );
            };
            return (
                <div style={{paddingLeft: indent ? indentation : 0}}>
                    <ListComponent
                        label={label}
                        valueLink={propValueLinkTransformer('attrTypes', objectControlVl)}
                        newElement={function() { return new PropSpec({name: "", control: new StringPropControl()}); }}
                        elem={PropSpecControl} />
                </div>
            );
        }
    };
    ObjectPropControl.initClass();
    return ObjectPropControl;
})())
));

// :: PropControl -> PropValue -> [{spec: PropSpec, value: PropValue, parentSpec: PropSpec?}]
defaultExport.flattenedSpecAndValue = (flattenedSpecAndValue = (propControl, propValues) => {
    const specs = propControl.attrTypes;
    const instances = propValues.innerValue.staticValue;

    return _l.compact(_l.flatten(_l.map(specs, spec => {
        const value = instances.find(i => i.correspondsTo(spec));
        util.prod_assert(() => value != null);
        if (spec.control instanceof ObjectPropControl) {
            const child = flattenedSpecAndValue(spec.control, value.value);
            return _l.flatten([
                {spec, value},
                _l.map(child, c => _l.assign({parentSpec: spec}, c))
            ]);
        } else {
            return {spec, value};
        }
})));
});

defaultExport.controlTypes = (controlTypes = [
    StringPropControl,
    DropdownPropControl,
    NumberPropControl,
    CheckboxPropControl,
    ColorPropControl,
    ImagePropControl,
    ListPropControl,
    ObjectPropControl,
    FunctionPropControl
]);

export default defaultExport;

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}