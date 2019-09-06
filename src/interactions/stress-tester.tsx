// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let StressTesterInteraction;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import Block from '../block';
import core from '../core';
import config from '../config';
import { DraggingCanvas } from '../frontend/DraggingCanvas';
import { ResizingFrame } from '../frontend/resizing-grip';
import { InstanceBlock } from '../blocks/instance-block';
import Zoomable from '../frontend/zoomable';
import ViewportManager from '../editor/viewport-manager';
import Topbar from '../pagedraw/topbar';
import { EditorMode } from './editor-mode';
import { pdomToReactWithPropOverrides } from '../editor/pdom-to-react';
import { inferConstraints } from '../programs';

const link = (txt, href) => <a style={{textDecoration: 'underline'}} target="_blank" href={href}>
    {txt}
</a>;
const warningStyles = {fontFamily: 'Helvetica neue', padding: 5, borderBottom: '1px solid grey', backgroundColor: '#EEE8AA', color: '#333300'};
const uselessStressTesterWarning = () => <div style={warningStyles}>
    <img
        style={{marginRight: 3}}
        src={`${config.static_server}/assets/warning-icon.png`} />
    {`\
    To use stress tester mode, use the sidebar to specify that this component is\
    `}
    {link('resizable', 'https://documentation.pagedraw.io/layout/')}
    {", or add some "}
    {link('data bindings', 'https://documentation.pagedraw.io/data-binding/')}
    {` to it.\
    `}
</div>;

