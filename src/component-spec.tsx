/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let angularJsNameForComponent, angularTagNameForComponent, ComponentSpec, cssPathOfComponent, filePathOfComponent, reactJSNameForComponent, reactJSNameForLibrary, sidebarControlsOfComponent, templatePathOfComponent;
import _l from 'lodash';
import React from 'react';
import { CheckboxControl, propValueLinkTransformer } from './editor/sidebar-controls';
import { Model } from './model';
import { collisions, assert, capitalize_first_char } from './util';
import { ObjectPropControl } from './props';
import { isExternalComponent } from './libraries';
const defaultExport = {};

defaultExport.ComponentSpec = Model.register('component-spec', (ComponentSpec = (function() {
    ComponentSpec = class ComponentSpec extends Model {
        static initClass() {
            this.prototype.properties = {
                componentRef: String, // the unique identifier used by instances to reference this component
                propControl: ObjectPropControl,
    
                // This name is slightly wrong. Now we use this to mean "shouldSync" for the CLI
                shouldCompile: Boolean,
    
                // Where this component's compiled code should be placed relative to the toplevel of the user's project
                filePath: String,
                cssPath: String,
    
                // In case the user wants to add some code at the top of the file corresponding to this component
                codePrefix: String,
    
                flexWidth: Boolean,
                flexHeight: Boolean
            };
        }

        regenerateKey() {
            super.regenerateKey();
            return this.componentRef = String(Math.random()).slice(2);
        }

        constructor(json) {
            super(json);

            if (this.propControl == null) { this.propControl = new ObjectPropControl(); }
            if (this.shouldCompile == null) { this.shouldCompile = true; }
            if (this.codePrefix == null) { this.codePrefix = ''; }
            if (this.filePath == null) { this.filePath = ''; }
            if (this.cssPath == null) { this.cssPath = ''; }
            if (this.flexWidth == null) { this.flexWidth = false; }
            if (this.flexHeight == null) { this.flexHeight = false; }

            // The way docs get componentRef usually is through model.coffee's regenerateKey()
            // but some old docs never got a componentRef. To ensure consistency we add it here if it doesn't exist at this
            // point (even though it should exist)
            if (this.componentRef == null) { this.componentRef = String(Math.random()).slice(2); }
        }

        addSpec(propSpec) { return this.propControl.attrTypes.push(propSpec); }

        removeSpec(propSpec) { return this.propControl.attrTypes.splice(this.propControl.attrTypes.indexOf(propSpec), 1); }
    };
    ComponentSpec.initClass();
    return ComponentSpec;
})())
);


let without_invalid_identifier_chars = str => str.replace(/[^\w-_]+/g, '_');
let identifierify = str => without_invalid_identifier_chars(str).toLowerCase();
let defined_if_nonempty = function(val) { if (_l.isEmpty(val)) { return undefined; } else { return val; } };

// Fuck object oriented programming. These are out of ComponentSpec so we can have access to the component itself
defaultExport.sidebarControlsOfComponent = (sidebarControlsOfComponent = function(component, specLinkAttr, onChange) {
    assert(() => component.isComponent && (component.componentSpec != null));
    return [
        React.createElement("hr", null),
        CheckboxControl("instances have resizable width", specLinkAttr('flexWidth')),
        CheckboxControl("instances have resizable height", specLinkAttr('flexHeight'))
    ];
});

