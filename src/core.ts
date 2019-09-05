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
 * DS202: Simplify dynamic range loops
 * DS203: Remove `|| {}` from converted for-own loops
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let blocklist_to_blocktree,
  blocks_from_block_tree,
  blockTreeToSlices,
  compileComponent,
  compileComponentForInstanceEditor,
  compileDoc,
  component_subtrees_of_block_tree,
  componentBlockTreesOfDoc,
  dynamicsInJsonDynamicable,
  evalInstanceBlock,
  evalPdomForInstance,
  jsonDynamicableToJsonStatic,
  makeLinkTags,
  pdomDynamicableToPdomStatic,
  postorder_walk_block_tree,
  slice1D,
  static_pdom_is_equal,
  subtree_for_block,
  tests,
  wrapPdom
import _ from 'underscore'
import _l from 'lodash'
import path from 'path'
import escape from 'escape-html'

import {
  assert,
  zip_dicts,
  find_connected,
  memoized_on,
  dfs,
  isPermutation,
  capitalize_first_char,
  lowercase_first_char,
} from './util'

import Random from './random'
import { isExternalComponent } from './libraries'
import Block from './block'
import Dynamic from './dynamic'
import evalPdom from './eval-pdom'
import { Dynamicable, GenericDynamicable } from './dynamicable'
import { GoogleWebFont, CustomFont, Font, LocalUserFont } from './fonts'
import { getExternalComponentSpecFromInstance } from './external-components'

import {
  filePathOfComponent,
  cssPathOfComponent,
  reactJSNameForComponent,
  templatePathOfComponent,
  angularTagNameForComponent,
  angularJsNameForComponent,
} from './component-spec'

import {
  StringPropControl,
  DropdownPropControl,
  NumberPropControl,
  CheckboxPropControl,
  ColorPropControl,
  ImagePropControl,
  ListPropControl,
  ObjectPropControl,
  FunctionPropControl,
} from './props'

import { valid_compiler_options } from './compiler-options'
import config from './config'

import {
  attrKey,
  constraintAttrs,
  specialVPdomAttrs,
  nonDynamicableAttrs,
  media_query_attrs,
  specialDivAttrs,
  walkPdom,
  foreachPdom,
  mapPdom,
  pureMapPdom,
  flattenedPdom,
  find_pdom_where,
  clonePdom,
  attr_members_of_pdom,
  htmlAttrsForPdom,
  styleMembersOfPdom,
  styleForDiv,
  externalPositioningAttrs,
  pdom_tag_is_component,
} from './pdom'

import { group_block_trees, resolve_block_group } from './overlapping-layout'
const defaultExport = {}

// FIXME: Call sites should now be requiring pdom.coffee instead but I was lazy so I left them requiring pdom indirectly
// via core.coffee
_l.extend(defaultExport, {
  foreachPdom,
  flattenedPdom,
  clonePdom,
  htmlAttrsForPdom,
  styleForDiv,
})

//#

const pct = num => num * 100 + '%'

//# Types

// BlockTree = {block: Block, children: [BlockTree]}, except the root node has no .block

defaultExport.postorder_walk_block_tree = postorder_walk_block_tree = function(
  bt,
  fn
) {
  for (let child of Array.from(bt.children)) {
    postorder_walk_block_tree(child, fn)
  }
  return fn(bt)
}

defaultExport.subtree_for_block = subtree_for_block = (blockTree, block) =>
  dfs(blockTree, btNode => btNode.block === block, btNode => btNode.children)

defaultExport.blocks_from_block_tree = blocks_from_block_tree = blockTree =>
  [blockTree.block].concat(
    ...Array.from(blockTree.children.map(blocks_from_block_tree) || [])
  )

var clone_block_tree = ({ block, children }) => ({
  block,
  children: children.map(clone_block_tree),
})

// Slice A = {margin, length, start, end, contents: A}

// mapSlice :: [Slice A] -> (Slice A -> B) -> [Slice B]
const mapSlice = (slices, fn) =>
  slices.map(function(slice) {
    const newslice = _.clone(slice)
    newslice.contents = fn(slice)
    return newslice
  })

// Tree A = {block: A, children: [Tree A]}
// 2DSlice A = {block: Maybe A, direction: vertical|horizontal, slices: [Slice 2DSlice A])

const otherDirection = function(direction) {
  switch (direction) {
    case 'horizontal':
      return 'vertical'
    case 'vertical':
      return 'horizontal'
    default:
      throw new Error('unknown direction')
  }
}

// When a set of blocks is unslicable, we group them in an AbsoluteBlock
class AbsoluteBlock extends Block {
  static initClass() {
    this.userVisibleLabel = '[AbsoluteBlock/internal]' // should never be seen by a user

    // TODO support flex in absoluted blocks. For now we asuume all absoluted blocks are non-flex (enforced elsewhere).
    for (let flex_prop of [
      'flexWidth',
      'flexMarginLeft',
      'flexMarginRight',
      'flexHeight',
      'flexMarginTop',
      'flexMarginBottom',
    ]) {
      this.compute_previously_persisted_property(flex_prop, {
        get() {
          return false
        },
        set(new_val) {
          return assert(() => false)
        },
      })
    }
  }
  constructor(block_trees, opts) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) {
        super()
      }
      let thisFn = (() => {
        return this
      }).toString()
      let thisName = thisFn.match(
        /return (?:_assertThisInitialized\()*(\w+)\)*;/
      )[1]
      eval(`${thisName} = this;`)
    }
    this.block_trees = block_trees
    super(opts)
  }
}
AbsoluteBlock.initClass() // compiling algos should be pure and not mutate their inputs

// JSON Dynamicable / JSON Dynamic / JSON Static

//# FIXME: all the following need to be okay with Font (and later, Image) objects.
//  the pdom should always be able to have Font objects anywhere.  We should also be able to add other primitives
//  to the pdom without breaking these and other things.
//  When this is fixed, in the commit message / PR, include a list of all places that needed to change.

// FIXME let's move this next to the PDOM definitions, so we don't mess up on the types changing again.

// From the jsonDynamicable we are able to infer which values should by dynamic or not at which paths
// dynamicsInJsonDynamicable :: (JsonDynamicable, path :: String) -> [{label: String, dynamicable: Dynamicable}]
defaultExport.dynamicsInJsonDynamicable = dynamicsInJsonDynamicable = function(
  jd,
  path
) {
  if (path == null) {
    path = ''
  }
  if (jd instanceof GenericDynamicable && jd.isDynamic) {
    return [{ label: path, dynamicable: jd }]
  } else if (jd instanceof GenericDynamicable && !jd.isDynamic) {
    return dynamicsInJsonDynamicable(jd.staticValue, path)
  } else if (_l.isArray(jd)) {
    return _l.flatten(
      jd.map((value, i) => dynamicsInJsonDynamicable(value, `${path}[${i}]`))
    )
  } else if (_l.isPlainObject(jd)) {
    return _l.flatten(
      _l.map(jd, (val, key) => dynamicsInJsonDynamicable(val, `${path}.${key}`))
    )
  } else {
    return []
  }
}

defaultExport.jsonDynamicableToJsonStatic = jsonDynamicableToJsonStatic = function(
  jd
) {
  if (jd instanceof GenericDynamicable) {
    return jsonDynamicableToJsonStatic(jd.staticValue)
  } else if (_l.isArray(jd)) {
    return jd.map(jsonDynamicableToJsonStatic)
  } else if (_l.isPlainObject(jd)) {
    return _l.mapValues(jd, jsonDynamicableToJsonStatic)
  } else {
    return jd
  }
}

var jsonDynamicableToJsonDynamic = function(jd) {
  if (jd instanceof GenericDynamicable && jd.isDynamic) {
    return new Dynamic(jd.code, jd)
  } else if (jd instanceof GenericDynamicable && !jd.isDynamic) {
    return jsonDynamicableToJsonDynamic(jd.staticValue)
  } else if (_l.isArray(jd)) {
    return jd.map(jsonDynamicableToJsonDynamic)
  } else if (_l.isPlainObject(jd)) {
    return _l.mapValues(jd, jsonDynamicableToJsonDynamic)
  } else {
    return jd
  }
}

const lowerPdomFromDynamicable = _l.curry((lowerJson, pdom) =>
  mapPdom(pdom, pd =>
    _l.mapValues(pd, function(value, key) {
      if (Array.from(nonDynamicableAttrs).includes(key)) {
        return value
      } else {
        return lowerJson(value)
      }
    })
  )
)

// Replace Dynamicables with their staticValues, even if isDynamic is true.
// This is ususally for the editor, where we always show the staticValue, even if it's a fake value.
defaultExport.pdomDynamicableToPdomStatic = pdomDynamicableToPdomStatic = lowerPdomFromDynamicable(
  jsonDynamicableToJsonStatic
)

// lower Dynamicables from renderHTML into (Dynamic|Literal)s
const pdomDynamicableToPdomDynamic = lowerPdomFromDynamicable(
  jsonDynamicableToJsonDynamic
)

defaultExport.static_pdom_is_equal = static_pdom_is_equal = function(lhs, rhs) {
  // props are equal part 1: make sure lhs doesn't have any props rhs doesn't
  let prop, value
  for (prop in lhs) {
    value = lhs[prop]
    if (
      !['children', 'backingBlock', 'classList'].includes(prop) &&
      value != null &&
      rhs[prop] == null
    ) {
      return false
    }
  }

  // props are equal part 2: make sure all of rhs's props equal lhs's props
  if (isExternalComponent(lhs != null ? lhs.tag : undefined)) {
    // External components are the only ones allowed tags here
    // FIXME: Maybe external components shouldn't even be allowed here because they signal a non static pdom (?)
    for (prop in rhs) {
      value = rhs[prop]
      if (
        !['tag', 'props', 'children', 'backingBlock', 'classList'].includes(
          prop
        ) &&
        !static_pdom_value_is_equal(lhs[prop], value)
      ) {
        return false
      }
    }
    if (!_l.isEqual(lhs.tag, rhs.tag) || !_l.isEqual(lhs.props, rhs.props)) {
      return false
    }
  } else {
    for (prop in rhs) {
      value = rhs[prop]
      if (
        !['children', 'backingBlock', 'classList'].includes(prop) &&
        !static_pdom_value_is_equal(lhs[prop], value)
      ) {
        return false
      }
    }
  }

  // props are equal part 1 and 2 together: lhs and rhs have the same props, and each prop is equal to its counterpart
  // ignore backingBlocks

  // make sure their classLists are equal sets, treating the common case .classList = undefined as the empty set
  if (
    (lhs.classList != null && !_l.isEmpty(lhs.classList)) !==
    (lhs.classList != null && !_l.isEmpty(lhs.classList))
  ) {
    return false
  }
  if (
    lhs.classList != null &&
    rhs.classList != null &&
    !isPermutation(lhs.classList, rhs.classList)
  ) {
    return false
  }

  // recursively check the children
  if (lhs.children.length !== rhs.children.length) {
    return false
  }
  for (let i = 0; i < lhs.children.length; i++) {
    const lhs_child = lhs.children[i]
    if (!static_pdom_is_equal(lhs_child, rhs.children[i])) {
      return false
    }
  }

  // all checks passed
  return true
}

var static_pdom_value_is_equal = function(lhs, rhs) {
  if (lhs instanceof Font && rhs instanceof Font) {
    return lhs.isEqual(rhs)
  } else {
    return lhs === rhs
  }
}

// TODO there should be some jsonDynamic stuff here for props...
const pdom_value_is_equal = static_pdom_value_is_equal

// Like pdomDynamicToPdomStatic but puts random values in place of all static values
// FIXME: This should be nixed quickly and substituted by "Generate random props" See stress-tester.getCompiledComponentByUniqueKey
defaultExport.pdomDynamicToPdomRandom = function(pdom, cache) {
  if (cache == null) {
    cache = {}
  }
  const isColor = (pd, key, value) =>
    (value instanceof Dynamicable(String) && key === 'background') ||
    (value instanceof Dynamicable(String) && key === 'fontColor')

  const isImage = (pd, key, value) =>
    (value instanceof Dynamicable(String) &&
      pd.tag === 'img' &&
      key === 'srcAttr') ||
    (value instanceof Dynamicable(String) && key === 'backgroundImage')

  return mapPdom(pdom, pd =>
    _l.mapValues(pd, function(value, key) {
      let cached
      if (!(value instanceof Dynamic)) {
        return value
      }
      const { dynamicable } = value
      if ((cached = cache[dynamicable.uniqueKey]) != null) {
        return cached
      }

      const val = (() => {
        if (dynamicable instanceof Dynamicable(Number)) {
          return _l.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        } else if (dynamicable instanceof Dynamicable(Boolean)) {
          return _l.sample([true, false])
        } else if (isImage(pd, key, dynamicable)) {
          return Random.randomImageGenerator()
        } else if (isColor(pd, key, dynamicable)) {
          return Random.randomColorGenerator()
        } else if (dynamicable instanceof Dynamicable(String)) {
          return Random.randomQuoteGenerator()
        } else if (dynamicable instanceof GenericDynamicable) {
          throw new Error(`Unknown Dynamicable type of ${key}` + dynamicable)
        } else {
          throw new Error('Dynamic has no source Dynamicable')
        }
      })()
      cache[dynamicable.uniqueKey] = val
      return val
    })
  )
}

// Virtual PDOM (VPDom)

const layoutAttrsForAxis = function(direction) {
  if (direction === 'horizontal') {
    return {
      paddingBefore: 'paddingLeft',
      paddingAfter: 'paddingRight',
      marginBefore: 'marginLeft',
      marginAfter: 'marginRight',
      length: 'width',
      vLength: 'vWidth',
      minLength: 'minWidth',
      layoutType: 'horizontalLayoutType',
      flexLength: 'flexWidth',
      flexMarginBefore: 'flexMarginLeft',
      flexMarginAfter: 'flexMarginRight',
      flexMarginCrossBefore: 'flexMarginTop',
      flexMarginCrossAfter: 'flexMarginBottom',
      blockStart: 'left',
      blockEnd: 'right',
      absoluteBefore: 'left',
      absoluteAfter: 'right',
    }
  } else if (direction === 'vertical') {
    return {
      paddingBefore: 'paddingTop',
      paddingAfter: 'paddingBottom',
      marginBefore: 'marginTop',
      marginAfter: 'marginBottom',
      length: 'height',
      vLength: 'vHeight',
      minLength: 'minHeight',
      layoutType: 'verticalLayoutType',
      flexLength: 'flexHeight',
      flexMarginBefore: 'flexMarginTop',
      flexMarginAfter: 'flexMarginBottom',
      flexMarginCrossBefore: 'flexMarginLeft',
      flexMarginCrossAfter: 'flexMarginRight',
      blockStart: 'top',
      blockEnd: 'bottom',
      absoluteBefore: 'top',
      absoluteAfter: 'bottom',
    }
  } else {
    throw new Error('unknown direction')
  }
}

const marginDiv = function(direction, length) {
  assert(() => length < 0)
  const cross_length = config.debugPdom ? 10 : 0
  if (direction === 'horizontal') {
    return {
      marginDiv: true,
      direction: 'vertical',
      tag: 'div',
      children: [],
      vWidth: length,
      vHeight: cross_length,
    }
  } else if (direction === 'vertical') {
    return {
      marginDiv: true,
      direction: 'horizontal',
      tag: 'div',
      children: [],
      vWidth: cross_length,
      vHeight: length,
    }
  } else {
    throw new Error('unknown direction')
  }
}

const spacerDiv = function(direction, length) {
  assert(() => length >= 0)
  const cross_length = config.debugPdom ? 10 : 0
  if (direction === 'horizontal') {
    return {
      spacerDiv: true,
      direction: 'vertical',
      tag: 'div',
      children: [],
      vWidth: length,
      vHeight: cross_length,
    }
  } else if (direction === 'vertical') {
    return {
      spacerDiv: true,
      direction: 'horizontal',
      tag: 'div',
      children: [],
      vWidth: cross_length,
      vHeight: length,
    }
  } else {
    throw new Error('unknown direction')
  }
}

//# DOMish pdom utils

// <pdom externalPositioningAttrs otherAttrs />
//
// becomes
//
// <outer externalPositioningAttrs>
//   <pdom otherAttrs />
// </outer>
//
// Note that attrs of outer can potentially override externalPositioningAttrs
defaultExport.wrapPdom = wrapPdom = function(pdom, outer) {
  // Creates new pdom with everything but externalPositioningAttrs
  const new_pdom = _l.omit(pdom, externalPositioningAttrs)

  new_pdom.flexGrow = '1'

  // Deletes otherAttrs from wrapper
  const keys_to_remove_from_wrapper = _.difference(
    _l.keys(pdom),
    externalPositioningAttrs
  )
  for (let prop of Array.from(keys_to_remove_from_wrapper)) {
    delete pdom[prop]
  }

  assert(() => _l.isEmpty(outer.children))

  // tag should be an object or a non-empty string
  assert(() => outer.tag != null && outer.tag !== '')

  // Despite the assert ->s, we add a default div tag and ovewrite children anyway
  return _l.extend(pdom, { tag: 'div', display: 'flex' }, outer, {
    children: [new_pdom],
  })
}

// <pdom externalPositioningAttrs otherAttrs>
//   <child />
// <pdom>
//
// becomes
//
// <pdom otherAttrs>
//   <child externalPositioningAttrs />
// <pdom>
//
const unwrapPdom = function(pd) {
  assert(() => pd.children.length === 1)
  assert(() => pd.children[0].flexGrow === '1')

  // flexGrow was forcefully added by wrapPdom to the child, so we remove it
  // (but externalPositioningAttrs might bring it back, and that would be fine)
  delete pd.children[0].flexGrow

  // Grab special attrs from pd
  const to_move = _l.pick(pd, externalPositioningAttrs)
  for (let prop of Array.from(externalPositioningAttrs)) {
    delete pd[prop]
  }
  delete pd.display // also delete the display that was added by wrapPdom
  return _l.extend(pd.children[0], to_move)
}

const phantomTags = ['showIf', 'repeater']
const unwrapPhantomPdoms = pdom =>
  foreachPdom(pdom, function(pd) {
    if (Array.from(phantomTags).includes(pd.tag)) {
      return unwrapPdom(pd)
    }
  })

// <Component attrs styles props />
// becomes
// <div attrs styles>
//   <Component props />
// </div>
const wrapComponentsSoTheyOnlyHaveProps = pdom =>
  foreachPdom(pdom, function(pd) {
    if (pdom_tag_is_component(pd.tag)) {
      return assert(() =>
        _l.every(
          Array.from(_l.keys(pd)).map(
            k => pd[k] == null || ['tag', 'props', 'children'].includes(k)
          )
        )
      )
    }
  })

// IMPORTANT: This function can throw. See evalPdomForInstance
defaultExport.evalInstanceBlock = evalInstanceBlock = (block, compilerOpts) =>
  evalPdomForInstance(
    block.toPdom(compilerOpts),
    compilerOpts.getCompiledComponentByUniqueKey,
    block.doc.export_lang,
    block.width
  )

// IMPORTANT: This function can throw. The caller is responsible for catching and handling errors
defaultExport.evalPdomForInstance = evalPdomForInstance = (
  pdom,
  getCompiledComponentByUniqueKey,
  language,
  page_width //# FIXME: Need better errors
) =>
  // for the toplevel, use all the static values, even if they're fake, since this is for the editor
  evalPdom(
    pdomDynamicableToPdomStatic(pdom),
    getCompiledComponentByUniqueKey,
    language,
    page_width
  )

//# Doc to BlockTree

defaultExport.componentBlockTreesOfDoc = componentBlockTreesOfDoc = (
  doc // use the cached value if doc is in readonly mode
) => doc.getComponentBlockTrees()
// component_subtrees_of_block_tree(blocklist_to_blocktree(doc.blocks))

defaultExport.component_subtrees_of_block_tree = component_subtrees_of_block_tree = function(
  blockTree
) {
  const MultistateBlock = require('./blocks/multistate-block')
  const ScreenSizeBlock = require('./blocks/screen-size-block')
  const ArtboardBlock = require('./blocks/artboard-block')

  // components are top level Artboards or Multistate Groups
  return blockTree.children.filter(
    tree =>
      tree.block instanceof MultistateBlock ||
      tree.block instanceof ArtboardBlock ||
      tree.block instanceof ScreenSizeBlock
  )
}

const blocktree_from_unordered_block_list = block_list =>
  blocklist_to_blocktree(Block.sortedByLayerOrder(block_list))

// blocklist_to_blocktree :: [Block] -> BlockTree
// The input is in z-index layer order from back (first element) to front (last element)
// The "parent" of a block is the block closest behind it which is fully containing it in its content subregion
// The parent *must* fully contain the child, and contain the child entirely in its content subregion
// The parent must be behind the child, which is why we care about ordering.  If the parent weren't behind the
//   child, it would be covering the child, so the child would not appear inside it.
// The parent must be the closest (z-index) container behind the child, so there is an unambiguous parent.  Without
//   this constraint, a block's parent, grandparent, and great* grand-parents could all be valid parents.
// Returns a tree where each node represents a block (stored in .block), and for every node N, N's parent's .block
//   is the parent of N's .block.
// HOWEVER, there may be multiple roots of this tree.  Consider the case where there are several independent blocks
//   side-by-side with no parent.  For this reason we return a fake root node, which has no block, which is the parent
//   of all the actual tree roots we find when
// Fun note: we've been using this as an interview question.
defaultExport.blocklist_to_blocktree = blocklist_to_blocktree = function(
  block_list
) {
  const root = { children: [] }

  // order is important: we add the blocks from back to front so we can guarantee that when we're adding a
  // block, its real parent will already be in the tree.  A parent must be behind its children.  By going
  // back to front, by the time we see a block, we will have already seen all of its possible parents.
  // This relies on the block_list being in sorted order by z-index from back (start of list) to front
  // (end of list).
  for (let block of Array.from(block_list)) {
    find_deepest_matching_blocktree_node(root, block).children.push({
      block,
      children: [],
    })
  }

  return root
}

