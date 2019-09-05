// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let BaseInstanceBlock, CheckboxPropControl, CodeInstanceBlock, DrawInstanceBlock, DropdownPropControl, FunctionPropControl, ListPropControl, NumberPropControl, ObjectPropControl, ObjectPropValue, propAndValueListFromInstance, PropInstance, PropSpec, StringPropControl;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import path from 'path';
import { Model } from '../model';
import Block from '../block';
({PropSpec, ObjectPropValue, PropInstance, DropdownPropControl, FunctionPropControl, PropSpec, CheckboxPropControl, ListPropControl, StringPropControl, NumberPropControl, ObjectPropControl} = require('../props'));
import { jsonDynamicableToJsonStatic, evalInstanceBlock, dynamicsInJsonDynamicable } from '../core';

import {
    DebouncedTextControl,
    NumberControl,
    CheckboxControl,
    propValueLinkTransformer,
    propControlTransformer,
} from '../editor/sidebar-controls';

import { pdomToReact } from '../editor/pdom-to-react';
import getSizeOfPdom from '../editor/get-size-of-pdom';
import { GenericDynamicable } from '../dynamicable';
import { filePathOfComponent, reactJSNameForComponent, reactJSNameForLibrary } from '../component-spec';
import { isExternalComponent, componentOfExternalSpec } from '../libraries';
import { flattenedSpecAndValue } from '../props';
import CodeShower from '../frontend/code-shower';
import modal from '../frontend/modal';
import { Modal, PdButtonOne } from '../editor/component-lib';
import config from '../config';
import { assert, memoize_on, propLink } from '../util';
const defaultExport = {};

