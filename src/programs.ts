// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let arrow_key_select, doc_infer_all_constraints, inferConstraints, make_centered_horizontally, make_centered_vertically, make_multistate, make_multistate_component_from_blocks, pushdown_below_block;
import _l from 'lodash';
import { find_connected, assert, sorted_buckets } from './util';
import jsondiffpatch from 'jsondiffpatch';
import Block from './block';
import { blocks_from_block_tree } from './core';
import { InstanceBlock } from './blocks/instance-block';
import LayoutBlock from './blocks/layout-block';
const defaultExport = {};

defaultExport.deleteAllButSelectedArtboards = function(blocks, onChange) {
    if (_l.isEmpty(blocks)) { return; }
    const {
        doc
    } = blocks[0];

    const blocksToKeep =
        doc.inReadonlyMode(() => find_connected(_l.flatMap(blocks, b => b.andChildren()), function(block) {
            let source;
            if (block instanceof InstanceBlock && ((source = block.getSourceComponent()) != null)) {
            return source.andChildren();
            } else { return []; }
    }));

    doc.removeBlocks(doc.blocks.filter(b => !Array.from(blocksToKeep).includes(b)));
    return onChange();
};

defaultExport.prettyPrintDocDiff = function(doc1, doc2) {
    const blocksAdded = doc2.blocks.filter(function(b) { let needle;
    return (needle = b.uniqueKey, !Array.from(_l.map(doc1.blocks, 'uniqueKey')).includes(needle)); });
    const blocksDeleted = doc1.blocks.filter(function(b) { let needle;
    return (needle = b.uniqueKey, !Array.from(_l.map(doc2.blocks, 'uniqueKey')).includes(needle)); });
    const doc2BlocksByUniqueKey = _l.fromPairs(doc2.blocks.map(b => [b.uniqueKey, b]));
    const counterpartIn2 = b1 => doc2BlocksByUniqueKey[b1.uniqueKey];
    const blocksChanged = _l.intersectionBy(doc1.blocks, doc2.blocks, 'uniqueKey').filter(b => !b.isEqual(counterpartIn2(b)));

    const toLabels = blocks => blocks.map(b => b.getLabel());
    const blockDiff = (b1, b2) => jsondiffpatch.diff(b1.serialize(), b2.serialize());

    const metadata = docjson => _l.omit(docjson, 'blocks');

    return {
        blocksAdded: toLabels(blocksAdded),
        blocksDeleted: toLabels(blocksDeleted),
        blocksChanged: blocksChanged.map(b => _l.fromPairs([[b.getLabel(), blockDiff(b, counterpartIn2(b))]])),
        metadataChanges: jsondiffpatch.diff(metadata(doc1.serialize()), metadata(doc2.serialize()))
    };
};

defaultExport.remapSymbolsToExistingComponents = function(doc, componentLibrary) {
    const existingComponents = componentLibrary.getComponents();
    const sameNameSource = (block, existingComponents) => _l.find(existingComponents, c => c.name === block.getSourceComponent().name);
    let toRemove = [];
    for (let block of Array.from(doc.blocks)) {
        var existing;
        if (block instanceof InstanceBlock && ((existing = sameNameSource(block, existingComponents)) != null)) {
            toRemove = _l.concat(toRemove, block.getSourceComponent().andChildren()); // delete source in doc, we'll be using the one in componentLibrary
            block.sourceRef = existing.componentSpec.componentRef;
        }
    } // remap instance block

    return doc.removeBlocks(toRemove);
};