var find_deepest_matching_blocktree_node = function(tree, block) {
  for (let i = tree.children.length - 1; i >= 0; i--) {
    // by -1 makes it iterate in reverse order

    const child = tree.children[i]
    const contentSubregion = child.block.getContentSubregion()

    if (
      contentSubregion !== null &&
      // inlined Block.contains(contentSubregion, block) for performance
      contentSubregion.top <= block.top &&
      contentSubregion.left <= block.left &&
      contentSubregion.top + contentSubregion.height >=
        block.top + block.height &&
      contentSubregion.left + contentSubregion.width >= block.left + block.width
    ) {
      return find_deepest_matching_blocktree_node(child, block)
    } else if (
      // inlined child.block.overlaps(block) for performance
      child.block.top < block.top + block.height &&
      child.block.left < block.left + block.width &&
      child.block.left + child.block.width > block.left &&
      child.block.top + child.block.height > block.top
    )
      break
  }

  // else
  return tree
}

// assert -> nonperformant_blockList_to_blockTree == blocklist_to_blocktree
const _nonperformant_blocklist_to_blocktree = function(block_list) {
  var find_deepest_matching = function(tree, pred) {
    for (let i = tree.children.length - 1; i >= 0; i--) {
      // by -1 makes it iterate in reverse order
      const child = tree.children[i]
      switch (pred(child)) {
        case 'recurse':
          return find_deepest_matching(child, pred)
          break
        case 'break':
          return tree
          break
        case 'continue':
          continue
          break
      }
    }
    // else
    return tree
  }

  const root = { children: [] }

  // order is important: we add the blocks from back to front so we can guarantee that when we're adding a
  // block, its real parent will already be in the tree.  A parent must be behind its children.  By going
  // back to front, by the time we see a block, we will have already seen all of its possible parents.
  // This relies on the block_list being in sorted order by z-index from back (start of list) to front
  // (end of list).
  for (var block of Array.from(block_list)) {
    const parent = find_deepest_matching(root, function(child) {
      const contentSubregion = child.block.getContentSubregion()
      if (contentSubregion != null && Block.contains(contentSubregion, block)) {
        return 'recurse'
      } else if (child.block.overlaps(block)) {
        return 'break'
      } else {
        return 'continue'
      }
    })
    parent.children.push({ block, children: [] })
  }

  return root
}

const visible_blocks = function(blocks, side) {
  // TODO change tree to be a linear array-encoded tree
  const ranges_overlap = (range_a, range_b) =>
    range_a.start <= range_b.end && range_b.start <= range_a.end
  const range_includes_subrange = (range, subrange) =>
    range.start <= subrange.start && range.end >= subrange.end

  const make_range_tree = function(sorted_ranges) {
    var _make_range_tree = function(ranges, start, end) {
      if (end - start === 1) {
        return {
          range: { start: ranges[start][0], end: ranges[start][1] },
          leaf: true,
          visible: true,
        }
      }
      const left = _make_range_tree(
        ranges,
        start,
        Math.floor((start + end) / 2)
      )
      const right = _make_range_tree(ranges, Math.floor((start + end) / 2), end)
      return {
        range: { start: left.range.start, end: right.range.end },
        left,
        right,
        leaf: false,
        visible: true,
      }
    }
    if (sorted_ranges.length === 0) {
      return {}
    }
    return _make_range_tree(sorted_ranges, 0, sorted_ranges.length)
  }

  // :: (range_tree, range) -> [boolean, range_tree]
  var block_off_ranges_from_block = function(range_tree, block_range) {
    if (!range_tree.visible) {
      return [false, range_tree]
    }
    if (range_tree.leaf) {
      if (range_includes_subrange(block_range, range_tree.range)) {
        return [true, _l.extend(range_tree, { visible: false })]
      }
      return [false, range_tree]
    }

    const block_off_subtree = function(side) {
      if (range_includes_subrange(block_range, range_tree[side].range)) {
        return [
          range_tree[side].visible,
          _l.extend(range_tree[side], { visible: false }),
        ]
      } else if (ranges_overlap(range_tree[side].range, block_range)) {
        return block_off_ranges_from_block(range_tree[side], block_range)
      } else {
        return [false, range_tree[side]]
      }
    }

    const [left_visibility, new_left_child] = Array.from(
      block_off_subtree('left')
    )
    const [right_visibility, new_right_child] = Array.from(
      block_off_subtree('right')
    )

    return [
      left_visibility || right_visibility,
      _l.extend(range_tree, {
        left: new_left_child,
        right: new_right_child,
        visible: new_left_child.visible || new_right_child.visible,
      }),
    ]
  }

  const sorted_unique = function(arr) {
    const copy = arr.slice()
    for (let i = 0; i < arr.length; i++) {
      const x = arr[i]
      if (i < arr.length - 1 && arr[i + 1] === arr[i]) {
        copy[i] = undefined
      }
    }
    return _l.compact(copy)
  }

  const _visible_blocks = function(blocks, side, ordering, opposite_direction) {
    const { blockStart, blockEnd } = layoutAttrsForAxis(opposite_direction)
    const sorted_endpoints = sorted_unique(
      _l.sortBy(_l.flatMap(blocks, b => [b[blockStart], b[blockEnd]]))
    )
    const ranges = _l.compact(
      sorted_endpoints.map(function(e, i) {
        if (i === 0 && sorted_endpoints.length > 1) {
          return [e, sorted_endpoints[1]]
        } else if (i < sorted_endpoints.length - 1) {
          return [e + 1, sorted_endpoints[i + 1]]
        }
      })
    )
    let tree = make_range_tree(ranges)
    const sorted_blocks = _l.sortBy(blocks, side, ordering)
    const visibility = sorted_blocks.map(function(block) {
      let visible
      ;[visible, tree] = Array.from(
        block_off_ranges_from_block(tree, {
          start: block[blockStart],
          end: block[blockEnd],
        })
      )
      return { block, visible }
    })
    return visibility.filter(x => x.visible).map(x => x.block)
  }

  switch (side) {
    case 'top':
      return _visible_blocks(blocks, 'top', 'asc', 'horizontal')
    case 'left':
      return _visible_blocks(blocks, 'left', 'asc', 'vertical')
    case 'right':
      return _visible_blocks(blocks, 'right', 'desc', 'vertical')
    case 'bottom':
      return _visible_blocks(blocks, 'bottom', 'desc', 'horizontal')
  }
}

//# Slicing algorithm (!!)
// slice2D :: [BlockTree] -> int -> int -> 2DSlice Block

// Returns a set of groups. A group is a set of blocks that are all glued together.
// The (getStart, getEnd) parameters determine whether we will slice horizontally
// or vertically. The (ranges, startOffset) parameters determine whether what
// portion of the blocks to slice.
//
// slice1D :: ((A -> int), (A -> int)) -> ([A], int) -> [Slice [A]]
defaultExport.slice1D = slice1D = (getStart, getEnd) =>
  function(ranges, startOffset, negative_margins) {
    if (negative_margins == null) {
      negative_margins = false
    }
    const groups = []
    let currentGroup = null

    // iterate through ranges sorted by start
    for (let range of Array.from(
      ranges.slice().sort((a, b) => getStart(a) - getStart(b))
    )) {
      // if the range is outside the previous group, start a new group
      if (
        currentGroup === null ||
        getStart(range) >= currentGroup.end ||
        negative_margins
      ) {
        currentGroup = {
          contents: [range],
          start: getStart(range),
          end: getEnd(range),
        }
        groups.push(currentGroup)

        // if the range intersects the previous group, add it in
      } else {
        currentGroup.contents.push(range)
        currentGroup.end = Math.max(currentGroup.end, getEnd(range))
      }
    }

    // annotate margin and length information
    for (
      let i = 0, end = groups.length, asc = 0 <= end;
      asc ? i < end : i > end;
      asc ? i++ : i--
    ) {
      const group = groups[i]
      const previousEnd = i === 0 ? startOffset : groups[i - 1].end

      group.margin = group.start - previousEnd
      group.length = group.end - group.start
    }

    return groups
  }

const sliceVertically = slice1D(
  b => b.block.top,
  b => b.block.top + b.block.height
)
const sliceHorizontally = slice1D(
  b => b.block.left,
  b => b.block.left + b.block.width
)

// slice2D :: [Tree A] -> 2DSlice A
var slice2D = (
  blockTreeList,
  topOffset,
  leftOffset,
  negative_margins = null // TODO: parameterize so we can chose to go horizontally first, or just try going horizontally first
) => ({
  direction: 'vertical',
  block: null,

  slices: mapSlice(
    sliceVertically(blockTreeList, topOffset, negative_margins === 'vertical'),
    section => ({
      direction: 'horizontal',
      block: null,

      slices: mapSlice(
        sliceHorizontally(
          section.contents,
          leftOffset,
          negative_margins === 'horizontal'
        ),
        function(column) {
          const group = column.contents

          const single_node = group.length === 1 ? group[0] : undefined

          if (
            single_node &&
            single_node.block.top === section.start &&
            single_node.block.bottom === section.end
          ) {
            // if container.top != section.start, there's space above it that another
            // run through the slicing algorithm will take care of.  Left doesn't
            // have this problem because we just did horizontal slicing.

            if (_l.isEmpty(single_node.children)) {
              // we found a leaf block.  Return it
              return {
                direction: 'vertical',
                block: single_node.block,
                slices: [],
              }
            } else {
              // we found a block that has other blocks in it
              // recurse in its child region
              const subregion = single_node.block.getContentSubregion()
              const subslice = slice2D(
                single_node.children,
                subregion.top,
                subregion.left
              )
              subslice.block = single_node.block
              return subslice
            }
          } else if (group.length === blockTreeList.length) {
            // If after attempting slicing we haven't made progress, we can't render the configuration of blocks
            // into rows/columns.  Instead make them position:absolute inside a position:relative container. For
            // the slicing algorithm's type signature to work, we group them into a single unioned block that we
            // return as the block for the layer.  The position:relative container is called an AbsoluteBlock.

            const blocks = _l.map(blockTreeList, 'block')

            // Earlier slicings may reorder the treeLists because slice1D() sorts by start point.
            const ordered_absoluted_blocks = Block.treeListSortedByLayerOrder(
              blockTreeList
            )

            if (config.negative_margins) {
              const subgroups = group_block_trees(blockTreeList)
              // FIXME: Subgroup reconciliation for running resolution with multiple subgroups
              if (subgroups.length === 1) {
                const resolved = resolve_block_group(subgroups[0])
                if (resolved.negative_margins) {
                  return slice2D(
                    resolved.group,
                    section.start,
                    column.start,
                    resolved.negative_margins
                  )
                }
              }
            }

            const errorBlock = config.flex_absolutes
              ? new AbsoluteBlock(ordered_absoluted_blocks, {
                  name: `abs-${_l
                    .map(blockTreeList, 'block.uniqueKey')
                    .sort()
                    .join('-')}`,
                  top: section.start,
                  left: column.start,
                  height: section.length,
                  width: column.length,

                  flexWidth: _l.some(
                    blocks,
                    b => b.flexWidth || b.flexMarginLeft || b.flexMarginRight
                  ),
                  flexHeight: _l.some(
                    blocks,
                    b => b.flexHeight || b.flexMarginTop || b.flexMarginBottom
                  ),
                  flexMarginTop: _l.some(
                    visible_blocks(blocks, 'top'),
                    'flexMarginTop'
                  ),
                  flexMarginRight: _l.some(
                    visible_blocks(blocks, 'right'),
                    'flexMarginRight'
                  ),
                  flexMarginBottom: _l.some(
                    visible_blocks(blocks, 'bottom'),
                    'flexMarginBottom'
                  ),
                  flexMarginLeft: _l.some(
                    visible_blocks(blocks, 'left'),
                    'flexMarginLeft'
                  ),
                })
              : new AbsoluteBlock(ordered_absoluted_blocks, {
                  name: `abs-${_l
                    .map(blockTreeList, 'block.uniqueKey')
                    .sort()
                    .join('-')}`,
                  top: section.start,
                  left: column.start,
                  height: section.length,
                  width: column.length,
                })
            return { direction: 'vertical', block: errorBlock, slices: [] }
          } else {
            // made progress slicing; keep recursing
            return slice2D(group, section.start, column.start)
          }
        }
      ),
    })
  ),
})

defaultExport.blockTreeToSlices = blockTreeToSlices = function(
  blockTree,
  chaos
) {
  // intercept if chaos
  if (chaos == null) {
    chaos = false
  }
  if (chaos) {
    return chaoticSliceAllAbsolutes(blockTree)
  }

  let subregion = blockTree.block.getContentSubregion()
  assert(() => !(subregion === null && !_l.isEmpty(blockTree.children)))
  if (subregion == null) {
    subregion = { top: 0, left: 0 }
  } // dummy values so we don't throw if the block can't contain children

  //# toplevel caller for slice2D
  const slices = slice2D(blockTree.children, subregion.top, subregion.left)
  assert(() => slices.block === null)
  slices.block = blockTree.block
  return slices
}

var chaoticSliceAllAbsolutes = function(blockTree) {
  const blocks = blocks_from_block_tree(blockTree)

  if (blocks.length === 1) {
    return { direction: 'vertical', block: blocks[0], slices: [] }
  }

  const page_geometry = Block.unionBlock(blocks)
  const ordered_absoluted_blocks = blocks.map(block => ({
    block,
    children: [],
  }))
  const errorBlock = new AbsoluteBlock(ordered_absoluted_blocks, {
    name: `abs-${_l
      .map(ordered_absoluted_blocks, 'block.uniqueKey')
      .sort()
      .join('-')}`,
    top: page_geometry.top,
    left: page_geometry.left,
    height: page_geometry.height,
    width: page_geometry.width,
  })
  return { direction: 'vertical', block: errorBlock, slices: [] }
}

//# Layout Engine: Slices to pdom

// slicesToVirtualPdom :: (2DSlice Block, Int, Int) -> Virtual Pdom
//
// This method takes in slices from Slice2D and returns a virtual Pdom
//
// A virtual Pdom is a non-reactive Pdom that only has virtual widths and heights
// for all divs. These virtual lengths will later be translated to real html
// lengths taking the flex constraints into account in enforceConstraints
//
// The virtual Pdom has no notion of margins/padding. slicesToVirtualPdom will create
// a spacerDiv to simulate all margins/padding. This means that a horizontal slice containing 2 blocks
// will actually return 5 divs: spacerDiv, Block, spacerDiv, Block, spacerDiv
var slicesToVirtualPdom = function(
  { direction, block, slices },
  width,
  height
) {
  // Fixme: direction should probably be named "childrenAxis" or the like
  let left
  const pdom = {
    tag: 'div',
    direction,
    backingBlock: block,
    vWidth: width,
    vHeight: height,
  }

  // If we have a backing Block, our geometry is specified completely by it.
  if (block != null) {
    assert(() => block.width === width && block.height === height)
  }

  // If we have a block with a content subregion, use its size as the children's container's width.
  // If we don't have a block, use our size, which is just {width, height}.
  // If we have a block that doesn't have a content subregion, it shouldn't have children, so this shouldn't matter.
  const subregion =
    (left = block != null ? block.getContentSubregion() : undefined) != null
      ? left
      : { width, height }

  // Adds one spacer div before each slice
  pdom.children = []
  slices.forEach(function(slice) {
    const [slice_width, slice_height] = Array.from(
      (() => {
        if (direction === 'vertical') {
          return [subregion.width, slice.length]
        } else if (direction === 'horizontal') {
          return [slice.length, subregion.height]
        } else {
          throw new Error('unknown direction')
        }
      })()
    )

    if (slice.margin >= 0) {
      pdom.children.push(spacerDiv(direction, slice.margin))
    }
    if (slice.margin < 0) {
      pdom.children.push(marginDiv(direction, slice.margin))
    }
    return pdom.children.push(
      slicesToVirtualPdom(slice.contents, slice_width, slice_height)
    )
  })

  // Calculates the remaining space so we can add the last spacerDiv
  if (!_l.isEmpty(pdom.children)) {
    const { length, vLength } = layoutAttrsForAxis(direction)
    const container_length =
      (subregion != null ? subregion[length] : undefined) != null
        ? subregion != null
          ? subregion[length]
          : undefined
        : pdom[vLength]
    const remaining_space = container_length - _l.sumBy(pdom.children, vLength)
    pdom.children.push(spacerDiv(direction, remaining_space))
  }

  return pdom
}

// An alternative to addConstraints.  Turns off flex in the whole subtree.
const force_no_flex = root_pdom =>
  foreachPdom(
    root_pdom,
    pd =>
      (pd.horizontalLayoutType = pd.verticalLayoutType = _l.isEmpty(pd.children)
        ? 'fixed'
        : 'content')
  )

// Constraint propagation algorithm
// The user decides which blocks have fixed/flexible width and margins.
// This method will then figure out which other divs also need fixed/flexible
// geometries so the constraints will work as expected.
//
// Modifies Pdom in place. (Pdom) -> ()
const addConstraints = function(root_pdom) {
  // Pull constraints from backingBlocks into the pdom
  let lt, pd
  foreachPdom(root_pdom, function(pdom) {
    if (pdom.backingBlock != null) {
      _l.extend(pdom, _l.pick(pdom.backingBlock, constraintAttrs))
      pdom.horizontalLayoutType = pdom.backingBlock.flexWidth
        ? 'flex'
        : 'content'
      return (pdom.verticalLayoutType = pdom.backingBlock.flexHeight
        ? 'flex'
        : 'content')
    }
  })

  const parent_map = new Map(
    _l.flatten(
      Array.from(flattenedPdom(root_pdom)).map(parent =>
        (() => {
          const result = []
          for (let child of Array.from(parent.children)) {
            result.push([child, parent])
          }
          return result
        })()
      )
    )
  )
  const parent_of_pdom = pdom => parent_map.get(pdom)
  const grandparent_of_pdom = pdom => parent_of_pdom(parent_of_pdom(pdom))

  // If there is a flexMarginLeft at the left edge of a row and we are about to give flexWidth to a spacerDiv of length 0,
  // give flexMarginLeft to the grandpa instead (assuming parent and grandpa don't have backingBlocks to override us). This ensures flexMargins
  // keeps things aligned in the page even when some blocks are wrapped by the slicing algorithm in more divs than others. We always try to put flexMargins in
  // the outermost non backingBlock div, so this step is responsible for bubbling that up.
  // FIXME: this is very specific right now and it only happens in certain scenarios caused by our slicing algorithm. If slicing changes
  // this will likely noop.
  // NOTE: Sometimes a user can click flex margin left and we do not do anything (imagine a spacerDiv with vLength 0 next to a div with flexWidth set).
  // Our goal is for that not to happen. The below code doesn't guarantee that won't happen in all cases but it should strictly decrease the # of cases that happens
  foreachPdom(root_pdom, function(pdom) {
    if (_l.isEmpty(pdom.children)) {
      return
    }
    if ((grandparent_of_pdom(pdom) != null) === false) {
      return
    }
    assert(() => pdom.children.length >= 3)

    assert(() => grandparent_of_pdom(pdom).direction === pdom.direction)
    assert(
      () => parent_of_pdom(pdom).direction === otherDirection(pdom.direction)
    )

    // Bubble up flex before/after to grandparents
    const { flexMarginBefore, flexMarginAfter, vLength } = layoutAttrsForAxis(
      pdom.direction
    )
    const last = pdom.children.length - 1
    return (() => {
      const result1 = []
      for (let [flexMargin, child, sibling] of [
        [flexMarginBefore, pdom.children[1], pdom.children[0]],
        [flexMarginAfter, pdom.children[last - 1], pdom.children[last]],
      ]) {
        if (
          child[flexMargin] &&
          sibling[vLength] === 0 &&
          (pdom.backingBlock != null) === false &&
          (parent_of_pdom(pdom).backingBlock != null) === false
        ) {
          parent_of_pdom(pdom)[flexMargin] = true
          result1.push((child[flexMargin] = false))
        } else {
          result1.push(undefined)
        }
      }
      return result1
    })()
  })

  // Add constraints related to flex margins
  foreachPdom(root_pdom, function(pdom) {
    // This must be called before removing any spacer divs since it assumes that every
    // non spacer div is surrounded by two spacer divs
    let child, i
    let { flexMarginBefore, flexMarginAfter, layoutType } = layoutAttrsForAxis(
      pdom.direction
    )
    assert(() =>
      _.all(
        (() => {
          const result1 = []
          for (let i = 0; i < pdom.children.length; i++) {
            const child = pdom.children[i]
            if (child.backingBlock != null) {
              result1.push(i % 2 === 1)
            }
          }
          return result1
        })()
      )
    )
    assert(() =>
      _.all(
        (() => {
          const result1 = []
          for (let i = 0; i < pdom.children.length; i++) {
            const child = pdom.children[i]
            if (child[flexMarginBefore] || child[flexMarginAfter]) {
              result1.push(i % 2 === 1)
            }
          }
          return result1
        })()
      )
    )
    assert(() =>
      _.all(
        (() => {
          const result1 = []
          for (let i = 0; i < pdom.children.length; i++) {
            const child = pdom.children[i]
            result1.push(
              (child.spacerDiv === true || child.marginDiv === true) ===
                (i % 2 === 0)
            )
          }
          return result1
        })()
      )
    )

    // LAYOUT SYSTEM 1.0: 2.3) "When margins disagree, flexible wins against content."
    for (i = 0; i < pdom.children.length; i++) {
      child = pdom.children[i]
      if (child[flexMarginBefore]) {
        pdom.children[i - 1][layoutType] = 'flex'
      }
    }
    for (i = 0; i < pdom.children.length; i++) {
      child = pdom.children[i]
      if (child[flexMarginAfter]) {
        pdom.children[i + 1][layoutType] = 'flex'
      }
    }

    if (pdom.backingBlock == null) {
      // we are a slice and we are flexible if any of our recursive children are flexible
      for (var lt of ['horizontalLayoutType', 'verticalLayoutType']) {
        pdom[lt] = _.any(pdom.children, c => c[lt] === 'flex')
          ? 'flex'
          : 'content'
      }

      // NOTE: the lines below assume we are the opposite direction as our children.
      assert(() =>
        _.all(
          (() => {
            const result1 = []
            for (child of Array.from(pdom.children)) {
              result1.push(pdom.direction === otherDirection(child.direction))
            }
            return result1
          })()
        )
      )

      // If any of our children have a flex margin we get that flex margin as well
      ;({ flexMarginBefore, flexMarginAfter } = layoutAttrsForAxis(
        otherDirection(pdom.direction)
      ))
      return [flexMarginBefore, flexMarginAfter].map(
        fm => (pdom[fm] = pdom[fm] || _.any(pdom.children, fm))
      )
    }
  })

  foreachPdom(root_pdom, function(pdom) {
    const {
      flexMarginBefore,
      flexMarginAfter,
      layoutType,
    } = layoutAttrsForAxis(pdom.direction)
    assert(() =>
      _.all(
        (() => {
          const result1 = []
          for (let i = 0; i < pdom.children.length; i++) {
            const child = pdom.children[i]
            if (child[flexMarginBefore]) {
              result1.push((pdom.children[i - 1][layoutType] = 'flex'))
            }
          }
          return result1
        })()
      )
    )
    return assert(() =>
      _.all(
        (() => {
          const result1 = []
          for (let i = 0; i < pdom.children.length; i++) {
            const child = pdom.children[i]
            if (child[flexMarginAfter]) {
              result1.push((pdom.children[i + 1][layoutType] = 'flex'))
            }
          }
          return result1
        })()
      )
    )
  })

  // Make sure every div has flex or not flex set
  for (pd of Array.from(flattenedPdom(root_pdom))) {
    for (lt of ['horizontalLayoutType', 'verticalLayoutType']) {
      assert(() => pd[lt] != null)
    }
  }

  // A backing block has a lot of say over whether its children are flexible or not
  for (lt of ['horizontalLayoutType', 'verticalLayoutType']) {
    // LAYOUT SYSTEM 1.0: Here we enforce 2.2
    // "If a parent backing block says it's content on some axis, we'll force all children to be content as well."
    // TODO: If this does anything, we should probably let the user know one of their settings is being overridden
    var propagateNotFlex = function(pdom) {
      if (pdom.backingBlock != null && pdom[lt] !== 'flex') {
        // Make the entire subtree not flexible on fl
        return foreachPdom(pdom, pd => (pd[lt] = 'content'))
      } else {
        return pdom.children.forEach(child => propagateNotFlex(child))
      }
    }

    propagateNotFlex(root_pdom)

    // LAYOUT SYSTEM 1.0: Here we enforce 2.1
    // And if a backing block says it is flexible on some axis, we force at least
    // one of its children (the last if none of them are) to be flexible
    foreachPdom(root_pdom, function(pd) {
      if (
        pd[lt] === 'flex' &&
        !_l.isEmpty(pd.children) &&
        !_.any(pd.children, c => c[lt] === 'flex')
      ) {
        return (pd.children[pd.children.length - 1][lt] = 'flex')
      }
    })
  }

  return (() => {
    const result1 = []
    for (pd of Array.from(flattenedPdom(root_pdom))) {
      if (_l.isEmpty(pd.children)) {
        result1.push(
          (() => {
            const result2 = []
            for (lt of ['horizontalLayoutType', 'verticalLayoutType']) {
              if (pd[lt] === 'content') {
                result2.push((pd[lt] = 'fixed'))
              } else {
                result2.push(undefined)
              }
            }
            return result2
          })()
        )
      } else {
        result1.push(undefined)
      }
    }
    return result1
  })()
}

