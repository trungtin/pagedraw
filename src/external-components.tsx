// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ExternalComponentInstance, ExternalComponentSpec, getExternalComponentSpecFromInstance;
import _l from 'lodash';
import React from 'react';
import FormControl from './frontend/form-control';
import { Model } from './model';
import { ObjectPropControl, ObjectPropValue } from './props';
import { dotVlt, SelectControl, CheckboxControl, TextControl } from './editor/sidebar-controls';
const defaultExport = {};


defaultExport.ExternalComponentSpec = (ExternalComponentSpec = Model.register('ext-component-spec', (ExternalComponentSpec = (function() {
    ExternalComponentSpec = class ExternalComponentSpec extends Model {
        static initClass() {
            this.prototype.properties = {
                name: String,
                relativeImport: Boolean,
                requirePath: String,
                defaultExport: Boolean,
                ref: String, // the unique identifier used by blocks to reference this map
                propControl: ObjectPropControl
            };
        }

        regenerateKey() {
            super.regenerateKey();
            return this.ref = String(Math.random()).slice(2);
        }

        constructor(json) {
            super(json);
            if (this.name == null) { this.name = ''; }
            if (this.requirePath == null) { this.requirePath = ''; }
            if (this.propControl == null) { this.propControl = new ObjectPropControl(); }
            if (this.relativeImport == null) { this.relativeImport = false; }
            if (this.defaultExport == null) { this.defaultExport = false; }
        }
    };
    ExternalComponentSpec.initClass();
    return ExternalComponentSpec;
})())
));


defaultExport.ExternalComponentInstance = Model.register('ext-component-instance', (ExternalComponentInstance = (function() {
    ExternalComponentInstance = class ExternalComponentInstance extends Model {
        static initClass() {
            this.prototype.properties = {
                srcRef: String,
                propValues: ObjectPropValue
            };
        }

        constructor(json) {
            super(json);
            if (this.propValues == null) { this.propValues = new ObjectPropValue(); }
        }
    };
    ExternalComponentInstance.initClass();
    return ExternalComponentInstance;
})())
);


defaultExport.getExternalComponentSpecFromInstance = (getExternalComponentSpecFromInstance = (extComponentInstance, doc) => _l.find(doc.externalComponentSpecs, spec => spec.ref === extComponentInstance.srcRef));


defaultExport.sidebarControlOfExternalComponentSpec = function(extComponentSpecValueLink) {
    // FIXME: propControl.customSpecControl stuff should probably be less object oriented
    const {
        propControl
    } = extComponentSpecValueLink.value;
    return (
        <div>
            {TextControl('component name', dotVlt(extComponentSpecValueLink, 'name'))}
            {TextControl('import path', dotVlt(extComponentSpecValueLink, 'requirePath'))}
            {CheckboxControl('relative import', dotVlt(extComponentSpecValueLink, 'relativeImport'))}
            {CheckboxControl('default export', dotVlt(extComponentSpecValueLink, 'defaultExport'))}
            {propControl.customSpecControl(dotVlt(extComponentSpecValueLink, 'propControl'), 'Component arguments')}
        </div>
    );
};

defaultExport.sidebarControlOfExternalComponentInstance = function(doc, extComponentInstanceVl) {
    const sourceComponent = getExternalComponentSpecFromInstance(extComponentInstanceVl.value, doc);
    if ((sourceComponent == null)) { return (
        <div>
            deleted
        </div>
    ); }
    return (
        <div>
            <FormControl
                tag="select"
                valueLink={dotVlt(extComponentInstanceVl, 'srcRef')}
                style={{width: '100%'}}>
                {doc.externalComponentSpecs.map((spec, i) => <option key={i} value={spec.ref}>
                    {spec.name}
                </option>)}
            </FormControl>
            {sourceComponent.propControl.attrTypes.length > 0 ?
                    sourceComponent.propControl.sidebarControl('props', dotVlt(extComponentInstanceVl, ['propValues', 'innerValue', 'staticValue'])) : undefined}
        </div>
    );
};
export default defaultExport;