// FIXME this code is super gross
defaultExport.inferConstraints = (inferConstraints = function(artboardBlock) {
    // any artboard, not just a top level component.  Artboard may be in a multistate
    let block;
    const componentBlockTree = artboardBlock.doc.getBlockTreeByUniqueKey(artboardBlock.uniqueKey);

    // closestNeighbors :: {[uniqueKey]: {[edge]: {block: Block, distance: Number}}}
    const closestNeighbors = {};
    var makeNeighborsFromBlockTree = function(blockTree) {
        const parent = blockTree.block;
        const children_blocks = blockTree.children.map(c => c.block);
        for (var child of Array.from(children_blocks)) {
            closestNeighbors[child.uniqueKey] = _l.fromPairs(Block.edgeNames.map(function(edge) {
                const neighbors_in_quadrant = children_blocks.filter(b => child.relativeQuadrant(b) === Block.quadrantOfEdge(edge)).map(function(block) {
                        const distance = (() => { switch (edge) {
                            case 'top': return child.top - block.bottom;
                            case 'bottom': return block.top - child.bottom;
                            case 'left': return child.left - block.right;
                            case 'right': return block.left - child.right;
                            default: throw new Error('Unknown edge');
                        } })();
                        return {block, distance, isParent: false};});
                const distance_to_parent = Math.abs(parent[edge] - child[edge]);
                neighbors_in_quadrant.push({block: parent, distance: distance_to_parent, isParent: true});
                return [edge, _l.minBy(neighbors_in_quadrant, 'distance')];}));
        }

        return _l.forEach(blockTree.children, makeNeighborsFromBlockTree);
    };
    makeNeighborsFromBlockTree(componentBlockTree);

    const THRESHOLD = 200;
    const flexMarginOfEdge = {
        left: 'flexMarginLeft',
        right: 'flexMarginRight',
        top: 'flexMarginTop',
        bottom: 'flexMarginBottom'
    };
    const blocksInsideArtboard = blocks_from_block_tree(componentBlockTree).filter(b => b !== artboardBlock);
    for (block of Array.from(blocksInsideArtboard)) {
        const neighbors = closestNeighbors[block.uniqueKey];
        for (let edge of Array.from(Block.edgeNames)) {
            block[flexMarginOfEdge[edge]] = (neighbors[edge].distance > THRESHOLD);
        }
        block.flexWidth = !block.hasChildren() && (block.width > THRESHOLD);
        block.flexHeight = !block.hasChildren() && (block.height > THRESHOLD);
    }

    // A parent has flexLength if any of its children have flex length
    var bubbleUpFlex = function(blockTree) {
        if (_l.isEmpty(blockTree.children)) { return; }

        for (let c of Array.from(blockTree.children)) { bubbleUpFlex(c); }

        blockTree.block.flexWidth  = _l.some(blockTree.children, ({block}) => block.flexWidth || block.flexMarginLeft || block.flexMarginRight);
        return blockTree.block.flexHeight = _l.some(blockTree.children, ({block}) => block.flexHeight || block.flexMarginTop || block.flexMarginBottom);
    };
    return bubbleUpFlex(componentBlockTree);
});


defaultExport.doc_infer_all_constraints = (doc_infer_all_constraints = function(doc) {
    const ArtboardBlock = require('./blocks/artboard-block');
    return Array.from(doc.blocks.filter(b => b instanceof ArtboardBlock)).map((artboard) => inferConstraints(artboard));
});



