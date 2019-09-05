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
let VnetBlock;
import _l from 'lodash';
import React from 'react';
import Block from '../block';
import { Model } from '../model';
import { Dynamicable } from '../dynamicable';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';


const add_vec = (a, b) => [a[0]+b[0], a[1]+b[1]];
const sub_vec = (a, b) => [a[0]-b[0], a[1]-b[1]];
const dot_vec = (a, b) => (a[0]*b[0]) + (a[1]*b[1]);
const scal_vec = function(k, ...rest) { const [vx, vy] = Array.from(rest[0]); return [k*vx, k*vy]; };
const len_vec_sq = a => dot_vec(a, a);
const dist_rel = (a, b) => len_vec_sq(sub_vec(a, b));

const proj_pt_to_line = function(x, ...rest) {
    const [a, b] = Array.from(rest[0]);
    const ab = sub_vec(b, a);
    const ax = sub_vec(x, a);

    return add_vec(a, scal_vec(dot_vec(ab, ax)/dot_vec(ab, ab), ab));
};

const proj_pt_in_line = function(x, ...rest) {
    const [a, b] = Array.from(rest[0]);
    const pt = proj_pt_to_line(x, [a, b]);
    const inside = ((a[0] <= pt[0] && pt[0] <= b[0]) || (b[0] <= pt[0] && pt[0] <= a[0])) && ((a[1] <= pt[1] && pt[1] <= b[1]) || (b[1] <= pt[1] && pt[1] <= a[1]));
    if (inside) { return pt; } else { return null; }
};

const set_node_to_vec = function(dst, src) { let ref;
return [dst.x, dst.y] = Array.from(ref = [src[0], src[1]]), ref; };
const mouse_delta_to_vec = mouse_delta => [mouse_delta.left, mouse_delta.top];
const origin_vec_for_block = block => [block.left, block.top];
const mouse_coord_to_vec = (origin_vec, mouse_pt) => sub_vec(mouse_delta_to_vec(mouse_pt), origin_vec);

const node_to_vec = ({x, y}) => [x, y];
const line_to_vecs = (nbn, {p1, p2}) => [node_to_vec(nbn[p1]), node_to_vec(nbn[p2])];

const defaultExport = {};

