/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let controlFromSpec, DEFAULT_SIDEBAR_PADDING, DEVELOPER_SIDEBAR_WIDTH, DrawCodeSidebarContainer, kind_of_sidebar_entry, SidebarFromSpec;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import { PdTabBar, PdIndexDropdown, PdIconGroup } from './component-lib';
import Block from '../block';
import { Doc } from '../doc';
import { Dynamicable, GenericDynamicable } from '../dynamicable';
import programs from '../programs';
import { find_unused, assert, prod_assert, propLink, propLinkWithMutatedBlocks } from '../util';

import {
    DynamicableControl,
    CheckboxControl,
    FontControl,
    ColorControl,
    TextControl,
    FontWeightControl,
} from './sidebar-controls';

import { ComponentSidebar } from './developer-sidebar';
import { AlignmentControls, ExpandAlignmentControls } from './alignment-controls';
import { block_types_for_doc, LayoutBlockType } from '../user-level-block-type';
import { handleAddCustomFonts } from '../frontend/custom-font-modal';
import { LocalUserFont } from '../fonts';
import config from '../config';

import {
    PropSpec,
    ColorPropControl,
    ImagePropControl,
    StringPropControl,
    CheckboxPropControl,
    NumberPropControl,
} from '../props';

import { isEqual } from '../model';
import TextBlock from '../blocks/text-block';
import TextInputBlock from '../blocks/text-input-block';
import MultistateBlock from '../blocks/multistate-block';
import { InstanceBlock } from '../blocks/instance-block';
import ArtboardBlock from '../blocks/artboard-block';
import ImageBlock from '../blocks/image-block';

// Sometimes you need to give a component a key.  Unfortunately there's no way to
// set a ReactElement's key after construction.  We can wrap it in a ReactWrapper
// and give that a key instead.
const ReactWrapper = createReactClass({
    displayName: 'ReactWrapper',
    render() { return this.props.children; }
});

const dynamicableVariableCreatorValueLink = function(dynamicableValueLink, block, prop_control, base_name) {
    const rootComponentSpec = __guard__(block.getRootComponent(), x => x.componentSpec);
    if ((rootComponentSpec == null)) { return dynamicableValueLink; }
    return {
        value: dynamicableValueLink.value,
        requestChange(nv) {
            // Dynamicize
            if ((nv.isDynamic === true) && (dynamicableValueLink.value.isDynamic === false)) {
                const new_prop_name = find_unused(_l.map(rootComponentSpec.propControl.attrTypes, 'name'), function(i) {
                    if (i === 0) { return base_name; } else {  return `${base_name}${i+1}`; }
                });
                rootComponentSpec.addSpec(new PropSpec({name: new_prop_name, control: prop_control}));

                nv.code = nv.getPropCode(new_prop_name, block.doc.export_lang);

            // Undynamicize
            } else if ((nv.isDynamic === false) && (dynamicableValueLink.value.isDynamic === true)) {
                // Try to see if there was a PropSpec added by the above mechanism, if so delete it
                // FIXME: this.props is React specific
                // FIXME2: The whole heuristic of when to remove a Spec can be improved. One thing we should probably do is
                // check that prop_name is unused in other things in the code sidebar. Not doing this right now because
                // getting all possible code things that appear in the code sidebar is a mess today.
                // ANGULAR TODO: will this always work?
                if (nv.code.startsWith('this.props.')) {
                    const prop_name = nv.code.substr('this.props.'.length);
                    const added_spec =  _l.find(rootComponentSpec.propControl.attrTypes, spec => (spec.name === prop_name) && (spec.control.ValueType === prop_control.ValueType));

                    if ((prop_name.length > 0) && (added_spec != null)) {
                        rootComponentSpec.removeSpec(added_spec);
                        nv.code = '';
                    }
                }
            }

            return dynamicableValueLink.requestChange(nv);
        }
    };
};

const defaultExport = {};

defaultExport.SidebarFromSpec = (SidebarFromSpec = createReactClass({
    displayName: 'SidebarFromSpec',
    render() {
        return React.createElement("div", null, " ", (
            this.props.spec(this.linkAttr, this.props.onChange, this.props.editorCache, this.props.setEditorMode).map((spec, i) => {
                const [control, react_key] = Array.from(controlFromSpec(spec, this.props.block, this.linkAttr, i));
                return React.createElement(ReactWrapper, {"key": (react_key)}, (control));
        })
        ), " ");
    },

    linkAttr(attr) { return propLinkWithMutatedBlocks(this.props.block, attr, this.props.onChange, [this.props.block]); },

    attr_is_dynamicable(attr) {
        return this.props.block[attr] instanceof GenericDynamicable;
    }
}));



