// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import $ from 'jquery';
import { Library } from '../libraries';
import Autosuggest from 'react-autosuggest';

const suggestionOfLib = function(lib) {};

const defaultExport = {};

defaultExport.LibraryAutoSuggest = createReactClass({
    componentWillMount() {
        this.value = '';
        this.libraries = [];
        this.defaultSuggestions = [];

        return $.getJSON(`/apps/${window.pd_params.app_id}/all_libraries`, data => {
            this.libraries = (this.defaultSuggestions = data.map(lib => _l.extend({}, lib, {lib_name: lib.name})));
            this.props.onChange();
            return this.input_node.focus();
        });
    },

    componentDidMount() {
        if (this.props.focusOnMount) { return this.input_node.focus(); }

        /* Michael left this here
        fetch('https://s3-us-west-1.amazonaws.com/alllibraries/library_cache.json+').then (response) =>
            response.json()
        .then (data) =>
            @libraries = data
            @props.onChange()
        */
    },

    renderSuggestion(suggestion) {
        if (suggestion.isVersion) {
            return React.createElement("span", null, (`${suggestion.lib_name} v${suggestion.name}`));
        } else {
            return React.createElement("span", null, (`${suggestion.name}@${suggestion.latest_version.name}`));
        }
    },

    renderInputComponent(inputProps) { return React.createElement("input", Object.assign({},  inputProps, {"style": ({color: this.props.textColor != null ? this.props.textColor : 'black'}), "ref": (node => {
        return this.input_node = node;
    })})); },

    render() {
        return React.createElement(Autosuggest, {"suggestions": (this.suggestions != null ? this.suggestions : this.defaultSuggestions), "alwaysRenderSuggestions": true,  
                            "onSuggestionsFetchRequested": (({value}) => {
                                const matchingLibs = this.libraries.filter(option => {
                                    const len = value.includes('@') ? value.split('@')[0].length : value.length;
                                    return value === option.name.slice(0, len);
                                });
                                if (value.includes('@')) {
                                //    Promise.all(matchingLibs.map (lib) =>
                                //         fetch("/libraries/#{lib.id}/versions").then (res) =>
                                //             [res.json(), lib]
                                //     ).then (versionsOfLibs) =>
                                //         @libraries = _l.flatten(versionsOfLibs.map ([versions, lib]) =>
                                //             versions.map (version) => _l.extend {}, version, {lib_name: lib.name}
                                //             )
                                } else {
                                    this.suggestions = matchingLibs;
                                }
                                return this.props.onChange();
                            }
                            ),  
                            "onSuggestionsClearRequested": (() => {
                                this.suggestions = undefined;
                                return this.props.onChange();
                            }
                            ),  
                            "getSuggestionValue": (suggestion => {
                                if (suggestion.lib_name) {
                                    return `${suggestion.lib_name} v${suggestion.name}`;
                                } else {
                                    return suggestion.name;
                                }
                            }
                            ),  
                            "renderInputComponent": (this.renderInputComponent),  
                            "renderSuggestion": (this.renderSuggestion),  
                            "inputProps": ({value: this.value, onChange: (evt, {newValue}) => {
                                this.value = newValue;
                                return this.props.onChange();
                            }
                            }),  
                            "focusInputOnSuggestionClick": (false),  
                            "onSuggestionSelected": ((evt, {suggestion}) => {
                                if ((suggestion.id != null) && (suggestion.name != null) && (suggestion.latest_version.name != null) && (suggestion.latest_version.bundle_hash != null) && (suggestion.latest_version.id != null)) {
                                    return this.props.onAddLibrary(new Library({
                                        library_id: String(suggestion.id), library_name: suggestion.name, version_name: suggestion.latest_version.name,
                                        version_id: String(suggestion.latest_version.id), npm_path: suggestion.latest_version.npm_path,
                                        local_path: suggestion.latest_version.local_path, is_node_module: suggestion.latest_version.is_node_module,
                                        bundle_hash: suggestion.latest_version.bundle_hash, inDevMode: false
                                    }));
                                } else {
                                    throw new Error('Bad library from server');
                                }
                            }

                            )});
    }
});
export default defaultExport;
