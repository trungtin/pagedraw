// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ScreenSizeBlock;
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
import MultistateBlock from './multistate-block';

export default Model.register('ssg', (ScreenSizeBlock = (function() {
    ScreenSizeBlock = class ScreenSizeBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Screen Size Group';
    
            this.prototype.properties =
                {componentSpec: ComponentSpec};
    
            this.property('componentSymbol',
                {get() { return this.name; }});
    
            this.prototype.canContainChildren = true;
        }

        constructor(json) {
            super(json);
            if (this.componentSpec == null) { this.componentSpec = new ComponentSpec({flexWidth: true, flexHeight: true}); }
        }

        sidebarControls(linkAttr, onChange) {
            const componentSpecLinkAttr = specProp => propValueLinkTransformer(specProp, linkAttr('componentSpec'));
            return this.defaultTopSidebarControls(...arguments);
        }

        renderHTML(pdom) {
            return super.renderHTML(...arguments);
        }

        editor() {
            // height and width are included in the line below because if my children are all flexible
            // then I'm gonna be considered flexible as well by the constraint propagation algorithm
            // and that will collapse me down in content editor. Artboards should never be flexible so
            // we enforce that here.
            // FIXME: I don't like this here. Maybe there's a better, more
            // generalizable way to enforce fixed geometry like this?
            return React.createElement("div", {"style": ({position: 'relative', minHeight: this.height, minWidth: this.width})},
                React.createElement("div", {"style": ({
                    position: 'absolute', top: 20, left: 30,
                    fontFamily: 'Helvetica', fontWeight: 'bold', fontSize: '1.3em'
                })}, (this.getLabel())),
                React.createElement("div", {"style": ({
                    border: '10px dashed #DEDEDE', borderRadius: 30,
                    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0})})
            );
        }
    };
    ScreenSizeBlock.initClass();
    return ScreenSizeBlock;
})())
);
