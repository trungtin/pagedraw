# Generated by https://pagedraw.io/pages/11538
React = require 'react'


render = ->
    React.createElement("div", {"className": "installationhuge"},
        React.createElement("style", {"dangerouslySetInnerHTML": (__html: """
            @import url('https://fonts.googleapis.com/css?family=Lato:');
            
            .installationhuge {
                display: flex;
                flex-grow: 1;
            }
            
            .installationhuge-installed-0 {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
            }
            
            .installationhuge-0-0-0 {
                display: flex;
                flex-shrink: 0;
            }
            
            .installationhuge-rectangle_3 {
                display: flex;
                flex-direction: column;
                padding-top: 6px;
                padding-bottom: 7px;
                border-radius: 30px;
                cursor: default;
                background: rgb(115, 201, 78);
            }
            
            .installationhuge-0-0-0-0-0 {
                display: flex;
                flex-shrink: 0;
                padding-left: 9px;
                padding-right: 9px;
            }
            
            .installationhuge-installed_-8 {
                width: 94px;
                flex-shrink: 0;
                font-family: "Lato", sans-serif;
                color: rgb(255, 255, 255);
                font-size: 15px;
                line-height: 17px;
                letter-spacing: 0px;
                font-weight: normal;
                font-style: normal;
                text-decoration: none;
                text-align: center;
                word-wrap: break-word;
            }
            
            .installationhuge-default-1 {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
            }
            
            .installationhuge-1-0-0 {
                display: flex;
                flex-shrink: 0;
            }
            
            .installationhuge-rectangle_3-1 {
                display: flex;
                flex-direction: column;
                padding-top: 6px;
                padding-bottom: 7px;
                border-radius: 30px;
                cursor: pointer;
                background: rgb(57, 150, 253);
            }
            
            .installationhuge-1-0-0-0-0 {
                display: flex;
                flex-shrink: 0;
                padding-left: 9px;
                padding-right: 9px;
            }
            
            .installationhuge-add_to_app_-2 {
                width: 94px;
                flex-shrink: 0;
                font-family: "Lato", sans-serif;
                color: rgb(255, 255, 255);
                font-size: 15px;
                line-height: 17px;
                letter-spacing: 0px;
                font-weight: normal;
                font-style: normal;
                text-decoration: none;
                text-align: center;
                word-wrap: break-word;
            }
            
            .installationhuge-upgrade-5 {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
            }
            
            .installationhuge-2-0-0 {
                display: flex;
                flex-shrink: 0;
            }
            
            .installationhuge-rectangle_3-3 {
                display: flex;
                flex-direction: column;
                padding-top: 6px;
                padding-bottom: 7px;
                border-radius: 30px;
                cursor: pointer;
                background: rgb(78, 84, 201);
            }
            
            .installationhuge-2-0-0-0-0 {
                display: flex;
                flex-shrink: 0;
                padding-left: 9px;
                padding-right: 9px;
            }
            
            .installationhuge-_upgrade_-7 {
                width: 94px;
                flex-shrink: 0;
                font-family: "Lato", sans-serif;
                color: rgb(255, 255, 255);
                font-size: 15px;
                line-height: 17px;
                letter-spacing: 0px;
                font-weight: normal;
                font-style: normal;
                text-decoration: none;
                text-align: center;
                word-wrap: break-word;
            }
            
            * {
                box-sizing: border-box;
            }
            
            body {
                margin: 0;
            }
            
            button:hover {
                cursor: pointer;
            }
            
            a {
                text-decoration: none;
                color: inherit;
            }
            
            .pd-onhover-parent >.pd-onhover {
                display: none;
            }
            
            .pd-onhover-parent:hover > * {
                display: none;
            }
            
            .pd-onhover-parent:hover > .pd-onhover {
                display: flex;
            }
            
            .pd-onactive-parent > .pd-onactive {
                display: none;
            }
            
            .pd-onactive-parent:active > * {
                display: none;
            }
            
            .pd-onactive-parent:active > .pd-onactive {
                display: flex;
            }
            
            .pd-onactive-parent.pd-onhover-parent:active > .pd-onhover {
                display: none;
            }
        """)}),  
        ( if ((@props.installed) == "installed")
            React.createElement("div", {"className": "installationhuge-installed-0"},
                React.createElement("div", {"className": "installationhuge-0-0-0"},
                    React.createElement("div", {"className": "installationhuge-rectangle_3"},
                        React.createElement("div", {"className": "installationhuge-0-0-0-0-0"},
                            React.createElement("div", {"className": "installationhuge-installed_-8"}, """
                                Installed
""")
                        )
                    )
                )
            )
        ),
        ( if ((@props.installed) == "default")
            React.createElement("div", {"className": "installationhuge-default-1"},
                React.createElement("div", {"className": "installationhuge-1-0-0"},
                    React.createElement("div", {"onClick": (@props.onClick), "className": "installationhuge-rectangle_3-1"},
                        React.createElement("div", {"className": "installationhuge-1-0-0-0-0"},
                            React.createElement("div", {"className": "installationhuge-add_to_app_-2"}, """
                                Add to app
""")
                        )
                    )
                )
            )
        ),
        ( if ((@props.installed) == "upgrade")
            React.createElement("div", {"className": "installationhuge-upgrade-5"},
                React.createElement("div", {"className": "installationhuge-2-0-0"},
                    React.createElement("div", {"onClick": (@props.onClick), "className": "installationhuge-rectangle_3-3"},
                        React.createElement("div", {"className": "installationhuge-2-0-0-0-0"},
                            React.createElement("div", {"className": "installationhuge-_upgrade_-7"}, """
                                + Upgrade 
""")
                        )
                    )
                )
            )
        )
    )

module.exports = (props) -> render.apply({props})
