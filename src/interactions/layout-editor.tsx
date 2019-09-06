// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ContentEditorMode, DraggingScreenMode, DrawingMode, DrawProtoLinkMode, DynamicizingMode, IdleMode, PushdownTypingMode, ReplaceBlocksMode, SelectRangeMode, TypingMode, UserLevelBlockTypes, VerticalPushdownMode;
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import _ from 'underscore';
import _l from 'lodash';
import config from '../config';
import { find_unused, find_connected, assert } from '../util';
import analytics from '../frontend/analytics';
import { Doc } from '../doc';
import Block from '../block';
import { Dynamicable } from '../dynamicable';
import { PropSpec, StringPropControl, ImagePropControl } from '../props';
import TextBlock from '../blocks/text-block';
import LineBlock from '../blocks/line-block';
import ImageBlock from '../blocks/image-block';
import ArtboardBlock from '../blocks/artboard-block';
import LayoutBlock from '../blocks/layout-block';
import { InstanceBlock } from '../blocks/instance-block';
import { MutlistateHoleBlock, MutlistateAltsBlock } from '../blocks/non-component-multistate-block';
const {LineBlockType, LayoutBlockType, TextBlockType, ComponentBlockType} = (UserLevelBlockTypes = require('../user-level-block-type'));

import { windowMouseMachine, DraggingCanvas } from '../frontend/DraggingCanvas';
import Zoomable from '../frontend/zoomable';
import { ResizingFrame } from '../frontend/resizing-grip';
import { LayoutView } from '../editor/layout-view';
import { EditorMode } from './editor-mode';
import { QuillComponent } from '../frontend/quill-component';
import core from '../core';


// We use this to get the mouse position when just hovering
const PassDomNodeToRenderForMouse = createReactClass({
    render() { return this.props.render(this.domNode); },
    componentDidMount() { return this.domNode = ReactDOM.findDOMNode(this); }
});

class LayoutEditorMode extends EditorMode {
    //# Override points

    isAlreadySimilarTo(other) {
        // override this if you have any mode parameters
        return other instanceof this.constructor;
    }

    //# Rendering override points

    cursor() { return 'default'; }

    highlight_blocks_on_hover() { return false; }

    getBlockOverrides() { return {}; }

    measure_distance_on_alt_hover() { return false; }

    disable_overlay_for_block(block) { return false; }

    extra_overlay_classes_for_block(block) { return ''; }

    hide_floating_controls() { return false; }

    //# Interaction override points

    handleMouseMove(e) {}
        // no-op; override in subclasses

    handleClick(mouse) {
        // override in subclasses
        this.getClickedBlocksAndSelect(mouse);
        this.editor.setEditorStateToDefault();
        return this.editor.handleDocChanged();
    }

    handleDoubleClick(where) {}
        // no-op; override in subclasses

    handleDrag(from, onMove, onEnd) {
        // override in subclasses
        // Switch to defaultState then continue with the drag interaction
        const idle_mode = new IdleMode();
        this.editor.setEditorMode(idle_mode);
        this.minimalDirty();
        return idle_mode.handleDrag(from, onMove, onEnd);
    }

    //#

    constructor() {
        // mostly legacyish; will try to remove
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.render_canvas_knowing_dom = this.render_canvas_knowing_dom.bind(this);
        this.getOverlayForBlock = this.getOverlayForBlock.bind(this);
        this.getGridlines = this.getGridlines.bind(this);
        this.getRuler = this.getRuler.bind(this);
        this.getOverlappingRulers = this.getOverlappingRulers.bind(this);
        this.minimalDirty = this.minimalDirty.bind(this);
        this.getClickedBlocksAndSelect = this.getClickedBlocksAndSelect.bind(this);
        this.proxyBlock = this.proxyBlock.bind(this);
        this.prepareDrag = this.prepareDrag.bind(this);
        this.activeGridlines = [];
        this.activeRulers = [];
        this.selectionBox = null;
    }

    willMount(editor) {
        this.editor = editor;
    }

    rebuild_render_caches() {
        let left;
        const docArea = (left = Block.unionBlock(this.editor.doc.blocks)) != null ? left : {bottom: 0, right: 0};
        this.editorGeometry = {
            height: docArea.bottom + window.innerHeight,
            width: docArea.right + window.innerWidth
        };

        return this.selectedBlocks = this.editor.getSelectedBlocks();
    }

    canvas(editor) {
        return (
            <Zoomable
                viewportManager={this.editor.viewportManager}
                style={{flex: 1, backgroundColor: '#f3f1f3'}}>
                <PassDomNodeToRenderForMouse render={this.render_canvas_knowing_dom} />
            </Zoomable>
        );
    }

    render_canvas_knowing_dom(draggingCanvasDiv) {
        let rulers, measuringGridlines;
        const is_in_distance_measuring_mode = this.measure_distance_on_alt_hover() 
                                    && windowMouseMachine.getCurrentModifierKeysPressed().altKey 
                                    // If we're mid-interaction and not normalized, we may have 0-width blocks.
                                    // 0-width (or 0-height) blocks can mess up our @getOverlappingRulers, which
                                    // uses unionBlock, which may not properly handle 0-length blocks.
                                    && !this.editor.interactionInProgress 
                                    // need draggingCanvas in order to get the block hovered over
                                    && draggingCanvasDiv;

        const hovered_block =
            is_in_distance_measuring_mode 
            ? this.editor.getBlockUnderMouseLocation(windowMouseMachine.getMousePositionForDiv(draggingCanvasDiv))
            : null;

        // cache hovered_block as a kind of render_param so LayoutView's blocks' overlays can check it cheaply
        this.render_cached_measuring_from_block = hovered_block;

        // NOTE bad code: this produces bizarre results, putting gridlines in very odd places
        [rulers, measuringGridlines] =
            Array.from((() => {
            let measuring_from_block;
            if (!(is_in_distance_measuring_mode 
                && (hovered_block != null) 
                && ((measuring_from_block = _l.first(this.selectedBlocks)) != null)
            )) {
                return [this.activeRulers, []];

            } else {
                // FIXME calling .parent here is very bad because it will force BlockTree creation
                let inside, parent_container;
                if ((hovered_block === measuring_from_block) && ((parent_container = hovered_block.parent != null ? hovered_block.parent.getContentSubregionAsBlock() : undefined) != null)) {
                    return [this.getOverlappingRulers(hovered_block, parent_container), []];

                } else if (hovered_block === measuring_from_block) {
                    return [[], []];

                } else if (__guard__((inside = measuring_from_block.getContentSubregionAsBlock()), x => x.contains(hovered_block))) {
                    return [this.getOverlappingRulers(inside, hovered_block), []];

                } else if (__guard__((inside = hovered_block.getContentSubregionAsBlock()), x1 => x1.contains(measuring_from_block))) {
                    return [this.getOverlappingRulers(measuring_from_block, inside), []];

                } else if (measuring_from_block.overlaps(hovered_block)) {
                    // FIXME: should also take getContentSubregionAsBlock into account
                    return [this.getOverlappingRulers(measuring_from_block, hovered_block), []];

                } else {
                    rulers = _l.compact(['top', 'left'].map(axis => this.getRuler(measuring_from_block, hovered_block, axis)));

                    const gridlinesByAxis = _.groupBy(this.getGridlines([hovered_block]), 'axis');
                    measuringGridlines = ['top', 'left'].map(axis => {
                        const gridline = _l.minBy(gridlinesByAxis[axis], gridline => [
                            _l.min(_l.values(Block.axis[axis]).map(edge_name => Math.abs(gridline.position - measuring_from_block[edge_name]))),
                            measuring_from_block.distance(gridline.source)
                        ]);

                        // All gridlines are initialized as covering the whole page
                        // Here we make them go only from the movingBlock (block) to the snappingBlock (gridline.source)
                        const orth_ax = Block.orthogonalAxis[gridline.axis];
                        gridline.start = _l.min([measuring_from_block[Block.axis[orth_ax].start], gridline.source[Block.axis[orth_ax].end]]);
                        gridline.end   = _l.max([measuring_from_block[Block.axis[orth_ax].end],   gridline.source[Block.axis[orth_ax].start]]);

                        return gridline;
                    });

                    return [rulers, measuringGridlines];
                }
            }
        })());

        // when the editor has focus, don't give it a nasty outline
        const classes = [];
        if (this.highlight_blocks_on_hover()) { classes.push('highlight-blocks-on-hover'); }

        return (
            <DraggingCanvas
                classes={classes}
                ref="draggingCanvas"
                style={{cursor: this.cursor(), height: this.editorGeometry.height, width: this.editorGeometry.width}}
                onDrag={this.prepareDrag}
                onClick={this.handleClick}
                onDoubleClick={this.handleDoubleClick}
                onMouseMove={this.handleMouseMove}
                onInteractionHappened={function() {}}>
                <div style={{zIndex: 0, isolation: 'isolate'}}>
                    <LayoutView
                        doc={this.editor.doc}
                        blockOverrides={this.getBlockOverrides()}
                        overlayForBlock={this.getOverlayForBlock} />
                </div>
                <div style={{zIndex: 1, isolation: 'isolate'}}>
                    {config.prototyping ? this.renderPrototypingArrows() : undefined}
                    {config.showGridlines ? this.renderGridlines(this.getGridlines(this.editor.doc.blocks), '1px dashed rgba(255, 50, 50, 0.8)') : undefined}
                    {this.renderGridlines(this.activeGridlines, '1px solid rgba(255, 50, 50, 0.8)')}
                    {this.renderGridlines(measuringGridlines, '1px dashed rgba(255, 50, 50, 0.8)')}
                    {this.renderRulers(rulers)}
                    {config.show_slices ? this.showSlices() : undefined}
                    {!this.hide_floating_controls() ?
                            this.selectedBlocks.map(block => {
                                return (
                                    <ResizingFrame
                                        key={block.uniqueKey}
                                        resizable_edges={block.resizableEdges}
                                        style={{position: 'absolute', top: block.top, left: block.left, height: block.height, width: block.width}}
                                        flag={grip => ({
                                            control: 'resizer', block,
                                            edges: grip.sides, grip_label: grip.label
                                        })} />
                                );
                        }) : undefined}
                    {config.prototyping && !this.hide_floating_controls() && (this.selectedBlocks.length === 1) ?
                            this.selectedBlocks.map(block => {
                                return (
                                    <div
                                        key={block.uniqueKey}
                                        className="unzoomed-control"
                                        onMouseDown={evt => { return evt.nativeEvent.context = {control: 'proto-linker', block}; }}
                                        style={{
                                            backgroundColor: 'rgba(260, 165, 0, 0.7)',
                                            height: 30, width: 30, borderRadius: 30,
                                            border: '4px solid white',
                                            position: 'absolute',
                                            top: block.vertCenter - 15, left: block.right + 40
                                        }} />
                                );
                        }) : undefined}
                    {typeof this.extra_overlays === 'function' ? this.extra_overlays()  : undefined}
                </div>
            </DraggingCanvas>
        );
    }

