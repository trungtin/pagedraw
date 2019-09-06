// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MultistateBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import { propLink } from '../util';
import config from '../config';
import Block from '../block';

import {
    SelectControl,
    propValueLinkTransformer,
    TextControl,
    TextControlWithDefault,
    NumberControl,
    CheckboxControl,
    ColorControl,
    valueLinkTransformer,
} from '../editor/sidebar-controls';

import { Model } from '../model';
import { PropSpec, StringPropControl } from '../props';
import { ComponentSpec, sidebarControlsOfComponent } from '../component-spec';
import ScreenSizeBlock from './screen-size-block';

export default Model.register('multistate', (MultistateBlock = (function() {
    MultistateBlock = class MultistateBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Multistate Group';
            this.keyCommand = 'M';
    
            this.prototype.properties = {
                componentSpec: ComponentSpec,
                stateExpression: String
            };
    
            this.property('componentSymbol',
                {get() { return this.name; }});
    
            this.prototype.canContainChildren = true;
        }

        getStates() {
            return this.doc.getImmediateChildren(this)
                .filter(b => b.isArtboardBlock || (b instanceof ScreenSizeBlock) || (b instanceof MultistateBlock))
                .map(block => [block, block.name != null ? block.name : ""]);
        }

        constructor(json) {
            super(json);

            // on every new multistate block, we already add a propSpec of a variable called 'state'
            // which is the default of the stateExpression. With this, any instance of this multistate block
            // already has the state variable in its sidebar by default
            if (this.componentSpec == null) { this.componentSpec = new ComponentSpec({propSpecs: [new PropSpec({name: 'state', control: new StringPropControl()})]}); }

            // if this block never gets added to a doc, assume lang=React
            if (this.stateExpression == null) { this.stateExpression = 'this.props.state'; }
        }

        onAddedToDoc() {
            return this.stateExpression != null ? this.stateExpression : (this.stateExpression = (() => { switch (this.doc.export_lang) {
                case 'React': case 'JSX': case 'TSX': case 'CJSX': return 'this.props.state';
                case 'Angular2':                    return 'this.state';
            } })());
        }

        specialCodeSidebarControls(onChange) { let left, states_hint;
        return [
            (
                (states_hint = (left = this.getStates().map(function(...args) { const [artboard, state_name] = Array.from(args[0]); return state_name; }).join('/')) != null ? left : ""),
                ["Multistate expression", propLink(this, 'stateExpression', onChange), states_hint]
            )
        ]; }

        sidebarControls(linkAttr, onChange) {
            const componentSpecLinkAttr = specProp => propValueLinkTransformer(specProp, linkAttr('componentSpec'));
            return _l.flatten([
                this.defaultTopSidebarControls(...arguments),
                ...Array.from((this.isComponent ? sidebarControlsOfComponent(this, componentSpecLinkAttr, onChange) : []))
            ]);
        }

        editor() {
            // height and width are included in the line below because if my children are all flexible
            // then I'm gonna be considered flexible as well by the constraint propagation algorithm
            // and that will collapse me down in content editor. Artboards should never be flexible so
            // we enforce that here.
            // FIXME: I don't like this here. Maybe there's a better, more
            // generalizable way to enforce fixed geometry like this?
            return (
                <div
                    style={{position: 'relative', minHeight: this.height, minWidth: this.width}}>
                    <div
                        style={{
                            position: 'absolute', top: 20, left: 30,
                            fontFamily: 'Helvetica', fontWeight: 'bold', fontSize: '1.3em'
                        }}>
                        {this.getLabel()}
                    </div>
                    <div
                        style={{
                            border: '10px dashed #DEDEDE', borderRadius: 30,
                            position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}} />
                </div>
            );
        }
    };
    MultistateBlock.initClass();
    return MultistateBlock;
})())
);
