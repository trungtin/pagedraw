/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LibraryPreviewSidebar;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import propTypes from 'prop-types';
import createReactClass from 'create-react-class';
import config from '../config';
import { ComponentBlockType } from '../user-level-block-type';
import { InstanceBlock } from '../blocks/instance-block';
import { IdleMode, DrawingMode } from '../interactions/layout-editor';
import { layoutViewForBlock } from './layout-view';
const defaultExport = {};

defaultExport.LibraryPreviewSidebar = (LibraryPreviewSidebar = createReactClass({
    contextTypes: {
        getInstanceEditorCompileOptions: propTypes.func,
        editorCache: propTypes.object
    },

    render() {
        const instance_compile_opts = this.context.getInstanceEditorCompileOptions();
        const editor_compile_opts = {
            templateLang: instance_compile_opts.templateLang,
            for_editor: true,
            for_component_instance_editor: false,
            getCompiledComponentByUniqueKey: instance_compile_opts.getCompiledComponentByUniqueKey
        };

        return React.createElement("div", {"className": "sidebar", "style": ({display: 'flex', flexDirection: 'column', overflowY: 'scroll', backgroundColor: "#FCFCFC"})},
            (__guard__(this.props.doc.getComponents(), x => x.map(component => {
                const PREVIEW_WIDTH = 80;
                const PREVIEW_HEIGHT = 80;
                const scale_factor = PREVIEW_WIDTH / Math.max(component.width, component.height);

                const instance = _l.extend(new InstanceBlock({sourceRef: component.componentSpec.componentRef}), {doc: this.props.doc});
                const newMode = new DrawingMode(new ComponentBlockType(component));
                return React.createElement("div", {"className": ('preview-item'), "key": (component.uniqueKey),  
                     "onMouseDown": (() => { this.props.setEditorMode(newMode); return this.props.onChange({fast: true}); }),  
                     "style": ({width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT, margin: 5, backgroundColor: "#EFEFEF", outline: (this.props.editorMode.isAlreadySimilarTo(newMode) ? 'solid purple' : undefined)})},
                     React.createElement("div", {"style": ({width: component.width, height: component.height, cursor: 'grab', pointerEvents: 'none', transform: `scale(${scale_factor}, ${scale_factor})`, transformOrigin: "top left"})},
                          (layoutViewForBlock(instance, instance_compile_opts, editor_compile_opts, this.context.editorCache))
                     )
                );
            })))
        );
    }
}));

export default defaultExport;

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}