    getOverlayForBlock(block) {
        if (this.disable_overlay_for_block(block)) { return null; }

        let overlayClasses = 'mouse-full-block-overlay';

        // Let's highlight all blocks that are overlapping, so users don't get
        // unexpected absolute blocks
        const {
            editorCache
        } = this.editor;
        const isOverlapping =
            editorCache.render_params.dont_recalculate_overlapping 
            ? editorCache.lastOverlappingStateByKey[block.uniqueKey] != null ? editorCache.lastOverlappingStateByKey[block.uniqueKey] : false 
            : (editorCache.lastOverlappingStateByKey[block.uniqueKey] = 

            // disable overlap highlighting if config.highlightOverlapping == false
            (config.highlightOverlapping !== false) && 

            // FIXME we're actually trying to find unslicability, which is not quite the same thing as
            // overlapping without hierarchy
            _l.some(block.doc.getBlockTreeParentForBlock(block).children, siblingNode => (siblingNode.block !== block) && siblingNode.block.overlaps(block)));
        if (isOverlapping) { overlayClasses += ' overlapping-block'; }

        if (!block.locked) { overlayClasses += ' unlocked-block'; }
        if (Array.from(this.selectedBlocks).includes(block)) { overlayClasses += ' block-selected'; }
        if (block === this.editor.highlightedBlock) { overlayClasses += ' highlight-because-hover-in-layer-list'; }
        if (this.render_cached_measuring_from_block === block) { overlayClasses += ' border-on-measure'; }

        overlayClasses += this.extra_overlay_classes_for_block(block);

        return <div className={overlayClasses} />;
    }


    renderPrototypingArrows() {
        // FIXME: This is doing an O(n) operation in render. Perf should be shit
        let to;
        const blocksByKey = _l.keyBy(this.editor.doc.blocks, 'uniqueKey');
        const arrows = ((() => {
            const result = [];
            for (let b of Array.from(this.editor.doc.blocks)) {
                var target;
                if ((target = b.protoComponentRef) && ((to = blocksByKey[target]) != null)) {
                    var start_pt = {top: b.vertCenter, left: b.right};
                    result.push([start_pt, ((l => _l.minBy(l, o => Block.distanceOrdering(start_pt, o))))([
                        {top: to.vertCenter, left: to.left},
                        {top: to.vertCenter, left: to.right},
                        {top: to.top, left: to.horzCenter},
                        {top: to.bottom, left: to.horzCenter}
                    ])]);
                }
            }
        
            return result;
        })());
        if (this.prototype_link_in_progress != null) { arrows.push([this.prototype_link_in_progress.from, this.prototype_link_in_progress.to]); }

        // FIXME: Should depend on zoom
        const [h, w] = Array.from([10, 7]);

        return (
            <svg
                style={{
                    position: 'absolute', zIndex: 1, pointerEvents: 'none',
                    top: 0, left: 0,
                    width: this.editorGeometry.width, height: this.editorGeometry.height,
                }}>
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth={w}
                        markerHeight={h}
                        refX={w}
                        refY={h/2}
                        orient="auto"
                        markerUnits="strokeWidth">
                        <path d={`M 0, 0 L ${w}, ${h/2} z`} stroke="rgba(255, 165, 0, 0.7)" />
                        <path d={`M ${w}, ${h/2} L 0, ${h} z`} stroke="rgba(255, 165, 0, 0.7)" />
                    </marker>
                </defs>
                {arrows.map((...args) => {
                    // render arrow
                    let from, i;
                    let to;
                    [from, to] = Array.from(args[0]), i = args[1];
                    const [x1, y1, x2, y2] = Array.from([(from.left + to.left) / 2, from.top - 5, (from.left + to.left) / 2, to.top + 5]);
                    return (
                        <path
                            key={i}
                            d={`M${from.left} ${from.top} C ${x1} ${y1}, ${x2} ${y2}, ${to.left} ${to.top}`}
                            stroke="rgba(255,165,0, 0.7)"
                            fill="transparent"
                            markerEnd="url(#arrowhead)" />
                    );
            })}
            </svg>
        );
    }

    // Render rulers on the screen. Ruler design inspired by Sketch's
    renderRulers(rulers) {
        return _l.compact(_l.map(rulers, function({start, end, position, axis, display}, i) {
            const ruler_style = {
                position: 'absolute',
                color: 'rgba(255, 50, 50, 0.8)',
                textAlign: 'center',
                backgroundColor: 'red',
                display: 'flex',
                justifyContent: 'center',
                fontSize: '10px',
                fontFamily: 'Roboto'
            };
            const tick_width = 7;
            if (axis === 'left') {
                return (
                    <div
                        key={'ruler' + i}
                        style={_l.extend(ruler_style, {
                            top: start, height: end - start,
                            left: position, width: '1px',
                            flexDirection: 'column'
                        })}>
                        <div
                            style={{position: 'absolute', backgroundColor: 'red', height: '1px', width: tick_width, top: 0, left: -tick_width / 2}} />
                        <div style={{padding: '5px'}}>
                            {display}
                        </div>
                        <div
                            style={{position: 'absolute', backgroundColor: 'red', height: '1px', width: tick_width, bottom: 0, left: -tick_width / 2}} />
                    </div>
                );
            } else if (axis === 'top') {
                return (
                    <div
                        key={'ruler' + i}
                        style={_l.extend(ruler_style, {
                            left: start, width: end - start,
                            top: position, height: '1px'
                        })}>
                        <div
                            style={{position: 'absolute', backgroundColor: 'red', width: '1px', height: tick_width, left: 0, bottom: -tick_width / 2}} />
                        <div style={{padding: '5px'}}>
                            {display}
                        </div>
                        <div
                            style={{position: 'absolute', backgroundColor: 'red', width: '1px', height: tick_width, right: 0, bottom: -tick_width / 2}} />
                    </div>
                );
            } else {
                throw new Error('unknown ruler direction');
            }
        })
        );
    }


    //# Gridlines
    renderGridlines(gridlines, style) {
        return _.map(gridlines, ({source, axis, position, start, end}, i) => {
            if (axis === 'left') {
                return (
                    <div
                        key={'gridline' + i}
                        style={{
                            position: 'absolute',
                            top: start, height: end - start,
                            left: position,
                            borderLeft: style,
                            color: 'rgba(255, 50, 50, 0.8)'
                        }} />
                );
            } else if (axis === 'top') {
                return (
                    <div
                        key={'gridline' + i}
                        style={{
                            position: 'absolute',
                            left: start, width: end - start,
                            top: position,
                            borderTop: style,
                            color: 'rgba(255, 50, 50, 0.8)'
                        }} />
                );
            } else {
                throw new Error('unknown gridline direction');
            }
        });
    }

    getGridlines(block_geometries) {
        const docGeometry = this.editor.doc.docBlock.currentDimensions();
        const lengthOfAxis = {
            top: docGeometry.bottom,
            left: docGeometry.right
        };

        return _.flatten(block_geometries.map(geometry => {
            return Block.allEdgeNames.map(edge => {
                const ax = Block.axisOfEdge[edge];
                const orth_ax = Block.orthogonalAxis[ax];
                return {source: geometry, axis: ax, position: geometry[edge], start: 0, end: lengthOfAxis[orth_ax]};
        });
    }));
    }

    //# Interaction Utils

