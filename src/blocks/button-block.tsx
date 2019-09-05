// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ButtonBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import Block from '../block';
import { Font, fontsByName } from '../fonts';

export default Block.register('button', (ButtonBlock = (function() {
    ButtonBlock = class ButtonBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Button';
            this.prototype.properties = {
                text: String,
                textGutter: Number,
                textTopAndBottomMargins: Number,
    
                fontColor: String,
                fontSize: Number,
                fontFamily: Font,
                textShadow: String,
                lineHeight: Number,
                textAlign: String,
    
                isBold: Boolean,
                isItalics: Boolean,
                isUnderline: Boolean,
    
                // background image
                image: String
            };
    
            this.prototype.canContainChildren = false;
        }

        constructor(json) {
            super(json);

            // needs to override default values for UndeterminedBlock
            if (this.borderRadius == null) { this.borderRadius = 4; }

            if (this.fontColor == null) { this.fontColor = '#fff'; }
            if (this.fontSize == null) { this.fontSize = 16; }
            if (this.fontFamily == null) { this.fontFamily = fontsByName['Helvetica Neue']; }
            if (this.textAlign == null) { this.textAlign = 'center'; }
            if (this.text == null) { this.text = 'Click me'; }

            if (this.borderThickness == null) { this.borderThickness = 0; }
        }

        getDefaultColor() { return '#337ab7'; }

        sidebarControls() { return [
            React.createElement("div", null,
                React.createElement("h5", null, "Deprecation Notice"),
                React.createElement("p", null, `\
This block is a Button Block, which has been deprecated.  Instead, you should make your
own button component, and use it throughout your app.\
`),
                React.createElement("p", null, `\
You\'ll notice that the block type listed above is incorrect.  This is because the Button
Block type has been hidden in Pagedraw as part of the deprecation process.\
`)
            )
        ]; }

        renderHTML(pdom) {
            let left;
            super.renderHTML(...arguments);

            _.extend(pdom, {
                tag: 'button',
                typeAttr: 'submit',
                children: [{tag: 'span', children: [], textContent: this.text}],

                paddingLeft: this.textGutter,
                paddingRight: this.textGutter,
                paddingTop: this.textTopAndBottomMargins,
                paddingBottom: this.textTopAndBottomMargins,

                fontFamily: this.fontFamily,
                color: this.fontColor,
                fontSize: this.fontSize,
                textShadow: this.textShadow,

                // We need to explicitly give lineHeight units, or in the editor,
                // React will, in a special case, treat it as a unitless multiple,
                // while we compile it with "px"
                lineHeight: (left = (this.lineHeight != null ? this.lineHeight.px() : undefined)) != null ? left : 'normal',

                fontWeight: this.isBold ? '700' : '400',
                fontStyle: this.isItalics ? 'italic' : 'normal',
                textDecoration: this.isUnderline ? 'underline' : 'none',

                textAlign: this.textAlign,

                // wrap word across multiple lines if it's too long to fit on one
                wordWrap: 'break-word',

                // Force reset some defaults.  See core.percolate_inherited_css_properties to understand why
                letterSpacing: 'normal'
            });

            // the default is an ugly "inset" border
            if (this.borderThickness === 0) {
                pdom.border = 'none';
            }

            if (this.image) {
                return _.extend(pdom, {
                    'backgroundImage': `url('${this.image}')`,
                    'backgroundSize': 'cover',
                    'backgroundPositionX': '50%'
                }
                );
            }
        }
    };
    ButtonBlock.initClass();
    return ButtonBlock;
})())
);


