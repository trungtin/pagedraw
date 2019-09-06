// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Block, propLink;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import { pdSidebarHeaderFont } from './editor/component-lib';

import {
    sidebarControlOfExternalComponentInstance,
    ExternalComponentInstance,
    getExternalComponentSpecFromInstance,
} from './external-components';

import { Model } from './model';
import { Dynamicable, GenericDynamicable } from './dynamicable';
import path from 'path';
import config from './config';
const util = ({propLink} = require('./util'));
import { assert_valid_compiler_options } from './compiler-options';
import LockToggle from './frontend/lock-toggle';
import FormControl from './frontend/form-control';

import {
    CheckboxControl,
    LeftCheckboxControl,
    ColorControl,
    CompactNumberControl,
    CursorControl,
    CustomSliderControl,
    NumberControl,
    NumberToStringTransformer,
    PDColorControl,
    DebouncedTextAreaControlWithPlaceholder,
    DebouncedTextControl,
    DebouncedTextControlWithDefault,
    TextControl,
    TextControlWithDefault,
    SelectControl,
    BoxShadowsControl,
    propControlTransformer,
    propValueLinkTransformer,
} from './editor/sidebar-controls';

// we can't [].reduce(Math.min) because reduce passes a bunch of extra params, confusing min
const [max, min] = Array.from(['max', 'min'].map(m => arr => arr.reduce((accum, next) => Math[m](accum, next))));

// Sometimes you need to give a component a key.  Unfortunately there's no way to
// set a ReactElement's key after construction.  We can wrap it in a ReactWrapper
// and give that a key instead.
const ReactWrapper = createReactClass({
    displayName: 'ReactWrapper',
    render() { return this.props.children; }
});

class EdgeRect {
    static initClass() {
    
        this.property('top', {
            get() { return this.block.top; },
            set(val) {
                this.block.height = this.block.bottom - val;
                return this.block.top = val;
            }
        }
        );
    
        this.property('bottom', {
            get() { return this.block.bottom; },
            set(val) { return this.block.height = val - this.block.top; }
        }
        );
    
        this.property('left', {
            get() { return this.block.left; },
            set(val) {
                this.block.width = this.block.right - val;
                return this.block.left = val;
            }
        }
        );
    
        this.property('right', {
            get() { return this.block.right; },
            set(val) { return this.block.width = val - this.block.left; }
        }
        );
    }
    constructor(block) {
        this.block = block;
    }
}
EdgeRect.initClass();

const BoxShadowType = Model.Tuple('box-shadow',
    {color: String, offsetX: Number, offsetY: Number, blurRadius: Number, spreadRadius: Number}
);