const DEFAULT_SIDEBAR_WIDTH = 250;
defaultExport.DEVELOPER_SIDEBAR_WIDTH = (DEVELOPER_SIDEBAR_WIDTH = 335);
defaultExport.DEFAULT_SIDEBAR_PADDING = (DEFAULT_SIDEBAR_PADDING = '0px 14px 14px 14px');

// kind_of_sidebar_entry :: block -> entry -> "spec" | "dyn-spec" | "react" | null
defaultExport.kind_of_sidebar_entry = (kind_of_sidebar_entry = function(spec, block) {
    if (_.isArray(spec)) {
        const [label, attr, ctrl, react_key] = Array.from(spec);
        if (block[attr] instanceof GenericDynamicable) {
        return "dyn-spec";
        } else { return "spec"; }
    } else if (React.isValidElement(spec)) {
        return "react";
    } else {
        return null;
    }
});

defaultExport.controlFromSpec = (controlFromSpec = (spec, block, linkAttr, i) => {
    let attr, ctrl, label, react_key;
    const entryType = kind_of_sidebar_entry(spec, block);
    if (entryType === 'dyn-spec') {
        [label, attr, ctrl, react_key] = Array.from(spec);

        // the react_key is optionally overridable; usually you want to use attr
        if (react_key == null) { react_key = attr; }

        // auto-dynamicablize the control if necessary
        // This is gross. Should maybe unify the concept of PropControl types and Dynamicable types
        // and refactor this out (?)
        // NOTE/FIXME: It depends on the model names to pickup the correct controls i.e. ColorControl
        // ImageControl since those are all technically strings.
        const [colorAttrs, imageAttrs] = Array.from([['color', 'gradientEndColor', 'borderColor', 'fontColor'], ['image']]);
        const dynamicable = block[attr];
        const [prop_control, base_name] =
            Array.from(dynamicable instanceof Dynamicable(String) && Array.from(imageAttrs).includes(attr) ? [ImagePropControl, 'img_src']
            : dynamicable instanceof Dynamicable(String) && Array.from(colorAttrs).includes(attr) ? [ColorPropControl, 'color']
            : dynamicable instanceof Dynamicable(String) ? [StringPropControl, 'text']
            : dynamicable instanceof Dynamicable(Number) ? [NumberPropControl, 'number']
            : dynamicable instanceof Dynamicable(Boolean) ? [CheckboxPropControl, 'bool']
            : [null, null]);

        const baseValueLink = linkAttr(attr);
        const valueLink =
            prop_control
            ? dynamicableVariableCreatorValueLink(baseValueLink, block, new prop_control(), base_name)
            : baseValueLink;

        return [DynamicableControl(ctrl)(label, valueLink), react_key];
    } else if (entryType === 'spec') {
        [label, attr, ctrl, react_key] = Array.from(spec);

        // the react_key is optionally overridable; usually you want to use attr
        if (react_key == null) { react_key = attr; }

        // get a react element out of ctrl
        return [ctrl(label, linkAttr(attr)), react_key];
    } else {
        return [spec, `attr-${i}`];
    }
});

