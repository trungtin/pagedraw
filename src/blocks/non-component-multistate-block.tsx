/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MultistateAltsBlock, MultistateHoleBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import { propLink } from '../util';
import config from '../config';
import Block from '../block';
import { ObjectSelectControl } from '../editor/sidebar-controls';
import { pdomToReact } from '../editor/pdom-to-react';
import { Model } from '../model';
import { Dynamicable } from '../dynamicable';
const defaultExport = {};

defaultExport.MutlistateAltsBlock = Model.register('multistate-alts', (MultistateAltsBlock = (function() {
    MultistateAltsBlock = class MultistateAltsBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Multistate Alternates';
    
            this.prototype.properties = {};
    
            this.prototype.canContainChildren = true;
        }

        constructor(json) {
            super(json);
        }

        sidebarControls(linkAttr, onChange) {
            // assert => false # should never be called, because we should be doing the pair's sidebar
            return [];
        }

        editor() {
            return React.createElement("div", {"style": ({position: 'relative', minHeight: this.height, minWidth: this.width})},
                React.createElement("div", {"style": ({
                    position: 'absolute', top: 20, left: 30,
                    fontFamily: 'Helvetica', fontWeight: 'bold', fontSize: '1.3em'
                })}, (this.getLabel())),
                React.createElement("div", {"style": ({
                    border: '10px dashed #DEDEDE', borderRadius: 30,
                    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0})})
            );
        }
    };
    MultistateAltsBlock.initClass();
    return MultistateAltsBlock;
})())
);

defaultExport.MutlistateHoleBlock = Model.register('multistate-hole', (MultistateHoleBlock = (function() {
    MultistateHoleBlock = class MultistateHoleBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Multistate Hole';
    
            this.prototype.properties = {
                altsUniqueKey: String,
                stateExpr: Dynamicable.CodeType,
                previewedArtboardUniqueKey: String // for .order
            };
    
            this.prototype.resizableEdges = [];
        }

        constructor(json) {
            super(json);
            if (this.stateExpr == null) { this.stateExpr = Dynamicable.code(""); }
        }

        defaultSidebarControls() { return [
            ['Preview', 'previewedArtboardUniqueKey', ObjectSelectControl({
                isEqual(a, b) { return a === b; },
                getLabel: opt => this.doc.getBlockByKey(opt).name,
                options: _l.map(this.getAlts(), 'uniqueKey')
            })]
        ]; }

        isNonComponentMultistate() { return true; }

        getAlts() {
            let left;
            return (left = __guard__(this.doc.getBlockByKey(this.altsUniqueKey), x => x.children)) != null ? left : [];
        }

        getVirtualChildren() { return this.getAlts(); }

        getStates() {
            return _l.fromPairs(Array.from(this.getAlts()).map((alt) => [alt.name, alt.blockTree]));
        }

        getArtboardForEditor() {
            let needle;
            const artboard = this.doc.getBlockByKey(this.previewedArtboardUniqueKey);
            if ((needle = artboard, !Array.from(this.getAlts()).includes(needle))) { return null; }
            return artboard;
        }

        editor() {
            const artboard = this.getArtboardForEditor();

            if ((artboard == null)) {
                return React.createElement("div", {"style": ({
                    backgroundColor: 'rgb(233, 176, 176)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Open Sans", sans-serif'
                })}, `\
No state\
`);
            }

            const ShouldSubtreeRender = require('../frontend/should-subtree-render');
            const {LayoutEditorContextProvider} = require('../editor/layout-editor-context-provider');
            const { LayoutView } = require('../editor/layout-view');
            const {Doc} = require('../doc');

            // Pick from the existing doc instead of getting a freshRepresentation because they're not going to
            // be mutated.  Think about that if you refactor this code.
            const shifted_doc = new Doc(_l.pick(this.doc, ['export_lang', 'fonts', 'custom_fonts']));

            // We can't passs {blocks} to the Doc constructor or the constructor will set block.doc
            shifted_doc.blocks = artboard.getChildren().map(block => {
                const clone = block.freshRepresentation();
                clone.top -= artboard.top;
                clone.left -= artboard.left;

                // HACK tell the cloned blocks they belong to the source doc, so instance blocks
                // look for their source component in the source doc
                clone.doc = this.doc;

                return clone;
            });

            shifted_doc.enterReadonlyMode();

            // UNCLEAR what's the pointerEvents 'none' for?  @michael wrote it in the original code
            return React.createElement(LayoutEditorContextProvider, {"doc": (this.doc)},
                React.createElement("div", {"style": ({width: artboard.width, height: artboard.height, pointerEvents: 'none'})},
                    React.createElement(LayoutView, {"doc": (shifted_doc), "blockOverrides": ({}), "overlayForBlock": (() => null)})
                )
            );
        }
    };
    MultistateHoleBlock.initClass();
    return MultistateHoleBlock;
})())
);


export default defaultExport;


function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}