defaultExport.make_multistate = (make_multistate = function(blocks, editor) {
    let block;
    const {MutlistateHoleBlock, MutlistateAltsBlock} = require('./blocks/non-component-multistate-block');
    const ArtboardBlock = require('./blocks/artboard-block');

    // prevent anything too crazy— make "Make Multistate" idempotent
    if (_l.isEmpty(blocks)) {
        return;

    } else if (blocks.length === 1) {
        block = blocks[0];

        if (block instanceof MutlistateHoleBlock) {
            let preview_artboard;
            if ((preview_artboard = block.getArtboardForEditor()) != null) {
                editor.viewportManager.centerOn(preview_artboard);
                editor.selectBlocks([preview_artboard]);
                editor.handleDocChanged({
                    fast: true,
                    dont_recalculate_overlapping: true,
                    mutated_blocks: {}
                });
            }
            return;

        } else if (block instanceof MutlistateAltsBlock) {
            // shouldn't even be able to select a multistate alts block
            return;

        } else if (block.parent instanceof MutlistateAltsBlock) {
            // it's already a state in a multistate
            // TODO add a state to the multistate that's a clone of this one
            return;

        } else if ((block.parent != null ? block.parent.parent : undefined) instanceof MutlistateAltsBlock && (block.parent.children.length === 1)) {
            // it's the only child of a mutlistate state
            // same situation as above, in the common case where the user has one big block inside
            // the artboard and selected it instead of the artboard
            return;
        }
    }


    const {
        doc
    } = blocks[0];
    assert(() => ((() => {
        const result = [];
        for (block of Array.from(blocks)) {             result.push(block.doc === doc);
        }
        return result;
    })()));

    blocks = _l.flatMap(blocks, block => block.andChildren());

    const [hole, alts_holder] = Array.from([new MutlistateHoleBlock(), new MutlistateAltsBlock()]);
    hole.geometry = Block.unionBlock(blocks);
    hole.altsUniqueKey = alts_holder.uniqueKey;
    hole.stateExpr.code = "'default'";

    alts_holder.width = 100 + hole.width + 100 + hole.width + 100;
    alts_holder.height = 100 + hole.height + 100;
    ({top: alts_holder.top, left: alts_holder.left} = doc.getUnoccupiedSpace(alts_holder, hole));

    const alts = [
        [{top: 100, left: 100}, true, "default"],
        [{top: 100, left: 100 + hole.width + 100}, false, "alt"]
    ].map(function(...args) {
        const [offset, use_original_blocks, name] = Array.from(args[0]);
        return {
            offset,
            artboard: new ArtboardBlock({name, includeColorInCompilation: false}),
            blocks: (() => {
                return (() => {
                    const result = [];
                    for (block of Array.from(blocks)) {
                        if (!use_original_blocks) {
                            const clone = block.clone();
                            doc.addBlock(clone);
                            result.push(clone);
                        } else {
                            result.push(block);
                        }
                    }
                    return result;
                })();
            })()
        };});

    for (let alt of Array.from(alts)) {
        var axis;
        alt.artboard.size = hole.size;
        for (axis of ['top', 'left']) { alt.artboard[axis] = alts_holder[axis] + alt.offset[axis]; }

        for (block of Array.from(alt.blocks)) {
            for (axis of ['top', 'left']) { block[axis] += alt.artboard[axis] - hole[axis]; }
        }
    }

    const alt_artboards = _l.map(alts, 'artboard');

    for (block of [alts_holder, hole, ...Array.from(alt_artboards)]) { doc.addBlock(block); }
    hole.previewedArtboardUniqueKey = _l.find(alt_artboards, {name: "default"}).uniqueKey;

    editor.selectBlocks([hole]);
    return editor.handleDocChanged();
});