//# enforceConstraints lowers a VPDom into a Pdom

const enforceConstraintsUsingFlexbox = function(pd) {
  foreachPdom(pd, function(pdom) {
    let child
    const { children } = pdom

    if (pdom.horizontalLayoutType === 'fixed') {
      pdom.width = pdom.vWidth
    }
    if (pdom.verticalLayoutType === 'fixed') {
      pdom.height = pdom.vHeight
    }

    // If we have children, we must become a flex container and
    // we will have our geometry set by our children
    if (pdom.children.length > 0) {
      pdom.display = 'flex'
      pdom.flexDirection = (() => {
        switch (pdom.direction) {
          case 'vertical':
            return 'column'
          case 'horizontal':
            return 'row'
          default:
            throw new Error('unknown direction')
        }
      })()
    }

    // Flexbox default so we don't explicitly set it. Make all items stretch in the cross axis
    // unless they have a fixed length
    // pdom.alignItems = 'stretch'
    if (pdom.direction === 'vertical') {
      for (child of Array.from(pdom.children)) {
        child.flexShrink = '0'
      }
    }

    const { layoutType, length, vLength } = layoutAttrsForAxis(pdom.direction)

    // LAYOUT SYSTEM 1.0: Here we enforce 1.1)
    // "Flexible length: I'll grow with my parent proportionally to how big I am."
    //
    // SOFTMAX (kind of...)
    // Set percentage lengths for everything flexible
    // available_length = How much fixed length is available in pdom
    //
    // NOTE: This essentially assumes that everyone who matters for calculating my % growth is a sibling
    // This is sometimes an over simplification but right now our slicing algorithm guarantees this reasonably well
    // (plus our spec is not that well defined for how much each margin should grow % wise so we're fine kinda)
    // Another possibility is to say margins and lengths in different levels of the DOM tree should influence my % growth.
    // In order to do this correctly we'd have to change the flexBasis below to not be 0 in all cases
    const available_length =
      pdom[vLength] -
      _l.sumBy(children, function(c) {
        switch (c[layoutType]) {
          case 'flex':
            return 0
          case 'fixed':
            return c[vLength]
          case 'content':
            return c[vLength]
          default:
            throw new Error('Invalid layout type')
        }
      })

    for (child of Array.from(children)) {
      // ratio = 1 in the 0/0 case (0 length spacerDiv flexible)
      if (child[layoutType] === 'flex') {
        const ratio =
          available_length > 0 ? child[vLength] / available_length : 1
        child.flexGrow = String(ratio)

        // The following line essentially says that if two siblings have the same flexGrow,
        // they will have the same final length per the flex formula:
        // finalLength = myFlexBasis + myFlexGrow * availableSpaceLeft / (total flexGrow of me and my siblings)
        //
        // We do this in order to guarantee content == layout
        // This is equivalent to using percent widths and heights except flexbox is nicer and doesn't
        // ask us to explicitly define widths and heights in the whole DOM tree
        child.flexBasis = 0

        // LAYOUT SYSTEM 1.0: Here we enforce 1.2)
        // "In the flexible case, my min-length is the length of my non-flexible content"
        // FIXME TECH DEBT: Browsers do this by default with width but not with height, so we do it explicitly here.
        // NOTE: a childless element doesnt need this since it specifies its own content. Doing this for childless elements
        // also introduces a weird bug where images break when they have flex set
        if (!_l.isEmpty(child.children)) {
          child.minHeight = 'fit-content'
        }
      }
    }

    // LAYOUT SYSTEM 1.0: Here we enforce 1.4)
    // "In a case like a simple rectangle with no children inside (or a non flexible margin), its content is just a fixed
    // geometry. In that case we get behavior analogous to "fixed"."
    //
    // In the content case, the child might have length = 100px (fixed case)
    // but we still have to set flexShrink = '0' on the main flexbox axis
    // for otherwise flexbox might shrink this child despite the explicit geometry
    return (() => {
      const result = []
      for (child of Array.from(children)) {
        if (child[layoutType] === 'fixed') {
          result.push((child.flexShrink = '0'))
        }
      }
      return result
    })()
  })

  // Components have to expand to whatever environment they're in, so we flexGrow 1 the toplevel div
  return (pd.flexGrow = '1')
}

//# NOTE: Deprecated
const enforceConstraintsUsingTables = function(pd) {
  var _enforceConstraints = function(pdom) {
    const { children } = pdom

    // LAYOUT SYSTEM 1.0: Here we enforce 1.4)
    // "In a case like a simple rectangle with no children inside (or a non flexible margin), its content is just a
    // fixed geometry. In that case we get behavior analogous to "fixed"."
    if (_l.isEmpty(children)) {
      // Only in the no children case we actually convert vLengths to
      // real html lengths.
      if (pdom.horizontalLayoutType !== 'flex') {
        pdom.widthAttr = pdom.vWidth
      }
      if (pdom.verticalLayoutType !== 'flex') {
        pdom.heightAttr = pdom.vHeight
      }
    }

    children.forEach(_enforceConstraints)

    const { layoutType, flexLength, length, vLength } = layoutAttrsForAxis(
      pdom.direction
    )

    // LAYOUT SYSTEM 1.0: Here we enforce 1.1)
    // "Flexible length: I'll grow with my parent proportionally to how big I am."
    //
    // SOFTMAX (kind of...)
    // Set percentage lengths for everything flexible
    // available_length = How much fixed length is available in pdom
    //
    // NOTE: This essentially assumes that everyone who matters for calculating my % growth is a sibling
    // This is sometimes an over simplification but right now our slicing algorithm guarantees this reasonably well
    // (plus our spec is not that well defined for how much each margin should grow % wise so we're fine kinda)
    // Another possibility is to say margins and lengths in different levels of the DOM tree should influence my % growth.
    // In order to do this correctly we'd have to change the flexBasis below to not be 0 in all cases
    const available_length =
      pdom[vLength] -
      _l.sumBy(children, function(c) {
        switch (c[layoutType]) {
          case 'flex':
            return 0
          case 'fixed':
            return c[vLength]
          case 'content':
            return c[vLength]
          default:
            throw new Error('Invalid layout type')
        }
      })

    return (() => {
      const result = []
      for (let child of Array.from(children)) {
        // ratio = 1 in the 0/0 case (0 length spacerDiv flexible)
        if (child[layoutType] === 'flex') {
          const ratio =
            available_length > 0 ? child[vLength] / available_length : 1
          result.push((child[length + 'Attr'] = pct(ratio)))
        }
      }
      return result
    })()
  }

  _enforceConstraints(pd)

  // Here we create the tables
  pd = mapPdom(pd, function(pdom) {
    let children
    if (_l.isEmpty(pdom.children)) {
      return pdom
    }

    const wrapWithTable = children => ({
      tag: 'table',
      borderCollapse: 'collapse',
      children: [{ tag: 'tbody', children }],
    })

    if (pdom.direction === 'vertical') {
      children = pdom.children.map(c => ({
        tag: 'tr',
        children: [_l.extend({}, c, { tag: 'td' })],
      }))
    } else if (pdom.direction === 'horizontal') {
      children = [
        {
          tag: 'tr',
          children: pdom.children.map(c => _l.extend({}, c, { tag: 'td' })),
        },
      ]
    } else {
      throw new Error('unknown direction')
    }

    return _l.extend({}, pdom, { children: [wrapWithTable(children)] })
  })

  // Give flex to tables that need it
  foreachPdom(pd, function(pdom) {
    if (
      pdom.horizontalLayoutType === 'flex' &&
      (pdom.children[0] != null ? pdom.children[0].tag : undefined) === 'table'
    ) {
      pdom.children[0].widthAttr = '100%'
    }
    if (
      pdom.verticalLayoutType === 'flex' &&
      (pdom.children[0] != null ? pdom.children[0].tag : undefined) === 'table'
    ) {
      return (pdom.children[0].heightAttr = '100%')
    }
  })

  foreachPdom(pd, function(pdom) {
    if (_l.isEmpty(pdom.children) && pdom.tag === 'td') {
      // TextBlock renderHTML will remove the width given below in the contentDeterminesWidth case
      // so we add whiteSpace nowrap to ensure the text wont wrap when in auto width
      if (
        pdom.backingBlock != null
          ? pdom.backingBlock.contentDeterminesWidth
          : undefined
      ) {
        pdom.whiteSpace = 'nowrap'
      }

      pdom.children = [
        { tag: 'div', backingBlock: pdom.backingBlock, children: [] },
      ]
      if (pdom.verticalLayoutType !== 'flex') {
        pdom.children[0].height = pdom.vHeight
      }
      if (pdom.horizontalLayoutType !== 'flex') {
        pdom.children[0].width = pdom.vWidth
      }
      return delete pdom.backingBlock
    }
  })

  // tds have padding by default, remove that
  return foreachPdom(pd, function(pdom) {
    if (pdom.tag === 'td') {
      return (pdom.padding = 0)
    }
  })
}

const enforceConstraints = config.tablesEverywhere
  ? enforceConstraintsUsingTables
  : enforceConstraintsUsingFlexbox

var remove_margin_divs = function(pdom) {
  if (pdom.direction != null) {
    const { length, vLength, marginAfter } = layoutAttrsForAxis(pdom.direction)
    pdom.children.forEach(function(child, i) {
      if (child.marginDiv && child[vLength] < 0) {
        assert(() => i > 0)
        return (pdom.children[i - 1][marginAfter] = child[vLength])
      }
    })
    _l.remove(pdom.children, c => c.marginDiv)
  }
  return pdom.children.forEach(remove_margin_divs)
}

const remove_vdom_attrs = pdom =>
  foreachPdom(pdom, pd =>
    (() => {
      const result = []
      for (let attr of Array.from(specialVPdomAttrs.concat(constraintAttrs))) {
        if (config.debugPdom) {
          pd[`data-${attr}Attr`] = pd[attr]
        }
        result.push(delete pd[attr])
      }
      return result
    })()
  )

//# Mount pdom by "render"-ing Blocks into it

var deepMountBlocksForEditor = function(div, options) {
  assert(() => valid_compiler_options(options))

  // Postorder traversal so Block.renderHTML sees valid children
  div.children.forEach(div => deepMountBlocksForEditor(div, options))
  return __guardMethod__(div.backingBlock, 'renderHTML', o =>
    o.renderHTML(div, options)
  )
}

var deepMountBlocks = function(div, options) {
  assert(() => valid_compiler_options(options))

  // Postorder traversal so Block.renderHTML sees valid children
  div.children.forEach(div => deepMountBlocks(div, options))

  if (
    !_l.isEmpty(div.backingBlock != null ? div.backingBlock.link : undefined)
  ) {
    div.link = div.backingBlock.link
    div.openInNewTab = div.backingBlock.openInNewTab
  }

  // If any block has customCode set, we override it and its children
  // by the specified code
  // FIXME shouldn't this actually remove the children?  Like I know if we have .innerHTML set, we should ignore .children,
  // but our code doesn't really do that all the time so this could easily be violating the invariant that docs should compile
  // as-if any block with custom code had no children.
  // FIXME2 any reason for this not to be a separate pass in compileComponent?  I think there might be, but we should leave
  // a note here for why
  if (div.backingBlock != null ? div.backingBlock.hasCustomCode : undefined) {
    // FIXME: The below is doing the same stuff that instanceBlock.renderHTML is doing.
    // We should probably refactor so both go through the same code path.
    _l.extend(div, {
      // Mimics class="expand-children". This means components need flexGrow = 1 at the top level
      display: 'flex',
      flexDirection: 'column',
      innerHTML: div.backingBlock.customCode,
    })

    // if either length is flex, the flex would have deleted the length regardless
    if (!div.backingBlock.customCodeHasFixedWidth) {
      delete div.width
    }
    if (!div.backingBlock.customCodeHasFixedHeight) {
      return delete div.height
    }
  } else {
    return __guardMethod__(div.backingBlock, 'renderHTML', o =>
      o.renderHTML(div, options)
    )
  }
}

const addEventHandlers = pdom =>
  foreachPdom(pdom, function(pd) {
    const event_handlers = __guard__(
      pd.backingBlock != null ? pd.backingBlock.eventHandlers : undefined,
      x => x.filter(({ name, code }) => !_l.isEmpty(name) && !_l.isEmpty(code))
    )
    // don't set pd.event_handlers if there are none.  That way our optimization passes can remain ignorant of event handlers.
    if (_l.isEmpty(event_handlers)) {
      return
    }
    // don't let non-jsons get into the pdoms, so map EventHandler Model.Tuple objects into plain objects
    return (pd.event_handlers = event_handlers.map(({ name, code }) => ({
      event: name,
      code,
    })))
  })

const wrapExternalComponents = pdom =>
  mapPdom(pdom, function(pd) {
    const extComponentForInstance = extInst =>
      getExternalComponentSpecFromInstance(extInst, pd.backingBlock.doc)
    const extInstances =
      (pd.backingBlock != null
        ? pd.backingBlock.externalComponentInstances
        : undefined) != null
        ? pd.backingBlock != null
          ? pd.backingBlock.externalComponentInstances
          : undefined
        : []

    return (wrapWithInstance =>
      _l.reduceRight(
        extInstances,
        wrapWithInstance,
        pd
      ))(function(node, extInstance) {
      const extComponent = extComponentForInstance(extInstance)

      // if we can't find the matching source ExternalComponent, skip this wrapping
      if (extComponent == null) {
        return node
      }

      return {
        tag: { importSymbol: extComponent.name },
        props: extInstance.propValues.getValueAsJsonDynamicable(
          extComponent.propControl
        ),
        children: [node],
      }
    })
  })

//# pdom to DOMish lowering

defaultExport.makeLinkTags = makeLinkTags = (
  pdom // This wrapPdom's any blocks that have a link
) =>
  // specified but it doesn't allow a link within a link.
  // In the link within a link case, the outer one is preserved.
  walkPdom(pdom, {
    preorder: (pd, ctx) => {
      if (ctx == null) {
        ctx = {}
      }
      if (_l.isEmpty(pd.link) || ctx.linked) {
        return ctx
      } else {
        return { linked: true }
      }
    },
    postorder(pd, _accum, ctx) {
      if (ctx == null) {
        ctx = {}
      }
      if (!_l.isEmpty(pd.link) && !ctx.linked) {
        const link = { tag: 'a', hrefAttr: pd.link }
        if (pd.openInNewTab) {
          link.targetAttr = '_blank'
        }
        return wrapPdom(pd, link)
      }
    },
  })

// Render each pdom's classList :: [String] into a classAttr :: String
const makeClassAttrsFromClassLists = function(pdom) {
  // HACK
  // we want class="" to be the first attribute after the tagName in rendered html
  // We should be doing this sorting at the site of attribute -> html generation
  // Unfortunately, it was easier to rely on iteration order.  JS dicts will *typically*
  // iterate in the order their keys were inserted, although this is not guaranteed anywhere.
  // Luckily the ordering does not really affect correctness, as long as this function sets
  // pdom.classAttr = "#{pdom.id} ..." correctly.
  const add_props_before_others = function(obj, props) {
    const old_props = _l.clone(obj)
    for (let p of Array.from(Object.keys(obj))) {
      delete obj[p]
    }
    return _l.extend(obj, props, old_props)
  }

  return (() => {
    const result = []
    for (let pd of Array.from(flattenedPdom(pdom))) {
      if (pd.classList != null) {
        result.push(
          add_props_before_others(pd, { classAttr: pd.classList.join(' ') })
        )
      }
    }
    return result
  })()
}

//# Language utils needed in the editor, because the multistate compiler needs them, and compileForInstance needs it

// parens :: String -> String
// parenthesizes expressions (like repeat variables) that look like they need it
// language agnostic, so we're looking for some common heuristics
const parens = function(expr) {
  // If expr is already parenthesized, it's safe.
  // In case of an expr like `(a) + (b)`, we make sure there's no '(' or ')' inside the outermost
  // pair of parens.  We could also write a paren balance checker.
  if (/^\([^()]+\)$/.test(expr)) {
    return expr
  }

  // If epxr only contains identifier chars and dots, it's probably safe.
  // We're going to only allow letters and underscores for identifier chars to be extra safe.
  if (/^[a-zA-Z_\.]+$/.test(expr)) {
    return expr
  }

  return `(${expr})`
}

const js_string_literal = str => JSON.stringify(str)

//# Utils to lift a (BlockTree -> pdom) compiler to support features like Multistates, Absolutes, and Scrollables

