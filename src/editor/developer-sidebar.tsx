/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FilePathControl, labeledControl, ListControl;
import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import { PdIndexDropdown, PdPopupMenu } from './component-lib';
import { StringPropControl, PropSpec, controlTypes } from '../props';

import {
    ColorControl,
    SelectControl,
    DynamicableControl,
    DebouncedTextControl,
    CheckboxControl,
    LeftCheckboxControl,
    NumberControl,
    propValueLinkTransformer,
    listValueLinkTransformer,
} from './sidebar-controls';

import _l from 'lodash';

// Utils
import {
    assert,
    propLink,
    map_tree,
    flatten_trees_preorder_to_depth_list,
    propLinkWithMutatedBlocks,
} from '../util';

import config from '../config';

// External components
import {
    sidebarControlOfExternalComponentSpec,
    sidebarControlOfExternalComponentInstance,
    ExternalComponentInstance,
    ExternalComponentSpec,
} from '../external-components';

// Type system
import { GenericDynamicable } from '../dynamicable';

import { jsonDynamicableToJsonStatic } from '../core';
import { FunctionPropControl } from '../props';
import { Model } from '../model';
import { filePathOfComponent, reactJSNameForComponent, errorsOfComponent } from '../component-spec';

// Blocks
import ArtboardBlock from '../blocks/artboard-block';

import MultistateBlock from '../blocks/multistate-block';
import { MutlistateAltsBlock, MutlistateHoleBlock } from '../blocks/non-component-multistate-block';
import { BaseInstanceBlock, propAndValueListFromInstance } from '../blocks/instance-block';

// UI related
import FormControl from '../frontend/form-control';

({PdPopupMenu} = require('./component-lib'));

import {
    codeSidebarEntryHeader,
    codeTextStyle,
    filePathTextStyle,
    JsKeyword,
    GeneratedCodePrefixField,
} from './code-styles';

({
    CheckboxControl,
    FilePathControl,
    ListControl,
    labeledControl,
    propValueLinkTransformer
} = require('./sidebar-controls'));

import { State } from 'react-powerplug';
import { ShowFilePathsButton } from './manage-file-paths-modal';

// Shared constants from sidebar

const DevSidebar = function({children, editor}) {
    const {
        DEFAULT_SIDEBAR_PADDING,
        DEVELOPER_SIDEBAR_WIDTH
    } = require('./sidebar');
    return React.createElement("div", {"key": "doc-dev", "style": ({
        width: DEVELOPER_SIDEBAR_WIDTH, padding: DEFAULT_SIDEBAR_PADDING,
        flex: '1 0 auto', display: 'flex', flexDirection: 'column'
    })},
        ( children ),

        React.createElement("div", {"style": ({
            // push down next section to bottom of screen
            flex: 1
        })}),
        React.createElement("hr", null),
        ( ShowFilePathsButton(editor.doc, editor.handleDocChanged, editor.getSelectedBlocks()) )
    );
};


const DevSidebarError = ({children}) => React.createElement("div", {"className": "sidebar-default-content noselect", "style": ({margin: '4em'})},
    ( children )
);

const DeveloperDocSidebar = ({editor}) => React.createElement(DevSidebar, {"editor": (editor)},
    React.createElement(DevSidebarError, null, "No Component Selected"),
    (ListControl((() => new ExternalComponentSpec()), ((elemValueLink, handleDelete, i) => React.createElement("div", {"style": ({flexGrow: '1'})},
    React.createElement("div", {"style": ({display: 'flex', alignItems: 'center'})},
        React.createElement("div", {"style": ({flexGrow: '1'})},
            (sidebarControlOfExternalComponentSpec(elemValueLink))
        ),
        React.createElement("i", {"role": "button", "className": "material-icons md-14", "style": ({lineHeight: '24px', color: 'black', marginLeft: '9px'}), "onClick": (handleDelete)}, "delete")
    ),
    React.createElement("hr", null)
)))('Code Wrapper Definitions', propLink(editor.doc, 'externalComponentSpecs', editor.handleDocChanged)))
);


const defaultExport = {};