//# Multiple selected sidebar -> "Make Multistate"
defaultExport.make_multistate_component_from_blocks = (make_multistate_component_from_blocks = function(blocks, editor) {
    const {PropSpec, ColorPropControl, ImagePropControl, StringPropControl, CheckboxPropControl, NumberPropControl, DropdownPropControl, ObjectPropValue, PropInstance} = require('./props');
    const MultistateBlock = require('./blocks/multistate-block');
    const ArtboardBlock = require('./blocks/artboard-block');
    const {Dynamicable, GenericDynamicable} = require('./dynamicable');

    if (_l.isEmpty(blocks)) { return; }
    const {
        doc
    } = blocks[0];
    assert(() => (Array.from(blocks).map((block) => block.doc === doc)));

    // bring all children with us
    blocks = _l.uniq(_l.flatMap(blocks, b => b.andChildren()));

    // sort so we distribute the state names from left to right
    const stateParentBlocks = _l.sortBy(blocks.filter(b => !Array.from(blocks).includes(b.parent)), 'left');
    const originalStateParentGeometries = stateParentBlocks.map(block => _l.pick(block, ['top', 'left', 'width', 'height']));

    // Find some space for the new multistate component
    const padding = 75;
    const union = Block.unionBlock(blocks);
    const wrapperWithPadding = {height: union.height + (2 * padding), width: union.width + (2 * padding)};
    const unoccupied = doc.getUnoccupiedSpace(wrapperWithPadding, {top: union.top - padding, left: union.right + (2 * padding)});
    const newUnionPosition = {top: unoccupied.top + padding, left: unoccupied.left + padding};

    // add it to the doc
    const multistateBlock = new MultistateBlock(_l.extend({}, wrapperWithPadding, {top: unoccupied.top, left: unoccupied.left}));
    doc.addBlock(multistateBlock);

    // Create the new state names
    const states = ['default'].concat(_l.range(1, stateParentBlocks.length).map(num => `state_${num}`));
    const stateSpec = new PropSpec({name: 'state', control: new DropdownPropControl({options: states})});
    multistateBlock.componentSpec.addSpec(stateSpec);

    // Move selected blocks inside the multistate component
    for (let block of Array.from(blocks)) {
        block.top += newUnionPosition.top - union.top;
        block.left += newUnionPosition.left - union.left;
    }

    assert(() => _.every(block => multistateBlock.contains(block)));

    // Wrap them with artboards,
    _l.zipWith(stateParentBlocks, 'left', states, (block, state) => {
        return doc.addBlock(new ArtboardBlock({top: block.top, left: block.left, height: block.height, width: block.width, includeColorInCompilation: false, name: state}));
    });

    // Create instances where the blocks were
    _l.zipWith(originalStateParentGeometries, states, (blockGeometry, state) => {
        const stateInstance = stateSpec.newInstance();
        stateInstance.value.innerValue.staticValue = state;
        const propValues = new ObjectPropValue({innerValue: (Dynamicable([PropInstance])).from([stateInstance])});
        return doc.addBlock(new InstanceBlock({sourceRef: multistateBlock.componentSpec.componentRef, propValues, 
            top: blockGeometry.top, left: blockGeometry.left, width: blockGeometry.width, height: blockGeometry.height}));
    });


    return editor.handleDocChanged();
});


const make_centered_on_single_axis = (axis, length) => (function(blocks) {
    if (blocks.length === 0) { return; }
    const {
        doc
    } = blocks[0];

    // sanity check: make sure all blocks are from the same doc
    assert(() => (Array.from(blocks).map((block) => block.doc === doc)));

    // UX hack: if only a single block is selected, bring its children with it
    if (blocks.length === 1) { blocks = blocks[0].andChildren(); }

    const union = Block.unionBlock(blocks);

    // this is a super weird heuristic
    const commonParent = _l.minBy(doc.blocks.filter(parent => parent.strictlyContains(union)), 'order');
    if ((commonParent == null)) { return; }

    let margin = (commonParent[length] - union[length]) / 2;
    // We're preserving the invariant that dimensions are measured in px integers
    // but note that this introduces a 0.5px margin of error for this function
    margin = Math.floor(margin);

    const deltaX = (commonParent[axis] + margin) - union[axis];
    return (() => {
        const result = [];
        for (let block of Array.from(blocks)) {             result.push((block[axis] += deltaX));
        }
        return result;
    })();
});


defaultExport.make_centered_horizontally = (make_centered_horizontally = make_centered_on_single_axis('left', 'width'));
defaultExport.make_centered_vertically   = (make_centered_vertically   = make_centered_on_single_axis('top', 'height'));

// gets you a fresh set of blocks, in the same tree ordering as you handed them, with all dynamicables
// turned to static, all lists turned off, etc.  Useful for handing to compileComponentForInstanceEditor
// to get pdom that will match the static values in layout view.
defaultExport.all_static_blocktree_clone = function(blockTree) {
    const ArtboardBlock = require('./blocks/artboard-block');

    var map_block_tree = (bt, fn) => ({
        block: fn(bt.block),
        children: bt.children.map(child => map_block_tree(child, fn))
    });

    // need to preserve the blockTree structure so we preserve the layer ordering.
    // changing a LayoutBlock's is_repeat=false can change it's layer ordering, which we don't want
    return map_block_tree(blockTree, function(block) {
        let dynamicable;
        const clone = block.freshRepresentation();

        // HACK tell the cloned blocks they belong to the source doc, so instance blocks
        // look for their source component in the source doc
        clone.doc = blockTree.block.doc;

        if (clone instanceof LayoutBlock) {
            // "static" no lists/if-s
            _l.extend(clone, {is_repeat: false, is_optional: false, is_form: false});
        }

        if (clone instanceof ArtboardBlock) {
            // include color so we match what you'd see in the layout editor
            clone.includeColorInCompilation = true;
        }

        // use static values
        // recursively get dynamics because dynamic InstanceBlock propValues can hide deeper nested prop dynamics
        while ((dynamicable = __guard__(clone.getDynamicsForUI()[0], x => x[2])) != null) {
            dynamicable.source.isDynamic = false;
        }

        return clone;
    });
};