const compileScreenSizeBlock = function(
  ssgBlockTree,
  options,
  artboardCompiler
) {
  const ScreenSizeBlock = require('./blocks/screen-size-block')
  const ArtboardBlock = require('./blocks/artboard-block')
  const MultistateBlock = require('./blocks/multistate-block')

  var find_all_first_under = function(blockTree, pred) {
    if (pred(blockTree)) {
      return [blockTree]
    } else {
      return _l.flatMap(blockTree.children, childTree =>
        find_all_first_under(childTree, pred)
      )
    }
  }

  const screenTrees = find_all_first_under(
    ssgBlockTree,
    ({ block }) => !(block instanceof ScreenSizeBlock)
  ).filter(
    ({ block }) =>
      block instanceof ArtboardBlock || block instanceof MultistateBlock
  )

  let screens = screenTrees.map(screenTree => ({
    pdom: compileComponentWithArtboardCompiler(
      screenTree,
      options,
      artboardCompiler
    ),
    breakpoint: _l.max(
      _l.map(
        find_all_first_under(
          screenTree,
          ({ block }) => block instanceof ArtboardBlock
        ),
        'block.width'
      )
    ),
  }))

  // drop any "screens" with no artboards in them
  screens = screens.filter(({ breakpoint }) => breakpoint != null)

  const sorted_screens = _l.sortBy(screens, 'breakpoint')

  for (let i = 0; i < sorted_screens.length; i++) {
    const { pdom, breakpoint } = sorted_screens[i]
    if (i !== 0) {
      pdom.media_query_min_width = breakpoint
    }
    if (sorted_screens[i + 1] != null) {
      pdom.media_query_max_width = sorted_screens[i + 1].breakpoint
    }
  }

  const children = _l.map(sorted_screens, 'pdom')

  return {
    // Components try to expand where they're placed so we need flexGrow = 1
    tag: 'div',
    display: 'flex',
    flexGrow: '1',
    children,
    classList: _l
      .uniq(_l.flatten(_l.compact(_l.map(children, 'classList'))))
      .map(cls => `${cls}-parent`),
  }
}

//# Compiling artboards :: ([blocks]) and components :: (artboard | multistate)
// where multistate :: ([artboards], stateExpression)
const compileMultistate = function(
  componentBlockTree,
  options,
  artboardCompiler
) {
  const MultistateBlock = require('./blocks/multistate-block')
  const ArtboardBlock = require('./blocks/artboard-block')
  const ScreenSizeBlock = require('./blocks/screen-size-block')
  assert(() => componentBlockTree.block instanceof MultistateBlock)

  const specialCssStates = ['hover', 'active']

  const { stateExpression } = componentBlockTree.block
  const stateName = tree => (tree.block.name != null ? tree.block.name : '')
  const stateTrees = _l.sortBy(
    componentBlockTree.children.filter(
      ({ block }) =>
        block instanceof ArtboardBlock ||
        block instanceof MultistateBlock ||
        block instanceof ScreenSizeBlock
    ),
    'block.uniqueKey'
  )

  const uniqueStateTrees = _l
    .values(_l.groupBy(stateTrees, stateName))
    .map(repeated_states => _l.minBy(repeated_states, 'block.uniqueKey'))

  const children = uniqueStateTrees.map(function(stateTree) {
    let state
    const compiledState = compileComponentWithArtboardCompiler(
      stateTree,
      options,
      artboardCompiler
    )
    const [pdom, state_name] = Array.from([compiledState, stateName(stateTree)])

    // Special CSS case (:hover, :active, etc)
    if (
      options.for_editor === false &&
      (state = _l.find(specialCssStates, s2 => state_name.endsWith(`:${s2}`)))
    ) {
      return _l.extend(pdom, { classList: [`pd-on${state}`] })

      // Regular case
    } else {
      return wrapPdom(pdom, {
        tag: 'showIf',
        show_if: (() => {
          switch (options.templateLang) {
            case 'CJSX':
              return `${parens(stateExpression)} == ${js_string_literal(
                state_name
              )}`
            default:
              return `${parens(stateExpression)} === ${js_string_literal(
                state_name
              )}`
          }
        })(),
      })
    }
  })

  if (options.for_component_instance_editor) {
    // Simulate "fake" else clause in the multistate
    // NOTE: This is JS specific
    const errorMessage =
      "Multistate Error: state expression didn't evaluate to any "
    const noStateError = {
      tag: 'div',
      children: [],
      textContent: new Dynamic(
        (() => {
          switch (options.templateLang) {
            case 'CJSX':
              return `throw new Error(\"Multistate Error: ${stateExpression} evaluated to \#{JSON.stringify(${stateExpression})\}, which isn't one of this group's states\")`
            default:
              return `(() => { throw new Error(\`Multistate Error: ${stateExpression} evaluated to \${JSON.stringify(${stateExpression})}, which isn't one of this group's states\`); })()`
          }
        })()
      ),
    }
    children.push(
      wrapPdom(noStateError, {
        tag: 'showIf',
        show_if: `!({${uniqueStateTrees
          .map(st => `${js_string_literal(stateName(st))}: true`)
          .join(', ')}}[${parens(stateExpression)}] || false)`,
      })
    )
  }

  let classList = _l.uniq(_l.flatten(_l.compact(_l.map(children, 'classList'))))
  classList = classList.map(function(cls) {
    // FIXME there's no way this assert holds
    assert(function() {
      let needle
      return (
        (needle = cls),
        Array.from(specialCssStates.map(state => `pd-on${state}`)).includes(
          needle
        )
      )
    })
    return `${cls}-parent`
  })

  // Components try to expand where they're placed so we need flexGrow = 1
  return { tag: 'div', children, classList, display: 'flex', flexGrow: '1' }
}

var compileComponentWithArtboardCompiler = function(
  componentBlockTree,
  options,
  artboardCompiler
) {
  assert(() => valid_compiler_options(options))
  const MultistateBlock = require('./blocks/multistate-block')
  const ArtboardBlock = require('./blocks/artboard-block')
  const ScreenSizeBlock = require('./blocks/screen-size-block')

  if (componentBlockTree.block instanceof MultistateBlock) {
    return compileMultistate(componentBlockTree, options, artboardCompiler)
  } else if (componentBlockTree.block instanceof ScreenSizeBlock) {
    return compileScreenSizeBlock(componentBlockTree, options, artboardCompiler)
  } else if (componentBlockTree.block instanceof ArtboardBlock) {
    return artboardCompiler(componentBlockTree)
  } else {
    throw new Error('Wrong component type')
  }
}

class ScrollViewLayer extends Block {
  static initClass() {
    this.userVisibleLabel = '[ScrollViewLayer/internal]' // should never be seen by a user
    this.copiedAttrs = Block.geometryAttrNames.concat(constraintAttrs)
  }
  constructor(subtree) {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) {
        super()
      }
      let thisFn = (() => {
        return this
      }).toString()
      let thisName = thisFn.match(
        /return (?:_assertThisInitialized\()*(\w+)\)*;/
      )[1]
      eval(`${thisName} = this;`)
    }
    this.subtree = subtree
    super(_l.pick(this.subtree.block, ScrollViewLayer.copiedAttrs))
  }
}
ScrollViewLayer.initClass()

class ScrollCanvasLayer extends Block {
  static initClass() {
    this.userVisibleLabel = '[ScrollCanvasLayer/internal]' // should never be seen by a user
    this.prototype.canContainChildren = true
  }
}
ScrollCanvasLayer.initClass()

const compile_by_scroll_layer = function(blockTree, scroll_layer_compiler) {
  const mutableCloneOfTree = clone_block_tree(blockTree)

  const subtree_for_sublayer = new Map()

  postorder_walk_block_tree(mutableCloneOfTree, function(subtree) {
    if (subtree.block.is_scroll_layer && !_l.isEmpty(subtree.children)) {
      // figure out the scroll layer's geometry.
      // this is actually kind of ambiguous.  This should all depend on whether we want
      // vertical or horizontal scrolling, or both.  Further, max/min heights and widths
      // should probably be taken into account.
      const contained_blocks_geometry = Block.unionBlock(
        _l.map(subtree.children, 'block')
      )
      const sublayer_geometry = _l.extend(
        _l.pick(subtree.block, ['top', 'left', 'right']),
        _l.pick(contained_blocks_geometry, ['bottom']),
        { flexHeight: true, flexWidth: true }
      )
      subtree_for_sublayer.set(subtree.block, {
        block: new ScrollCanvasLayer(sublayer_geometry),
        children: subtree.children,
      })
      return (subtree.children = [])
    }
  })

  const root_pdom = scroll_layer_compiler(mutableCloneOfTree)
  walkPdom(root_pdom, {
    preorder(pd) {
      let sublayer_tree
      if (
        pd.backingBlock != null &&
        (sublayer_tree = subtree_for_sublayer.get(pd.backingBlock)) != null
      ) {
        pd.overflow = 'scroll'
        pd.children = [scroll_layer_compiler(sublayer_tree)]

        // HACK
        // take the sublayer out of the document flow so that a parent's `minHeight: fit-content`
        // doesn't take the scroll layer's contents into account
        pd.position = 'relative'
        pd.children[0].position = 'absolute'
        pd.children[0].width = '100%'
        return (pd.children[0].minHeight = '100%')
      }
    },
  })

  // Don't add any blocks to the pdom because their names will be determined by uniqueKey, which
  // is nondeterministic.  We can leave them in later if we change the CSS class naming scheme.
  foreachPdom(root_pdom, function(pd) {
    if (
      pd.backingBlock instanceof ScrollViewLayer ||
      pd.backingBlock instanceof ScrollCanvasLayer
    ) {
      return delete pd.backingBlock
    }
  })

  return root_pdom
}

var over_root_and_absoluted_block_trees = function(
  root_block_tree,
  fn,
  absolute_context = null
) {
  const pdom = fn(root_block_tree, absolute_context)

  foreachPdom(pdom, function(pd) {
    if (pd.backingBlock instanceof AbsoluteBlock) {
      let min_sizes
      const absolute_root = pd.backingBlock
      pd.position = 'relative'

      ;[pd.children, min_sizes] = Array.from(
        _l.unzip(
          absolute_root.block_trees.map(function(absoluted_subtree) {
            const { block } = absoluted_subtree
            const absoluted_pdom = over_root_and_absoluted_block_trees(
              absoluted_subtree,
              fn,
              absolute_root
            )
            absoluted_pdom.position = 'absolute'

            if (!config.flex_absolutes) {
              return [
                _l.extend(absoluted_pdom, {
                  top: absoluted_subtree.block.top - absolute_root.top,
                  left: absoluted_subtree.block.left - absolute_root.left,
                }),
                undefined,
              ]
            }

            if (
              block.flexHeight ||
              (block.flexWidth && !_l.isEmpty(block.children))
            ) {
              absoluted_pdom.display = 'flex'
            }

            // transform properties
            const translation = {}
            const coordinate = function(direction) {
              if (direction === 'vertical') {
                return 'y'
              } else {
                return 'x'
              }
            }

            const min_size_per_block = ['vertical', 'horizontal'].map(function(
              direction
            ) {
              const {
                flexMarginBefore,
                flexMarginAfter,
                flexLength,
                length,
                blockStart,
                blockEnd,
                absoluteBefore,
                absoluteAfter,
              } = layoutAttrsForAxis(direction)

              const margin_after = absolute_root[blockEnd] - block[blockEnd]
              const margin_before =
                block[blockStart] - absolute_root[blockStart]
              const proportion_before = margin_before / absolute_root[length]
              const proportion_after = margin_after / absolute_root[length]
              const length_proportion = block[length] / absolute_root[length]

              const flex_before = block[flexMarginBefore] && margin_before > 0
              const flex_after = block[flexMarginAfter] && margin_after > 0
              const flex_length = block[flexLength]

              const size_factor = _l.sum(
                _l.compact([
                  flex_before && flex_after ? proportion_before : undefined,
                  flex_length ? length_proportion : undefined,
                ])
              )

              const size_constant = _l.sum(
                _l.compact([
                  !flex_before ? margin_before : undefined,
                  !flex_length ? block[length] : undefined,
                  !flex_after ? margin_after : undefined,
                ])
              )

              if (flex_length) {
                absoluted_pdom[length] = pct(length_proportion)
              }

              if (flex_before && flex_after) {
                const translation_correction =
                  block[length] / (2 * absolute_root[length])
                absoluted_pdom[absoluteBefore] = pct(
                  proportion_before + translation_correction
                )
              } else {
                if (!flex_before) {
                  absoluted_pdom[absoluteBefore] = margin_before
                }
                if (!flex_after) {
                  absoluted_pdom[absoluteAfter] = margin_after
                }
              }

              translation[coordinate(direction)] =
                margin_before && margin_after ? pct(-0.5) : '0'

              return size_constant / (1 - size_factor)
            })

            if (translation.x !== '0' || translation.y !== '0') {
              absoluted_pdom[
                'transform'
              ] = `translate(${translation.x}, ${translation.y})`
            }

            return [absoluted_pdom, min_size_per_block]
          })
        )
      )

      if (config.flex_absolutes) {
        const [min_heights, min_widths] = Array.from(_l.unzip(min_sizes))
        if (absolute_root.flexHeight) {
          pd.minHeight = _l.max(min_heights)
        }
        if (absolute_root.flexWidth) {
          pd.minWidth = _l.max(min_widths)
        }
      }

      return delete pd.backingBlock
    }
  })

  return pdom
}

const over_noncomponent_multistates = function(options, blockTree, fn) {
  const {
    MutlistateHoleBlock,
    MutlistateAltsBlock,
  } = require('./blocks/non-component-multistate-block')
  const ArtboardBlock = require('./blocks/artboard-block')

  const mutableCloneOfTree = clone_block_tree(blockTree)
  const alts_for_hole = new Map()

  postorder_walk_block_tree(mutableCloneOfTree, subtree => {
    if (subtree.block instanceof MutlistateHoleBlock) {
      alts_for_hole.set(subtree.block, subtree.block.getStates())
      return (subtree.children = [])
    }
  })

  const root_pdom = fn(mutableCloneOfTree)
  walkPdom(root_pdom, {
    preorder(pd) {
      let altBlockTrees
      if (
        pd.backingBlock != null &&
        (altBlockTrees = alts_for_hole.get(pd.backingBlock)) != null
      ) {
        const stateExpression = pd.backingBlock.stateExpr.code
        return (pd.children = _l.toPairs(altBlockTrees).map(function(...args) {
          const [state_name, subtree] = Array.from(args[0])
          return wrapPdom(fn(subtree), {
            tag: 'showIf',
            show_if: (() => {
              switch (options.templateLang) {
                case 'CJSX':
                  return `${parens(stateExpression)} == ${js_string_literal(
                    state_name
                  )}`
                default:
                  return `${parens(stateExpression)} === ${js_string_literal(
                    state_name
                  )}`
              }
            })(),
          })
        }))
      }
    },
  })

  return root_pdom
}

const compile_by_layer = (options, blockTree, basicCompiler) =>
  over_noncomponent_multistates(options, blockTree, ncms_block_trees =>
    compile_by_scroll_layer(ncms_block_trees, layer_block_tree =>
      over_root_and_absoluted_block_trees(
        layer_block_tree,
        (absoluted_block_tree, absolute_context) =>
          basicCompiler(absoluted_block_tree, absolute_context)
      )
    )
  )

//# Main (Component -> pdom) compiler

defaultExport.compileComponentForInstanceEditor = compileComponentForInstanceEditor = function(
  componentBlockTree,
  options
) {
  assert(() => valid_compiler_options(options))
  assert(() => options.for_component_instance_editor)
  // options.for_editor will be true if this is an instance block inside the editor,
  // and false if this is for a preview page

  const component_pdom = compileComponentWithArtboardCompiler(
    componentBlockTree,
    options,
    function(artboardBlockTree) {
      let pdom = compile_by_layer(options, artboardBlockTree, function(
        blockTree,
        absolute_context = null
      ) {
        const slices = blockTreeToSlices(blockTree, config.flashy) // flashy is chaos mode

        const outerDiv = slicesToVirtualPdom(
          slices,
          blockTree.block.width,
          blockTree.block.height
        )

        // Grabs flex settings from blocks and propagates them to entire Pdom as needed
        if (absolute_context == null || !!config.flex_absolutes) {
          addConstraints(outerDiv)
        }

        // disable flex on absoluted blocks until we enable the absolutes layout system
        if (absolute_context != null && !config.flex_absolutes) {
          force_no_flex(outerDiv)
        }

        // Actually translate virtual props into real, reactive HTML ones
        enforceConstraints(outerDiv)

        // Turn negative margin divs into actual negative margins
        remove_margin_divs(outerDiv)

        // Remove over-determining pdvdom attrs
        remove_vdom_attrs(outerDiv)

        return outerDiv
      })

      deepMountBlocksForEditor(pdom, options)

      // lower Dynamicables from renderHTML into (Dynamic|Literal)s
      pdom = pdomDynamicableToPdomDynamic(pdom)

      // Also we separate all component instantiations (essentially funciton calls) from any external position
      // stuff which should remain in the pdom once eval substitutes all pds with pdom_tag_is_component(pd.tag)
      wrapComponentsSoTheyOnlyHaveProps(pdom)

      return pdom
    }
  )

  makeClassAttrsFromClassLists(component_pdom)

  // Do unwrapPhantomPdoms to bring back the positioning attributes from phantom pdoms to their immediate children
  unwrapPhantomPdoms(component_pdom)

  return component_pdom
}

defaultExport.compileComponent = compileComponent = function(
  componentBlockTree,
  options
) {
  assert(() => valid_compiler_options(options))
  assert(() => !options.for_editor)
  // assert -> options.optimizations == true

  return compileComponentWithArtboardCompiler(
    componentBlockTree,
    options,
    function(artboardBlockTree) {
      let pdom = compile_by_layer(options, artboardBlockTree, function(
        blockTree,
        absolute_context = null
      ) {
        const slices = blockTreeToSlices(blockTree, options.chaos)

        const outerDiv = slicesToVirtualPdom(
          slices,
          blockTree.block.width,
          blockTree.block.height
        )

        // Grabs flex settings from blocks and propagates them to entire Pdom as needed
        if (absolute_context == null || !!config.flex_absolutes) {
          addConstraints(outerDiv)
        }

        // disable flex on absoluted blocks until we enable the absolutes layout system
        if (absolute_context != null && !config.flex_absolutes) {
          force_no_flex(outerDiv)
        }

        // Actually translate virtual props into real, reactive HTML ones
        enforceConstraints(outerDiv)

        // Turn negative margin divs into actual negative margins
        remove_margin_divs(outerDiv)

        // Optimization pass: Substitute unnecessary spacer Divs by padding
        if (options.optimizations) {
          removeSpacerDivs(outerDiv)
        }

        // Optimization pass: Remove spacer divs of centered stuff
        if (options.optimizations && config.centerStuffOptimization) {
          centerStuff(outerDiv)
        }
        if (options.optimizations) {
          spaceBetween(outerDiv)
        }

        // Remove over-determining pdvdom attrs
        remove_vdom_attrs(outerDiv)

        return outerDiv
      })

      deepMountBlocks(pdom, options)

      // wraps each Pdom with external components, or custom defined user functions
      pdom = wrapExternalComponents(pdom)

      // lower Dynamicables from renderHTML into (Dynamic|Literal)s
      pdom = pdomDynamicableToPdomDynamic(pdom)

      addEventHandlers(pdom)

      makeLinkTags(pdom)

      if (options.optimizations) {
        remove_noninherited_css_properties_with_default_values(pdom)
      }

      // TECH DEBT: This must come before the remove_redundant* because remove_redudant assumes
      // the existence of only a select few # of styles. Our pdom model has undefined == ''
      // so the optimization passes dont optimize in the case that an empty string is set instead of undefined
      // This call turns all emptry strings into undefineds
      prune_empty_string_styles(pdom)

      // Optimization pass: Remove redundant divs
      if (options.optimizations) {
        remove_redundant_divs(pdom)
      }

      if (options.optimizations) {
        remove_flex_from_leaves(pdom)
      }

      // Optimization pass: Convert numeric font-weights to keyword values
      if (options.optimizations) {
        keywordize_font_weights(pdom)
      }

      // CSS optimization: combine border properties into compact representation
      if (options.optimizations) {
        for (let pd of Array.from(flattenedPdom(pdom))) {
          // We checked that those border props are not falsy.  I would use _l.isEmpty, but isEmpty(4) == true.
          if (_.all([pd.borderWidth, pd.borderColor, pd.borderStyle])) {
            const thickness = (function(len) {
              if (_.isNumber(len)) {
                return `${len}px`
              } else {
                return len
              }
            })(pd.borderWidth)
            pd.border = `${thickness} ${pd.borderStyle} ${pd.borderColor}`
            for (let prop of ['borderWidth', 'borderColor', 'borderStyle']) {
              delete pd[prop]
            }
          }
        }
      }

      // percolate would seem like it should come before remove defaults, except we only percolate inherited
      // and only remove defaults on non-inherited, so they're disjoint sets.  They may come in whatever order you like.
      // percolate_inherited_css_properties(pdom) if options.optimizations

      return pdom
    }
  )
}

const compileComponentForEmail = function(componentBlockTree, options) {
  assert(() => valid_compiler_options(options))
  assert(() => !options.for_editor)
  assert(() => (options.optimizations = true))

  return compileComponentWithArtboardCompiler(
    componentBlockTree,
    options,
    function(artboardBlockTree) {
      let pdom = compile_by_layer(options, artboardBlockTree, function(
        blockTree,
        absolute_context = null
      ) {
        const slices = blockTreeToSlices(blockTree, options.chaos)

        let outerDiv = slicesToVirtualPdom(
          slices,
          blockTree.block.width,
          blockTree.block.height
        )

        // HACK: The way enforceConstraintsUsingTables works right now, we need an extra
        // outer div to ensure everything gets wrapped in tables.
        outerDiv = { tag: 'div', direction: 'vertical', children: [outerDiv] }

        // Grabs flex settings from blocks and propagates them to entire Pdom as needed
        if (absolute_context == null) {
          addConstraints(outerDiv)
        }

        // disable flex on absoluted blocks until we figure out a nice layout system for them
        if (absolute_context != null) {
          force_no_flex(outerDiv)
        }

        // Actually translate virtual props into real, reactive HTML ones
        enforceConstraintsUsingTables(outerDiv)

        // Optimization pass: Remove spacer divs of centered stuff
        if (options.optimizations) {
          centerStuffForEmails(outerDiv)
        }

        // Remove over-determining pdvdom attrs
        remove_vdom_attrs(outerDiv)

        return outerDiv
      })

      deepMountBlocks(pdom, options)

      // wraps each Pdom with external components, or custom defined user functions
      pdom = wrapExternalComponents(pdom)

      // lower Dynamicables from renderHTML into (Dynamic|Literal)s
      pdom = pdomDynamicableToPdomDynamic(pdom)

      makeLinkTags(pdom)

      return pdom
    }
  )
}

