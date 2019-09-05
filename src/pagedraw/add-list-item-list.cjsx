# Generated by https://pagedraw.io/pages/1470
React = require 'react'
createReactClass = require 'create-react-class'
Addlistitem = require './add-list-item'


module.exports = Addlistitemlist = createReactClass {
    displayName: 'Addlistitemlist'
    render: ->
        React.createElement("div", {"className": "addlistitemlist-addlistitemlist-8"},
          React.createElement("style", {"dangerouslySetInnerHTML": (__html: """
              .addlistitemlist-addlistitemlist-8 {
                  display: flex;
                  flex-direction: column;
                  flex-grow: 1;
                  background: #FFFFFF;
              }
              
              .addlistitemlist-0 {
                  display: flex;
                  flex-shrink: 0;
              }
              
              .addlistitemlist-0-0 {
                  display: flex;
                  flex-direction: column;
              }
              
              .addlistitemlist-rectangle-7 {
                  display: flex;
                  flex-direction: column;
                  background: #D8D8D8;
                  flex-grow: 1;
              }
              
              .addlistitemlist-0-0-0-0-0 {
                  display: flex;
                  flex-shrink: 0;
              }
              
              .addlistitemlist-addlistitem-7 {
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
          React.createElement("div", {"className": "addlistitemlist-0"},
              React.createElement("div", {"className": "addlistitemlist-0-0"},
                  ( this.props.items.map (item, i) =>
                      React.createElement("div", {"key": (i), "onClick": (item.handler), "className": "addlistitemlist-rectangle-7"},
                          React.createElement("div", {"className": "addlistitemlist-0-0-0-0-0"},
                              React.createElement("div", {"className": "addlistitemlist-addlistitem-7"},
                                  React.createElement(Addlistitem, {"label": (item.label), "keyCommand": (item.keyCommand)}) 
                              )
                          )
                      )
                  )
              )
          )
      )
}
