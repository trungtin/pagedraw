// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import $ from 'jquery';
import util from '../util';
import { server } from './server';
import { CustomFont, LocalUserFont } from '../fonts';
import { default as Dropzone } from 'react-dropzone';
import FontImporter from '../pagedraw/font-importer';

export default createReactClass({
    getInitialState() {
        return {
            importing: false,
            error: undefined
        };
    },

    render() {
        return (
            <Dropzone
                onDrop={this.handleDrop}
                style={{display: 'flex', flexDirection: 'column'}}>
                <FontImporter error={this.state.error} importing={this.state.importing} />
            </Dropzone>
        );
    },

    handleDrop(files) {
        // Don't throw if font being uploaded will replace a LocalUserFont
        if (this.props.doc.fonts.some(arg => (arg.name === files[0].name.split('.')[0]) && !arg instanceof LocalUserFont)) { return; }
        this.setState({importing: true});

        if (files.size > (32 * 1024 * 1024)) { this.setState({error: 'Error importing file: Chrome does not support fonts larger than 32MB'}); }

        let [name, format] = Array.from(files[0].name.split('.'));

        if (format) { format = _l.toLower(format); }

        const fontExtensions = {
            'ttf': 'truetype',
            'otf': 'opentype',
            'eot': 'embedded-opentype',
            'woff': 'woff',
            'woff2': 'woff2',
            'svg': 'svg'
        };

        const english_list = function(items) {
            if (items.length === 1) {
                return items[0]; // the pluralization of the rest of the sentance will be wrong, but w/e
            }

            const lst = [];
            for (let i = 0; i < items.length; i++) { const item = items[i]; if (i < (items.length - 1)) { lst.push(item, ", "); } }
            lst.push("and ", items.slice(-1)[0]);
            return lst;
        };

        if (!fontExtensions[format]) { return this.setState({error: <div style={{width: 512}}>
            <h4>
                Error: Unsupported font file format
            </h4>
            <p>
                {"You uploaded a "}
                <code>
                    .
                    {format}
                </code>
                {" file, but we only support "}
                {english_list(_l.keys(fontExtensions).map((extension, i) => <code key={i}>
                    .
                    {extension}
                </code>))}
                {" font files."}
            </p>
        </div>}); }

        // FIXME: For now we always base64 encode fonts. Move to a more flexible world where
        // fonts can be required and all
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);

        reader.onerror = event => {
          this.setState({error: 'Error importing file: Failed to upload font'});
          return console.log('Upload error: ' + event);
      };

        return reader.onload = event => {
          const b64_string = event.target.result.split(';base64,')[1];
          // FIXME: Not sure the format below is correct in all cases
          const base_64_url = `data:font/${format};base64,${b64_string}`;

          // FIXME: Should really being getting all font formats (woff, woff2, eot, etc) for browser support,
          // we can try to do the conversions ourselves (or look into an API like CloudConvert?)
          const importedFont = new CustomFont({name, url: base_64_url, format: fontExtensions[format]});
          for (let block of Array.from(this.props.doc.blocks)) {
              if (__guard__(block != null ? block.fontFamily : undefined, x => x.name) === name) {
                  block.fontFamily = importedFont;
              }
          }

          this.props.doc.fonts.splice(this.props.doc.fonts.findIndex(font => font.name === name), 1);
          this.props.doc.fonts.push(importedFont);
          this.props.doc.custom_fonts.push(importedFont);
          return this.props.closeHandler();
      };
    }
});

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}