//# VPDom Optimization Passes

var centerStuffForEmails = pdom =>
  foreachPdom(pdom, function(pd) {
    if (pd.children.length < 3) {
      return
    }
    if (pd.direction == null) {
      return
    }

    const { vLength, flexLength } = layoutAttrsForAxis(pd.direction)
    const first = pd.children[0],
      adjustedLength = Math.max(pd.children.length, 2),
      mid = pd.children.slice(1, adjustedLength - 1),
      last = pd.children[adjustedLength - 1]

    const all_middle_fixed = _l.every(mid, c => !c[flexLength])

    const isFlexSpacerDiv = div =>
      div[flexLength] === true && div.spacerDiv === true

    // Checks if first and last are flex spacer divs and the rest is fixed and first[length] == last[length]
    if (
      all_middle_fixed &&
      isFlexSpacerDiv(first) &&
      isFlexSpacerDiv(last) &&
      first[vLength] === last[vLength]
    ) {
      // Remove first and last and use flexbox to center the children
      pd.textAlign = 'center'
      return _l.remove(pd.children, c => [first, last].includes(c))
    }
  })

// This looks for pdoms where the first and the last child are both
// flexible margins of equal size and all middle children are fixed
// It removes first and last and centers the rest
var centerStuff = pdom =>
  foreachPdom(pdom, function(pd) {
    if (pd.children.length < 3) {
      return
    }
    if (pd.direction == null) {
      return
    }

    const { vLength, layoutType } = layoutAttrsForAxis(pd.direction)
    const first = pd.children[0],
      adjustedLength = Math.max(pd.children.length, 2),
      mid = pd.children.slice(1, adjustedLength - 1),
      last = pd.children[adjustedLength - 1]

    const all_middle_fixed = _l.every(mid, c => c[layoutType] !== 'flex')

    const isFlexSpacerDiv = div =>
      div[layoutType] === 'flex' && div.spacerDiv === true

    // Checks if first and last are flex spacer divs and the rest is fixed and first[length] == last[length]
    if (
      all_middle_fixed &&
      isFlexSpacerDiv(first) &&
      isFlexSpacerDiv(last) &&
      first[vLength] === last[vLength]
    ) {
      // Remove first and last and use flexbox to center the children
      pd.justifyContent = 'center'
      return _l.remove(pd.children, c => [first, last].includes(c))
    }
  })

var spaceBetween = pdom =>
  foreachPdom(pdom, function(pd) {
    if (pd.direction == null) {
      return
    }
    const { vLength, layoutType } = layoutAttrsForAxis(pd.direction)
    const isFlex = child => child[layoutType] === 'flex'

    if (pd.children.length !== 3) {
      return
    }
    const [first, mid, last] = Array.from(pd.children)

    if (
      !_.all([
        !isFlex(first) && !first.spacerDiv,
        isFlex(mid) && mid.spacerDiv,
        !isFlex(last) && !last.spacerDiv,
      ])
    ) {
      return
    }

    // remove the spacer, use justify-content: space-between instead
    _l.pull(pd.children, mid)
    return (pd.justifyContent = 'space-between')
  })

var keywordize_font_weights = pdom =>
  foreachPdom(
    pdom,
    pd =>
      (pd.fontWeight = (() => {
        switch (pd.fontWeight) {
          case '400':
            return 'normal'
          case '700':
            return 'bold'
          default:
            return pd.fontWeight
        }
      })())
  )

// FIXME: Can be done as a reduce
var removeSpacerDivs = function(pdom) {
  if (!config.removeSpacerDivs) {
    return
  }

  if (pdom.direction != null) {
    const {
      layoutType,
      length,
      vLength,
      paddingAfter,
      paddingBefore,
      marginBefore,
    } = layoutAttrsForAxis(pdom.direction)

    pdom.children.forEach(function(child, i) {
      if (child.spacerDiv && child[layoutType] !== 'flex') {
        assert(function() {
          if (pdom.direction === 'horizontal') {
            return child[vLength] === child[length]
          } else {
            return true
          }
        })
        if (i === 0) {
          return (pdom[paddingBefore] = child[vLength])
        } else if (i === pdom.children.length - 1) {
          return (pdom[paddingAfter] = child[vLength])
        } else {
          return (pdom.children[i + 1][marginBefore] = child[vLength])
        }
      }
    })

    _l.remove(pdom.children, c => c.spacerDiv && c[layoutType] !== 'flex')
  }
  return pdom.children.forEach(removeSpacerDivs)
}

//# DOMish Optimization Passes

var remove_noninherited_css_properties_with_default_values = function(pdom) {
  const noninherited_css_properties_default_values = {
    backgroundColor: 'rgba(0,0,0,0)',
    background: 'rgba(0,0,0,0)',
    borderRadius: 0,
    flexShrink: 1,
    flexDirection: 'row',
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  }

  return foreachPdom(pdom, function(pd) {
    let prop
    if (!_l.isEmpty(pd.classList)) {
      return
    }
    // We assume that pd is "anonymous" and not being styled by anyone externally.  The only places
    // styles can be coming from are inheritance from parent divs and from our own styleForDiv(pd).
    // Therefore, non-inherited properties being explicitly set to the default are redundant. We can
    // safely remove them to clean up the pdom without changing the outputs.

    for (prop in noninherited_css_properties_default_values) {
      const dfault = noninherited_css_properties_default_values[prop]
      if (pd[prop] === dfault) {
        delete pd[prop]
      }
    }

    if (pd.tag === 'div' && pd.borderWidth === 0) {
      for (prop of ['borderWidth', 'borderStyle', 'borderColor']) {
        delete pd[prop]
      }
    }

    // don't build a list from the for loop
  })
}

const percolate_inherited_css_properties = function(pdom) {
  const inherited_css_properties = [
    'fontFamily',
    'fontWeight',
    'fontStyle',
    'color',
    'textDecoration',
    'wordWrap',

    // We want to be a careful about these because they must be set on any display:inline-block containers or we
    // risk accidentally changing the inline-block container's sizing.  For example, a div containing two inline
    // block nodes with a space or line break between them might size the space depending on font-size and line-height.
    // Technically font-family and font-weight can affect the size of a space between inline-block elements as well.
    // We hope to not put spaces bewteen inline-block elements— JSX is great in this regard; we may have trouble with
    // string based templating langauges though.
    'fontSize',
    'lineHeight',
    'letterSpacing',
    'textAlign',
  ]

  return walkPdom(pdom, {
    postorder(parent) {
      // we make the same "anonymity" assumption as remove_noninherited_css_properties_with_default_values
      if (!_l.isEmpty(parent.classList)) {
        return
      }

      // Only percolate through divs.  The "user agent style sheet" that defines the default CSS on a per-browser basis
      // may violate our anonymity assumption above.  Chrome does, at least for <button>s.  Chrome by default resets font
      // properties on the button tag, so they don't inherit.  We *could* use something like reset.css, and maybe we should.
      // For now, the most non-invasive answer is to just only percolate through divs, because it would be banannas for
      // any "user agent style sheet" (ie. browser vendors) to mess with inheriting font properties through divs.
      if (parent.tag !== 'div') {
        return
      }

      // we're only sure if a child will inherit if it's a <div> and has no classes
      const inheritors = parent.children.filter(
        child => child.tag === 'div' && _l.isEmpty(child.classList)
      )

      // short circuit if there's no one to inherit your props anyway
      if (_l.isEmpty(inheritors)) {
        return
      }

      for (let prop of Array.from(inherited_css_properties)) {
        const childrens_values = _l
          .map(inheritors, prop)
          .filter(val => val != null)

        // if this prop isn't on any of the children, it's irrelevant, just move along
        if (_l.isEmpty(childrens_values)) {
          continue
        }

        // Pick one of the values from the children
        // TODO We should have a better heuristic of which value to pick than just take the first one.
        // Don't change the parent's value if it has one already explicitly set
        if (parent[prop] == null) {
          parent[prop] = childrens_values[0]
        }

        // remove now-redundant props from children
        for (let child of Array.from(inheritors)) {
          if (pdom_value_is_equal(child[prop], parent[prop])) {
            delete child[prop]
          }
        }
      }

      // don't return the above for-loop as a list
      return null
    },
  })
}

var remove_flex_from_leaves = pdom =>
  foreachPdom(pdom, function(pd) {
    const can_remove =
      pd.children.length === 0 &&
      pd.display === 'flex' &&
      _.all(
        _.keys(pd).map(prop =>
          [
            'tag',
            'children',
            'backingBlock',
            'display',
            'flexDirection',
            'textContent',
          ].includes(prop)
        )
      )
    if (can_remove) {
      return (() => {
        const result = []
        for (let prop of ['display', 'flexDirection']) {
          result.push(delete pd[prop])
        }
        return result
      })()
    }
  })

var remove_redundant_divs = function(pdom) {
  foreachPdom(pdom, prune_undefined_props)

  return walkPdom(pdom, {
    postorder(grandpa) {
      return (() => {
        const result = []
        for (var parent of Array.from(grandpa.children)) {
          if (
            parent.children.length === 1 &&
            parent.children[0].children.length === 1
          ) {
            var [child, grandchild] = Array.from([
              parent.children[0],
              parent.children[0].children[0],
            ])

            const isFlexRow = div =>
              div.display === 'flex' &&
              ((div.flexDirection != null) === false ||
                div.flexDirection === 'row')
            const isFlexColumn = div =>
              div.display === 'flex' && div.flexDirection === 'column'

            const should_merge = _.all([
              grandpa.tag === parent.tag &&
                parent.tag === child.tag &&
                child.tag === grandchild.tag &&
                grandchild.tag === 'div',

              isFlexRow(grandpa) && isFlexColumn(parent) && isFlexRow(child),

              // make sure there's no other properties that could cause other problems
              _.all(
                [parent, child, grandchild].map(node =>
                  _.all(
                    _.keys(node).map(function(prop) {
                      let needle
                      return (
                        (needle = prop),
                        Array.from(
                          [
                            'tag',
                            'children',
                            'backingBlock',
                            'display',
                            'flexDirection',
                            'paddingTop',
                            'paddingBottom',
                            'paddingLeft',
                            'paddingRight',
                          ].concat(
                            (() => {
                              if (node === parent) {
                                return [
                                  'marginTop',
                                  'marginBottom',
                                  'marginLeft',
                                  'marginRight',
                                  'background',
                                  'borderRadius',
                                  'border',
                                ]
                              } else if (node === child) {
                                return []
                              } else if (node === grandchild) {
                                return [
                                  // Here we allow everything that affects the grandchild's children but
                                  // does not depend on the child's external geometry. Stuff like fontFamily
                                  // is fine but something like background or border is not
                                  'flexShrink', // grandparent must have the same direction as child since those two will affect grandchild's flexShrink
                                  'textContent',
                                  'fontFamily',
                                  'fontWeight',
                                  'fontStyle',
                                  'color',
                                  'textDecoration',
                                  'wordWrap',
                                  'fontSize',
                                  'lineHeight',
                                  'letterSpacing',
                                  'textAlign',
                                ]
                              }
                            })()
                          )
                        ).includes(needle)
                      )
                    })
                  )
                )
              ),
            ])

            if (should_merge) {
              const mergedPadding = _l.fromPairs(
                _l.compact(
                  [
                    'paddingTop',
                    'paddingBottom',
                    'paddingLeft',
                    'paddingRight',
                  ].map(function(p) {
                    const padding =
                      (parent[p] != null ? parent[p] : 0) +
                      (child[p] != null ? child[p] : 0) +
                      (grandchild[p] != null ? grandchild[p] : 0)
                    assert(() => padding >= 0)
                    if (padding > 0) {
                      return [p, padding]
                    } else {
                      return null
                    }
                  })
                )
              )

              // FIXME: if parent has a backingBlock we'll drop it and assign its children's
              // .backingBlock should actually be a set .backingBlocks; with
              // multiple divs possibly having the same backing block.  At this phase
              // there's no reason to have exactly one div per block and one block per div.
              // It's only really there to give hints for names.
              result.push(_l.extend(parent, grandchild, mergedPadding))
            } else {
              result.push(undefined)
            }
          }
        }
        return result
      })()
    },
  })
}

var prune_empty_string_styles = pdom =>
  foreachPdom(pdom, pd =>
    (() => {
      const result = []
      for (let prop of Array.from(styleMembersOfPdom(pd))) {
        if (pd[prop] === '' || (pd[prop] != null) === false) {
          result.push(delete pd[prop])
        }
      }
      return result
    })()
  )

var prune_undefined_props = obj =>
  (() => {
    const result = []
    for (let prop of Array.from(_l.keys(obj))) {
      if ((obj[prop] != null) === false) {
        result.push(delete obj[prop])
      }
    }
    return result
  })()

//# CSS Static Styling Extraction

// FIXME rework extractedCSS so it becomes extractedCSS :: pdom -> (id_prefix :: String) -> [pdom, css :: String]
// extractedCSS **should** remove the CSS styles from the pdom
// extractedCSS should **not** touch Dynamic CSS properties
// extractedCSS should be combined with something to handle inline styles for Dynamic styles

// extractedCSS is a mutating pdom pass that takes pdom with (effectively) inline styles and turns it
// into one with CSS.  It adds a pdom.classAttr to nodes so it can refer to them in CSS selectors, and
// returns the string of CSS that will need to be loaded to make this pass an optimization pass.  This
// is a code (asthetics) optimization pass, it should not change the behavior of the pdom.
const extractedCSS = function(pdom, options) {
  if (options.inline_css) {
    return extracted_inline_css(pdom, options)
  }

  const font_imports = fontLoaders(pdom, options)

  // names :: Map<pdom, string>
  const names = css_classnames_for_pdom(pdom, options)

  const media_query_code = flattenedPdom(pdom)
    .filter(
      pd => pd.media_query_min_width != null || pd.media_query_max_width != null
    )
    .map(
      pd => `\
${make_media_rule_header(pd.media_query_min_width, pd.media_query_max_width)} {
    .${names.get(pd)} {
        display: ${pd.display};
    }
}\
`
    )

  // we've already generated all media query-related code at this point
  foreachPdom(pdom, function(pd) {
    if (pd.media_query_min_width != null || pd.media_query_max_width != null) {
      return (pd.display = 'none')
    }
  })
  foreachPdom(pdom, pd =>
    Array.from(media_query_attrs).map(key => delete pd[key])
  )

  // rulesets :: [(string, css, pdom)]
  const rulesets = extractedStyleRules(pdom, names)

  // Add the ID of this pdom as a class name so an external style sheet can refer to it
  for (let [pd_id, rules_list, pd] of Array.from(rulesets)) {
    ;(pd.classList != null ? pd.classList : (pd.classList = [])).push(
      String(pd_id)
    )
  }

  const css_code = rulesets.map(function(...args) {
    let pd_id, rules_list, pd
    ;[pd_id, rules_list, pd] = Array.from(args[0])
    return `\
.${pd_id} {
    ${indented(rules_list.join('\n'))}
}\
`
  })

  return _l
    .compact([
      font_imports !== '' ? font_imports : undefined,
      css_code.join('\n\n'),
      media_query_code.join('\n\n'),
      common_css,
    ])
    .join('\n\n')
}

var extracted_inline_css = function(pdom, options) {
  const font_imports = fontLoaders(pdom, options)

  // names :: Map<pdom, string>
  const names = css_classnames_for_pdom(pdom, options)

  const media_query_code = flattenedPdom(pdom)
    .filter(
      pd => pd.media_query_min_width != null || pd.media_query_max_width != null
    )
    .map(
      pd => `\
${make_media_rule_header(pd.media_query_min_width, pd.media_query_max_width)} {
    .${names.get(pd)} {
        display: ${pd.display};
    }
}\
`
    )

  // add class to PDom if it has media queries
  foreachPdom(pdom, function(pd) {
    if (pd.media_query_min_width != null || pd.media_query_max_width != null) {
      return (pd.classList != null ? pd.classList : (pd.classList = [])).push(
        names.get(pd)
      )
    }
  })

  // the display properties for components with media queries
  // need to go into the non-inlined stylesheet because if
  // they don't, they'll come after the media queries and override them.
  const display_code = _l.compact(
    flattenedPdom(pdom).map(function(pd) {
      if (
        pd.media_query_min_width != null ||
        pd.media_query_max_width != null
      ) {
        return `\
.${names.get(pd)} {
    display: none;
}\
`
      }
    })
  )
  foreachPdom(pdom, function(pd) {
    if (pd.media_query_min_width != null || pd.media_query_max_width != null) {
      return delete pd.display
    }
  })

  // we're done generating media queries, so delete media query properties
  foreachPdom(pdom, pd =>
    Array.from(media_query_attrs).map(key => delete pd[key])
  )

  return `\
${font_imports}
${display_code.concat(media_query_code).join('\n\n')}
${common_css}\
`
}

const extractedStyledComponents = function(pdom, options) {
  const font_imports = fontLoaders(pdom, options)
  const names = css_classnames_for_pdom(pdom, options)

  // hide responsive components (but save their display properties outside of the pdom for media rule generation)
  // we need to do this because we can't generate queries ahead of time for styled components like we do for regular CSS.
  const display_props = new Map(
    flattenedPdom(pdom).map(function(pd) {
      const { display } = pd
      if (
        pd.media_query_min_width != null ||
        pd.media_query_max_width != null
      ) {
        pd.display = 'none'
      }
      return [pd, display]
    })
  )

  const rulesets = extractedStyleRules(pdom, names).map(function(...args) {
    // rename all the things so their names are valid React components
    // FIXME replacing '-'' with '_' doesn't preserve guarentee of unique names
    let pd_id, rules_list, pd
    ;[pd_id, rules_list, pd] = Array.from(args[0])
    const js_safe_name = _l.upperFirst(pd_id.replace(/-/g, '_'))
    return [js_safe_name, rules_list, pd]
  })

  const styled_components_code = rulesets.map(function(...args) {
    let rules
    let pd_id, pd
    ;[pd_id, rules, pd] = Array.from(args[0])
    if (pd.media_query_min_width != null || pd.media_query_max_width != null) {
      // it's ok to mutate rules here as long as we don't use it for anything else.
      rules = rules.concat(`\
${make_media_rule_header(pd.media_query_min_width, pd.media_query_max_width)} {
    display: ${display_props.get(pd)};
}\
`)
    }

    return `\
const ${pd_id} = styled.${pd.tag}\`
    ${indented(rules.join('\n'))}
\`\
`
  })

  // we've already generated all media query code, so we can delete related properties
  foreachPdom(pdom, pd =>
    Array.from(media_query_attrs).map(key => delete pd[key])
  )

  for (let [pd_id, rules_list, pd] of Array.from(rulesets)) {
    pd.tag = pd_id
  }

  return `\
injectGlobal\`
    ${indented(_l.compact([font_imports, common_css]).join('\n\n'))}
\`
${styled_components_code.join('\n\n')}\
`
}

// make_media_rule_header :: (integer, integer) -> string
var make_media_rule_header = function(min_width, max_width) {
  const has_min_width = min_width != null && min_width !== 0
  const has_max_width = max_width != null && max_width !== Infinity

  if (has_min_width && has_max_width) {
    return `@media (min-width: ${min_width}px) and (max-width: ${max_width -
      1}px)`
  } else if (!has_min_width && has_max_width) {
    return `@media (max-width: ${max_width - 1}px)`
  } else if (has_min_width && !has_max_width) {
    return `@media (min-width: ${min_width}px)`
  }
}

var fontLoaders = function(pdom, { import_fonts }) {
  const googleFontsUsed = _l.compact(
    _l.flatten(
      flattenedPdom(pdom).map((
        pd // FIXME: This should traverse props for fonts
      ) =>
        // FIXME 2: If fontWeight is a Dynamicable value passed as props it may be named anything not just .fontWeight
        // need to figure out a way to check for this. Possibly check for any dynamic fontweights in entire pdom and
        // import all font weights if they are not all static.
        _l.values(pd).map(function(val) {
          if (val instanceof GoogleWebFont) {
            let needle
            return [
              val.name,
              ((needle = pd.fontWeight),
              Array.from(val.get_font_variants()).includes(needle))
                ? pd.fontWeight
                : '',
            ]
          } else {
            return undefined
          }
        })
      )
    )
  )

  const fontFaces = _l.compact(
    _l.flatten(
      flattenedPdom(pdom).map(pd =>
        _l.values(pd).map(function(val) {
          if (val instanceof CustomFont) {
            return val.get_font_face()
          } else {
            return undefined
          }
        })
      )
    )
  )

  const googleFontLoader = `@import url('https://fonts.googleapis.com/css?family=${_l
    .uniq(
      googleFontsUsed.map(arg =>
        arg
          .join(':')
          .split(' ')
          .join('+')
      )
    )
    .join('|')}');`

  return _l
    .compact([
      import_fonts && !_l.isEmpty(googleFontsUsed)
        ? googleFontLoader
        : undefined,
      import_fonts && !_l.isEmpty(fontFaces) ? fontFaces.join('\n') : undefined,
    ])
    .join('\n\n')
}