defaultExport.BaseInstanceBlock = Model.register('base-inst', (BaseInstanceBlock = (function() {
    BaseInstanceBlock = class BaseInstanceBlock extends Block {
        static initClass() {
            this.prototype.properties = {
                sourceRef: String,
                propValues: ObjectPropValue,
                fixedWidth: Boolean,
                fixedHeight: Boolean
            };
    
            this.property('resizableEdges', {
                get() {
                    const source = this.getSourceComponent();
                    return _l.concat(((source != null ? source.componentSpec.flexWidth : undefined) ? ['left', 'right'] : []), ((source != null ? source.componentSpec.flexHeight : undefined) ? ['top', 'bottom'] : []));
                }
            }
            );
    
            // FIXME yield blocks :)
            this.prototype.canContainChildren = false;
    
            this.userVisibleLabel = '[PagedrawInternal:InstanceBlock]';
        }

        getTypeLabel() {
            const sourceComponent = this.getSourceComponent();
            if (!_l.isEmpty(sourceComponent != null ? sourceComponent.name : undefined)) { return `${sourceComponent.name} Instance`; }
            if (sourceComponent != null) { return "Unnamed Instance"; }
            if ((sourceComponent == null)) { return "Instance of Deleted Component"; }
        }

        getClassNameHint() { return __guard__(this.getSourceComponent(), x => x.name); }

        constructor(json) {
            super(json);
            if (this.propValues == null) { this.propValues = new ObjectPropValue(); }
        }

        defaultSidebarControls(linkAttr, onChange, editorCache) {
            const sourceComponent = this.getSourceComponent();
            if ((sourceComponent == null)) {
                return React.createElement("div", null, "This block\'s source component was deleted");
            }

            return _l.compact([
                Object.keys(sourceComponent.componentSpec.propControl.attrTypes).length > 0 ?
                    React.createElement(React.Fragment, null,
                        React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => { this.propValues = sourceComponent.componentSpec.propControl.random(); return onChange(); })}, "Randomize props"),

                    
                        React.createElement("div", {"style": ({overflow: 'auto'})},
                            (sourceComponent.componentSpec.propControl.sidebarControl('props', propValueLinkTransformer('staticValue', propValueLinkTransformer('innerValue', linkAttr('propValues')))))
                        ),

                        React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => this.handleExportParamsAsJson())}, "Export params as json")
                    ) : undefined
            ]);
        }

        constraintControls(linkAttr, onChange) { return _l.concat(super.constraintControls(linkAttr, onChange), [
                config.ignoreMinGeometryQuickfix ? React.createElement("hr", null) : undefined,
                // constraints
                config.ignoreMinGeometryQuickfix ? ["fixed width", "fixedWidth", CheckboxControl] : undefined,
                config.ignoreMinGeometryQuickfix ? ["fixed height", "fixedHeight", CheckboxControl] : undefined

            ]); }

        handleExportParamsAsJson() {
            const json = JSON.stringify(jsonDynamicableToJsonStatic(this.getPropsAsJsonDynamicable()), null, 4);
            return modal.show(closeHandler => [
                React.createElement(Modal.Header, {"closeButton": true},
                    React.createElement(Modal.Title, null, "JSON Params")
                ),
                React.createElement(Modal.Body, null,
                    React.createElement(CodeShower, {"content": (json)})
                ),
                React.createElement(Modal.Footer, null,
                    React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Close")
                )
            ]);
        }

        getPropsAsJsonDynamicable(editorCache) {
            if (editorCache == null) { editorCache = {}; }
            const getter = () => {
                const source = this.getSourceComponent();
                if (source != null) { return this.propValues.getValueAsJsonDynamicable(source.componentSpec.propControl); } else { return {}; }
            };

            // Sometimes the cache doesn't exist
            if ((editorCache.getPropsAsJsonDynamicableCache == null)) { return getter(); }
            return memoize_on(editorCache.getPropsAsJsonDynamicableCache, this.uniqueKey, getter);
        }

        // getDynamicsForUI :: (editorCache?) -> [(dynamicable_id :: String, user_visible_name :: String, Dynamicable)]
        getDynamicsForUI(editorCache_opt) {
            return dynamicsInJsonDynamicable(this.getPropsAsJsonDynamicable(editorCache_opt), 'props').map(({label, dynamicable}) => // getPropsAsJsonDynamicable does .mapStatic()s over lists.  When we do a mutation, we want to update the source.
            // However, we want to pass dynamicable instead of dynamicable.source because dynamicable's staticValue is a
            // jsonDynamicable, which can be lowered to a jsonStatic the the sidebar's code hint.
            [dynamicable.source.uniqueKey, label, dynamicable]).concat(this.getExternalComponentDynamicsForUI());
        }

        renderHTML(dom, options, editorCache_opt) {
            const source = this.getSourceComponent();

            if ((source == null)) {
                dom.backgroundColor = '#d8d8d8';
                dom.textContent = 'Source component not found';
                return;
            }

            dom.children = [{tag: source, props: this.getPropsAsJsonDynamicable(editorCache_opt), children: []}];

            // The below two lines are mimicing class="expand-children". This means components need flexGrow = 1 at the top level
            dom.display = 'flex';
            dom.flexDirection = 'column';

            // LAYOUT SYSTEM 1.0: Here we enforce 3.1)
            // "If a component's length is resizable and the instance length is not flexible, the size of the instance determines a min-length along that axis."
            // Note: It's wrong to look at this.flexWidth instead of dom.flexWidth, because dom.flexWidth might have been propagated
            // by our parent, overriding this.flexWidth
            if (source.componentSpec.flexWidth && (dom.horizontalLayoutType !== 'flex')) {
                dom.minWidth = dom.width;
            }

            if (source.componentSpec.flexHeight && (dom.verticalLayoutType !== 'flex')) {
                dom.minHeight = dom.height;
            }

            // width and length must never be present so we delete them or assert they're not there
            for (var {length, layoutType} of [{length:'width', layoutType:'horizontalLayoutType'}, {length:'height', layoutType:'verticalLayoutType'}]) {
                if (dom[layoutType] === 'flex') {
                    assert(() => _l.isEmpty(dom[length]));
                } else {
                    delete dom[length];
                }
            }

            // FIXME: LAYOUT SYSTEM hack
            if (this.fixedWidth) { dom.width = this.width; }
            if (this.fixedHeight) { return dom.height = this.height; }
        }


        getSourceComponent() { throw new Error('Override me'); }
    };
    BaseInstanceBlock.initClass();
    return BaseInstanceBlock;
})())
);


