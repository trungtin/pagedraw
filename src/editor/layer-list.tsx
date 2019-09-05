// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from 'underscore'
import _l from 'lodash'
import React from 'react'
import createReactClass from 'create-react-class'
import ReactDOM from 'react-dom'
import FlipMove from 'react-flip-move'
import { prod_assert, isPermutation } from '../util'
import EditableText from '../frontend/editable-text'
import LockToggle from '../frontend/lock-toggle'
import config from '../config'

export default createReactClass({
  displayName: 'LayerList',

  componentWillMount() {
    this.blockBeingRenamed = null
    this.collapsedBlocksById = {}
    return this.openFoldersForBlocks(this.props.doc, this.props.selectedBlocks)
  },

  isCollapsed(block) {
    // defaults to closed
    return this.collapsedBlocksById[block.uniqueKey] != null
      ? this.collapsedBlocksById[block.uniqueKey]
      : true
  },

  setCollapsed(block, collapsed) {
    if (collapsed) {
      return delete this.collapsedBlocksById[block.uniqueKey]
    } else {
      return (this.collapsedBlocksById[block.uniqueKey] = false)
    }
  },

  componentWillReceiveProps(nextProps) {
    const selectionChanged = !isPermutation(
      nextProps.selectedBlocks,
      this.props.selectedBlocks.map(b => b.getBlock())
    )
    if (selectionChanged) {
      return this.openFoldersForBlocks(nextProps.doc, nextProps.selectedBlocks)
    }
  },

  openFoldersForBlocks(doc, blocks) {
    // we're doing a lot of .parent calculations— probably want to be in readonly mode to reuse a blockTree
    return doc.inReadonlyMode(() => {
      // takes a list of blocks since we're usually passing in selectedBlocks, but we're just doing the same
      // thing over each block
      for (let block of blocks) {
        if (config.layerListExpandSelectedBlock) {
          this.setCollapsed(block, false)
        }

        // expand all ancestors of block starting with block.parent
        let ancestor = block.parent
        while (ancestor) {
          // open the folder for the ancestor
          this.setCollapsed(ancestor, false)

          // move on to the next ancestor
          ancestor = ancestor.parent
        }
      }
    })
  },

  getTreeList() {
    const block_tree_root = this.props.doc.getBlockTree()

    // treeList :: [{block: Block, indent: Int, hasChildren: Boolean}]
    const treeList = []

    var appendToTreeList = (blockNode, depth) => {
      treeList.push({
        block: blockNode.block,
        depth,
        hasChildren: blockNode.children.length > 0,
      })
      if (!this.isCollapsed(blockNode.block)) {
        return Array.from(blockNode.children).map(child =>
          appendToTreeList(child, depth + 1)
        )
      }
    }

    for (let root of Array.from(block_tree_root.children)) {
      appendToTreeList(root, 0)
    }

    return treeList
  },

  render() {
    prod_assert(() => this.props.doc.isInReadonlyMode())

    const treeListView = this.getTreeList().map(
      ({ block, depth, hasChildren }) => {
        return React.createElement(LayerListItem, {
          key: block.uniqueKey,
          ref: `item-${block.uniqueKey}`,
          block: block,
          parentLayerList: this,

          labelValueLink: this.linkAttr(block, 'label'),
          depth: depth,
          hasChildren: hasChildren,
          isSelected: Array.from(this.props.selectedBlocks).includes(block),
          isCollapsed: this.isCollapsed(block),
          isBeingRenamed: block === this.blockBeingRenamed,
          isLockedValueLink: this.linkAttr(block, 'locked'),
        })
      }
    )

    return React.createElement(
      'div',
      {
        className:
          'layer-list editor-scrollbar scrollbar-show-on-hover bootstrap',
      },
      !_l.isEmpty(this.props.doc.blocks)
        ? React.createElement(
            'div',
            {
              onClick: () => {
                this.props.onBlocksSelected([], { additive: false })
                return this.props.onChange({ fast: true })
              },
              style: {
                paddingLeft: 15,
                display: 'flex',
                justifyContent: 'space-between',
              },
              className: `layer-list-item ${
                _l.isEmpty(this.props.selectedBlocks) ? 'selected' : ''
              }`,
            },
            React.createElement('div', null, 'Doc'),
            React.createElement(
              'div',
              {
                style: {
                  maxWidth: 100,
                  whiteSpace: 'nowrap',
                  overflowX: 'hidden',
                  textOverflow: 'ellipsis',
                },
              },
              this.props.doc.url
            )
          )
        : undefined,
      _l.isEmpty(this.props.doc.blocks)
        ? React.createElement(
            'div',
            { className: 'sidebar-default-content' },
            React.createElement(
              'div',
              { style: { padding: 15, fontSize: 14, fontFamily: 'Lato' } },
              React.createElement('h3', null, 'Welcome to Pagedraw!'),
              React.createElement('p', null, 'Few things you can try:'),
              React.createElement(
                'ul',
                null,
                React.createElement(
                  'li',
                  null,
                  "Press 'a' and draw an artboard that can later become your page or React component"
                ),
                React.createElement(
                  'li',
                  null,
                  "Press 'r' to draw a rectangle or 't' to add text element"
                ),
                React.createElement(
                  'li',
                  null,
                  "Press 'd' to switch to Dynamic Data mode and select elements you want to make dynamic"
                ),
                React.createElement(
                  'li',
                  null,
                  "Sync code with your codebase by pressing 'Sync Code' and following the setup instuctions"
                )
              )
            )
          )
        : config.layerListFlipMoveAnimation
        ? React.createElement(FlipMove, { duration: 100 }, treeListView)
        : treeListView
    )
  },

  linkAttr(block, attr) {
    return {
      value: block[attr],
      requestChange: value => {
        block[attr] = value
        return this.props.onChange()
      },
    }
  },

  componentDidUpdate(prevProps) {
    return window.requestIdleCallback(() => {
      const selectedBlocks = _l.map(this.props.selectedBlocks, 'uniqueKey')
      const prevSelectedBlocks = _l.map(prevProps.selectedBlocks, 'uniqueKey')

      if (!_l.isEqual(selectedBlocks, prevSelectedBlocks)) {
        return (() => {
          const result = []
          for (let blockKey of Array.from(selectedBlocks)) {
            const item = this.refs[`item-${blockKey}`]
            // scrollIntoViewIfNeeded() is only available on Chrome
            if (item != null) {
              result.push(
                __guardMethod__(
                  ReactDOM.findDOMNode(item),
                  'scrollIntoViewIfNeeded',
                  o => o.scrollIntoViewIfNeeded()
                )
              )
            } else {
              result.push(undefined)
            }
          }
          return result
        })()
      }
    })
  },

  handleToggleCollapsed(e, block) {
    this.setCollapsed(block, !this.isCollapsed(block))
    this.props.onChange({ fast: true, subsetOfBlocksToRerender: [] })

    // don't let handleLayerItemMouseDown get fired; it's onChange is redundant and much slower
    e.stopPropagation()
    return e.preventDefault()
  },

  handleLayerItemMouseDown(e, block) {
    this.props.onLayerItemMouseDown()
    if (e.buttons === 1) {
      this.props.onBlocksSelected([block], {
        additive: e.metaKey || e.ctrlKey || e.shiftKey,
      })
    }
    return this.props.onChange({ fast: true, mutated_blocks: {} })
  },

  handleMouseOver(block) {
    this.props.setHighlightedblock(block)
    return this.rerenderHighlight([this.props.highlightedBlock, block])
  },

  handleMouseLeave(block) {
    this.props.setHighlightedblock(null)
    return this.rerenderHighlight([this.props.highlightedBlock])
  },

  rerenderHighlight(blocks) {
    // if there already exists a @blocks_to_rerender_highlight, we've already done a requestAnimationFrame
    const needs_frame = this.blocks_to_rerender_highlight != null

    if (this.blocks_to_rerender_highlight == null) {
      this.blocks_to_rerender_highlight = {}
    }

    // add blocks to the set of blocks we need to rerender
    for (let block of Array.from(blocks)) {
      if (block != null) {
        this.blocks_to_rerender_highlight[block.uniqueKey] = true
      }
    }

    if (needs_frame) {
      return window.requestAnimationFrame(() => {
        this.props.onChange({
          fast: true,
          dontUpdateSidebars: false,
          subsetOfBlocksToRerender: _l.keys(this.blocks_to_rerender_highlight),
        })
        return delete this.blocks_to_rerender_highlight
      })
    }
  },

  handleEditableTextSwitchToEditMode(block, isEditMode) {
    this.blockBeingRenamed = isEditMode ? block : null
    return this.props.onChange({ fast: true, mutated_blocks: {} })
  },
})

