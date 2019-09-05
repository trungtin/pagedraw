// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let codeTextStyle, customCodeField, filePathTextStyle, GeneratedCodePrefixField, JsKeyword;
import React from 'react';
import FormControl from '../frontend/form-control';
import _l from 'lodash';
const defaultExport = {};


defaultExport.codeTextStyle = (codeTextStyle = {
    fontFamily: 'Menlo, Monaco, Consolas, "Droid Sans Mono", "Courier New", monospace',
    fontSize: 13,
    color: '#114473'
});

defaultExport.JsKeyword = (JsKeyword = ({children}) => React.createElement("span", {"style": ({color: '#bd00bd'})},
    (children)
));


defaultExport.filePathTextStyle = (filePathTextStyle = {
    fontFamily: 'Menlo, Monaco, Consolas, "Droid Sans Mono", "Courier New", monospace',
    fontSize: 13,
    color: '#525252'
});


defaultExport.GeneratedCodePrefixField = (GeneratedCodePrefixField = ({valueLink}) => React.createElement(FormControl, {"debounced": (true), "tag": "textarea", "valueLink": (valueLink),  
    "placeholder": ('// imports to go at beginning of file'),  
    "style": ({
        fontFamily: 'Menlo, Monaco, Consolas, "Droid Sans Mono", "Courier New", monospace',
        fontSize: 13,
        color: '#441173',

        width: '100%', height: '3em',
        WebkitAppearance: 'textfield'
    })}));


defaultExport.customCodeField = (customCodeField = (valueLink, placeholder) => React.createElement(FormControl, {"debounced": (true), "tag": "textarea", "valueLink": (valueLink),  
    "placeholder": (placeholder),  
    "style": ({
        fontFamily: 'Menlo, Monaco, Consolas, "Droid Sans Mono", "Courier New", monospace',
        fontSize: 13,
        color: '#441173',

        width: '100%', height: '20em',
        WebkitAppearance: 'textfield'
    })}));

const max_length_text_with_elipsis = function(str, max_length) { if (str.length <= max_length) { return str; } else { return `${str.slice(0, max_length-3)}...`; } };

defaultExport.codeSidebarEntryHeader = (block_name, label, hint) => React.createElement("div", {"style": ({
    margin: '0 0 3px 0',
    fontSize: '10px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica', sans-serif",
    whiteSpace: 'nowrap'
})},
    React.createElement("span", {"style": ({fontWeight: 600})}, (label), " "), `\
of \
`, React.createElement("span", {"style": ({fontWeight: 600})}, (block_name))
);
export default defaultExport;