    // snapToGrid :: (block) -> (to -> ())) -> (to -> ()))
    // to :: {top, left, delta: {top, left}}
    snapToGrid(block, block_edges, ignoreBlocks) { if (ignoreBlocks == null) { ignoreBlocks = [block]; } return updater => {
        // FIXME: @editor.doc.blocks must also be proxies of the blocks instead of just blocks
        // so snap to grid plays nicely with live collab
        let b;
        const blocks = _l.differenceBy(this.editor.doc.blocks, ignoreBlocks, 'uniqueKey');

        // only snap to blocks within our current viewport
        const viewportBlock = new Block(this.editor.viewportManager.getViewport());

        // blocks_and_subregions :: [ Block|geometry ]
        // where geometry = {isSubregion: true, top, left, height, width right, bottom, vertCenter, horzCenter})]
        const blocks_and_subregions = _l.compact(_l.flatten(((() => {
            const result = [];
            
            for (b of Array.from(blocks)) {                 if (b.overlaps(viewportBlock)) {
                    result.push([b, (b.hasStrictContentSubregion() ? b.getContentSubregion() : undefined)]);
                }
            }
        
            return result;
        })()))
        );

        // gridlines :: [{source: Block|geometry, axis: "top"|"left", position: number, start: number, end: number}]
        const gridlines = this.getGridlines(blocks_and_subregions);

        return to => {
            // just pass through if snap to grid is disabled.  Do the check on every mouse move instead of
            // once at the top so we can toggle snapping after we've began a drag.
            let axis;
            const disableSnapToGrid = windowMouseMachine.getCurrentModifierKeysPressed().capsLockKey;
            if (disableSnapToGrid) {
                updater(to);
                // in case we just turned off snapping in the middle of a drag, kill the gridlines
                this.activeGridlines = [];
                this.activeRulers = [];
                return;
            }

            // `block` is likely a proxy.  We're going to use `block` a lot, and don't want to pay the proxy overhead.
            // block.getBlock() will get us a block not wrapped in a Proxy.  We call it every time so we're working with
            // the latest block anyway, because we're doing the same thing the proxy is.
            block = block.getBlock();

            // FIXME: we crash if a collaborator deletes a block while we're working with it

            // First update the blocks to where they would go without snapToGrid
            updater(to);

            // snap all edges being dragged to all possible edges of other blocks

            const relevantGridlines =
                (() => {
                let artboard;
                if (__guard__((artboard = block.getEnclosingArtboard()), x => x.showDesignGrid)) {
                    return _l.flatten(artboard.gridGetAllColumns().map(col => {
                        return [{source: col, axis: 'left', position: col.left, start: artboard.top, end: artboard.bottom},
                        {source: col, axis: 'left', position: col.right, start: artboard.top, end: artboard.bottom}];
                }));

                } else {
                    // Substitute all blocks by their subregions if they have one and the subregion overlaps with the
                    // moving block by more than 50%
                    // FIXME: This should be done without calculating the overlappingRatio, but rather
                    // by checking the edge being snapped of block against the one of the
                    // snappable block
                    const overlapping = _l.filter(blocks_and_subregions, b => ((block.overlappingRatio(b)) > 0.5) && !block.contains(b));
                    return _l.filter(gridlines, function(g) {
                        if (!(block.outerManhattanDistance(g.source) < 500)) { return false; }

                        // source can be a Block or a geometry (return val of Block.getContentSubregion()).  If it's a geometry,
                        // g.source.hasStrictContentSubregion will not exist

                        if (g.source.isSubregion) {
                            return Array.from(overlapping).includes(g.source);
                        } else if ((typeof g.source.hasStrictContentSubregion === 'function' ? g.source.hasStrictContentSubregion() : undefined)) {
                            return !Array.from(overlapping).includes(g.source);
                        } else {
                            return true;
                        }
                    });
                }
            })();

            // gridlinesByAxis :: {Axis: [Gridline]}
            // We get gridlines from all edgeNames since edges only specify which edges of block we want to
            // snap, not which edges of the other blocks
            const gridlinesByAxis = _.groupBy(relevantGridlines, 'axis');

            // closestLines :: {Axis: Gridline?}
            // Get the one vertical line and one horizontal line closest to our block, if any
            const closestLines = _.mapObject(gridlinesByAxis, (alignedGridlines, axis) => {
                const relevant_edges = (Array.from(block_edges).filter((edge) => Block.axisOfEdge[edge] === axis));
                return _l.minBy(alignedGridlines, gridline => {
                    return [(_l.min(relevant_edges.map(edge_name => Math.abs(gridline.position - block[edge_name])))), block.distance(gridline.source)];
            });
        });

            // accidents :: {Axis: number?}
            // Calculate the distances from both closest lines
            const accident = _l.mapValues(closestLines, (gridline, axis) => {
                let subregion;
                if (gridline == null) { return undefined; }
                const relevant_edges = (Array.from(block_edges).filter((edge) => Block.axisOfEdge[edge] === axis));
                // FIXME: A block with a border can still snap out of the border to a block inside if
                // the mouse movement comes from the inside
                const moving_object = block.contains(gridline.source) && ((subregion = block.getContentSubregion()) != null) ? subregion : block;
                return _l.minBy(relevant_edges.map(edge_name => gridline.position - moving_object[edge_name]), Math.abs);
            });

            // if the mouse is off by less than threshold on a particular axis, move it so it'll be on the gridline
            const threshold = _l.clamp(10 / this.editor.viewportManager.getZoom(), 1, 10);
            const adjusted_axes = ['top', 'left'].filter(axis => (accident[axis] != null) && (Math.abs(accident[axis]) < threshold));

            // "update" the mouse location and delta to a simulated location taking into account ideal snapping
            for (axis of Array.from(adjusted_axes)) { to[axis]       += accident[axis]; }
            for (axis of Array.from(adjusted_axes)) { to.delta[axis] += accident[axis]; }

            // re-run the move handler with the simulated location
            updater(to);

            if (!config.visualizeSnapToGrid) { return; }

            this.activeGridlines = adjusted_axes.map(function(axis) {
                let subregion;
                const gridline = closestLines[axis];
                const moving_object = block.contains(gridline.source) && ((subregion = block.getContentSubregion()) != null) ? subregion : block;

                // All gridlines are initialized as covering the whole page
                // Here we make them go only from the movingBlock (block) to the snappingBlock (gridline.source)
                const orth_ax = Block.orthogonalAxis[gridline.axis];
                gridline.start = _l.min([moving_object[Block.axis[orth_ax].start], gridline.source[Block.axis[orth_ax].start]]);
                gridline.end = _l.max([moving_object[Block.axis[orth_ax].end], gridline.source[Block.axis[orth_ax].end]]);

                return gridline;
            });

            // Add rulers to the screen for every gridline
            return this.activeRulers = _l.compact(this.activeGridlines.map(({source, axis}) => {
                if (_l.isEmpty(source)) { return null; } else { return this.getRuler(source, block, axis); }
            })
            );
        };
    }; }


    getRuler(fromBlock, toBlock, axis) {
        // The source of the gridline is the target we're snapping to
        let end, position, start;
        if (axis === 'top') {
            position = fromBlock.top + (fromBlock.height / 2);
            start = _l.min([fromBlock.right, toBlock.right]);
            end = _l.max([fromBlock.left, toBlock.left]);
        } else if (axis === 'left') {
            position = fromBlock.left + (fromBlock.width / 2);
            start = _l.min([fromBlock.bottom, toBlock.bottom]);
            end = _l.max([fromBlock.top, toBlock.top]);
        } else {
            throw new Error('Unknown gridline axis');
        }

        // Only display rulers for positive distances
        if ((end - start) <= 0) { return null; }

        return {axis, position, start, end, display: `${end - start}`};
    }


    getOverlappingRulers(block, toBlock) {
        const makeRuler = (axis, position, start, end) => ({
            axis,
            position,
            display: `${Math.abs(end - start)}`,
            start: Math.min(start, end),
            end: Math.max(start, end)
        });
        const intersection = Block.intersection([block, toBlock]);
        return [
            makeRuler('top', intersection.top + (intersection.height / 2), toBlock.left, block.left),
            makeRuler('left', intersection.left + (intersection.width / 2), toBlock.top, block.top),
            makeRuler('left', intersection.left + (intersection.width / 2), block.bottom, toBlock.bottom),
            makeRuler('top', intersection.top + (intersection.height / 2), block.right, toBlock.right)
        ];
    }


    showSlices() {
        const lines = [];

        for (let artboard of Array.from(this.editor.doc.artboards)) {
            var recurse;
            (recurse = function({direction, slices}, {top, left, bottom, right}) {
                const {forward, box_forward, line} =
                    (() => { switch (direction) {
                        case 'vertical': return {
                            forward(x) { return top += x; },
                            box_forward(x) { return {left, right, top, bottom: top + x}; },
                            line() { return {axis: 'top', position: top, start: left, end: right}; }
                        };
                        case 'horizontal': return {
                            forward(x) { return left += x; },
                            box_forward(x) { return {top, bottom, left, right: left + x}; },
                            line() { return {axis: 'left', position: left, start: top, end: bottom}; }
                        };
                    } })();

                return (() => {
                    const result = [];
                    for (let {margin, length, start, end, contents} of Array.from(slices)) {
                        forward(margin);
                        lines.push(line());
                        recurse(contents, box_forward(length));
                        forward(length);
                        result.push(lines.push(line()));
                    }
                    return result;
                })();
            })(core.blockTreeToSlices(artboard.blockTree), artboard);
        }

        return this.renderGridlines(lines, '1px solid green');
    }

    minimalDirty() {
        return this.editor.handleDocChanged({
            fast: true,
            dontUpdateSidebars: true,
            dont_recalculate_overlapping: true,
            subsetOfBlocksToRerender: []
        });
    }

    getClickedBlocksAndSelect(mouse) {
        let clickedBlock;
        const old_selected_blocks = _l.map(this.selectedBlocks, 'uniqueKey');

        if (clickedBlock = this.editor.getBlockUnderMouseLocation(mouse)) {
            // TODO don't change selection if clicking into editor to bring back focus
            //      esp if we have multiple selection
            const toggleSelected = mouse.evt.shiftKey;
            const selectAdjacent = mouse.evt.altKey;

            let blocks = [clickedBlock];

            if (selectAdjacent) {
                // Get everything that's touching block to the left, right, or below, recursively
                const touching = find_connected([clickedBlock], block => {
                    return this.editor.doc.blocks.filter(adj => _l.some(['left', 'right', 'bottom'], (side => block.touching(side, adj))));
                });

                blocks = _l.uniq(_l.flatMap(touching, b => b.andChildren()));
            }

            // select the relevant blocks
            this.editor.selectBlocks(blocks, {additive: toggleSelected});

        } else {
            this.editor.selectBlocks([]);
        }

        // only selection changed
        const new_selected_blocks = _l.map(this.editor.getSelectedBlocks(), 'uniqueKey');
        const xor_set = (a, b) => [].concat(_l.difference(a, b), _l.difference(b, a));
        return this.editor.handleDocChanged({fast: true, subsetOfBlocksToRerender: xor_set(old_selected_blocks, new_selected_blocks)});
    }


    // We need to pass proxies of the blocks to all interactions because someone live collabing with
    // us might trigger a swapDoc in the middle of an interaction. This would make
    // the block references in this function all point to blocks that don't exist anymore
    // We use proxies here so instead of doing block.something we'll always do
    // block.getBlock().something instead which will guarantee that we are always handling the
    // most up to date blocks
    proxyBlock(block) { return new Proxy(block, {
        get(target, key) { return __guard__(target.getBlock(), x => x[key]); },
        set(target, key, value) { return __guard__(target.getBlock(), x => x[key] = value); }
    }
    ); }


    prepareDrag(from, onMove, onEnd) {
        this.editor.setInteractionInProgress(true);

        const after = function(handler, extra) {
            let newHandler = null;
            handler(function(...args) {
                if (typeof newHandler === 'function') {
                    newHandler(...Array.from(args || []));
                }
                return extra(...Array.from(args || []));
            });
            return nh => newHandler = nh;
        };

        // set activeBlocks in your drag handler if you want to use it
        this.activeBlocks = undefined;

        onMove = after(onMove, () => {
            return this.editor.handleDocChanged({
                fast: true,
                dontUpdateSidebars: true,
                dont_recalculate_overlapping: true,
                subsetOfBlocksToRerender: this.activeBlocks
            });
        });

        onEnd = after(onEnd, () => {
            this.activeBlocks = undefined;
            return this.editor.setInteractionInProgress(false);
        });

        return this.handleDrag(from, onMove, onEnd);
    }


    //# Grab bag of dragging interactions

