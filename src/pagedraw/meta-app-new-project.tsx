// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Generated by https://pagedraw.io/pages/1470
let Meta_app_new_project;
import React from 'react';
import createReactClass from 'create-react-class';
import Banner from './banner';
import Projectitem from './projectitem';
import Frameworkpickerradiobutton from './frameworkpickerradiobutton';
import Textbutton from './textbutton';
import Footer from './footer';

export default Meta_app_new_project = createReactClass({
    displayName: 'Meta_app_new_project',
    render() {
        return React.createElement("div", {"className": "meta-app-new-project-meta-app-new-project-2"},
          React.createElement("style", {"dangerouslySetInnerHTML": ({__html: `\
@import url('https://fonts.googleapis.com/css?family=Lato:|Roboto:');

.meta-app-new-project-meta-app-new-project-2 {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    background: #FFFFFF;
    min-height: 100vh;
}

.meta-app-new-project-0 {
    display: flex;
    flex-shrink: 0;
}

.meta-app-new-project-instance_of_deleted_component-4 {
    flex-grow: 1;
    flex-basis: 0px;
    display: flex;
    flex-direction: column;
}

.meta-app-new-project-1 {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
}

.meta-app-new-project-body-6 {
    display: flex;
    flex-direction: column;
    padding-bottom: 7px;
}

.meta-app-new-project-1-0-0 {
    display: flex;
    flex-shrink: 0;
    padding-right: 84px;
}

.meta-app-new-project-sidebar-9 {
    display: flex;
    flex-direction: column;
    padding-top: 45px;
    padding-bottom: 473px;
}

.meta-app-new-project-1-0-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.meta-app-new-project-projects-0 {
    display: flex;
    flex-direction: column;
}

.meta-app-new-project-1-0-0-0-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.meta-app-new-project-text_2 {
    width: 294px;
    flex-shrink: 0;
    font-family: "Lato", sans-serif;
    color: #000000;
    font-size: 16px;
    line-height: normal;
    letter-spacing: 0px;
    font-weight: bold;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
}

.meta-app-new-project-1-0-0-0-0-0-1 {
    display: flex;
    flex-shrink: 0;
    margin-top: 7px;
}

.meta-app-new-project-rectangle_6 {
    width: 294px;
    height: 1px;
    flex-shrink: 0;
    background: rgb(162, 162, 162);
}

.meta-app-new-project-1-0-0-0-0-0-2 {
    display: flex;
    flex-shrink: 0;
    margin-top: 8px;
}

.meta-app-new-project-1-0-0-0-0-0-2-0 {
    display: flex;
    flex-direction: column;
}

.meta-app-new-project-project_list-2 {
    display: flex;
    flex-direction: column;
    padding-top: 1px;
    background: rgb(255, 255, 255);
    flex-grow: 1;
}

.meta-app-new-project-1-0-0-0-0-0-2-0-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.meta-app-new-project-projectitem_instance_2 {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-width: 294px;
}

.meta-app-new-project-1-0-0-0-1 {
    display: flex;
    flex-shrink: 0;
    margin-top: 4px;
}

.meta-app-new-project-rectangle_8 {
    display: flex;
    flex-direction: column;
    padding-top: 2px;
    padding-bottom: 3px;
    background: rgba(216, 216, 216, 0);
}

.meta-app-new-project-1-0-0-0-1-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.meta-app-new-project-text_8 {
    width: 294px;
    flex-shrink: 0;
    font-family: "Lato", sans-serif;
    color: rgb(173, 173, 173);
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0px;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
}

.meta-app-new-project-1-0-0-1 {
    display: flex;
    flex-direction: column;
    margin-left: 83px;
    padding-top: 56px;
}

.meta-app-new-project-1-0-0-1-0 {
    display: flex;
    flex-shrink: 0;
}

.meta-app-new-project-text_1 {
    width: 659px;
    flex-shrink: 0;
    font-family: "Lato", sans-serif;
    color: rgb(45, 45, 47);
    font-size: 40px;
    line-height: normal;
    letter-spacing: 0px;
    font-weight: bold;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
}

.meta-app-new-project-1-0-0-1-1 {
    display: flex;
    flex-shrink: 0;
    margin-top: 14px;
}

.meta-app-new-project-project_name-2 {
    width: 659px;
    height: 43px;
    flex-shrink: 0;
    border-radius: 2px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #000;
    font-size: 21px;
    font-weight: normal;
    font-style: normal;
    text-align: left;
    letter-spacing: 0px;
    line-height: normal;
    word-wrap: normal;
    padding-left: 9px;
    padding-right: 9px;
    border: 1px solid #cccccc;
}

.meta-app-new-project-1-0-0-1-2 {
    display: flex;
    flex-shrink: 0;
    margin-top: 9px;
    padding-left: 9px;
}

.meta-app-new-project-text_8-2 {
    width: 650px;
    flex-shrink: 0;
    font-family: "Lato", sans-serif;
    color: rgb(173, 173, 173);
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0px;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
}

.meta-app-new-project-1-0-0-1-3 {
    display: flex;
    flex-shrink: 0;
    margin-top: 49px;
}

.meta-app-new-project-rectangle_1 {
    display: flex;
    flex-direction: column;
    padding-bottom: 49px;
}

.meta-app-new-project-1-0-0-1-3-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.meta-app-new-project-text_24 {
    width: 659px;
    flex-shrink: 0;
    font-family: "Lato", sans-serif;
    color: #000000;
    font-size: 16px;
    line-height: normal;
    letter-spacing: 0px;
    font-weight: bold;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
}

.meta-app-new-project-1-0-0-1-3-0-0-1 {
    display: flex;
    flex-shrink: 0;
    margin-top: 9px;
}

.meta-app-new-project-unnamed_instance-0 {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-width: 322px;
    min-height: 91px;
}

.meta-app-new-project-unnamed_instance-09 {
    flex-shrink: 0;
    margin-left: 15px;
    display: flex;
    flex-direction: column;
    min-width: 322px;
    min-height: 91px;
}

.meta-app-new-project-1-0-0-1-4 {
    display: flex;
    flex-shrink: 0;
}

.meta-app-new-project-text_24-9 {
    width: 659px;
    flex-shrink: 0;
    font-family: "Lato", sans-serif;
    color: #000000;
    font-size: 16px;
    line-height: normal;
    letter-spacing: 0px;
    font-weight: bold;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
}

.meta-app-new-project-1-0-0-1-5 {
    display: flex;
    flex-shrink: 0;
    margin-top: 9px;
}

.meta-app-new-project-1-0-0-1-5-0 {
    display: flex;
    flex-direction: column;
    margin-top: -12px;
}

.meta-app-new-project-collab_list-1 {
    display: flex;
    flex-direction: column;
    padding-bottom: 1px;
    background: rgb(255, 255, 255);
    margin-top: 12px;
    flex-grow: 1;
}

.meta-app-new-project-1-0-0-1-5-0-0-0-0 {
    display: flex;
    flex-shrink: 0;
}

.meta-app-new-project-text_18 {
    width: 638px;
    flex-shrink: 0;
    font-family: "Roboto", sans-serif;
    color: rgb(22, 98, 140);
    font-size: 14px;
    line-height: normal;
    letter-spacing: 0px;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
}

.meta-app-new-project-rectangle_10 {
    display: flex;
    flex-direction: column;
    background: rgba(216, 216, 216, 0);
    margin-left: 9px;
}

.meta-app-new-project-1-0-0-1-5-0-0-0-0-1-0-0 {
    display: flex;
    flex-shrink: 0;
    padding-left: 1px;
}

.meta-app-new-project-text_19 {
    flex-shrink: 0;
    cursor: pointer;
    font-family: "Lato", sans-serif;
    color: rgb(142, 142, 142);
    font-size: 11px;
    line-height: normal;
    letter-spacing: 0px;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    text-align: center;
    word-wrap: break-word;
}

.meta-app-new-project-1-0-0-1-6 {
    display: flex;
    flex-shrink: 0;
    margin-top: 14px;
}

.meta-app-new-project-text_input_4 {
    width: 557px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 2px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #000;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    text-align: left;
    letter-spacing: 0px;
    line-height: normal;
    word-wrap: normal;
    padding-left: 9px;
    padding-right: 9px;
    border: 1px solid #cccccc;
}

.meta-app-new-project-textbutton-3 {
    flex-shrink: 0;
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    min-width: 90px;
}

.meta-app-new-project-1-0-0-1-7 {
    display: flex;
    flex-shrink: 0;
    margin-top: 9px;
    padding-left: 9px;
}

.meta-app-new-project-text_8-7 {
    width: 650px;
    flex-shrink: 0;
    font-family: "Lato", sans-serif;
    color: rgb(173, 173, 173);
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0px;
    font-weight: normal;
    font-style: normal;
    text-decoration: none;
    text-align: left;
    word-wrap: break-word;
}

.meta-app-new-project-1-0-0-1-8 {
    display: flex;
    flex-shrink: 0;
    margin-top: 49px;
}

.meta-app-new-project-textbutton-1 {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    min-width: 659px;
}

.meta-app-new-project-2 {
    width: 0px;
    flex-shrink: 0;
    flex-grow: 1;
    flex-basis: 0px;
}

.meta-app-new-project-3 {
    display: flex;
    flex-shrink: 0;
    justify-content: center;
}

.meta-app-new-project-footer_instance-7 {
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
}\
`})}),  
          React.createElement("div", {"className": "meta-app-new-project-0"},
              React.createElement("div", {"className": "meta-app-new-project-instance_of_deleted_component-4"},
                  React.createElement(Banner, {"username": (this.props.current_user.name), "logout": ((this.props.logout))}) 
              )
          ),
          React.createElement("div", {"className": "meta-app-new-project-1"},
              React.createElement("div", {"className": "meta-app-new-project-body-6"},
                  React.createElement("div", {"className": "meta-app-new-project-1-0-0"},
                      React.createElement("div", {"className": "meta-app-new-project-sidebar-9"},
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-0-0"},
                              React.createElement("div", {"className": "meta-app-new-project-projects-0"},
                                  React.createElement("div", {"className": "meta-app-new-project-1-0-0-0-0-0-0"},
                                      React.createElement("div", {"className": "meta-app-new-project-text_2"}, `\
Other Projects\
`)
                                  ),
                                  React.createElement("div", {"className": "meta-app-new-project-1-0-0-0-0-0-1"},
                                      React.createElement("div", {"className": "meta-app-new-project-rectangle_6"}) 
                                  ),
                                  React.createElement("div", {"className": "meta-app-new-project-1-0-0-0-0-0-2"},
                                      React.createElement("div", {"className": "meta-app-new-project-1-0-0-0-0-0-2-0"},
                                          ( this.props.apps.map((app, i) => {
                                              return React.createElement("div", {"key": (i), "className": "meta-app-new-project-project_list-2"},
                                                  React.createElement("div", {"className": "meta-app-new-project-1-0-0-0-0-0-2-0-0-0-0"},
                                                      React.createElement("div", {"className": "meta-app-new-project-projectitem_instance_2"},
                                                          React.createElement(Projectitem, {"name": (app.name), "selected": (false), "onClick": ((() => this.props.handleAppChanged(app.id)))}) 
                                                      )
                                                  )
                                              );
                                          }))
                                      )
                                  )
                              )
                          ),
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-0-1"},
                              ( (this.props.apps.length === 0) ?
                                  React.createElement("div", {"className": "meta-app-new-project-rectangle_8"},
                                      React.createElement("div", {"className": "meta-app-new-project-1-0-0-0-1-0-0-0"},
                                          React.createElement("div", {"className": "meta-app-new-project-text_8"}, `\
No existing projects\
`)
                                      )
                                  ) : undefined
                              )
                          )
                      ),
                      React.createElement("div", {"className": "meta-app-new-project-1-0-0-1"},
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-0"},
                              React.createElement("div", {"className": "meta-app-new-project-text_1"}, `\
New Project\
`)
                          ),
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-1"},
                              React.createElement("input", {"type": "text", "placeholder": "Project name", "value": (this.props.projectNameField), "onChange": (e => this.props.handleProjectNameChange(e.target.value)), "className": "meta-app-new-project-project_name-2"}) 
                          ),
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-2"},
                              React.createElement("div", {"className": "meta-app-new-project-text_8-2"}, `\
You can rename it later\
`)
                          ),
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-3"},
                              ( this.props.angular_support ?
                                  React.createElement("div", {"className": "meta-app-new-project-rectangle_1"},
                                      React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-3-0-0-0"},
                                          React.createElement("div", {"className": "meta-app-new-project-text_24"}, `\
Framework\
`)
                                      ),
                                      React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-3-0-0-1"},
                                          React.createElement("div", {"className": "meta-app-new-project-unnamed_instance-0"},
                                              React.createElement(Frameworkpickerradiobutton, {"img": ("https://ucarecdn.com/217042e2-98ad-4a15-a63c-357202c0c7c0/"), "name": ("React"), "desc": ("The Javascript view library from Facebook"), "selected": ((this.props.framework === 'JSX')), "handleClick": ((() => this.props.handleFrameworkChange('JSX')))}) 
                                          ),
                                          React.createElement("div", {"className": "meta-app-new-project-unnamed_instance-09"},
                                              React.createElement(Frameworkpickerradiobutton, {"img": ("https://ucarecdn.com/fdcb4b95-69ab-4a6e-be90-6d668181bc54/"), "name": ("Angular"), "desc": ("The Front End Framework from Google"), "selected": ((this.props.framework === 'Angular2')), "handleClick": ((() => this.props.handleFrameworkChange('Angular2')))}) 
                                          )
                                      )
                                  ) : undefined
                              )
                          ),
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-4"},
                              React.createElement("div", {"className": "meta-app-new-project-text_24-9"}, `\
Collaborators\
`)
                          ),
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-5"},
                              React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-5-0"},
                                  ( this.props.collaborators.map((user, i) => {
                                      return React.createElement("div", {"key": (i), "className": "meta-app-new-project-collab_list-1"},
                                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-5-0-0-0-0"},
                                              React.createElement("div", {"className": "meta-app-new-project-text_18"},
                                                  ( user.email )
                                              ),
                                              ( (!user.is_me) ?
                                                  React.createElement("div", {"className": "meta-app-new-project-rectangle_10"},
                                                      React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-5-0-0-0-0-1-0-0"},
                                                          React.createElement("div", {"onClick": (() => this.props.handleCollaboratorDelete(user.email)), "className": "meta-app-new-project-text_19"},
                                                              ("╳")
                                                          )
                                                      )
                                                  ) : undefined
                                              )
                                          )
                                      );
                                  }))
                              )
                          ),
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-6"},
                              React.createElement("input", {"type": "text", "placeholder": "coworker@yourcompany.com", "value": (this.props.newCollaboratorField), "onChange": (e => this.props.handleNewCollaboratorChanged(e.target.value)), "className": "meta-app-new-project-text_input_4"}),  
                              React.createElement("div", {"className": "meta-app-new-project-textbutton-3"},
                                  React.createElement(Textbutton, {"text": ("ADD"), "onClick": ((this.props.handleAddCollaborator)), "disabled": (false)}) 
                              )
                          ),
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-7"},
                              React.createElement("div", {"className": "meta-app-new-project-text_8-7"}, `\
You can add or remove more collaborators later\
`)
                          ),
                          React.createElement("div", {"className": "meta-app-new-project-1-0-0-1-8"},
                              React.createElement("div", {"className": "meta-app-new-project-textbutton-1"},
                                  React.createElement(Textbutton, {"text": ("CREATE PROJECT"), "onClick": ((this.props.handleSubmit)), "disabled": (false)}) 
                              )
                          )
                      )
                  )
              )
          ),
          React.createElement("div", {"className": "meta-app-new-project-2"}),  
          React.createElement("div", {"className": "meta-app-new-project-3"},
              React.createElement("div", {"className": "meta-app-new-project-footer_instance-7"},
                  React.createElement(Footer, null) 
              )
          )
      );
    }
});
