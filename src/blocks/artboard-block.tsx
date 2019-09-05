// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ArtboardBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import config from '../config';
import Block from '../block';
import { Dynamicable } from '../dynamicable';

import {
    SelectControl,
    CustomSliderControl,
    propValueLinkTransformer,
    TextControl,
    TextControlWithDefault,
    NumberControl,
    LeftCheckboxControl,
    CheckboxControl,
    ColorControl,
    valueLinkTransformer,
    CursorControl,
} from '../editor/sidebar-controls';

import MultistateBlock from './multistate-block';
import { InstanceBlock } from './instance-block';
import { editorReactStylesForPdom } from '../editor/pdom-to-react';
import { Model } from '../model';
import { PropInstance, PropSpec, DropdownPropControl } from '../props';
import { ComponentSpec } from '../component-spec';
import core from '../core';
import { inferConstraints } from '../programs';

export default Block.register('artboard', (ArtboardBlock = (function() {
    ArtboardBlock = class ArtboardBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Artboard';
            this.keyCommand = 'A';
    
            this.prototype.properties = {
                // whether to include the background color in compiled code and instance blocks
                includeColorInCompilation: Boolean,
    
                // background image
                image: Dynamicable(String),
    
                // Right now we do not have a good story around flex height
                // so for now we can specify whether the root artboard is screenfull
                is_screenfull: Boolean,
    
                //# Design Grid stuff
                showDesignGrid: Boolean,
                gridNumOfColumns: Number,
                gridGutterWidth: Number,
    
                // Artboard style
                windowDressing: String,
    
                componentSpec: ComponentSpec
            };
    
            this.property('componentSymbol',
                {get() { return this.name; }});
    
            // LAYOUT SYSTEM 1.0: 3.2)
            // "Instances can be made flexible on some axis if and only if a component's length is resizable along that axis."
            this.compute_previously_persisted_property('flexWidth', {
                // HACK rootComponent may not exist yet when this is caleld in the constructor
                get() { let left;
                return (left = __guard__(__guard__(this.getRootComponent(), x1 => x1.componentSpec), x => x.flexWidth)) != null ? left : false; },
                set() {}
            }
            ); // HACK no-op to deal with Block.constructor trying to set this as part of a defaults thing
            this.compute_previously_persisted_property('flexHeight', {
                // HACK rootComponent may not exist yet when this is caleld in the constructor
                get() { let left;
                return (left = __guard__(__guard__(this.getRootComponent(), x1 => x1.componentSpec), x => x.flexHeight)) != null ? left : false; },
                set() {}
            }
            );
    
            this.prototype.canContainChildren = true;
            this.prototype.isArtboardBlock = true;
             // HACK no-op to deal with Block.constructor trying to set this as part of a defaults thing
        }

        constructor(json) {
            {
              // Hack: trick Babel/TypeScript into allowing this before super.
              if (false) { super(); }
              let thisFn = (() => { return this; }).toString();
              let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
              eval(`${thisName} = this;`);
            }
            this.becomeHoverable = this.becomeHoverable.bind(this);
            super(json);

            if (this.image == null) { this.image = Dynamicable(String).from(''); }
            if (this.is_screenfull == null) { this.is_screenfull = false; }

            // Design Grid
            if (this.showDesignGrid == null) { this.showDesignGrid = false; }
            if (this.gridNumOfColumns == null) { this.gridNumOfColumns = 12; }
            if (this.gridGutterWidth == null) { this.gridGutterWidth = 30; }

            // Artboard style
            if (this.windowDressing == null) { this.windowDressing = ''; }

            if (this.componentSpec == null) { this.componentSpec = new ComponentSpec(); }
            if (this.includeColorInCompilation == null) { this.includeColorInCompilation = true; }
        }

        getDefaultColor() { return '#FFFFFF'; }

        getTypeLabel() { return 'Component'; }

        defaultSidebarControls(linkAttr, onChange, editorCache, setEditorMode) {
            const StressTesterInteraction = require('../interactions/stress-tester');

            return _.compact([
                React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => { setEditorMode(new StressTesterInteraction(this)); return onChange({fast: true}); })}, "Stress test"),
                this.isComponent ? React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => this.becomeMultistate(onChange))}, "Make multistate") : undefined,
                this.isComponent ? React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => this.becomeHoverable(onChange))}, "Make Hoverable") : undefined,

                React.createElement("hr", null),

                // background styling
                ...Array.from(this.fillSidebarControls()),
                ["include color in instances/code", 'includeColorInCompilation', CheckboxControl],
                ["cursor", "cursor", CursorControl],

                React.createElement("hr", null),

                // Design grid
                // ["window dressing", "windowDressing", SelectControl({multi: false, style: 'dropdown'}, [
                //     ['None', '']
                //     ['Chrome', 'chrome']
                // ])]
                ["show grid", 'showDesignGrid', CheckboxControl],
                this.showDesignGrid ? ["grid column count", 'gridNumOfColumns', CustomSliderControl({min: 1, max: 24})] : undefined,
                this.showDesignGrid ? ["grid gutter width", 'gridGutterWidth', CustomSliderControl({min: 0, max: 100})] : undefined
            ]);
        }

        constraintControls(linkAttr, onChange, editorCache, setEditorMode) {
            const componentSpecLinkAttr = specProp => propValueLinkTransformer(specProp, linkAttr('componentSpec'));

            return _l.compact([
                ["Is page", 'is_screenfull', CheckboxControl],
                ...Array.from((this.isComponent && !this.is_screenfull ? [
                    React.createElement("span", {"style": ({fontSize: '12px'})}, "Instances have resizable"),
                    React.createElement("div", {"style": ({display: 'flex', justifyContent: 'flex'})},
                        (LeftCheckboxControl("Width", componentSpecLinkAttr('flexWidth'))),
                        (LeftCheckboxControl("Height", componentSpecLinkAttr('flexHeight')))
                    )
                ] : []))
            ]);
        }

        renderHTML(pdom, param) {
            if (param == null) { param = {}; }
            const {for_editor, for_component_instance_editor} = param;
            super.renderHTML(...arguments);

            if (!this.includeColorInCompilation && (!for_editor || for_component_instance_editor)) {
                delete pdom.background;
            }

            if (this.is_screenfull && !for_editor) {
                pdom.minHeight = "100vh";
                delete pdom.width;
            }

            if (this.image.isDynamic || !_l.isEmpty(this.image.staticValue)) {
                return _l.extend(pdom, {
                    backgroundImage: this.image.cssImgUrlified(),
                    'backgroundSize': 'cover',
                    'backgroundPositionX': '50%'
                }
                );
            }
        }



        editor(dom) {
            const styles = editorReactStylesForPdom(core.pdomDynamicableToPdomStatic(this.toPdom({
                templateLang: this.doc.export_lang,
                for_editor: true,
                for_component_instance_editor: false,
                getCompiledComponentByUniqueKey() { return assert(() => false); }
            })
            )
            );

            return this.renderWithoutWindowDressing(styles);
        }

            //if @windowDressing == 'chrome'
            //    @renderWithWindowDressing(styles)
            //else
            //    @renderWithoutWindowDressing(styles)

        renderWithoutWindowDressing(styles) {
            return React.createElement("div", {"className": "expand-children", "style": ({minWidth: this.width, minHeight: this.height, position: 'relative'})},
                React.createElement("div", {"style": ({
                    position: 'absolute', top: -20, whiteSpace: 'pre',
                    fontFamily: 'Open Sans',
                    color: this.is_screenfull ? '#111' : '#aa00cc'
                })},
                    (this.getLabel())
                ),
                React.createElement("div", {"className": "expand-children", "style": (_l.extend({}, {boxShadow: '0 0 5px 2px #DEDEDE'}, styles))}),
                (this.renderDesignGrid())
            );
        }

        renderWithWindowDressing(styles) {
            return React.createElement("div", {"className": "expand-children", "style": ({minWidth: this.width, minHeight: this.height, position: 'relative'})},

                React.createElement("div", {"style": ({
                    position: 'absolute', top: -75, height: 75,
                    left: 10, right: 10,
                    backgroundImage: `url('${config.static_server}/assets/chrome-mid.png')`
                    })}),

                React.createElement("div", {"style": ({
                    position: 'absolute', top: -75, height: 75, left: 0, right: 0,
                    backgroundImage: `url('${config.static_server}/assets/chrome-right.png')`,
                    backgroundRepeat: 'no-repeat', backgroundPositionX: '100%'
                    })}),

                React.createElement("div", {"style": ({
                    position: 'absolute', top: -75, height: 75, left: 0, right: 0,
                    backgroundImage: `url('${config.static_server}/assets/chrome-left.png')`,
                    backgroundRepeat: 'no-repeat', backgroundPositionX: '0%'
                    })}),

                React.createElement("div", {"style": ({position: 'absolute', top: -26.7, left: 168, fontFamily: "Helvetica", fontSize: "14px", fontWeight: "lighter"})},
                    (this.getLabel())
                ),

                React.createElement("div", {"className": "expand-children", "style": (_l.extend({
                    boxShadow: '0 0 5px 2px #DEDEDE',
                    borderRadius: '0 0 5px 5px',
                    outline: '1px solid #dbdbdb',
                    borderTopWidth: 0
                }, styles))}),

                (this.renderDesignGrid())
            );
        }


        //# DESIGN GRID
        renderDesignGrid() {
            if (!this.showDesignGrid) { return undefined; }

            // We need pointerEvents: 'none' in both of these so our clicks go through to Layout/Content editor and don't
            // stop on the overlay
            return React.createElement("div", {"style": ({position: 'absolute', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', height: '100%', pointerEvents: 'none'})},
                (__range__(0, (this.gridNumOfColumns - 1), true).map(i => {
                    // The zIndex here has to be smaller than that of draggable
                    const style = {backgroundColor: 'rgba(0,0,0,0.23)', zIndex: 999, flexGrow: 1, pointerEvents: 'none'};
                    if (i > 0) {
                        _l.extend(style, {marginLeft: this.gridGutterWidth});
                    }
                    return React.createElement("div", {"key": (i), "style": (style)});
                }))
            );
        }


        gridTotalGutterWidth() { return (this.gridNumOfColumns - 1) * this.gridGutterWidth; }

        gridColumnWidth() { return (this.width - this.gridTotalGutterWidth()) / this.gridNumOfColumns; }

        gridGetAllColumns() {
            const getColumn = i => {
                // assert (0 <= i and i < @gridNumOfColumns)
                const col_width = this.gridColumnWidth();

                // @left offsets the column by the left position of the artboard block
                const left = this.left + (i * col_width) + (i * this.gridGutterWidth);
                return {left, right: left + col_width};
            };

            return __range__(0, (this.gridNumOfColumns-1), true).map(getColumn);
        }

        becomeMultistate(onChange) {
            // create a multistate block around this artboard block
            const padding = 75;
            const multistateBlock = new MultistateBlock({
                top: this.top - padding,
                left: this.left - padding,
                height: this.height + (2 * padding),
                width: this.width + (2 * padding)
            });

            // Transfer the name and spec to the multistateBlock
            multistateBlock.name = this.name;
            this.name = 'default'; // default name of first state
            multistateBlock.componentSpec = this.componentSpec;

            this.componentSpec = new ComponentSpec(); // we just passed our component spec up to the multistateBlock

            // multistateBlock also needs a state control
            multistateBlock.componentSpec.addSpec(new PropSpec({name: 'state', control: new DropdownPropControl({options: ['default']})}));

            this.doc.addBlock(multistateBlock);

            return onChange();
        }

        becomeHoverable(onChange) {
            let block;
            const oldRootGeometry = {top: this.top, left: this.left, height: this.height, width: this.width};

            const outerPadding = 75;
            const innerPadding = 25;
            // create a multistate block around this artboard block
            const multistateBlock = new MultistateBlock({
                top: this.top - outerPadding,
                left: this.left - outerPadding,
                height: (this.height + outerPadding) * 2,
                width: (this.width + outerPadding) * 2
            });

            const hoverArtboard = new ArtboardBlock({
                name: ':hover',
                top: this.top,
                left: this.right + innerPadding,
                height: this.height,
                width: this.width
            });

            const activeArtboard = new ArtboardBlock({
                name: ':active',
                top: this.top + this.height + innerPadding,
                left: this.left + (this.width / 2),
                height: this.height,
                width: this.width
            });

            const newPosition = this.doc.getUnoccupiedSpace(multistateBlock, {top: multistateBlock.top, left: this.left});
            const [xOffset, yOffset] = Array.from([newPosition.left - multistateBlock.left, newPosition.top - multistateBlock.top]);

            const children = this.doc.getChildren(this);

            const hoverChildren = children.map(child => {
                const clonedBlock = child.clone();
                clonedBlock.left = this.right + innerPadding + child.leftOffsetToParent;
                return clonedBlock;
            });

            const activeChildren = children.map(child => {
                const clonedBlock = child.clone();
                clonedBlock.top = this.top + this.height + innerPadding + child.topOffsetToParent;
                clonedBlock.left = this.left + (this.width / 2) + child.leftOffsetToParent;
                return clonedBlock;
            });

            // Transfer the name and spec to the multistateBlock
            multistateBlock.name = this.name;
            this.name = 'default'; // default name of first state
            multistateBlock.componentSpec = this.componentSpec;

            this.componentSpec = new ComponentSpec(); // we just passed our component spec up to the multistateBlock

            // multistateBlock also needs a state control
            multistateBlock.stateExpression = "'default'";

            for (block of Array.from(_l.flatten([multistateBlock, hoverArtboard, activeArtboard, activeChildren, hoverChildren]))) { this.doc.addBlock(block); }
            for (block of Array.from(_l.flatten([multistateBlock, hoverArtboard, activeArtboard, children, activeChildren, hoverChildren, this]))) { block.nudge({x: xOffset, y: yOffset}); }

            // Create instance block at old position
            const instance = new InstanceBlock({sourceRef: multistateBlock.componentSpec.componentRef, 
                top: oldRootGeometry.top, left: oldRootGeometry.left, width: oldRootGeometry.width, height: oldRootGeometry.height});

            this.doc.addBlock(instance);

            return onChange();
        }

        containsPoint(pt) {
            const labelTop = this.windowDressing === 'chrome' ? this.top - 75 : this.top - 20;
            return ((this.top <= pt.top && pt.top <= this.bottom) && (this.left <= pt.left && pt.left <= this.right)) || ((labelTop <= pt.top && pt.top <= this.top) && (this.left <= pt.left && pt.left <= this.right));
        }
    };
    ArtboardBlock.initClass();
    return ArtboardBlock;
})())
);


function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}