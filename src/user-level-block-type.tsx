// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let block_type_for_key_command, block_types_for_doc, ComponentBlockType, draw_component_block_types_list, ExternalBlockType, native_block_types_list, NativeBlockType, UserLevelBlockType;
import _l from 'lodash';
import config from './config';
import ArtboardBlock from "./blocks/artboard-block";
import CheckBoxBlock from "./blocks/checkbox-block";
import FileInputBlock from "./blocks/file-input-block";
import ImageBlock from "./blocks/image-block";
import LayoutBlock from "./blocks/layout-block";
import LineBlock from "./blocks/line-block";
import MultistateBlock from "./blocks/multistate-block";
import ScreenSizeBlock from "./blocks/screen-size-block";
import OvalBlock from "./blocks/oval-block";
import GridBlock from "./blocks/grid-block";
import RadioInputBlock from "./blocks/radio-input-block";
import SliderBlock from "./blocks/slider-block";
import TextBlock from "./blocks/text-block";
import TextInputBlock from "./blocks/text-input-block";
import TriangleBlock from "./blocks/triangle-block";
import YieldBlock from "./blocks/yield-block";
import { VnetBlock } from "./blocks/vnet-block";
import StackBlock from "./blocks/stack-block";
import { CodeInstanceBlock, DrawInstanceBlock } from "./blocks/instance-block";
const defaultExport = {};

// From the user's perspective, (Native) Pagedraw Block Types and User-defined reusable components
// are both "block types".  For example, when creating a block, to the user it may be a TextBlock,
// LayoutBlock, or FoobarBlock, where FoobarBlock is an instance of their Foobar component.  The
// UserLevelBlockType type wraps different kinds of block types, so internally we can have a
// consistent interface for interacting with what the user thinks of as "Block Types".

defaultExport.UserLevelBlockType = (UserLevelBlockType = (function() {
    UserLevelBlockType = class UserLevelBlockType {
        static initClass() {
            this.prototype.create = null;        // :: (members_hash) -> Block; constructor
            this.prototype.describes = null;     // :: (Block) -> Boolean; true iff input is an instance of this
            this.prototype.getName = null;       // :: -> String; user visible name
            this.prototype.getKeyCommand = null; // :: -> String | undefined
            this.prototype.getUniqueKey = null;
            this.prototype.isEqual = null;
        }
    };
    UserLevelBlockType.initClass();
    return UserLevelBlockType;       // :: (UserLevelBlockType) -> Boolean
})());


defaultExport.NativeBlockType = (NativeBlockType = class NativeBlockType extends UserLevelBlockType {
    constructor(native_type) { {       // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }       let thisFn = (() => { return this; }).toString();       let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];       eval(`${thisName} = this;`);     }     this.native_type = native_type; super(); }
    create(members_hash) { return new this.native_type(members_hash); }
    describes(block) { return block instanceof this.native_type; }
    getName() { return this.native_type.userVisibleLabel; }
    getKeyCommand() { return this.native_type.keyCommand; }
    getUniqueKey() { return this.native_type.__tag; }
    isEqual(other) { return this.native_type.__tag === other.native_type.__tag; }
});


defaultExport.ComponentBlockType = (ComponentBlockType = class ComponentBlockType extends UserLevelBlockType {
    constructor(component) { {       // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }       let thisFn = (() => { return this; }).toString();       let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];       eval(`${thisName} = this;`);     }     this.component = component; super(); }
    create(members_hash) { return new DrawInstanceBlock(_l.extend({sourceRef: this.component.componentSpec.componentRef}, members_hash)); }
    describes(block) { return block instanceof DrawInstanceBlock && (block.sourceRef === this.component.componentSpec.componentRef); }
    getName() { return this.component.getLabel(); }
    getKeyCommand() { return undefined; }
    getUniqueKey() { return this.component.uniqueKey; }
    isEqual(other) { return this.component.uniqueKey === other.component.uniqueKey; }
});

defaultExport.ExternalBlockType = (ExternalBlockType = class ExternalBlockType extends UserLevelBlockType {
    constructor(spec) { {       // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }       let thisFn = (() => { return this; }).toString();       let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];       eval(`${thisName} = this;`);     }     this.spec = spec; super(); }
    create(members_hash) { return new CodeInstanceBlock(_l.extend({sourceRef: this.spec.ref}, members_hash)); }
    describes(block) { return block instanceof CodeInstanceBlock && (block.sourceRef === this.spec.ref); }
    getName() { return this.spec.name; }
    getKeyCommand() { return undefined; }
    getUniqueKey() { return this.spec.uniqueKey; }
    isEqual(other) { return this.spec.uniqueKey === other.spec.uniqueKey; }
});

// Order of native_block_classes is the order of the types shown in the block-pickers
const native_block_types_by_name = ((cbn => _l.mapValues(cbn, ty => new NativeBlockType(ty))))(_l.extend({
    ArtboardBlock,
    MultistateBlock,
    ScreenSizeBlock,
    TextBlock,
    LayoutBlock,
    OvalBlock,
    LineBlock,
    TriangleBlock,
    ImageBlock,
    TextInputBlock,
    FileInputBlock,
    CheckBoxBlock,
    RadioInputBlock,
    SliderBlock,
    // YieldBlock; YieldBlock is not yet ready for users to see
}, (config.gridBlock ? {
    GridBlock
} : undefined), (config.vnet_block ? {
    VnetBlock
} : undefined), (config.stackBlock ? {
    StackBlock
} : undefined)
)
);

// exports.ArtboardBlockType = new NativeBlockType(ArtboardBlock), etc.
_l.extend(defaultExport, _l.mapKeys(native_block_types_by_name, (value, ty_name) => `${ty_name}Type`));


defaultExport.native_block_types_list = (native_block_types_list = _l.values(native_block_types_by_name));
defaultExport.user_defined_block_types_list = (draw_component_block_types_list = doc => _l.sortBy(doc.getComponents().map(c => new ComponentBlockType(c)), block_type => block_type.getName()));

var code_component_block_types_list = (code_component_block_types_list = doc => _l.sortBy(_l.flatten(_l.map(doc.getExternalCodeSpecs(), spec => new ExternalBlockType(spec))), block_type => block_type.getName()));

defaultExport.block_types_for_doc = (block_types_for_doc = doc => [].concat(native_block_types_list, draw_component_block_types_list(doc), code_component_block_types_list(doc)));


defaultExport.block_type_for_key_command = (block_type_for_key_command = letter => _l.find(native_block_types_list, ty => ty.getKeyCommand() === letter));

export default defaultExport;

