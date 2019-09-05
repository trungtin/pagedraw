// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Doc;
import _ from 'underscore';
import _l from 'lodash';
import { Model, setsOfModelsAreEqual, rebase, rebaseSetsOfModels } from './model';
import { assert, zip_sets_by, find_unused, dfs, find_connected, flatten_tree } from './util';
import config from './config';
import Block from './block';
import TextBlock from './blocks/text-block';
import { ExternalComponentSpec } from './external-components';
import { ExternalCodeSpec } from './libraries';
import { defaultFonts, Font, fontsByName } from './fonts';
import { Library } from './libraries';

import {
    blocks_from_block_tree,
    blocklist_to_blocktree,
    component_subtrees_of_block_tree,
} from './core';

// we can't [].reduce(Math.min) because reduce passes a bunch of extra params, confusing min
const [max, min] = Array.from(['max', 'min'].map(m => arr => arr.reduce((accum, next) => Math[m](accum, next))));

class DocBlock extends Block {
    static initClass() {
        this.prototype.isDocBlock = true;
        this.prototype.canContainChildren = true;
    
        this.property('height',
            {get() { return this.doc.docLength(); }});
    
        this.property('width',
            {get() { return this.doc.docWidth(); }});
    }

    constructor(doc) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.doc = doc;
        super({top: 0, left: 0});
    }

    // clone, without .height live updating
    currentDimensions() { return new DocGeometryBlock({top: this.top, left: this.left, width: this.width, height: this.height}); }
}
DocBlock.initClass();

class DocGeometryBlock extends Block {
    static initClass() {
        // like a docBlock, but without recomputing height/width every time they're accessed
        this.prototype.isDocBlock = true;
        this.prototype.canContainChildren = true;
    }
}
DocGeometryBlock.initClass();


const defaultExport = {};