const BlockInspector = createReactClass({render() {

    let user_level_block_types;
    const block = this.props.value[0];

    // Set a key so we don't reuse BlockInspectors across blocks.
    // If we use the same inspector for different blocks, color pickers
    // that are open will stay open, etc.
    return React.createElement("div", {"key": (`design-${block.uniqueKey}`), "style": ({width: DEFAULT_SIDEBAR_WIDTH, padding: DEFAULT_SIDEBAR_PADDING})},
        React.createElement("div", {"className": "ctrl-wrapper", "style": ({alignItems: 'baseline'})},
            React.createElement("h5", {"className": "sidebar-ctrl-label"}, "Block type"),
            (
                (user_level_block_types = block_types_for_doc(block.doc)),
                React.createElement(PdIndexDropdown, {"stretch": true, "defaultIndex": (_l.findIndex(user_level_block_types, ty => ty.describes(block))),  
                    "options": (user_level_block_types.map(ty => { return {value: ty.getName(), handler: () => {
                      const replacement = block.becomeFresh(new_members => ty.create(new_members));
                      if (replacement instanceof TextBlock) { replacement.textContent.staticValue = "Type something"; }
                      return this.props.onChange();
                  }
                    }; }))})
            )
        ),

        (block.fontFamily instanceof LocalUserFont ? React.createElement("p", {"style": ({color: 'red'})}, "The font used has not been uploaded") : undefined),
        React.createElement(SidebarFromSpec, {"editorCache": (this.props.editorCache), "spec"() { return block.sidebarControls(...arguments); }, "block": (block), "onChange": (this.props.onChange), "setEditorMode": (this.props.setEditorMode)}),

        React.createElement("hr", null),
        React.createElement("button", {"style": ({marginTop: 20, width: '100%'}), "onClick": (() => {
            const wrapper_block = LayoutBlockType.create({
                color: Dynamicable(String).from('rgba(0,0,0,0)'),
                top: block.top, left: block.left, width: block.width, height: block.height
            });

            block.doc.addBlock(wrapper_block);
            this.props.selectBlocks([wrapper_block]);
            return this.props.onChange();
        }
        )}, "Wrap"),
        React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => {
            return programs.deleteAllButSelectedArtboards([block], this.props.onChange);
        }
        )}, "Remove All But Selected")
    );
}
});


const DocScaler = createReactClass({
    getInitialState() {
        return {scaleRatio: 1.0};
    },

    render() {
        return React.createElement("div", {"style": ({display: 'flex', marginBottom: '-9px'})},
            React.createElement("button", {"onClick": (this.rescale), "style": ({flex: '1'})}, "Rescale doc"),
            React.createElement("input", {"style": ({marginBottom: '9px', marginLeft: '6px'}), "type": "number", "step": "0.1", "min": "0.1", "max": "10", "value": (this.state.scaleRatio), "onChange": (evt => this.setState({scaleRatio: evt.target.value}))}),
            React.createElement("button", {"onClick": (() => this.setState({scaleRatio: Math.round((this.state.scaleRatio + .2) * 10) / 10}))}, "+"),
            React.createElement("button", {"onClick": (() => this.setState({scaleRatio: Math.round((this.state.scaleRatio - .2) * 10) / 10}))}, "-")
        );
    },

    rescale() {
        if (this.state.scaleRatio === 1.0) {
            window.alert('Choose a scaleRatio different than 1.0');
            return;
        }

        for (let block of Array.from(this.props.doc.blocks)) {
            for (let prop of ['top', 'left', 'width', 'height']) { block[prop] *= this.state.scaleRatio; }
            if (block instanceof TextBlock) {
                block.fontSize = block.fontSize.mapStatic(prev => this.state.scaleRatio * prev);
                block.kerning = block.kerning.mapStatic(prev => this.state.scaleRatio * prev);
                block.lineHeight = this.state.scaleRatio * block.lineHeight;
            }
        }
        this.state.scaleRatio = 1.0;
        return this.props.onChange();
    }
});


const DocInspector = createReactClass({render() {
    return React.createElement("div", {"key": "doc-design", "style": ({width: DEFAULT_SIDEBAR_WIDTH, padding: DEFAULT_SIDEBAR_PADDING})},
        React.createElement("div", {"style": ({margin: '1em 0'})},
            (TextControl('Doc name', this.props.editor.docNameVL()))
        ),

        React.createElement(DocScaler, {"doc": (this.props.doc), "onChange": (this.props.onChange)}),
        React.createElement("hr", null),

        React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => handleAddCustomFonts(this.props.doc, this.props.onChange))}, "Manage Fonts"),
        React.createElement("hr", null),

        (this.props.editor.getDocSidebarExtras())
    );
}
});

