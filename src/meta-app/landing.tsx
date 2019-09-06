// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
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
        const playground = <iframe
            id="playground"
            style={{minHeight: 800, minWidth: 1000, border: 0}}
            src="/playground">
            {`\
    Iframes not supported\
    `}
        </iframe>;

        const editorPicture = <img
            style={{width: 1000}}
            src="https://ucarecdn.com/bb07033e-3a89-4509-be20-7f901988d6e0/" />;

        const importPagedrawn =
            <div
                style={{fontFamily: 'monaco, monospace', lineHeight: '40px', color: '#fff', fontSize: 22, whiteSpace: 'pre'}}>
                <div>
                    <Keyword>
                        import
                    </Keyword>
                    {" "}
                    <ComponentName>
                        MainScreen
                    </ComponentName>
                    {" "}
                    <Keyword>
                        from
                    </Keyword>
                </div>
                <div>
                    <String>
                        './src/pagedraw/mainscreen'
                    </String>
                    ;
                </div>
                <br />
                <div>
                    ...
                </div>
                <br />
                <div>
                    &lt;
                    <ComponentName>
                        MainScreen
                    </ComponentName>
                </div>
                <div>
                    {"  "}
                    <Prop>
                        someData
                    </Prop>
                    ={
                    <Keyword>
                        this
                    </Keyword>
                    .fromServer}
                </div>
                <div>
                    {"  "}
                    <Prop>
                        onClick
                    </Prop>
                    ={
                    <Keyword>
                        this
                    </Keyword>
                    .handleSubmit}
                </div>
                <div>
                    {"  />"}
                </div>
            </div>;

        const announcement = !config.announceOpenSource ? undefined : <div
            style={{
                fontFamily: 'Helvetica, sans-serif',
                margin: 'auto',
                padding: 50,
                minHeight: '80vh',
                maxWidth: 980,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
            <h1
                style={{
                    fontSize: '87px'
                }}>
                {`\
    Pagedraw is going Open Source!\
    `}
            </h1>
            <div
                style={{
                    textAlign: 'right',
                    marginTop: -50,
                    marginBottom: 44,
                    lineHeight: '15px'
                }}>
                <a href="https://github.com/Pagedraw/pagedraw" style={{color: 'blue'}}>
                    <span
                        style={{
                            fontSize: '20px'
                        }}>
                        {`\
    Open on GitHub\
    `}
                    </span>
                    <br />
                    <span
                        style={{
                            fontFamily: 'monospace', fontSize: '14px'
                        }}>
                        {`\
    https:\x2F\x2Fgithub.com\x2FPagedraw\x2Fpagedraw\
    `}
                    </span>
                </a>
            </div>
            <ul
                style={{
                    marginLeft: '-33px',
                    fontSize: '20px',
                    lineHeight: '33px'
                }}>
                <li>
                    Shutting down company
                </li>
                <li>
                    Not recommended for production as we are not offering paid support
                </li>
                <li>
                    Differences from Hosted version:
                </li>
                <ul>
                    <li>
                        <code>
                            .pagedraw.json
                        </code>
                        {" files"}
                    </li>
                    <li>
                        Pagedraw library
                    </li>
                </ul>
                <li>
                    Migration pathway for existing users
                </li>
                <li>
                    Pagedraw will remain as it was for 2 mo more
                </li>
            </ul>
        </div>;

        return (
            <div>
                {announcement}
                <PagedrawnLandingDesktop
                    pdPlayground={browser.mobile || (browser.name !== 'chrome') ? editorPicture : playground}
                    importPagedrawn={importPagedrawn} />
            </div>
        );
    }
});

var Keyword         = ({children}) => <span style={{color: '#f92672'}}>
    {children}
</span>;
var ComponentName   = ({children}) => <span style={{color: '#d4d797'}}>
    {children}
</span>;
var String          = ({children}) => <span style={{color: '#ce9178'}}>
    {children}
</span>;
var Prop            = ({children}) => <span style={{color: '#8ad3ff'}}>
    {children}
</span>;

export default LandingDesktop;
