// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let allFonts, AllGoogleWebFonts, CustomFont, Font, font_loading_head_tags_for_doc, fontsByName, GoogleWebFont, LocalUserFont, WebFont;
import _l from 'lodash';
import { Model } from './model';
import config from './config';
import React from 'react';
import { Helmet } from 'react-helmet';
const defaultExport = {};

// abstract base class
defaultExport.Font = Model.register('font', (Font = (function() {
    Font = class Font extends Model {
        static initClass() {
            this.prototype.properties = {};
        }
        get_user_visible_name() { return ""; }
        get_css_string() { return ""; }
        get_loader_css() { return ""; }
        get_font_variants() { return []; }
    };
    Font.initClass();
    return Font;
})()));


//# Standard Web Fonts

// web_fonts_data :: {font name: CSS string}
const web_fonts_data = require('./standard-web-fonts-list');

defaultExport.WebFont = Model.register('webfont', (WebFont = (function() {
    WebFont = class WebFont extends Font {
        static initClass() {
            this.prototype.properties =
                {name: String};
        }

        get_user_visible_name() { return this.name; }
        get_css_string() { return web_fonts_data[this.name]; }
        get_font_variants() { return _l.range(100, 1000, 100).map(arg => arg.toString()); }

        getCustomEqualityChecks() { return _l.extend({}, super.getCustomEqualityChecks(),
            // these guys are equal regardless of uniqueKeys.  `.name` functions like a uniqueKey
            {uniqueKey() { return true; }}); }
    };
    WebFont.initClass();
    return WebFont;
})())
);

const AllStandardWebFonts = _l.keys(web_fonts_data).map(font_name => new WebFont({name: font_name}));


//# Google Web Fonts

// google_fonts_data :: {font name: font category}, where category is serif/sans-serif/etc.
const google_fonts_data = require('./google-web-fonts-list');

defaultExport.GoogleWebFont = Model.register('gfont', (GoogleWebFont = (function() {
    GoogleWebFont = class GoogleWebFont extends Font {
        static initClass() {
            this.prototype.properties =
                {name: String};
        }

        get_user_visible_name() { return this.name; }
        get_css_string() { return `\"${this.name}\", ${google_fonts_data[this.name].css_string}`; }
        get_font_variants() { return google_fonts_data[this.name].variants; }

        getCustomEqualityChecks() { return _l.extend({}, super.getCustomEqualityChecks(),
            // these guys are equal regardless of uniqueKeys.  `.name` functions like a uniqueKey
            {uniqueKey() { return true; }}); }
    };
    GoogleWebFont.initClass();
    return GoogleWebFont;
})())
);

defaultExport._allGoogleWebFonts = (AllGoogleWebFonts = _l.keys(google_fonts_data).map(font_name => new GoogleWebFont({name: font_name})));

defaultExport.CustomFont = Model.register('customfont', (CustomFont = (function() {
    CustomFont = class CustomFont extends Font {
        static initClass() {
            this.prototype.properties = {
                name: String,
                url: String,
                format: String
            };
        }

        get_user_visible_name() { return this.name; }
        get_css_string() { return this.name; }
        // FIXME: font-weight is always set to 400 but whatever font is at the src url is what will show up,
        // this can be misleading if user uploads a bold font for example. possible fix is to let the user
        // specify font weight with each upload and make fontWeights a property of font so they are all associated
        get_font_variants() { return ['400']; }
        get_font_face() { return `\
@font-face {
    font-family: "${this.name}";
    font-style: normal;
    font-weight: 400;
    src: url(${this.url}) format("${this.format}");
}\
`; }
    };
    CustomFont.initClass();
    return CustomFont;
})())
);


// This is a last resort. When sketch importer cannot find a font in fontsByName it will set LocalUserFont
// with whatever name sketchtool dump gave us. This usually works in the editor but will not compile
// correctly as the fonts source is the local machine. Let's be really careful to make this clear to the user
// so they don't get confused.
// FIXME: Automatically upload custom fonts during the importing process
defaultExport.LocalUserFont = Model.register('localfont', (LocalUserFont = (function() {
    LocalUserFont = class LocalUserFont extends Font {
        static initClass() {
            this.prototype.properties =
                {name: String};
        }

        get_user_visible_name() { return this.name; }
        get_css_string() { return config.unavailableCustomUserFontPlaceholderFont != null ? config.unavailableCustomUserFontPlaceholderFont : this.name; }
        get_font_variants() { return []; }
    };
    LocalUserFont.initClass();
    return LocalUserFont;
})()));

//# Shared exports

defaultExport.allFonts = (allFonts = [].concat(AllStandardWebFonts, AllGoogleWebFonts));
defaultExport.fontsByName = (fontsByName = _l.keyBy(allFonts, f => f.get_user_visible_name()));
defaultExport.defaultFonts = [
    'San Francisco',
    'Helvetica',
    'Arial',
    'Roboto',
    'Open Sans'
].map(name => fontsByName[name]);


defaultExport.font_loading_head_tags_for_doc = (font_loading_head_tags_for_doc = function(doc) {
    // font weight 400 imported in header already, so its omitted here
    // any currently selected google font is added to the header for all font weights,
    // we don't do this for normal font weights because it would make the font modal too slow

    const gwfs = doc.fonts.filter(font => font instanceof GoogleWebFont);
    const cfs = doc.fonts.filter(font => font instanceof CustomFont);
    const sp_g = / /g; // because cjsx is broken, I can't inline this
    return React.createElement(Helmet, null,
        (!_l.isEmpty(gwfs) ? React.createElement("link", {"href": (`https://fonts.googleapis.com/css?family=${gwfs.map(font => `${font.name.replace(sp_g, '+')}:${font.get_font_variants().join(',')}`).join('|')}`), "rel": "stylesheet"}) : undefined),
        (!_l.isEmpty(cfs) ? React.createElement("style", {"type": "text/css"}, (cfs.map(font => font.get_font_face()).join('\n'))) : undefined)
    );
});

export default defaultExport;