const MultipleSelectedSidebar = createReactClass({render() {
    let text_blocks;
    let block;
    const blocks = this.props.value;

    return React.createElement("div", {"key": "multiple", "style": ({
        padding: DEFAULT_SIDEBAR_PADDING, paddingTop: '1em',
        flex: '1 0 auto', display: 'flex', flexDirection: 'column'
    })},
        React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => {
            const {
                doc
            } = blocks[0];
            const union = Block.unionBlock(blocks);

            const wrapper_block = LayoutBlockType.create({
                color: Dynamicable(String).from('rgba(0,0,0,0)'),
                top: union.top,
                left: union.left,
                width: union.width,
                height: union.height
            });

            doc.addBlock(wrapper_block);
            this.props.selectBlocks([wrapper_block]);
            return this.props.onChange();
        }
        )}, "Wrap"),
        React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => {
            this.props.selectBlocks(_l.flatMap(blocks, b => b.andChildren()));
            return this.props.onChange({fast: true});
        }
        )}, "Select Children"),
        React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => {
            return programs.make_multistate_component_from_blocks(blocks, this.props.editor);
        }
        )}, "Make Multistate"),

        React.createElement("div", {"className": "sidebar-default-content noselect", "style": ({marginTop: '2em'})},
            React.createElement("div", null, "MULTIPLE SELECTED")
        ),

        (
            (text_blocks = blocks.filter(b => [TextBlock, TextInputBlock].includes(b.constructor))),
            (() => {
                if (!_l.isEmpty(text_blocks)) {
                let left;
                const all_have_variants = _l.every(text_blocks, block => !_l.isEmpty(block.fontFamily.get_font_variants()));
                const some_have_variants = _l.some(text_blocks, block => !_l.isEmpty(block.fontFamily.get_font_variants()));

                const get_static = function(block, attr) {
                    if (block[attr] instanceof GenericDynamicable) {
                    return block[attr].staticValue;
                    } else { return block[attr]; }
                };

                const set_static = function(block, attr, value) {
                    if (block[attr] instanceof GenericDynamicable) {
                    return block[attr].staticValue = value;
                    } else { return block[attr] = value; }
                };

                const shared_value = function(lst) { if (_l.every(lst, elem => isEqual(elem, lst[0]))) { return lst[0]; } else { return undefined; } };

                const multiple_value_link = (attr, conflicting_value) => ({
                    value: (left = shared_value(_l.map(text_blocks, block => get_static(block, attr)))) != null ? left : conflicting_value,
                    requestChange: value => {
                        for (block of Array.from(text_blocks)) { set_static(block, attr, value); }
                        return this.props.onChange();
                    }
                });

                return React.createElement("div", null,
                    (FontControl(this.props.doc, this.props.onChange)('font', multiple_value_link('fontFamily', text_blocks[0].fontFamily))),

                    React.createElement("div", {"className": "ctrl-wrapper"},
                        React.createElement("h5", {"className": "sidebar-ctrl-label"}, "style"),
                        React.createElement("div", {"className": "ctrl"},
                            React.createElement(PdIconGroup, {"buttons": ([
                                    [React.createElement("b", null, "B"), 'isBold'],
                                    [React.createElement("i", null, "I"), 'isItalics'],
                                    [React.createElement("u", null, "U"), 'isUnderline'],
                                    [React.createElement("s", null, "S"), 'isStrikethrough']
                                ].map((...args) => {
                                    // Don't render bold button if fontweight control is showing
                                    const [label, attr] = Array.from(args[0]), i = args[1];
                                    if ((attr === 'isBold') && _l.some(text_blocks, 'hasCustomFontWeight') && some_have_variants) { return; }
                                    const vlink = multiple_value_link(attr, false);
                                    return {
                                        label, type: vlink.value ? 'primary' : 'default',
                                        onClick(e) { vlink.requestChange(!vlink.value); e.preventDefault(); return e.stopPropagation(); }
                                    };
                                }))})
                        )
                    ),

                    (all_have_variants ? CheckboxControl("use custom font weight", multiple_value_link('hasCustomFontWeight', false)) : undefined),
                    ((() => {
                    if (_l.every(text_blocks, 'hasCustomFontWeight') && all_have_variants) {
                        const fake_union_font = {
                            get_font_variants() {
                                const intersection = arrs => _l.intersection(...Array.from(arrs || [])); // lodash has an annoying habbit of varargs when they should have a list of lists
                                return _l.sortBy(intersection(_l.map(text_blocks, block => block.fontFamily.get_font_variants())));
                            }
                        };
                        return FontWeightControl(fake_union_font)("font weight", multiple_value_link('fontWeight', '<multiple>'));
                    }
                    
                })()),

                    (ColorControl("text color", multiple_value_link("fontColor", text_blocks[0].fontColor))),

                    React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => {
                        text_blocks.forEach(b => { return b.textContent.staticValue = b.textContent.staticValue.toUpperCase(); });
                        return this.props.onChange();
                    }
                    )}, "To Uppercase")
                );
            }
            })()
        ),

        React.createElement("div", {"style": ({
            // push down Export section to bottom of screen
            flex: 1
        })}),

        React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => {
            blocks[0].doc.removeBlocks(blocks);
            this.props.selectBlocks([]);
            return this.props.onChange();
        }
        )}, "Remove"),
         React.createElement("button", {"style": ({width: '100%'}), "onClick": (() => {
            return programs.deleteAllButSelectedArtboards(blocks, this.props.onChange);
        }
        )}, "Remove All But Selected")
    );
}
});


