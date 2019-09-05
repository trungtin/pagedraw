/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import PagedrawnLandingDesktop from '../pagedraw/landingdesktop';
const browser = require('browser-detect')();

import config from '../config';

const LandingDesktop = createReactClass({
    render() {
        const playground = React.createElement("iframe", {"id": "playground", "style": ({minHeight: 800, minWidth: 1000, border: 0}), "src": "/playground"}, `\
Iframes not supported\
`);

        const editorPicture = React.createElement("img", {"style": ({width: 1000}), "src": "https://ucarecdn.com/bb07033e-3a89-4509-be20-7f901988d6e0/"});

        const importPagedrawn =
            React.createElement("div", {"style": ({fontFamily: 'monaco, monospace', lineHeight: '40px', color: '#fff', fontSize: 22, whiteSpace: 'pre'})},
                React.createElement("div", null, React.createElement(Keyword, null, ("import")), " ", React.createElement(ComponentName, null, ("MainScreen")), " ", React.createElement(Keyword, null, ("from"))),
                React.createElement("div", null, React.createElement(String, null, ("'./src/pagedraw/mainscreen'")), (";")),
                React.createElement("br", null),
                React.createElement("div", null, "..."),
                React.createElement("br", null),
                React.createElement("div", null, ("<"), React.createElement(ComponentName, null, ("MainScreen"))),
                React.createElement("div", null, ("  "), React.createElement(Prop, null, ("someData")), ("={"), React.createElement(Keyword, null, ("this")), (".fromServer}")),
                React.createElement("div", null, ("  "), React.createElement(Prop, null, ("onClick")), ("={"), React.createElement(Keyword, null, ("this")), (".handleSubmit}")),
                React.createElement("div", null, ("  />"))
            );

        const announcement = !config.announceOpenSource ? undefined : React.createElement("div", {"style": ({
            fontFamily: 'Helvetica, sans-serif',
            margin: 'auto',
            padding: 50,
            minHeight: '80vh',
            maxWidth: 980,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        })},
            React.createElement("h1", {"style": ({
                fontSize: '87px'
            })}, `\
Pagedraw is going Open Source!\
`),
            React.createElement("div", {"style": ({
                textAlign: 'right',
                marginTop: -50,
                marginBottom: 44,
                lineHeight: '15px'
            })},
                React.createElement("a", {"href": "https://github.com/Pagedraw/pagedraw", "style": ({color: 'blue'})},
                    React.createElement("span", {"style": ({
                        fontSize: '20px'
                    })}, `\
Open on GitHub\
`),
                    React.createElement("br", null),
                    React.createElement("span", {"style": ({
                        fontFamily: 'monospace', fontSize: '14px'
                    })}, `\
https:\x2F\x2Fgithub.com\x2FPagedraw\x2Fpagedraw\
`)
                )
            ),
            React.createElement("ul", {"style": ({
                marginLeft: '-33px',
                fontSize: '20px',
                lineHeight: '33px'
            })},
              React.createElement("li", null, "Shutting down company"),
              React.createElement("li", null, "Not recommended for production as we are not offering paid support"),
              React.createElement("li", null, "Differences from Hosted version:"),
                React.createElement("ul", null,
                    React.createElement("li", null, React.createElement("code", null, ".pagedraw.json"), " files"),
                    React.createElement("li", null, "Pagedraw library")
                ),
              React.createElement("li", null, "Migration pathway for existing users"),
              React.createElement("li", null, "Pagedraw will remain as it was for 2 mo more")
            )
        );

        return React.createElement("div", null,
            ( announcement ),
            React.createElement(PagedrawnLandingDesktop, { 
                "pdPlayground": (browser.mobile || (browser.name !== 'chrome') ? editorPicture : playground),  
                "importPagedrawn": (importPagedrawn)
                })
        );
    }
});

var Keyword         = ({children}) => React.createElement("span", {"style": ({color: '#f92672'})}, (children));
var ComponentName   = ({children}) => React.createElement("span", {"style": ({color: '#d4d797'})}, (children));
var String          = ({children}) => React.createElement("span", {"style": ({color: '#ce9178'})}, (children));
var Prop            = ({children}) => React.createElement("span", {"style": ({color: '#8ad3ff'})}, (children));

export default LandingDesktop;
