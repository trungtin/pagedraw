_l = require 'lodash'
React = require 'react'

{Modal, PdSidebarButton, PdButtonOne} = require './component-lib'

ArtboardBlock = require '../blocks/artboard-block'
{filePathOfComponent, cssPathOfComponent} = require '../component-spec'

modal = require '../frontend/modal'
FormControl = require '../frontend/form-control'
{PDTextControlWithConfirmation} = require '../editor/sidebar-controls'
{filePathTextStyle} = require './code-styles'

{
    CheckboxControl
    labeledControl
} = require './sidebar-controls'
LanguagePickerWidget = require './language-picker-widget'

{propLink} = require '../util'

ModalSection = ({children, style}) ->
    React.createElement("div", {"style": (_l.extend({maxWidth: 500, margin: '2.5em auto'}, style))},
        ( children )
    )

ModalSectionHeader = ({children}) ->
    React.createElement("h5", {"style": (
        borderBottom: '1px solid rgb(51, 51, 51)'
        paddingBottom: '0.4em'
        marginBottom: '1.6em'
    )},
        ( children )
    )

exports.showManageFilePathsModal = showManageFilePathsModal = (doc, onChange, selectedBlocks) ->
    linkAttr = (obj, attr, dfault = undefined) ->
        vl = propLink(obj, attr, onChange)
        vl.value = dfault if dfault? and _l.isEmpty(vl.value)
        return vl

    modal.showWithClass "code-file-paths-modal", (closeHandler) -> [
        React.createElement(Modal.Header, {"closeButton": true},
            React.createElement(Modal.Title, null, "Code Settings")
        )
        React.createElement(Modal.Body, null,
            React.createElement(ModalSection, {"style": (marginTop: 0, marginBottom: 0)},
                React.createElement(ModalSectionHeader, null, "File Paths")
            ),
            React.createElement("table", {"style": ("width": "100%", "tableLayout": "fixed")},
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", {"style": (width: 75)}, "CLI Sync"),
                        React.createElement("th", {"style": (width: '20%')}, "Name"),
                        React.createElement("th", null, "File Path"),
                        React.createElement("th", null, "CSS Path")
                    )
                ),
                React.createElement("tbody", null,
                    (doc.getComponents().map (component) =>
                        style =
                            if component in selectedBlocks then {height: '2em', backgroundColor: '#EDEFF0', border: '1px solid'}
                            else {height: '2em'}

                        spec = component.componentSpec
                        (
                            React.createElement("tr", {"key": (component.uniqueKey), "style": (style)},
                                React.createElement("td", null, React.createElement(FormControl, {"type": "checkbox", "title": "CLI Sync", "valueLink": (linkAttr(spec, 'shouldCompile'))})),
                                React.createElement("td", null,
                                    React.createElement(PDTextControlWithConfirmation, { \
                                        "valueLink": (linkAttr(component, 'name')),  \
                                        "style": (fontFamily: 'Roboto'),  \
                                        "showEditButton": (false)})
                                ),
                                React.createElement("td", null,
                                    React.createElement(PDTextControlWithConfirmation, { \
                                        "valueLink": (linkAttr(spec, 'filePath', filePathOfComponent(component))),  \
                                        "style": (filePathTextStyle),  \
                                        "showEditButton": (false)})
                                ),
                                React.createElement("td", null,
                                    React.createElement(PDTextControlWithConfirmation, { \
                                        "valueLink": (linkAttr(spec, 'cssPath', cssPathOfComponent(component))),  \
                                        "style": (filePathTextStyle),  \
                                        "showEditButton": (false)})
                                )
                            )
                        ))
                )
            ),

            React.createElement(ModalSection, null,
                React.createElement(ModalSectionHeader, null, "Filepath prefix"),
                React.createElement(PDTextControlWithConfirmation, { \
                    "valueLink": (linkAttr(doc, 'filepath_prefix')),  \
                    "style": (_l.extend {}, filePathTextStyle, {
                        width: "100%"
                    }),  \
                    "showEditButton": (false)})
            ),

            React.createElement(ModalSection, null,
                React.createElement(ModalSectionHeader, null, "Language settings"),
                React.createElement("div", {"className": "sidebar"},
                    (labeledControl((vl) -> React.createElement(LanguagePickerWidget, {"valueLink": (vl)}))("Language", propLink(doc, 'export_lang', onChange))),
                    (CheckboxControl('Separate CSS', propLink(doc, 'separate_css', onChange))),
                    (CheckboxControl('Inline CSS', propLink(doc, 'inline_css', onChange))),
                    (CheckboxControl('Use Styled Components', propLink(doc, 'styled_components', onChange))),
                    (CheckboxControl('Import Fonts', propLink(doc, 'import_fonts', onChange)))
                )
            )
        )

        React.createElement(Modal.Footer, null,
            React.createElement(PdButtonOne, {"type": "primary", "onClick": (closeHandler)}, "Close")
        )
    ]


exports.ShowFilePathsButton = ShowFilePathsButton = (doc, onChange, selectedBlocks) ->
    React.createElement(PdSidebarButton, {"onClick": (=> showManageFilePathsModal(doc, onChange, selectedBlocks))}, """
        Code Settings
""")