    resizeBlockFromCenter(block, edges, from, onMove, onEnd) {
        this.activeBlocks = _l.map([block], 'uniqueKey');

        const original = _l.pick(block, Block.allEdgeNames);

        onMove(this.snapToGrid(block, edges, block)(({delta}) => {
            return (() => {
                const result = [];
                for (let edge of Array.from(edges)) {
                    switch (edge) {
                        case 'right':
                            var clampedDelta = _l.clamp(delta.left, -(original.right - original.left) / 2, delta.left);
                            block.edges.left = original.left - clampedDelta;
                            result.push(block.edges.right = original.right + clampedDelta);
                            break;

                        case 'left':
                            clampedDelta = _l.clamp(delta.left, -Infinity, (original.right - original.left) / 2);
                            block.edges.left = original.left + clampedDelta;
                            result.push(block.edges.right = original.right - clampedDelta);
                            break;

                        case 'bottom':
                            clampedDelta = _l.clamp(delta.top, -(original.bottom - original.top) / 2, delta.top);
                            block.edges.top = original.top - clampedDelta;
                            result.push(block.edges.bottom = original.bottom + clampedDelta);
                            break;

                        case 'top':
                            clampedDelta = _l.clamp(delta.top, -Infinity, (original.bottom - original.top) / 2);
                            block.edges.top = original.top + clampedDelta;
                            result.push(block.edges.bottom = original.bottom - clampedDelta);
                            break;
                        default:
                            result.push(undefined);
                    }
                }
                return result;
            })();
        })
        );

        return onEnd(at => {
            this.activeGridlines = [];
            this.activeRulers = [];
            return this.editor.handleDocChanged();
        });
    }