var LayerListItem = createReactClass({
  render() {
    const {
      labelValueLink,
      depth,
      hasChildren,
      isSelected,
      isCollapsed,
      isBeingRenamed,
      isLockedValueLink,
      block,
      parentLayerList,
    } = this.props
    return React.createElement(
      'div',
      {
        className: `layer-list-item ${isSelected ? 'selected' : ''} ${
          depth === 0 ? 'top-level' : ''
        }`,
        style: {
          paddingLeft: 25 + 15 * depth,
        },
        onMouseDown(e) {
          return parentLayerList.handleLayerItemMouseDown(e, block)
        },
        onMouseOver() {
          return parentLayerList.handleMouseOver(block)
        },
        onMouseLeave() {
          return parentLayerList.handleMouseLeave(block)
        },
      },
      React.createElement(
        'div',
        { className: 'layer-list-item-line' },
        hasChildren
          ? // Allows user to collapse layer
            // collapser draws a triangle, using the css border hack
            React.createElement(
              'div',
              {
                onMouseDown(e) {
                  return parentLayerList.handleToggleCollapsed(e, block)
                },
                className: 'layer-list-collapser',
              },
              React.createElement('div', {
                className: 'layer-list-collapser-triangle',
                style: {
                  borderColor: `transparent transparent transparent ${
                    isSelected ? '#fff' : '#8c8c8c'
                  }`,
                  transform: !isCollapsed ? 'rotate(90deg)' : '',
                },
              })
            )
          : undefined,
        React.createElement(EditableText, {
          valueLink: labelValueLink,
          isEditable: isSelected,
          isEditing: isBeingRenamed,
          onSwitchToEditMode(isEditMode) {
            return parentLayerList.handleEditableTextSwitchToEditMode(
              block,
              isEditMode
            )
          },
          editingStyle: { width: '100%' },
        }),

        !isBeingRenamed
          ? React.createElement(
              'div',
              {
                className: block.locked ? 'locked' : undefined,
                style: { flexShrink: 0, marginLeft: 5 },
              },
              React.createElement(LockToggle, { valueLink: isLockedValueLink })
            )
          : undefined
      )
    )
  },

  shouldComponentUpdate(nextProps) {
    return !// it's just easier if we bail and don't have to think about extra state around renaming
    (
      nextProps.isBeingRenamed === this.props.isBeingRenamed &&
      this.props.isBeingRenamed === false &&
      nextProps.labelValueLink.value === this.props.labelValueLink.value &&
      nextProps.depth === this.props.depth &&
      nextProps.hasChildren === this.props.hasChildren &&
      nextProps.isSelected === this.props.isSelected &&
      nextProps.isCollapsed === this.props.isCollapsed &&
      nextProps.isLockedValueLink.value === this.props.isLockedValueLink.value
    )
  },
})

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
