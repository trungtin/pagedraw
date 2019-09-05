// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let valid_compiler_options;
import _l from 'lodash';
import { assert, zip_dicts } from './util';

// The existence of this file is an homage to the need for static typing

// Compiler options hashes are used for both compileDoc and for Block.renderHTML().  This
// unfortunately leads to leaking implementation details of compileDoc to other callers
// to Block.renderHTML, for example instances and previews.

const CompilerOptionsMemberTypes = {
    templateLang:                       _l.isString,                               //  Overrides doc.export_lang.  Should be have no effect when when for_editor and for_component_instance_editor
    for_editor:                         _l.isBoolean,                              //  Always false for compileDoc, always true everywhere else
    for_component_instance_editor:      _l.isBoolean,                              //  True when compiling a component to render an instance block in the editor.

    // might actually be removable; getCompiledComponentByUniqueKey was necessary for a previous architecture
    getCompiledComponentByUniqueKey:    _l.isFunction,                             //  (String -> pdom). Get the compiled body of a component referenced by uniqueKey

    // per doc
    metaserver_id(o) { return _l.isString(o) || ((o != null) === false); },      //  The doc's metaserver id
    optimizations(o) { return _l.isBoolean(o) || ((o != null) === false); },     //  True if we want to optimize the code we're generating
    chaos(o) { return _l.isBoolean(o) || ((o != null) === false); },     //  Wartime?

    // per doc export options.  Should probably only be in compileDoc
    separate_css(o) { return _l.isBoolean(o) || ((o != null) === false); },     //  Whether to combine the HTML and CSS into the same file
    inline_css(o) { return _l.isBoolean(o) || ((o != null) === false); },     //  Whether to combine the HTML and CSS into the same file
    styled_components(o) { return _l.isBoolean(o) || ((o != null) === false); },     //  Whether to format code for the styled components library (styled-components.com)
    import_fonts(o) { return _l.isBoolean(o) || ((o != null) === false); },     //  Whether to include import statements in generated code

    // per component.  Should probably be local variables in compileDoc
    code_prefix(o) { return _l.isString(o) || ((o != null) === false); },      //  Generated code frontmatter to prepend
    css_classname_prefix(o) { return _l.isString(o) || ((o != null) === false); },      //  Prepended to all ids
    cssPath(o) { return _l.isString(o) || ((o != null) === false); },      //  The location of the CSS file we're generating, if there is one
    filePath(o) { return _l.isString(o) || ((o != null) === false); }      //  The location of the file we're generating
};

const defaultExport = {};

defaultExport.valid_compiler_options = (valid_compiler_options = function(options) {
    // warn if getCompiledComponentByUniqueKey is not present.  It's always supposed to be present, but it's easy to
    // forget to include it, and many docs will work just fine without it there.  Forgetting it is a nasty bug.
    assert(() => (options.getCompiledComponentByUniqueKey != null) === true);

    const object = zip_dicts([options, CompilerOptionsMemberTypes]);
    for (let member in object) {
        var [value, typecheck] = object[member];
        assert(() => typecheck(value));
    }

    return true;
});

defaultExport.assert_valid_compiler_options = options => assert(() => valid_compiler_options(options));
export default defaultExport;
