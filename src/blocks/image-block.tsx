/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ImageBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import { PdButtonGroup } from '../editor/component-lib';
import Block from '../block';
import { CheckboxControl, ImageControl, TextControl } from '../editor/sidebar-controls';
import { Dynamicable } from '../dynamicable';

export default Block.register('image', (ImageBlock = (function() {
    ImageBlock = class ImageBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Image';
    
            this.prototype.properties = {
                image: Dynamicable(String),
                parallax: Boolean,
                stretchAlgo: String, // "cover" | "contain" | "stretch" | "none"
    
                // Timestamp used to communicate to other Pagedraw clients that this image is still loading
                loadingSince: Number
            };
    
            this.prototype.canContainChildren = true;
             // or null
        }

        constructor() {
            super(...arguments);
            if (this.stretchAlgo == null) { this.stretchAlgo = "stretch"; }
            if (this.image == null) { this.image = Dynamicable(String).from(""); }
        }

        // HACK fallback to the editor's cache for our image if we don't have an src set but the cache has one for us
        // getSrc :: (options :: {}) -> Dynamicable(src :: String)
        getSrc(param) {
            if (param == null) { param = {}; }
            const {imageBlockPngCache} = param;
            return this.image.mapStatic(src => _l.isEmpty(src) ? ((imageBlockPngCache != null ? imageBlockPngCache[this.uniqueKey] : undefined) != null ? (imageBlockPngCache != null ? imageBlockPngCache[this.uniqueKey] : undefined) : '') : src);
        }

        specialSidebarControls(linkAttr) { return [
            ["image", 'image', ImageControl]
        ]; }

        constraintControls(linkAttr, onChange) { return _l.concat(super.constraintControls(linkAttr, onChange), [
            ["Parallax Scrolling", "parallax", CheckboxControl],

            // TODO only show stretch controls iff dynamic src OR non-fixed size
            React.createElement("div", {"className": "ctrl-wrapper"},
                React.createElement("div", {"className": "ctrl"},
                    React.createElement(PdButtonGroup, {"buttons": ([
                        ['Stretch', 'stretch'],
                        ['Cover',   'cover'],
                        ['Contain', 'contain']
                        // [Image size,    'img-file-size']
                        // TODO setting where height is set by width * aspect ratio
                    ].map(function(...args) {
                        const [label, value] = Array.from(args[0]), i = args[1];
                        const vlink = linkAttr('stretchAlgo');
                        return {
                            label, type: vlink.value === value ? 'primary' : 'default',
                            onClick(e) { vlink.requestChange(value); e.preventDefault(); return e.stopPropagation(); }
                        };
                    }))})
                )
            )
        ]); }

        renderHTML(dom, options, editorCache) {
            super.renderHTML(...arguments);

            const imgSrc = this.getSrc(editorCache);
            // If the image is static and empty, we have nothing to show.
            // OR for the editor, if we have no static image to show, the user probably wants a dynamicable image, and
            // this is an acceptable placeholder thre.
            if ((_.isEmpty(imgSrc.staticValue) && (!imgSrc.isDynamic)) || 
               (_.isEmpty(imgSrc.staticValue) && options.for_editor && !options.for_component_instance_editor)) {
                return _.extend(dom, {
                    background: '#D8D8D8'
                });

            // HTML Emails dont support background-image
            } else if ((options.templateLang === 'html-email') && !options.for_editor) {
                return _.extend(dom, {
                    tag: 'img',
                    srcAttr: imgSrc,
                    height: this.height,
                    width: this.width
                });

            // use an img tag if it's a plain old image with nothing on it
            } else if (_.isEmpty(dom.children) && (this.stretchAlgo === 'stretch') && !this.parallax) {
                const compiled = (!options.for_editor) || options.for_component_instance_editor;
                return _.extend(dom, {
                    tag: 'img',
                    srcAttr: imgSrc,
                    height: (this.flexHeight ? undefined : this.height),
                    width: (this.flexWidth && compiled ? 0 : this.width)
                });

            } else {
                return _.extend(dom, {
                    // Note: This can't be url('') otherwise webpack complains
                    backgroundImage: (!!imgSrc.isDynamic) || !_l.isEmpty(imgSrc.staticValue) ? imgSrc.cssImgUrlified() : undefined,

                    backgroundSize: (() => { switch (this.stretchAlgo) {
                        case 'cover': return 'cover';
                        case 'contain': return 'contain';
                        case 'stretch': return '100% 100%';
                        case 'img-file-size': return undefined;
                    } })(),

                    // both of the following probably deserve their own controls, sometimes,
                    // but these are defaults I picked for now (jrp)
                    backgroundPosition: ['contain', 'cover', 'img-file-size'].includes(this.stretchAlgo) ? 'center' : undefined,
                    backgroundRepeat: ['contain', 'img-file-size'].includes(this.stretchAlgo) ? 'no-repeat' : undefined,

                    backgroundAttachment: (() => {
                        if (!options.for_editor) { if (this.parallax) { return 'fixed'; }
                }
                    })(),
                    height: _.isEmpty(dom.children) ? this.height : undefined // need explicit height if no children
                });
            }
        }

        editor({editorCache}) {
            const needs_loading_animation =
                _.isEmpty(this.getSrc(editorCache).staticValue) &&        // we don't have a static image
                (this.loadingSince != null) &&                                     // but we're loading one
                (((Date.now() - this.loadingSince) / (1000 * 60)) < 10);         // and it's been less than 10 minutes so we haven't timed out yet

            // returning null uses the default editor, rendering the image the same way it's compiled
            if (!needs_loading_animation) { return null; }

            return React.createElement("div", null,
                React.createElement("div", {"className": "animated-background", "style": ({height: this.height})})
            );
        }
    };
    ImageBlock.initClass();
    return ImageBlock;
})())
);

