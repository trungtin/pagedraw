# Generated by https://pagedraw.io/pages/1470
React = require 'react'
createReactClass = require 'create-react-class'
Addlistitemlist = require './add-list-item-list'


module.exports = Addlist = createReactClass {
    displayName: 'Addlist'
    render: ->
        React.createElement("div", {"className": "addlist-addlist-3"},
          React.createElement("style", {"dangerouslySetInnerHTML": (__html: """
              .addlist-addlist-3 {
                  display: flex;
                  flex-direction: column;
                  flex-grow: 1;
                  background: #FFFFFF;
              }
              
              .addlist-0 {
                  display: flex;
                  flex-shrink: 0;
              }
              
              .addlist-defaultcomponentlist-9 {
                  flex-shrink: 0;
                  display: flex;
                  flex-direction: column;
              }
              
              .addlist-1 {
                  display: flex;
                  flex-shrink: 0;
              }
              
              .addlist-line-6 {
                  width: 276px;
                  height: 1px;
                  flex-shrink: 0;
                  background: #D8D8D8;
              }
              
              .addlist-2 {
                  display: flex;
                  flex-shrink: 0;
              }
              
              .addlist-customcomponentlist-0 {
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
          React.createElement("div", {"className": "addlist-0"},
              React.createElement("div", {"className": "addlist-defaultcomponentlist-9"},
                  React.createElement(Addlistitemlist, {"items": (this.props.defaultComponents)}) 
              )
          ),
          React.createElement("div", {"className": "addlist-1"},
              React.createElement("div", {"className": "addlist-line-6"}) 
          ),
          React.createElement("div", {"className": "addlist-2"},
              React.createElement("div", {"className": "addlist-customcomponentlist-0"},
                  React.createElement(Addlistitemlist, {"items": (this.props.customComponents)}) 
              )
          )
      )
}