export default Model.register('block', (Block = (function() {
    Block = class Block extends Model {
        static initClass() {
            this.prototype.properties = {
                // Editor state
                locked: Boolean,
                aspectRatioLocked: Boolean,
    
                // optional, if user doesn't want classnames like bXXXXXXX
                name: String,
    
                // geometry
                top: Number,
                left: Number,
                width: Number,
                height: Number,
    
                // constraints
                flexWidth: Boolean,
                flexMarginLeft: Boolean,
                flexMarginRight: Boolean,
                flexHeight: Boolean,
                flexMarginTop: Boolean,
                flexMarginBottom: Boolean,
    
                centerVertical: Boolean,
                centerHorizontal: Boolean,
    
                // other layout system
                is_scroll_layer: Boolean,
    
                // box style
                color: Dynamicable(String),
                hasGradient: Boolean,
                gradientEndColor: Dynamicable(String),
                gradientDirection: Dynamicable(Number),
    
                // box border
                borderThickness: Number,
                borderColor: String,
                borderRadius: Number,
                borderStyle: String,
    
                // box shadows
                outerBoxShadows: [BoxShadowType],
                innerBoxShadows: [BoxShadowType],
    
                // link
                link: String,
                openInNewTab: Boolean,
    
                cursor: Dynamicable(String),
    
                // developer
                hasCustomCode: Boolean,
                customCode: String,
                customCodeHasFixedWidth: Boolean,
                customCodeHasFixedHeight: Boolean,
    
                externalComponentInstances: [ExternalComponentInstance],
                eventHandlers: [(this.EventHandlerType = Model.Tuple('event-handler',
                    {name: String, code: String}
                ))],
    
                // comments/notes are purely for the editor
                comments: String,
    
                // Prototyping
                protoComponentRef: String
            };
    
            //# Geometry
    
            this.property('parent', {get() { return (this.doc != null ? this.doc.getParent(this) : undefined); }});
            this.property('blockTree',  {get() { return (this.doc != null ? this.doc.getBlockTreeByUniqueKey(this.uniqueKey) : undefined); }});
            this.property('children', {get() { return (this.doc != null ? this.doc.getImmediateChildren(this) : undefined); }});
    
            this.property('artboard',
                {get() { return this.getEnclosingArtboard(); }});
    
            this.property('isComponent',
                {get() { return this.getRootComponent() === this; }});
    
            this.property('right', {
                get() { return this.left + this.width; },
                set(val) { return this.left = val - this.width; }
            }
            );
    
            this.property('bottom', {
                get() { return this.top + this.height; },
                set(val) { return this.top = val - this.height; }
            }
            );
    
            this.property('horzCenter', {
                get() { return this.left + (this.width / 2); },
                set(val) { return this.left = this.integerPositionWithCenterNear(val, 'left'); }
            }
            );
    
            this.property('vertCenter', {
                get() { return this.top + (this.height / 2); },
                set(val) { return this.top = this.integerPositionWithCenterNear(val, 'top'); }
            }
            );
    
            this.property('center', {
                get() { return [this.horzCenter, this.vertCenter]; },
                set(...args) {
                    [this.horzCenter, this.vertCenter] = Array.from(args[0]);
                }
            }
            );
    
            this.property('edges', {
                get() { return this._edgesProxy != null ? this._edgesProxy : (this._edgesProxy = new EdgeRect(this)); },
                set(newEdges) { return _.extend(this.edges, newEdges); }
            }
            );
                // eg. block1.edges = block2.edges to copy block2's geometry
    
            this.property('size', {
                get() { return [this.height, this.width]; },
                set(...args) {
                    [this.height, this.width] = Array.from(args[0]);
                }
            }
            );
    
            this.property('leftOffsetToParent', {
                get() { return (this.left - __guard__(this.getEnclosingArtboard(), x => x.left)) || 0; },
                set(val) { if (this.getEnclosingArtboard() || 0) { return this.left = val + __guard__(this.getEnclosingArtboard(), x => x.left); } }
            }
            );
    
            this.property('topOffsetToParent', {
                get() { return (this.top - __guard__(this.getEnclosingArtboard(), x => x.top)) || 0; },
                set(val) { if (this.getEnclosingArtboard() || 0) { return this.top = val + __guard__(this.getEnclosingArtboard(), x => x.top); } }
            }
             );
    
            this.edgeNames = ['top', 'left', 'bottom', 'right'];
            this.geometryAttrNames = ['top', 'left', 'height', 'width'];
            this.centerEdgeNames = ['vertCenter', 'horzCenter'];
            this.allEdgeNames = Block.edgeNames.concat(Block.centerEdgeNames);
            this.axisOfEdge = {
                top: 'top',
                bottom: 'top',
                left: 'left',
                right: 'left',
                vertCenter: 'top',
                horzCenter: 'left'
            };
            this.orthogonalAxis = {top: 'left', left: 'top'};
            this.axis = {
                top:  {start: 'top',  length: 'height', end: 'bottom'},
                left: {start: 'left', length: 'width',  end: 'right'}
            };
    
    
            this.property('geometry', {
                get() { return {top: this.top, left: this.left, height: this.height, width: this.width}; },
                set({top, left, height, width}) {
                    this.top = top;
                    this.left = left;
                    this.height = height;
                    this.width = width;
                }
            }
            );
    
            this.property('area',
                {get() { return this.height * this.width; }});
    
            // This is essentially telling whether a growth of the block
            // signifies a negative or positive delta in the respective edge
            this.factorOfEdge = {top: -1, left: -1, right: +1, bottom: +1};
    
            this.property('order', {
                get() {
                    const BASE = 4;
                    return (this.area * BASE) + (this.isArtboardBlock ? 3 : this.is_repeat ? 2 : this.isNonComponentMultistate() ? 1 : 0);
                }
            }
            );
    
    
            //# Override points
    
            this.prototype.resizableEdges = Block.edgeNames;
    
            // override this in subclasses if the block type supports child dom nodes
            this.prototype.canContainChildren = false;
    
            this.property('label', {
                get() { return this.getLabel(); },
                set(val) { return this.name = val; }
            }
            );   // good override point
    
            // override editor for a custom default block view in LayoutView
            // editor :: ({editorCache}) -> ReactElement
            this.prototype.editor = null;
        }

        //# Model

        constructor(json) {
            if (json == null) { json = {}; }
            super(json);

            // support initializing with top+bottom/left+right instead of height/width
            for (let [start, length, end] of [['top', 'height', 'bottom'], ['left', 'width', 'right']]) {
                if ((json[end] != null) && (json[length] != null)) { if (this[start] == null) {  this[start] = json[end] - json[length]; } }
                if ((json[end] != null) && (json[start] != null)) { if (this[length] == null) { this[length] = json[end] - json[start]; } }
            }

            // these guys should always be explicitly set by the creator, but in case they're not, we can't
            // let them be undefined
            if (this.top == null) { this.top = 0; } if (this.left == null) { this.left = 0; } if (this.height == null) { this.height = 0; } if (this.width == null) { this.width = 0; }

            // layout block has a different default value for @color.  Because of our crappy defaults system
            // of ?= in Block.constructor, we can't set a default value for @color on Block and have LayoutBlock
            // override it
            if (this.color == null) { this.color = Dynamicable(String).from(this.getDefaultColor()); }
            if (this.hasGradient == null) { this.hasGradient = false; }
            if (this.gradientEndColor == null) { this.gradientEndColor = Dynamicable(String).from("#000"); }
            if (this.gradientDirection == null) { this.gradientDirection = Dynamicable(Number).from(0); }

            if (this.borderThickness == null) { this.borderThickness = 0; }
            if (this.borderColor == null) { this.borderColor = "#000"; }
            if (this.borderRadius == null) { this.borderRadius = 0; }
            if (this.borderStyle == null) { this.borderStyle = 'solid'; }
            if (this.outerBoxShadows == null) { this.outerBoxShadows = []; }
            if (this.innerBoxShadows == null) { this.innerBoxShadows = []; }

            if (this.flexWidth == null) { this.flexWidth = config.defaultFlexWidth; }
            if (this.flexMarginLeft == null) { this.flexMarginLeft = false; }
            if (this.flexMarginRight == null) { this.flexMarginRight = false; }
            if (this.flexHeight == null) { this.flexHeight = false; }
            if (this.flexMarginTop == null) { this.flexMarginTop = false; }
            if (this.flexMarginBottom == null) { this.flexMarginBottom = false; }

            if (this.hasCustomCode == null) { this.hasCustomCode = false; }
            if (this.customCodeHasFixedWidth == null) { this.customCodeHasFixedWidth = false; }
            if (this.customCodeHasFixedHeight == null) { this.customCodeHasFixedHeight = false; }

            if (this.eventHandlers == null) { this.eventHandlers = []; }
            if (this.externalComponentInstances == null) { this.externalComponentInstances = []; }

            // Editor properties
            if (this.locked == null) { this.locked = false; }
            if (this.aspectRatioLocked == null) { this.aspectRatioLocked = false; }

            if (this.cursor == null) { this.cursor = Dynamicable(String).from(""); }

            // Prototyping stuff
            if (this.protoComponentRef == null) { this.protoComponentRef = ''; }

            // FIXME move this into Model, or create a separate notion of Handles
            this._underlyingBlock = this;
        }

        getDefaultColor() { return 'rgba(0,0,0,0)'; }

        getBlock() {
            if (this._underlyingBlock === null) { return null; }
            if (this._underlyingBlock === this) { return this; }
            return (this._underlyingBlock != null ? this._underlyingBlock.getBlock() : undefined);
        }

        become(BlockType) {
            // just see how much transfers over
            const replacement = new BlockType(this.serialize());
            this.doc.replaceBlock(this, replacement);
            return replacement;
        }

        // Same as above but only transfers geometry over. Ignores other properties
        becomeFresh(block_factory) {
            const replacement = block_factory({top: this.top, left: this.left, width: this.width, height: this.height, uniqueKey: this.uniqueKey});
            this.doc.replaceBlock(this, replacement);
            return replacement;
        }
        getChildren() { return this.doc.getChildren(this); }
        andChildren() { return this.doc.blockAndChildren(this); }
        hasChildren() { return !_l.isEmpty(this.blockTree.children); }

        getVirtualChildren() {
            // override point for out-of-line-children, like noncomponent multistates
            return this.children;
        }

        getSiblingGroup() {
            // everyone with the same "parent", including myself
            return this.doc.inReadonlyMode(() => {
                // if we're at the root level parent==null, so let's special case it and return return the root blockTree
                let parent;
                if ((parent = this.parent) != null) {
                return parent.children;
                } else { return _l.map(this.doc.getBlockTree().children, 'block'); }
            });
        }

        // NOTE: This does not guarantee that the returned artboard is a component. If you're looking for that
        // see getRootComponent instead. This is to be used only by superficial editor features like design grids.
        // Not by the compiler.
        getEnclosingArtboard() {
            const artboards = this.doc != null ? this.doc.blocks.filter(parent => parent.isArtboardBlock && parent.isAncestorOf(this)) : undefined;
            return _l.minBy(artboards, 'order');
        }

        getRootComponent() {
            return (this.doc != null ? this.doc.getRootComponentForBlock(this) : undefined);
        }

        integerPositionWithCenterNear(center_positon, axis) {
            return Math.floor(center_positon - (this[Block.axis[axis].length] / 2));
        }
        static opposite(edge) {
            return {
                left: 'right',
                right: 'left',
                top: 'bottom',
                bottom: 'top'
            }[edge];
        }

        // Has nothing to do with blocks whatsoever, but is here because this is where all our geometry is.
        // Block.distanceOrdering :: ({top, left}) -> ({top, left}) -> number
        // Given two points in {top, left} form, returns a number.
        // This number is *not* the distance between the two points, but
        //   distance(a, b) > distance(c, d) <-> Block.distanceOrdering(a, b) > Block.distanceOrdering(c, d)
        // You would use this when trying to find the point closest to a given point.  You could use distance,
        // but would be wasting an expensive sqrt we don't need to use.
        static distanceOrdering(pt_a, pt_b) { return Math.pow((pt_a.top - pt_b.top), 2) + Math.pow((pt_a.left - pt_b.left), 2); }

        distance(other) { return Math.sqrt(Math.pow((this.horzCenter - other.horzCenter), 2) + Math.pow((this.vertCenter - other.vertCenter), 2)); }

        outerManhattanDistance(other) {
            const dx = Math.max(0, this.left - other.right, other.left - this.right);
            const dy = Math.max(0, this.top - other.bottom, other.top - this.bottom);
            return dx + dy;
        }

        // Block.contains :: (geometry, geometry) -> bool
        // where Block is a subtype of geometry; geometry = {top, left, height width}
        // hand-inlined into core.find_deepest_matching_block_tree_node.  If this changes, change it there too.
        static contains(parent, child) { return (parent.top <= child.top) 
                                  && (parent.left <= child.left) 
                                  && ((parent.top + parent.height) >= (child.top + child.height)) 
                                  && ((parent.left + parent.width) >= (child.left + child.width)); }

        contains(other) { return Block.contains(this, other); }

        // This function ensures that the other does not have the exact same properties
        strictlyContains(other) { return this.contains(other) && 
            _.any(['top', 'left', 'height', 'width'].map(sizing => this[sizing] !== other[sizing])); }

        // NOTE: this is wrong: it's not using the block tree, and isn't matching it either.
        isAncestorOf(other) { return this.contains(other) && (this.order > other.order); }

        // hand-inlined into core.find_deepest_matching_block_tree_node.  If this changes, change it there too.
        static overlaps(block, other) { return (block.top < other.bottom) 
                            && (block.left < other.right) 
                            && (block.right > other.left) 
                            && (block.bottom > other.top); }

        overlaps(other) { return Block.overlaps(this, other); }

        overlappingRatio(other) {
            // intersection = @intersection(other)
            // return 0 if intersection? == false
            // return intersection.area / @area else 0

            //# optimization:

            const intersection_height = Math.min(this.bottom, other.bottom) - Math.max(this.top, other.top);
            const intersection_width  = Math.min(this.right, other.right)   - Math.max(this.left, other.left);
            return (intersection_height * intersection_width) / this.area;
        }

        containsPoint(pt) {
            return (this.top <= pt.top && pt.top <= this.bottom) && (this.left <= pt.left && pt.left <= this.right);
        }

        nudge({y, x}) { this.top += y != null ? y : 0; return this.left += x != null ? x : 0; }

        expand({y, x}) {
            return this.size =
            (() => {
                if (this.aspectRatioLocked) {
              if ((y != null) && (x == null)) { return [this.height + y, Math.round((this.width / this.height) * (this.height + y))];
              } else if ((x != null) && (y == null)) { return [Math.round((this.height / this.width) * (this.width + x)), this.width + x];
              } else { throw new Error('Can only modify one dimension at a time while ratio is locked'); }
            } else { return [this.height + (y != null ? y : 0), this.width + (x != null ? x : 0)];
        }
            })();
        }

        // Returns whether this' side [left, right, bottom, top] is touching block
        touching(side, other) { return other[Block.opposite(side)] === this[side]; }

        isNonComponentMultistate() { return false; }

        static sortedByLayerOrder(blocks) { return _l.sortBy(blocks, ['order', 'uniqueKey']).reverse(); }
        static treeListSortedByLayerOrder(blockTrees) { return _l.sortBy(blockTrees, ['block.order', 'block.uniqueKey']).reverse(); }

        static unionBlock(blocks) {
            if (blocks.length === 0) { return null; }
            const edges = _.mapObject({top: min, left: min, right: max, bottom: max}, (fn, edge) => fn(_.pluck(blocks, edge)));
            return new Block(edges);
        }

        intersection(other) { return Block.intersection([this, other]); }

        // Returns a block that is the inner intersection of multiple blocks
        // The first line is classic Jared code.
        static intersection(blocks) {
            const edges = _.mapObject({top: max, left: max, right: min, bottom: min}, (fn, edge) => fn(_.pluck(blocks, edge)));
            const intersection = new Block(edges);
            if ((intersection.width <= 0) || (intersection.height <= 0)) { return null; }
            return intersection;
        }

        withMargin(spacing) { return new Block({top: this.top - spacing, left: this.left - spacing, width: this.width + (2*spacing), height: this.height + (2*spacing)}); }

        // Useful for knowing where a block is positioned relative to another based on the quadrant numbers below
        //   0     1     2
        //        ___
        //   7   |   |   3
        //       |___|
        //   6     5     4
        relativeQuadrant(other) {
            if ((other.right <= this.left) && (other.bottom <= this.top)) { return 0;
            } else if ((other.left >= this.right) && (other.bottom <= this.top)) { return 2;
            } else if (other.bottom <= this.top) { return 1;
            } else if ((other.left >= this.right) && (other.top >= this.bottom)) { return 4;
            } else if (other.left >= this.right) { return 3;
            } else if ((other.right <= this.left) && (other.top >= this.bottom)) { return 6;
            } else if (other.top >= this.bottom) { return 5;
            } else if (other.right <= this.left) { return 7;
            } else { return null; }
        }

        static quadrantOfEdge(edge) { switch (edge) {
            case 'top': return 1;
            case 'right': return 3;
            case 'bottom': return 5;
            case 'left': return 7;
            default: throw new Error("unknown edge");
        } }
        allEdgesResizable() { return util.isPermutation(this.resizableEdges, Block.edgeNames); }

        // returns a geometry object corresponding to the region that will contain your children
        // assert @contains(@getContentSubregion())
        getContentSubregion() {
            if (!this.canContainChildren) { return null; }

            if (!(this.borderThickness > 0)) { return this; } // or can't @canContainChildren

            // if we have a borderThickness then
            const top     = this.top  + this.borderThickness;
            const left    = this.left + this.borderThickness;
            const height  = this.height - (2 * this.borderThickness);
            const width   = this.width  - (2 * this.borderThickness);

            return {
                isSubregion: true,

                // inset by border thickness
                top, left, height, width,

                // compute these utils we usually have on blocks too
                right: left + width,
                bottom: top + height,
                vertCenter: top + (height / 2),
                horzCenter: left + (width / 2)
            };
        }

        getContentSubregionAsBlock() {
            const subregion_rect = this.getContentSubregion();
            if ((subregion_rect != null) === false) { return null; }
            return new Block(subregion_rect);
        }

        hasStrictContentSubregion() {
            // @getContentSubregion() != this # but we do the below instead for better performance
            return !this.canContainChildren || (this.borderThickness > 0);
        }

        getLabel() {
            let content;
            if      (!_.isEmpty(this.name)) {            return this.name;
            } else if (!_.isEmpty(this.repeat_variable)) { return `${this.instance_variable} in ${this.repeat_variable}`;
            } else if (!_.isEmpty(this.show_if)) {         return `if ${this.show_if}`;
            } else if (!_.isEmpty(this.text)) {            return this.text;
            } else if ((this.textContent != null) && !_.isEmpty(content = this.textContent.staticValue)) { return content;
            } else {                                    return this.getTypeLabel(); }
        }

        getClassNameHint() { return this.getLabel(); }

        // Overridden by InstanceBlock
        getTypeLabel() { return this.constructor.userVisibleLabel; }

        // renderHTML must be overridden; should call super
        renderHTML(pdom, options) {
            assert_valid_compiler_options(options);

            pdom.borderRadius = this.borderRadius;

            pdom.boxShadow = [].concat(
                this.outerBoxShadows.map(s => `${s.offsetX}px ${s.offsetY}px ${s.blurRadius}px ${s.spreadRadius}px ${s.color}`),
                this.innerBoxShadows.map(s => `inset ${s.offsetX}px ${s.offsetY}px ${s.blurRadius}px ${s.spreadRadius}px ${s.color}`)
            ).join(', ');

            pdom.cursor = this.cursor;

            pdom.background =
                this.hasGradient ?
                    this.color.linearGradientCssTo(this.gradientEndColor, this.gradientDirection)
                :
                    this.color;

            pdom.borderWidth = this.borderThickness;
            if (this.borderThickness >= 1) {
                pdom.borderStyle = this.borderStyle;
                return pdom.borderColor = this.borderColor;
            }
        }

        toPdom(options) {
            assert_valid_compiler_options(options);

            // Compile this single block into a pdom
            const pdom = {backingBlock: this, tag: 'div', children: []};
            this.renderHTML(pdom, options);
            return pdom;
        }

        rebase(left, right, base) {
            let ref;
            super.rebase(left, right, base);
            const docToUse = _l.isEqual([left.left, left.top], [base.left, base.top]) ? right : left;
            return [this.left, this.top] = Array.from(ref = [docToUse.left, docToUse.top]), ref;
        }

        //# Sidebar

        sidebarControls(...args) {
            const specials = this.specialSidebarControls(...Array.from(args || []));
            return ((arrs => _.compact(_.flatten(arrs, true))))([
                this.defaultTopSidebarControls(...Array.from(args || [])),
                <hr />,
                this.hasCustomCode ? this.customCodeWarning() : undefined,
                specials,
                !_.isEmpty(specials) ? <hr /> : undefined,
                this.defaultSidebarControls(...Array.from(args || [])),
                <hr />,
                this.constraintControls(...Array.from(args || []))
            ]);
        }

        defaultTopSidebarControls(linkAttr) {

            const SizeToHeightValueLinkTransformer = valueLink => ({
                value: valueLink.value[0],

                requestChange(newHeight) {
                    const ratio = valueLink.value[1] / valueLink.value[0];
                    const newWidth = Math.round(newHeight * ratio);
                    const newSize = [newHeight, newWidth];
                    return valueLink.requestChange(newSize);
                }
            });

            const SizeToWidthValueLinkTransformer = valueLink => ({
                value: valueLink.value[1],

                requestChange(newWidth) {
                    const ratio = valueLink.value[1] / valueLink.value[0];
                    const newHeight = Math.round(newWidth / ratio);
                    const newSize = [newHeight, newWidth];
                    return valueLink.requestChange(newSize);
                }
            });

            const sizeValueLink = (attr, lockTransformer) => {
                if (this.aspectRatioLocked) {
                    return NumberToStringTransformer(lockTransformer(linkAttr('size')));
                } else {
                    return NumberToStringTransformer(linkAttr(attr));
                }
            };

            return _.compact([
                ["name", 'name', DebouncedTextControlWithDefault(this.getLabel())],

                // Compact X/Y controls
                <div
                    style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '4px'}}
                    key="positon-controls">
                    <CompactNumberControl
                        label="X"
                        valueLink={NumberToStringTransformer(linkAttr('leftOffsetToParent'))} />
                    <CompactNumberControl
                        label="Y"
                        valueLink={NumberToStringTransformer(linkAttr('topOffsetToParent'))} />
                </div>,

                // Compact H/W controls
                <div
                    style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', margin: '4px'}}
                    key="size-controls">
                    <CompactNumberControl
                        label="W"
                        valueLink={sizeValueLink('width', SizeToWidthValueLinkTransformer)} />
                    <div style={{flexShrink: 0, marginTop: 5}}>
                        <LockToggle valueLink={linkAttr('aspectRatioLocked')} />
                    </div>
                    <CompactNumberControl
                        label="H"
                        valueLink={sizeValueLink('height', SizeToHeightValueLinkTransformer)} />
                </div>

            ]);
        }

        specialSidebarControls() { return []; } // override this

        defaultSidebarControls(linkAttr) { return _.compact([
            // box styling
            ...Array.from(this.boxStylingSidebarControls(linkAttr)),

            ["cursor", "cursor", CursorControl]
        ]); }

        // this is overridden in InstanceBlock
        // getDynamicsForUI :: (editorCache?) -> [(dynamicable_id :: String, user_visible_name :: String, Dynamicable)]
        // dynamicable_id is unique per block, eg. "color".  This block has only one Dynamicable with the dynamicable_id "color",
        // but other blocks have other Dynamicables with the dynamicable_id "color"
        // FIXME: these should be picked from the sidebar controls instead of from the block's properties
        getDynamicsForUI(editorCache_opt) {
            return _l.toPairs(this)
                .filter(function(...args) { const [prop, value] = Array.from(args[0]); return value instanceof GenericDynamicable && value.isDynamic; })
                .map(function(...args) { const [prop, value] = Array.from(args[0]); return [prop, _l.upperFirst(prop), value]; })
                .concat(this.getExternalComponentDynamicsForUI());
        }

        getExternalComponentDynamicsForUI() {
            const {dynamicsInJsonDynamicable} = require('./core');
            return _l.compact(_l.flatten(this.externalComponentInstances.map(instance => {
                let component;
                if (((component = getExternalComponentSpecFromInstance(instance, this.doc)) == null)) { return null; }
                const externalComponentProps = instance.propValues.getValueAsJsonDynamicable(component.propControl);
                return dynamicsInJsonDynamicable(externalComponentProps, `External ${component.name}`).map(({label, dynamicable}) => [dynamicable.source.uniqueKey, label, dynamicable]);
        })));
        }

        // override this for resizability controls
        resizabilitySidebarControls() { return []; }

        constraintControls(linkAttr, onChange) { return [
            <span style={{fontSize: '12px'}}>
                Flexible size
            </span>,
            <div style={{display: 'flex'}}>
                {LeftCheckboxControl('Width', linkAttr('flexWidth'), onChange)}
                {LeftCheckboxControl('Height', linkAttr('flexHeight'), onChange)}
            </div>,
            <span style={{fontSize: '12px'}}>
                Flexible margin
            </span>,
            <div style={{display: 'flex'}}>
                <div style={{flex: '1'}}>
                    {LeftCheckboxControl("left", linkAttr('flexMarginLeft'), onChange)}
                    {LeftCheckboxControl("right", linkAttr('flexMarginRight'), onChange)}
                </div>
                <div style={{flex: '1'}}>
                    {LeftCheckboxControl("top", linkAttr('flexMarginTop'), onChange)}
                    {LeftCheckboxControl("bottom", linkAttr('flexMarginBottom'), onChange)}
                </div>
            </div>,
            <span style={{fontSize: '12px'}}>
                Center
            </span>,
            <div style={{display: 'flex'}}>
                {LeftCheckboxControl("Horizontally", linkAttr('centerHorizontal'), onChange)}
                {LeftCheckboxControl("Vertically", linkAttr('centerVertical'), onChange)}
            </div>
        ]; }

        commentControl() {
            return ['Comments', 'comments', DebouncedTextAreaControlWithPlaceholder('any notes?', {height: '5em'})];
        }

        fillSidebarControls() { return [
            ["fill color", 'color', ColorControl],
            ["gradient", 'hasGradient', CheckboxControl],
            this.hasGradient ? ["bottom color", 'gradientEndColor', ColorControl] : undefined,
            this.hasGradient ? ["direction", 'gradientDirection', CustomSliderControl({min: 0, max: 360})] : undefined
        ]; }

        boxStylingSidebarControls(linkAttr) {
            const borderStyles = ['solid', 'dotted','dashed', 'double', 'groove', 'ridge', 'inset', 'outset'];
            return [
                ["border", 'borderThickness', NumberControl],
                this.borderThickness > 0 ? ["border color", 'borderColor', ColorControl] : undefined,
                this.borderThickness > 0 ? ["border style", 'borderStyle', SelectControl({style: 'dropdown'}, borderStyles.map(s => [s, s]))] : undefined,
                ["corner roundness", 'borderRadius', NumberControl],

                <hr />,
                ["shadows", 'outerBoxShadows', BoxShadowsControl],
                <hr />,
                ["inner shadows", 'innerBoxShadows', BoxShadowsControl],
                <hr />
            ];
        }

        customCodeWarning() {
            return (
                <div style={{color: 'darkred'}}>
                    This block's code was overwritten by the developer.  It might look different in the final product.
                </div>
            );
        }


        specialCodeSidebarControls() { return []; }

        editContentMode(double_click_location) { return null; }

        // overridden in TextBlock
        wasDrawnOntoDoc() {}

        getRequires(requirerPath) {
            return _l.compact(this.externalComponentInstances.map(instance => {
                let component;
                if (((component = getExternalComponentSpecFromInstance(instance, this.doc)) == null)) { return null; }
                const import_path = component.relativeImport ? './' + path.relative(path.parse(requirerPath).dir, component.requirePath) : component.requirePath;

                // FIXME JAVASCRIPT: The below symbol is a hack and only works with javascript
                if (component.defaultExport) {
                return {symbol: component.name, path: import_path};
                } else { return {module_exports: [component.name], path: import_path}; }
        }));
        }
    };
    Block.initClass();
    return Block;
})()));


function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}