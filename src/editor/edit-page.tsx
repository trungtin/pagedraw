/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let assert, collisions, Editor, find_connected, FixedSizeStack, if_changed, log_assert, memoize_on, PDClipboardData, programs, propLink, track_warning, UserLevelBlockTypes, util, zip_dicts;
import _ from 'underscore';
import _l from 'lodash';
import $ from 'jquery';
import EventEmitter from 'events';
import hopscotch from 'hopscotch';
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Helmet } from 'react-helmet';
import { MenuDivider, Menu, MenuItem } from './component-lib';
const {remapSymbolsToExistingComponents, prettyPrintDocDiff} = (programs = require('../programs'));
import { pdomToReact } from './pdom-to-react';
import jsondiffpatch from 'jsondiffpatch';
import jsdiff from 'diff';
import modal from '../frontend/modal';
import RenderLoop from '../frontend/RenderLoop';
import { showConfigEditorModal } from '../frontend/config-editor';
import SketchImporter from './sketch-importer';
import FormControl from '../frontend/form-control';
import ShouldSubtreeRender from '../frontend/should-subtree-render';
import { windowMouseMachine } from '../frontend/DraggingCanvas';
import { LibraryAutoSuggest } from '../frontend/autosuggest-library';
import { GeomGetterManager, messageIframe, registerIframe } from '../frontend/IframeManager';
import ShadowDOM from '../frontend/shadow-dom';
import { errorsOfComponent, filePathOfComponent } from '../component-spec';
import { getExternalComponentSpecFromInstance } from '../external-components';
import { Popover } from '../frontend/popover';
import { Tabs, Tab, Modal, PdSidebarButton, PdButtonOne } from './component-lib';
import { Dynamicable } from '../dynamicable';
import { makeLibAtVersion, Library } from '../libraries';
import libManagerModal from './lib-manager-modal';
import LibStoreInteraction from '../interactions/lib-store';
import TopbarButton from '../pagedraw/topbarbutton';

// HACK we have some pretty bad circular dependencies.  Importing core before anyone else seems to
// fix them.  There isn't a great way to deal with it.
import '../core';

import {
    pdomDynamicableToPdomStatic,
    clonePdom,
    blocks_from_block_tree,
    compileComponentForInstanceEditor,
    evalInstanceBlock,
    foreachPdom,
    static_pdom_is_equal,
} from '../core';

import { serialize_pdom } from '../pdom';
import { Model } from '../model';
import { Doc } from '../doc';
import Block from '../block';

import {
    user_defined_block_types_list,
    native_block_types_list,
    block_type_for_key_command,
    ExternalBlockType,
} from '../user-level-block-type';

import { font_loading_head_tags_for_doc, LocalUserFont } from '../fonts';
import { ExternalComponentSpec } from '../external-components';
import ImageBlock from '../blocks/image-block';
import TextBlock from '../blocks/text-block';
import LayoutBlock from '../blocks/layout-block';
import { BaseInstanceBlock, InstanceBlock } from '../blocks/instance-block';
import StackBlock from '../blocks/stack-block';
import ArtboardBlock from '../blocks/artboard-block';
import MultistateBlock from '../blocks/multistate-block';
import ScreenSizeBlock from '../blocks/screen-size-block';
import { MutlistateHoleBlock, MutlistateAltsBlock } from '../blocks/non-component-multistate-block';
const {
    OvalBlockType,
    TriangleBlockType,
    LineBlockType,
    LayoutBlockType,
    TextBlockType,
    ArtboardBlockType,
    MultistateBlockType,
    ScreenSizeBlockType,
    ImageBlockType,
    TextInputBlockType,
    FileInputBlockType,
    CheckBoxBlockType,
    RadioInputBlockType,
    SliderBlockType,
    StackBlockType,
    VnetBlockType
} = (UserLevelBlockTypes = require('../user-level-block-type'));

import { HistoryView } from './commit-history';
import CodeShower from '../frontend/code-shower';

import {
    IdleMode,
    DrawingMode,
    DraggingScreenMode,
    DynamicizingMode,
    TypingMode,
    PushdownTypingMode,
    VerticalPushdownMode,
    ReplaceBlocksMode,
} from '../interactions/layout-editor';

import DiffViewInteraction from '../interactions/diff-view';
import { getSizeOfPdom, mountReactElement } from './get-size-of-pdom';

({log_assert, log_assert, track_warning, collisions, FixedSizeStack, assert, zip_dicts, find_connected, memoize_on, propLink, if_changed} = (util = require('../util')));
import model_differ from '../model_differ';
import { server, server_for_config } from './server';
import config from '../config';
import ViewportManager from './viewport-manager';
import { figma_import } from '../figma-import';
import { recommended_pagedraw_json_for_app_id } from '../recommended_pagedraw_json';
import { subscribeToDevServer } from '../lib-cli-client';
import { LibraryPreviewSidebar } from './library-preview-sidebar';

const DraggableInElectron = wrapped => {
    if (window.is_electron) {
    return React.createElement("div", {"style": ({WebkitAppRegion: "drag"})}, (wrapped));
    } else { return wrapped; }
};

const ErrorPage = require('../meta-app/error-page');

const defaultExport = {};

