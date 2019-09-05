/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import config from '../config';

// prevent user backspace from hitting the back button
// http://stackoverflow.com/a/2768256

document.addEventListener('keydown', function(evt) {
    if (evt.keyCode === 8) {  // backspace

        let d, needle;
        if (config.shadowDomTheEditor) {
            // I *believe* using _l.first(evt.composedPath()) should always work but since I'm introducing
            // shadowDom as an experimental feature I'd rather be sure I'm not changing any behavior
            d = _l.first(evt.composedPath()) || evt.srcElement || evt.target;
        } else {
            d = evt.srcElement || evt.target;
        }

        // ignore backspaces on input elements
        if ((d.tagName.toUpperCase() === 'INPUT') &&
           (needle = d.type.toUpperCase(), [
               'TEXT', 'PASSWORD','FILE', 'SEARCH',
               'EMAIL', 'NUMBER', 'DATE', 'TEXTAREA'
           ].includes(needle)) &&
           !(d.readOnly || d.disabled)) { return; }

        // ignore on textareas
        if (d.tagName.toUpperCase() === 'TEXTAREA') { return; }

        // ignore backspaces on contenteditables
        if (d.isContentEditable) { return; }

        evt.preventDefault();
        return evt.stopPropagation();
    }
});