defaultExport.StandardSidebar = ({children}) => {
    return React.createElement("div", {"className": "sidebar bootstrap", "style": ({width: DEFAULT_SIDEBAR_WIDTH, padding: DEFAULT_SIDEBAR_PADDING})},
        (children)
    );
};


defaultExport.DrawCodeSidebarContainer = (DrawCodeSidebarContainer = ({width, sidebarMode, editor, aboveScroll, children}) => React.createElement("div", {"className": "sidebar bootstrap", "style": ({width, display: 'flex', flexDirection: 'column'})},
    React.createElement("div", {"style": ({width: '100%', marginBottom: 12})},
        React.createElement(PdTabBar, {"tabs": (
            [
                ['draw', 'Draw'],
                ['code', 'Component'] // TODO rename sidebar to "Data"?
            ].map((...args) => { const [mode, label] = Array.from(args[0]); return {
                label, key: mode,
                open: sidebarMode === mode,
                onClick: () => {
                    editor.setSidebarMode(mode);
                    return editor.handleDocChanged({fast: true});
                }
            }; })
        )})
    ),

    ( aboveScroll ),

    React.createElement("div", {"className": "editor-scrollbar scrollbar-show-on-hover", "style": ({
        flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden',

        // compensate for space taken up by intercom.  This is going to look extra ugly in dev where there
        // is no intercom.
        paddingBottom: 80
    })},
        ( children )
    )
));



defaultExport.Sidebar = createReactClass({
    displayName: "Sidebar",
    render() {
        assert(() => this.props.doc.isInReadonlyMode());
        switch (this.props.sidebarMode) {
            case 'draw':
                var first_aligners = React.createElement(AlignmentControls, {"key": "alignment-controls", "blocks": (this.props.value), "onChange": (this.props.onChange)});

                if (this.props.value.length === 0) {
                    return React.createElement(DrawCodeSidebarContainer, { 
                        "width": (DEFAULT_SIDEBAR_WIDTH),  
                        "sidebarMode": "draw",  
                        "editor": (this.props.editor),  
                        "aboveScroll": (first_aligners)
                    },
                        React.createElement(DocInspector, Object.assign({},  this.props ))
                    );

                } else if (this.props.value.length === 1) {
                    return React.createElement(DrawCodeSidebarContainer, { 
                        "width": (DEFAULT_SIDEBAR_WIDTH),  
                        "sidebarMode": "draw",  
                        "editor": (this.props.editor),  
                        "aboveScroll": (first_aligners)
                    },
                        React.createElement(BlockInspector, Object.assign({},  this.props ))
                    );

                } else {
                    const aligners = React.createElement(React.Fragment, null,
                        (first_aligners),
                        React.createElement(ExpandAlignmentControls, {"key": "expand-alignment-controls", "blocks": (this.props.value), "onChange": (this.props.onChange)})
                    );
                    return React.createElement(DrawCodeSidebarContainer, { 
                        "width": (DEFAULT_SIDEBAR_WIDTH),  
                        "sidebarMode": "draw",  
                        "editor": (this.props.editor),  
                        "aboveScroll": (aligners)
                    },
                        React.createElement(MultipleSelectedSidebar, Object.assign({},  this.props ))
                    );
                }


            case 'code':
                return React.createElement(DrawCodeSidebarContainer, { 
                    "width": (DEVELOPER_SIDEBAR_WIDTH),  
                    "sidebarMode": "code",  
                    "editor": (this.props.editor)
                },
                    React.createElement(ComponentSidebar, { 
                        "selectedBlocks": (this.props.value),  
                        "editor": (this.props.editor),  
                        "selectBlocks": (this.props.selectBlocks),  
                        "onChange": (this.props.onChange),  
                        "editorCache": (this.props.editorCache),  
                        "doc": (this.props.doc),  
                        "setEditorMode": (this.props.setEditorMode)
                        })
                );
        }
    }
});

export default defaultExport;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}