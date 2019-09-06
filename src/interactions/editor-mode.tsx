// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let EditorMode;
import React from 'react';
import _l from 'lodash';
import Topbar from '../pagedraw/topbar';
import { Sidebar } from '../editor/sidebar';
import LayerList from '../editor/layer-list';
import ErrorSidebar from '../pagedraw/errorsidebar';
const defaultExport = {};


// Base class for EditorModes to override

defaultExport.EditorMode = (EditorMode = class EditorMode {
    willMount(editor) {}
        // Implement me in subclasses!

    topbar(editor, defaultTopbar) {
        return (
            <div>
                <Topbar editor={editor} whichTopbar={defaultTopbar} />
            </div>
        );
    }

    canvas(editor) {
        // Implment me in subclasses!
        return <div />;
    }

    sidebar(editor) {
        return (
            <Sidebar
                editor={editor}
                value={editor.getSelectedBlocks()}
                selectBlocks={editor.selectBlocks}
                editorCache={editor.editorCache}
                sidebarMode="draw"
                doc={editor.doc}
                setEditorMode={editor.setEditorMode}
                onChange={editor.handleDocChanged} />
        );
    }

    leftbar(editor) {
        return (
            <React.Fragment>
                <LayerList
                    doc={editor.doc}
                    selectedBlocks={editor.getSelectedBlocks()}
                    onBlocksSelected={editor.handleLayerListSelectedBlocks}
                    onLayerItemMouseDown={editor.setEditorStateToDefault}
                    highlightedBlock={editor.highlightedBlock}
                    setHighlightedblock={editor.setHighlightedblock}
                    onChange={editor.handleDocChanged} />
                {(editor.errors.length > 0) || (editor.warnings.length > 0) ?
                        <div style={{maxHeight: 314}}>
                            <ErrorSidebar errors={editor.errors} warnings={editor.warnings} />
                        </div> : undefined}
            </React.Fragment>
        );
    }

    // when we 'toggle' a mode, we'll use this to compare to the existing mode,
    // to see if we think we're going to the same mode
    isAlreadySimilarTo(other) { return false; }

    keepBlockSelectionOnEscKey() { return false; }

    // called once per Editor.render
    rebuild_render_caches() {}
});
export default defaultExport;
