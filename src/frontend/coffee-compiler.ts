/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';

// Paired down version of the coffeescript compiler entrypoint from  coffee-script/coffee-script.coffee.
// Webpack gets really angry if you try to just require() it directly.  Browserify doesn't.
// CoffeeScript was built for browserify.  Webpack picks up a bunch more require stuff that
// Browserify silently drops.  So, point Webpack?  But it makes our lives worse here. This is a
// stupid / gross hack.  I barely understand this code, and I've worked in the Coffee compiler
// before.  Ugh.  JRP 7/19/2017

import { parser } from 'coffeescript/lib/coffee-script/parser';

import { Lexer } from 'coffeescript/lib/coffee-script/lexer';
import helpers from 'coffeescript/lib/coffee-script/helpers';
import config from '../config';
import { memoize_on } from '../util';

const lexer = new Lexer();
parser.lexer = {
  lex() {
    let tag;
    const token = parser.tokens[this.pos++];
    if (token) {
      [tag, this.yytext, this.yylloc] = Array.from(token);
      parser.errorToken = token.origin || token;
      this.yylineno = this.yylloc.first_line;
    } else {
      tag = '';
  }

    return tag;
},
  setInput(tokens) {
    parser.tokens = tokens;
    return this.pos = 0;
},
  upcomingInput() {
    return "";
}
};

parser.yy = require('coffeescript/lib/coffee-script/nodes');

parser.yy.parseError = function(message, {token}) {
    const {errorToken, tokens} = parser;
    let [errorTag, errorText, errorLoc] = Array.from(errorToken);
    errorText = (() => { switch (false) {
        case errorToken !== tokens[tokens.length - 1]:
            return 'end of input';
        case !['INDENT', 'OUTDENT'].includes(errorTag):
            return 'indentation';
        case !['IDENTIFIER', 'NUMBER', 'INFINITY', 'STRING', 'STRING_START', 'REGEX', 'REGEX_START'].includes(errorTag):
            return errorTag.replace(/_START$/, '').toLowerCase();
        default:
            return helpers.nameWhitespaceCharacter(errorText);
    } })();

    return helpers.throwSyntaxError(`unexpected ${errorText}`, errorLoc);
};

const compile_coffee_cache = {};
const defaultExport = {};
defaultExport.compile_coffee_expression = function(expr) {
    if (config.memoize_coffee_compiler) { return memoize_on(compile_coffee_cache, expr, () => _compile(expr)); } else { return _compile(expr); }
};

export default defaultExport;

var _compile = function(expr) {
    const code = `(=>(${expr}))()`;
    const options = {bare: true};
    const tokens = lexer.tokenize(code, options);
    const fragments = parser.parse(tokens).compileToFragments(options);
    const compiled = _l.map(fragments, 'code').join('');
    return compiled;
};