// TODO: implement
defaultExport.pushdown_below_block = (pushdown_below_block = function(source_block, deltaY) {
    let block;
    const {
        blocks
    } = source_block.doc;

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
        for (block of Array.from(blocks)) {             if (from.top <= block.top) {
                result.push(make_line(block, 'top'));
            }
        }
        return result;
    })()),

        // look at bottom lines of blocks the mouse is inside, so we can resize them
        ((() => {
        const result1 = [];
        for (block of Array.from(blocks)) {             if ((block.top < from.top && from.top <= block.bottom) && Array.from(block.resizableEdges).includes('bottom')) {
                result1.push(make_line(block, 'bottom'));
            }
        }
        return result1;
    })())
    );

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



// Keyboard navigation

/*
Checkable Goals:

    - all blocks are reachable
    - each of the sequences (left, right), (right, left), (up, down), and (down, up) are idempotent
        - unless the first of (first, second) is itself idempotent

"Good feels":

    - minimal actions to get where you're going
    - optimize for local movement; you can always use the mouse or other navigation for bigger jumps
    - some congruence with rows/columns?
*/

// keyboard_key_name :: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight'
defaultExport.arrow_key_select = (arrow_key_select = function(editor, keyboard_key_name, should_jump) {
    // get 'focused' block
    const selection = editor.getSelectedBlocks();
    if (_l.isEmpty(selection)) { return; }
    const focused_block = _l.last(selection);

    // ranges_of_block :: Block -> {x_axis: Range, y_axis: Range}
    // Range = (start :: int, end :: int); inclusive
    // -1 is because block.left and block.bottom are the pixel **after** the end of the block
    const ranges_of_block = block => ({
        x_axis: [block.left, block.right - 1],
        y_axis: [block.top, block.bottom - 1]
    });

    // ranges_intersect :: Range -> Range -> Bool
    const ranges_intersect = function(...args) {
        const [start_a, end_a] = Array.from(args[0]), [start_b, end_b] = Array.from(args[1]);
        return (start_b <= start_a && start_a <= end_b) || (start_a <= start_b && start_b <= end_a);
    };

    const focused_block_ranges = ranges_of_block(focused_block);

    const smaller = [_l.maxBy, ((a, b) => a < b)];
    const bigger  = [_l.minBy, ((a, b) => a > b)];

    const array = ((o => o[keyboard_key_name]))({
              ArrowUp:    [smaller,  'top',    'x_axis'],
              ArrowDown:  [bigger,   'bottom', 'x_axis'],
              ArrowLeft:  [smaller,  'left',   'y_axis'],
              ArrowRight: [bigger,   'right',  'y_axis']
          }),
          [find_closest_by, isnt_in_wrong_direction] = Array.from(array[0]),
          edge = array[1],
          orth_axis = array[2];

    const target = ((o => find_closest_by(o, edge)))(editor.doc.blocks.filter(block => _l.every([
        block !== focused_block,
        ranges_intersect(ranges_of_block(block)[orth_axis], focused_block_ranges[orth_axis]),
        isnt_in_wrong_direction(block[edge], focused_block[edge])
    ])));

    if (target == null) { return; }

    // editor.selectAndMoveToBlocks([target])
    return editor.selectBlocks([target]);
});


export default defaultExport;


function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}