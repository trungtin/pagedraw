/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { Helmet } from 'react-helmet';
import { Modal, PdButtonOne } from '../editor/component-lib';
import modal from '../frontend/modal';
import { allFonts, fontsByName, _allGoogleWebFonts } from '../fonts';
import Infinite from 'react-infinite';
import leven from 'leven';
import Dropzone from 'react-dropzone';
import { server } from '../editor/server';
import FontImporter from '../editor/font-importer';
const defaultExport = {};


defaultExport.handleAddCustomFonts = function(doc, onClosed=null) {
        let showModalName = 'font-list';
        let font_filter = '';

        const sp_g = / /g; // because cjsx is broken, I can't inline this
        const font_list_loader_helmet =
            React.createElement(Helmet, null,
                React.createElement("link", {"rel": "stylesheet", "href": (
                    `https://fonts.googleapis.com/css?family=${_allGoogleWebFonts.map(f => f.name.replace(sp_g, '+')).join('|')}`
                )})
            );

        return modal.show((function(closeHandler) {
            if (showModalName === 'font-list') {
                const fontsHash = _l.keyBy(doc.fonts, 'name');
                const fonts_in_doc = allFonts.concat(doc.custom_fonts);
                const currentFonts =
                    font_filter === ''
                    ? fonts_in_doc
                    : (fonts_in_doc
                        .map(font => ({font, dist: leven(font.name.toLowerCase(), font_filter.toLowerCase())}))
                        .filter(obj => obj.dist < (Math.abs(font_filter.length - obj.font.name.length) + 2))
                        .sort((a, b) => a.dist - b.dist)
                        .map(arg => arg.font)
                    );
                return [
                    font_list_loader_helmet,
                    React.createElement(Modal.Header, {"closeButton": true},
                        React.createElement(Modal.Title, null, "Choose Custom Fonts")
                    ),
                    React.createElement(Modal.Body, null,
                        React.createElement("input", {"placeholder": "Search...",  
                            "style": ({width: '100%', marginBottom: '5px', fontSize: '24px'}),  
                            "value": (font_filter),  
                            "onChange": (e => {
                                font_filter = e.target.value;
                                return modal.forceUpdate();
                            }
                            )}),
                        React.createElement(Infinite, {"containerHeight": (400), "elementHeight": (26), "className": "font-manager-infinite-scroll"},
                            (
                                currentFonts.map(font => {
                                    return React.createElement("div", {"key": (font.uniqueKey), "style": ({display: 'flex', alignItems: 'baseline'})},
                                        React.createElement("input", {"id": (`font-${font.uniqueKey}`), "type": "checkbox",  
                                            "checked": (fontsHash[font.name] != null ? fontsHash[font.name] : false),  
                                            "onChange": (e => {
                                                if (e.target.checked) {
                                                    // went from unchecked -> checked
                                                    doc.fonts.push(font);

                                                } else {
                                                    // went from checked -> unchecked
                                                    doc.fonts = doc.fonts.filter(f => !font.isEqual(f));
                                                    doc.removeFontFromAllBlocks(font);
                                                }

                                                return modal.forceUpdate();
                                            }
                                            )}),
                                        React.createElement("label", {"htmlFor": (`font-${font.uniqueKey}`), "style": ({
                                            fontFamily: font.get_css_string(),
                                            fontWeight: 400, fontSize: '24px',
                                            paddingLeft: '5px', flex: 1
                                        })},
                                            (font.name)
                                        )
                                    );
                            })
                            )
                        )
                    ),
                    React.createElement(Modal.Footer, null,
                        React.createElement("div", {"style": ({float: 'left'})}, React.createElement(PdButtonOne, {"onClick": (() => {
                            showModalName = 'upload-font';
                            return modal.forceUpdate();
                        }
                        )}, "Upload new font")),
                        React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Close")
                    )
                ];

            } else if (showModalName === 'upload-font') {
                return [
                    React.createElement(Modal.Header, {"closeButton": true},
                        React.createElement(Modal.Title, null, "Upload a font")
                    ),
                    React.createElement(Modal.Body, null,
                        React.createElement(FontImporter, {"doc": (doc), "closeHandler": (closeHandler)})
                    ),
                    React.createElement(Modal.Footer, null,
                        React.createElement("div", {"style": ({float: 'left'})}, React.createElement(PdButtonOne, {"onClick": (() => {
                            showModalName = 'font-list';
                            return modal.forceUpdate();
                        }
                        )}, "Back")),
                        React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Close")
                    )
                ];
            }

        }), (() => typeof onClosed === 'function' ? onClosed() : undefined));
    };
export default defaultExport;