defaultExport.VnetBlock = Block.register('vnet', (VnetBlock = (function() {
    VnetBlock = class VnetBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Vnet';
            this.keyCommand = 'V';
    
            this.prototype.properties = {
                nodes: [(this.NodeType = Model.Tuple("vnet-node", {
                    x: Number, y: Number
                }))],
    
                lines: [(this.LineType = Model.Tuple("vnet-line", {
                    p1: String, // uniqueKey of node with lower uniqueKey
                    p2: String // uniqueKey of node with higher uniqueKey
                }))]
            };
        }

        mkLine(a, b) {
            const [p1, p2] = Array.from(_l.sortBy(_l.map([a, b], 'uniqueKey')));
            return new VnetBlock.LineType({p1, p2});
        }

        constructor(json) {
            super(json);

            if (this.nodes == null) { this.nodes = [[500, 500], [250, 400], [400, 52], [100, 100]].map(function(...args) { const [x, y] = Array.from(args[0]); return new VnetBlock.NodeType({x, y}); }); }
            if (this.lines == null) { this.lines = [[1, 2], [0, 2], [0, 1], [1, 3], [2, 3], [0, 3]].map((...args) => { const [l, r] = Array.from(args[0]); return this.mkLine(this.nodes[l], this.nodes[r]); }); }
        }


        specialSidebarControls(linkAttr, onChange) { return [

        ]; }

        // disable border and shadow, because they're not really supported
        boxStylingSidebarControls() { return []; }

        renderHTML(pdom) {}
            // fail for now

        deleteNode(node) {
            this.lines = this.lines.filter(({p1, p2}) => !_l.some([p1, p2], p => p === node.uniqueKey));
            return this.nodes = this.nodes.filter(n => n !== node);
        }

        editor() {
            return this.editorWithSelectedNode(null, {highlight_pts: false});
        }

        editorWithSelectedNode(selected, {highlight_pts}) {
            return React.createElement(CanvasRenderer, {"width": (this.width), "height": (this.height), "render": (ctx => {
                const nbn = _l.keyBy(this.nodes, 'uniqueKey');

                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                for (let {p1, p2} of Array.from(this.lines)) {
                    ctx.beginPath();
                    ctx.moveTo(nbn[p1].x, nbn[p1].y);
                    ctx.lineTo(nbn[p2].x, nbn[p2].y);
                    ctx.stroke();
                }

                if (highlight_pts) {
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 1;
                    for (let pt of Array.from(this.nodes)) {
                        if (pt !== selected) {
                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, 10, 2*Math.PI, false);
                            ctx.stroke();
                        }
                    }
                }

                if (selected != null) {
                    ctx.strokeStyle = 'green';
                    ctx.lineWidth = 8;
                    ctx.beginPath();
                    ctx.arc(selected.x, selected.y, 8, 2*Math.PI, false);
                    return ctx.stroke();
                }
            }
            )});
        }

        editContentMode(double_click_location) {
            let mode;
            const { ContentEditorMode } = require('../interactions/layout-editor');

            let selectedKey = null;
            const getSelected = () => _l.find(mode.block.nodes, {uniqueKey: selectedKey});
            const setSelected = function(node) {
                if ((node == null)) {
                    selectedKey = null;
                    return;
                }
                return selectedKey = node.uniqueKey;
            };

            const deleteSelected = () => {
                if (getSelected() == null) { return; }
                mode.block.deleteNode(getSelected());
                setSelected(null);
                return mode.editor.handleDocChanged();
            };

            return mode = _l.extend(new ContentEditorMode(this), {

                contentEditor: () => {
                    return mode.block.editorWithSelectedNode(getSelected(), {highlight_pts: true});
                },

                handleContentClick: mouse => {
                    const x = mouse_coord_to_vec(origin_vec_for_block(this), mouse);

                    let closest_point = _l.minBy(mode.block.nodes, n => dist_rel(node_to_vec(n), x));
                    if (!(dist_rel(node_to_vec(closest_point), x) < 70)) { closest_point = null; }
                    setSelected(closest_point);

                    return mode.editor.handleDocChanged({fast: true});
                },

                handleContentDrag: (from, onMove, onEnd) => {
                    // find closest point
                    const x = mouse_coord_to_vec(origin_vec_for_block(this), from);

                    let closest_point = _l.minBy(mode.block.nodes, n => dist_rel(node_to_vec(n), x));
                    if (dist_rel(node_to_vec(closest_point), x) < 5000) {
                        const orig_loc = node_to_vec(closest_point);
                        setSelected(closest_point);

                        onMove(to => {
                            return set_node_to_vec(closest_point, add_vec(orig_loc, mouse_delta_to_vec(to.delta)));
                        });

                        return onEnd(() => {
                            return mode.editor.handleDocChanged();
                        });

                    } else {
                        // see if we grabbed an edge
                        const nbn = _l.keyBy(mode.block.nodes, 'uniqueKey');

                        const closest_points = ((() => {
                            const result = [];
                            for (let l of Array.from(mode.block.lines)) {
                                const e = line_to_vecs(nbn, l);
                                const pt = proj_pt_in_line(x, e);
                                if (pt === null) { continue; }
                                if (dist_rel(pt, x) > 50) { continue; }
                                result.push([e, pt, l]);
                            }
                        
                            return result;
                        })());

                        if (!_l.isEmpty(closest_points)) {
                            let edge, line;
                            [edge, closest_point, line] = Array.from(_l.minBy(closest_points, function(...args) { let p;
                            let edge; [edge, p] = Array.from(args[0]); return dist_rel(p, x); }));

                            const orig_locs = _l.cloneDeep(edge);
                            setSelected(null); // can't select lines yet

                            onMove(to => {
                                const d = mouse_delta_to_vec(to.delta);
                                set_node_to_vec(nbn[line.p1], add_vec(orig_locs[0], d));
                                return set_node_to_vec(nbn[line.p2], add_vec(orig_locs[1], d));
                            });

                            return onEnd(() => {
                                return mode.editor.handleDocChanged();
                            });
                        }
                    }
                },


                sidebar: editor => {
                    const { StandardSidebar } = require('../editor/sidebar');
                    return React.createElement(StandardSidebar, null,
                        React.createElement("h5", {"style": ({textAlign: 'center'})}, "Drawing Mode"),
                        React.createElement("button", {"style": ({width: '100%'}), "onClick": (deleteSelected)}, "delete")
                    );
                }
            }
            );
        }
    };
    VnetBlock.initClass();
    return VnetBlock;
})())
);

// # NOT CALLED: need to wire up the key events through editorMode
// handleKey: (e) ->
//     # Backspace and Delete key
//     if e.keyCode in [8, 46]
//         e.preventDefault()
//         deleteSelected()


export default defaultExport;


var CanvasRenderer = createReactClass({
    render() {
        return React.createElement("canvas", { 
            "width": (this.props.width * 2),  
            "height": (this.props.height * 2),  
            "ref": "canvas",  
            "style": ({
                width: this.props.width, height: this.props.height
            })});
    },

    componentDidMount() {
        this.elem = ReactDOM.findDOMNode(this.refs.canvas);
        this.ctx = this.elem.getContext('2d');
        return this.rerender();
    },

    componentDidUpdate() {
        return this.rerender();
    },

    rerender() {
        this.ctx.clearRect(-1, -1, (this.props.width*2)+1, (this.props.height*2)+1);
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.translate(0.5, 0.5);
        this.ctx.scale(2,2);
        return this.props.render(this.ctx);
    }
});
