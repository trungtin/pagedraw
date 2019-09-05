/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Generated by https://pagedraw.io/pages/1470
let Projectitem;
import React from 'react';
import createReactClass from 'create-react-class';

export default Projectitem = createReactClass({
    displayName: 'Projectitem',
    render() {
        return React.createElement("div", {"className": "projectitem"},
          React.createElement("style", {"dangerouslySetInnerHTML": ({__html: `\
@import url('https://fonts.googleapis.com/css?family=Roboto:');

.projectitem {
    display: flex;
    flex-grow: 1;
}

.projectitem-b-7 {
    display: flex;
    flex-direction: column;
    padding-bottom: 1px;
    flex-grow: 1;
}

.projectitem-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.projectitem-rectangle_1 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-basis: 0px;
    min-height: fit-content;
    padding-top: 9px;
    padding-bottom: 11px;
    border-radius: 5px;
    cursor: default;
    background: rgb(99, 60, 252);
}

.projectitem-0-0-0-0-0 {
    display: flex;
    flex-shrink: 0;
    padding-left: 11px;
    padding-right: 11px;
}

.projectitem-text_1 {
    flex-grow: 1;
    flex-basis: 0px;
    font-family: "Roboto", sans-serif;
    color: rgb(255, 255, 255);
    font-size: 14px;
    line-height: normal;
    letter-spacing: 0px;
    font-weight: bold;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.projectitem-a-9 {
    display: flex;
    flex-direction: column;
    padding-top: 10px;
    padding-bottom: 11px;
    cursor: pointer;
    background: #FFFFFF;
    flex-grow: 1;
}

.projectitem-1-0-0 {
    display: flex;
    flex-shrink: 0;
    padding-left: 10px;
    padding-right: 23px;
}

.projectitem-text_6 {
    width: 231px;
    flex-shrink: 0;
    cursor: pointer;
    font-family: "Roboto", sans-serif;
    color: #000000;
    font-size: 14px;
    line-height: normal;
    letter-spacing: 0px;
    font-weight: bold;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
}\
`})}),  
          ( ((this.props.selected ? 'B' : 'A') === "B") ?
              React.createElement("div", {"className": "projectitem-b-7"},
                  React.createElement("div", {"className": "projectitem-0-0-0"},
                      React.createElement("div", {"className": "projectitem-rectangle_1"},
                          React.createElement("div", {"className": "projectitem-0-0-0-0-0"},
                              React.createElement("div", {"className": "projectitem-text_1"},
                                  ( this.props.name )
                              )
                          )
                      )
                  )
              ) : undefined
          ),
          ( ((this.props.selected ? 'B' : 'A') === "A") ?
              React.createElement("div", {"className": "projectitem-a-9"},
                  React.createElement("div", {"className": "projectitem-1-0-0"},
                      React.createElement("div", {"onClick": (this.props.onClick), "className": "projectitem-text_6"},
                          ( this.props.name )
                      )
                  )
              ) : undefined
          )
      );
    }
});