defaultExport.CodeInstanceBlock = Model.register('code-instance', (CodeInstanceBlock = (function() {
    CodeInstanceBlock = class CodeInstanceBlock extends BaseInstanceBlock {
        static initClass() {
            this.prototype.properties = {};
        }

        getSourceComponent() {
            let found;
            if (_l.isEmpty(this.sourceRef)) { return; }
            if ((found = _l.find(this.doc.getExternalCodeSpecs(), {ref: this.sourceRef})) != null) {
                return componentOfExternalSpec(found);
            }
        }

        getSourceLibrary() {
            if (_l.isEmpty(this.sourceRef)) { return; }
            return _l.find(this.doc.libraries, lib => _l.some(lib.getCachedExternalCodeSpecs(), {ref: this.sourceRef}));
        }

        getRequires(requirerPath) {
            const source = this.getSourceComponent();
            const lib = this.getSourceLibrary();
            if ((source == null) || (lib == null)) { return super.getRequires(requirerPath); }    // maybe should just crash here, imo. -jrp

            return _l.concat(super.getRequires(requirerPath), [{
                    symbol: reactJSNameForLibrary(lib),
                    path: lib.isNodeModule() ? lib.requirePath() : path.relative(path.parse(requirerPath).dir, lib.requirePath())
                }]);
        }
    };
    CodeInstanceBlock.initClass();
    return CodeInstanceBlock;
})())
);

defaultExport.DrawInstanceBlock = Model.register_with_legacy_absolute_tag('/block/instance-block', (DrawInstanceBlock = (function() {
    DrawInstanceBlock = class DrawInstanceBlock extends BaseInstanceBlock {
        static initClass() {
            this.prototype.properties = {};
        }

        getSourceComponent() {
            if (_l.isEmpty(this.sourceRef)) { return; }
            return __guard__(this.doc.getComponentBlockTreeBySourceRef(this.sourceRef), x => x.block);
        }

        // requirerPath is the file path of who's calling the require. src/A/B requiring src/C/D
        // should require ../../C/D. requirerPath is src/A/B and requirePath is src/C/D
        getRequires(requirerPath) {
            const source = this.getSourceComponent();
            if ((source == null)) { return super.getRequires(requirerPath); }    // maybe should just crash here, imo. -jrp

            const abs_path = filePathOfComponent(source);

            // Component is requiring itself recursively. No need to add an extra require
            if (requirerPath === abs_path) { return super.getRequires(requirerPath); }

            const relative_path = path.relative(path.parse(requirerPath).dir, abs_path);

            return _l.concat(super.getRequires(requirerPath), [
                {symbol: reactJSNameForComponent(source, this.doc), path: `./${relative_path}`}
            ]);
        }

        editor({editorCache, instance_compile_opts}) {
            // relies on the caller to wrap with expand-children and set the block's height/width
            return memoize_on(editorCache.instanceContentEditorCache, this.uniqueKey, () => {
                try {
                    // note that this is not participating in getPropsAsJsonDynamicable
                    return pdomToReact(evalInstanceBlock(this, instance_compile_opts));

                } catch (e) {
                    if (config.warnOnEvalPdomErrors) { console.warn(e); }
                    return React.createElement("div", {"style": ({width: this.width, padding: '0.5em', backgroundColor: '#ff7f7f'})},
                        (e.message)
                    );
                }
            });
        }
    };
    DrawInstanceBlock.initClass();
    return DrawInstanceBlock;
})())
);


// :: Block -> [{spec: PropSpec, value: PropValue, parentSpec: PropSpec?}]
defaultExport.propAndValueListFromInstance = (propAndValueListFromInstance = function(block) {
    const source = typeof block.getSourceComponent === 'function' ? block.getSourceComponent() : undefined;
    if (source == null) { return []; }

    // FIXME: This is a hack. It shouldn't be mutating here. But flattenedSpecAndValue is very wrong so this is a bandaid
    assert(() => block.doc.isInReadonlyMode());
    const willMutate = fn => { block.doc.leaveReadonlyMode(); fn(); return block.doc.enterReadonlyMode(); };
    block.propValues.enforceValueConformsWithSpec(source.componentSpec.propControl, willMutate);

    return flattenedSpecAndValue(
        source.componentSpec.propControl,
        block.propValues
    );
});


// legacy name
defaultExport.InstanceBlock = DrawInstanceBlock;

export default defaultExport;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}