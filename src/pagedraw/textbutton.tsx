// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Generated by https://pagedraw.io/pages/1470
let Textbutton;
import React from 'react';
import createReactClass from 'create-react-class';

export default Textbutton = createReactClass({
    displayName: 'Textbutton',
    render() {
        return React.createElement("div", {"className": "textbutton"},
          React.createElement("style", {"dangerouslySetInnerHTML": ({__html: `\
.textbutton {
    display: flex;
    flex-grow: 1;
}

.textbutton-disabled-1 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.textbutton-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.textbutton-rectangle_7 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-basis: 0px;
    min-height: fit-content;
    padding-top: 12px;
    padding-bottom: 12px;
    border-radius: 3px;
    background: rgb(125, 125, 142);
}

.textbutton-0-0-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.textbutton-0-0-0-0-0-0 {
    height: 0px;
    flex-grow: 0.4946236559139785;
    flex-basis: 0px;
}

.textbutton-text_5 {
    flex-shrink: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica', sans-serif;
    color: rgb(206, 206, 206);
    font-size: 13px;
    line-height: normal;
    letter-spacing: -0.3px;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    text-align: center;
    word-wrap: break-word;
    padding-right: 0.640625px;
}

.textbutton-0-0-0-0-0-2 {
    height: 0px;
    flex-grow: 0.5053763440860215;
    flex-basis: 0px;
}

.textbutton-1-0 {
    display: flex;
    flex-grow: 1;
}

.textbutton-a-6 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.textbutton-1-0-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.textbutton-rectangle_7-1 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-basis: 0px;
    min-height: fit-content;
    padding-top: 12px;
    padding-bottom: 12px;
    border-radius: 3px;
    background: rgb(106, 106, 195);
}

.textbutton-1-0-0-0-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.textbutton-1-0-0-0-0-0-0-0 {
    height: 0px;
    flex-grow: 0.4946236559139785;
    flex-basis: 0px;
}

.textbutton-text_5-8 {
    flex-shrink: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica', sans-serif;
    color: rgb(255, 255, 255);
    font-size: 13px;
    line-height: normal;
    letter-spacing: -0.3px;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    text-align: center;
    word-wrap: break-word;
    padding-right: 0.640625px;
}

.textbutton-1-0-0-0-0-0-0-2 {
    height: 0px;
    flex-grow: 0.5053763440860215;
    flex-basis: 0px;
}

.textbutton-_hover-7 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.textbutton-1-0-1-0 {
    display: flex;
    flex-shrink: 0;
}

.textbutton-rectangle_7-5 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-basis: 0px;
    min-height: fit-content;
    padding-top: 12px;
    padding-bottom: 12px;
    border-radius: 3px;
    cursor: pointer;
    background: rgb(82, 82, 185);
}

.textbutton-1-0-1-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.textbutton-1-0-1-0-0-0-0 {
    height: 0px;
    flex-grow: 0.4946236559139785;
    flex-basis: 0px;
}

.textbutton-text_5-0 {
    flex-shrink: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica', sans-serif;
    color: rgb(255, 255, 255);
    font-size: 13px;
    line-height: normal;
    letter-spacing: -0.3px;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    text-align: center;
    word-wrap: break-word;
    padding-right: 0.640625px;
}

.textbutton-1-0-1-0-0-0-2 {
    height: 0px;
    flex-grow: 0.5053763440860215;
    flex-basis: 0px;
}

.textbutton-_active-7 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.textbutton-1-0-2-0 {
    display: flex;
    flex-shrink: 0;
}

.textbutton-rectangle_7-4 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-basis: 0px;
    min-height: fit-content;
    padding-top: 12px;
    padding-bottom: 12px;
    border-radius: 3px;
    cursor: pointer;
    background: rgb(32, 32, 111);
}

.textbutton-1-0-2-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.textbutton-1-0-2-0-0-0-0 {
    height: 0px;
    flex-grow: 0.4946236559139785;
    flex-basis: 0px;
}

.textbutton-text_5-6 {
    flex-shrink: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica', sans-serif;
    color: rgb(255, 255, 255);
    font-size: 13px;
    line-height: normal;
    letter-spacing: -0.3px;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    text-align: center;
    word-wrap: break-word;
    padding-right: 0.640625px;
}

.textbutton-1-0-2-0-0-0-2 {
    height: 0px;
    flex-grow: 0.5053763440860215;
    flex-basis: 0px;
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
          ( ((this.props.disabled ? 'Disabled' : 'Enabled') === "Disabled") ?
              React.createElement("div", {"className": "textbutton-disabled-1"},
                  React.createElement("div", {"className": "textbutton-0-0-0"},
                      React.createElement("div", {"className": "textbutton-rectangle_7"},
                          React.createElement("div", {"className": "textbutton-0-0-0-0-0"},
                              React.createElement("div", {"className": "textbutton-0-0-0-0-0-0"}),  
                              React.createElement("div", {"className": "textbutton-text_5"}, ( this.props.text )),
                              React.createElement("div", {"className": "textbutton-0-0-0-0-0-2"}) 
                          )
                      )
                  )
              ) : undefined
          ),
          ( ((this.props.disabled ? 'Disabled' : 'Enabled') === "Enabled") ?
              React.createElement("div", {"className": "pd-onhover-parent pd-onactive-parent textbutton-1-0"},
                  ( (("A") === "A") ?
                      React.createElement("div", {"className": "textbutton-a-6"},
                          React.createElement("div", {"className": "textbutton-1-0-0-0-0"},
                              React.createElement("div", {"className": "textbutton-rectangle_7-1"},
                                  React.createElement("div", {"className": "textbutton-1-0-0-0-0-0-0"},
                                      React.createElement("div", {"className": "textbutton-1-0-0-0-0-0-0-0"}),  
                                      React.createElement("div", {"className": "textbutton-text_5-8"}, ( this.props.text )),
                                      React.createElement("div", {"className": "textbutton-1-0-0-0-0-0-0-2"}) 
                                  )
                              )
                          )
                      ) : undefined
                  ),
                  React.createElement("div", {"className": "pd-onhover textbutton-_hover-7"},
                      React.createElement("div", {"className": "textbutton-1-0-1-0"},
                          React.createElement("div", {"className": "textbutton-rectangle_7-5"},
                              React.createElement("div", {"className": "textbutton-1-0-1-0-0-0"},
                                  React.createElement("div", {"className": "textbutton-1-0-1-0-0-0-0"}),  
                                  React.createElement("div", {"className": "textbutton-text_5-0"}, ( this.props.text )),
                                  React.createElement("div", {"className": "textbutton-1-0-1-0-0-0-2"}) 
                              )
                          )
                      )
                  ),
                  React.createElement("div", {"className": "pd-onactive textbutton-_active-7"},
                      React.createElement("div", {"className": "textbutton-1-0-2-0"},
                          React.createElement("div", {"onMouseUp": (this.props.onClick), "className": "textbutton-rectangle_7-4"},
                              React.createElement("div", {"className": "textbutton-1-0-2-0-0-0"},
                                  React.createElement("div", {"className": "textbutton-1-0-2-0-0-0-0"}),  
                                  React.createElement("div", {"className": "textbutton-text_5-6"}, ( this.props.text )),
                                  React.createElement("div", {"className": "textbutton-1-0-2-0-0-0-2"}) 
                              )
                          )
                      )
                  )
              ) : undefined
          )
      );
    }
});
