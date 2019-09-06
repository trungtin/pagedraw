// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let AlignmentControls, ExpandAlignmentControls;
import React from 'react';
import createReactClass from 'create-react-class';
import _l from 'lodash';
import ReactTooltip from 'react-tooltip';
import Block from '../block';
import { Dynamicable } from '../dynamicable';
import programs from '../programs';
const defaultExport = {};

defaultExport.AlignmentControls = (AlignmentControls = createReactClass({
    displayName: 'AlignmentControls',
    render() {
        // assume we're already in a .bootstrap so namespaced-bootstrap things work
        return (
            <div className="ctrl">
                <div
                    className="sidebar-select-control btn-group btn-group-sm"
                    style={{borderColor: "rgb(228, 228, 228)", borderWidth: '0px 0px 1px 0px', borderStyle: 'solid'}}>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => this.handleAlign('left')}
                        disabled={!this.canPositionBlock()}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-left"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="left"
                            data-tip-disable={!this.canPositionBlock()} />
                        <ReactTooltip id="left">
                            Align Left
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={this.handleCenterHorizontally}
                        disabled={!this.canPositionBlock()}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-vertical"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="horizontal"
                            data-tip-disable={!this.canPositionBlock()} />
                        <ReactTooltip id="horizontal">
                            Align Horizontally
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => this.handleAlign('right')}
                        disabled={!this.canPositionBlock()}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-right"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="right"
                            data-tip-disable={!this.canPositionBlock()} />
                        <ReactTooltip id="right">
                            Align Right
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => this.handleAlign('top')}
                        disabled={!this.canPositionBlock()}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-top"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="top"
                            data-tip-disable={!this.canPositionBlock()} />
                        <ReactTooltip id="top">
                            Align Top
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={this.handleCenterVertically}
                        disabled={!this.canPositionBlock()}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-horizontal"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="vertical"
                            data-tip-disable={!this.canPositionBlock()} />
                        <ReactTooltip id="vertical">
                            Align Vertically
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => this.handleAlign('bottom')}
                        disabled={!this.canPositionBlock()}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon glyphicon-object-align-bottom"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="bottom"
                            data-tip-disable={!this.canPositionBlock()} />
                        <ReactTooltip id="bottom">
                            Align Bottom
                        </ReactTooltip>
                    </button>
                </div>
            </div>
        );
    },

    handleAlign(side) {
        const {
            blocks
        } = this.props;
        if (blocks.length === 1) {
            let artboard;
            if (((artboard = blocks[0].getEnclosingArtboard()) == null)) {
                // FIXME: Alert the user or something
                return;
            }

            blocks[0][side] = artboard[side];
        } else {
            let aligned;
            const originals = blocks.map(block => block[side]);
            if (['top', 'left'].includes(side)) { aligned = Math.min.apply(null, originals); }
            if (['bottom', 'right'].includes(side)) { aligned = Math.max.apply(null, originals); }
            for (let block of Array.from(blocks)) { block[side] = aligned; }
        }
        return this.props.onChange();
    },

    handleCenterHorizontally() {
        programs.make_centered_horizontally(this.props.blocks);
        return this.props.onChange();
    },

    handleCenterVertically() {
        programs.make_centered_vertically(this.props.blocks);
        return this.props.onChange();
    },

    canPositionBlock() {
        let artboard;
        if (this.props.blocks.length <= 0) { return false; }
        if (((artboard = this.props.blocks[0].getEnclosingArtboard()) == null)) { return false; }
        return (this.props.blocks.length === 1) || (this.props.blocks.every(block => artboard === block.getEnclosingArtboard()));
    }
}));


defaultExport.ExpandAlignmentControls = (ExpandAlignmentControls = createReactClass({
    displayName: 'ExpandAlignmentControls',
    render() {
        // assume we're already in a .bootstrap so namespaced-bootstrap things work
        return (
            <div className="ctrl">
                <div
                    className="sidebar-select-control btn-group btn-group-sm"
                    style={{borderColor: "rgb(228, 228, 228)", borderWidth: '0px 0px 1px 0px', borderStyle: 'solid'}}>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => this.handleAlign('left')}
                        disabled={this.props.blocks.length < 2}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-left"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="expand-left"
                            data-tip-disable={this.props.blocks.length < 2} />
                        <ReactTooltip id="expand-left" ref={node => { return this.tooltip = node; }}>
                            Expand Align Left
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => { this.handleAlign('left'); return this.handleAlign('right'); }}
                        disabled={this.props.blocks.length < 2}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-vertical"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="expand-vertical"
                            data-tip-disable={this.props.blocks.length < 2} />
                        <ReactTooltip id="expand-vertical">
                            Expand Align Vertically
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => this.handleAlign('right')}
                        disabled={this.props.blocks.length < 2}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-right"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="expand-right"
                            data-tip-disable={this.props.blocks.length < 2} />
                        <ReactTooltip id="expand-right">
                            Expand Align Right
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => this.handleAlign('top')}
                        disabled={this.props.blocks.length < 2}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-top"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="expand-top"
                            data-tip-disable={this.props.blocks.length < 2} />
                        <ReactTooltip id="expand-top">
                            Expand Align Top
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => { this.handleAlign('top'); return this.handleAlign('bottom'); }}
                        disabled={this.props.blocks.length < 2}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon-object-align-horizontal"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="expand-horizontal"
                            data-tip-disable={this.props.blocks.length < 2} />
                        <ReactTooltip id="expand-horizontal">
                            Expand Align Horizontally
                        </ReactTooltip>
                    </button>
                    <button
                        type="button"
                        className="btn btn-alignment"
                        onClick={() => this.handleAlign('bottom')}
                        disabled={this.props.blocks.length < 2}
                        style={{borderRadius: '0px'}}>
                        <span
                            className="glyphicon glyphicon glyphicon-object-align-bottom"
                            style={{color: "dodgerblue"}}
                            aria-hidden="true"
                            data-tip={true}
                            data-for="expand-bottom"
                            data-tip-disable={this.props.blocks.length < 2} />
                        <ReactTooltip id="expand-bottom">
                            Expand Align Bottom
                        </ReactTooltip>
                    </button>
                </div>
            </div>
        );
    },

    handleAlign(side) {
        const {
            blocks
        } = this.props;
        if (blocks.length === 1) {
            let artboard;
            if (((artboard = blocks[0].getEnclosingArtboard()) == null)) {
                // FIXME: Alert the user or something
                return;
            }

            blocks[0][side] = artboard[side];
        } else {
            let aligned, block;
            const originals = blocks.map(block => block[side]);
            if (['top', 'left'].includes(side)) {
                aligned = Math.min.apply(null, originals);
                for (block of Array.from(blocks)) {
                    if (side === 'left') {
                        block['width'] += (block[side] - aligned);
                        block.left -= (block[side] - aligned);
                    }
                    if (side === 'top') {
                        block['height'] += (block[side] - aligned);
                        block.top -= (block[side] - aligned);
                    }
                }
            }
            if (['bottom', 'right'].includes(side)) {
                aligned = Math.max.apply(null, originals);
                for (block of Array.from(blocks)) {
                    if (side === 'right') { block['width'] += (aligned - block[side]); }
                    if (side === 'bottom') { block['height'] += (aligned - block[side]); }
                }
            }
        }
        return this.props.onChange();
    }
}));
export default defaultExport;