    resizeBlockFixedRatio(block, edges, from, onMove, onEnd) {
        // If any of the edges are not resizable, it doesn't make sense to maintain a fixed ratio
        // so we just call regular resizeBlock instead
        if (!block.allEdgesResizable()) { return this.resizeBlock(block, edges, from, onMove, onEnd); }

        this.activeBlocks = [block.uniqueKey];

        const originalEdges = _l.pick(block, Block.allEdgeNames);

        const original_width = block.width;
        const original_height = block.height;

        // Fixme?: Currently this has no Snap to Grid because otherwise the ratio could
        // be messed up. This is the same Design decision that Sketch does.
        // We could potentially choose the primary_edge based on what's snapping
        // and resize from there, but this might have issues if we have two edges snapping
        // at the same time. Oh well...
        onMove(({delta}) => {
            const primary_edge = edges[0];
            const primary_delta = delta[Block.axisOfEdge[primary_edge]];

            const signed_delta = Block.factorOfEdge[primary_edge] * primary_delta;
            const factor = (original_width + signed_delta) / original_width;

            // Let's make sure we don't try to set negative height/width
            if (factor < 0) { return; }

            // This does the proportional resizing by multiplying both sides by the same factor
            block.width = original_width * factor;
            block.height = original_height * factor;

            // If we're dragging any of the top/left edges, we also move
            // them. If we don't do this, only the right/bottom edges appear to be resizing no
            // matter which resizing grip we're dragging
            return (() => {
                const result = [];
                for (let edge of Array.from(edges)) {
                    if (edge === 'top') {
                        result.push(block.top = originalEdges[edge] - (block.height - original_height));
                    } else if (edge === 'left') {
                        result.push(block.left = originalEdges[edge] - (block.width - original_width));
                    } else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        });

        return onEnd(at => {
            return this.editor.handleDocChanged();
        });
    }

    resizeLine(block, edges, from, onMove, onEnd) {
        this.activeBlocks = [block.uniqueKey];

        // Precompute which point is moving vs which point is pivoting for line blocks
        assert(() => block.resizableEdges.length === 2);
        assert(() => Block.axisOfEdge[block.resizableEdges[0]] === Block.axisOfEdge[block.resizableEdges[1]]);
        const axis = Block.axisOfEdge[block.resizableEdges[0]];

        const moving_edge = _l.minBy(block.resizableEdges, e => Math.abs(block[e] - from[axis]));
        const cross_axis_offset = axis === 'top' ? block.left : block.top;
        const moving = _l.fromPairs([[axis, block[moving_edge]], [Block.orthogonalAxis[axis], cross_axis_offset]]);
        const pivot = _l.fromPairs([[axis, block[Block.opposite(moving_edge)]], [Block.orthogonalAxis[axis], cross_axis_offset]]);
        const old_thickness = block.thickness;

        onMove(this.snapToGrid(block, edges, [block])(({delta}) => {
            // lines have custom resizing behavior. They shrink their smaller length
            const to = {top: moving.top + delta.top, left: moving.left + delta.left};
            const {top, height, left, width} = pointsToCoordinatesForLine(pivot, to, block.thickness);
            [block.top, block.height] = Array.from([top, height]);
            [block.left, block.width] = Array.from([left, width]);
            return block.thickness = old_thickness;
        })
        ); // Preserve thickness no matter what

        return onEnd(at => {
            this.activeGridlines = [];
            this.activeRulers = [];
            return this.editor.handleDocChanged();
        });
    }

    resizeBlocks(grabbedBlock, edges, blocksToResize, from, onMove, onEnd) {
        let block, minHeight, minWidth;
        if (grabbedBlock instanceof LineBlock && (blocksToResize.length === 1) && (blocksToResize[0] === grabbedBlock)) { return this.resizeLine(grabbedBlock, edges, from, onMove, onEnd); }
        this.activeBlocks = _l.map(blocksToResize, 'uniqueKey');

        const originalEdges = {};
        for (block of Array.from(blocksToResize)) {
            originalEdges[block.uniqueKey] = _l.pick(block, edges);
        }

        // The below does evalPdom so we need to wrap it in a try catch
        try {
            ({minWidth, minHeight} = this.editor.getBlockMinGeometry(block));
        } catch (e) {
            console.warn(e);
            [minWidth, minHeight] = Array.from([0, 0]);
        }

        onMove(this.snapToGrid(grabbedBlock, edges, blocksToResize)(({delta}) => {
            return (() => {
                const result = [];
                for (block of Array.from(blocksToResize)) {
                    result.push((() => {
                        const result1 = [];
                        for (let edge of Array.from(edges)) {
                        // We don't resize line blocks along their thickness axis
                            if (block instanceof LineBlock && !Array.from(block.resizableEdges).includes(edge)) { continue; }

                            let newPosition = originalEdges[block.uniqueKey][edge] + delta[Block.axisOfEdge[edge]];

                            // Don't let user push edges under their min values
                            if (edge === 'left') {
                                if ((block.right - newPosition) < minWidth) { newPosition = block.right - minWidth; }
                            } else if (edge === 'right') {
                                if ((newPosition - block.left) < minWidth) { newPosition = block.left + minWidth; }
                            } else if (edge === 'top') {
                                if ((block.bottom - newPosition) < minHeight) { newPosition = block.bottom - minHeight; }
                            } else if (edge === 'bottom') {
                                if ((newPosition - block.top) < minHeight) { newPosition = block.top + minHeight; }
                            } else {
                                throw new Error('Unkown edge');
                            }

                            result1.push(block.edges[edge] = newPosition);
                        }
                        return result1;
                    })());
                }
                return result;
            })();
        })
        );


        return onEnd(at => {
            this.activeGridlines = [];
            this.activeRulers = [];
            return this.editor.handleDocChanged();
        });
    }

    resizeBlock(block, edges, from, onMove, onEnd) { return this.resizeBlocks(block, from.ctx.edges, [block], from, onMove, onEnd); }

    resizeBlockAndChildrenProportionately(grabbedBlock, edges, from, onMove, onEnd) {
        let block;
        const blocksToResize = grabbedBlock.andChildren();
        this.activeBlocks = _l.map(blocksToResize, 'uniqueKey');

        const originalEdges = {};
        for (block of Array.from(blocksToResize)) {
            originalEdges[block.uniqueKey] = _l.pick(block, edges.concat(['top', 'left', 'width', 'height', 'fontSize']));
            originalEdges[block.uniqueKey].relativeTopRatio = (block.top - grabbedBlock.top) / grabbedBlock.height;
            originalEdges[block.uniqueKey].relativeLeftRatio = (block.left - grabbedBlock.left) / grabbedBlock.width;
        }

        onMove(this.snapToGrid(grabbedBlock, edges, [grabbedBlock])(({delta}) => {
            for (let edge of Array.from(edges)) {
                grabbedBlock.edges[edge] = originalEdges[grabbedBlock.uniqueKey][edge] + delta[Block.axisOfEdge[edge]];
            }

            // All ratios are calculated based on the grabbedBlock
            let original = originalEdges[grabbedBlock.uniqueKey];
            const [horizontalRatio, verticalRatio] = Array.from([grabbedBlock.width / original.width, grabbedBlock.height / original.height]);

            // And then applied to the other blocks
            return (() => {
                const result = [];
                for (block of Array.from(blocksToResize)) {
                    if (block !== grabbedBlock) {
                        original = originalEdges[block.uniqueKey];
                        [block.width, block.height] = Array.from([original.width * horizontalRatio, original.height * verticalRatio]);
                        [block.top, block.left] = Array.from([(original.relativeTopRatio * grabbedBlock.height) + grabbedBlock.top, (original.relativeLeftRatio * grabbedBlock.width) + grabbedBlock.left]);

                        if (block instanceof TextBlock) {
                            result.push(block.fontSize = original.fontSize.mapStatic(prev => Math.round(horizontalRatio * prev)));
                        } else {
                            result.push(undefined);
                        }
                    }
                }
                return result;
            })();
        })
        );

        return onEnd(at => {
            this.activeGridlines = [];
            this.activeRulers = [];
            return this.editor.handleDocChanged();
        });
    }


    moveBlocks(grabbedBlock, blocksToMove, from, onMove, onEnd) {
        this.activeBlocks = _l.map(_l.union(this.selectedBlocks, blocksToMove), 'uniqueKey');

        const initialSelectedArea = Block.unionBlock(blocksToMove);
        let dragLock = null;

        const movers = blocksToMove.map(block => {
            const start = {top: block.top, left: block.left};
            return function(dtop, dleft) {
                block.top = start.top + dtop;
                return block.left = start.left + dleft;
            };
        });

        onMove(this.snapToGrid(grabbedBlock, Block.allEdgeNames, blocksToMove)(to => {
            let [dtop, dleft] = Array.from([to.delta.top, to.delta.left]);

            if (from.evt.getModifierState('Shift')) {
                if ((dtop !== dleft) && (dragLock === null)) {
                    dragLock = (Math.abs(dtop) >= Math.abs(dleft)) ? 'vertical' : 'horizontal';
                }
                if (dragLock === 'vertical') {
                    dleft = 0;
                } else if (dragLock === 'horizontal') {
                    dtop = 0;
                }
            }

            return Array.from(movers).map((mover) => mover(dtop, dleft));
        })
        );

        return onEnd(at => {
            this.activeGridlines = [];
            this.activeRulers = [];
            return this.editor.handleDocChanged();
        });
    }
}

var pointsToCoordinatesForLine = function(pivot, moving, thickness) {
    const [width, height] = Array.from([Math.abs(pivot.left - moving.left), Math.abs(pivot.top - moving.top)]);
    if ((height < width) && (moving.left < pivot.left)) {
         return {width, height: thickness, top: pivot.top, left: moving.left};
    } else if ((height < width) && (moving.left >= pivot.left)) {
         return {width, height: thickness, top: pivot.top, left: pivot.left};
    } else if ((height >= width) && (moving.top < pivot.top)) {
         return {width: thickness, height, top: moving.top, left: pivot.left};
    } else if ((height >= width) && (moving.top >= pivot.top)) {
         return {width: thickness, height, top: pivot.top, left: pivot.left};
    } else {
        throw new Error("Unreachable case");
    }
};



class __UNSTABLE_DragInteraction extends LayoutEditorMode {
    constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        [...this.constructor_args] = Array.from(args);
        super();
    }

    bindDrag(from, onMove, onEnd) {
        this.from = from;
        this.onMove = onMove;
        this.onEnd = onEnd;
    }

    willMount(editor) {
        this.editor = editor;
        const args = this.constructor_args;
        delete this.constructor_args;
        return this.start(...Array.from(args), this.from, this.onMove, onEndHandler => {
            return this.onEnd((...args) => {
                this.editor.setEditorMode(new IdleMode());
                return onEndHandler(...Array.from(args || []));
            });
        });
    }

    start(from, onMove, onEnd) {}
}
// implement in subclasses!


const defaultExport = {};


defaultExport.SelectRangeMode = (SelectRangeMode = class SelectRangeMode extends __UNSTABLE_DragInteraction {
    start(from, onMove, onEnd) {
        this.activeBlocks = [];

        const rangeRect = new Block({
            top: from.top, left: from.left,
            height: 0, width: 0
        });

        this.extra_overlays = () => <React.Fragment>
            <div
                style={{
                    backgroundColor: 'rgba(100, 100, 255, 0.2)',
                    border: '1px solid rgba(100, 100, 255, 1)',
                    position: 'absolute',
                    top: rangeRect.top,
                    left: rangeRect.left,
                    height: rangeRect.height,
                    width: rangeRect.width
                }} />
        </React.Fragment>;

        onMove(to => {
            let ref;
            const order = function(a, b) { if (a <= b) { return [a, b]; } else { return [b, a]; } };
            const [top, bottom] = Array.from(order(from.top, to.top));
            const [left, right] = Array.from(order(from.left, to.left));

            [rangeRect.top, rangeRect.height] = Array.from([top, bottom - top]);
            return [rangeRect.left, rangeRect.width] = Array.from(ref = [left, right - left]), ref;
    });

        return onEnd(at => {
            const highlighted = this.editor.doc.blocks.filter(b => b.overlaps(rangeRect) && !b.contains(rangeRect));

            this.editor.selectBlocks(highlighted);
            return this.editor.handleDocChanged({fast: true, dont_recalculate_overlapping: true});
        });
    }
});


defaultExport.DrawProtoLinkMode = (DrawProtoLinkMode = class DrawProtoLinkMode extends __UNSTABLE_DragInteraction {
    start(block, from, onMove, onEnd) {
        this.activeBlocks = [];

        block.protoComponentRef = undefined;
        // FIXME: the above deserves a @editor.handleDocChanged()?

        const my_root_component = block.getRootComponent();
        const get_target = location => {
            const hovered = __guard__(this.editor.getBlockUnderMouseLocation(location), x => x.getRootComponent());
            if (hovered !== my_root_component) { return hovered; }
            return undefined; // if hovered == my_root_component
        };

        this.prototype_link_in_progress = {from, to: from, hovered_component: null};

        this.extra_overlays = function() {
            return (
                <React.Fragment>
                    {((this.prototype_link_in_progress != null ? this.prototype_link_in_progress.target : undefined) != null) ?
                            <div
                                style={_l.extend(this.prototype_link_in_progress.target.withMargin(40).geometry, {
                                    position: 'absolute',
                                    backgroundColor: 'rgba(250, 165, 0, 0.5)',
                                    border: '10px solid rgba(250, 165, 0, 1)',
                                    borderRadius: 40
                                })} /> : undefined}
                </React.Fragment>
            );
        };

        onMove(to => {
            // update the UI
            this.prototype_link_in_progress = {from, to, target: get_target(to)};
            return this.activeBlocks = _l.uniq(_l.compact(this.activeBlocks.concat([(this.prototype_link_in_progress.target != null ? this.prototype_link_in_progress.target.uniqueKey : undefined)])));
        });

        return onEnd(at => {
            block.protoComponentRef = __guard__(get_target(at), x => x.uniqueKey);
            this.prototype_link_in_progress = null;
            return this.editor.handleDocChanged({dont_recalculate_overlapping: true});
        });
    }
});




defaultExport.IdleMode = (IdleMode = class IdleMode extends LayoutEditorMode {
    constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        super(...args);
    }

    highlight_blocks_on_hover() { return true; }

    measure_distance_on_alt_hover() { return true; }

    handleClick(mouse) {
        return this.getClickedBlocksAndSelect(mouse);
    }

    handleDoubleClick(where) {
        let editContentMode, preview_artboard;
        const block = this.editor.getBlockUnderMouseLocation(where);
        if ((block == null)) { return; }

        // If it is an instance block, we select the source
        if (block instanceof InstanceBlock) {
            const component = block.getSourceComponent();
            if ((component == null)) { return; }
            if (!(component instanceof Block)) { return; } // FIXME: this is for CodeInstanceBlocks. Maybe show lib-manager modal
            this.editor.viewportManager.centerOn(component);
            this.editor.selectBlocks([component]);
            return this.editor.handleDocChanged({
                fast: true,
                dont_recalculate_overlapping: true,
                mutated_blocks: {}
            });

        } else if (block instanceof MutlistateHoleBlock && ((preview_artboard = block.getArtboardForEditor()) != null)) {
            this.editor.viewportManager.centerOn(preview_artboard);
            this.editor.selectBlocks([preview_artboard]);
            return this.editor.handleDocChanged({
                fast: true,
                dont_recalculate_overlapping: true,
                mutated_blocks: {}
            });

        // if it has editable content (i.e. text block), we go into content mode
        } else if ((editContentMode = block.editContentMode(where)) != null) {
            this.editor.setEditorMode(editContentMode);
            return this.editor.handleDocChanged({fast: true});

        } else {
            this.editor.selectBlocks(block.andChildren());
            return this.editor.handleDocChanged({fast: true});
        }
    }

    handleMouseMove(e) {
        if (e.altKey) {
            return this.minimalDirty();
        }
    }

    handleDrag(from, onMove, onEnd) {
        let block, blocks, left;
        const {
            proxyBlock
        } = this;

        const drag_interaction_mode = interaction => {
            interaction.bindDrag(from, onMove, onEnd);
            return this.editor.setEditorMode(interaction);
        };


        // dispatch
        if ((from.ctx != null ? from.ctx.control : undefined) === 'resizer') {
            if (from.evt.shiftKey || (from.ctx != null ? from.ctx.block.aspectRatioLocked : undefined)) {
                return this.resizeBlockFixedRatio(proxyBlock(from.ctx.block), from.ctx.edges, from, onMove, onEnd);

            } else if (from.evt.altKey) {
                return this.resizeBlockFromCenter(proxyBlock(from.ctx.block), from.ctx.edges, from, onMove, onEnd);

            } else if (from.evt.metaKey) {
                return this.resizeBlockAndChildrenProportionately(proxyBlock(from.ctx.block), from.ctx.edges, from, onMove, onEnd);

            } else {
                return this.resizeBlock(proxyBlock(from.ctx.block), from.ctx.edges, from, onMove, onEnd);
            }

        } else if ((from.ctx != null ? from.ctx.control : undefined) === 'proto-linker') {
            return drag_interaction_mode(new DrawProtoLinkMode(proxyBlock(from.ctx.block)));

        } else if (from.evt.metaKey) {
            return drag_interaction_mode(new SelectRangeMode());

        // Duplicate the blocks if option pressed
        } else if (from.evt.altKey && (block = ((left = _l.find(this.selectedBlocks, b => b.containsPoint(from))) != null ? left : this.editor.getBlockUnderMouseLocation(from)))) {
            const clone = block.clone();
            const children_clones = _.uniq(this.editor.doc.getChildren(block)).map(b => b.clone());
            const allToMove = _l.concat(children_clones, [clone]);

            for (block of Array.from(allToMove)) { this.editor.doc.addBlock(block); }
            this.editor.handleDocChanged({fast: true}); // Make the new blocks appear on screen right away

            this.editor.selectBlocks([clone]);

            return this.moveBlocks(proxyBlock(clone), allToMove.map(proxyBlock), from, onMove, onEnd);

        } else if (block = _l.find(this.selectedBlocks, b => b.containsPoint(from))) {
            // if there's more than one selected block the point is in, there's a
            // parent-child relationship between them.  We take the first one we see,
            // but we should probably take the biggest (most parent) one.
            const blockToSnap = block;

            // move all the selected blocks
            blocks = this.selectedBlocks;

            // move their children as well if there is only one block and
            // the config flag is set and the user is pressing
            // nothing or if the user is pressing the alt key and the config flag is not set
            if ((blocks.length === 1) && block.canContainChildren && 
            ((config.moveBlockWithChildrenByDefault && !from.evt.shiftKey) || 
            (!config.moveBlockWithChildrenByDefault && from.evt.shiftKey))) {
                blocks = _l.flatMap(blocks, block => block.andChildren());
            }

            // make sure @moveBlocks gets a set of blocks
            blocks = _.uniq(blocks);

            return this.moveBlocks(proxyBlock(blockToSnap), blocks.map(proxyBlock), from, onMove, onEnd);

        } else if ((block = this.editor.getBlockUnderMouseLocation(from)) && !block.locked) {
            blocks = [block];
            this.editor.selectBlocks(blocks);

            blocks = from.evt.shiftKey || !block.canContainChildren ? [block] : block.andChildren();

            return this.moveBlocks(proxyBlock(block), blocks.map(proxyBlock), from, onMove, onEnd);

        } else {
            return drag_interaction_mode(new SelectRangeMode());
        }
    }
});


const {editorReactStylesForPdom} = require('../editor/pdom-to-react');


defaultExport.ContentEditorMode = (ContentEditorMode = class ContentEditorMode extends LayoutEditorMode {
    constructor(block) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        super();
        this.block = this.proxyBlock(block);
    }

    willMount(editor) {
        // Ensure block is selected
        this.editor = editor;
        if (!_l.isEqual(this.editor.getSelectedBlocks(), [this.block.getBlock()])) { return this.editor.selectBlocks([this.block.getBlock()]); }
    }

    getBlockOverrides() {
        // not entirely sure why we need this check...
        if ((this.selectedBlocks.length !== 1) || (this.selectedBlocks[0] !==  this.block.getBlock())) { return {}; }
        return _l.fromPairs([[this.block.uniqueKey, this.contentEditor()]]);
    }

    disable_overlay_for_block(block) { return this.selectedBlocks.some(b => block.overlaps(b)); }

    hide_floating_controls() { return true; }

    keepBlockSelectionOnEscKey() { return true; }

    handleClick(mouse) {
        if (this.block.containsPoint(mouse)) {
            return this.handleContentClick(mouse);
        } else {
            return super.handleClick(mouse);
        }
    }

    handleDrag(from, onMove, onEnd) {
        if (this.block.containsPoint(from)) {
            return this.handleContentDrag(from, onMove, onEnd);
        } else {
            return super.handleDrag(from, onMove, onEnd);
        }
    }

    // override in subclasses!
    contentEditor() {
        return <div />;
    }

    handleContentClick(mouse) {}
        // pass

    handleContentDrag(from, onMove, onEnd) {}
});
// pass


