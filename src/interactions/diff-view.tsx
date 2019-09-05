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
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let DiffViewInteraction;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import Block from '../block';
import { Doc } from '../doc';
import { LayoutEditorContextProvider } from '../editor/layout-editor-context-provider';
import config from '../config';
import { DraggingCanvas } from '../frontend/DraggingCanvas';
import Zoomable from '../frontend/zoomable';
import ViewportManager from '../editor/viewport-manager';
import Topbar from '../pagedraw/topbar';
import { zip_dicts, memoize_on } from '../util';
import { isEqual } from '../model';
import { LayoutView } from '../editor/layout-view';
import { GenericDynamicable } from '../dynamicable';
import { controlFromSpec, kind_of_sidebar_entry } from '../editor/sidebar';
import { EditorMode } from './editor-mode';

const ReactWrapper = createReactClass({
    displayName: 'ReactWrapper',
    render() { return this.props.children; }
});

export default DiffViewInteraction = class DiffViewInteraction extends EditorMode {
    constructor(oldDocJson, newDocJson) {
        // docs are guaranteed to be in readonly mode, which means we can *never* mutate them or allow them to be mutated
        let left;
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.canvas = this.canvas.bind(this);
        this.topbar = this.topbar.bind(this);
        this.getBlockSidebarControls = this.getBlockSidebarControls.bind(this);
        this.sidebar = this.sidebar.bind(this);
        [this.oldDoc, this.newDoc] = Array.from([oldDocJson, newDocJson].map(function(docjson) {
            const doc = Doc.deserialize(docjson);
            doc.enterReadonlyMode();
            return doc;
        }));

        this.docArea = (left = Block.unionBlock([this.oldDoc, this.newDoc].map(doc => Block.unionBlock(doc.blocks)))) != null ? left : {bottom: 0, right: 0};

        this.vp1 = new ViewportManager();
        this.vp2 = new ViewportManager();

        const blocksByKey = zip_dicts([_l.keyBy(this.oldDoc.blocks, 'uniqueKey'), _l.keyBy(this.newDoc.blocks, 'uniqueKey')]);

        this.sidebarControls = {};

        this.removedBlocks = _l.pickBy(blocksByKey, (...args) => { const [oldBlock, newBlock] = Array.from(args[0]); return oldBlock && !newBlock; });
        this.addedBlocks = _l.pickBy(blocksByKey, (...args) => { const [oldBlock, newBlock] = Array.from(args[0]); return !oldBlock && newBlock; });
        this.mutatedBlocks = _l.pickBy(blocksByKey, (...args) => { const [oldBlock, newBlock] = Array.from(args[0]); return oldBlock && newBlock; });
    }

    willMount(editor) {
        return this.editor = editor;
    }

    rerender() {
        return this.editor.handleDocChanged({fast: true, mutated_blocks: []});
    }

    linkAttrFromBlock(block) { return attr => {
        return {
            value: block[attr],
            requestChange: () => {
                this.editor.setEditorStateToDefault();
                return this.rerender();
            }
        };
    }; }

    canvas(editor) {
        const editorGeometry = {
            height: this.docArea.bottom + window.innerHeight,
            width: this.docArea.right + window.innerWidth
        };

        const layoutViewWrapper = (doc, viewport) => {
            return React.createElement(LayoutEditorContextProvider, {"doc": (doc)},
                React.createElement(Zoomable, {"viewportManager": (viewport), "style": ({flex: 1, backgroundColor: 'rgb(51, 51, 51, .9)'})},
                    React.createElement(DraggingCanvas, {"classes": ([]), "ref": "draggingCanvas",  
                        "style": ({cursor: this.cursor, height: editorGeometry.height, width: editorGeometry.width}),  
                        "onDrag": (() => {}), "onDoubleClick": (() => {}), "onMouseMove": (() => {}), "onInteractionHappened"() {},  
                        "onClick": (where => {
                            let left;
                            let block = doc.getBlockUnderMouseLocation(where);

                            const rootComponent = block != null ? block.getRootComponent() : undefined;
                            if (!rootComponent) { block = null; }

                            const componentForBlockKey = (doc, blockUniqueKey) => __guard__(__guard__(doc.getBlockByKey(blockUniqueKey), x1 => x1.getRootComponent()), x => x.uniqueKey);
                            this.selectedBlockKey = block != null ? block.uniqueKey : undefined;
                            this.selectedComponentKey = (left = componentForBlockKey(this.oldDoc, this.selectedBlockKey)) != null ? left : componentForBlockKey(this.newDoc, this.selectedBlockKey);

                            return this.rerender();
                        }
                        )},
                        React.createElement("div", {"style": ({flex: 1, zIndex: 0, isolation: 'isolate'})},
                            React.createElement(LayoutView, {"doc": (doc), "blockOverrides": ([]), "overlayForBlock": (block => {
                                const overlayComponentUniqueKey = __guard__(block.getRootComponent(), x => x.uniqueKey);
                                let classes = 'mouse-full-block-overlay';
                                if ((overlayComponentUniqueKey == null) || (overlayComponentUniqueKey !== this.selectedComponentKey)) { classes += ' faded-out'; }
                                return React.createElement("div", {"className": (classes)});
                            }
                            )})
                        )
                    )
                )
            );
        };

        return React.createElement("div", {"style": ({display: 'flex', flex: 1, flexDirection: 'row'})},
            (layoutViewWrapper(this.oldDoc, this.vp1)),
            React.createElement("div", {"className": "vdivider"}),
            (layoutViewWrapper(this.newDoc, this.vp2))
        );
    }

    topbar(editor, defaultTopbar) { return React.createElement("div", null, React.createElement(Topbar, {"editor": (editor), "whichTopbar": ('diff-viewer')})); }

    getBlockSidebarControls(blocks) { return memoize_on(this.sidebarControls, blocks[0].uniqueKey, () => {
        const [oldBlock, newBlock] = Array.from(blocks);

        const [oldSidebarControls, oldReactSidebarControls] = Array.from(_l.partition(oldBlock.sidebarControls(this.linkAttrFromBlock(oldBlock)), _l.isArray));
        const [newSidebarControls, newReactSidebarControls] = Array.from(_l.partition(newBlock.sidebarControls(this.linkAttrFromBlock(newBlock)), _l.isArray));

        // FIXME need to add support for developer stuff (!)
        const [oldDevControls, oldReactDevControls] = Array.from(_l.partition([], _l.isArray));
        const [newDevControls, newReactDevControls] = Array.from(_l.partition([], _l.isArray));

        // '0' is the user_visible_name in tuple
        const sidebarControls = zip_dicts([_l.keyBy(oldSidebarControls, '0'), _l.keyBy(newSidebarControls, '0')]);
        const devControls = zip_dicts([_l.keyBy(oldDevControls, '0'), _l.keyBy(newDevControls, '0')]);
        const nonReactControls = _l.values(_.extend(sidebarControls, devControls));

        const reactSideBarControls = _l.zip(oldReactSidebarControls, newReactSidebarControls);
        const reactDevControls = _l.zip(oldReactDevControls, newReactDevControls);
        let reactControls = reactSideBarControls.concat(reactDevControls);

        if (oldBlock.isComponent) {
            const oldComponentSpecControl = oldBlock.componentSpec.propControl.customSpecControl(this.linkAttrFromBlock(oldBlock.componentSpec)('propControl'));
            const newComponentSpecControl = newBlock.componentSpec.propControl.customSpecControl(this.linkAttrFromBlock(newBlock.componentSpec)('propControl'));
            reactControls = reactControls.concat(_l.zip(oldComponentSpecControl, newComponentSpecControl));
        }

        return [oldBlock, newBlock, _l.compact(nonReactControls.concat(reactControls).map((...args) => {
            const [oldControl, newControl] = Array.from(args[0]);
            const entryType = kind_of_sidebar_entry(oldControl, oldBlock);
            if (["spec", "dyn-spec"].includes(entryType)) {
                const [label, property, control] = Array.from(newControl);
                if (isEqual(oldBlock[property], newBlock[property])) { return; }
                return [oldControl, newControl];
            } else if ((entryType === "react") && (ReactDOMServer.renderToStaticMarkup(oldControl) !== ReactDOMServer.renderToStaticMarkup(newControl)) && !(["hr", "button"].includes(oldControl.type))) {
                return [oldControl, newControl];
            }
    }))
        ];
}); }

    sidebar(editor) {
        if (this.selectedBlockKey) {
            let left;
            const selectedBlock = (left = this.oldDoc.getBlockByKey(this.selectedBlockKey)) != null ? left : this.newDoc.getBlockByKey(this.selectedBlockKey);
            const rootComponent = selectedBlock.getRootComponent();
            return React.createElement("div", {"className": "sidebar bootstrap", "style": ({width: 250, display: 'flex', flexDirection: 'column'})},
                React.createElement("p", {"key": ("component-name"), "style": ({fontSize: '1.5em'})}, React.createElement("b", null, "Component Name:"), " ", (rootComponent.name)),
                (this.addedBlocks[selectedBlock.uniqueKey] ?
                    React.createElement("p", {"key": ("created-block-sidebar")}, "Block was created")
                :
                    React.createElement("div", {"key": ("mutated-block-sidebar")}, " ", (
                        rootComponent.andChildren().map((blockInComponent, ind) => {
                            // TODO: Show only top level blocks. Show removed block in sidebar when clicked
                            if (this.addedBlocks[blockInComponent.uniqueKey] || this.removedBlocks[blockInComponent.uniqueKey]) { return React.createElement("div", {"key": (`empty-div-${ind}`)}); }
                            const [oldBlock, newBlock, controls] = Array.from(this.getBlockSidebarControls(this.mutatedBlocks[blockInComponent.uniqueKey]));

                            const blockTitle = [React.createElement("p", {"key": (blockInComponent.name), "style": ({fontSize: '1.2em'})}, React.createElement("b", null, "Block Name:"), " ", (blockInComponent.name))];
                            const differences = controls.map((...args) => {
                                let isNewDynamic, isOldDynamic;
                                const [oldSpec, newSpec] = Array.from(args[0]), i = args[1];
                                const {
                                    attr
                                } = oldSpec;

                                if (oldBlock[attr] instanceof GenericDynamicable) {
                                    [isOldDynamic, isNewDynamic] = Array.from([oldBlock[attr].isDynamic, newBlock[attr].isDynamic]);
                                } else {
                                    [isOldDynamic, isNewDynamic] = Array.from([false, false]);
                                }

                                const [oldControl, old_react_key] = Array.from(controlFromSpec(oldSpec, oldBlock, this.linkAttrFromBlock(oldBlock), i));
                                const [newControl, new_react_key] = Array.from(controlFromSpec(newSpec, newBlock, this.linkAttrFromBlock(newBlock), i));
                                return React.createElement("div", {"key": (`control-container-${i}`)},
                                    (([
                                        [oldBlock, isOldDynamic, oldControl, "#BABABA", `old-${old_react_key}`],
                                        [newBlock, isNewDynamic, newControl, "inherit", `new-${new_react_key}`]
                                        ]).map((...args1) => {
                                            const [block, isDyn, control, color, key] = Array.from(args1[0]);
                                            return React.createElement("div", {"style": ({backgroundColor: color}), "key": (`div-${key}`)},
                                                React.createElement(ReactWrapper, {"key": (key)}, (control)),
                                                (isOldDynamic !== isNewDynamic ? React.createElement("p", {"key": (`dynamic-${key}`)}, React.createElement("b", null, "Dynamic:"), " ", (isDyn.toString())) : undefined),
                                                (isDyn ? React.createElement("p", {"key": (`code-${key}`)}, React.createElement("b", null, "Code:"), " ", (block[attr].code)) : undefined)
                                            );
                                    }))
                                );
                            });

                            let style = {};
                            if (blockInComponent.isEqual(selectedBlock)) { style = _l.extend({}, style, {backgroundColor: "#AED1D0"}); }
                            if (!_l.isEmpty(differences)) { return React.createElement("div", {"key": (`diffs-parent-${ind}`), "style": (style)}, (blockTitle.concat(differences))); } else { return React.createElement("div", {"key": (`empty-div-${ind}`)}); }
                    })
                    ), " ")
                )
            );
        } else {
            const blackListedProperties = ['intentionallyMessWithUser', 'version', 'metaserver_id'];
            return React.createElement("div", {"className": "sidebar bootstrap", "style": ({width: 250, display: 'flex', flexDirection: 'column'})},
                React.createElement("b", {"key": ("title")}, "Select a block to see its diff"),
                React.createElement("br", {"key": ("br")}),
                React.createElement("b", {"key": ("subtitle")}, "Doc Level Differences:"),
                (!_l.isEmpty(_l.values(this.removedBlocks)) ?
                    React.createElement("div", {"key": ("removed-blocks")},
                        React.createElement("p", null, React.createElement("b", null, "Removed blocks:")),
                        (_l.values(this.removedBlocks).map((...args) => { const [removedBlock] = Array.from(args[0]); return React.createElement("p", {"key": (removedBlock.name)}, (removedBlock.name)); }))
                    ) : undefined
                ),

                React.createElement("div", {"key": ("body")}, (
                    _l.keys(_l.omit(this.oldDoc.properties, blackListedProperties))
                        .map(prop => ({oldVal: this.oldDoc[prop], newVal: this.newDoc[prop], propLabel: prop}))
                        .filter(({oldVal, newVal}) => {
                            return (oldVal !== newVal) && ["boolean", "string", "number"].includes(typeof newVal);
                    })
                        .map(({propLabel, oldVal, newVal}, i) => {
                            return React.createElement("div", {"key": (propLabel)},
                                React.createElement("b", {"style": ({fontSize: '1.3em'})}, (propLabel), ":"),
                                React.createElement("div", {"style": ({paddingLeft: '25px'})},
                                    React.createElement("b", null, "Old value:"), " ", (oldVal ? oldVal.toString() : "not set"),
                                    React.createElement("br", null),
                                    React.createElement("b", null, "New value:"), " ", (newVal ? newVal.toString() : "not set")
                                )
                            );
                    })
                ))
            );
        }
    }
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}