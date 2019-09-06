// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import config from '../config';
import { PdVlDropdownTwo } from './component-lib';
const defaultExport = {};

if (config.debugExportOption) {
    defaultExport = props => <PdVlDropdownTwo
        valueLink={props.valueLink}
        options={[
            {value: 'debug', label: 'debug'},
            {value: "html", label: 'HTML'},
            {value: "PHP", label: 'PHP'},
            {value: "ERB", label: 'Ruby on Rails'},
            {value: "Angular2", label: 'Angular'},
            {value: "JSX", label: 'React (JSX)'},
            {value: "React", label: 'React (Javascript)'},
            {value: "CJSX", label: 'CJSX'},
            {value: "TSX", label: 'TSX'},
            {value: "Handlebars", label: 'Handlebars'},
            {value: "Jade", label: 'Jade'},
            {value: "Jinja2", label: 'Flask (Jinja2)'},
            {value: "html-email", label: 'HTML Email'}]} />;

} else if (config.angular_support) {
    defaultExport = props => <PdVlDropdownTwo
        tag="select"
        valueLink={props.valueLink}
        options={[
            {value: "JSX", label: 'React (JSX)'},
            {value: "CJSX", label: 'CJSX'},
            {value: "TSX", label: 'TSX'},
            {value: "Angular2", label: 'Angular'}]} />;

} else {
    defaultExport = props => <PdVlDropdownTwo
        valueLink={props.valueLink}
        options={[
            {value: "JSX", label: 'React (JSX)'},
            {value: "CJSX", label: 'CJSX'},
            {value: "TSX", label: 'TSX'}]} />;
}

export default defaultExport;