defaultExport.TypingMode = (TypingMode = class TypingMode extends ContentEditorMode {
    constructor(block, param) {
        if (param == null) { param = {}; }
        const {mouse, selectAllTextInQuill, put_cursor_at_end} = param;
        super(block);

        this.onQuillMounted = function(quill_component) {
            quill_component.focus();

            if (selectAllTextInQuill) {
                return quill_component.select_all_content();

            } else if (mouse != null) {
                const range = document.caretRangeFromPoint(mouse.evt.clientX, mouse.evt.clientY);
                const selection = window.getSelection();
                selection.removeAllRanges();
                return selection.addRange(range);

            } else if (put_cursor_at_end != null) {
                return quill_component.put_cursor_at_end();
            }
        };
    }


    contentEditor() {
        // FIXME: there has to be a better way...
        const textStyles = editorReactStylesForPdom(core.pdomDynamicableToPdomStatic(this.block.toPdom({
            templateLang: this.block.doc.export_lang,
            for_editor: true,
            for_component_instance_editor: false,
            getCompiledComponentByUniqueKey() {
                return assert(() => false);
            }
        })
        )
        );

        return (
            <div style={_l.extend(textStyles, {minHeight: this.block.height})}>
                <QuillComponent
                    ref={quill_component => {
                        if ((quill_component != null) && (this.onQuillMounted != null)) {
                            this.onQuillMounted(quill_component);
                            return delete this.onQuillMounted;
                        }
                    }}
                    value={this.block.textContent.staticValue}
                    onChange={newval => {
                        this.block.textContent.staticValue = newval;
                        return this.editor.handleDocChanged();
                    }} />
            </div>
        );
    }
});

defaultExport.PushdownTypingMode = (PushdownTypingMode = class PushdownTypingMode extends ContentEditorMode {
    constructor(block) {
        super(block);

        this.onQuillMounted = quill_component => quill_component.focus();
    }

    changeTextWithPushdown(new_content) {
        let block;
        const {getSizeOfPdom} = require('../editor/get-size-of-pdom');
        this.block.textContent.staticValue = new_content;

        const instanceEditorCompilerOptions = this.editor.getInstanceEditorCompileOptions();
        const pdom = this.block.pdomForGeometryGetter(instanceEditorCompilerOptions);
        const {height, width} = getSizeOfPdom(pdom, this.editor.offscreen_node());

        const from = {top: this.block.bottom, left: this.block.left};
        const deltaY = height - this.block.height;

        const {
            blocks
        } = this.editor.doc;
        const make_line = (block, kind) => ({
            block,
            kind,
            y_axis: block[kind],
            left: block.left,
            right: block.right
        });

        const lines = [].concat(
            // look at top lines of blocks below mouse
            ((() => {
            const result = [];
            for (block of Array.from(blocks)) {                 if (from.top <= block.top) {
                    result.push(make_line(block, 'top'));
                }
            }
            return result;
        })()),

            // look at bottom lines of blocks the mouse is inside, so we can resize them
            ((() => {
            const result1 = [];
            for (block of Array.from(blocks)) {                 if ((block.top < from.top && from.top <= block.bottom) && Array.from(block.resizableEdges).includes('bottom')) {
                    result1.push(make_line(block, 'bottom'));
                }
            }
            return result1;
        })())
        );

        const sorted_buckets = function(lst, it) {
            const ret = [];
            const unequalable_sentinal = {};
            let [fn, current_bucket, current_value] = Array.from([_l.iteratee(it), null, unequalable_sentinal]);
            for (let elem of Array.from(_l.sortBy(lst, fn))) {
                const next_value = fn(elem);
                if (current_value !== next_value) {
                    [current_bucket, current_value] = Array.from([[], next_value]);
                    ret.push(current_bucket);
                }
                current_bucket.push(elem);
            }
            return ret;
        };


        // we're going to scan down to build up the lines_to_push_down
        const lines_to_push_down = [];

        // scan from top to bottom
        let scandown_horizontal_range = {left: from.left, right: from.left};

        // scan the lines from top to bottom
        for (var bucket_of_lines_at_this_vertical_point of Array.from(sorted_buckets(lines, 'y_axis'))) {
            var line;
            let hit_lines = bucket_of_lines_at_this_vertical_point.filter(line => ranges_intersect(line, scandown_horizontal_range));
            if (_l.isEmpty(hit_lines)) { continue; }

            // when there's multiple lines at the same level, take all the ones that intersect with the scandown range, recursively
            hit_lines = find_connected(hit_lines, a => bucket_of_lines_at_this_vertical_point.filter(b => ranges_intersect(a, b)));

            for (line of Array.from(hit_lines)) { lines_to_push_down.push(line); }
            for (line of Array.from(hit_lines)) { scandown_horizontal_range = union_ranges(scandown_horizontal_range, line); }
        }

        this.activeBlocks = _l.uniq(_l.concat(_l.map(lines_to_push_down, 'block.uniqueKey'), [this.block.uniqueKey]));
        // TODO also set mutated_blocks to just the resizing ones

        return (() => {
            let kind, y_axis;
            const result2 = [];
            for ({y_axis, block, kind} of Array.from(lines_to_push_down)) {
            // y_axis is immutably starting value
                const new_line_position = y_axis + deltaY;

                if (kind === 'top') { block.top    = new_line_position; }
                if (kind === 'bottom') { result2.push(block.height = Math.max(0, new_line_position - block.top)); } else {
                    result2.push(undefined);
                }
            }
            return result2;
        })();
    }


    contentEditor() {
        // FIXME: there has to be a better way...
        const textStyles = editorReactStylesForPdom(core.pdomDynamicableToPdomStatic(this.block.toPdom({
            templateLang: this.block.doc.export_lang,
            for_editor: true,
            for_component_instance_editor: false,
            getCompiledComponentByUniqueKey() {
                return assert(() => false);
            }
        })
        )
        );

        return (
            <div style={_l.extend(textStyles, {minHeight: this.block.height})}>
                <QuillComponent
                    throttle_ms={0}
                    ref={quill_component => {
                        if ((quill_component != null) && (this.onQuillMounted != null)) {
                            this.onQuillMounted(quill_component);
                            return delete this.onQuillMounted;
                        }
                    }}
                    value={this.block.textContent.staticValue}
                    onChange={newval => {
                        this.changeTextWithPushdown(newval);
                        return this.editor.handleDocChanged();
                    }} />
            </div>
        );
    }
});



const wasDrawnOntoDoc = function(block) {
    analytics.track("Drew block", {type: block.constructor.userVisibleLabel, label: block.getLabel(), uniqueKey: block.uniqueKey});
    return block.wasDrawnOntoDoc();
};


