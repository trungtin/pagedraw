// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let YieldBlock;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import Block from '../block';
import { TextControl, NumberControl, CheckboxControl } from '../editor/sidebar-controls';

export default Block.register('yield', (YieldBlock = (function() {
    YieldBlock = class YieldBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'Yield';
    
            this.prototype.properties = {};
    
            this.prototype.canContainChildren = false;
        }

        renderHTML(pdom) {
            super.renderHTML(...arguments); // really?

            // We render ourselves as a div so the compiler actually positions us correctly, and
            // then we place the actual yield component inside of us
            pdom.tag = 'div';
            pdom.children = [{tag: 'yield', children: []}];

            // FIXME: Gives the yield block a minHeight. This is temporary because we have no way to fix content to the
            // bottom of a page, so we need a minHeight in the yield block to force the little pagedog logo
            // in layout.html.erb to go to the bottom. When we have vertical constraints this should go away
            pdom['minHeight'] = pdom['height'];

            // The height of a yield block is determined by its content
            return delete pdom['height'];
        }

        editor() {
            return React.createElement("div", {"style": ({
                height: "100%",
                width: "100%",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                // nice red alt background color: "#E45474"
                backgroundColor: "#73D488",
                borderRadius: 8,

                fontFamily: "'Open Sans', sans-serif",
                fontWeight: 600,
                color: "#F4F7F3"
            })}, `\
Yield\
`);
        }
    };
    YieldBlock.initClass();
    return YieldBlock;
})())
);