defaultExport.ComponentSidebar = createReactClass({
    displayName: 'ComponentSidebar',

    componentDidUpdate() {
        return window.requestIdleCallback(() => {
            if (this.props.selectedBlocks.length === 1) {
                const selected = this.refs[`binding-${this.props.selectedBlocks[0].uniqueKey}`];
                return __guardMethod__(ReactDOM.findDOMNode(selected), 'scrollIntoViewIfNeeded', o => o.scrollIntoViewIfNeeded());
            }
        });
    },

    render() {
        let binding_controls, block_list_with_tree_depth, block_tree_flattened_by_scope, multistate_aware_block_tree;
        if (this.props.selectedBlocks.length === 0) {
            return React.createElement(DeveloperDocSidebar, {"editor": (this.props.editor)});

        } else if (this.props.selectedBlocks.length !== 1) {
            // TODO support mutliple selection in component sidebar
            return React.createElement(DevSidebar, {"editor": (this.props.editor)},
                React.createElement(DevSidebarError, null, `\
Mutliple Blocks Selected.\
`, React.createElement("br", null), `\
To use the component sidebar, pick just one.\
`)
            );
        }


        const component = this.props.selectedBlocks[0].getRootComponent();
        if (component === undefined) {
            return React.createElement(DevSidebar, {"editor": (this.props.editor)},
                React.createElement(DevSidebarError, null, "Selected Block is not in a Component")
            );
        }

        assert(() => component.isComponent && (component.componentSpec != null));

        const toplevelPropControlVl = propLinkWithMutatedBlocks(component.componentSpec, 'propControl', this.props.onChange, [this.props.component]);

        return React.createElement(DevSidebar, {"key": (`dev-${component.uniqueKey}`), "editor": (this.props.editor)},
            React.createElement("div", {"className": "ctrl-wrapper"},
                React.createElement("h5", {"className": "sidebar-ctrl-label"}, "Name"),
                React.createElement(FormControl, {"type": "text", "style": ({width: '100%'}), "valueLink": (propLinkWithMutatedBlocks(component, 'name', this.props.onChange, [this.props.component]))})
            ),
            React.createElement("div", {"style": (_l.extend({userSelect: 'text'}, filePathTextStyle))},
                React.createElement(JsKeyword, null, "import"),
                (" "),
                ( reactJSNameForComponent(component) ),
                (" "),
                React.createElement(JsKeyword, null, "from"),
                ( ` '${filePathOfComponent(component)}';` )
            ),

            React.createElement("hr", null),
            (component.componentSpec.propControl.customSpecControl(toplevelPropControlVl, React.createElement("h5", null, "Component arguments"), false)),

            React.createElement("hr", null),
            React.createElement("h5", null, "Data binding expressions"),

            React.createElement("div", null,
                (
                    // :: MSBlockTree = {block, children: [MSBlockTree], isMultistateState: bool}
                    (// :: [MSBlockTree]
                    multistate_aware_block_tree = map_tree(component.blockTree, (function(blockTree) {
                        // get children for blockTree
                        if (blockTree.block instanceof MutlistateHoleBlock) { return _l.values(blockTree.block.getStates()); }
                        return blockTree.children; // else
                    }), function({block}, children) {
                        const parent_is_multistate = block instanceof MultistateBlock || block instanceof MutlistateHoleBlock;
                        return {block, children: children.map(function(child) {
                            const isMultistateState = parent_is_multistate && (child.block instanceof ArtboardBlock || child.block instanceof MultistateBlock);
                            return _l.extend({isMultistateState}, child);
                        })
                        };
                }), block_tree_flattened_by_scope = map_tree(multistate_aware_block_tree, (
                        ({children}) => _l.sortBy(children, ['block.top', 'block.left'])), ({block, isMultistateState}, children) => {
                        const flattened_children = _l.flatten(children);
                        if (block.is_repeat || block.is_optional || isMultistateState || (block === component)) {
                        return [{block, isMultistateState, children: flattened_children}];
                        } else { return [{block, isMultistateState, children: []}, ...Array.from(flattened_children)]; }
                }), block_list_with_tree_depth = flatten_trees_preorder_to_depth_list(block_tree_flattened_by_scope, 'children'), binding_controls = _l.map(block_list_with_tree_depth, (({node: {block, isMultistateState}, depth}) => {
                        // block.label could be expensive if it's a computed @property, so cache it
                        let value, spec, innerValue, present, parentSpec, codeValueLink, nv, prop, title, i, e;
                        const block_name = block.label;
                        const is_selected = (config.showSelectedInCodeSidebar && Array.from(this.props.selectedBlocks).includes(block));
                        const selectBlock = () => { this.props.selectBlocks([block]); return this.props.onChange({fast: true}); };

                        const border = value => {
                            if (_l.isEmpty(value)) { return '2px solid red'; } else { return '2px solid white'; }
                        };

                        const entries = _l.compact(_l.flatten([
                            (() => {
                            if (block instanceof BaseInstanceBlock) {
                                const dynamicProps = _l.filter(propAndValueListFromInstance(block), ({value, spec}) => {
                                    ({innerValue} = value.value);
                                    const isFunction = spec.control instanceof FunctionPropControl;
                                    present = value.present || spec.required;
                                    return present && (isFunction || innerValue.isDynamic);
                                });

                                return _l.map(dynamicProps, ({spec, value, parentSpec}) => {
                                    codeValueLink = propLinkWithMutatedBlocks(value.value.innerValue, 'code', this.props.onChange, [block]);
                                    const isFunction = spec.control instanceof FunctionPropControl;
                                    return React.createElement("div", {"key": (spec.name), "style": ({marginTop: '6px'})},
                                        (codeSidebarEntryHeader(
                                            block_name,
                                            (parentSpec != null) 
                                            ? `${parentSpec.name}.${spec.name}`
                                            : spec.name
                                        )),
                                        React.createElement("div", {"style": ({display: 'flex', alignItems: 'center'})},
                                            React.createElement(FormControl, {"debounced": (true), "type": "text", "valueLink": (codeValueLink),  
                                                "onFocus": (selectBlock),  
                                                "style": (_l.extend({}, codeTextStyle, {
                                                    outline: 'none',
                                                    border: border(codeValueLink.value),
                                                    margin: 0,
                                                    width: '100%', // should grow down (and word wrap) too, but don't know how to do that yet
                                                    color: '#114473'
                                                }
                                                ))
                                            }),
                                            (!isFunction || !spec.required ?
                                                React.createElement("i", {"role": "button", "className": "material-icons md-14", "style": ({lineHeight: '24px', color: 'black'}), "onClick": (() => {
                                                    assert(() => value.value.innerValue instanceof GenericDynamicable);
                                                    if (isFunction) {
                                                        value.present = false;
                                                    } else {
                                                        value.value.innerValue.isDynamic = false;
                                                    }
                                                    return this.props.onChange();
                                                }
                                                )}, `\
delete\
`) : undefined
                                            )
                                        )
                                    );
                                });
                            }
                        })(),

                            _l.compact(_l.flatten([
                                !(block instanceof BaseInstanceBlock) ?
                                    block.getDynamicsForUI(this.props.editorCache).map((...args) => {
                                        // getPropsAsJsonDynamicable does .mapStatic()s over lists.  When we do a mutation, we want to update the source.
                                        const [dynamicable_id, user_visible_name, dynamicable] = Array.from(args[0]);
                                        const valueLink = propLinkWithMutatedBlocks(dynamicable.source, 'code', this.props.onChange, [block]);
                                        const hint = jsonDynamicableToJsonStatic(dynamicable.staticValue);
                                        return [user_visible_name, valueLink, hint, dynamicable_id];
                                }) : undefined,

                                block.specialCodeSidebarControls(this.props.onChange, this.props.editorCache)
                            ])).map((...args) => {
                                let hint, index, key, label;
                                [label, codeValueLink, hint, key] = Array.from(args[0]), index = args[1];
                                return React.createElement("div", {"key": (key != null ? key : label), "style": ({marginTop: '6px'})},
                                    (codeSidebarEntryHeader(block_name, label, hint)),
                                    React.createElement(FormControl, {"debounced": (true), "type": "text", "valueLink": (codeValueLink),  
                                        "onFocus": (selectBlock),  
                                        "style": (_l.extend({}, codeTextStyle, {
                                            outline: 'none',
                                            border: border(codeValueLink.value),
                                            margin: 0,
                                            width: '100%', // should grow down (and word wrap) too, but don't know how to do that yet
                                            color: '#114473'
                                        }
                                        ))
                                    })
                                );
                            }),

                            _l.map(block.eventHandlers, (eventHandler, index) => {
                                const eventHandlerValueLink = prop => {
                                    return {value: eventHandler[prop], requestChange: nv => { eventHandler[prop] = nv; return this.props.onChange(); }};
                                };
                                const [nameLink, codeLink] = Array.from([eventHandlerValueLink('name'), eventHandlerValueLink('code')]);

                                return React.createElement("div", {"key": (eventHandler.uniqueKey), "style": ({marginTop: '6px'})},
                                    (codeSidebarEntryHeader(block_name, 'Event handler')),
                                    React.createElement("div", {"style": ({display: 'flex', justifyContent: 'flex-start'})},
                                        React.createElement(FormControl, { 
                                            "style": (_l.extend({flex: '2', outline: 'none', width: '100%', marginRight: '5px', border: border(nameLink.value)}, codeTextStyle)),  
                                            "onFocus": (selectBlock), "debounced": (true), "type": "text", "placeholder": "e.g. onClick",  
                                            "valueLink": (nameLink)}),
                                        React.createElement(FormControl, { 
                                            "style": (_l.extend({flex: '3', outline: 'none', width: '100%', marginRight: '5px', border: border(codeLink.value)}, codeTextStyle)),  
                                            "onFocus": (selectBlock), "debounced": (true), "type": "text", "placeholder": "e.g. this.foo",  
                                            "valueLink": (codeLink)}),
                                        React.createElement("i", {"role": "button", "className": "material-icons md-14", "style": ({lineHeight: '24px', color: 'black'}), "onClick": (() => {
                                            block.eventHandlers.splice(index, 1);
                                            return this.props.onChange();
                                        }
                                        )}, `\
delete\
`)
                                    )
                                );
                            }),

                            !_l.isEmpty(block.link) ?
                                React.createElement("div", {"key": "link", "style": ({display: 'flex', flexDirection: 'column', marginTop: '6px'})},
                                    (codeSidebarEntryHeader(block_name, 'URL Link')),
                                    React.createElement("div", {"style": ({display: 'flex'})},
                                        React.createElement(FormControl, { 
                                            "debounced": true,  
                                            "style": (_l.extend({
                                                color: 'black',
                                                border: 'none',
                                                outline: 'none',
                                                flex: '1',
                                                marginRight: '5px'
                                            }, codeTextStyle)),  
                                            "onFocus": (selectBlock),  
                                            "valueLink": ({
                                                value: block.link,
                                                requestChange: nv => { block.link = nv; return this.props.onChange(); }
                                            })
                                        }),
                                        React.createElement("i", {"role": "button", "className": "material-icons md-14", "style": ({lineHeight: '24px', color: 'black'}), "onClick": (() => {
                                            block.link = '';
                                            return this.props.onChange();
                                        }
                                        )}, `\
delete\
`)
                                    ),
                                    React.createElement("label", {"style": ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginTop: '3px',
                                        marginBottom: '0',
                                        fontSize: '12px',
                                        fontWeight: 'normal'
                                    })},
                                        React.createElement("input", { 
                                            "type": "checkbox",  
                                            "style": ({marginTop: '0'}),  
                                            "checked": (block.openInNewTab),  
                                            "onChange": (e => { block.openInNewTab = e.target.checked; return this.props.onChange(); })
                                        }),
                                        React.createElement("span", null, " Open in new tab")
                                    )
                                ) : undefined,

                            (() => {
                            if (block.hasCustomCode) {
                                const customCodeValueLink = {value: block.customCode != null ? block.customCode : '', requestChange: nv => { block.customCode = nv; return this.props.onChange(); }};
                                // uniqueKeys don't have letters in them, so they won't conflict with "override"
                                return React.createElement("div", {"key": "override", "style": ({marginTop: '6px'})},
                                    (codeSidebarEntryHeader(block_name, 'Override code')),
                                    React.createElement("div", {"style": ({display: 'flex'})},
                                        React.createElement(FormControl, {"debounced": (true), "tag": "textarea", "valueLink": (customCodeValueLink), "onFocus": (selectBlock),  
                                            "placeholder": (`<custom ${this.props.doc.export_lang} tags here />`),  
                                            "style": ({
                                                fontFamily: 'Menlo, Monaco, Consolas, "Droid Sans Mono", "Courier New", monospace',
                                                fontSize: 13,
                                                color: '#441173',

                                                width: '100%', height: `${6 + ((customCodeValueLink.value.split('\n').length) * 18)}px`,
                                                WebkitAppearance: 'textfield',
                                                border: border(customCodeValueLink.value),
                                                outline: 'none'
                                            })
                                        }),
                                        React.createElement("i", {"role": "button", "className": "material-icons md-14", "style": ({lineHeight: '24px', color: 'black'}), "onClick": (() => {
                                            block.hasCustomCode = false;
                                            return this.props.onChange();
                                        }
                                        )}, `\
delete\
`)
                                    ),
                                    (_l.map([
                                        {prop: 'customCodeHasFixedWidth', title: 'Has fixed width'},
                                        {prop: 'customCodeHasFixedHeight', title: 'Has fixed height'}
                                    ], ({prop, title}, i) => {
                                        return React.createElement("label", {"key": (prop), "style": ({
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            marginTop: '3px',
                                            marginBottom: '0',
                                            marginRight: i === 0 ? '12px' : '0',
                                            fontSize: '12px',
                                            fontWeight: 'normal'
                                        })},
                                            React.createElement("input", { 
                                                "type": "checkbox",  
                                                "style": ({marginTop: '0'}),  
                                                "checked": (block[prop]),  
                                                "onChange": (e => { block[prop] = e.target.checked; return this.props.onChange(); })
                                            }),
                                            React.createElement("span", null, " ", (title))
                                        );
                                    }))
                                );
                            }
                        })(),

                            block.externalComponentInstances.map((instance, i) => {
                                return React.createElement("div", {"key": (instance.uniqueKey), "style": ({display: 'flex', width: '100%', marginTop: '6px', color: 'black'})},
                                    React.createElement("div", {"style": ({flex: 1, marginRight: '6px'})},
                                        (sidebarControlOfExternalComponentInstance(this.props.doc, {
                                            value: instance,
                                            requestChange: nv => {
                                                block.externalComponentInstances[i] = nv;
                                                return this.props.onChange();
                                            }
                                        }))
                                    ),
                                    React.createElement("i", {"role": "button", "className": "material-icons md-14", "style": ({lineHeight: '24px'}), "onClick": (() => {
                                        block.externalComponentInstances.splice(i, 1);
                                        return this.props.onChange();
                                    }
                                    )}, `\
delete\
`)
                                );
                            })
                        ]));

                        if (_l.isEmpty(entries) && !isMultistateState && !is_selected) { return null; }

                        const padding = `6px 15px 8px ${15 + (depth * 15)}px`;

                        const style = is_selected ?
                            {padding, background: '#3fa6ff', color: 'white', margin: '0 -14px'}
                        :
                            {padding, color: 'black', margin: '0 -14px'};

                        return React.createElement("div", {"key": (block.uniqueKey), "style": (style)},
                            ((() => {
                            if (isMultistateState) {
                                const stateHeaderValueLink = {value: block.name, requestChange: nv => { block.name = nv; return this.props.onChange(); }};
                                return React.createElement("div", {"style": ({display: 'flex', alignItems: 'baseline'})},
                                    React.createElement("span", {"style": ({fontSize: '12px', marginRight: '6px'})}, "When"),
                                    React.createElement(FormControl, {"debounced": (true), "valueLink": (stateHeaderValueLink), "onFocus": (selectBlock),  
                                    "placeholder": ("\"\""), "style": ({fontSize: 12, outline: 'none', color: 'black', fontWeight: 'bold', flexGrow: 1, border: border(stateHeaderValueLink.value)})})
                                );
                            }
                            
                        })()),
                            (!_l.isEmpty(entries) ?
                                React.createElement("div", {"ref": (`binding-${block.uniqueKey}`), "style": ({marginTop: isMultistateState ? '0' : '-6px'})},
                                    (entries)
                                ) : undefined
                            ),
                            (is_selected ?
                                React.createElement(State, {"initial": ({hovered: false})},
                                    (({ state, setState }) => {
                                        let addableProps;
                                        return React.createElement("div", { 
                                            "ref": (_l.isEmpty(entries) ? `binding-${block.uniqueKey}` : undefined),  
                                            "style": ({
                                                color: 'black',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: '10px',
                                                background: '#d3eaff',
                                                padding: '6px',
                                                marginTop: isMultistateState || !_l.isEmpty(entries) ? '8px' : '0'
                                            })
                                        },
                                            React.createElement("span", null, "Add ", React.createElement("b", null, (state.hovered || 'data bindings')), " to ", React.createElement("b", null, (block_name))),
                                            React.createElement("div", {"style": ({display: 'flex'})},
                                                (
                                                    (addableProps = propAndValueListFromInstance(block).filter(({spec, value}) => {
                                                        ({innerValue} = value.value);
                                                        present = value.present || spec.required;
                                                        if (spec.control instanceof FunctionPropControl) {
                                                            return !present;
                                                        } else {
                                                            return !innerValue.isDynamic || !present;
                                                        }
                                                    })),
                                                    addableProps.length > 0 ?
                                                        React.createElement(PdPopupMenu, { 
                                                            "label": "Add optional bindings",  
                                                            "iconName": "add",  
                                                            "options": (_l.map(addableProps, ({spec, parentSpec}) => {
                                                                if (parentSpec) { return `${parentSpec.name}.${spec.name}`; } else { return spec.name; }
                                                            })),  
                                                            "onSelect": (index => {
                                                                ({spec,value} = addableProps[index]);
                                                                ({innerValue} = value.value);

                                                                value.present = true;
                                                                if (!(spec.control instanceof FunctionPropControl)) {
                                                                    innerValue.isDynamic = true;
                                                                }

                                                                return this.props.onChange();
                                                            }
                                                            )
                                                        }) : undefined
                                                ),
                                                (_l.compact([
                                                    {icon: 'flash_on', title: 'event handler', handler: () => {
                                                        block.eventHandlers.push(new (Model.tuple_named['event-handler']));
                                                        return this.props.onChange();
                                                    }
                                                    },
                                                    _l.isEmpty(block.link) ?
                                                        {icon: 'link', title: 'URL link', handler: () => {
                                                            block.link = 'https://example.com';
                                                            return this.props.onChange();
                                                        }
                                                        } : undefined,
                                                    !block.hasCustomCode ?
                                                        {icon: 'code', title: 'override code', handler: () => {
                                                            block.hasCustomCode = true;
                                                            return this.props.onChange();
                                                        }
                                                        } : undefined,
                                                    this.props.doc.externalComponentSpecs.length > 0 ?
                                                        {icon: 'pages', title: 'code wrapper', handler: () => {
                                                            block.externalComponentInstances.push(
                                                                new ExternalComponentInstance({
                                                                    srcRef: this.props.doc.externalComponentSpecs[0].ref}));
                                                            return this.props.onChange();
                                                        }
                                                        } : undefined
                                                ]).map(({ icon, title, handler }) => {
                                                    return React.createElement("div", { 
                                                        "key": (title),  
                                                        "role": "button",  
                                                        "style": ({fontSize: 10, display: 'flex', alignItems: 'center'}),  
                                                        "onClick": (handler),  
                                                        "onMouseEnter": (() => setState({ hovered: title })),  
                                                        "onMouseLeave": (() => setState({ hovered: false }))
                                                    },
                                                        React.createElement("i", {"className": "material-icons md-14"}, (icon))
                                                    );
                                                }))
                                            )
                                        );
                                    })
                                ) : undefined
                            )
                        );
                    })
                    ), _l.isEmpty(binding_controls) ?
                        React.createElement("div", null, "First mark some property dynamic in the draw sidebar.")
                    :
                        binding_controls.map((component, i) => React.createElement("div", {"key": (`control-${i}`), "style": ({borderTop: i === 0 ? 'none' : '1px solid white'})},
                            (component)
                        ))))
            ),

            React.createElement("hr", null),
            React.createElement(GeneratedCodePrefixField, {"valueLink": (propValueLinkTransformer('codePrefix', propLinkWithMutatedBlocks(component, 'componentSpec', this.props.onChange, [component])))}),

            (
                errorsOfComponent(component).map((error, i) => {
                    return React.createElement("div", {"style": ({color: 'red'}), "key": (i)}, (error.message));
            })
            )
        );
    }
});


export default defaultExport;


function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}