// The eponymous pageDRAW
defaultExport.DrawingMode = (DrawingMode = class DrawingMode extends LayoutEditorMode {
    constructor(user_level_block_type) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.handleClick = this.handleClick.bind(this);
        this.extra_overlays = this.extra_overlays.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        super();
        this.user_level_block_type = user_level_block_type;
        this.drawingBox = null;
    }

    isAlreadySimilarTo(other) {
        return super.isAlreadySimilarTo(other) && (other.user_level_block_type != null ? other.user_level_block_type.isEqual(this.user_level_block_type) : undefined);
    }

    cursor() {
        if (this.user_level_block_type === TextBlockType) { return 'text'; }
        return 'crosshair';
    }

    hide_floating_controls() { return true; }

    extra_overlay_classes_for_block(block) {
        let overlayClasses = '';
        if ((this.user_level_block_type != null ? this.user_level_block_type.component : undefined) === block) { overlayClasses += ' click-disabled'; }
        return overlayClasses;
    }

    handleClick(mouse) {
        let block;
        if (this.user_level_block_type === TextBlockType) {
            // FIXME: width is hard-coded to 100 right now
            // height is hard coded to 17 here but that makes no difference since normalize() should take care of assigning
            // this height correctly
            block = TextBlockType.create({textContent: Dynamicable(String).from('Type something'), top: mouse.top, left: mouse.left, width: 100, height: 17});
            this.editor.doc.addBlock(block);
            this.editor.setEditorMode(new TypingMode(block, {selectAllTextInQuill: true}));
            wasDrawnOntoDoc(block);
            return this.editor.handleDocChanged();

        } else if (this.user_level_block_type instanceof ComponentBlockType) {
            const {
                user_level_block_type
            } = this;
            if (user_level_block_type.component.containsPoint(mouse)) { return; }

            block = user_level_block_type.create({top: mouse.top, left: mouse.left, height: user_level_block_type.component.height, width: user_level_block_type.component.width});
            this.editor.doc.addBlock(block);
            wasDrawnOntoDoc(block);
            this.editor.selectBlocks([block]);
            this.editor.setEditorStateToDefault();
            return this.editor.handleDocChanged();

        } else {
            this.editor.setEditorStateToDefault();
            return this.minimalDirty();
        }
    }


    extra_overlays() {
        return (
            <React.Fragment>
                {(this.drawingBox != null) ?
                        <div
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0)',
                                border: '1px solid grey',
                                position: 'absolute',
                                top: this.drawingBox.top,
                                left: this.drawingBox.left,
                                height: this.drawingBox.height,
                                width: this.drawingBox.width
                            }} /> : undefined}
            </React.Fragment>
        );
    }

    handleDrag(from, onMove, onEnd) {
        const {
            user_level_block_type
        } = this;

        if (user_level_block_type instanceof ComponentBlockType && user_level_block_type.component.containsPoint(from)) {
            // don't let users draw an instance of a component inside itself
            return;
        }

        const block = user_level_block_type.create({doc: this.editor.doc});

        if (user_level_block_type === LineBlockType) {
            return this.drawLine(block, from, onMove, onEnd);

        } else if (user_level_block_type === TextBlockType) {
            block.contentDeterminesWidth = false;
            block.textContent = Dynamicable(String).from('Type something');
        }

        this.activeBlocks = [];
        this.editor.selectBlocks([]);

        [block.top, block.left, block.width, block.height] = Array.from([from.top, from.left, 0, 0]);
        this.drawingBox = block;

        onMove(this.snapToGrid(this.drawingBox, Block.edgeNames)(to => {
            let bottom, ref, right;
            const order = function(a, b) { if (a <= b) { return [a, b]; } else { return [b, a]; } };

            if (to.evt.shiftKey) {
                const sideLength = Math.max(Math.abs(to.delta.top), Math.abs(to.delta.left));
                to = _l.mapValues(to.delta, (len, axis) => from[axis] + (Math.sign(len) * sideLength));
            }

            [block.top, bottom] = Array.from(order(from.top, to.top));
            [block.left, right] = Array.from(order(from.left, to.left));

            // we can't assign block.bottom and block.right directly because that sets .top and .left
            // instead of .width and .height
            return [block.height, block.width] = Array.from(ref = [bottom - block.top, right - block.left]), ref;
    }));

        return onEnd(at => {
            if (((block.width < 3) && (block.height < 3)) || (block.width < 1) || (block.height < 1)) {
                return;
            }

            if (at.evt.shiftKey) { block.aspectRatioLocked = true; }

            this.editor.doc.addBlock(block);
            wasDrawnOntoDoc(block);
            this.editor.selectBlocks([block]);

            if (!(block instanceof TextBlock)) { this.editor.setEditorStateToDefault(); }
            if (block instanceof TextBlock) { this.editor.setEditorMode(new TypingMode(block, {selectAllTextInQuill: true})); }

            return this.editor.handleDocChanged();
        });
    }

    drawLine(block, from, onMove, onEnd) {
        this.activeBlocks = [];

        this.editor.selectBlocks([]);
        [block.top, block.left, block.width, block.height] = Array.from([from.top, from.left, 0, 0]);
        this.drawingBox = block;

        onMove(this.snapToGrid(this.drawingBox, Block.edgeNames)(to => {
            let ref;
            const {top, height, left, width} = pointsToCoordinatesForLine(from, to, 1);

            [block.top, block.height] = Array.from([top, height]);
            return [block.left, block.width] = Array.from(ref = [left, width]), ref;
    }));


        return onEnd(at => {
            if (((block.width < 3) && (block.height < 3)) || (block.width < 1) || (block.height < 1)) {
                return;
            }

            this.editor.doc.addBlock(block);
            wasDrawnOntoDoc(block);
            this.editor.setEditorStateToDefault();
            this.editor.selectBlocks([block]);
            return this.editor.handleDocChanged();
        });
    }
});


const {Sidebar} = require('../editor/sidebar');

defaultExport.DynamicizingMode = (DynamicizingMode = class DynamicizingMode extends LayoutEditorMode {
    constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        super(...args);
    }

    cursor() { return 'pointer'; }
    highlight_blocks_on_hover() { return true; }

    extra_overlay_classes_for_block(block) {
        let overlayClasses = '';

        const dynamicables = block.getDynamicsForUI().map(function(...args) { const [_a, _b, dynamicable] = Array.from(args[0]); return dynamicable; });
        const dynamicProperties = dynamicables.filter(dyn => dyn.isDynamic);
        const hasEmptyDynamics = dynamicProperties.some(val => _l.isEmpty(val.code));

        if ((dynamicProperties.length > 0) && !hasEmptyDynamics) { overlayClasses += ' filled-dynamics'; }
        if (hasEmptyDynamics) { overlayClasses += ' empty-dynamics'; }
        if (block.hasCustomCode || (block.externalComponentInstances.length > 0)) { overlayClasses += ' custom-code'; }

        return overlayClasses;
    }

    sidebar(editor) {
        return (
            <Sidebar
                sidebarMode="code"
                editor={editor}
                value={editor.getSelectedBlocks()}
                selectBlocks={editor.selectBlocks}
                editorCache={editor.editorCache}
                doc={editor.doc}
                setEditorMode={editor.setEditorMode}
                onChange={editor.handleDocChanged} />
        );
    }

    handleClick(mouse) {
        // override in subclasses
        this.getClickedBlocksAndSelect(mouse);
        return this.editor.handleDocChanged({fast: true, mutated_blocks: {}});
    }

    handleDrag(from, onMove, onEnd) {}
        // no-op

    handleDoubleClick(mouse) {
        let base_name, dynamicable, prop_control, rootComponentSpec;
        const clickedBlock = this.editor.getBlockUnderMouseLocation(mouse);
        if ((clickedBlock == null)) { return; }

        // This is gross. Should maybe unify the concept of PropControl types and Dynamicable types
        // and refactor this out (?)
        if (clickedBlock instanceof TextBlock) {
            dynamicable = clickedBlock.textContent;
            prop_control = new StringPropControl();
            base_name = 'text';
        } else if (clickedBlock instanceof ImageBlock) {
            dynamicable = clickedBlock.image;
            prop_control = new ImagePropControl();
            base_name = 'img_src';
        } else {
            dynamicable = null;
        }

        if ((dynamicable != null) && ((rootComponentSpec = __guard__(clickedBlock.getRootComponent(), x => x.componentSpec)) != null)) {
            // Dynamicize
            if (!dynamicable.isDynamic) {
                const new_prop_name = find_unused(_l.map(rootComponentSpec.propControl.attrTypes, 'name'), function(i) {
                    if (i === 0) { return base_name; } else {  return `${base_name}${i+1}`; }
                });
                rootComponentSpec.addSpec(new PropSpec({name: new_prop_name, control: prop_control}));

                // ANGULAR TODO: might need to change this
                dynamicable.code = dynamicable.getPropCode(new_prop_name, this.editor.doc.export_lang);
                dynamicable.isDynamic = true;

            // Undynamicize
            } else {
                // Try to see if there was a PropSpec added by the above mechanism, if so delete it
                // FIXME: this.props is React specific
                // FIXME2: The whole heuristic of when to remove a Spec can be improved. One thing we should probably do is
                // check that prop_name is unused in other things in the code sidebar. Not doing this right now because
                // getting all possible code things that appear in the code sidebar is a mess today.
                // ANGULAR TODO: does this always work?
                if (dynamicable.code.startsWith('this.props.')) {
                    const prop_name = dynamicable.code.substr('this.props.'.length);
                    const added_spec =  _l.find(rootComponentSpec.propControl.attrTypes, spec => (spec.name === prop_name) && (spec.control.ValueType === prop_control.ValueType));

                    if ((prop_name.length > 0) && (added_spec != null)) {
                        rootComponentSpec.removeSpec(added_spec);
                        dynamicable.code = '';
                    }
                }
                dynamicable.isDynamic = false;
            }

            return this.editor.handleDocChanged();
        }
    }
});



defaultExport.DraggingScreenMode = (DraggingScreenMode = class DraggingScreenMode extends LayoutEditorMode {
    constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        super(...args);
    }

    cursor() { return '-webkit-grab'; }
    handleDoubleClick(where) {
        //# State probably got out of sync and user is clicking around to try to get back into Idle mode
        // so be nice and take them there
        this.editor.setEditorStateToDefault();
        return this.minimalDirty();
    }

    handleDrag(from, onMove, onEnd) {
        this.activeBlocks = [];

        onMove(({delta}) => {
            const currentViewport = this.editor.viewportManager.getViewport();
            return this.editor.viewportManager.setViewport(_l.extend({}, currentViewport, {top: currentViewport.top - delta.top, left: currentViewport.left - delta.left}));
        });

        return onEnd(at => {
            return this.editor.handleDocChanged({fast: true, dontUpdateSidebars: true, dont_recalculate_overlapping: true, subsetOfBlocksToRerender: []});
        });
    }
});



var ranges_intersect = (a, b) => (b.left <= a.left && a.left < b.right) 
                          || (a.left <= b.left && b.left < a.right);
var union_ranges = (a, b) => ({
    left: Math.min(a.left, b.left),
    right: Math.max(a.right, b.right)
});