defaultExport.filePathOfComponent = (filePathOfComponent = function(component) {
    assert(() => component.isComponent && (component.componentSpec != null));

    if (isExternalComponent(component)) { return component.componentSpec.importPath; }

    if (!_l.isEmpty(component.componentSpec.filePath)) { return component.componentSpec.filePath.replace(/^\//, ''); }

    // utils
    const componentNameAsFilePathSegment = identifierify(component.getLabel());
    const use_extension = ext => `${component.doc.filepath_prefix}/${componentNameAsFilePathSegment}.${ext}`;

    // depend on the language
    switch (component.doc.export_lang) {
        case 'JSX':               return use_extension('js');
        case 'React':             return use_extension('js');
        case 'CJSX':              return use_extension('cjsx');
        case 'TSX':               return use_extension('tsx');
        case 'html':              return use_extension('html');
        case 'html-email':        return use_extension('html');
        case 'Angular2':          return `${component.doc.filepath_prefix}/${componentNameAsFilePathSegment}/${componentNameAsFilePathSegment}.component.ts`;

        // unused
        case 'debug':             return use_extension('debug');
        case 'PHP':               return use_extension('php');
        case 'ERB':               return use_extension('html.erb');
        case 'Handlebars':        return use_extension('handlebars');
        case 'Jade':              return use_extension('jade');
        case 'Jinja2':            return use_extension('html');

        // if we missed a case
        default:
            assert(() => false); // Never get here
            // If we do get here, try to do something reasonable
            return use_extension(component.doc.export_lang.toLowerCase());
    }
});

defaultExport.cssPathOfComponent = (cssPathOfComponent = function(component) {
    assert(() => component.isComponent && (component.componentSpec != null));
    assert(() => !isExternalComponent(component)); // not supported for now
    if (!_l.isEmpty(component.componentSpec.cssPath)) { return component.componentSpec.cssPath.replace(/^\//, ''); }

    const componentNameAsFilePathSegment = identifierify(component.getLabel());

    switch (component.doc.export_lang) {
        case 'Angular2': return `${component.doc.filepath_prefix}/${componentNameAsFilePathSegment}/${componentNameAsFilePathSegment}.component.css`;
        default:                 return `${component.doc.filepath_prefix}/${componentNameAsFilePathSegment}.css`;
    }
});

// dash is allowed in filepaths but not allowed in JS symbols
const without_invalid_symbol_chars = str => str.replace(/[^\w_]+/g, '_');
const symbol_identifierify = str => without_invalid_symbol_chars(str).toLowerCase();

defaultExport.reactJSNameForLibrary = (reactJSNameForLibrary = function(library) {
    // FIXME these should be globally unique, even if component.componentSymbol isn't
    // FIXME this allows dashes in component names, even if it's in Javascript
    let left;
    return _l.capitalize((left = defined_if_nonempty(symbol_identifierify(library.library_name != null ? library.library_name : ""))) != null ? left : `pd${library.uniqueKey}`);
});

defaultExport.reactJSNameForComponent = (reactJSNameForComponent = function(component, doc) {
    assert(() => component.isComponent && (component.componentSpec != null));

    const reactSymbolForComponent = function(component) {
        // FIXME these should be globally unique, even if component.componentSymbol isn't
        // FIXME this allows dashes in component names, even if it's in Javascript
        let left;
        return _l.capitalize((left = defined_if_nonempty(symbol_identifierify(component.componentSymbol != null ? component.componentSymbol : ""))) != null ? left : `pd${component.uniqueKey}`);
    };

    // NOTE this is here for old ExternalComponents (code wrappers)
    if (component.importSymbol != null) { return component.importSymbol; }

    if (isExternalComponent(component)) {
        const library = _l.find(doc.libraries, l => _l.find(l.getCachedExternalCodeSpecs(), {ref: component.componentSpec.ref}) != null);
        if ((library == null)) { throw new Error(`External Component w/ ref ${component.componentSpec.ref} without a library`); }
        return `${reactJSNameForLibrary(library)}.${component.componentSpec.name}`;
    } else {
        return reactSymbolForComponent(component);
    }
});



// only used for Angular
defaultExport.templatePathOfComponent = (templatePathOfComponent = function(component) {
    assert(() => component.isComponent && (component.componentSpec != null));
    assert(() => !isExternalComponent(component)); // not supported for now

    // HACK we don't let users override this, so let's go next to the .ts file
    const ts_path = filePathOfComponent(component);
    const strip_extension = path => path.replace(/\.[^//]*$/, '');
    return strip_extension(ts_path) + ".component.html";
});

// only used for Angular
defaultExport.angularTagNameForComponent = (angularTagNameForComponent = function(component) {
    let left;
    assert(() => component.isComponent && (component.componentSpec != null));
    assert(() => !isExternalComponent(component));

    without_invalid_identifier_chars = str => str.replace(/[^\w-_]+/g, '_');
    identifierify = str => without_invalid_identifier_chars(str).toLowerCase();

    defined_if_nonempty = function(val) { if (_l.isEmpty(val)) { return undefined; } else { return val; } };

    // FIXME these should be globally unique, even if component.componentSymbol isn't
    // FIXME this allows dashes in component names, even if it's in Javascript
    const symbol = (left = defined_if_nonempty(identifierify(component.componentSymbol != null ? component.componentSymbol : ""))) != null ? left : `pd${component.uniqueKey}`;

    return symbol.replace("_", "-").toLowerCase();
});

defaultExport.angularJsNameForComponent = (angularJsNameForComponent = function(component) {
    let left;
    assert(() => component.isComponent && (component.componentSpec != null));
    assert(() => !isExternalComponent(component));

    without_invalid_identifier_chars = str => str.replace(/[^\w-_]+/g, '_');
    identifierify = str => without_invalid_identifier_chars(str).toLowerCase();

    defined_if_nonempty = function(val) { if (_l.isEmpty(val)) { return undefined; } else { return val; } };

    // FIXME these should be globally unique, even if component.componentSymbol isn't
    // FIXME this allows dashes in component names, even if it's in Javascript
    const symbol = (left = defined_if_nonempty(identifierify(component.componentSymbol != null ? component.componentSymbol : ""))) != null ? left : `pd${component.uniqueKey}`;

    return symbol.split("_").map(capitalize_first_char).join('');
});

defaultExport.errorsOfComponent = function(component) {
    const MultistateBlock = require('./blocks/multistate-block');
    const ArtboardBlock = require('./blocks/artboard-block');
    const ScreenSizeBlock = require('./blocks/screen-size-block');

    assert(() => component.isComponent && (component.componentSpec != null));
    assert(() => !isExternalComponent(component));

    const blocks = component.andChildren();

    const hasEmptyOverrideCode = blocks.some(block => block.hasCustomCode && _l.isEmpty(block.customCode));
    const hasEmptyEventHandler = blocks.some(block => block.eventHandlers.some(({code}) => _l.isEmpty(code)));
    const hasEmptyPropName = !(component.componentSpec.propControl.attrTypes != null ? component.componentSpec.propControl.attrTypes.every(el => el.name) : undefined);
    const nameCollisions = _l.uniq(_l.compact(collisions(component.componentSpec.propControl.attrTypes, (attr => attr.name))));
    const containsScreenSizeBlock = component.doc.getChildren(component).some(block => (typeof block.getSourceComponent === 'function' ? block.getSourceComponent() : undefined) instanceof ScreenSizeBlock);

    const isMultistate = component instanceof MultistateBlock;
    var stateNameCollisions = function(blockTree) {
        const childrenCollisions = _l.flatten(blockTree.children.filter(({block}) => block instanceof MultistateBlock)
            .map(stateNameCollisions));

        return childrenCollisions.concat(_l.uniq(_l.compact(collisions(blockTree.children.filter(({block}) => block instanceof ArtboardBlock || block instanceof MultistateBlock), ({block}) => block.name)
        )
        )
        );
    };


    return _l.compact([
        ...Array.from((_l.flatten(_l.map(blocks, block => block.getDynamicsForUI())).filter(function(...args) {
            const [_0, _1, dynamicable] = Array.from(args[0]);
            return dynamicable.isDynamic && (dynamicable.code === '');
        })).map(function(...args) { const [uniqueKey, label, dynamicable] = Array.from(args[0]); return {errorCode: 'EMPTY_DYNAMICABLE', message: `Empty data binding for ${label}`}; })),

        component.componentSpec.name === '' ? {errorCode: 'EMPTY_COMPONENT_NAME', message: 'Empty component name'} : undefined, // currently not possible to leave empty
        hasEmptyOverrideCode ? {errorCode: 'EMPTY_OVERRIDE_CODE', message: 'Empty override code'} : undefined,
        hasEmptyEventHandler ? {errorCode: 'EMPTY_EVENT_HANDLER', message: 'Empty event handler'} : undefined,
        hasEmptyPropName ? {errorCode: 'EMPTY_PROP_NAME', message: 'Empty component argument name'} : undefined,
        containsScreenSizeBlock ? {errorCode: 'SCREEN_SIZE_BLOCK_NOT_TOPLEVEL', message: 'Screen Size Group instance inside another component'} : undefined,
        ...Array.from((nameCollisions.map(name => ({
            errorCode: 'PROP_NAME_COLLISION',
            message: `Found multiple component arguments with name: ${name}`
        })))),
        ...Array.from((isMultistate ? stateNameCollisions(component.blockTree).map(name => ({
            errorCode: 'MULTISTATE_NAME_COLLISION',
            message: `Found name collision in multistate group: ${name}`
        }))
        : []))
        // TODO: warn on nested artboards
    ]);
};
export default defaultExport;