defaultExport.Doc = Model.register('doc', (Doc = (function() {
    Doc = class Doc extends Model {
        static initClass() {
            this.SCHEMA_VERSION = "7";
            this.prototype.properties = {
                // Schema Version
                version: String,
    
                metaserver_id: String,
    
                url: String,  // actually doc_name; called url for historical reasons
                blocks: [Block],
                fonts: [Font],
                custom_fonts: [Font], // includes fonts not currently enabled so they can persist
    
                filepath_prefix: String,
                export_lang: String,
                separate_css: Boolean,
                inline_css: Boolean,
                styled_components: Boolean,
                import_fonts: Boolean,
    
                externalComponentSpecs: [ExternalComponentSpec],
    
                libraries: [Library],
    
                figma_url: String,
    
                // wartime
                intentionallyMessWithUser: Boolean
            };
    
    
            this.property('artboards',
                {get() { return this.blocks.filter(b => b.isArtboardBlock); }});
        }

        constructor(json) {
            {
              // Hack: trick Babel/TypeScript into allowing this before super.
              if (false) { super(); }
              let thisFn = (() => { return this; }).toString();
              let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
              eval(`${thisName} = this;`);
            }
            this._cached = this._cached.bind(this);
            this.getComponentBlockTreeBySourceRef = this.getComponentBlockTreeBySourceRef.bind(this);
            this.getBlockTreeParentForBlock = this.getBlockTreeParentForBlock.bind(this);
            this.getRootComponentForBlock = this.getRootComponentForBlock.bind(this);
            if (json == null) { json = {}; }
            if ((json.version != null) && (json.version !== Doc.SCHEMA_VERSION)) { throw new Error("can't override doc version"); }

            // call Model.constructor
            super(json);

            // If we're buggy and got to this point, where we have an incorrect @version set, keep the old version.
            // It might help us debug later.
            if (this.version == null) { this.version = Doc.SCHEMA_VERSION; }

            // mix in defaults
            if (this.blocks == null) { this.blocks = []; }
            if (this.filepath_prefix == null) { this.filepath_prefix = 'src/pagedraw'; }
            if (this.export_lang == null) { this.export_lang = 'JSX'; }
            if (this.fonts == null) { this.fonts = defaultFonts; }
            if (this.separate_css == null) { this.separate_css = true; }
            if (this.import_fonts == null) { this.import_fonts = true; }
            if (this.custom_fonts == null) { this.custom_fonts = []; }
            if (this.libraries == null) { this.libraries = []; }

            if (this.externalComponentSpecs == null) { this.externalComponentSpecs = []; }

            if (this.devExternalCodeFetchUrl == null) { this.devExternalCodeFetchUrl = config.default_external_code_fetch_url; }

            // wartime
            if (this.intentionallyMessWithUser == null) { this.intentionallyMessWithUser = false; }

            // setup
            this.docBlock = new DocBlock(this);
            for (let block of Array.from(this.blocks)) { block.doc = this; }

            // caching mechanism
            this.readonlyMode = false;
            this.caches = {};
        }


        serialize() {  return this._cached('serialized', () => {
            const json = Doc.prototype.__proto__.serialize.call(this, );
            json.blocks = _.indexBy(json.blocks, 'uniqueKey');
            return json;
        }); }

        static deserialize(json) {
            // Firebase defaults to null for a new doc.  If we try to load a doc that's just null, create a fresh one.
            // FIXME(maybe) this relies on the Firebase behavior of defaulting to null value.  This is the only place
            // in the codebase we're not completely agnostic to Firebase.
            if (json === null) { return new (this)(); }

            if (json.version !== Doc.SCHEMA_VERSION) {
                throw new Error(`tried to load doc with schema version ${json.version}, but can only load version ${Doc.SCHEMA_VERSION}`);
            }

            json = _l.clone(json); // so when we mutate it we keep the function pure
            if (json.blocks != null) { json.blocks = _.values(json.blocks); }  // un-index blocks by uniqueKey
            return super.deserialize(json);
        }

        //# caching mechanism

        enterReadonlyMode() {
            if (this.readonlyMode === true) {
                // re-entering readonly mode is safe
                return;
            }

            // set up caches
            this.caches = {};
            return this.readonlyMode = true;
        }


        leaveReadonlyMode() {
            // clear caches so gc can collect them
            this.caches = {};
            return this.readonlyMode = false;
        }


        inReadonlyMode(fn) {
            const was_in_readonly_mode = this.readonlyMode;
            this.enterReadonlyMode();
            try {
                return fn();
            } finally {
                if (was_in_readonly_mode === false) {
                    this.leaveReadonlyMode();
                }
            }
        }

        isInReadonlyMode() {
            return this.readonlyMode;
        }

        _cached(label, impl) {
            if (this.readonlyMode) { return (this.caches[label] != null ? this.caches[label] : (this.caches[label] = impl()));
            } else { return impl(); }
        }

        //# utils

        getOrderedBlockList() { return this._cached('orderedBlockList', () => Block.sortedByLayerOrder(this.blocks)); }
        getBlockTree() { return this._cached('blockTree', () => blocklist_to_blocktree(this.getOrderedBlockList())); }
        getComponentBlockTrees() { return this._cached('componentBlockTrees', () => component_subtrees_of_block_tree(this.getBlockTree())); }
        getComponents() { return this.getComponentBlockTrees().map(({block}) => block); }

        getComponentBlockTreeBySourceRef(sourceRef) {
            return this._cached('componentBlockTreeBySourceRef', () => _l.keyBy(this.getComponentBlockTrees(), 'block.componentSpec.componentRef'))[sourceRef];
        }

        getBlockTreeParentForBlock(block) {
            const invertedBlockTree = this._cached('invertedBlockTree', () => {
                const inverted_tree = {};

                var insert_into_inverted_tree = function(blockNode, parentNode) {
                    inverted_tree[blockNode.block.uniqueKey] = parentNode;
                    return Array.from(blockNode.children).map((childNode) => insert_into_inverted_tree(childNode, blockNode));
                };

                const block_tree_root = this.getBlockTree();
                // block_tree_root isn't quite a block_tree_node, so we can't insert_into_inverted_tree(block_tree_root, null)
                // in particular, there's no block_tree_root.block.uniqueKey.
                for (let node of Array.from(block_tree_root.children)) { insert_into_inverted_tree(node, block_tree_root); }

                return inverted_tree;
            });

            return invertedBlockTree[block.uniqueKey];
        }

        getRootComponentForBlock(block) { return this.inReadonlyMode(() => {
            const rootComponentsByUniqueKey = this._cached('rootComponents', () => {
                return _l.fromPairs(_l.flatten( ( 
                    Array.from(this.getComponents()).map((componentBlock) => Array.from(flatten_tree(componentBlock, block => block.getVirtualChildren())).map((descendantBlock) => [descendantBlock.uniqueKey, componentBlock]))
                ))
                );
            });

            return rootComponentsByUniqueKey[block.uniqueKey];
    }); }

        getBlockTreeByUniqueKey(uniqueKey) {
            const index = this._cached('blockTreeIndexedByKey', () => {
                const dict = {};
                var walk = function(node) {
                    dict[node.block.uniqueKey] = node;
                    return Array.from(node.children).map((child) => walk(child));
                };
                // @getBlockTree() isn't quite a block_tree_node, ironically, because it has no .block
                for (let root of Array.from(this.getBlockTree().children)) { walk(root); }
                return dict;
            });
            return index[uniqueKey];
        }

        getParent(child) {
            let left;
            if (this.readonlyMode) { return this.getBlockTreeParentForBlock(child).block; }
            return (left = _l.minBy(this.blocks.filter(parent => parent.isAncestorOf(child)), 'order')) != null ? left : this.docBlock;
        }

        blockAndChildren(block) { return blocks_from_block_tree(block.blockTree); }
        getChildren(parent) { return _l.flatMap(parent.blockTree.children, ({block}) => block.andChildren()); }
        getImmediateChildren(parent) { return _l.map(parent.blockTree.children, 'block'); }

        // Get components marked "shouldSync", or are transitively required by a "shouldSync" component
        componentTreesToCompile() { return this.inReadonlyMode(() => {
            // do imports here because of import cycles
            const {InstanceBlock} = require('./blocks/instance-block');

            // NOTE find_connected relies on object equality,
            // so we're relying @getComponentBlockTreeBySourceRef and @getComponentBlockTrees to return shared objects
            return find_connected(_l.filter(this.getComponentBlockTrees(), 'block.componentSpec.shouldCompile'), component_block_tree => {
                return blocks_from_block_tree(component_block_tree)
                    .filter(b => b instanceof InstanceBlock)
                    .map(instance => this.getComponentBlockTreeBySourceRef(instance.sourceRef))
                    .filter(cbt => cbt != null);
            });
        }); } // source component exists

        getBlockByKey(key) { return _l.find(this.blocks, b => b.uniqueKey === key); }

        getBlockUnderMouseLocation(where) {
            const candidates = ((() => {
                const result = [];
                for (let block of Array.from(this.blocks)) {                     if (block.containsPoint(where) && !block.locked) {
                        result.push(block);
                    }
                }
                return result;
            })());
            return _l.minBy(candidates, 'order');
        }

        getCustomEqualityChecks() { return _l.extend({}, super.getCustomEqualityChecks(), {
            blocks: setsOfModelsAreEqual,
            fonts: setsOfModelsAreEqual,
            externalComponentSpecs: setsOfModelsAreEqual,
            externalCodeSpecs: setsOfModelsAreEqual
        }
        ); }

        getCustomRebaseMechanisms() { return _l.extend({}, super.getCustomRebaseMechanisms(), {
            blocks: (left, right, base) => {
                const blocks = rebaseSetsOfModels(left, right, base);
                for (let block of Array.from(blocks)) { block.doc = this; }
                return blocks;
            },
            fonts: rebaseSetsOfModels,
            externalComponentSpecs: rebaseSetsOfModels,
            externalCodeSpecs: rebaseSetsOfModels,

            // FIXME: The following line should not be needed and we should probably store the spec tree in the doc like we
            // do w/ the regular specs
            externalCodeSpecTree: rebase
        }
        ); }

        getExternalCodeSpecs() { return _l.flatMap(this.libraries, lib => lib.getCachedExternalCodeSpecs()); }

        // getExternalCodeSpecTree :: () -> ExternalCodeTree
        // where ExternalCodeTree ::{name: String?, children: [ExternalCodeTree]} | ExternalCodeSpec
        getExternalCodeSpecTree() { return {name: 'root', children: this.libraries.map(lib => ({
            name: lib.name(),
            children: lib.getCachedExternalCodeSpecs()
        }))
        }; }

        libCurrentlyInDevMode() { return _l.find(this.libraries, {inDevMode: true}); }

        addLibrary(lib) {
            let matching;
            if (matching = _l.find(this.libraries, other => other.matches(lib))) {
                return this.libraries.splice(this.libraries.indexOf(matching), 1, lib);
            } else {
                return this.libraries.push(lib);
            }
        }

        removeLibrary(lib) {
            const index = this.libraries.indexOf(lib);
            if (index === -1) { return; }
            return this.libraries.splice(index, 1);
        }

        removeBlock(block) {
            const index = this.blocks.indexOf(block);
            // noop if the block is not in the doc
            if (index === -1) { return; }
            this.blocks.splice(index, 1);
            return block._underlyingBlock = null;
        }

        removeBlocksByUniqueKey(uniqueKeys) {
            let old_blocks;
            [this.blocks, old_blocks] = Array.from([[], this.blocks]);
            const set_of_unique_keys_to_delete = new Set(uniqueKeys);
            return Array.from(old_blocks).map((block) =>
                set_of_unique_keys_to_delete.has(block.uniqueKey) ?
                    (block._underlyingBlock = null)
                :
                    this.blocks.push(block));
        }

        removeBlocks(blocks) {
            return Array.from(blocks).map((block) => this.removeBlock(block));
        }


        addBlock(block) {
            block.doc = this;
            // auto name blocks
            if (_l.isEmpty(block.name) && config.autoNumberBlocks && (block.getTypeLabel != null) && !(block instanceof TextBlock)) {
                block.name = find_unused(_l.map(this.blocks, 'name'), function(i) {
                    if ((i === 0) && (!block.isArtboardBlock)) { return block.getTypeLabel(); } else {  return `${block.getTypeLabel()} ${i+1}`; }
                });
            }
            this.blocks.push(block);
            if (typeof block.onAddedToDoc === 'function') {
                block.onAddedToDoc();
            }
            return block;
        }

        replaceBlock(block, replacement) {
            const index = this.blocks.indexOf(block);
            if (index === -1) { throw new Error("replacing nonexistant block", block); }
            replacement.doc = this;
            block._underlyingBlock = replacement;
            return this.blocks.splice(index, 1, replacement);
        }

        docLength() { let left;
        return (left = __guard__(Block.unionBlock(this.blocks), x => x.bottom)) != null ? left : 0; }
        docWidth() { let left;
        return (left = __guard__(Block.unionBlock(this.blocks), x => x.right)) != null ? left : 0; }

        sanityCheck() {
            // @docBlock checks
            assert(() => (this.docBlock != null));
            assert(() => this.docBlock.isDocBlock === true);
            assert(() => this.docBlock.top === 0);
            assert(() => this.docBlock.left === 0);
            assert(() => this.docBlock.height === this.docLength());
            assert(() => this.docBlock.width === this.docWidth());

            // block geometry tests
            for (var block of Array.from(this.blocks)) {
                assert(() => block.top >= 0);
                assert(() => block.left >= 0);
                assert(() => block.right <= this.docWidth());
                assert(() => (block.width >= 0) && (block.height >= 0));
            }

            return true;
        }

        forwardReferencesTo(new_doc) {
            // FIXME move this into Model, or create a notion of Handles
            return (() => {
                const result = [];
                for (let [oldblock, newblock] of Array.from(zip_sets_by('uniqueKey', [this.blocks, new_doc.blocks]))) {
                    result.push((oldblock != null ? oldblock._underlyingBlock = newblock != null ? newblock : null : undefined));
                }
                return result;
            })();
        }

        getUnoccupiedSpace(geometry, start_position) {
            const [{width, height}, {top, left}] = Array.from([geometry, start_position]);
            if (_.any(this.blocks, block => block.overlaps({top, left, right: left + width, bottom: top + height}))) {
                return this.getUnoccupiedSpace(geometry, {top, left: left + 100});
            }
            return {top, left};
        }

        //# Font management
        removeFontFromAllBlocks(font_to_excise, replacement) {
            // FIXME: no guarantee Block's font is on .fontFamily
            if (replacement == null) { replacement = fontsByName['Helvetica Neue']; }
            return (() => {
                const result = [];
                for (let block of Array.from(this.blocks)) {                     if ((block.fontFamily != null ? block.fontFamily.isEqual(font_to_excise) : undefined)) {
                        result.push(block.fontFamily = replacement);
                    }
                }
                return result;
            })();
        }
    };
    Doc.initClass();
    return Doc;
})())
);




export default defaultExport;




function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}