defaultExport.VerticalPushdownMode = (VerticalPushdownMode = class VerticalPushdownMode extends LayoutEditorMode {
    constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.handleDrag = this.handleDrag.bind(this);
        super(...args);
    }

    cursor() { return 'ns-resize'; }
    handleDrag(from, onMove, onEnd) {
        if (from.evt.shiftKey) { return this.reorderDrag(from, onMove, onEnd); }
        return this.pushdownDrag(from, onMove, onEnd);
    }

    pushdownDrag(from, onMove, onEnd) {
        let block;
        const {
            blocks
        } = this.editor.doc;
        const make_line = (block, kind) => ({
            block,
            kind,
            y_axis: block[kind],
            left: block.left,
            right: block.right
        });

        const lines = [].concat(
            // look at top lines of blocks below mouse
            ((() => {
            const result = [];
            for (block of Array.from(blocks)) {                 if (from.top <= block.top) {
                    result.push(make_line(block, 'top'));
                }
            }
            return result;
        })()),

            // look at bottom lines of blocks the mouse is inside, so we can resize them
            ((() => {
            const result1 = [];
            for (block of Array.from(blocks)) {                 if ((block.top < from.top && from.top <= block.bottom) && Array.from(block.resizableEdges).includes('bottom')) {
                    result1.push(make_line(block, 'bottom'));
                }
            }
            return result1;
        })())
        );

        const sorted_buckets = function(lst, it) {
            const ret = [];
            const unequalable_sentinal = {};
            let [fn, current_bucket, current_value] = Array.from([_l.iteratee(it), null, unequalable_sentinal]);
            for (let elem of Array.from(_l.sortBy(lst, fn))) {
                const next_value = fn(elem);
                if (current_value !== next_value) {
                    [current_bucket, current_value] = Array.from([[], next_value]);
                    ret.push(current_bucket);
                }
                current_bucket.push(elem);
            }
            return ret;
        };


        // we're going to scan down to build up the lines_to_push_down
        const lines_to_push_down = [];

        // scan from top to bottom
        let scandown_horizontal_range = {left: from.left, right: from.left};

        // scan the lines from top to bottom
        for (var bucket_of_lines_at_this_vertical_point of Array.from(sorted_buckets(lines, 'y_axis'))) {
            var line;
            let hit_lines = bucket_of_lines_at_this_vertical_point.filter(line => ranges_intersect(line, scandown_horizontal_range));
            if (_l.isEmpty(hit_lines)) { continue; }

            // when there's multiple lines at the same level, take all the ones that intersect with the scandown range, recursively
            hit_lines = find_connected(hit_lines, a => bucket_of_lines_at_this_vertical_point.filter(b => ranges_intersect(a, b)));

            for (line of Array.from(hit_lines)) { lines_to_push_down.push(line); }
            for (line of Array.from(hit_lines)) { scandown_horizontal_range = union_ranges(scandown_horizontal_range, line); }
        }

        this.activeBlocks = _l.uniq(_l.map(lines_to_push_down, 'block.uniqueKey'));
        // TODO also set mutated_blocks to just the resizing ones

        onMove(({delta: {top: deltaY}}) => {
            // FIXME needs better heuristics on drag up
            // deltaY = 0 if deltaY <= 0

            return (() => {
                let kind, y_axis;
                const result2 = [];
                for ({y_axis, block, kind} of Array.from(lines_to_push_down)) {
                // y_axis is immutably starting value
                    const new_line_position = y_axis + deltaY;

                    if (kind === 'top') { block.top    = new_line_position; }
                    if (kind === 'bottom') { result2.push(block.height = Math.max(0, new_line_position - block.top)); } else {
                        result2.push(undefined);
                    }
                }
                return result2;
            })();
        });

        return onEnd(() => {
            // remove all blocks shrunk to 0 height
            this.editor.doc.removeBlocks(_l.map(lines_to_push_down, 'block').filter(b => b.height === 0));

            // leave pushdown 'mode'
            this.editor.setEditorStateToDefault();

            // finish
            return this.editor.handleDocChanged();
        });
    }

    reorderDrag(from, onMove, onEnd) {
        // host variables
        let absolute_start = null;
        let incomplete_stack = null;
        let targeted_blocks = null;
        let targeted_blocks_area = null;
        let target_slice = null;
        let cancel = false;

        const repositon_blocks_in_slice = function(slice) {
            const delta = slice.start - slice.original_start;
            return (() => {
                const result = [];
                for (let {block, original_start} of Array.from(slice.blocks)) {                     result.push((block.top = original_start + delta));
                }
                return result;
            })();
        };


        this.editor.doc.inReadonlyMode(() => {
            let clicked_block;
            if (_l.find(this.selectedBlocks, b => b.containsPoint(from)) != null) {
                targeted_blocks = this.selectedBlocks;

            } else if (((clicked_block = this.editor.getBlockUnderMouseLocation(from)) != null) && !clicked_block.locked) {
                targeted_blocks = [clicked_block];
                this.editor.selectBlocks(targeted_blocks);

            } else {
                targeted_blocks = [];
                this.editor.selectedBlocks([]);
            }

            // targeted_blocks has at least one entry; we can refer to targeted_blocks[0]
            if (_l.isEmpty(targeted_blocks)) {
                cancel = true;
                return;
            }

            const siblings = targeted_blocks[0].getSiblingGroup();

            // make sure all the targeted blocks are in the same stack, or at least under the same parent...
            if (!_l.every(targeted_blocks, b => Array.from(siblings).includes(b))) {
                cancel = true;
                return;
            }

            // get the top of the parent all the targeted_blocks share.  All targeted_blocks have the same parent; see the check above
            absolute_start = (targeted_blocks[0].parent != null ? targeted_blocks[0].parent.top : undefined) != null ? (targeted_blocks[0].parent != null ? targeted_blocks[0].parent.top : undefined) : 0;

            targeted_blocks_area = Block.unionBlock(targeted_blocks);

            const stack_blocks = siblings.filter(sib => ranges_intersect(sib, targeted_blocks_area));
            // TODO/FIXME: should probably do stack_blocks.map (b) -> find_connected b, siblings, (a, b) -> a.intersects(b)

            // inject the targeted_blocks_area to force the grouping of the targetd blocks
            const effective_stack_blocks = _l.without(stack_blocks, ...Array.from(targeted_blocks)).concat([targeted_blocks_area]);
            const stack = core.slice1D((b => b.top), (b => b.bottom))(effective_stack_blocks, absolute_start);

            // the slice with the targeted_blocks_area sentinal is the one with the targeted_blocks
            target_slice = _l.find(stack, ({contents}) => Array.from(contents).includes(targeted_blocks_area));
            incomplete_stack = _l.without(stack, target_slice);

            // replace the targeted_blocks_area sentinal with actual targeted_blocks
            const splice_by_value = function(list, val, replacements) {
                const idx = list.indexOf(val);
                return list.splice(idx, 1, ...Array.from(replacements));
            };
            splice_by_value(target_slice.contents, targeted_blocks_area, targeted_blocks);

            // annotate historical values into the slices
            return (() => {
                const result = [];
                for (let slice of Array.from(stack)) {
                    slice.blocks = _l.flatMap(slice.contents, block => block.andChildren()).map(block => ({
                        original_start: block.top,
                        block
                    }));
                    result.push(slice.original_start = slice.start);
                }
                return result;
            })();
        });


        if (cancel) {
            // probably should do something else
            this.editor.setEditorStateToDefault();
            return;
        }

        onMove(to => {
            // compute the position in the stack to move the targeted_blocks to
            // HEURISTIC: look for the stack entry the mouse is over, or if it's over a margin,
            // pick the slice under the margin.  Insert above the hovered entry.
            let idx, slice;
            for (idx = 0; idx < incomplete_stack.length; idx++) { slice = incomplete_stack[idx]; if (to.top < slice.end) { break; } }

            const list_with_inserted_value = function(lst, loc, value) {
                const cloned_list = _l.slice(lst);
                cloned_list.splice(loc, 0, value);
                return cloned_list;
            };
            const new_stack = list_with_inserted_value(incomplete_stack, idx, target_slice);

            // compute slice starts/ends from absolute_start + position in stack
            let cursor = absolute_start;
            for (slice of Array.from(new_stack)) {
                cursor += slice.margin;
                slice.start = cursor;
                cursor += slice.length;
                slice.end = cursor;
            }

            if (!config.smoothReorderDragging) {
                return (() => {
                    const result = [];
                    for (slice of Array.from(new_stack)) {                         result.push(repositon_blocks_in_slice(slice));
                    }
                    return result;
                })();

            } else {
                // juggle the incomplete stack around
                for (slice of Array.from(new_stack)) { if (slice !== target_slice) { repositon_blocks_in_slice(slice); } }

                // but drag the target slice smoothly...
                for (let {block, original_start} of Array.from(target_slice.blocks)) { block.top = original_start + to.delta.top; }

                // ...and show where it's going to land.

                // Put an 'underlay' on one of the targeted_blocks by giving it an extra overlay with negative zIndex
                return this.specialOverlayForBlock = (block, standard_overlay) => {
                    if (block !== targeted_blocks[0]) { return standard_overlay; }
                    return (
                        <React.Fragment>
                            {standard_overlay}
                            <div
                                style={{
                                    position: 'absolute', zIndex: -1,
                                    border: '1px solid blue',
                                    backgroundColor: '#93D3F9',

                                    // relative to targeted_blocks[0]
                                    top: target_slice.start - block.top,
                                    left: 0,

                                    height: target_slice.length,
                                    width: targeted_blocks_area.width
                                }} />
                        </React.Fragment>
                    );
                };
            }
        });

        return onEnd(() => {
            repositon_blocks_in_slice(target_slice);

            this.editor.setEditorStateToDefault();
            return this.editor.handleDocChanged();
        });
    }


    getOverlayForBlock(block) {
        const standard_overlay = super.getOverlayForBlock(block);
        if (this.specialOverlayForBlock == null) { return standard_overlay; }
        return this.specialOverlayForBlock(block, standard_overlay);
    }
});




defaultExport.ReplaceBlocksMode = (ReplaceBlocksMode = class ReplaceBlocksMode extends LayoutEditorMode {
    constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.handleClick = this.handleClick.bind(this);
        super(...args);
    }

    cursor() { return 'copy'; }

    handleClick(mouse) {
        if (this.selectedBlocks.length !== 1) { return; }
        const original_block = this.selectedBlocks[0];

        const replacement_root = this.editor.getBlockUnderMouseLocation(mouse);
        if ((replacement_root == null)) { return; }

        // Don't do the replace if the replacement blocks are children of the block to be replaced.
        // Since our implementation removes the blocks to be replaced, taking this action would just
        // delete the blocks.  This doesn't seem a useful enough case to care about, so I'm just ignoring it.
        const original_blocks = original_block.andChildren();
        if (Array.from(original_blocks).includes(replacement_root)) { return; }

        // so ideally their sizes would be identical.  I'm not sure what to do if they're not.  For now, let's just
        // position the replacement's top-left where the original's was.
        const [dy, dx] = Array.from(['top', 'left'].map(pt => original_block[pt] - replacement_root[pt]));

        this.editor.doc.removeBlocks(original_blocks);
        for (let replacement of Array.from(replacement_root.andChildren())) { replacement.top += dy; replacement.left += dx; }

        this.editor.setEditorStateToDefault();
        this.editor.selectBlocks([replacement_root]);

        return this.editor.handleDocChanged();
    }
});



export default defaultExport;



function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}