export default StressTesterInteraction = class StressTesterInteraction extends EditorMode {
    constructor(artboard) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.willMount = this.willMount.bind(this);
        this.canvas = this.canvas.bind(this);
        this.topbar = this.topbar.bind(this);
        this.randomizeSize = this.randomizeSize.bind(this);
        this.randomizeData = this.randomizeData.bind(this);
        this.ensureMinGeometries = this.ensureMinGeometries.bind(this);
        this.inferConstraints = this.inferConstraints.bind(this);
        this.exitMode = this.exitMode.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
        this.artboard = artboard;
        this.instanceBlock = new InstanceBlock({sourceRef: this.artboard.getRootComponent().componentSpec.componentRef});
        this.instanceBlock.doc = this.artboard.doc;
        this.instanceBlock.propValues = this.instanceBlock.getSourceComponent().componentSpec.propControl.random();

        this.previewGeometry = new Block({top: this.artboard.top, left: this.artboard.left, height: this.artboard.height, width: this.artboard.width});
        this.viewportManager = new ViewportManager();
        this.viewportManager.setViewport(_l.pick(this.previewGeometry, ['top', 'left', 'width', 'height']));
    }

    willMount(editor) {
        this.editor = editor;
        return this.ensureMinGeometries();
    }

    canvas(editor) {
        let evaled_pdom;
        const component = this.instanceBlock.getSourceComponent();

        if ((component == null)) {
            // the component was deleted
            window.setTimeout(() => this.exitMode());
            return <div />;
        }

        try {
            evaled_pdom = core.evalInstanceBlock(this.instanceBlock, this.editor.getInstanceEditorCompileOptions());
        } catch (e) {
            if (config.warnOnEvalPdomErrors) { console.warn(e); }
            return (
                <div style={{padding: '0.5em', backgroundColor: '#ff7f7f'}}>
                    {e.message}
                </div>
            );
        }

        const component_blocks = component.andChildren();
        const selected_blocks = this.editor.getSelectedBlocks();
        const rendered_pdom = pdomToReactWithPropOverrides(evaled_pdom, undefined, (pdom, props) => {
            if ((pdom.backingBlock == null) || (pdom.backingBlock === this.instanceBlock) || !Array.from(component_blocks).includes(pdom.backingBlock)) { return props; }

            const classes = [props.className, 'stress-tester-block'];
            if (Array.from(selected_blocks).includes(pdom.backingBlock)) { classes.push('stress-tester-selected-block'); }

            return _l.extend({}, props, {
                // Add class names for hovering + selecting outlines
                className: classes.join(' '),

                // onClick selects the block
                onClick: evt => {
                    evt.stopPropagation(); // we don't want other parents that have blocks to be selected if an inner child was clicked

                    const toggleSelected = evt.shiftKey;
                    this.editor.selectBlocks([pdom.backingBlock], {additive: toggleSelected});
                    return this.editor.handleDocChanged({fast: true});
                }
            }
            );
        });

        const dynamics = _l.flatMap(this.artboard.andChildren(), block => block.getDynamicsForUI());
        const canvasGeometry = {height: this.previewGeometry.height + window.innerHeight, width: this.previewGeometry.width + window.innerWidth};

        // We add DraggingCanvas here just for the ResizingGrip functionality
        return (
            <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                {_l.isEmpty(dynamics) && _l.isEmpty(this.instanceBlock.resizableEdges) ? uselessStressTesterWarning() : undefined}
                <Zoomable
                    viewportManager={this.viewportManager}
                    style={{flex: 1, backgroundColor: '#333'}}>
                    <DraggingCanvas
                        className="stress-tester"
                        style={{height: canvasGeometry.height, width: canvasGeometry.width}}
                        onDrag={this.handleDrag}
                        onClick={function() {}}
                        onDoubleClick={function() {}}
                        onInteractionHappened={function() {}}>
                        <div
                            className="expand-children"
                            style={_l.extend({position: 'absolute'}, _l.pick(this.previewGeometry, ['top', 'left', 'width', 'height']))}>
                            <ResizingFrame
                                resizable_edges={this.instanceBlock.resizableEdges}
                                style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
                                flag={grip => ({control: 'resizer', edges: grip.sides, grip_label: grip.label})} />
                            <div className="expand-children" style={{overflow: 'auto'}}>
                                {rendered_pdom}
                            </div>
                        </div>
                    </DraggingCanvas>
                </Zoomable>
            </div>
        );
    }

    topbar() { return (
        <div>
            <Topbar editor={_l.extend({}, this.editor, this)} whichTopbar="stress-tester" />
        </div>
    ); }

    //# Topbar methods
    randomizeSize() {
        this.previewGeometry.height = Math.floor(Math.random() * 2000);
        this.previewGeometry.width = Math.floor(Math.random() * 2000);
        this.ensureMinGeometries();
        return this.editor.handleDocChanged({fast: true});
    }

    randomizeData() {
        this.instanceBlock.propValues = this.instanceBlock.getSourceComponent().componentSpec.propControl.random();
        this.ensureMinGeometries();
        return this.editor.handleDocChanged({fast: true});
    }

    ensureMinGeometries() {
        let minHeight, minWidth;
        try {
            ({minWidth, minHeight} = this.editor.getBlockMinGeometry(this.instanceBlock));
        } catch (e) {
            console.warn(e);
            [minWidth, minHeight] = Array.from([0, 0]);
        }
        this.previewGeometry.width = Math.max(minWidth, this.previewGeometry.width);
        return this.previewGeometry.height = Math.max(minHeight, this.previewGeometry.height);
    }

    inferConstraints() {
        inferConstraints(this.artboard);
        return this.editor.handleDocChanged();
    }

    exitMode() {
        this.editor.setEditorStateToDefault();
        return this.editor.handleDocChanged({fast: true});
    }

    handleDrag(from, onMove, onEnd) {
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

        if ((from.ctx != null ? from.ctx.control : undefined) === 'resizer') {
            return this.resizeViewport(from.ctx.edges, from, onMove, onEnd);
        }
    }

    resizeViewport(edges, from, onMove, onEnd) {
        // The below does evalPdom so we need to wrap it in a try catch
        let minHeight, minWidth;
        try {
            ({minWidth, minHeight} = this.editor.getBlockMinGeometry(this.instanceBlock));
        } catch (e) {
            console.warn(e);
            [minWidth, minHeight] = Array.from([0, 0]);
        }

        const block = this.previewGeometry;
        const originalEdges = _l.pick(block, edges);

        onMove(({delta}) => {
            return (() => {
                const result = [];
                for (let edge of Array.from(edges)) {
                    let newPosition = originalEdges[edge] + delta[Block.axisOfEdge[edge]];

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

                    result.push(block.edges[edge] = newPosition);
                }
                return result;
            })();
        });

        return onEnd(at => {
        });
    }
};

