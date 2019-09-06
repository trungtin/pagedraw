// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ShowFilePathsButton, showManageFilePathsModal;
import _l from 'lodash';
import React from 'react';
import { Modal, PdSidebarButton, PdButtonOne } from './component-lib';
import ArtboardBlock from '../blocks/artboard-block';
import { filePathOfComponent, cssPathOfComponent } from '../component-spec';
import modal from '../frontend/modal';
import FormControl from '../frontend/form-control';
import { PDTextControlWithConfirmation } from '../editor/sidebar-controls';
import { filePathTextStyle } from './code-styles';
import { CheckboxControl, labeledControl } from './sidebar-controls';
import LanguagePickerWidget from './language-picker-widget';
import { propLink } from '../util';

const ModalSection = ({children, style}) => <div style={_l.extend({maxWidth: 500, margin: '2.5em auto'}, style)}>
    {children}
</div>;

const ModalSectionHeader = ({children}) => <h5
    style={{
        borderBottom: '1px solid rgb(51, 51, 51)',
        paddingBottom: '0.4em',
        marginBottom: '1.6em'
    }}>
    {children}
</h5>;

const defaultExport = {};

defaultExport.showManageFilePathsModal = (showManageFilePathsModal = function(doc, onChange, selectedBlocks) {
    const linkAttr = function(obj, attr, dfault) {
        if (dfault == null) { dfault = undefined; }
        const vl = propLink(obj, attr, onChange);
        if ((dfault != null) && _l.isEmpty(vl.value)) { vl.value = dfault; }
        return vl;
    };

    return modal.showWithClass("code-file-paths-modal", closeHandler => [
        <Modal.Header closeButton={true}>
            <Modal.Title>
                Code Settings
            </Modal.Title>
        </Modal.Header>,
        <Modal.Body>
            <ModalSection style={{marginTop: 0, marginBottom: 0}}>
                <ModalSectionHeader>
                    File Paths
                </ModalSectionHeader>
            </ModalSection>
            <table style={{"width": "100%", "tableLayout": "fixed"}}>
                <thead>
                    <tr>
                        <th style={{width: 75}}>
                            CLI Sync
                        </th>
                        <th style={{width: '20%'}}>
                            Name
                        </th>
                        <th>
                            File Path
                        </th>
                        <th>
                            CSS Path
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {doc.getComponents().map(component => {
                            const style =
                                Array.from(selectedBlocks).includes(component) ? {height: '2em', backgroundColor: '#EDEFF0', border: '1px solid'}
                                : {height: '2em'};

                            const spec = component.componentSpec;
                            return (
                                <tr key={component.uniqueKey} style={style}>
                                    <td>
                                        <FormControl
                                            type="checkbox"
                                            title="CLI Sync"
                                            valueLink={linkAttr(spec, 'shouldCompile')} />
                                    </td>
                                    <td>
                                        <PDTextControlWithConfirmation
                                            valueLink={linkAttr(component, 'name')}
                                            style={{fontFamily: 'Roboto'}}
                                            showEditButton={false} />
                                    </td>
                                    <td>
                                        <PDTextControlWithConfirmation
                                            valueLink={linkAttr(spec, 'filePath', filePathOfComponent(component))}
                                            style={filePathTextStyle}
                                            showEditButton={false} />
                                    </td>
                                    <td>
                                        <PDTextControlWithConfirmation
                                            valueLink={linkAttr(spec, 'cssPath', cssPathOfComponent(component))}
                                            style={filePathTextStyle}
                                            showEditButton={false} />
                                    </td>
                                </tr>
                            );
                    })}
                </tbody>
            </table>
            <ModalSection>
                <ModalSectionHeader>
                    Filepath prefix
                </ModalSectionHeader>
                <PDTextControlWithConfirmation
                    valueLink={linkAttr(doc, 'filepath_prefix')}
                    style={_l.extend({}, filePathTextStyle, {
                        width: "100%"
                    })}
                    showEditButton={false} />
            </ModalSection>
            <ModalSection>
                <ModalSectionHeader>
                    Language settings
                </ModalSectionHeader>
                <div className="sidebar">
                    {labeledControl(vl => <LanguagePickerWidget valueLink={vl} />)("Language", propLink(doc, 'export_lang', onChange))}
                    {CheckboxControl('Separate CSS', propLink(doc, 'separate_css', onChange))}
                    {CheckboxControl('Inline CSS', propLink(doc, 'inline_css', onChange))}
                    {CheckboxControl('Use Styled Components', propLink(doc, 'styled_components', onChange))}
                    {CheckboxControl('Import Fonts', propLink(doc, 'import_fonts', onChange))}
                </div>
            </ModalSection>
        </Modal.Body>,

        <Modal.Footer>
            <PdButtonOne type="primary" onClick={closeHandler}>
                Close
            </PdButtonOne>
        </Modal.Footer>
    ]);
});


defaultExport.ShowFilePathsButton = (ShowFilePathsButton = (doc, onChange, selectedBlocks) => <PdSidebarButton onClick={() => showManageFilePathsModal(doc, onChange, selectedBlocks)}>
    {`\
    Code Settings\
    `}
</PdSidebarButton>);
export default defaultExport;
