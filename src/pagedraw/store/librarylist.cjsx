# Generated by https://pagedraw.io/pages/11538
React = require 'react'
Deletebutton = require './deletebutton'


render = ->
    React.createElement("div", {"className": "librarylist-librarylist-9"},
        React.createElement("style", {"dangerouslySetInnerHTML": (__html: """
            @import url('https://fonts.googleapis.com/css?family=Lato:');
            
            .librarylist-librarylist-9 {
                display: flex;
                flex-direction: column;
                flex-grow: 1;
            }
            
            .librarylist-0 {
                display: flex;
                flex-shrink: 0;
            }
            
            .librarylist-0-0 {
                display: flex;
                flex-direction: column;
                margin-top: -10px;
            }
            
            .librarylist-repeat-0 {
                display: flex;
                flex-direction: column;
                padding-bottom: 3px;
                background: rgba(255, 255, 255, 0);
                margin-top: 10px;
                flex-grow: 1;
            }
            
            .librarylist-0-0-0-0-0 {
                display: flex;
                flex-shrink: 0;
            }
            
            .librarylist-0-0-0-0-0-0 {
                display: flex;
                flex-direction: column;
                padding-bottom: 1px;
            }
            
            .librarylist-0-0-0-0-0-0-0 {
                display: flex;
                flex-shrink: 0;
            }
            
            .librarylist-label-3 {
                width: 203px;
                flex-shrink: 0;
                font-family: "Lato", sans-serif;
                color: #000000;
                font-size: 18px;
                line-height: 21px;
                letter-spacing: 0px;
                font-weight: normal;
                font-style: normal;
                text-decoration: none;
                text-align: left;
                word-wrap: break-word;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .librarylist-0-0-0-0-0-1 {
                display: flex;
                flex-direction: column;
                padding-top: 6px;
                padding-bottom: 2px;
            }
            
            .librarylist-0-0-0-0-0-1-0 {
                display: flex;
                flex-shrink: 0;
            }
            
            .librarylist-label-1 {
                width: 39px;
                flex-shrink: 0;
                font-family: "Lato", sans-serif;
                color: rgb(93, 93, 93);
                font-size: 12px;
                line-height: 14px;
                letter-spacing: 0px;
                font-weight: normal;
                font-style: normal;
                text-decoration: none;
                text-align: right;
                word-wrap: break-word;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .librarylist-0-0-0-0-0-2 {
                display: flex;
                flex-direction: column;
                margin-left: 10px;
                padding-top: 4px;
            }
            
            .librarylist-0-0-0-0-0-2-0 {
                display: flex;
                flex-shrink: 0;
            }
            
            .librarylist-delete-1 {
                flex-shrink: 0;
                display: flex;
                flex-direction: column;
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
        React.createElement("div", {"className": "librarylist-0"},
            React.createElement("div", {"className": "librarylist-0-0"},
                ( this.props.libraries.map (library, i) =>
                    React.createElement("div", {"key": (i), "className": "librarylist-repeat-0"},
                        React.createElement("div", {"className": "librarylist-0-0-0-0-0"},
                            React.createElement("div", {"className": "librarylist-0-0-0-0-0-0"},
                                React.createElement("div", {"className": "librarylist-0-0-0-0-0-0-0"},
                                    React.createElement("div", {"className": "librarylist-label-3"},
                                        ( library.title )
                                    )
                                )
                            ),
                            React.createElement("div", {"className": "librarylist-0-0-0-0-0-1"},
                                React.createElement("div", {"className": "librarylist-0-0-0-0-0-1-0"},
                                    React.createElement("div", {"className": "librarylist-label-1"},
                                        ( library.version )
                                    )
                                )
                            ),
                            React.createElement("div", {"className": "librarylist-0-0-0-0-0-2"},
                                React.createElement("div", {"className": "librarylist-0-0-0-0-0-2-0"},
                                    React.createElement("div", {"onClick": (library.onRemove), "className": "librarylist-delete-1"},
                                        React.createElement(Deletebutton, {"state": ("default")}) 
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    )

module.exports = (props) -> render.apply({props})
