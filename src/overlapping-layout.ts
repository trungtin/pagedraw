/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import { assert } from './util';

import {
    blocks_overlap_on_both_axes,
    block_partially_encloses_block,
    overlap_sides,
    block_props_by_direction,
    opposite_side,
    opposite_direction,
    direction_from_side,
    block_area,
    block_partially_contains_block,
} from './layout-utils';

const defaultExport = {};


// ATTN: this is an O(n^2) operation! Use with care!
defaultExport.group_block_trees = function(block_trees) {
    const blocks = block_trees.map(t => t.block);

    // union-find
    const groups = new Map(block_trees.map(function(block_tree) {
        const group = {block: block_tree.block, tree: block_tree, overlaps: new Set()};
        group.parent = group;
        return [block_tree.block, group];
    }));

    var group_parent = function(group) {
        if (group === group.parent) {
        return group;
        } else { return group_parent(group.parent); }
    };
    var join_group = function(group, to) {
        if (to.block === to.parent.block) {
            return group.parent = to;
        } else { return join_group(group, to.parent); }
    };

    blocks.forEach(function(block) {
        const own_group = groups.get(block);
        return blocks.forEach(function(other_block) {
            const other_group = groups.get(other_block);
            if ((block !== other_block) && blocks_overlap_on_both_axes(block, other_block)) {
                own_group.overlaps.add(other_group.tree);
                other_group.overlaps.add(own_group.tree);
                return join_group(other_group, own_group);
            }
        });
    });

    const sets = new Map(block_trees.map(tree => [tree, []]));
    blocks.forEach(function(block) {
        const own_group = groups.get(block);
        return sets.get(group_parent(own_group).tree).push({tree: own_group.tree, overlaps: own_group.overlaps});
    });

    return Array.from(sets.entries()).map(function(...args) { const [key, value] = Array.from(args[0]); return value; }).filter(blocks => blocks.length > 0);
};


defaultExport.resolve_block_group = function(group) {
    let block_a, block_b, overlaps;
    const unannotated_group = group.map(b => b.tree);
    // identify special cases and resolve them
    if (group.length === 2) {
        block_a = group[0].tree.block;
        block_b = group[1].tree.block;

        const enclosure_directions = _l.compact(['horizontal', 'vertical'].map(function(dir) {
            if (block_partially_encloses_block(dir, block_a, block_b)) { return dir; }
        })
        );
        const reverse_enclosure_directions = _l.compact(['horizontal', 'vertical'].map(function(dir) {
            if (block_partially_encloses_block(dir, block_b, block_a)) { return dir; }
        })
        );

        const container  = reverse_enclosure_directions.length === 0 ? block_a : block_b;
        const containee  = reverse_enclosure_directions.length === 0 ? block_b : block_a;
        const enclosures = reverse_enclosure_directions.length === 0 ? enclosure_directions : reverse_enclosure_directions;
        overlaps = overlap_sides(container, containee);

        // 2 full enclosures = blocks occupy same rectangle
        assert(() => enclosures.length <= 2);
        if (enclosures.length === 1) { // 1. one block partially enclosed by another block
            const enclosure_direction = enclosures[0];
            // there should be at least one overlap
            assert(function() {
                const { start, end } = block_props_by_direction(opposite_direction(enclosure_direction));
                return (Array.from(overlaps).includes(start)) || (Array.from(overlaps).includes(end));
            });

            const { start, end } = block_props_by_direction(opposite_direction(enclosure_direction));
            if (((Array.from(overlaps).includes(start)) && !(Array.from(overlaps).includes(end))) || ((!(Array.from(overlaps).includes(start))) && (Array.from(overlaps).includes(end)))) {
                return {group: unannotated_group, negative_margins: opposite_direction(enclosure_direction)};
            }
        }

        if (enclosures.length === 0) { // 2. overlap but no enclosure - diagonal case
            assert(() => overlaps.length <= 2);
            return {group: unannotated_group, negative_margins: 'vertical'};
        }
    }

        // enclosures.length == 2 has no clear way to handle

    if (group.length === 3) { // 3. block between two other blocks case
        const sorted_by_overlap_count = _l.orderBy(group, (g => g.overlaps.size), 'desc');
        // if one block overlaps both others
        if (_l.every([
            sorted_by_overlap_count[0].overlaps.size === 2,
            sorted_by_overlap_count[1].overlaps.size === 1,
            sorted_by_overlap_count[2].overlaps.size === 1,
            sorted_by_overlap_count[0].overlaps.has(sorted_by_overlap_count[1].tree),
            sorted_by_overlap_count[0].overlaps.has(sorted_by_overlap_count[2].tree),
            sorted_by_overlap_count[1].overlaps.has(sorted_by_overlap_count[0].tree),
            sorted_by_overlap_count[2].overlaps.has(sorted_by_overlap_count[0].tree)
        ])) {
            let block_c;
            [block_a, block_b, block_c] = Array.from(_l.map(sorted_by_overlap_count, 'tree.block'));
            const overlaps_b = overlap_sides(block_b, block_a);
            const overlaps_c = overlap_sides(block_c, block_a);

            // if overlaps are all along the same axis and on opposite sides of the middle block
            if (_l.every([
                overlaps_b.length === 1,
                overlaps_c.length === 1,
                overlaps_b[0] === opposite_side(overlaps_c[0])
            ])) {
                const direction_across_group = opposite_direction(direction_from_side(overlaps_b[0]));
                const { length } = block_props_by_direction(direction_across_group);
                if ((block_b[length] >= block_a[length]) && (block_c[length] >= block_a[length])) {
                    return {group: unannotated_group, negative_margins: direction_from_side(overlaps_b[0])};
                }
            }
        }
    }

            // potential cases to handle:
                // L-case (two overlaps on middle block, one horizontal one vertical)
                // two small blocks overlap on the same side but don't overlap each other
                // possibly extend to any number of small blocks overlapping on one side

    return {group: unannotated_group};
};
export default defaultExport;
