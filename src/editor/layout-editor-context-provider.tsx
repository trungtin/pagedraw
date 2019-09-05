// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LayoutEditorContextProvider;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { memoize_on } from '../util';
import { compileComponentForInstanceEditor } from '../core';
const defaultExport = {};

defaultExport.LayoutEditorContextProvider = (LayoutEditorContextProvider = createReactClass({
    displayName: 'LayoutEditorContextProvider',

    childContextTypes: {
        getInstanceEditorCompileOptions: propTypes.func,
        editorCache: propTypes.object
    },

    // Propagates the following to the entire subtree of EditPage, so everyone
    // can access it
    getChildContext() {
        return {
            editorCache: this.editorCache,
            getInstanceEditorCompileOptions: this.getInstanceEditorCompileOptions
        };
    },

    componentWillMount() {
        return this.editorCache = {
            imageBlockPngCache: {},                          //  {uniqueKey: String}
            compiledComponentCache: {},                      //  {uniqueKey: Pdom}
            instanceContentEditorCache: {},                  //  {uniqueKey: React element}
            getPropsAsJsonDynamicableCache: {},              //  {uniqueKey: JsonDynamicable }
            blockComputedGeometryCache: {},                  //  {uniqueKey: {serialized: Json, height: Int, width: Int}}
            lastOverlappingStateByKey: {},                   //  {uniqueKey: Boolean }
            render_params: {}
        };
    },

    getInstanceEditorCompileOptions() { return {
        templateLang: this.props.doc.export_lang,
        for_editor: true,
        for_component_instance_editor: true,
        getCompiledComponentByUniqueKey: this.getCompiledComponentByUniqueKey
    }; },

    getCompiledComponentByUniqueKey(uniqueKey) {
        return memoize_on(this.editorCache.compiledComponentCache, uniqueKey, () => {
            const componentBlockTree = this.props.doc.getBlockTreeByUniqueKey(uniqueKey);
            if ((componentBlockTree == null)) { return undefined; }
            return compileComponentForInstanceEditor(componentBlockTree, this.getInstanceEditorCompileOptions());
        });
    },

    render() { return this.props.children; }
}));
export default defaultExport;
