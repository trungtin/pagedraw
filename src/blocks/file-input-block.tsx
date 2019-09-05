// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FileInputBlock;
import _ from 'underscore';
import React from 'react';
import Block from '../block';
import { TextControl, NumberControl, CheckboxControl } from '../editor/sidebar-controls';

export default Block.register('file-input', (FileInputBlock = (function() {
    FileInputBlock = class FileInputBlock extends Block {
        static initClass() {
            this.userVisibleLabel = 'File Input';
    
            this.prototype.properties =
                {ref: String};
    
            this.prototype.resizableEdges = [];
            // FIXME: I don't know if these numbers should ever change in different scenarios
            this.const_property('width', 163);
            this.const_property('height', 21);
    
            this.prototype.canContainChildren = false;
        }

        boxStylingSidebarControls() { return []; }

        renderHTML(dom) {
            super.renderHTML(...arguments);

            return dom.children = [{
                tag: 'input',
                typeAttr: 'file',
                nameAttr: this.ref,
                children: []
            }];
        }
    };
    FileInputBlock.initClass();
    return FileInputBlock;
})()));