defaultExport.Editor = (Editor = createReactClass({
    displayName: 'Editor',
    mixins: [RenderLoop],

    childContextTypes: {
        getInstanceEditorCompileOptions: propTypes.func,
        editorCache: propTypes.object,
        enqueueForceUpdate: propTypes.func
    },

    // Propagates the following to the entire subtree of EditPage, so everyone
    // can access it
    getChildContext() {
        return {
            editorCache: this.editorCache,
            getInstanceEditorCompileOptions: this.getInstanceEditorCompileOptions,
            enqueueForceUpdate: this.enqueueForceUpdate
        };
    },

    render() {
        if (_l.size(this.librariesWithErrors) > 0) {
            const lib_in_dev_mode = _l.find(this.librariesWithErrors, {inDevMode: true});

            const cli_running = !_l.some(lib_in_dev_mode != null ? lib_in_dev_mode.loadErrors(window) : undefined, err => err.__pdStatus === 'net-err');
            return React.createElement(ErrorPage, {"message": (lib_in_dev_mode && !cli_running 
                                       ? "You have a library in dev mode but you're not running pagedraw develop in the CLI"
                                       : "Some libraries failed to load"),  
                              "detail": (lib_in_dev_mode && !cli_running ? React.createElement("a", {"href": "https://documentation.pagedraw.io/cli/"}, "Click here to install the pagedraw CLI") : undefined)},
                React.createElement("div", {"style": ({display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', marginTop: '20px'})},
                    (this.librariesWithErrors.map(lib => {
                        const error = _l.first(lib.loadErrors(window)); // FIXME: Maybe show all of them?
                        return React.createElement("div", {"key": (lib.uniqueKey), "style": ({display: 'flex', marginBottom: '20px'})},
                            React.createElement("div", {"style": ({marginRight: '20px'})},
                                React.createElement("strong", null, (lib.name())),
                                (lib.inDevMode ? React.createElement("div", null, "In dev mode") : undefined)
                            ),
                            React.createElement("div", null,
                                React.createElement("code", {"style": ({whiteSpace: 'pre', display: 'flex', textAlign: 'left'})}, (error.stack))
                            ),
                            (error.__pdStatus === 'different-state-upon-load' ?
                                React.createElement(PdButtonOne, {"onClick": (() => {
                                    if (this.docjsonThatWasPreventedFromLoading == null) { return; }

                                    return makeLibAtVersion(window, lib.library_id, lib.version_id).then(new_lib => {
                                        let found;
                                        const newCodeSpecRefs = new_lib.cachedExternalCodeSpecs.map(({ref}) => ref);

                                        if ((found = _l.find(lib.cachedExternalCodeSpecs, ({ref}) => !Array.from(newCodeSpecRefs).includes(ref))) != null) {
                                            // FIXME: Should alert the user instead of throwing
                                            throw new Error('Reinstall failed. Would delete external code specs.');
                                        }
                                        const doc = Doc.deserialize(this.docjsonThatWasPreventedFromLoading);
                                        doc.addLibrary(new_lib);

                                        this.librariesWithErrors = [];
                                        this.finishLoadingDoc(doc, doc.serialize());
                                        return this.docjsonThatWasPreventedFromLoading = null;
                                });
                                }

                                ), "type": "warning"}, "Attempt to reinstall library") : undefined
                            )
                        );
                    }))
                ),
                React.createElement("div", {"style": ({display: 'flex', justifyContent: 'center'})},
                    React.createElement(PdButtonOne, {"onClick": (() => {
                        if (this.docjsonThatWasPreventedFromLoading == null) { return; }
                        this.librariesWithErrors = [];
                        this.finishLoadingDoc(Doc.deserialize(this.docjsonThatWasPreventedFromLoading), this.docjsonThatWasPreventedFromLoading);
                        return this.docjsonThatWasPreventedFromLoading = null;
                    }
                    ), "type": "danger"}, "Proceed without loading libraries"),
                    React.createElement("div", {"style": ({width: 20})}),
                    React.createElement(PdButtonOne, {"type": "primary", "onClick"() { return window.location = window.location; }}, "Refresh")
                )
             );
        }

        // if @isLoaded() == false
        //     return React.createElement("div", {"style": (backgroundColor: 'rgb(251, 251, 251)')},
        //         (###
        //         Nothing in particular to do with loading, but we have the same offscreen div as below.
        //         We need it in the boot sequence before the editor isLoaded()
        //         ###),
        //         React.createElement("div", {"style": (visibility: 'hidden'), "key": "off_screen_div", "ref": "off_screen_div"})
        //     )

        assert(() => this.doc.isInReadonlyMode());

        const editorMode = this.getEditorMode();
        editorMode.rebuild_render_caches();

        if (this.props.playground) {
            return React.createElement("div", {"style": ({display: 'flex', flex: '1'})},
                (editorMode.canvas(this)),
                React.createElement("div", {"style": ({visibility: 'hidden'}), "ref": "off_screen_div"})
            );
        }

        assert(() => this.doc.isInReadonlyMode());

        const shadowDom = ({contents, wrapper}) => {
            if (config.shadowDomTheEditor) {
                return React.createElement(ShadowDOM, {"includeCssUrls": (config.editor_css_urls)},
                    (wrapper(contents))
                );

            } else {
                return contents;
            }
        };

        return React.createElement("div", {"style": (
            // The StackBlitz integration overrides {height: '100%'}
            _l.extend({height: '100vh', flex: 1, display: 'flex', flexDirection: 'column'}, this.props.editorOuterStyle)
        )},
            React.createElement(Helmet, null, React.createElement("title", null, (this.props.windowTitle != null ? this.props.windowTitle : `${this.doc.url} — Pagedraw`))),
            (font_loading_head_tags_for_doc(this.doc)),

            (shadowDom({
                wrapper: content => content,
                contents:
                    React.createElement(ShouldSubtreeRender, {"shouldUpdate": (this.editorCache.render_params.dontUpdateSidebars !== true), "subtree": (() => DraggableInElectron(
                        editorMode.topbar(this, this.props.defaultTopbar != null ? this.props.defaultTopbar : (
                            config.nonComponentMultistates ? 'with-mk-multi' : 'default'
                        ))
                    ))})
            })),

            React.createElement("div", {"style": ({display: 'flex', flex: 1, flexDirection: 'row'})},
                ( config.layerList ?
                    shadowDom({
                        wrapper: content => {
                            return React.createElement("div", {"style": ({display: 'flex', flexDirection: 'row', height: '100%'})},
                                (content)
                            );
                        },
                        contents:
                            React.createElement(React.Fragment, null,
                                React.createElement("div", {"style": ({display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}), "key": "ll"},
                                    React.createElement(ShouldSubtreeRender, {"shouldUpdate": (this.editorCache.render_params.dontUpdateSidebars !== true), "subtree": (() => {
                                        return editorMode.leftbar(this);
                                    }
                                    )})
                                ),
                                React.createElement("div", {"className": "vdivider", "key": "bhs-div"})
                            )
                    }) : undefined
                ),

                ( config.libraryPreviewSidebar ? [
                    React.createElement(ShouldSubtreeRender, {"shouldUpdate": (this.editorCache.render_params.dontUpdateSidebars !== true), "key": "sb", "subtree": (() => {
                        return React.createElement(LibraryPreviewSidebar, {"doc": (this.doc), "setEditorMode": (this.setEditorMode), "editorMode": (editorMode), "onChange": (this.handleDocChanged)});
                    }
                    )}),
                    React.createElement("div", {"className": "vdivider", "key": "lps-div"})
                ] : undefined),

                (
                    editorMode.canvas(this)
                ),

                ( config.docSidebar || !_l.isEmpty(this.getSelectedBlocks()) ?
                    shadowDom({
                        wrapper: content => {
                            return React.createElement("div", {"style": ({display: 'flex', flexDirection: 'row', height: '100%'})},
                                (content)
                            );
                        },
                        contents:
                            React.createElement(React.Fragment, null,
                                React.createElement("div", {"className": "vdivider", "key": "sb-div"}),
                                React.createElement(ShouldSubtreeRender, {"shouldUpdate": (this.editorCache.render_params.dontUpdateSidebars !== true), "key": "sb", "subtree": (() => {
                                    return editorMode.sidebar(this);
                                }
                                )})
                            )
                    }) : undefined
                )
            ),

            // (###
            // @refs.off_screen_div is used for when we need access to a DOM node but don't want
            // to interfere with the Editor, for example with getSizeOfPdom().
            // ###),
            React.createElement("div", {"style": ({visibility: 'hidden'}), "key": "off_screen_div", "ref": "off_screen_div"})
        );
    },

    //# Topbar utilities
    topbarBlockAdder() {
        const trigger = React.createElement("div", null, React.createElement(TopbarButton, {"text": "Add", "image": "https://ucarecdn.com/10ab7bf3-7f34-4d0f-a1b4-3187747c3862/"}));

        const popover = closePopover => {
            let block_types, children;
            const entry_for_type = blockType => ({
                keyCommand: blockType.getKeyCommand(),
                label: blockType.getName(),
                handler: () => {
                    closePopover();
                    this.setEditorMode(new DrawingMode(blockType));
                    return this.handleDocChanged({fast: true, mutated_blocks: {}});
                }
            });
            const item_for_type = blockType => {
                const {label, handler, keyCommand} = entry_for_type(blockType);
                return React.createElement(MenuItem, {"text": (label), "onClick": (handler), "label": (keyCommand), "key": (blockType.getUniqueKey())});
            };

            var external_code_entries = (node, key) => {
                if (node.ref != null) { return item_for_type(new ExternalBlockType(_l.find(this.doc.getExternalCodeSpecs(), {uniqueKey: node.ref})));
                } else { return React.createElement(MenuItem, {"text": (node.name), "key": (`folder-${key}`)}, (node.children.map(external_code_entries))); }
            };

            return React.createElement("div", {"style": ({
                borderRadius: 5,
                borderTopLeftRadius: 0,
                boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.62)",
                maxHeight: "calc(87vh - 47px)",
                overflow: 'auto'
            })},
                React.createElement(Menu, null,
                    React.createElement(MenuItem, {"text": "Shapes"},
                        (((o => _l.compact(o).map(item_for_type)))([
                            LayoutBlockType,
                            LineBlockType,
                            OvalBlockType,
                            TriangleBlockType,
                            config.vnet_block ? VnetBlockType : undefined
                        ]))
                    ),
                    React.createElement(MenuDivider, null),
                    (_l.compact([
                        ArtboardBlockType,
                        MultistateBlockType,
                        ScreenSizeBlockType,
                        config.stackBlock ? StackBlockType : undefined
                    ]).map(item_for_type)),
                    React.createElement(MenuDivider, null),
                    ([TextBlockType, ImageBlockType].map(item_for_type)),
                    React.createElement(MenuDivider, null),
                    React.createElement(MenuItem, {"text": "Form Inputs"},
                        ([TextInputBlockType, FileInputBlockType, CheckBoxBlockType, RadioInputBlockType, SliderBlockType].map(item_for_type))
                    ),
                    React.createElement(MenuDivider, null),
                    React.createElement(MenuItem, {"text": "Document Component"},
                        ((block_types = user_defined_block_types_list(this.doc)).length > 0 ? block_types.map(item_for_type)
                        : React.createElement(MenuItem, {"text": "Draw an artboard to define a component", "disabled": (true)}))
                    ),
                    (config.realExternalCode ? React.createElement(MenuItem, {"text": "Library Component"},
                        React.createElement(MenuItem, { 
                            "text": "Search for and add libraries",  
                            "onClick": (() => { this.setEditorMode(new LibStoreInteraction()); closePopover(); return this.handleDocChanged({fast: true}); })
                        }),
                        ((children = this.doc.getExternalCodeSpecTree().children).length > 0 ? children.map(external_code_entries)
                        : React.createElement(MenuItem, {"text": "No libraries added to this document yet", "disabled": (true)}))
                    ) : undefined)
                )
            );
        };

        return React.createElement(Popover, {"trigger": (trigger), "popover": (popover), "popover_position_for_trigger_rect"(trigger_rect) { return {
            top: trigger_rect.top + 35,
            left: trigger_rect.left + 11
        }; }});
    },

    showUpdatingFromFigmaModal() {
        let access_token;
        if (access_token = window.pd_params.figma_access_token) {
            window.history.replaceState(null, null, `/pages/${window.pd_params.page_id}`);
            return modal.show((closeHandler => {
                figma_import(this.doc.figma_url, access_token).then(({doc_json}) => {
                    this.updateJsonFromFigma(doc_json);
                    return closeHandler();
                });
                return [
                    React.createElement(Modal.Header, null,
                        React.createElement(Modal.Title, null, "Updating from Figma")
                    ),
                    React.createElement(Modal.Body, null,
                        React.createElement("img", {"style": ({display: 'block', marginLeft: 'auto', marginRight: 'auto'}), "src": "https://ucarecdn.com/59ec0968-b6e3-4a00-b082-932b7fcf41a5/"})
                    )
                ];
        })
            );
        } else {
            return window.location.href = `/oauth/figma_redirect?page_id=${window.pd_params.page_id}`;
        }
    },

    getDocSidebarExtras() { return React.createElement("div", null,
        ( config.realExternalCode ?
            React.createElement(React.Fragment, null,
                React.createElement(PdSidebarButton, {"onClick": (() => { this.setEditorMode(new LibStoreInteraction()); return this.handleDocChanged({fast: true}); })}, "Add Libraries to Doc"),
                React.createElement(PdSidebarButton, {"onClick": (() => libManagerModal(this.doc, this.handleDocChanged))}, "Create Libraries")
            ) : undefined
        ),

        ( config.handleRawDocJson ?
            React.createElement("div", null,
                React.createElement(PdSidebarButton, {"onClick": (() => {
                    return modal.show(closeHandler => [
                        React.createElement(Modal.Header, {"closeButton": true},
                            React.createElement(Modal.Title, null, "Serialized Doc JSON")
                        ),
                        React.createElement(Modal.Body, null,
                            React.createElement("p", null, "Hey, you found a Pagedraw Developer Internal Feature!  That\'s pretty cool, don\'t tell your friends."),
                            React.createElement(CodeShower, {"content": (JSON.stringify(this.doc.serialize()))})
                        ),
                        React.createElement(Modal.Footer, null,
                            React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Close")
                        )
                    ]);
                }
                )}, "Serialize Doc"),

                React.createElement(FormControl, {"tag": "textarea", "style": ({width: '100%'}),  
                    "valueLink": (propLink(this, 'raw_doc_json_input', () => this.handleDocChanged({fast: 'true'}))),  
                    "placeholder": "Enter raw doc json..."}),
                React.createElement(PdSidebarButton, {"onClick": ((() => {
                    let json;
                    try {
                        json = JSON.parse(this.raw_doc_json_input);
                    } catch (e) {
                        // FIXME this should only catch if the Doc.deserialize is what failed
                        alert("failed to deserialize doc");
                        return;
                    }

                    this.raw_doc_json_input = '';
                    return this.setDocJson(json);
                }
                ))}, `\
Set Doc from Json\
`),
                React.createElement("hr", null)
            ) : undefined
        ),


        ((() => {
         if (config.crashButton) {
            if (this.crashy === true) { throw new Error("crashy!"); }
            return React.createElement("div", null,
                React.createElement(PdSidebarButton, {"onClick": (() => { return this.crashy = true; })}, "Crash"),
                React.createElement(PdSidebarButton, {"onClick": (() => log_assert(() => false))}, "Log assert false"),
                React.createElement(PdSidebarButton, {"onClick": (() => log_assert(() => true))}, "Log assert true"),
                React.createElement(PdSidebarButton, {"onClick": (() => log_assert(() => true[0]['undefined']()))}, "Log assert throws"),
                React.createElement("hr", null)
            );
        }
        
    })()),

        (!_l.isEmpty(this.doc.figma_url) ?
            React.createElement("div", null,
                (
                    window.pd_params.figma_access_token ?
                        React.createElement(PdSidebarButton, {"onClick": (this.showUpdatingFromFigmaModal)}, "Update from Figma")
                    :
                        React.createElement("a", {"href": `/oauth/figma_redirect?page_id=${window.pd_params.page_id}`},
                            React.createElement(PdSidebarButton, null, "Update from Figma")
                        )
                ),
                React.createElement("hr", null)
            ) : undefined
        ),

        (this.imported_from_sketch ?
            React.createElement("div", null,
                React.createElement(PdSidebarButton, {"onClick": (() => {
                    return modal.show(closeHandler => {
                        return [
                            React.createElement(Modal.Header, {"closeButton": true},
                                React.createElement(Modal.Title, null, "Update from Sketch")
                            ),
                            React.createElement(Modal.Body, null,
                                React.createElement(SketchImporter, {"onImport": (doc_json => { this.updateJsonFromSketch(doc_json); return closeHandler(); })})
                            ),
                            React.createElement(Modal.Footer, null,
                                React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Close")
                            )
                        ];
                });
                })}, "Update from Sketch "),
                React.createElement("hr", null)
            ) : undefined
        ),

        ( config.configEditorButton ?
            React.createElement("div", null,
                React.createElement(PdSidebarButton, {"onClick": (window.__openConfigEditor)}, "Config"),
                React.createElement("hr", null)
            ) : undefined
        ),

        ( config.normalizeForceAllButton ?
            React.createElement("div", null,
                React.createElement(PdSidebarButton, {"onClick": (() => { this.doc.inReadonlyMode(() => this.normalizeForceAll()); return this.handleDocChanged({fast: true}); })}, "Force Normalize All"),
                React.createElement("hr", null)
            ) : undefined
        ),

        ( config.diffSinceCommitShower && (this.docRef != null) ?
            React.createElement("div", null,
                React.createElement(PdSidebarButton, {"onClick": (() => {
                    const diff = prettyPrintDocDiff(this.cacheOfLastCommit.doc, this.doc);
                    return server.compileDocjson(this.doc.serialize(), compiled_head => {
                        return server.compileDocjson(this.cacheOfLastCommit.doc.serialize(), function(compiled_master) {
                            const zipped = zip_dicts([compiled_master, compiled_head].map(results => _l.keyBy(results, 'filePath')));
                            const diff_results = _l.compact(_l.map(zipped, function(...args) {
                                const [old_result, new_result] = Array.from(args[0]), filePath = args[1];
                                if ((old_result == null) && (new_result != null)) {
                                    return [filePath, [{color: 'green', line: new_result.contents}]];
                                } else if ((old_result != null) && (new_result == null)) {
                                    return [filePath, [{color: 'red' , line: old_result.contents}]];
                                } else if ((old_result == null) && (new_result == null)) {
                                    throw new Error('Unreachable case');

                                } else if (old_result.contents !== new_result.contents) {
                                    const diffedLines = _l.flatten(jsdiff.diffLines(old_result.contents, new_result.contents).map(function(part) {
                                        if (part.added) { return part.value.split('\n').map(line => ({
                                            color: 'green',
                                            line
                                        }));
                                        } else if (part.removed) { return part.value.split('\n').map(line => ({
                                            color: 'red',
                                            line
                                        }));
                                        } else {
                                            // part was unchanged.  Print a few lines of it for context
                                            const lines = part.value.split('\n');
                                            if (lines.length < 9) {
                                                return lines.map(line => ({
                                                    color: 'grey',
                                                    line
                                                }));
                                            } else {
                                                return [
                                                    ...Array.from((lines.slice(0, 3).map(line => ({
                                                        color: 'grey',
                                                        line
                                                    })))),
                                                    {color: 'brown', line: '...'},
                                                    ...Array.from((lines.slice(-3).map(line => ({
                                                        color: 'grey',
                                                        line
                                                    }))))
                                                ];
                                            }
                                        }}));
                                    return [filePath, diffedLines];
                                }
                        }));

                            diff_results.push(['Doc Diff', JSON.stringify(diff, null, 2).split('\n').map(line => ({
                                color: 'grey',
                                line
                            }))]);

                            return modal.show(closeHandler => { return [
                                React.createElement(Modal.Header, {"closeButton": true},
                                    React.createElement(Modal.Title, null, "Differences since last commit")
                                ),
                                React.createElement(Modal.Body, null,
                                    React.createElement(Tabs, {"defaultActiveKey": (0), "id": "commit-diffs-tabs"},
                                        ( diff_results.map((...args) => {
                                            const [filePath, diffedLines] = Array.from(args[0]), key = args[1];
                                            return React.createElement(Tab, {"eventKey": (key), "title": (filePath), "key": (key)},
                                                React.createElement("div", {"style": ({width: '100%', overflow: 'auto', backgroundColor: 'white'})},
                                                    (diffedLines.map(({color, line}) => React.createElement("div", {"style": ({color, whiteSpace: 'pre', fontFamily: 'monospace'})}, (line))))
                                                )
                                            );
                                        }))
                                    )
                                ),
                                React.createElement(Modal.Footer, null,
                                    React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Close")
                                )
                            ]; });
                    });
                });
                }
                )}, "Diff since last Commit"),
                React.createElement("hr", null)
            ) : undefined
        ),

        ((this.docRef != null) ?
            React.createElement(HistoryView, {"docRef": (this.docRef),  
                         "doc": (this.doc),  
                         "setDocJson": (this.setDocJson),  
                         "user": (this.props.current_user),  
                         "showDocjsonDiff": (commits_docjson => {
                            this.setEditorMode(new DiffViewInteraction(commits_docjson, this.doc.serialize()));
                            return this.handleDocChanged({fast: true, mutated_blocks: []});
                        }
                        )}) : undefined
        )
    ); },

    hasUncommitedChanges() {
        if ((this.docRef == null)) { return false; }

        // Updates the last commited Json asyncrhonously.
        const lastCommitRef = _l.first(server.getCommitRefsAsync(this.docRef));

        if ((lastCommitRef != null) === false) {
            // We are making a product choice of not bothering users with this hasUncommitedChanges
            // thing if they never touched the commits feature
            return false;
        }

        if ((lastCommitRef.uniqueKey !== (this.cacheOfLastCommit != null ? this.cacheOfLastCommit.uniqueKey : undefined)) && (this.cacheOfLastCommitRequestHash !== lastCommitRef.uniqueKey)) {
            this.cacheOfLastCommitRequestHash = lastCommitRef.uniqueKey;
            server.getCommit(this.docRef, lastCommitRef).then(serializedCommit => {
                // This request got there, but it was too late, and another more recent request was already fired
                if (this.cacheOfLastCommitRequestHash !== lastCommitRef.uniqueKey) { return; }

                this.cacheOfLastCommitRequestHash = undefined;
                this.cacheOfLastCommit = {doc: Doc.deserialize(serializedCommit), uniqueKey: lastCommitRef.uniqueKey};
                return this.handleDocChanged({fast: true, subsetOfBlocksToRerender: [], dontUpdateSidebars: false});
            });
        }

        if ((this.cacheOfLastCommit != null ? this.cacheOfLastCommit.uniqueKey : undefined) !== lastCommitRef.uniqueKey) {
            // Another product decision. If there is not cache, we default to false
            return false;
        }

        // FIXME: this should be cached since isEqual is expensive
        return !this.doc.isEqual(this.cacheOfLastCommit.doc);
    },

    showCommitView(e) {
        this.selectBlocks([]);
        this.setSidebarMode('draw');
        return this.handleDocChanged({fast: true});
    },


    //# Major incremental lifecycle

    assertSynchronousDirty() {
        if (!config.asserts) { return; }

        // Get a stack trace that includes the caller, and whoever called them.  The caller is soemthing like
        // setEditorMode, which requires the sync @handleDocChanged() call, and *it's* caller is the one we're
        // shaming for not calling @handleDocChanged().
        const caller_stack_trace_holding_error = new Error("handleDocChanged() wansn't called synchronously");

        // Strategy: cache the old render count.  A handleDocChanged() will bump the render count.  Check later
        // to ensure the count has changed.  If it hasn't, handleDocChanged() wasn't called.
        return if_changed({
            value: () => this.renderCountForAsserts,
            compare(a, b) { return a === b; },
            after: cb => {
                // Schedule as soon as possible, asynchronously.  Promise.then schedules a microtask, which comes before
                // window.setTimeout()s.  However, our microtask will be scheduled after other microtasks already scheduled,
                // so if someone else snuck in and handleDocChange()d, we'll mistake that for a sync call.
                // We're not strictly guaranteeing synchronous dirties,  but we have a pretty good heuristic.
                return Promise.resolve().then(() => cb());
            }
        }).then(unchanged => {
            if (unchanged) { return console.error(caller_stack_trace_holding_error); }
        });
    },

    // handleDocChanged is async:
    // It is vital that you don't mutate the doc after calling handleDocChanged.
    handleDocChanged(render_params) {
        // Intercept and revert any change made in readonly mode
        if (render_params == null) { render_params = {}; }
        if ((this.props.readonly === true) && !render_params.fast) { return this.swapDoc(this.lastDocFromServer); }

        // Invariant #1: Everyone who mutates the doc calls handleDocChanged synchronously afterwards
        // Invariant #2: No one can mutate the doc while it is in readonlyMode
        // We assume 1 and would like to test #2 but that is very hard so we test a derived invariant which is
        // Assert: No one can synchronously mutate the doc while in a React lifecycle (componentWill/DidMount, render, etc)
        // Every React lifecycle callback should be within @isRenderingFlagForAsserts so...
        log_assert(() => !this.isRenderingFlagForAsserts || ((render_params.mutated_blocks != null) && _l.isEmpty(render_params.mutated_blocks)));

        // assert the doc doesn't change between now and when we finish, except for normalize().
        // it's important that we don't change in between firing @doc.enterReadonlyMode() and when
        // the forceUpdate actually starts updating us, because forceUpdate can be async (!)
        this.isRenderingFlagForAsserts = true;
        this.renderCountForAsserts += 1;

        this.doc.enterReadonlyMode();

        assert(() => _l.every((() => {
            const result = [];
            for (let key in render_params) {
                result.push([
                    'fast', 'dontUpdateSidebars', 'subsetOfBlocksToRerender', 'dont_recalculate_overlapping', 'mutated_blocks'
                ].includes(key));
            }
            return result;
        })()));
        this.editorCache.render_params = render_params;

        // We're not using promises because dirty isn't really asnyc— it's actually just batching re-entrant calls.
        // This is a really important distinction because we're saying doc is readonly for the duration of the
        // forceUpdate.  If we were truly "async", we couldn't do this because someone else could come in in the
        // middle of the render and mutate the doc.  We can't use promises because that would actually make us async.
        return (callback_because_dirty_is_async => {

            if (config.onlyNormalizeAtTheEndOfInteractions && this.editorCache.render_params.fast) {
                // assert dirty doesn't mutate the doc (the doc is the same before and after dirty)
                return this.dirtyAll(() => {
                    return callback_because_dirty_is_async();
                });

            } else {
                this.normalize();
                // assert dirty doesn't mutate the doc (the doc is the same before and after dirty)
                return this.dirtyAll(() => {
                    // handleSave() comes after normalize() and dirty() so if either of them crash,
                    // the changes that made them crash won't be persisted
                    this.handleSave();
                    this.saveHistory();

                    return callback_because_dirty_is_async();
            });
            }
        }

        )(() => {
            // dirty is calling forceUpdate, which takes a callback.  We return a promise instead,
            // but are still running this .then after the forceUpdate() has finished.
            // The key takeaway is that we can't rely on @handleDocChanged doing anything synchronously.
            // If we need to do something after handleDocChanged, handleDocChanged is going to return a Promise.

            this.doc.leaveReadonlyMode();
            return this.isRenderingFlagForAsserts = false;
        });
    },

            // FIXME add a self-healing incremental random normalize() and full dirty()
            // also use them for their original purpose and report/assert when they fire, because in an ideal
            // world they wouldn't need to

            // render_params should not be used outside of @dirty, so we should clean them up afterwards to avoid confusion.
            // However, we may use .setState or .forceUpdate React subtrees outside of Editor.dirty().  If we do, the subtree's
            // render params are the same render_params as the last time @dirty was called.
            // @editorCache.render_params = undefined

    // NOTE: All of this stuff should probably live in router.cjsx, but for now...
    enqueueForceUpdate(element, callback, dirtyAllCallback) {
        if (dirtyAllCallback != null) { this.dirtyAllCallbacks.push(dirtyAllCallback); }
        this.enqueuedForceUpdates += 1;
        return element.forceUpdate(() => {
            assert(() => this.doc.isInReadonlyMode());
            if (typeof callback === 'function') {
                callback();
            }
            assert(() => this.doc.isInReadonlyMode());
            this.enqueuedForceUpdates -= 1;
            if (this.enqueuedForceUpdates === 0) {
                for (callback of Array.from(this.dirtyAllCallbacks)) { callback(); }
                return this.dirtyAllCallbacks = [];
            }
    });
    },

    dirtyAll(whenAllFinished) {
        assert(() => this.doc.isInReadonlyMode());
        // FIXME: The editor's forceUpdate is @dirty so we do the below hack
        return this.enqueueForceUpdate({forceUpdate: callback => this.dirty(callback)}, (function() {}), whenAllFinished);
    },

    // Should be called in every normalize and maybe a few other places like swapDoc
    clearEditorCaches() {
        this.editorCache.compiledComponentCache = {};
        this.editorCache.instanceContentEditorCache = {};
        return this.editorCache.getPropsAsJsonDynamicableCache = {};
    },
        // We preserve @editorCache.lastOverlappingStateByKey across normalizes. Logic is in LayoutEditor.render
        // We preserve @editorCache.blockComputedGeometryCache across normalizes. Logic is below

    // IMPORTANT: This can throw because evalInstanceBlock can throw. Callers should catch and handle the error
    getBlockMinGeometry(block) { return this._getBlockMinGeometry(block, this.getInstanceEditorCompileOptions(), ReactDOM.findDOMNode(this.refs.off_screen_div)); },
    _getBlockMinGeometry(block, instanceEditorCompilerOptions, offscreen_node) {
        if (!(block instanceof BaseInstanceBlock)) {
            return {minWidth: 0, minHeight: 0};

        } else {
            const source = block.getSourceComponent();
            if ((source == null)) { return {minWidth: 0, minHeight: 0}; }

            let pdom = this.clean_pdom_for_geometry_computation(evalInstanceBlock(block, instanceEditorCompilerOptions));
            pdom.width = 'min-content';

            let cache_entry = this.other_peoples_computed_instance_min_widths[block.uniqueKey];

            // FIXME: Now this returns the ceiling to prevent subpixel values from messing us up. Might wanna
            // substitute this by the padding trick we do in TextBlock instead
            const minWidth = Math.ceil(
                (cache_entry != null) && static_pdom_is_equal(pdom, cache_entry.pdom)
                ? cache_entry.width
                : getSizeOfPdom(pdom, offscreen_node).width
            );

            const computedWidth = source.componentSpec.flexWidth ? Math.max(block.width, minWidth) : minWidth;
            pdom = clonePdom(pdom);
            pdom.width = computedWidth;
            cache_entry = this.other_peoples_computed_instance_min_heights[block.uniqueKey];
            const minHeight = Math.ceil(
                (cache_entry != null) && static_pdom_is_equal(pdom, cache_entry.pdom)
                ? cache_entry.height
                : getSizeOfPdom(pdom, offscreen_node).height
            );

            return {minWidth, minHeight};
        }
    },

    // FIXME: This is broken. The assert at the end returns false sometimes
    _fastGetBlockMinGeometry(block, instanceEditorCompilerOptions, offscreen_node) {
        if (!(block instanceof BaseInstanceBlock)) {
            return {minWidth: 0, minHeight: 0};

        } else {
            let minHeight;
            const source = block.getSourceComponent();
            if ((source == null)) { return {minWidth: 0, minHeight: 0}; }

            const pdom = this.clean_pdom_for_geometry_computation(evalInstanceBlock(block, instanceEditorCompilerOptions));
            pdom.width = 'min-content';

            let cache_entry = this.other_peoples_computed_instance_min_widths[block.uniqueKey];

            let mounted = null;
            const dom_element = () => mounted != null ? mounted : (mounted = mountReactElement(pdomToReact(pdom), offscreen_node));

            // FIXME: Now this returns the ceiling to prevent subpixel values from messing us up. Might wanna
            // substitute this by the padding trick we do in TextBlock instead
            const minWidth = Math.ceil(
                (cache_entry != null) && static_pdom_is_equal(pdom, cache_entry.pdom)
                ? cache_entry.width
                : dom_element().getBoundingClientRect().width
            );

            cache_entry = this.other_peoples_computed_instance_min_heights[block.uniqueKey];
            if ((cache_entry != null) && static_pdom_is_equal(pdom, cache_entry.pdom)) {
                minHeight = Math.ceil(cache_entry.height);
            } else {
                const computedWidth = source.componentSpec.flexWidth ? Math.max(block.width, minWidth) : minWidth;
                const old_width = dom_element().style.width;
                dom_element().style.width = computedWidth;
                minHeight = Math.ceil(dom_element().getBoundingClientRect().height);
                dom_element().style.width = old_width; // so we don't mutate the dom behind react's back
            }

            if (mounted != null) { ReactDOM.unmountComponentAtNode(offscreen_node); }

            assert(() => _l.isEqual(this._getBlockMinGeometry(block, instanceEditorCompilerOptions, offscreen_node), {minWidth, minHeight}));

            return {minWidth, minHeight};
        }
    },

    // FIXME: Hack, don't rely on this. Doesn't necessarily exist
    offscreen_node() {
        return ReactDOM.findDOMNode(this.refs.off_screen_div);
    },

    let_normalize_know_block_geometries_were_correctly_computed_by_someone_else() {
        // This function exists because different browsers/machines have different opinions about the size of the same DOM.
        // Gabe and I agreed one of the worst things that could happen is you open the doc and everything changes.  This is
        // because changing usually means breaking.  We have, finally, a fantastic test that measures exactly this.  Look
        // for `yarn editor-loads-safely test`.  That should break if we mess up here.
        // The idea is when we get a fresh docjson normalized on (potentially) another machine, we should capture something
        // about the computed geometries here.  Later, when we're computing geometries, if the block hasn't been changed
        // since we loaded it, we stay with the block's original geometries.  We stay with the block's original geometries
        // even if we think they're wrong.
        return this.doc.inReadonlyMode(() => {
            const compile_opts = this.getInstanceEditorCompileOptions();
            const offscreen_node = ReactDOM.findDOMNode(this.refs.off_screen_div);

            // FIXME clean these caches by removing deleted blocks from them
            this.editorCache.blockComputedGeometryCache = {};
            this.other_peoples_computed_instance_min_widths = {};
            this.other_peoples_computed_instance_min_heights = {};

            return (() => {
                const result = [];
                for (let block of Array.from(this.doc.blocks)) {
                    var pdom;
                    if (block instanceof TextBlock) {
                        pdom = this.clean_pdom_for_geometry_computation(block.pdomForGeometryGetter(compile_opts));
                        const cache = {pdom, height: block.height, width: block.computedSubpixelContentWidth};
                        result.push(this.editorCache.blockComputedGeometryCache[block.uniqueKey] = cache);

                    } else if (block instanceof BaseInstanceBlock) {
                        try {
                            var source;
                            if ((source = block.getSourceComponent()) == null) { continue; }
                            const [resizable_width, resizable_height] = Array.from([source.componentSpec.flexWidth, source.componentSpec.flexHeight]);

                            pdom = this.clean_pdom_for_geometry_computation(evalInstanceBlock(block, compile_opts));
                            pdom.width = 'min-content';
                            let computed = getSizeOfPdom(pdom, offscreen_node);

                            this.other_peoples_computed_instance_min_widths[block.uniqueKey] = {
                                pdom,
                                width: resizable_width ? Math.min(computed.width, block.width) : block.width
                            };

                            pdom = clonePdom(pdom);
                            pdom.width = block.width;
                            computed = getSizeOfPdom(pdom, offscreen_node);
                            result.push(this.other_peoples_computed_instance_min_heights[block.uniqueKey] = {
                                pdom,
                                height: resizable_height ? Math.min(computed.height, block.height) : block.height
                            });
                        } catch (error) {}
                    }

                    else {}
                }
                return result;
            })();
        });
    },
                    // pass; thankfully we're only doing this crazy thing on a couple kinds of blocks

    // NOTE: very much mutating
    clean_pdom_for_geometry_computation(pdom) {
        foreachPdom(pdom, function(pd) {
            // idea: delete any properties that don't affect layout, like colors.  This way the checks to see whether pdom
            // changed enough that we need to recompute the geometry of a block will be robust to irrelevant changes.
            delete pd.backingBlock;
            delete pd.color; // font color
            delete pd.background;
            delete pd.boxShadow;
            delete pd.textShadow;
            return delete pd.cursor;
        });

        // even though this is mutating, it's still easier to use if we return the pdom it took in
        return pdom;
    },

    // FIXME: normalize should be idempotent. Right now it just kind of is because it sometimes depends on the order of
    // the height computations because each compiling of an instance block uses the heights of the other blocks Right now
    // we are kind of fine because every component has a fixed height/width not determined by content but this might
    // change. In order to fix this problem for good we need a deterministic require scheduler (similar to Yarn) that
    // calculates the correct order of compiling components via topological sort.
    normalize() {
        let block, changed_blocks_by_uniqueKey, e, flexLength, height, width, willMutate;
        let uniqueKey;
        if (!config.normalize) {
            this.clearEditorCaches();
            return;
        }
        assert(() => this.doc.isInReadonlyMode());

        // Someone told us which blocks mutated since the last normalize
        if (this.editorCache.render_params.mutated_blocks != null) {
            changed_blocks_by_uniqueKey = _l.keys(this.editorCache.render_params.mutated_blocks);

        // If no one told us we behave like grown ups and calculate it ourselves
        } else {
            const [old_docjson, next_docjson] = Array.from([this.last_normalized_doc_json, this.doc.serialize()]);

            // Find out which blocks changed since the last normalize
            changed_blocks_by_uniqueKey = ((() => {
                const result = [];
                const object = zip_dicts([old_docjson.blocks, next_docjson.blocks]);
                
                for (uniqueKey in object) {
                    const [old_block_json, next_block_json] = object[uniqueKey];
                    if (!_l.isEqual(old_block_json, next_block_json)) {
                        result.push(uniqueKey);
                    }
                }
            
                return result;
            })());
        }

        // changed_blocks_by_uniqueKey :: [uniqueKey]

        // We invalidate any instance blocks whose source changed
        // A component named sourceRef changed iff old_doc.getComponentBlockTreeBySourceRef(sourceRef) != new_doc.getComponentBlockTreeBySourceRef(sourceRef).
        // This equality is defined in terms of block tree nodes being equal.  Block tree nodes are equal if
        //   1) their blocks are equal according to Block.isEqual, except for positioning
        //   2) if (either) block is an instance block, they're both instance blocks pointing to equal source components
        //   3) each tree node has exactly 1 child node equal to each of the other tree node's children, and these equal
        //      child tree nodes' blocks have the same positioning relative to their parents.
        // The positioning conditions may be loosened so we can just use Block.isEqual, at the risk of false positives (saying things are different when they're equal).


        // instanceBlocksForComponent :: {sourceRef: [InstanceBlock]?}
        // instanceBlocksForComponent[sourceRef] == undefined if there are no InstanceBlocks with that sourceRef
        const instanceBlocksForComponent = _l.groupBy(this.doc.blocks.filter(b => b instanceof InstanceBlock), 'sourceRef');

        // newOwningComponentForBlock :: {uniqueKey: sourceRef?}
        // newOwningComponentForBlock[block.uniqueKey] == undefined if the block is outside any component
        const newOwningComponentForBlock = _l.fromPairs(_l.flatten((
            Array.from(this.doc.getComponentBlockTrees()).map((blockTree) => (() => {
                const result1 = [];
                for (let block of Array.from(blocks_from_block_tree(blockTree))) {                     result1.push([block.uniqueKey, blockTree.block.componentSpec.componentRef]);
                }
                return result1;
            })())
        ))
        );

        const blocks_to_normalize = _l.compact(find_connected(changed_blocks_by_uniqueKey, block_uniqueKey => {
            return _l.flatten(((() => {
                const result2 = [];
                for (let owningComponentForBlock of [this.oldOwningComponentForBlock, newOwningComponentForBlock]) {
                    const component = owningComponentForBlock[block_uniqueKey];
                    if (component === undefined) { result2.push([]);
                    } else { result2.push(_l.map((instanceBlocksForComponent[component] != null ? instanceBlocksForComponent[component] : []), 'uniqueKey')); }
                }
            
                return result2;
            })()));
        }).map(uniqueKey => this.doc.getBlockByKey(uniqueKey))
        );

        this.oldOwningComponentForBlock = newOwningComponentForBlock;


        const offscreen_node = ReactDOM.findDOMNode(this.refs.off_screen_div);

        // clear cache
        this.clearEditorCaches();

        //# IMPORTANT: NEVER MUTATE ANYTHING IN normalize() WITHOUT THE FUNCTION s BELOW
        // We *must* leaveReadonlyMode before mutating anything in the doc. If we don't do that, we won't
        // persist the changes later and arbitrary bad things can happen
        let was_useful = false;
        assert(() => this.doc.isInReadonlyMode());
        const s = (obj, prop, val) => {
            if (obj[prop] !== val) {
                this.doc.leaveReadonlyMode();
                obj[prop] = val;
                this.doc.enterReadonlyMode();
                return was_useful = true;
            }
        };

        // FIXME(!) if normalize changes a block, we *must* add it to mutated_blocks

        const instanceEditorCompilerOptions = this.getInstanceEditorCompileOptions();

        // HACK: is_screenfull should become part of component spec and use computed_properties
        for (block of Array.from(this.doc.blocks)) {
            if (block instanceof ArtboardBlock && block.is_screenfull) {
                for (flexLength of ['flexWidth', 'flexHeight']) { s(block.componentSpec, flexLength, true); }
            }
        }

        // HACK: don't let screen size blocks generate non-flex components

        for (block of Array.from(this.doc.blocks)) {
            if (block instanceof ScreenSizeBlock) {
                for (flexLength of ['flexWidth', 'flexHeight']) { s(block.componentSpec, flexLength, true); }
            }
        }

        // FIXME if we mutate a block in normalize, we don't recursively re-normalize InstanceBlocks that refer to that block.
        // FIXME this means normalize is not idempotent

        if (this.props.normalizeCheckMode != null) {
            this.props.normalizeCheckMode.assert(() => blocks_to_normalize.length === this.doc.blocks.length);
        }

        for (block of Array.from(blocks_to_normalize)) {
            // Some blocks have the height automatically determined by their content
            // To ensure all such blocks are in a correct state we do this at every doc.normalize()
            // Don't do it in content mode, so we not compete with ContentEditor.updateReflowedBlockPositions to do it's job
            if (block instanceof TextBlock) {
                if (!this.props.skipBrowserDependentCode && !config.skipBrowserDependentCode) {
                    const pdom = this.clean_pdom_for_geometry_computation(block.pdomForGeometryGetter(instanceEditorCompilerOptions));

                    let cache_entry = this.editorCache.blockComputedGeometryCache[block.uniqueKey];
                    if ((cache_entry == null) || !static_pdom_is_equal(pdom, cache_entry.pdom)) {
                        ({height, width} = getSizeOfPdom(pdom, offscreen_node));
                        this.editorCache.blockComputedGeometryCache[block.uniqueKey] = (cache_entry = {pdom, height, width});
                    }

                    s(block, 'computedSubpixelContentWidth', cache_entry.width);
                    if (block.contentDeterminesWidth) { s(block, 'width', Math.ceil(block.computedSubpixelContentWidth)); }
                    s(block, 'height', cache_entry.height);
                }

                //# Set flexWidth = false in the case that you are auto width, since those together don't make sense
                if (block.contentDeterminesWidth) { s(block, 'flexWidth', false); }
                s(block, 'flexHeight', false); // text blocks with flex height don't make sense today

            } else if (block instanceof BaseInstanceBlock) {
                var minHeight, minWidth;
                const source = block.getSourceComponent();

                // we can't do anything if the source component has been deleted
                if (source === undefined) { continue; }

                willMutate = fn => { this.doc.leaveReadonlyMode(); fn(); return this.doc.enterReadonlyMode(); };
                block.propValues.enforceValueConformsWithSpec(source.componentSpec.propControl, willMutate);

                // LAYOUT SYSTEM 1.0: 3.2)
                // "Instances can be made flexible on some axis if and only if a component's length is resizable along that axis."
                if (!source.componentSpec.flexWidth) { s(block, 'flexWidth', false); }
                if (!source.componentSpec.flexHeight) { s(block, 'flexHeight', false); }

                // Everything after this line for instance blocks should be browser dependent (calculating min geometries)
                if (this.props.skipBrowserDependentCode || config.skipBrowserDependentCode || config.skipInstanceResizing) { continue; }

                // The below does evalInstanceBlock so we catch any evaled users errors here
                try {
                    ({minWidth, minHeight} = this._getBlockMinGeometry(block, instanceEditorCompilerOptions, offscreen_node));
                } catch (error) {
                    e = error;
                    if (config.warnOnEvalPdomErrors) { console.warn(e); }
                    continue;
                }

                s(block, 'width', source.componentSpec.flexWidth ? Math.max(block.width, minWidth) : minWidth);
                s(block, 'height', source.componentSpec.flexHeight ? Math.max(block.height, minHeight) : minHeight);
            }
        }

        willMutate = fn => { this.doc.leaveReadonlyMode(); fn(); return this.doc.enterReadonlyMode(); };
        for (let externalInstance of Array.from(_l.flatten(this.doc.blocks.map(b => b.externalComponentInstances)))) {
            var spec;
            if (((spec = getExternalComponentSpecFromInstance(externalInstance, this.doc)) == null)) { continue; }
            externalInstance.propValues.enforceValueConformsWithSpec(spec.propControl, willMutate);
        }

        // If there are two or more components with the same componentRef, we regenerate componentRefs for all of the
        // recently added components to the doc
        // NOTE: Can't use getComponents here because we want to go over all component specs
        const blocksWithComponentSpecs = _l.filter(this.doc.blocks, block => block.componentSpec != null);
        const componentsWithSameRef = _l.pickBy(_l.groupBy(blocksWithComponentSpecs, 'componentSpec.componentRef'), arr => arr.length > 1);
        for (let components of Array.from(_l.values(componentsWithSameRef))) {
            var needle;
            const recentlyAdded = components.filter(c => (needle = c.uniqueKey, !Array.from(_l.map(this.last_normalized_doc_json != null ? this.last_normalized_doc_json.blocks : undefined, 'uniqueKey')).includes(needle)));

            if (recentlyAdded.length === components.length) {
                console.warn('Multiple components found with the same Ref but unable to understand which was the original one');
                continue;
            }

            for (let component of Array.from(recentlyAdded)) {
                this.doc.leaveReadonlyMode();
                component.componentSpec.regenerateKey();
                this.doc.enterReadonlyMode();
                was_useful = true;
            }
        }

        // More low level geometry invariants
        for (block of Array.from(this.doc.blocks)) {
            // Ensure blocks never NaN (since that completely screws user docs forever) and console.warn
            for (let geom_prop of ['top', 'left', 'height', 'width']) {
                if (_l.isNaN(block[geom_prop])) {
                    s(block, geom_prop, 100);
                    console.warn(`Found NaN at ${geom_prop} of block ${block.uniqueKey}`);
                }
            }

            // Round all block edges to make sure we just keep rounded pixels
            // FIXME rounding error when {left: 1449, width: 62.00000000000001} -> block.edges.right == 1511 (an int!)
            for (e of Array.from(Block.edgeNames)) { s(block.edges, e, Math.round(block.edges[e])); }

            if (block.height < 1) { s(block, 'height', 1); }
            if (block.width < 1) { s(block, 'width', 1); }
        }

        for (block of Array.from(this.doc.blocks)) {
            var artboard;
            if ((artboard = block.artboard) != null) {
                if (block.centerHorizontal) {
                    s(block, 'left', block.integerPositionWithCenterNear(artboard.horzCenter, 'left'));
                    s(block, 'flexMarginLeft', true);
                    s(block, 'flexMarginRight', true);
                }

                if (block.centerVertical) {
                    s(block, 'top', block.integerPositionWithCenterNear(artboard.vertCenter, 'top'));
                    s(block, 'flexMarginTop', true);
                    s(block, 'flexMarginBottom', true);
                }
            }
        }

        for (let stack of Array.from(this.doc.blocks)) {
            if (stack instanceof StackBlock) {
                const {start, length, crossStart, crossCenter} = 
                    stack.directionHorizontal ? {start: 'left', length: 'width', crossStart: 'top', crossCenter: 'vertCenter'} 
                    : {start: 'top', length: 'height', crossStart: 'left', crossCenter: 'horzCenter'};
                const children = _l.sortBy(stack.children, start);
                const space_between = (stack[length] - _l.sumBy(children, length)) / (children.length + 1);
                let space_used = 0;
                for (let i = 0; i < children.length; i++) {
                    const stacked = children[i];
                    const crossDiff = stack[crossCenter] - stacked[crossCenter];
                    const mainDiff = (stack[start] + space_used + space_between) - stacked[start];
                    for (let c of Array.from(stacked.andChildren())) {
                        s(c, start, c[start] + mainDiff);
                        s(c, crossStart, c[crossStart] + crossDiff);
                    }
                    space_used += space_between + stacked[length];
                }
            }
        }

        for (let ncms of Array.from(this.doc.blocks)) {
            var preview_artboard;
            if (ncms instanceof MutlistateHoleBlock && ((preview_artboard = ncms.getArtboardForEditor()) != null)) {
                ncms.size = preview_artboard.size;
            }
        }


        // End of normalize. re-enter readonly mode, in case we had to leave
        if (was_useful) { console.log("normalize() had an effect"); }
        assert(() => this.doc.isInReadonlyMode());

        // Save state so we can check against it in the next normalize() call
        this.last_normalized_doc_json = this.doc.serialize();

        // These are too expensive to compute on every render, so we compute them on every normalize instead
        this.cache_error_and_warning_messages();

        // We alwasy dirty at the end of normalize
        return this.editorCache.render_params.mutated_blocks = _l.keyBy(blocks_to_normalize, 'uniqueKey');
    },

        // FIXME: we should probably update @editorCache.render_params.subsetOfBlocksToRerender if was_useful

    // WARNING: only use this in tests if you know what you're doing
    normalizeForceAll() {
        // NOTE: hope that the below line actually forces the normalize all. Not sure it's true but probably
        this.editorCache.render_params.mutated_blocks = _l.keyBy(this.doc.blocks, 'uniqueKey');
        this.doc.enterReadonlyMode();
        this.normalize();
        return this.doc.leaveReadonlyMode();
    },

    getInstanceEditorCompileOptions() { return {
        templateLang: this.doc.export_lang,
        for_editor: true,
        for_component_instance_editor: true,
        getCompiledComponentByUniqueKey: this.getCompiledComponentByUniqueKey
    }; },

    getCompiledComponentByUniqueKey(uniqueKey) {
        return memoize_on(this.editorCache.compiledComponentCache, uniqueKey, () => {
            const componentBlockTree = this.doc.getBlockTreeByUniqueKey(uniqueKey);
            if ((componentBlockTree == null)) { return undefined; }
            return compileComponentForInstanceEditor(componentBlockTree, this.getInstanceEditorCompileOptions());
        });
    },


    //# Editor state management

    // externally use these getters and setters instead of editor.editorMode directly
    getEditorMode() { return this.editorMode; },
    setEditorMode(mode) {
        mode.willMount(this);
        this.editorMode = mode;
        return this.assertSynchronousDirty();
    },

    setEditorStateToDefault() {
        return this.setEditorMode(new IdleMode());
    },

    toggleMode(mode) {
        if (!this.getEditorMode().isAlreadySimilarTo(mode)) {
        return this.setEditorMode(mode);
        } else { return this.setEditorStateToDefault(); }
    },


    docNameVL() {
        return {
            value: this.doc.url,
            requestChange: value => {
                this.doc.url = value;
                this.handleDocChanged();

                // FIXME this should just happen in handleSave, instead of needing a special valueLink
                if (this.docRef != null) { return server.saveMetaPage(this.docRef, {url: value}, _ => null); }
            }
        };
    },

    setSidebarMode(mode) {
        return this.setEditorMode((() => { switch (mode) {
            case 'code': return new DynamicizingMode();
            case 'draw': return new IdleMode();
        
        } })());
    },

    getDefaultViewport() {
        const union = Block.unionBlock(this.doc.blocks);
        if (union === null) { return {top: 0, left: 0, width: 10, height: 10}; }

        // padding should be equal on opposite sides if possible, assumes an infinite canvas in +x, +y
        const maxPadding = 100;
        const padding = Math.max(0, Math.min(maxPadding, union.left, union.top));

        return {top: union.top - padding, left: union.left - padding, width: union.width + (2 * padding), height: union.height + (2 * padding)};
    },

    // primarily useful for debugging, when you have a block uniqueKey
    showBlock(uniqueKey) {
        const block = _l.find(this.doc.blocks, {uniqueKey});
        if ((block == null)) {
            console.log("no block for that uniqueKey");
            return;
        }
        this.selectBlocks([block]);
        this.handleDocChanged({fast: true});
        return this.viewportManager.setViewport(block);
    },

    handleLayerListSelectedBlocks(selection, selectionOpts) {
        if (!selectionOpts.additive) {
            const viewport = new Block(this.viewportManager.getViewport());
            const selected_area = Block.unionBlock(selection);
            if (viewport.intersection(selected_area) === null) {
                this.viewportManager.centerOn(selected_area);
            }
        }
        return this.selectBlocks(selection, selectionOpts);
    },

    selectBlocks(selection, param) {
        let artboardEnclosingAllSelectedBlocks, left;
        if (param == null) { param = {additive: false}; }
        const {additive} = param;
        if ((selection == null)) { throw new Error('type error, selectBlocks expected non-null `blocks` array'); }

        // disallow selecting DocBlocks
        selection = selection.filter(block => !block.isDocBlock);

        if (additive) {
            const oldSelection = this.selectedBlocks;
            selection = oldSelection.concat(selection)
                // deselect blocks which were previously selected
                .filter(b => !(Array.from(oldSelection).includes(b) && Array.from(selection).includes(b)));
        }

        // Keep track of the "activeArtboard". This is kind of a hack that we have to do in order to
        // emulate some of Sketch's UI since Sketch has a notion of current active artboard
        const union = Block.unionBlock(selection);
        if ((union != null) && (artboardEnclosingAllSelectedBlocks = _l.find(this.doc.artboards, a => a.contains(union)))) {
            this.activeArtboard = artboardEnclosingAllSelectedBlocks;
        }

        // We need a shallow clone here, since we don't want @selectedBlocks to be the exact same array as
        // doc.blocks for example (otherwise getSelectedBlocks would be mutating doc.blocks, which is bad)
        return this.selectedBlocks = ((left = _l.uniq(selection))) != null ? left : [];
    },

    getSelectedBlocks() {
        // do an in-place update of blocks who's underlying blocks have changed
        // This typically is because the type of the block has changed, so we need
        // a new block object, we've dehydrated a new version of the doc, or we've
        // deleted a block.  In case of a deletion, .getBlock() will return null.
        // We filter these out at the end.

        let needs_removals = false;

        for (let i = 0; i < this.selectedBlocks.length; i++) {
            var hole;
            const b = this.selectedBlocks[i];
            var replacement = b.getBlock();

            if (replacement instanceof MutlistateAltsBlock && (hole = _l.find(this.doc.blocks, b => b instanceof MutlistateHoleBlock && (b.altsUniqueKey === replacement.uniqueKey)))) {
                replacement = hole.getBlock();
            }

            // Also automatically unlesect blocks that are locked
            if (replacement != null ? replacement.locked : undefined) { replacement = null; }
            if (b !== replacement) {
                this.selectedBlocks[i] = replacement;
                if ((replacement == null)) { needs_removals = true; }
            }
        }

        if (needs_removals) {
            this.selectedBlocks = this.selectedBlocks.filter(b => b != null);
        }

        return this.selectedBlocks.slice();
    },

    setHighlightedblock(block) { return this.highlightedBlock = block; },

    getActiveArtboard() { return (this.activeArtboard = this.activeArtboard != null ? this.activeArtboard.getBlock() : undefined); },

    handleSelectParent() {
        const parent = __guard__(this.getSelectedBlocks()[0], x => x.parent);
        if (parent && !parent.isDocBlock) { return this.selectBlocks([parent]); }
    },

    handleSelectChild() {
        const selectedBlocks = this.getSelectedBlocks();
        if (selectedBlocks.length !== 1) { return; }

        const children = this.doc.getImmediateChildren(selectedBlocks[0]);
        if (!_l.isEmpty(children || !Array.from(this.doc.blocks).includes(children[0]))) { return this.selectBlocks([children[0]]); }
    },

    // Selects the sibling at a +/- integer offset in the array of my immediate siblings
    // FIXME: This relies on the order of children being always the same given some state of the doc
    // We should make sure that is enforced in the doc data structure
    handleSelectSibling(offset) {
        const selectedBlocks = this.getSelectedBlocks();
        if (_l.isEmpty(selectedBlocks)) { return; }

        // Handles negatives
        const mod = (n, l) => ((n % l) + l) % l;
        const get_next = (current, delta, lst) => lst[mod(_l.indexOf(lst, current) + delta, lst.length)];

        const selected = selectedBlocks[0];
        const next_block = get_next(selected, offset, _l.sortBy(selected.getSiblingGroup(), ['top', 'left']));
        return this.selectBlocks([next_block]);
    },


    getBlockUnderMouseLocation(where) { return this.doc.getBlockUnderMouseLocation(where); },

    //# Modal UIs

    handleShortcuts() {
        const Meta =
            window.navigator.platform.startsWith('Mac') ? '⌘'
            : window.navigator.platform.startsWith('Win') ? 'Ctrl'
            : 'Meta';

        // stash shortcutsModalCloseFn on `this` so the keyboard shortcut shift+?
        // can see it and close the modal if it's already open
        const registerCloseHandler = closeHandler => {
            return this.shortcutsModalCloseFn = function() {
                closeHandler();
                return delete this.shortcutsModalCloseFn;
            };
        };

        return modal.show(closeHandler => { registerCloseHandler(closeHandler); return [
            React.createElement(Modal.Header, {"closeButton": true},
                React.createElement(Modal.Title, null, "Pagedraw Shortcuts")
            ),
            React.createElement(Modal.Body, null,
                React.createElement("p", null, "a → Draw Artboard"),
                React.createElement("p", null, "m → Draw Multistate Grouping"),
                React.createElement("p", null, "r → Draw Rectangle"),
                React.createElement("p", null, "t → Draw Text Block"),
                React.createElement("p", null, "Backspace\x2FDelete → Remove block"),
                React.createElement("hr", null),

                React.createElement("p", null, "d → Mark Dynamic Data"),
                React.createElement("p", null, "p → Enter pushdown mode"),
                React.createElement("hr", null),

                React.createElement("p", null, "Shift + Resize → Resize block w\x2F fixed ratio"),
                React.createElement("p", null, "Alt + Resize → Resize block from center\x2Fmiddle"),
                React.createElement("p", null, "Alt + IJKL Keys → Traverse document"),
                React.createElement("p", null, (Meta), " + Drag → Selection box"),
                React.createElement("p", null, "Alt + Drag → Drag copy with children"),
                React.createElement("p", null, "Alt + Arrow Keys → Nudge block w\x2F children"),
                React.createElement("p", null, "Shift + Drag → Drag block perfectly vertically or horizonally"),
                React.createElement("p", null, "Arrow Keys → Nudge Block"),
                React.createElement("p", null, "Caps Lock → Prevent Snap to Grid"),
                React.createElement("p", null, (Meta), " + ", ("Shift + <"), " → Decrease font size"),
                React.createElement("p", null, (Meta), " + ", ("Shift + >"), " → Increase font size"),
                React.createElement("p", null, (Meta), " + A → Select all blocks"),
                React.createElement("p", null, (Meta), " + Arrow Keys → Expand block"),
                React.createElement("p", null, "Space + Drag → Drag canvas"),
                React.createElement("p", null, "s → Create blank 1024 x 1024 artboard"),
                React.createElement("hr", null),

                React.createElement("p", null, (Meta), " + \'+\' → Zoom in"),
                React.createElement("p", null, (Meta), " + \'-\' → Zoom out"),
                React.createElement("p", null, (Meta), " + 0 → Return to 100% zoom"),
                React.createElement("hr", null),


                React.createElement("p", null, (Meta), " + C → Copy"),
                React.createElement("p", null, (Meta), " + X → Cut"),
                React.createElement("p", null, (Meta), " + P → Paste"),
                React.createElement("hr", null),

                React.createElement("p", null, (Meta), " + Z → Undo"),
                React.createElement("p", null, (Meta), " + Shift + Z or ", (Meta), " + Y → Redo"),
                React.createElement("hr", null),

                React.createElement("p", null, "Shift + ? → Open\x2Fclose shortcuts modal")
            ),
            React.createElement(Modal.Footer, null,
                React.createElement(PdButtonOne, {"type": "primary", "onClick": (this.shortcutsModalCloseFn)}, "Close")
            )
        ]; });
    },

    handleStackBlitzSave() {
        // from the StackBlitz topbar
        return (typeof this.props.onStackBlitzShare === 'function' ? this.props.onStackBlitzShare() : undefined);
    },

    handleExport() {
        return modal.show(closeHandler => {
            // The Tabs used below didn't layout correctly right out of the box
            // possibly because of the namespaced bootstrap stuff. I added
            // a CSS hack to .nav-tabs to make it work. See editor.css
            return [
                React.createElement(Modal.Header, {"closeButton": true},
                    React.createElement(Modal.Title, null, "Sync Code")
                ),
                React.createElement(Modal.Body, null,
                    (
                        _l.isEmpty(this.doc.getComponents()) ?
                            React.createElement("div", null,
                                React.createElement("h3", null, "No components in this doc!"),
                                React.createElement("p", null, `\
Each artboard in Pagedraw defines a component.
Please draw at least one artboard (\'A\' + drag) before trying to export code.\
`)
                            )
                        :
                            React.createElement("div", null,
                                React.createElement("h5", {"style": ({margin: '9px 0', color: 'black'})}, "Step 1. Install Pagedraw CLI"),
                                React.createElement("p", null, "In bash terminal (Terminal.app on macOS) run:"),
                                React.createElement(CodeShower, {"content": ("npm install -g pagedraw-cli")}),

                                React.createElement("h5", {"style": ({margin: '9px 0', color: 'black'})}, "Step 2. Login to Pagedraw "),
                                React.createElement("p", null, "In terminal run:"),
                                React.createElement(CodeShower, {"content": ("pagedraw login")}),

                                React.createElement("h5", {"style": ({margin: '9px 0', color: 'black'})}, "Step 3. pagedraw.json"),
                                React.createElement("p", null, "In the root of your project create a file pagedraw.json with the following contents"),
                                React.createElement(CodeShower, {"content": (recommended_pagedraw_json_for_app_id(this.props.app_id, this.doc.filepath_prefix))}),

                                React.createElement("h5", {"style": ({margin: '9px 0', color: 'black'})}, "Step 4. Pagedraw Sync\x2FPull"),
                                React.createElement("p", null, "Start Pagedraw sync process (it runs continuously):"),
                                React.createElement(CodeShower, {"content": ("pagedraw sync")}),

                                React.createElement("p", null, "Alternatively, to one-off download the Pagedraw file changes, run"),
                                React.createElement(CodeShower, {"content": ("pagedraw pull")}),

                                React.createElement("p", null, "Check out ", React.createElement("a", {"href": "https://documentation.pagedraw.io/install/"}, "https:\x2F\x2Fdocumentation.pagedraw.io\x2Finstall\x2F"), " for more info.")
                            )

                    )
                ),
                React.createElement(Modal.Footer, null,
                    React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Close")
                )
            ];
    });
    },

    topbarPlayButtonIsEnabled() { return (this.getPlayStartScreen() != null); },

    getPlayStartScreen() {
        let artboard;
        const selectedBlocks = this.getSelectedBlocks();
        if (selectedBlocks.length !== 1) { return null; }
        const selected = selectedBlocks[0];
        if (selected instanceof ArtboardBlock) { return selected; }
        if ((artboard = selected.getEnclosingArtboard()) != null) { return artboard; }
        if (selected instanceof InstanceBlock) { return selected; }
        return null;
    },

    handlePlay() {
        const start_screen = this.getPlayStartScreen();
        if (!(start_screen == null)) {
            const open_url_in_new_tab_and_separare_js_context = url => // Open a new window with target="_blank"
            // For resiliance, use rel="noopener" to use a separate js context.  We're faking a link click instead of using window.open
            // because if we pass noopener to window.open, we loose the tab bar, status, bar, and other browser features we're not triyng
            // to mess with.
            _l.extend(window.document.createElement("a"), {href: url, target: '_blank', rel: 'noopener noreferrer'}).click();

            return open_url_in_new_tab_and_separare_js_context(`/pages/${window.pd_params.page_id}/play/${start_screen.uniqueKey}/`);

        } else {
            return modal.show(closeHandler => [
                React.createElement(Modal.Header, null,
                    React.createElement(Modal.Title, null, "Select an Artboard to play with it")
                ),
                React.createElement(Modal.Body, null, `\
If you have no artboards, you should start by drawing one from the `, React.createElement("code", null, "Add"), ` menu.
See `, React.createElement("a", {"href": "https://documentation.pagedraw.io/the-editor/"}, "https:\x2F\x2Fdocumentation.pagedraw.io\x2Fthe-editor\x2F"), ` for more details.\
`),
                React.createElement(Modal.Footer, null,
                    React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Close")
                )
            ]);
        }
    },


    updateJsonFromSketch(doc_json) {
        // this shouldn't be possible in a StackBlitz, but just to be safe
        if (this.docRef == null) { return; }

        return this.updateJsonFromDesignTool(doc_json, {
            getLastImport: docRef => server.getLastSketchImportForDoc(docRef),
            saveLatestImport: (docRef, doc_json) => server.saveLatestSketchImportForDoc(docRef, doc_json)
        }
        );
    },

    updateJsonFromFigma(doc_json) {
        // this shouldn't be possible in a StackBlitz, but just to be safe
        if (this.docRef == null) { return; }

        return this.updateJsonFromDesignTool(doc_json, {
            getLastImport: docRef => server.getLastFigmaImportForDoc(docRef),
            saveLatestImport: (docRef, doc_json) => server.saveLatestFigmaImportForDoc(docRef, doc_json)
        }
        );
    },

    updateJsonFromDesignTool(doc_json, {getLastImport, saveLatestImport}) {
        return getLastImport(this.docRef).then(lastImportedJson => {
            // rebase local doc off of new doc
            const [updated_design, base] = Array.from([Doc.deserialize(doc_json), Doc.deserialize(lastImportedJson)]);

            if (config.remapSymbolsToExistingComponents) { remapSymbolsToExistingComponents(updated_design, this.doc); }

            // Product choice: edits in Pagedraw take precedence over edits in outside design tool if there's a conflict
            const rebased_doc = Doc.rebase(this.doc, updated_design, base);

            // unfortunately, we work in jsons... for now
            this.setDocJson(rebased_doc.serialize());

            // Ensure doc is normalized
            this.doc.enterReadonlyMode();
            this.normalize();
            this.doc.leaveReadonlyMode();

            return saveLatestImport(this.docRef, doc_json);
        });
    },

    handleHelp() {
        // redirect
        return window.open('http://documentation.pagedraw.io/install_new/');
    },

    handleNewComponent() {
        let artboardBlock, blocksToComponentize, left;
        if (_l.isEmpty(this.selectedBlocks)) { return; }

        const root = Block.unionBlock(this.selectedBlocks);

        // Where the instance block will go
        const oldRootGeometry = _l.pick(root, ['top', 'left', 'width', 'height']);

        // Use the largest ancestor to define what the initial try will be.
        const largestAncestor = ((left = _l.maxBy(this.doc.blocks.filter(parent => parent.isAncestorOf(root)), 'order')) != null ? left : root);
        const newRootPosition = this.doc.getUnoccupiedSpace(root, {top: largestAncestor.top, left: largestAncestor.right + 100});

        const [xOffset, yOffset] = Array.from([newRootPosition.left - root.left, newRootPosition.top - root.top]);

        // Create artboard and move selected blocks inside of it unless a top level artboard is the only block selected
        if ((this.selectedBlocks.length === 1) && this.selectedBlocks[0] instanceof ArtboardBlock) {
            artboardBlock = this.selectedBlocks[0];
            blocksToComponentize = this.doc.blockAndChildren(artboardBlock);
        } else if ((this.selectedBlocks.length === 1) && this.selectedBlocks[0] instanceof LayoutBlock) {
            const originalColor = this.selectedBlocks[0].color;
            artboardBlock = this.selectedBlocks[0].becomeFresh(new_members => ArtboardBlockType.create(new_members));
            artboardBlock.color = originalColor;
            blocksToComponentize = this.doc.blockAndChildren(artboardBlock);
        } else {
            artboardBlock = new ArtboardBlock({top: newRootPosition.top, left: newRootPosition.left, height: root.height, width: root.width, includeColorInCompilation: false});
            blocksToComponentize = _l.uniq(_l.flatten(this.selectedBlocks.map(b => this.doc.blockAndChildren(b))));
            this.doc.addBlock(artboardBlock);
        }

        for (let block of Array.from(blocksToComponentize)) { block.nudge({x: xOffset, y: yOffset}); }

        // Create instance block at old position
        const instance = new InstanceBlock({sourceRef: artboardBlock.componentSpec.componentRef, 
            top: oldRootGeometry.top, left: oldRootGeometry.left, width: oldRootGeometry.width, height: oldRootGeometry.height});

        this.doc.addBlock(instance);

        this.viewportManager.centerOn(artboardBlock);

        return this.handleDocChanged();
    },

    handleMakeMultistate() {
        return programs.make_multistate(this.getSelectedBlocks(), this);
    },

    //# React lifecycle

    isLoaded() { return this.doc !== null; },

    componentWillMount() {
        if (config.editorGlobalVarForDebug) {
            window.Editor = this;
            window._l = _l;
            if (!('$b' in window)) { Object.defineProperty(window, '$b', { get() { return window.Editor.selectedBlocks[0]; } }); } // don't redefine it
        }

        // make sure all blocks are loaded.  If we forget, we can crash
        // because we don't know how to deserialize a block whose type
        // we haven't loaded yet
        require('../load_compiler');

        // internal getInitialState since we're bypassing React
        this.setEditorStateToDefault();
        this.selectedBlocks = [];
        this.activeArtboard = null;
        this.highlightedBlock = null;
        this.viewportManager = new ViewportManager();

        this.isRenderingFlagForAsserts = false;
        this.renderCountForAsserts = 0;

        this.dirtyAllCallbacks = [];
        this.enqueuedForceUpdates = 0;

        // doc is the Doc corresponding to the page being edited currently
        this.doc = null;

        this.configurePageForAppBehavior();

        this.editorCache = {
            // This is the cache used by image block to show an image before it is uploaded to our CDN
            // We do this here since we do not want to persist transient data like this. It's editor level only
            // This expects key value pairs of the format Block unique Key => PNG Data URI
            imageBlockPngCache: {},                          //  {uniqueKey: String}

            compiledComponentCache: {},                      //  {uniqueKey: Pdom}

            // USED WHERE: instance block render function
            // VALID: as long as none of the blocks inside the corresponding component change, or the props change.
            // Changing geometry of instance block is fine since we just put a Pdom in here which is essentially resizable HTML
            // CACHING WHAT: the layoutEditor view of instance blocks.
            instanceContentEditorCache: {},                  //  {uniqueKey: React element}

            // USED WHERE: Instance block sidebar render function. Instance Block renderHTML in BlockEditor
            // VALID: as long as the source component's componentSpec doesn't change  and the props don't change
            // CACHING WHAT: Props of an instance block
            getPropsAsJsonDynamicableCache: {},              //  {uniqueKey: JsonDynamicable }

            // CACHING WHAT: Geometry of TextBlocks
            // USED WHERE: Instance block sidebar render function. Instance Block renderHTML in BlockEditor
            // VALID: as long as the text block's properties (except for a few safe props specified in normalize) dont cahnge
            // INVALIDATION POLICY: Check if each text block changed in normalize
            blockComputedGeometryCache: {},                  //  {uniqueKey: {serialized: Json, height: Int, width: Int}}

            lastOverlappingStateByKey: {}                   //  {uniqueKey: Boolean }
        };

        // initialize the actual optional caches.  The ones above are technically internal state.
        this.clearEditorCaches();

        [this.errors, this.warnings] = Array.from([[], []]);

        if ((this.props.page_id != null) && (this.props.docserver_id != null)) {
            // if we have the right materials to sync, set up a standard livecollab sync session
            this.docRef = server.getDocRefFromId(this.props.page_id, this.props.docserver_id);
            return this.initializeServerSync();

        } else if ('initialDocJson' in this.props) {
            // FIXME for reasons I don't understand, we fail EditorLoadsSafely test unless we defer with this setTimeout().
            // The commit that added the timeout was specifically fixing EditorLoadsSafely test, so I don't think this is
            // an accident.  However, I've completely forgotten what the reasoning behind this was.  EditorLoadsSafely test
            // is one of our most correctness sensitive guarantees, so this is really sketchy.  I'd like to figure out what's
            // going on here.  -JRP 6/14/2018
            return window.setTimeout(() => {
                return this.finishLoadingEditor(this.props.initialDocJson);
            });

        } else if (this.props.normalizeCheckMode != null) {
            this.doc = Doc.deserialize(this.props.normalizeCheckMode.docjson);

            // Load fonts in one of the most convoluted ways possible.  Also set up the editor, for a more
            // realistic normalize environment.
            this.handleDocChanged({fast: true});

            return window.setTimeout(() => {
                // NOTE: We need to setTimeout first to make sure the fonts are already in the doc
                // then we wait for the fonts to be ready so normalize does its thing with the correct fonts
                return window.document.fonts.ready.then(() => {
                    this.oldOwningComponentForBlock = {};
                    // The following line guarantees that subsetOfBlocksToRerender = all blocks
                    // so normalize does it thing for everyone
                    this.editorCache.render_params.mutated_blocks = _l.keyBy(this.doc.blocks, 'uniqueKey');

                    // nake sure we don't let_normalize_know_block_geometries_were_correctly_computed_by_someone_else()
                    assert(() => _l.isEmpty(this.editorCache.blockComputedGeometryCache));
                    assert(() => _l.isEmpty(this.other_peoples_computed_instance_min_geometries));
                    assert(() => _l.isEmpty(this.other_peoples_computed_instance_heights));

                    this.doc.enterReadonlyMode();
                    this.normalize();
                    this.doc.leaveReadonlyMode();

                    console.log('Normalize done in normalizeCheckMode');

                    return this.props.normalizeCheckMode.callback(this.doc.serialize());
                });
            });
        }
    },

    finishLoadingEditor(json) {
        // load the json into the actual editor
        const doc = Doc.deserialize(json);

        if (doc.libCurrentlyInDevMode() != null) {
            subscribeToDevServer(function(id, errors) {
                if (errors.length > 0) {
                    if (errors[0] === 'disconnected') { console.warn("dev server disconnected");
                    } else { console.warn("Library code has errors. Check the CLI"); }
                    return;
                }
                console.log('Hot reloading per request of Pagedraw CLI dev server');
                return window.location = window.location;
            });
        }

        return Promise.all(doc.libraries.map(lib => lib.load(window))).catch(function(e) {
            console.error('lib.load should be catching user errors');
            throw e;
        }).then(() => {
            if ((this.librariesWithErrors = doc.libraries.filter(l => !l.didLoad(window))).length > 0) {
                this.docjsonThatWasPreventedFromLoading = json;
                return this.dirty(function() {});
            }

            return this.finishLoadingDoc(doc, json);
        });
    },

    finishLoadingDoc(doc, json) {
        this.doc = doc;

        // so we show errors on the first load
        this.cache_error_and_warning_messages();

        // On the first doc load, initialize some values from metaserver.
        // From here on, the value for doc.url is owned by the docjson in docserver, and cached in metaserver
        if (this.doc.url == null) { this.doc.url = this.props.url; }

        // and we're off!
        this.handleDocChanged({fast: true}); // skip normalize, save, and saveHistory

        // if we're doing this initialization as a result of a previous recovery, stash the recovery state
        // from a previous call to OtherEditor.getCrashRecoveryState()
        this.is_recovering_with_recovery_state = window.crash_recovery_state;

        // set up the undo/redo system to start from the doc loaded from the server
        this.initializeUndoRedoSystem(json);

        // Set up global event handlers.  Wait until now so they'll never be called before @doc exists
        this.initializeCopyPasteSystem();
        this.listen(document, 'keydown', this.handleKeyDown);
        this.listen(document, 'keyup', this.handleKeyUp);

        // Allow js to calculate layout in window coordinates by making sure we'll re-render if the window size
        // changes.  Currently this is needed for the color picker.
        // FIXME this feels like it should be in router.cjsx, but that shouldn't have access to handleDocChanged().
        // handleDocChanged() just does a rerender.  We should call it something else. We need it because it does cache things.
        this.listen(window, 'resize', () => this.handleDocChanged({fast: true, subsetOfBlocksToRerender: []}));

        // enable chaos mode if we want to mess with the user
        if (config.flashy) { this.loadEditor2(); }

        // Set the default zoom
        this.viewportManager.setViewport((this.is_recovering_with_recovery_state != null ? this.is_recovering_with_recovery_state.viewport : undefined) != null ? (this.is_recovering_with_recovery_state != null ? this.is_recovering_with_recovery_state.viewport : undefined) : this.getDefaultViewport());

        // once we've come back up with a freshly loaded doc, we've finished recovering
        delete this.is_recovering_with_recovery_state;


        // Check for existing sketch file
        this.imported_from_sketch = false;
        if (this.docRef != null) { server.doesLastSketchJsonExist(this.docRef).then(isSketchImport => {
            this.imported_from_sketch = isSketchImport;
            return this.handleDocChanged({fast: true, subsetOfBlocksToRerender: [], dontUpdateSidebars: false});
        }); }

        // FIXME there should be an unregister on unload
        if (this.docRef != null) { server.kickMeWhenCommitsChange(this.docRef, () => {
            return this.handleDocChanged({fast: true, subsetOfBlocksToRerender: [], dontUpdateSidebars: false});
        }); }

        // setup the caches for normalize
        this.last_normalized_doc_json = json;
        this.oldOwningComponentForBlock = {};
        this.let_normalize_know_block_geometries_were_correctly_computed_by_someone_else();

        // let a render go through before doing very expensive normalize work
        window.setTimeout(() => {
            // Do a first normalize to warm up our normalize caches
            this.doc.enterReadonlyMode();
            // ensure we normalize all blocks
            // TECH DEBT: We are using mutated_blocks to do a cache of browser depenedent shits in the short term. This
            // should totally not be handled by editorCache but by a separate dedicated cache
            // @editorCache.render_params.mutated_blocks = _l.keyBy(@doc.blocks, 'uniqueKey')
            this.normalize();
            this.doc.leaveReadonlyMode();

            // Gabe is experimenting with a thing called hopscotch.  Don't turn this on for users yet.
            if (config.editorTour) { this.editorTour(); }

            // report that we've loaded successfully, if anyone's listening
            if (typeof window.didEditorCrashBeforeLoading === 'function') {
                window.didEditorCrashBeforeLoading(false);
            }

            // if Pagedraw crashes, the router will call this hook
            return window.get_recovery_state_after_crash = this.getCrashRecoveryState;
        });

        if (window.pd_params.figma_modal) { this.showUpdatingFromFigmaModal(); }

        // Send conversion event to google adwords
        return (typeof window.gtag === 'function' ? window.gtag('event', 'conversion', {'send_to': 'AW-821312927/yIXqCMPHn3sQn_vQhwM', 'value': 1.0, 'currency': 'USD'}) : undefined);
    },

    getCrashRecoveryState() {
        return {
            viewport: this.viewportManager.getViewport()
        };
    },


    configurePageForAppBehavior() {
        // prevent user backspace from hitting the back button
        require('../frontend/disable-backspace-backbutton');

        // prevent zooming page (outside of zoomable region)
        require('../frontend/disable-zooming-page');

        // prevent overscrolling
        $('body').css('overflow', 'hidden');

        // prevent selecting controls like they're text
        $('body').css('user-select', 'none');


        // _openEventListeners :: [(target, event, handler)].  A list of things to .removeEventListener on unmount.
        this._openEventListeners = [];

        // when you click a button, don't focus on that button.
        // In some world having that focus matters, but it always puts it in some
        // weird looking state.
        return this.listen(document, 'mousedown', function(evt) {
            if (evt.target.tagName.toUpperCase() === 'BUTTON') {
                return evt.preventDefault();
            }
        });
    },


    listen(target, event, handler) {
        target.addEventListener(event, handler);
        return this._openEventListeners.push([target, event, handler]);
    },


    componentWillUnmount() {
        // In our current implementation, we only unload the editor when we crash, and try to recover by
        // throwing out the current instance of the editor, and loading up a fresh one

        // unregister all listeners pointing at us
        for (let [target, event, handler] of Array.from(this._openEventListeners)) { target.removeEventListener(event, handler); }

        // Turn off the livecollab system
        return (typeof this._unsubscribe_from_doc === 'function' ? this._unsubscribe_from_doc() : undefined);
    },



    editorTour() {
        const tour = {
              id: "hello-hopscotch",
              steps: [
                {
                  title: "My Header",
                  content: "This is the header of my page.",
                  target: "header",
                  placement: "right"
                }
              ]
          };
        return hopscotch.startTour(tour);
    },

    // start chaos mode for bad people.  Variable names must be misleading.
    loadEditor2() {
        // crash at random every 4-30 seconds
        // note that after a crash we will recover, and in recovery set this timeout again
        return setTimeout((() => { throw new Error('Editor invariant violated; bailing'); }), (4 + (26*Math.random())) * 1000);
    },


    //# Keyboard shortcut system

    handleKeyUp(e) {
        windowMouseMachine.setCurrentModifierKeysPressed(e); // record modifier keys

        if (this.keyEventShouldBeHandledNatively(e)) { return; }

        // to be passed to handleDocChanged at the end. Set i.e. fast to true if the interaction didnt
        // change anything in the doc that needs to be saved
        let fast = false;
        let dontUpdateSidebars = false;
        let dont_recalculate_overlapping = false;
        let subsetOfBlocksToRerender = undefined;

        // Option key
        if ((e.keyCode === 18) && this.getEditorMode() instanceof IdleMode) {
            // Must do a dirty so user sees something changing when the key is lifted
            fast = true;
            dontUpdateSidebars = true;
            dont_recalculate_overlapping = true;
            subsetOfBlocksToRerender = _l.map(this.getSelectedBlocks(), 'uniqueKey');
        } else if (e.keyCode === 32) {
            this.setEditorStateToDefault();
            fast = true;
            dontUpdateSidebars = true;
            dont_recalculate_overlapping = true;
            subsetOfBlocksToRerender = [];
        } else {
            return;
        }

        this.handleDocChanged({fast, dontUpdateSidebars, dont_recalculate_overlapping, subsetOfBlocksToRerender});
        return e.preventDefault();
    },

    handleKeyDown(e) {
        let block, block_to_draw, keyedTowards;
        windowMouseMachine.setCurrentModifierKeysPressed(e); // record modifier keys

        if (this.keyEventShouldBeHandledNatively(e)) { return; }

        // don't handle cmd+c/cmd+x/cmd+v, so we get them as copy/cut/paste events

        // to be passed to handleDocChanged at the end. Set i.e. fast to true if the interaction didnt
        // change anything in the doc that needs to be saved
        let skip_rerender = false;
        let fast = false;
        let dontUpdateSidebars = false;
        let dont_recalculate_overlapping = false;
        let subsetOfBlocksToRerender = undefined;

        const keyDirections = {
            38: ({y: -1}), // down
            40: ({y: 1}),  // up
            37: ({x: -1}), // left
            39: ({x: 1})  // right
        };

        // Windows uses ctrlKey as meta
        const meta = e.metaKey || e.ctrlKey;

        console.log(`key pressed ${_l.compact([(e.shiftKey ? 'shift' : undefined), (meta ? 'meta' : undefined), (e.altKey ? 'alt' : undefined), e.key]).join('+')}`);

        //# Regular interactions

        // Backspace and Delete key
        if ([8, 46].includes(e.keyCode)) {
            this.doc.removeBlocks(this.getSelectedBlocks());

        // Meta + A
        // Select all blocks
        } else if ((e.keyCode === 65) && meta) {
            this.selectBlocks(this.doc.blocks);
            fast = true;
            dont_recalculate_overlapping = false;

        // Meta + Y or Meta + Shift + Z
        } else if (((e.keyCode === 89) && meta) || ((e.keyCode === 90) && e.shiftKey && meta)) {
            this.handleRedo();
            skip_rerender = true;
        // Meta + Z
        } else if ((e.keyCode === 90) && meta) {
            this.handleUndo();
            skip_rerender = true;

        // Meta + S
        } else if ((e.keyCode === 83) && meta) {
            // no-op: do nothing on save, since we auto-save
            // TODO add a toast saying "always auto-saved!"
            fast = true;

        // Meta + P
        } else if ((e.keyCode === 80) && meta) {
            fast = true;
            if (config.realExternalCode) {
                modal.show(closeHandler => [
                    React.createElement(LibraryAutoSuggest, {"focusOnMount": (true), "onChange": (() => modal.forceUpdate(() => {}))})
                ]);
            }

        // Meta + '+'
        } else if ((e.keyCode === 187) && meta) {
            this.viewportManager.handleZoomIn();
            fast = true;
            dontUpdateSidebars = true;
            dont_recalculate_overlapping = true;
            subsetOfBlocksToRerender = [];
        // Meta + '-'
        } else if ((e.keyCode === 189) && meta) {
            this.viewportManager.handleZoomOut();
            fast = true;
            dontUpdateSidebars = true;
            dont_recalculate_overlapping = true;
            subsetOfBlocksToRerender = [];
        // Meta + 0
        } else if ((e.keyCode === 48) && meta) {
            this.viewportManager.handleDefaultZoom();
            fast = true;
            dontUpdateSidebars = true;
            dont_recalculate_overlapping = true;
            subsetOfBlocksToRerender = [];

        // Alt + I
        } else if ((e.keyCode === 73) && e.altKey) {
            this.handleSelectParent();
            fast = true;
        // Alt + K
        } else if ((e.keyCode === 75) && e.altKey) {
            this.handleSelectChild();
            fast = true;
        // Alt + J
        } else if ((e.keyCode === 74) && e.altKey) {
            this.handleSelectSibling(-1);
            fast = true;
        // Alt + L
        } else if ((e.keyCode === 76) && e.altKey) {
            this.handleSelectSibling(+1);
            fast = true;

        // Arrow keys
        } else if ((keyedTowards = keyDirections[e.keyCode]) != null) {
            if (config.arrowKeysSelectNeighbors) {
                if (meta) {
                    let blocks = this.getSelectedBlocks();
                    if (e.shiftKey) { keyedTowards = _l.mapValues(keyedTowards, dist => dist * 10); }
                    if (!e.altKey) { blocks = _l.flatMap(blocks, b => b.andChildren()); }
                    for (block of Array.from(blocks)) { block.nudge(keyedTowards); }

                    // TODO: in Sketch, cmd+arrow grows/shrinks the block.  We can try to add it back later.
                    // block.expand(keyedTowards) for block in blocks

                // Arrow keys (+alt)
                } else {
                    programs.arrow_key_select(this, e.key, e.altKey);
                    fast = true;
                }

            // Legacy behavior, designed to match Sketch
            } else {
                if (e.shiftKey) { keyedTowards = _l.mapValues(keyedTowards, dist => dist * 10); }

                // Alt + arrow keys
                if (e.altKey) {
                    for (block of Array.from(_.flatten(this.getSelectedBlocks().map(block => block.andChildren())))) { block.nudge(keyedTowards); }

                // Meta + arrow keys
                } else if (meta) {
                    for (block of Array.from(this.getSelectedBlocks())) { block.expand(keyedTowards); }

                // plain arrow keys
                } else {
                    for (block of Array.from(this.getSelectedBlocks())) { block.nudge(keyedTowards); }
                }
            }


        // shift + meta + >
        } else if (e.shiftKey && meta && (e.keyCode === 190)) {
            this.getSelectedBlocks().forEach(block => {
                if (UserLevelBlockTypes.TextBlockType.describes(block) || UserLevelBlockTypes.TextInputBlockType.describes(block)) {
                    return block.fontSize.staticValue += 1;
                }
            });
        // shift + meta + <
        } else if (e.shiftKey && meta && (e.keyCode === 188)) {
            this.getSelectedBlocks().forEach(block => {
                if (UserLevelBlockTypes.TextBlockType.describes(block) || UserLevelBlockTypes.TextInputBlockType.describes(block)) {
                    return block.fontSize.staticValue -= 1;
                }
            });

        //# Mouse State changes
        // 'a', 'm', 't', 'l', 'r', 'o', etc.
        } else if (!meta && ((block_to_draw = block_type_for_key_command(e.key.toUpperCase())) != null)) {
            this.toggleMode(new DrawingMode(block_to_draw));
            fast = true;
            dont_recalculate_overlapping = true;
            subsetOfBlocksToRerender = [];

        // Esc
        } else if (e.keyCode === 27) {
            if (!this.getEditorMode().keepBlockSelectionOnEscKey()) { this.selectBlocks([]); }
            this.setEditorStateToDefault();
            fast = true;

        // 'd'
        } else if (e.keyCode === 68) {
            this.toggleMode(new DynamicizingMode());
            fast = true;

        // 'x'
        } else if ((e.keyCode === 88) && !meta && !e.shiftKey) {
            this.toggleMode(new ReplaceBlocksMode());
            fast = true;

        // 'p'
        } else if (e.keyCode === 80) {
            let found;
            if (found = _l.find(this.getSelectedBlocks(), b => b instanceof TextBlock)) {
                this.toggleMode(new PushdownTypingMode(found));
            } else {
                this.toggleMode(new VerticalPushdownMode());
            }
            fast = true;

        // 's'
        } else if (e.keyCode === 83) {
            const artboard = new ArtboardBlock({height: 1024, width: 1024, is_screenfull: true});
            this.doc.addBlock(_l.extend(artboard, this.doc.getUnoccupiedSpace(artboard, {top: 100, left: 100})));
            // TODO scroll / zoom to the added block
            // TODO put the new artboard on the same vertical line as the current artboard?
            dont_recalculate_overlapping = true;


        // 'option' on mac or 'alt' on windows
        } else if ((e.keyCode === 18) && this.getEditorMode() instanceof IdleMode) {
            // Must do a dirty so user sees something changing when the key is pressed
            fast = true;
            dontUpdateSidebars = true;
            dont_recalculate_overlapping = true;
            subsetOfBlocksToRerender = _l.map(this.getSelectedBlocks(), 'uniqueKey');

        // Space
        } else if (e.keyCode === 32) {
            dontUpdateSidebars = true;
            dont_recalculate_overlapping = true;
            subsetOfBlocksToRerender = [];
            fast = true;
            this.setEditorMode(new DraggingScreenMode());

        // shift + '/' OR shift + '?' (same key)
        } else if (e.shiftKey && (e.keyCode === 191)) {
            if (this.shortcutsModalCloseFn == null) { // unless the shortcuts modal is already open
                this.handleShortcuts(); // open the shortcuts modal

            } else {
                // the modal is already open; calling this function closes it
                this.shortcutsModalCloseFn();
            }

        } else if ((e.key === "Enter") 
            && ((block = _l.last(this.selectedBlocks)) != null) 
            && block instanceof TextBlock
        ) {
            this.setEditorMode(new TypingMode(block, {put_cursor_at_end: true}));
            fast = true;

        // bold/italic/underline
        } else if (meta && ['b', 'i', 'u'].includes(e.key)) {
            const tbs = this.getSelectedBlocks().filter(b => b instanceof TextBlock);
            if (_l.isEmpty(tbs)) { return; }

            const prop = ((o => o[e.key]))({
                b: 'isBold', i: 'isItalics', u: 'isUnderline'
            });

            // toggle on unless they're all already on.  If they're all on, toggle off.
            const toggle_target = !_l.every(_l.map(tbs, prop));
            for (let t of Array.from(tbs)) { t[prop] = toggle_target; }

        } else {
            return;
        }

        if (!skip_rerender) { this.handleDocChanged({fast, dontUpdateSidebars, dont_recalculate_overlapping, subsetOfBlocksToRerender}); }
        return e.preventDefault();
    },

    keyEventShouldBeHandledNatively(evt) {
        let d, needle;
        if (config.shadowDomTheEditor) {
            // I *believe* using _l.first(evt.composedPath()) should always work but since I'm introducing
            // shadowDom as an experimental feature I'd rather be sure I'm not changing any behavior
            d = _l.first(evt.composedPath()) || evt.srcElement || evt.target;
        } else {
            d = evt.srcElement || evt.target;
        }

        // ignore shortcuts on input elements
        if ((d.tagName.toUpperCase() === 'INPUT') &&
           (needle = d.type.toUpperCase(), [
               'TEXT', 'PASSWORD','FILE', 'SEARCH',
               'EMAIL', 'NUMBER', 'DATE', 'TEXTAREA'
           ].includes(needle)) &&
           !(d.readOnly || d.disabled)) { return true; }

        // ignore on select
        if (d.tagName.toUpperCase() === 'SELECT') { return true; }

        // ignore on textareas
        if (d.tagName.toUpperCase() === 'TEXTAREA') { return true; }

        // some, but not all commands in Quill should be handled explicitly
        // Before contentEditable because Quill nodes are contentEditable nodes
        const Quill = require('../frontend/quill-component');
        if (['b', 'i', 'u', 'Escape'].includes(evt.key) && Quill.dom_node_is_in_quill(d)) { return false; }

        // ignore in contenteditables
        if (d.isContentEditable) { return true; }

        // otherwise
        return false;
    },



    //# Undo/Redo System

    setInteractionInProgress(interactionInProgress) {
        this.interactionInProgress = interactionInProgress;
    },
        // FIXME: Undo/Redo was broken by config.onlyNormalizeAtTheEndOfInteractions
        // if @interactionInProgress == no
        //     @_saveHistory()

    initializeUndoRedoSystem(initial_doc_state) {
        // The Undo/Redo subsystem's idea of the current doc state
        this.undos_doc_state = initial_doc_state;

        // Stacks of deltas on top of each other, starting from undos_doc_state
        this.undoStack = new FixedSizeStack(config.undoRedoStackSize);
        this.redoStack = new FixedSizeStack(config.undoRedoStackSize);

        return this.saveHistoryDebounced = _l.debounce(this._saveHistory, 250);
    },

    saveHistory() {
        // do the serialize before the debounce so it's synchronous, because we expect to be called from
        // handleDocChanged where doc is in readonly mode and the serialize is cached
        const newState = this.doc.serialize();

        return this.saveHistoryDebounced(newState);
    },

    _saveHistory(newState) {
        // Make sure we never save something that is already at the top of history
        if (_l.isEqual(newState, this.undos_doc_state)) { return; }

        // Add reverse delta to history
        this.undoStack.push(model_differ.diff(newState, this.undos_doc_state));
        this.redoStack.clear();
        this.undos_doc_state = newState;

        if (config.logOnUndo) { return console.log(`Saving history. New undo stack length: ${this.undoStack.length()}`); }
    },

    handleUndo() {
        let old_doc_state;
        if (this.interactionInProgress) {
            console.log("can't cancel an interaction in progress");
            return;
        }

        if (this.undoStack.length() < 1) {
            console.log("Nothing to undo");
            return;
        }

        // Cancel all saveHistories currently in the queue to be safe
        this.saveHistoryDebounced.cancel();

        // Pop and apply a delta from undo stack
        [this.undos_doc_state, old_doc_state] = Array.from([model_differ.patch(this.undos_doc_state, this.undoStack.pop()), this.undos_doc_state]);

        // Push reverse delta onto redo stack
        this.redoStack.push(model_differ.diff(this.undos_doc_state, old_doc_state));

        // Update the editor to the undo system's belief about the current doc state.
        // We'd like to setDocJson() but don't want to saveHistory() because we'll waste time on
        // a Doc.serialize() and _l.isEqual(), which will always result in a no-op anyway.
        this.swapDoc(this.undos_doc_state);
        this.handleSave(this.undos_doc_state);

        if (config.logOnUndo) { return console.log(`Undid last edit. New undo stack length: ${this.undoStack.length()}`); }
    },

    handleRedo() {
        let old_doc_state;
        if (this.interactionInProgress) {
            console.log("can't cancel an interaction in progress");
            return;
        }

        if (this.redoStack.length() < 1) {
            console.log("Nothing to redo");
            return;
        }

        // Cancel all saveHistories currently in the queue to be safe
        this.saveHistoryDebounced.cancel();

        // Pop and apply a delta from redo stack
        [this.undos_doc_state, old_doc_state] = Array.from([model_differ.patch(this.undos_doc_state, this.redoStack.pop()), this.undos_doc_state]);

        // Push the reverse delta onto the undo stack
        this.undoStack.push(model_differ.diff(this.undos_doc_state, old_doc_state));

        // Update the editor to the undo system's belief about the current doc state.
        // We'd like to setDocJson() but don't want to saveHistory() because we'll waste time on
        // a Doc.serialize() and _l.isEqual(), which will always result in a no-op anyway.
        this.swapDoc(this.undos_doc_state);
        this.handleSave(this.undos_doc_state);

        if (config.logOnUndo) { return console.log(`Redid last edit. New undo stack length: ${this.undoStack.length()}`); }
    },

    //# Livecollab

    initializeServerSync() {
        this.syncNotifier = new EventEmitter();

        let doc_loaded = false;

        // server.watchPage returns a function which will cancel the watch
        return this._unsubscribe_from_doc = server.watchPage(this.docRef, (...args) => {
            let json;
            [this.cas_token, json] = Array.from(args[0]);
            if (this.props.readonly === true) { this.lastDocFromServer = json; }

            if (!doc_loaded) {
                // on first load, set up the livecollab system
                doc_loaded = true;

                // last_synced_json is what we locally *think* the state of the doc is on
                // the server, based on what the server last told us
                this.last_synced_json = json;

                // current_doc_state is what we the sync algorithm believe to be the state
                // of the doc locally.  It should be the same as @doc.serialize()
                this.current_doc_state = json;

                // clone the json before handing it off, so we know we have our own copy safe
                // from mutation.
                let json_to_hand_off = _l.cloneDeep(json);

                // Some legacy or buggily-created docs are 'null' on Firebase.  This is mostly
                // because an empty, as-of-yet-unwritten node in firebase is null by default.
                // We used to create docs by just picking a node in firebase, and assuming it
                // starts at null.  This should never be needed, but shouldn't hurt either.
                if (json_to_hand_off == null) { json_to_hand_off = new Doc().serialize(); }

                // let the rest of the editor know we're ready
                return this.finishLoadingEditor(json_to_hand_off);

            // then always do an @updateJsonFromServer
            } else {
                return this.updateJsonFromServer(json);
            }
        });
    },

    generateLogCorrelationId() { return String(Math.random()).slice(2); },

    handleSave(new_doc_json) {
        // we can skip serialization if we already have a json by passing it in as an argument
        if (new_doc_json == null) { new_doc_json = undefined; }
        if (new_doc_json == null) { new_doc_json = this.doc.serialize(); }

        if (this.props.onChange != null) { this.props.onChange(new_doc_json); }

        if ((this.docRef == null)) { return; }

        const log_id = this.generateLogCorrelationId();

        // If the user is bad, make sure the compileserver knows it too
        if (config.flashy) { this.doc.intentionallyMessWithUser = true; }

        // Store the metaserver_id redundantly in the doc
        this.doc.metaserver_id = String(this.docRef.page_id);

        if (!_l.isEqual(new_doc_json, this.current_doc_state)) {
            if (config.logOnSave) { console.log(`[${log_id}] saving`); }
            this.current_doc_state = new_doc_json;
            return this.sendJson(log_id);
        }
    },


    updateJsonFromServer(json) {
        const log_id = this.generateLogCorrelationId();

        if (config.logOnSave) { console.log(`[${log_id}] collaborator made an edit`); }
        if (config.logOnSave) { console.log(`[${log_id}]`, json); }
        if (config.logOnSave && _l.isEqual(json, this.last_synced_json)) { console.log(`[${log_id}] should no op`); }

        // We work in jsons... for now
        const local_doc    = Doc.deserialize(this.current_doc_state);
        const received_doc = Doc.deserialize(json);
        const base_doc     = Doc.deserialize(this.last_synced_json);

        // rebase local doc off of new doc
        const rebased_doc = Doc.rebase(local_doc, received_doc, base_doc);
        const rebased = rebased_doc.serialize();

        // save the state from the server
        this.last_synced_json = json;

        // update current to rebased
        if (!rebased_doc.isEqual(local_doc)) {
            if (config.logOnSave) { console.log(`[${log_id}] rebased`); }
            if (config.logOnSave) { console.log(`[${log_id}]`, rebased); }
            this.swapDoc(rebased);
            // FIXME: if there actually was a rebase, we *don't* want to respect the rebased
            // blocks' geometries.  Further, if we rebased, we should run a proper normalize().
            this.let_normalize_know_block_geometries_were_correctly_computed_by_someone_else();
            this.current_doc_state = rebased;
        }

        // send updated to server
        if (!rebased_doc.isEqual(received_doc)) {
            return this.sendJson(log_id);
        }
    },

    sendJson(log_id) {
        if (this.props.readonly) { return; }

        const json = this.current_doc_state;

        if (config.logOnSave) {
            console.log(`[${log_id}] sending json`);
            console.log(`[${log_id}]`, json);
        }

        return server.casPage(log_id, this.docRef, this.cas_token, json, cas_token => {
            //# Received ACK

            this.cas_token = cas_token;
            if (config.logOnSave) {
                console.log(`[${log_id}] wrote json`);
                console.log(`[${log_id}]`, json);
            }
            this.last_synced_json = json;

            if (_l.isEqual(json, this.current_doc_state)) {
                // we're up to date
                return this.syncNotifier.emit('wroteSuccessfully');

            } else {
                // More changes happened since the change we just got through.  Now we have a
                // chance to send them too with our new cas_token.
                return this.sendJson(`${log_id}!`);
            }
        });
    },


    // undo/redo, commit restores, sketch importing, and loading a new json go through setDocJson.
    // livecollab from another user doesn't.
    setDocJson(doc_json) {
        this.swapDoc(doc_json);
        this.let_normalize_know_block_geometries_were_correctly_computed_by_someone_else();
        // would like to @handleDocChanged() but don't want to double-@dirty().  Fix forward?
        // FIXME we should definitely be doing a normalize()
        this.handleSave();
        return this.saveHistory();
    },

    swapDoc(json) {
        let old_doc;
        [old_doc, this.doc] = Array.from([this.doc, Doc.deserialize(json)]);
        if (old_doc != null) {
            old_doc.forwardReferencesTo(this.doc);
        }
        this.clearEditorCaches();
        return this.handleDocChanged({fast: true});
    }, // skip normalize, save, and saveHistory

    // Pagedraw devtool.  This can be called from the Chrome Debugger with a line copy+pasted from
    // pagedraw.io/pages/:page_id/_docref to load a doc from prod into your dev environment
    loadForeignDocFromFullDocRef(b64_full_docref_json) {
        const full_docref = JSON.parse(atob(b64_full_docref_json));
        const foreign_server = server_for_config(full_docref);
        const docRef = foreign_server.getDocRefFromId(full_docref.page_id, full_docref.docserver_id);
        return foreign_server.getPage(docRef)
            .then(function(json) { return this.setDocJson(json); })
            .catch(function() { if (err) { return alert(err); } });
    },


    //# Copy/Paste system
    initializeCopyPasteSystem() {
        this.listen(document, 'copy', this.handleCopy);
        this.listen(document, 'cut', this.handleCut);
        return this.listen(document, 'paste', this.handlePaste);
    },


    handleCopy(e) {
        if (this.clipboardEventTargetShouldHandle(e)) { return; }
        return this.copySelectedBlocksToClipboard(e);
    },

    handleCut(e) {
        if (this.clipboardEventTargetShouldHandle(e)) { return; }
        return this.copySelectedBlocksToClipboard(e, blocks => {
            this.doc.removeBlocks(blocks);
            return this.handleDocChanged();
        });
    },


    // this should probably be bumped any time we do a schema change... ever
    PagedrawClipboardProtocolName: `pagedraw/blocks-v${Doc.SCHEMA_VERSION}`,

    PDClipboardData: Model.register('PDClipboardData', (PDClipboardData = (function() {
        PDClipboardData = class PDClipboardData extends Model {
            static initClass() {
                this.prototype.properties = {
                    blocks: [Block],
                    source_doc_id: String,
                    externalComponentSpecs: [ExternalComponentSpec]
                };
            }
        };
        PDClipboardData.initClass();
        return PDClipboardData;
    })())),

    // not tied to docRef, in case we don't have a docRef.  It may even make the most sense
    // to have this be randomly generated per-Editor instance
    getUniqueDocIdentifier() { return window.location.origin + window.location.pathname; },

    copySelectedBlocksToClipboard(e, callbackOnCopiedBlocks) {
        if (callbackOnCopiedBlocks == null) { callbackOnCopiedBlocks = function() {}; }
        const blocks = _.uniq(_.flatten(this.getSelectedBlocks().map(b => b.andChildren())));

        // don't do anything if there aren't any blocks selected
        if (_l.isEmpty(blocks)) { return; }

        const clipboard_contents = new PDClipboardData({
            blocks,
            externalComponentSpecs: (() => {
                const refed_external_components = _l.uniq(_l.map(_l.flatMap(blocks, 'externalComponentInstances'), 'srcRef'));
                return this.doc.externalComponentSpecs.filter(ecs => Array.from(refed_external_components).includes(ecs.ref));
            })(),
            source_doc_id: this.getUniqueDocIdentifier()
        });

        const serialized_contents = JSON.stringify(clipboard_contents.serialize());
        e.clipboardData.setData(this.PagedrawClipboardProtocolName, serialized_contents);

        e.preventDefault();
        return callbackOnCopiedBlocks(blocks);
    },

    pastePagedraw(clipboardItem) {
        return clipboardItem.getAsString(json => {
            let block, blocks, externalComponentSpecs, offset_left, offset_top, source_doc_id, sourceArtboard;
            try {
                ({blocks, source_doc_id, externalComponentSpecs} = PDClipboardData.deserialize(JSON.parse(json)));
            } catch (error) {
                // if we can't parse the clipboard data, just ignore the paste event
                return;
            }

            for (let spec of Array.from(externalComponentSpecs)) {
                if (_l.find(this.doc.externalComponentSpecs, {ref: spec.ref})) { continue; }
                this.doc.externalComponentSpecs.push(spec);
            }

            // clone the blocks for fresh uniqueKeys
            blocks = blocks.map(block => block.clone());
            for (block of Array.from(blocks)) {
                if (block.componentSpec != null) {
                    block.componentSpec.regenerateKey();
                }
            }

            const bounding_box = Block.unionBlock(blocks);

            const offsetToViewportCenter = box => {
                const viewport = this.viewportManager.getViewport();

                const xPosition = Math.round((viewport.left + (viewport.width / 2)) - (box.width / 2));
                const yPosition = Math.round((viewport.top + (viewport.height / 2)) - (box.height / 2));
                const [offset_left, offset_top] = Array.from([xPosition - box.left,
                                             yPosition - box.top]
                                             .map(Math.round)); // round so we end up on integer top/left values
                return [offset_left, offset_top];
            };


            // if the block is coming from the same doc, we just paste it on its original
            // location, else we paste it in the middle of the screen
            const activeArtboard = this.getActiveArtboard();
            if (source_doc_id !== this.getUniqueDocIdentifier()) {
                [offset_left, offset_top] = Array.from(offsetToViewportCenter(bounding_box));
            } else if ((activeArtboard != null) && (bounding_box != null) && (sourceArtboard = _l.find(this.doc.artboards, a => a.contains(bounding_box)))) {
                // FIXME: To be like sketch we'd have to see which edge of the source artboard this is closer to. The current
                // implementation allows for something to be pasted offseted from an artboard but outside of it, which is wrong
                [offset_left, offset_top] = Array.from([activeArtboard.left - sourceArtboard.left,
                                             activeArtboard.top - sourceArtboard.top]);
            } else {
                [offset_left, offset_top] = Array.from([0, 0]);
            }

            // Check if the final destination box is inside the viewport
            const final_destination = new Block({top: bounding_box.top + offset_top, left: bounding_box.left + offset_left, 
                                            width: bounding_box.width, height: bounding_box.height});
            if (!final_destination.overlaps(new Block(this.viewportManager.getViewport()))) {
                // if not, we default to viewportCenter for pasting
                console.log('keep inside');
                [offset_left, offset_top] = Array.from(offsetToViewportCenter(bounding_box));
            }

            for (block of Array.from(blocks)) {
                block.left += offset_left;
                block.top += offset_top;
            }

            // Put blocks back inside canvas bounds if they are outside
            const [minX, minY] = Array.from(['left', 'top'].map(prop => _l.minBy(blocks, b => b[prop])[prop]));
            if (minX < 0) { for (block of Array.from(blocks)) { block.left -= minX; } }
            if (minY < 0) { for (block of Array.from(blocks)) { block.top -= minY; } }

            // add and select the new blocks
            for (block of Array.from(blocks)) { this.doc.addBlock(block); }
            this.selectedBlocks = blocks;
            return this.handleDocChanged();
        });
    },

    pasteSvg(plain_text, parsed_svg) {
        const viewport = this.viewportManager.getViewport();

        const {width, height} = util.getDimensionsFromParsedSvg(parsed_svg);

        const xPosition = Math.round(viewport.left + ((viewport.width / 2) - (width / 2)));
        const yPosition = Math.round(viewport.top + ((viewport.height / 2) - (height / 2)));

        const image_block = new ImageBlock({top: yPosition, left: xPosition, width, height, aspectRatioLocked: true});

        // FIXME: For now we just store image urls as b64 data. Move this to a world
        // where the compiler actually requires the images so webpack is responsible for the publishing method
        image_block.image.staticValue = `data:image/svg+xml;utf8,${plain_text}`;
        this.doc.addBlock(image_block);

        this.selectBlocks([image_block]);

        return this.handleDocChanged();
    },

    pastePng(clipboardItem) {
        const blob = clipboardItem.getAsFile();
        if (blob == null) { return track_warning('PNG image could not be extracted as a file', {clipboardItem}); }

        const viewport = this.viewportManager.getViewport();

        return util.getPngUriFromBlob(blob, png_uri => {
            // First add a placeholder block of the correct size
            const {width, height} = util.getPngDimensionsFromDataUri(png_uri);

            const xPosition = Math.round(viewport.left + ((viewport.width / 2) - (width / 2)));
            const yPosition = Math.round(viewport.top + ((viewport.height / 2) - (height / 2)));

            const image_block = new ImageBlock({top: yPosition, left: xPosition, width, height, aspectRatioLocked: true});

            // FIXME: For now we just store image urls as b64 data. Move this to a world
            // where the compiler actually requires the images so webpack is responsible for the publishing method
            image_block.image.staticValue = png_uri;
            this.doc.addBlock(image_block);

            this.selectBlocks([image_block]);

            return this.handleDocChanged();
        });
    },

    pastePlainText(clipboardItem) {
        return clipboardItem.getAsString(plain => {
            // FIXME 1: Just like in pastePng, we don't know where to place this so we always place
            // it in top: 100, left: 100
            // FIXME 2: This block needs to be auto height and width. We need to add this functionality in general to
            // Text Block. Just like in Sketch. When that's ready, this line should be updated to get rid of the hard coded defaults
            const block = this.doc.addBlock(new TextBlock({htmlContent: Dynamicable(String).from(plain), top: 100, left: 100, width: 100, height: 17}));
            this.selectBlocks([block]);
            return this.handleDocChanged();
        });
    },

    handlePaste(e) {
        if (this.clipboardEventTargetShouldHandle(e)) { return; }

        for (let item of Array.from(e.clipboardData.items)) {
            if (item.type === this.PagedrawClipboardProtocolName) {
                this.pastePagedraw(item);
            } else if (item.type === 'image/png') {
                this.pastePng(item);
            } else if (item.type === 'text/plain') {
                // Need to get as string before deciding what the type is since i.e. JPEGs are also considered plain text
                item.getAsString(plain => {
                    let parsed_svg;
                    if ((parsed_svg = util.parseSvg(plain)) != null) {
                        return this.pasteSvg(plain, parsed_svg);
                    } else {
                        return console.warn(`Trying to paste unrecognized plain text: ${plain}`);
                    }
                });
            } else {
                console.warn(`Trying to paste unrecognized type: ${item.type}`);
            }
        }

        // cancel the paste event from bubbling
        return e.preventDefault();
    },


    clipboardEventTargetShouldHandle(evt) {
        if (this.keyEventShouldBeHandledNatively(evt)) { return true; }

        // do default copy action if anything is actually 'selected' in the browser's opinion
        // an example of this is text selected in an export modal
        if (window.getSelection().isCollapsed === false) { return true; }

        // otherwise
        return false;
    },

    selectAndMoveToBlocks(blocks) {
        assert(() => blocks.length > 0);
        this.viewportManager.centerOn(blocks.length === 1 ? blocks[0] : Block.unionBlock(blocks));
        this.selectBlocks(blocks);
        return this.handleDocChanged({fast: true});
    },


    cache_error_and_warning_messages() {
        // NOTE: must be called after normalize above because they depend on the doc being correct
        let ref;
        return [this.errors, this.warnings] = Array.from(ref = this.error_and_warning_messages_for_doc()), ref;
    },

    error_and_warning_messages_for_doc() {
        const error_messages = [];
        const error = (content, handleClick) => error_messages.push({content, handleClick});
        const warning_messages = [];
        const warning = (content, handleClick) => warning_messages.push({content, handleClick});

        const {
            doc
        } = this;
        doc.inReadonlyMode(() => {

            const components = doc.getComponents();

            _l.toPairs(_l.groupBy(components, filePathOfComponent)).forEach((...args) => {
                const [path, colliding] = Array.from(args[0]);
                if (colliding.length >= 2) {
                    return error(`More than one component w/ file path ${path}`, () => {
                        return this.selectAndMoveToBlocks(colliding);
                    });
                }
            });

            var artboardsInsideArtboards = function({block, children}, inArtboard) {
                if (inArtboard == null) { inArtboard = false; }
                const childrenResults = _l.flatten(children.map(child => artboardsInsideArtboards(child, (block instanceof ArtboardBlock || inArtboard))));
                if (inArtboard && block instanceof ArtboardBlock) { return [block].concat(childrenResults); } else { return childrenResults; }
            };
            artboardsInsideArtboards(doc.getBlockTree()).forEach(artboard => {
                return error(`Artboard ${artboard.getLabel()} inside other artboard`, () => {
                    return this.selectAndMoveToBlocks([artboard]);
                });
            });

            var nonPagesInScreenSizeBlocks = function({block, children}, inSSB) {
                if (inSSB == null) { inSSB = false; }
                const childrenResults = _l.flatten(children.map(child => nonPagesInScreenSizeBlocks(child, (block instanceof ScreenSizeBlock || inSSB))));
                if (inSSB && block instanceof ArtboardBlock && !block.is_screenfull) { return [block].concat(childrenResults); } else { return childrenResults; }
            };
            nonPagesInScreenSizeBlocks(doc.getBlockTree()).forEach(artboard => {
                return error(`Artboard ${artboard.getLabel()} inside Screen Size Group, but is not page`, () => {
                    this.setSidebarMode('draw');
                    return this.selectAndMoveToBlocks([artboard]);
                });
            });

            components.forEach(c => {
                return errorsOfComponent(c).forEach(({message}) => {
                    return error(`${c.getLabel()} - ${message}`, () => {
                        this.setSidebarMode('code');
                        return this.selectAndMoveToBlocks([c]);
                    });
                });
            });

            doc.blocks.filter(b => b instanceof InstanceBlock && (b.getSourceComponent() == null)).forEach(instance => {
                return error(`Instance block ${instance.getLabel()} without a source`, () => {
                    return this.selectAndMoveToBlocks([instance]);
                });
            });

            const blocksByLocalUserFonts = _l.groupBy((doc.blocks.filter(b => b.fontFamily instanceof LocalUserFont)), 'fontFamily.name');
            _l.toPairs(blocksByLocalUserFonts).forEach((...args) => {
                const [blocks, fontName] = Array.from(args[0]);
                return error(`Font ${fontName} hasn't been uploaded`, () => {
                    this.setSidebarMode('draw');
                    return this.selectAndMoveToBlocks(blocks);
                });
            });

            doc.libraries.filter(l => !l.didLoad(window)).forEach(l => error(`Library ${l.name()} did not load. Click to retry.`, () => window.location = window.location));

            const is_componentable = block => (block instanceof MultistateBlock || block instanceof ArtboardBlock || block instanceof ScreenSizeBlock) && (block.getRootComponent() != null);

            var flexInsideNonFlexWidth = ({block, children}) => {
                const childrenResults = _l.flatten(children.map(flexInsideNonFlexWidth));
                const isFlex = is_componentable(block) ? block.getRootComponent().componentSpec.flexWidth : (block != null ? block.flexWidth : undefined);
                if ((isFlex === false) && _l.some(children, c => (c.block != null ? c.block.flexWidth : undefined) || (c.block != null ? c.block.flexMarginLeft : undefined) || (c.block != null ? c.block.flexMarginRight : undefined))) {
                return [block].concat(childrenResults); } else { return childrenResults; }
            };
            flexInsideNonFlexWidth(this.doc.getBlockTree()).forEach(parent => {
                const text = is_componentable(parent) ? 'resizable width' : 'flex width';
                return warning(`Parent block ${parent.getLabel()} is not ${text} but it has horizontally flexible children`, () => {
                    this.setSidebarMode('draw');
                    return this.selectAndMoveToBlocks([parent]);
                });
            });

            var flexInsideNonFlexHeight = ({block, children}) => {
                const childrenResults = _l.flatten(children.map(flexInsideNonFlexHeight));
                const isFlex = is_componentable(block) ? block.getRootComponent().componentSpec.flexHeight : (block != null ? block.flexHeight : undefined);
                if ((isFlex === false) && _l.some(children, c => (c.block != null ? c.block.flexHeight : undefined) || (c.block != null ? c.block.flexMarginTop : undefined) || (c.block != null ? c.block.flexMarginBottom : undefined))) {
                return [block].concat(childrenResults); } else { return childrenResults; }
            };
            return flexInsideNonFlexHeight(this.doc.getBlockTree()).forEach(parent => {
                const text = is_componentable(parent) ? 'resizable height' : 'flex height';
                return warning(`Parent block ${parent.getLabel()} is not ${text} but it has vertically flexible children`, () => {
                    this.setSidebarMode('draw');
                    return this.selectAndMoveToBlocks([parent]);
                });
            });
        });


        return [error_messages, warning_messages];
    }}));


export default defaultExport;


function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}