var css_classnames_for_pdom = function(
  pdom,
  { css_classname_prefix, inline_css }
) {
  //# Name things
  const makeFriendlyId = function(pd, is_valid, css_classname_prefix) {
    const old_id = pd.id

    // Pdoms with no backing block have names created by annotateLayoutblocks
    // which are already friendly enough
    if (!pd.backingBlock) {
      return old_id
    }

    // Else we leave the initial characters be and just try to change the digits that come thereafter
    // Fixme: this is a hack and assumes that the "ugly" part of the ID is made of digits.
    // If uniqueKey changes behavior this has to change.
    const post_prepend = old_id.substring(
      css_classname_prefix.length,
      old_id.length
    )
    const first_digit = post_prepend.search(/\d/) + css_classname_prefix.length
    if (first_digit + 1 < old_id.length) {
      for (
        let start = first_digit + 1,
          num = start,
          end = old_id.length,
          asc = start <= end;
        asc ? num <= end : num >= end;
        asc ? num++ : num--
      ) {
        const new_id = old_id.substring(0, num)
        if (is_valid(new_id)) {
          return new_id
        }
      }
    }

    return old_id
  }

  const shortenIds = function(pdom, css_classname_prefix) {
    // Make Ids more friendly to please our friendly users
    const all_ids = _l.compact(_l.map(flattenedPdom(pdom), 'id'))

    return foreachPdom(pdom, function(pd) {
      if (!_l.isUndefined(pd.id)) {
        const new_id = makeFriendlyId(
          pd,
          id => !Array.from(all_ids).includes(id) && !id.endsWith('-'),
          css_classname_prefix
        )
        if (new_id !== pd.id) {
          all_ids.push(new_id)
          return (pd.id = new_id)
        }
      }
    })
  }

  // Generate names for the pdom elems that have backingBlocks
  // namespacing them with css_classname_prefix
  foreachPdom(pdom, function(pd) {
    // default case: name based on backing block
    let block
    if ((block = pd.backingBlock) != null) {
      let blockTypeLabel
      const hint = !_.isEmpty(block.name)
        ? block.name
        : (block.width < 5 && block.height > 50) ||
          (block.height < 5 && block.width > 50)
        ? // heuristic: if it's really thin, it might be a line
          'line'
        : (blockTypeLabel = block.getClassNameHint()) != null
        ? blockTypeLabel
        : 'b' // legacy thing where we start all blocknames with b

      return (pd.id = `${css_classname_prefix}-${filter_out_invalid_css_classname_chars(
        hint
      )}-${block.uniqueKey}`)

      // wrapper case: name based on child
    } else if (
      pd.children.length === 1 &&
      pd.children[0].id != null &&
      config.wrapperCssClassNames
    ) {
      return (pd.id = `${pd.children[0].id}-wrapper`)
    }
  })

  // Same as above for pdom elems that don't have backingBlocks
  var annotateLayoutBlocks = function(pdom, name) {
    if (pdom.id == null) {
      pdom.id = name
    }
    return Array.from(pdom.children).map((child, i) =>
      annotateLayoutBlocks(child, `${name}-${i}`)
    )
  }
  annotateLayoutBlocks(pdom, css_classname_prefix)

  // Shorten Ids as much as possible, Git commit style-ish
  shortenIds(pdom, css_classname_prefix)

  assert(function() {
    const elementsAreUniqueIn = array => _l.uniq(array).length === array.length
    const allPdomIds = _.pluck(flattenedPdom(pdom), 'id')
    return elementsAreUniqueIn(allPdomIds)
  })

  const names = new Map()
  foreachPdom(pdom, function(pd) {
    names.set(pd, pd.id)
    return delete pd.id
  })
  return names
}

var extractedStyleRules = function(pdom, names) {
  //# Extract and return const style rules

  const pdom_in_preorder = []
  walkPdom(pdom, {
    preorder(pd) {
      return pdom_in_preorder.push(pd)
    },
  })

  return _l.compact(
    pdom_in_preorder.map(function(pd) {
      const pd_id = names.get(pd)
      assert(() => pd_id != null)

      // Goal: extract into styleAttrs any attributes which can be extracted into an external style sheet.
      // and remove them from pd.  styleAttrs should have all of styleForDiv(pd) except Dynamics.
      const styleAttrs = styleForDiv(pd)

      for (var attr of Array.from(styleMembersOfPdom(pd))) {
        // TODO: pd.props can contain Fonts, we must recursively search through props to find these Font objects
        if (
          _l.some(
            [_l.isString, _l.isNumber, arg => arg instanceof Font],
            pred => pred(pd[attr])
          )
        ) {
          delete pd[attr]
        } else {
          delete styleAttrs[attr]
        }
      }

      // if there's no CSS to extract for this node skip it. return undefined and be _l.compact()ed out later
      if (_l.isEmpty(styleAttrs)) {
        return undefined
      }

      const rules_list = pdom_style_attrs_as_css_rule_list(styleAttrs)

      // Make sure pd isn't a component instance because we don't have a guarenteed way to pass them styles.
      // We are taking precautions to make sure instances have no styling.  Since we're aborting earlier
      // in this loop if there are no styles for this pdom, we should never get here with a instance.
      assert(() => !pdom_tag_is_component(pd.tag))

      return [pd_id, rules_list, pd]
    })
  )
}

var pdom_style_attrs_as_css_rule_list = styleAttrs =>
  _.pairs(styleAttrs).map(function(...args) {
    // like DOM and React, we use camel case css names in JS and
    // convert to the dashed CSS form for rendering
    let [prop, val] = Array.from(args[0])
    prop = prop.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`)

    // By default use px unit for numeric css values.
    // TODO keep exception list for unitless numeric css props, like zIndex
    // WORKAROUND passing a numeric value as a string will not append "px"
    if (_.isNumber(val)) {
      val = String(val) + 'px'
    }

    // ignore properties marked undefined
    if (val == null) {
      return ''
    }

    // FIXME some, but not all of these need escaping/stringifying
    return `${prop}: ${val};`
  })

var common_css = `\
* {
    box-sizing: border-box;
}

body {
    margin: 0;
}

button:hover {
    cursor: pointer;
}

a {
    text-decoration: none;
    color: inherit;
}

.pd-onhover-parent >.pd-onhover {
    display: none;
}

.pd-onhover-parent:hover > * {
    display: none;
}

.pd-onhover-parent:hover > .pd-onhover {
    display: flex;
}

.pd-onactive-parent > .pd-onactive {
    display: none;
}

.pd-onactive-parent:active > * {
    display: none;
}

.pd-onactive-parent:active > .pd-onactive {
    display: flex;
}

.pd-onactive-parent.pd-onhover-parent:active > .pd-onhover {
    display: none;
}\
`

//# Language Utils

var indented = multiline_text => multiline_text.replace(/\n/g, '\n    ')
const multi_indent = (indent, multiline_text) =>
  multiline_text.replace(/\n/g, '\n' + indent)

// terminate all files with newline so the user's git is happy
const source_file = (filePath, pieces) => ({
  filePath,
  contents: pieces.filter(p => p != null).join('\n') + '\n',
})

// NOTE: a != b does NOT IMPLY filter_out_invalid_css_classname_chars(a) != filter_out_invalid_css_classname_chars(b).
// That is to say, filter_out_invalid_css_classname_chars does not preserve uniqueness.
var filter_out_invalid_css_classname_chars = str =>
  str.replace(/[^\w-_]+/g, '_').toLowerCase()

const css_classname_prefix_for_component = function(component) {
  // FIXME these should be globally unique, even if component.componentSymbol isn't
  if (_l.isEmpty(component.componentSymbol)) {
    return `pd${component.uniqueKey}`
  }
  return filter_out_invalid_css_classname_chars(component.componentSymbol)
}

const escapedHTMLForTextContent = function(textContent) {
  const escapedLines = textContent.split('\n').map(function(line) {
    line = escape(line) // must be done before the next line for otherwise this will escape the &s added below
    // replace all subsequent spaces after a single space by &nbsp; because those will be ignored by html otherwise
    // NOTE React specifically doesn't actually require us to escape these.
    return line.replace(/ /gi, function(match, i) {
      if (i > 0 && line[i - 1] === ' ') {
        return '&nbsp;'
      } else {
        return ' '
      }
    })
  })

  if (escapedLines.length === 1) {
    return escapedLines[0]
  }
  return escapedLines
    .map(function(line) {
      if (_l.isEmpty(line)) {
        return '<br/>'
      } else {
        return `<div>${line}</div>`
      }
    })
    .join('\n')
}

// Common XML-like rendering utility
// divToHTML :: (pdom, {contents_expr, attr_expr, templateStr, shouldSelfClose, [tag names]}) -> String
var divToHTML = function(div, options) {
  let special_case_tag_renderer
  let {
    contents_expr,
    attr_expr,
    templateStr,
    shouldSelfClose,
    renderedTextContent,
  } = options
  if (renderedTextContent == null) {
    renderedTextContent = escapedHTMLForTextContent
  }
  if (shouldSelfClose == null) {
    shouldSelfClose = div => Array.from(HTML5VoidTags).includes(div.tag)
  }
  if (contents_expr == null) {
    contents_expr = templateStr
  }
  if (attr_expr == null) {
    attr_expr = (code, attr) => `\"${templateStr(code)}\"`
  }
  assert(() => contents_expr != null && attr_expr != null)

  const contents = _.isString(div.innerHTML)
    ? div.innerHTML
    : _l.isString(div.textContent)
    ? renderedTextContent(div.textContent)
    : // FIXME: now we expect div.textContent.code to evaluate to plain text and *not* code
    // but right now we'll put code here
    div.textContent instanceof Dynamic
    ? contents_expr(div.textContent.code)
    : div.children.map(child => divToHTML(child, options)).join('\n')

  const attrs = htmlAttrsForPdom(div)

  // Allow special casing by tag
  if ((special_case_tag_renderer = options[div.tag]) != null) {
    const spec = special_case_tag_renderer(div, attrs, contents)
    if (_.isArray(spec) && spec.length === 2) {
      return xmlish_tags_around_body(spec[0], spec[1], contents)
    } else if (_.isString(spec)) {
      return spec
    } else {
      throw new Error(
        `renderer for ${div.tag} failed to return a [open_tag, close_tag] or string`
      )
    }
  } else {
    const attrList = _.pairs(attrs).map(function(...args) {
      // this is the common case
      // FIXME(!) escape string literals.  P0.  Different per-langauge.
      const [attr, value] = Array.from(args[0])
      if (_.isString(value)) {
        return `${attr}=\"${value}\"`
      } else if (value instanceof Dynamic) {
        return `${attr}=${attr_expr(value.code, attr)}`
      } else {
        throw new Error('unknown attribute type')
      }
    })

    const tagWithAttrs = [div.tag].concat(attrList).join(' ')
    const [open_tag, close_tag] = Array.from([
      `<${tagWithAttrs}>`,
      `</${div.tag}>`,
    ])

    if (_.isEmpty(contents) && shouldSelfClose(div)) {
      return `<${tagWithAttrs} /> `
    }

    return xmlish_tags_around_body(open_tag, close_tag, contents)
  }
}

