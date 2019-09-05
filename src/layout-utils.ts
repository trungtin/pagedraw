/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let block_area, block_overlap_area, block_overlap_length, block_partially_encloses_block, block_props_by_direction, block_range, blocks_overlap, blocks_overlap_on_both_axes, direction_from_side, opposite_direction, opposite_side, overlap_sides, range_encloses_subrange, range_overlap_length, ranges_overlap;
import _l from 'lodash';
const defaultExport = {};

defaultExport.opposite_side = (opposite_side = function(side) { switch (side) {
    case 'top':    return 'bottom';
    case 'bottom': return 'top';
    case 'left':   return 'right';
    case 'right':  return 'left';
    default: throw new Error('unknown side');
} });


defaultExport.direction_from_side = (direction_from_side = function(side) { switch (side) {
    case 'top':    return 'vertical';
    case 'bottom': return 'vertical';
    case 'left':   return 'horizontal';
    case 'right':  return 'horizontal';
} });


defaultExport.opposite_direction = (opposite_direction = function(direction) { switch (direction) {
    case 'vertical':   return 'horizontal';
    case 'horizontal': return 'vertical';
    default: throw new Error("unknown direction");
} });


defaultExport.block_props_by_direction = (block_props_by_direction = function(direction) {
    switch (direction) {
        case 'vertical':
            return {
                start: 'top', end: 'bottom', length: 'height',
                offset_before: 'offset_left', offset_after: 'offset_right'
            };
        case 'horizontal':
            return {
                start: 'left', end: 'right', length: 'width',
                offset_before: 'offset_top', offset_after: 'offset_bottom'
            };
        default: throw new Error("unknown direction");
    }
});


defaultExport.block_area = (block_area = block => block.width * block.height);


defaultExport.block_range = (block_range = function(direction, block) {
    const { start, end } = block_props_by_direction(direction);
    return {start: block[start],  end: block[end]};
});


defaultExport.ranges_overlap = (ranges_overlap = (range_a, range_b) => (range_a.start <= range_b.end)  && (range_b.start <= range_a.end));


defaultExport.range_encloses_subrange = (range_encloses_subrange = (range, subrange) => (range.start <=  subrange.start) && (range.end >= subrange.end));


defaultExport.range_overlap_length = (range_overlap_length = function(range_a, range_b) {
    const e1 = Math.max(range_a.start, range_b.start);
    const e2 = Math.min(range_a.end, range_b.end);
    if (e1 > e2) { return e1 - e2; } else { return e2 - e1; }
});


defaultExport.blocks_overlap = (blocks_overlap = (direction, block_a, block_b) => ranges_overlap(block_range(direction, block_a), block_range(direction, block_b)));


defaultExport.block_overlap_length = (block_overlap_length = function(dir, block_a, block_b) {
    const range_a = block_range(dir, block_a);
    const range_b = block_range(dir, block_b);
    return range_overlap_length(range_a, range_b);
});


defaultExport.block_overlap_area = (block_overlap_area = (block_a, block_b) => block_overlap_length('horizontal', block_a, block_b) * block_overlap_length('vertical', block_a, block_b));

defaultExport.blocks_overlap_on_both_axes = (blocks_overlap_on_both_axes = (block_a, block_b) => blocks_overlap('horizontal', block_a, block_b) && blocks_overlap('vertical', block_a, block_b));


defaultExport.overlap_sides = (overlap_sides = function(block_a, block_b) {
    const vertical_overlap   = blocks_overlap('vertical',   block_a, block_b);
    const horizontal_overlap = blocks_overlap('horizontal', block_a, block_b);
    return _l.compact([
        vertical_overlap   && (block_a.top    >= block_b.top) ? 'top' : undefined,
        vertical_overlap   && (block_a.bottom <= block_b.bottom) ? 'bottom' : undefined,
        horizontal_overlap && (block_a.left   >= block_b.left) ? 'left' : undefined,
        horizontal_overlap && (block_a.right  <= block_b.right) ? 'right' : undefined
    ]);
});


defaultExport.block_partially_encloses_block = (block_partially_encloses_block = (dir, container, containee) => blocks_overlap_on_both_axes(container, containee) && range_encloses_subrange(block_range(dir, container), block_range(dir, containee)));
export default defaultExport;