// In HTML5, certain tags are called "void" tags, meaning they can never have children.  They should not have
// closing tags.  For XHTML compatibility, we may write these as "self-closing", meaning `<br />` instead of `<br>`.
// In HTML5, it is incorrect to have a self-closing non-void tag, like `<div />`— you must always write `<div></div>`.
// In more sane languages like JSX, self-closing is always allowed if you don't have children.
// https://www.w3.org/TR/html51/syntax.html#void-elements
// https://dev.w3.org/html5/html-author/#void-elements-0
var HTML5VoidTags = [
  'hr',
  'img',
  'input',
  'area',
  'base',
  'br',
  'col',
  'embed',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

var xmlish_tags_around_body = function(open_tag, close_tag, contents) {
  const one_liner = `${open_tag}${contents}${close_tag}`

  // heuristic
  if (one_liner.length < 60 || (one_liner.length < 80 && contents === '')) {
    return one_liner
  }

  if (contents === '') {
    return `\
${open_tag}
${close_tag}\
`
  }

  return `\
${open_tag}
    ${indented(contents)}
${close_tag}\
`
}

// NOTE: Only works for single line comments
const commentForLang = {
  html(comment) {
    return `<!-- ${comment} -->`
  },
  JSX(comment) {
    return `// ${comment}`
  },
  React(comment) {
    return `// ${comment}`
  },
  CJSX(comment) {
    return `# ${comment}`
  },
  TSX(comment) {
    return `// ${comment}`
  },
  css(comment) {
    return `/* ${comment} */`
  },
  Angular2(comment) {
    return `// ${comment}`
  },
  ERB(comment) {
    return `<%# ${comment} %>`
  },
}

// NOTE: This must be within the first ten lines of generated files, otherwise this will break the CLI
// FIXME add an assert to compileDoc to check this
const generatedByComment = (metaserver_id, lang) =>
  commentForLang[lang](
    `Generated by https://pagedraw.io/pages/${metaserver_id}`
  )

var json_dynamic_to_js = function(jd) {
  if (jd instanceof Dynamic) {
    return parens(jd.code)
  } else if (_l.isArray(jd)) {
    return `[${jd.map(json_dynamic_to_js).join(', ')}]`
  } else if (_l.isPlainObject(jd)) {
    return `{${_l
      .toPairs(jd)
      .map(function(...args) {
        const [key, value] = Array.from(args[0])
        return `${JSON.stringify(key)}: ${json_dynamic_to_js(value)}`
      })
      .join(', ')}}`
  } else {
    return JSON.stringify(jd)
  } // Strings, Numbers, Booleans
}

// nonconflicting_encode_as_js_identifier_suffix :: string -> string
// hopefully this never has to be used outside Angular.  It shouldn't be used in Angular either, but we don't really care about Angular.
const nonconflicting_encode_as_js_identifier_suffix = function(str) {
  // uses Buffer() which is only available in Node.js.  This is only run on the compileserver, so we should be ok for now.
  const b64 = Buffer.from(str).toString('base64')
  const js_id_suffix = b64
    .replace(/\+/g, '$')
    .replace(/\//g, '_')
    .replace(/\=/g, '')
  assert(() => js_id_suffix.match(/^[a-zA-Z0-9\$_]*$/))
  return js_id_suffix
}

// TODO add a test that there's no subclass of PropControl not covered.  (Model should let you find all subclasses.)
var typescript_type_for_prop_control = function(control) {
  if (control instanceof StringPropControl) {
    return 'string'
  } else if (control instanceof ColorPropControl) {
    return 'string'
  } else if (control instanceof ImagePropControl) {
    return 'string'
  } else if (control instanceof NumberPropControl) {
    return 'number'
  } else if (control instanceof CheckboxPropControl) {
    return 'boolean'

    // FIXME is this right??
  } else if (control instanceof FunctionPropControl) {
    return 'Function'

    // FIXME minimum parenthesization unclear
  } else if (control instanceof DropdownPropControl) {
    return `(${control.options.map(js_string_literal).join(' | ')})`
  } else if (control instanceof ListPropControl) {
    return `Array<${typescript_type_for_prop_control(control.elemType)}>`
  } else if (control instanceof ObjectPropControl) {
    // TODO what do we do if `name` is not a valid js identifier?
    //  Option 1: Error for the user
    //  Option 2: map String <-> Valid JS Identifier
    const entries = control.attrTypes.map(
      ({ name, control }) =>
        `${name}: ${typescript_type_for_prop_control(control)}`
    )
    return `{${entries.join(', ')}}`
  } else {
    assert(() => false) // don't know how to make a type for this
    return 'any'
  }
}

const stripFileExtension = function(path) {
  const lastSlash = path.lastIndexOf('/')
  const dot = path.lastIndexOf('.')
  const hasNoExtension = dot === -1 || (lastSlash !== -1 && dot < lastSlash)
  const hasExtension = dot !== -1 && (lastSlash === -1 || lastSlash < dot)
  if (hasExtension !== false) {
    return path.slice(0, dot)
  }
  if (hasExtension === false) {
    return path
  }
}

const escapeMultilineJSString = function(str) {
  str = str.replace(/\n/g, '\\n\\\n') // escape newlines
  str = str.replace(/\"/g, '\\"') // escape qoutes
  return `\"${str}\"`
}

const imports_for_js = imports => imports.map(js_line_for_import).join('\n')

// js_line_for_import :: { symbol: String?, module_exports: [String]?, path: String} -> String
var js_line_for_import = function({ symbol, module_exports, path }) {
  if (symbol != null && module_exports != null) {
    return `import ${symbol}, {${module_exports.join(', ')}} from '${path}';`
  } else if (symbol != null && module_exports == null) {
    return `import ${symbol} from '${path}';`
  } else if (symbol == null && module_exports != null) {
    return `import {${module_exports.join(', ')}} from '${path}';`
  } else if (symbol == null && module_exports == null) {
    return `import '${path}';`
  }
}

const requires_for_coffeescript = imports =>
  imports.map(coffeescript_line_for_require).join('\n')

// coffeescript_line_for_require :: js_line_for_import
var coffeescript_line_for_require = function({ symbol, module_exports, path }) {
  if (symbol != null && module_exports != null) {
    return `${symbol} = {${module_exports.join(', ')}} = require '${path}'`
  } else if (symbol != null && module_exports == null) {
    return `${symbol} = require '${path}'`
  } else if (symbol == null && module_exports != null) {
    return `{${module_exports.join(', ')}} = require '${path}'`
  } else if (symbol == null && module_exports == null) {
    return `require '${path}'`
  }
}

//# Compiler entrypoint

// renderFuncFor :: {language_name: (pdom, options) -> [html: string, css: string, combined: string]}
// render functions are added below as they are declared
const renderFuncFor = {}

// Compiler should be deterministic and a pure function of it's inputs.
// It should produce the same results every time when compiled on the same doc in the same state.
// forall doc, assert -> compileDoc(doc) == compileDoc(doc)

// compileDoc :: (Doc) -> [{filePath: String, contents: String}]
defaultExport.compileDoc = compileDoc = doc =>
  doc.inReadonlyMode(function() {
    let files = renderFuncFor[doc.export_lang](doc)

    // very silly; shouldSync in particular is completely deprecated
    files = files.map(file =>
      _l.extend({}, file, { shouldSync: true, warnings: [], errors: [] })
    )

    for (var file of Array.from(files)) {
      // Check for no invalid members, not the presence of required members.  Not sure why this is here.
      var valid_members = [
        'filePath',
        'componentRef',
        'contents',
        'shouldSync',
        'warnings',
        'errors',
      ]
      assert(() =>
        _.every(
          _l.keys(file),
          k => Array.from(valid_members).includes(k) && file[k] != null
        )
      )
    }

    return files
  })

//# Pluggable compiler backends for generated template languages

//# React family

const compileReact = ({
  render,
  render_imports,
  js_prefix,
  supports_styled_components,
  embeddedStyleTag,
  need_create_react_class,
}) => doc =>
  _l.flatMap(doc.componentTreesToCompile(), function(componentBlockTree) {
    const component = componentBlockTree.block
    const jsFilePath = filePathOfComponent(component)

    // requires :: [{symbol: String, path: String}]
    const requires = function(pdom) {
      // FIXME requires should probably be by pd.tag (if pdom_tag_is_component), and React specific
      let rs = _l.flatMap(flattenedPdom(pdom), function(pd) {
        let left
        return (left =
          pd.backingBlock != null
            ? pd.backingBlock.getRequires(jsFilePath)
            : undefined) != null
          ? left
          : []
      })

      // FIXME this should actually group by path and do something fancier...
      rs = _l.uniqWith(rs, _l.isEqual)

      // FIXME: I think this is webpack specific, not technically React or JS specific
      rs = _l.map(rs, r =>
        _l.extend({}, r, { path: stripFileExtension(r.path) })
      )

      if (need_create_react_class) {
        rs.unshift({ symbol: 'createReactClass', path: 'create-react-class' })
      }
      rs.unshift({ symbol: 'React', path: 'react' })
      return rs
    }

    const js_file = (pdom, extra_requires, styledComponents) =>
      source_file(jsFilePath, [
        config.extraJSPrefix != null ? config.extraJSPrefix : undefined,
        doc.metaserver_id
          ? generatedByComment(doc.metaserver_id, doc.export_lang)
          : undefined,
        render_imports(_l.concat(requires(pdom), extra_requires)),
        js_prefix,
        component.componentSpec.codePrefix,
        styledComponents,
        '',
        render(pdom, component),
      ])

    //# Render to files. Dispatch by css mechanism.
    const lift_over_styling_mechanism = function(pdom, fn) {
      // CJSX does not support StyledComponents.  We'll just ignore the flag.
      let css
      if (doc.styled_components && supports_styled_components) {
        const styledComponents = extractedStyledComponents(pdom, options)
        // extractedStyledComponents is mutating pdom, so it must come before fn(pdom)
        fn(pdom)
        return [
          js_file(
            pdom,
            [
              {
                symbol: 'styled',
                module_exports: ['injectGlobal'],
                path: 'styled-components',
              },
            ],
            styledComponents
          ),
        ]
      } else if (doc.separate_css) {
        let cssPath
        ;[css, cssPath] = Array.from([
          extractedCSS(pdom, options),
          cssPathOfComponent(component),
        ])
        // extractedCSS is mutating pdom, so it must come before fn(pdom)
        fn(pdom)
        return [
          js_file(
            pdom,
            [{ path: `./${path.relative(path.dirname(jsFilePath), cssPath)}` }],
            null
          ),
          source_file(cssPath, [
            config.extraCSSPrefix != null ? config.extraCSSPrefix : undefined,
            doc.metaserver_id
              ? generatedByComment(doc.metaserver_id, 'css')
              : undefined,
            css,
          ]),
        ]
      } else {
        css = extractedCSS(pdom, options)
        // extractedCSS is mutating pdom, so it must come before fn(pdom)
        fn(pdom)
        pdom.children.unshift(embeddedStyleTag(css))
        return [js_file(pdom, [], null)]
      }
    }

    //# Set up a React-y pdom

    var options = {
      templateLang: doc.export_lang,
      for_editor: false,
      for_component_instance_editor: false,
      optimizations: true,

      chaos: doc.intentionallyMessWithUser,
      inline_css: doc.inline_css,
      import_fonts: doc.import_fonts,

      css_classname_prefix: css_classname_prefix_for_component(component),

      getCompiledComponentByUniqueKey(uniqueKey) {
        // this was broken for a long time, which means I think we can assume it's not called
        return assert(() => false)
      },
    }
    assert(() => valid_compiler_options(options))

    const pdom = compileComponent(componentBlockTree, options)
    unwrapPhantomPdoms(pdom)

    return lift_over_styling_mechanism(pdom, function(pdom) {
      wrapComponentsSoTheyOnlyHaveProps(pdom)

      // not exactly a react thing, but all render funcs need this
      makeClassAttrsFromClassLists(pdom)

      return foreachPdom(pdom, function(pd) {
        if (pd.event_handlers != null) {
          for (let { event, code } of Array.from(pd.event_handlers)) {
            pd[event + 'Attr'] = new Dynamic(code, undefined)
          }
          delete pd.event_handlers
        }

        // Resolve instances
        if (pdom_tag_is_component(pd.tag)) {
          pd.tag = reactJSNameForComponent(pd.tag, doc)

          assert(() => !pd.props.isDynamic) // not implemented, and our UI should never allow it
          for (let key in pd.props) {
            const prop = pd.props[key]
            pd[key + 'Attr'] = new Dynamic(json_dynamic_to_js(prop))
          }
          delete pd.props
        }

        // react, annoyingly, calls the "class" attribute "className"
        ;[pd.classNameAttr, pd.classAttr] = Array.from([
          pd.classAttr,
          undefined,
        ])

        // Inline styles
        const stylesToInline = styleForDiv(pd)
        if (!_l.isEmpty(stylesToInline)) {
          return (pd.styleAttr = new Dynamic(
            json_dynamic_to_js(stylesToInline)
          ))
        }
      })
    })
  })

const jsx_embedded_style_tag = css => ({
  tag: 'style',
  textContent: new Dynamic(escapeMultilineJSString(css)),
  children: [],
})

const renderJSX = pdom =>
  divToHTML(pdom, {
    contents_expr(expr) {
      return `{ ${expr} }`
    },
    attr_expr(expr) {
      return `{${expr}}`
    },
    shouldSelfClose() {
      return true
    },
    repeater(pdom, attrs, contents) {
      assert(() => _.isEmpty(attrs))
      assert(() => pdom.instance_variable != null)
      return `\
{ ${parens(pdom.repeat_variable)}.map((${pdom.instance_variable}, i) => {
    return ${indented(contents)};
}) }\
`
    },
    showIf(pdom, attrs) {
      return [`{ ${parens(pdom.show_if)} ?`, ': null}']
    },
    renderedTextContent: escapedTextForJSX,
  })

var escapedTextForJSX = function(textContent) {
  // We consider a line terminator anything that Javascript considers a line terminator
  // from http://ecma-international.org/ecma-262/5.1/#sec-7.3
  const escapedLines = textContent
    .split(/\u2028|\u2029|\r\n|\n|\r/g)
    .map(function(line) {
      if (_l.isEmpty(line)) {
        return line
      }
      if (/^[a-zA-Z0-9\-_,\+\-\*\/$#@!\.\s]+$/.test(line)) {
        return line
      } // line is safe
      const escaped = line
        .replace(/[\\]/g, '\\\\')
        .replace(/[\""]/g, '\\"')
        .replace(/[“]/g, '\\“')
        .replace(/[”]/g, '\\”')
      return `{\"${escaped}\"}`
    })

  if (escapedLines.length === 1) {
    return escapedLines[0]
  }
  return escapedLines
    .map(function(line) {
      if (_l.isEmpty(line)) {
        return '<br/>'
      } else {
        return `<div>${line}</div>`
      }
    })
    .join('\n')
}

renderFuncFor['JSX'] = compileReact({
  supports_styled_components: true,
  embeddedStyleTag: jsx_embedded_style_tag,
  render_imports: imports_for_js,
  render(pdom, component) {
    return `\
export default class ${reactJSNameForComponent(
      component
    )} extends React.Component {
  render() {
    return (
      ${multi_indent('      ', renderJSX(pdom))}
    );
  }
};\
`
  },
})

renderFuncFor['TSX'] = compileReact({
  supports_styled_components: true,
  embeddedStyleTag: jsx_embedded_style_tag,

  // For some crazy ES6 reason, you can't import React the normal way.  Hacks:
  render_imports(requires) {
    return imports_for_js(
      requires.filter(r => !_l.isEqual(r, { symbol: 'React', path: 'react' }))
    )
  },
  js_prefix: `\
// tslint:disable
import * as React from 'react';\
`,
  render(pdom, component) {
    return `\
export default class ${reactJSNameForComponent(
      component
    )} extends React.Component<any, any> {
  render() {
    return (
      ${multi_indent('      ', renderJSX(pdom))}
    );
  }
}\
`
  },
})

renderFuncFor['CJSX'] = compileReact({
  supports_styled_components: false,
  need_create_react_class: true,
  embeddedStyleTag(css) {
    return {
      tag: 'style',
      children: [],

      // FIXME not properly escaping the multiline CJSX string
      dangerouslySetInnerHTMLAttr: new Dynamic(
        `__html: \"\"\"${indented(`\n${css}`)}\n\"\"\"`
      ),
    }
  },
  render_imports: requires_for_coffeescript,
  render(pdom, component) {
    const cjsx = divToHTML(pdom, {
      contents_expr(expr) {
        return `{ ${expr} }`
      },
      attr_expr(expr) {
        return `{${expr}}`
      },
      shouldSelfClose() {
        return true
      },

      repeater(pdom, attrs, contents) {
        assert(() => _.isEmpty(attrs))
        assert(() => pdom.instance_variable != null)
        // funky stuff would happen if there were multiple children here, both in coffeescript and
        // in React
        assert(() => pdom.children.length === 1)
        return [
          `{ ${parens(pdom.repeat_variable)}.map (${
            pdom.instance_variable
          }, i) =>`,
          '}',
        ]
      },

      showIf(pdom, attrs, contents) {
        // we have to return a string and not [open_tag, close_tag] because if we returned
        // open and close tags, divToHTML could put us all on one line.  Coffeescript is whitespace
        // significant, so if we were all on one line we'd need a `then`.  The repeater above
        // doesn't need a then if it's all on one line
        return `\
{ if ${parens(pdom.show_if)}
    ${indented(contents)}
}\
`
      },

      // FIXME this 100% right for Coffee.  eg. "#{interpolation}" won't be caught.
      renderedTextContent: escapedTextForJSX,
    })

    return `\
module.exports = ${reactJSNameForComponent(component)} = createReactClass {
    displayName: '${reactJSNameForComponent(component)}'
    render: ->
        ${multi_indent('      ', cjsx)}
}\
`
  },
})

renderFuncFor['React'] = compileReact({
  supports_styled_components: false,
  embeddedStyleTag: jsx_embedded_style_tag,
  render_imports: imports_for_js,
  render(pdom, component) {
    const react_elems = walkPdom(pdom, {
      postorder(pd, rendered_children) {
        switch (pd.tag) {
          case 'repeater':
            return `\
${parens(pd.repeat_variable)}.map(function (${pd.instance_variable}, i) {
    ${indented(`return [${rendered_children.join(', ')}];`)}
})\
`

          case 'showIf':
            return `\
${parens(pd.show_if)} ?
    ${indented(rendered_children.join(', '))}
: null\
`

          default:
            // attrs :: {attr_name: value}
            var attrs = htmlAttrsForPdom(pd)

            // innerHTML overrides contents
            assert(function() {
              if (!_l.isEmpty(pd.textContent)) {
                return _l.isEmpty(rendered_children)
              } else {
                return true
              }
            })
            if (_l.isString(pd.innerHTML) && !_l.isEmpty(pd.innerHTML)) {
              rendered_children = [pd.innerHTML]
            } else if (
              _l.isString(pd.textContent) &&
              !_l.isEmpty(pd.textContent)
            ) {
              rendered_children = [js_string_literal(pd.textContent)]
            } else if (pd.textContent instanceof Dynamic) {
              rendered_children = [pd.textContent.code]
            }

            // props_elems :: [String]
            var props_elems = _l.toPairs(attrs).map(function(...args) {
              const [name, value] = Array.from(args[0])
              const value_js = (() => {
                if (_.isString(value)) {
                  return js_string_literal(value)
                } else if (value instanceof Dynamic) {
                  return parens(value.code)
                } else {
                  throw new Error('unknown attribute type')
                }
              })()

              const escaped_key =
                // we don't always need to escape it, but there's no quick easy
                // heuristic that doesn't have false positives since js keywords
                // look like they should be allowed but aren't.
                js_string_literal(name)

              return `${escaped_key}: ${value_js}`
            })

            var props_hash = `{${props_elems.join(', ')}}`

            if (_l.isEmpty(rendered_children)) {
              return `React.createElement('${pd.tag}', ${props_hash})`
            } else {
              return `\
React.createElement('${pd.tag}', ${props_hash},
    ${indented(rendered_children.join(',\n'))}
)\
`
            }
        }
      },
    })

    return `\
export default class ${reactJSNameForComponent(
      component
    )} extends React.Component {
  render () {
    return ${multi_indent('      ', react_elems)};
  }
}\
`
  },
})

//# Angular support

renderFuncFor['Angular2'] = function(doc) {
  // HACK: treats top-level Function props as @Outputs

  const component_block_trees = doc.getComponentBlockTrees()

  // render the compiled component pdoms to generated code files
  const files = _l.flatMap(doc.componentTreesToCompile(), function(
    componentBlockTree
  ) {
    const component = componentBlockTree.block

    const options = {
      templateLang: doc.export_lang,

      for_editor: false,
      for_component_instance_editor: false,
      optimizations: true,
      chaos: doc.intentionallyMessWithUser,

      // Angular blessedly namespaces CSS for us, but our codegen currently requires some (latin alphabetic) prefix
      css_classname_prefix: 'pd',

      // I'm not 100% sure we support inline css for Angular, nor am I sure we should
      inline_css: false,

      import_fonts: doc.import_fonts,

      getCompiledComponentByUniqueKey(uniqueKey) {
        // this was broken for a long time, which means I think we can assume it's not called
        return assert(() => false)
      },
    }
    assert(() => valid_compiler_options(options))

    const pdom = compileComponent(componentBlockTree, options)
    unwrapPhantomPdoms(pdom)
    const main_css = extractedCSS(pdom, options)

    makeClassAttrsFromClassLists(pdom)

    // by default, Angular creates a custom HTML component wrapping each template.
    // We force them to grow.
    const extra_css_rules = flattenedPdom(pdom)
      .filter(pd => pdom_tag_is_component(pd.tag))
      .map(
        pd => `\
${angularTagNameForComponent(pd.tag)} {
display: flex;
flex-grow: 1;
}\
`
      )

    const css = extra_css_rules.concat(main_css).join('\n\n')

    wrapComponentsSoTheyOnlyHaveProps(pdom)

    const code_chunks = []

    // put all the @Inputs before the @Outputs
    let this_components_props = component.componentSpec.propControl.attrTypes
    this_components_props = _l.sortBy(
      this_components_props,
      ({ control }) => control instanceof FunctionPropControl
    )
    const declarations = this_components_props.map(function({ name, control }) {
      if (!(control instanceof FunctionPropControl)) {
        return `@Input() ${name}: ${typescript_type_for_prop_control(control)};`
      } else {
        return `@Output() ${name}: EventEmitter<any> = new EventEmitter();`
      }
    })
    if (!_l.isEmpty(declarations)) {
      code_chunks.push(declarations.join('\n'))
    }

    // variables_in_scope are in the order of declaration
    const foreach_pdom_with_variables_in_scope = (pdom, fn) =>
      walkPdom(pdom, {
        ctx: [],
        preorder(pd, variables_in_scope) {
          fn(pd, variables_in_scope)

          // return the ctx (aka. variables_in_scope) with which walkPdom will call pd's children
          if (pd.tag === 'repeater') {
            return unshadowed_variables(
              variables_in_scope.concat([pd.instance_variable, 'i'])
            )
          }
          return variables_in_scope
        },
      })

    var unshadowed_variables = vars =>
      _l.reverse(_l.uniq(_l.reverse(_l.clone(vars))))

    foreach_pdom_with_variables_in_scope(pdom, function(
      pd,
      variables_in_scope
    ) {
      // bindings :: [(name, JsonDynamic)]
      let code, value
      let bindings = []
      if (pd.event_handlers == null) {
        pd.event_handlers = []
      }

      const make_binding_impl = function(code) {
        // Look for simple `this.` expressions like `this.foo`, in which case we can just [binding]="foo" without making an
        // implementation.  Note the regex is overly conservative and probably is wrong with unicode identifiers (eg. emojis).
        let match
        if (
          (match = code.trim().match(/^this\.([$_a-zA-Z][$_\w]*)$/)) != null
        ) {
          return match[1]
        }

        const impl_name = `get_${nonconflicting_encode_as_js_identifier_suffix(
          code
        )}`
        code_chunks.push(`\
${impl_name}(${variables_in_scope.join(', ')}) {
    return ${indented(code)};
}\
`)
        return `${impl_name}(${variables_in_scope.join(', ')})`
      }

      if (pdom_tag_is_component(pd.tag)) {
        // don't support ExternalComponents.  Freak out if it's not a normal component.
        let name
        if (pd.tag.componentSpec == null) {
          assert(() => false)
          for (let key of Array.from(_l.keys(pd))) {
            delete pd[key]
          }
          return
        }

        assert(() => !(pd.props instanceof Dynamic)) // not implemented, and our UI should never allow it
        const event_names = pd.tag.componentSpec.propControl.attrTypes
          .filter(({ control }) => control instanceof FunctionPropControl)
          .map(({ name }) => name)
        const [props, events] = Array.from(
          _l.partition(_l.toPairs(pd.props), function(...args) {
            let prop_name
            let value
            ;[prop_name, value] = Array.from(args[0])
            return !Array.from(event_names).includes(prop_name)
          })
        )

        bindings = props // by accident, these have the exact same types

        for ([name, value] of Array.from(events)) {
          assert(() => value instanceof Dynamic)
          pd.event_handlers.push({ event: name, code: value.code })
        }

        delete pd.props

        pd.tag = angularTagNameForComponent(pd.tag)
      } else if (pd.tag === 'repeater') {
        pd.repeat_variable = make_binding_impl(pd.repeat_variable)
      } else if (pd.tag === 'showIf') {
        pd.show_if = make_binding_impl(pd.show_if)
      } else {
        // FIXME sometimes we need to do attribute bindings, and sometimes property bindings.  It's messed up. We just always do
        // property bindings, but it's going to break with ARIA. See https://angular.io/guide/template-syntax#attribute-binding.
        // Add [brackets] around attrs that are bound
        for (let [pd_prop, attr_name] of Array.from(attr_members_of_pdom(pd))) {
          if (pd[pd_prop] instanceof Dynamic) {
            bindings.push([attr_name, pd[pd_prop]])
            delete pd[pd_prop]
          }
        }

        const iterable = styleForDiv(pd)
        for (value = 0; value < iterable.length; value++) {
          // It's unclear how to set static inline style values
          const style_js_name = iterable[value]
          if (_l.isNumber(value)) {
            bindings.push([`style.${style_js_name}.px`, value])
            // The user will manually need to type `+ "px"` for dynamics in many situations.
          } else {
            bindings.push([`style.${style_js_name}`, value.code])
          }
        }

        for (let handler of Array.from(pd.event_handlers)) {
          handler.code = `\
$event.stopPropagation();
${handler.code}\
`
        }
      }

      for (let [binding_name, jd_value] of Array.from(bindings)) {
        // Special case a bunch of ones that play nicely with the Angular template language

        if (_l.isString(jd_value)) {
          pd[`${binding_name}Attr`] = jd_value
          continue
        }

        if (_l.isNumber(jd_value)) {
          pd[`[${binding_name}]Attr`] = jd_value.toString()
          continue
        }

        code =
          // json_dynamic_to_js could handle a Dynamic perfectly well, but would add unnecessary parens
          jd_value instanceof Dynamic
            ? jd_value.code
            : json_dynamic_to_js(jd_value)
        pd[`[${binding_name}]Attr`] = make_binding_impl(code)
      }

      const vars_in_handler_scope = variables_in_scope.concat('$event')

      return (() => {
        let event
        const result = []
        for ({ event, code } of Array.from(pd.event_handlers)) {
          const impl_name = `handle_${nonconflicting_encode_as_js_identifier_suffix(
            code
          )}`
          pd[`(${event})Attr`] = `${impl_name}(${vars_in_handler_scope.join(
            ', '
          )})`
          result.push(
            code_chunks.push(`\
${impl_name}(${vars_in_handler_scope.join(', ')}) {
        ${indented(code)}
}\
`)
          )
        }
        return result
      })()
    })

    const template = divToHTML(pdom, {
      contents_expr(expr) {
        return `{{ ${expr} }}`
      },
      attr_expr() {
        return assert(() => false)
      }, // we should have no dynamic attrs left by this point
      repeater(pdom, attrs, contents) {
        assert(() => _l.isEmpty(attrs))
        assert(() => pdom.instance_variable != null)
        return `\
<ng-container *ngFor="let ${pdom.instance_variable} of ${
          pdom.repeat_variable
        }; let i=index">
    ${indented(contents)}
</ng-container>\
`
      },
      showIf(pdom, attrs, contents) {
        return `\
<ng-container *ngIf=\"${pdom.show_if}\">
    ${indented(contents)}
</ng-container>\
`
      },
      renderedTextContent(text) {
        return escapedHTMLForTextContent(text).replace(/[{}]/g, function(str) {
          switch (str) {
            case '{':
              return "{{'{'}}"
            case '}':
              return "{{'}'}}"
          }
        })
      },
    })

    const [filePath, cssPath, templatePath] = Array.from([
      filePathOfComponent(component),
      cssPathOfComponent(component),
      templatePathOfComponent(component),
    ])

    return [
      {
        filePath: templatePath,
        contents: `\
${generatedByComment(doc.metaserver_id, 'html')}
${template}\
`,
      },
      {
        filePath: cssPath,
        contents: `\
${generatedByComment(doc.metaserver_id, 'css')}
${css}\
`,
      },
      {
        filePath,
        contents: `\
${generatedByComment(doc.metaserver_id, doc.export_lang)}

import { Component, Input, Output, EventEmitter  } from '@angular/core';
${component.componentSpec.codePrefix}

@Component({
    selector: '${angularTagNameForComponent(component)}',
    templateUrl: './${path.relative(path.parse(filePath).dir, templatePath)}',
    styleUrls: ['./${path.relative(path.parse(filePath).dir, cssPath)}']
})
export class ${angularJsNameForComponent(component)} {
    ${indented(_l.uniq(code_chunks).join('\n\n'))}
}\
`,
      },
    ]
  })

  const components = _l.map(component_block_trees, 'block')

  const module_dir = doc.filepath_prefix
  const imports = components.map(function(c) {
    const parsed_path = path.parse(filePathOfComponent(c))
    let component_path = path.join(
      path.relative(module_dir, parsed_path.dir),
      parsed_path.name
    )
    if (!component_path.startsWith('./') && !component_path.startsWith('../')) {
      component_path = `./${component_path}`
    }
    return `import { ${angularJsNameForComponent(
      c
    )} } from '${component_path}';`
  })

  const declared_names = components.map(c => angularJsNameForComponent(c))

  files.push({
    filePath: `${module_dir}/pagedraw.module.ts`,
    contents: `\
${generatedByComment(doc.metaserver_id, 'Angular2')}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
${imports.join('\n')}

@NgModule({
    imports: [ CommonModule ],
    declarations: [
        ${multi_indent(' '.repeat(8), declared_names.join(',\n'))}
    ],
    exports: [
        ${multi_indent(' '.repeat(8), declared_names.join(',\n'))}
    ]
})
export class PagedrawModule { }\
`,
  })

  return files
}

//# Server side language utils

const copyWithRootBody = pdom => _l.extend({}, pdom, { tag: 'body' })

const try_or_fail_with_message = function(fn) {
  let error_message_recieved = null
  const fail_func = function(message) {
    error_message_recieved = message
    const js_error = Error(message)
    js_error.is_user_level_error = true
    throw js_error
  }
  try {
    return fn(fail_func)
  } catch (e) {
    if (e.is_user_level_error) {
      return error_message_recieved // we called fail_func; return the message
    } else {
      throw e
    } // it was an internal error
  }
}

//# HTML Email Support

renderFuncFor['html-email'] = function(doc) {
  const options = {
    for_editor: false,
    for_component_instance_editor: false,
    optimizations: true,

    templateLang: doc.export_lang,
    metaserver_id: doc.metaserver_id,
    separate_css: doc.separate_css,
    inline_css: doc.inline_css,
    styled_components: doc.styled_components,
    import_fonts: doc.import_fonts,
    chaos: doc.intentionallyMessWithUser,

    getCompiledComponentByUniqueKey(uniqueKey) {
      // this was broken for a long time, which means I think we can assume it's not called
      return assert(() => false)
    },
  }

  assert(() => valid_compiler_options(options))

  // render the compiled component pdoms to generated code files
  return _l.flatMap(doc.componentTreesToCompile(), function(
    componentBlockTree
  ) {
    let full_html
    const pdom = compileComponentForEmail(componentBlockTree, options)

    // 0 margin in body
    pdom.margin = 0

    // CSS magic: tds can be bigger in height than their content if we don't set this
    pdom.fontSize = 0

    // render inline styles
    for (let pd of Array.from(flattenedPdom(pdom))) {
      pd.styleAttr = pdom_style_attrs_as_css_rule_list(styleForDiv(pd)).join(
        ' '
      )
    }

    // FIXME no support for reusable components
    const rendered = try_or_fail_with_message(fail_with_message =>
      divToHTML(copyWithRootBody(pdom), {
        templateStr() {
          return fail_with_message('templating is not supported in HTML')
        },
        repeater() {
          return fail_with_message('repeaters are not supported in HTML')
        },
        showIf() {
          return fail_with_message('show ifs are not supported in HTML')
        },
      })
    )

    const component = componentBlockTree.block

    // FIXME add support for generated by comment, codePrefix
    // generatedByComment(doc.metaserver_id, 'html-email')
    // component.componentSpec.codePrefix

    return (full_html = {
      filePath: filePathOfComponent(component),
      contents: `\
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="user-scalable=no,width=device-width" />
</head>
${rendered}
</html>\
`,
    })
  })
}

//# Legacy, unsupported server side rendered platforms

const _legacy_compile_by_pdom = renderFunc => doc =>
  _l.flatMap(doc.componentTreesToCompile(), function(componentBlockTree) {
    const component = componentBlockTree.block

    const options = {
      templateLang: doc.export_lang,
      for_editor: false,
      for_component_instance_editor: false,

      getCompiledComponentByUniqueKey(uniqueKey) {
        // this was broken for a long time, which means I think we can assume it's not called
        return assert(() => false)
      },

      metaserver_id: doc.metaserver_id,
      optimizations: true,
      chaos: doc.intentionallyMessWithUser,

      separate_css: doc.separate_css,
      inline_css: doc.inline_css,
      styled_components: doc.styled_components,
      import_fonts: doc.import_fonts,

      code_prefix: component.componentSpec.codePrefix,
      css_classname_prefix: css_classname_prefix_for_component(component),
      cssPath: cssPathOfComponent(component),
      filePath: filePathOfComponent(component),
    }
    assert(() => valid_compiler_options(options))

    const pdom = compileComponent(componentBlockTree, options)
    return renderFunc(pdom, options)
  })

const HTMLandCSSFile = function(html, css, options) {
  const html_generated_by = options.metaserver_id
    ? generatedByComment(options.metaserver_id, options.templateLang)
    : undefined
  return [
    {
      filePath: options.filePath,
      contents: _l
        .compact([html_generated_by, options.code_prefix, html])
        .join('\n'),
    },
    {
      filePath: options.cssPath,
      contents: options.metaserver_id
        ? [generatedByComment(options.metaserver_id, 'css'), css].join('\n')
        : css,
    },
  ]
}

const HTMLFile = function(html, options) {
  const generated_by = options.metaserver_id
    ? generatedByComment(options.metaserver_id, options.templateLang)
    : undefined
  return [
    {
      filePath: options.filePath,
      contents: _l
        .compact([generated_by, options.code_prefix, html])
        .join('\n'),
    },
  ]
}

const renderStandardHTMLPage = function(html, css, options, head = null) {
  const full_html = `\
<!DOCTYPE html>
   <html>
   <head>${head !== null ? `\n    ${head}` : ''}
       <meta name="viewport" content="user-scalable=no,width=device-width" />
       ${
         options.separate_css
           ? `<link rel='stylesheet' href='${options.cssPath}'>`
           : `<style> \
${indented(css)} \
</style>`
       }
   </head>
   ${html}
   </html>\
`

  if (options.separate_css) {
    return HTMLandCSSFile(full_html, css, options)
  } else {
    return HTMLFile(full_html, options)
  }
}

renderFuncFor['html'] = _legacy_compile_by_pdom(function(pdom, options) {
  const css = extractedCSS(pdom, options)
  makeClassAttrsFromClassLists(pdom)

  // render inline styles
  for (let pd of Array.from(flattenedPdom(pdom))) {
    pd.styleAttr = pdom_style_attrs_as_css_rule_list(styleForDiv(pd)).join(' ')
  }

  const rendered = try_or_fail_with_message(fail_with_message =>
    divToHTML(copyWithRootBody(pdom), {
      templateStr() {
        return fail_with_message('templating is not supported in HTML')
      },
      repeater() {
        return fail_with_message('repeaters are not supported in HTML')
      },
      showIf() {
        return fail_with_message('show ifs are not supported in HTML')
      },
    })
  )

  return renderStandardHTMLPage(rendered, css, options)
})

renderFuncFor['debug'] = _legacy_compile_by_pdom(function(DOM, options) {
  // dumps pdom
  // make every pdom attribute an html attribute, as is
  foreachPdom(DOM, pd =>
    (() => {
      const result = []
      for (let key of Object.keys(pd || {})) {
        const value = pd[key]
        if (!['tag', 'textContent', 'children', 'backingBlock'].includes(key)) {
          pd[`${key}Attr`] = value
          result.push(delete pd[key])
        }
      }
      return result
    })()
  )

  const html = divToHTML(DOM, {
    // no templating behavior
    templateStr(expr) {
      return `{{${expr}}}`
    },
    repeater() {
      return assert(() => false)
    },
  })

  return [{ filePath: 'debug', contents: html }]
})

renderFuncFor['PHP'] = _legacy_compile_by_pdom(function(DOM, options) {
  unwrapPhantomPdoms(DOM)

  const css = extractedCSS(DOM, options)
  makeClassAttrsFromClassLists(DOM)

  const render = pdom =>
    divToHTML(pdom, {
      templateStr(expr) {
        return `<?= $${expr} ?>`
      },
      repeater(pdom, attrs) {
        assert(() => _l.isEmpty(attrs))
        assert(() => pdom.instance_variable != null)
        return [
          `<?php foreach ($${pdom.repeat_variable} as ${pdom.instance_variable}) { ?>`,
          '<?php } ?>',
        ]
      },
      showIf(pdom, attrs) {
        return [`<?php if (${pdom.show_if}) ?>`, '<?php endif ?>']
      },
    })

  return renderStandardHTMLPage(render(copyWithRootBody(DOM)), css, options)
})

renderFuncFor['ERB'] = _legacy_compile_by_pdom(function(DOM, options) {
  unwrapPhantomPdoms(DOM)

  const css = extractedCSS(DOM, options)
  makeClassAttrsFromClassLists(DOM)

  const symbol = str => `:${str != null ? str.toLowerCase() : undefined}`

  // support links where method and url are both passed like
  // GET::/foo/bar
  foreachPdom(DOM, function(pd) {
    if (pd.tag === 'a') {
      const splitting = pd.hrefAttr.split('::', 2)
      if (splitting.length === 2) {
        return (
          ([pd['data-methodAttr'], pd.hrefAttr] = Array.from(splitting)),
          splitting
        )
      }
    }
  })

  const render = pdom =>
    divToHTML(pdom, {
      // FIXME form action does not get templated; doubt other things do either

      templateStr(expr) {
        return `<%= ${expr} %>`
      },
      repeater(pdom, attrs) {
        assert(() => _l.isEmpty(attrs))
        assert(() => pdom.instance_variable != null)
        return [
          `<% ${parens(pdom.repeat_variable)}.each do |${
            pdom.instance_variable
          }| %>`,
          '<% end %>',
        ]
      },

      showIf(pdom, attrs) {
        return [`<% if ${parens(pdom.show_if)} %>`, '<% end %>']
      },

      form(pdom, attrs) {
        const { action, method } = attrs
        delete attrs.action
        delete attrs.method

        // the only attr left, if any, should be class
        assert(() =>
          _.every(Array.from(_.keys(attrs)).map(k => ['class'].includes(k)))
        )
        const extra_attrs = _.pairs(attrs)
          .map(function(...args) {
            const [attr, val] = Array.from(args[0])
            return `, ${attr}: \"${val}\"`
          })
          .join('')

        return [
          `<%= form_tag \"${action}\", method: ${symbol(
            method
          )}${extra_attrs} do %>`,
          '<% end %>',
        ]
      },
      yield(pdom, attrs) {
        return '<%= yield %>'
      },
    })

  return renderStandardHTMLPage(
    render(copyWithRootBody(DOM)),
    css,
    options,
    "<%= csrf_meta_tags %>\n<%= javascript_include_tag 'application', 'data-turbolinks-track' => false %>"
  )
})

renderFuncFor['Handlebars'] = _legacy_compile_by_pdom(function(DOM, options) {
  unwrapPhantomPdoms(DOM)

  const css = extractedCSS(DOM, options)
  makeClassAttrsFromClassLists(DOM)

  const render = pdom =>
    divToHTML(pdom, {
      templateStr(expr) {
        return `{{ ${expr} }}`
      },
      repeater(pdom, attrs) {
        assert(() => _.isEmpty(attrs))
        assert(() => (pdom.instance_variable != null) === false)
        return [`{{#each ${pdom.repeat_variable}}}`, '{{/each}}']
      },
      showIf(pdom, attrs) {
        return [`{{#if ${pdom.show_if}}}`, '{{/if}}']
      },
    })

  if (options.separate_css) {
    return HTMLandCSSFile(render(DOM), css, options)
  } else {
    DOM.children = [
      {
        tag: 'style',
        innerHTML: `${indented(`\n${css}\n`)}`,
      },
    ].concat(DOM.children)

    return HTMLFile(render(DOM), options)
  }
})

renderFuncFor['Jinja2'] = _legacy_compile_by_pdom(function(DOM, options) {
  unwrapPhantomPdoms(DOM)

  const css = extractedCSS(DOM, options)
  makeClassAttrsFromClassLists(DOM)

  const render = pdom =>
    divToHTML(pdom, {
      templateStr(expr) {
        return `{{ ${expr} }}`
      },
      repeater(pdom, attrs) {
        assert(() => _.isEmpty(attrs))
        assert(() => (pdom.instance_variable != null) === false)
        return [
          `{% for ${pdom.instance_variable} in ${pdom.repeat_variable} %}`,
          '{% endfor %}',
        ]
      },
      showIf(pdom, attrs) {
        return [`{% if ${pdom.show_if} %}`, '{% endif %}']
      },
    })

  if (options.separate_css) {
    return HTMLandCSSFile(render(DOM), css, options)
  } else {
    DOM.children = [
      {
        tag: 'style',
        innerHTML: `${indented(`\n${css}\n`)}`,
      },
    ].concat(DOM.children)
    return HTMLFile(render(DOM), options)
  }
})

//# Tests

defaultExport.tests = tests = function(assert) {
  const { Doc } = require('./doc')
  const MultistateBlock = require('./blocks/multistate-block')
  const ArtboardBlock = require('./blocks/artboard-block')
  const TextBlock = require('./blocks/text-block')
  const LayoutBlock = require('./blocks/layout-block')
  ;({ Dynamicable } = require('./dynamicable'))

  const simpleDoc = new Doc()
  const text_block = new TextBlock({
    top: 10,
    left: 20,
    height: 40,
    width: 50,
    textContent: Dynamicable(String).from('Hello'),
  })
  const layout_block = new LayoutBlock({
    top: 100,
    left: 100,
    height: 100,
    width: 100,
  })
  const artboard = new ArtboardBlock({
    top: 1,
    left: 1,
    height: 500,
    width: 500,
  })
  for (let block of [text_block, layout_block, artboard]) {
    simpleDoc.addBlock(block)
  }

  const componentBlockTrees = componentBlockTreesOfDoc(simpleDoc)
  const artboardBlockTree = _l.find(
    componentBlockTrees,
    ({ block }) => block === artboard
  )

  // Compiler test helpers
  const getCompiledComponentByUniqueKey = uniqueKey =>
    compileComponentForInstanceEditor(
      _l.first(simpleDoc.getComponents(), c => c.uniqueKey === uniqueKey)
    )

  const compilerOptions = {
    templateLang: simpleDoc.export_lang,
    separate_css: simpleDoc.separate_css,
    css_classname_prefix: 'test',
    for_editor: false,
    for_component_instance_editor: true,
    getCompiledComponentByUniqueKey,
  }

  // Layout test helpers
  const makeDiv = function(direction, children) {
    if (children == null) {
      children = []
    }
    return { tag: 'div', vWidth: 100, vHeight: 100, direction, children }
  }

  var makeTree = function(depth, breadth, parentDirection) {
    if (breadth == null) {
      breadth = 3
    }
    if (parentDirection == null) {
      parentDirection = 'horizontal'
    }
    const myDirection = otherDirection(parentDirection)
    if (depth <= 0) {
      return makeDiv(myDirection, [])
    }

    return makeDiv(
      myDirection,
      __range__(0, breadth, false).map(_ =>
        makeTree(depth - 1, breadth, myDirection)
      )
    )
  }

  assert(() => makeTree(1, 5).children.length === 5)

  return {
    wrapAndUnwrapAreInversesOncePhantomPdomIsRemoved() {
      const pdom = compileComponentForInstanceEditor(
        artboardBlockTree,
        compilerOptions
      )
      const original = clonePdom(pdom)

      wrapPdom(pdom, { tag: 'show_if' })
      unwrapPdom(pdom)

      assert(() => pdom.children.length === 1)
      return assert(() => _l.isEqual(original, pdom.children[0]))
    },

    evalingShowIfTrueGivesTheSameAsNoShowIfAtAll() {
      const noShowIfDoc = simpleDoc.clone()
      const showIfDoc = simpleDoc.clone()

      noShowIfDoc.addBlock(
        new LayoutBlock({ top: 50, left: 50, width: 10, height: 10 })
      )
      showIfDoc.addBlock(
        new LayoutBlock({
          top: 50,
          left: 50,
          width: 10,
          height: 10,
          is_optional: true,
          show_if: 'true',
        })
      )

      const [showIfComponent, noShowIfComponent] = Array.from([
        _l.first(componentBlockTreesOfDoc(showIfDoc)),
        _l.first(componentBlockTreesOfDoc(noShowIfDoc)),
      ])

      const showIfPdom = compileComponentForInstanceEditor(
        showIfComponent,
        compilerOptions
      )
      const noShowIfPdom = compileComponentForInstanceEditor(
        noShowIfComponent,
        compilerOptions
      )

      // Must remove backingBlocks since those will be different and are not needed anymore
      foreachPdom(showIfPdom, pd => delete pd.backingBlock)
      foreachPdom(noShowIfPdom, pd => delete pd.backingBlock)

      // 1000px page width is completely arbitrary. This test shouldn't care about page width at all.
      const evaled = evalPdomForInstance(
        showIfPdom,
        getCompiledComponentByUniqueKey,
        simpleDoc.export_lang,
        1000
      )

      return assert(() => _l.isEqual(evaled, noShowIfPdom))
    },

    evalingShowIfFalseAndNoShowIfAtAllGiveDifferentPdoms() {
      const noShowIfDoc = simpleDoc.clone()
      const showIfDoc = simpleDoc.clone()

      noShowIfDoc.addBlock(
        new LayoutBlock({ top: 50, left: 50, width: 10, height: 10 })
      )
      showIfDoc.addBlock(
        new LayoutBlock({
          top: 50,
          left: 50,
          width: 10,
          height: 10,
          is_optional: true,
          show_if: 'false',
        })
      )

      const [showIfComponent, noShowIfComponent] = Array.from([
        _l.first(componentBlockTreesOfDoc(showIfDoc)),
        _l.first(componentBlockTreesOfDoc(noShowIfDoc)),
      ])

      const showIfPdom = compileComponentForInstanceEditor(
        showIfComponent,
        compilerOptions
      )
      const noShowIfPdom = compileComponentForInstanceEditor(
        noShowIfComponent,
        compilerOptions
      )

      // Must remove backingBlocks since those will be different and are not needed anymore
      foreachPdom(showIfPdom, pd => delete pd.backingBlock)
      foreachPdom(noShowIfPdom, pd => delete pd.backingBlock)

      // 1000px page width is completely arbitrary. This test shouldn't care about page width at all.
      const evaled = evalPdomForInstance(
        showIfPdom,
        getCompiledComponentByUniqueKey,
        simpleDoc.export_lang,
        1000
      )

      return assert(() => !_l.isEqual(evaled, noShowIfPdom))
    },

    addConstraintsMakesEveryoneEitherFlexFixedOrContent() {
      return (() => {
        const result = []
        for (let direction of ['horizontal', 'vertical']) {
          var { layoutType, flexLength, length, vLength } = layoutAttrsForAxis(
            direction
          )

          const pdom = makeTree(3, 5)
          pdom.backingBlock = {}
          pdom.children[1].children[1].backingBlock = { flexWidth: true }
          addConstraints(pdom)
          result.push(
            foreachPdom(pdom, pd =>
              assert(
                () =>
                  pd[layoutType] === 'flex' ||
                  pd[layoutType] === 'content' ||
                  pd[layoutType] === 'fixed'
              )
            )
          )
        }
        return result
      })()
    },

    singleBackingBlockDeterminingFlex() {
      return (() => {
        const result = []
        for (let direction of ['horizontal', 'vertical']) {
          var { layoutType, flexLength, length, vLength } = layoutAttrsForAxis(
            direction
          )

          var pdom = makeTree(1, 3, otherDirection(direction))
          pdom.children[1].backingBlock = _l.fromPairs([[flexLength, true]])

          addConstraints(pdom)
          assert(() => pdom.children[1][layoutType] === 'flex')
          assert(() => pdom[layoutType] === 'flex')

          enforceConstraints(pdom)
          assert(() => pdom.children[1].flexGrow === String(1))
          result.push(assert(() => pdom[layoutType] === 'flex'))
        }
        return result
      })()
    },

    singleDeepBackingBlockDeterminingFlex() {
      return (() => {
        const result = []
        for (let direction of ['horizontal', 'vertical']) {
          var { layoutType, flexLength, length, vLength } = layoutAttrsForAxis(
            direction
          )

          var pdom = makeTree(3, 3, otherDirection(direction))
          assert(() =>
            _l.isEmpty(pdom.children[1].children[1].children[1].children)
          )
          pdom.children[1].children[1].children[1].backingBlock = _l.fromPairs([
            [flexLength, true],
          ])

          addConstraints(pdom)
          assert(() => pdom[layoutType] === 'flex')
          assert(() => pdom.children[1][layoutType] === 'flex')
          assert(() => pdom.children[1].children[1][layoutType] === 'flex')
          assert(
            () =>
              pdom.children[1].children[1].children[1][layoutType] === 'flex'
          )

          enforceConstraints(pdom)
          assert(() => pdom[layoutType] === 'flex')
          assert(() => pdom.children[1].flexGrow === String(1))
          result.push(
            assert(
              () =>
                pdom.children[1].children[1].children[1].flexGrow === String(1)
            )
          )
        }
        return result
      })()
    },

    twoBlocksFlexibleOneInsideTheOther() {
      return (() => {
        const result = []
        for (let direction of ['horizontal', 'vertical']) {
          var { layoutType, flexLength, length, vLength } = layoutAttrsForAxis(
            direction
          )

          var pdom = makeTree(2, 3, otherDirection(direction))
          pdom.backingBlock = _l.fromPairs([[flexLength, true]])
          pdom.children[1].children[1].backingBlock = _l.fromPairs([
            [flexLength, true],
          ])

          addConstraints(pdom)
          assert(() => pdom[layoutType] === 'flex')
          assert(() => pdom.children[1][layoutType] === 'flex')
          assert(() => pdom.children[1].children[1][layoutType] === 'flex')

          enforceConstraints(pdom)
          result.push(assert(() => pdom.children[1].flexGrow === String(1)))
        }
        return result
      })()
    },

    twoBlocksChildFlexParentNotFlexShouldMakeEveryoneNotFlex() {
      return (() => {
        const result = []
        for (let direction of ['horizontal', 'vertical']) {
          var { layoutType, flexLength, length, vLength } = layoutAttrsForAxis(
            direction
          )

          var pdom = makeTree(2, 3, otherDirection(direction))
          pdom.backingBlock = {}
          pdom.children[1].children[1].backingBlock = _l.fromPairs([
            [flexLength, true],
          ])

          addConstraints(pdom)
          assert(() => pdom[layoutType] === 'content')
          assert(() => pdom.children[1][layoutType] === 'content')
          assert(() => pdom.children[1].children[1][layoutType] === 'fixed')

          enforceConstraints(pdom)
          assert(() => (pdom[length] = 100))
          assert(() => (pdom.children[1][length] = 100))
          result.push(
            assert(() => (pdom.children[1].children[1][length] = 100))
          )
        }
        return result
      })()
    },
  }
}

export default defaultExport

function __guardMethod__(obj, methodName, transform) {
  if (
    typeof obj !== 'undefined' &&
    obj !== null &&
    typeof obj[methodName] === 'function'
  ) {
    return transform(obj, methodName)
  } else {
    return undefined
  }
}
function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined
}
function __range__(left, right, inclusive) {
  let range = []
  let ascending = left < right
  let end = !inclusive ? right : ascending ? right + 1 : right - 1
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i)
  }
  return range
}
