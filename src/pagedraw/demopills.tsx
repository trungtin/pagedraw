// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Generated by https://pagedraw.io/pages/5249
let Demopills;
import React from 'react';
import createReactClass from 'create-react-class';
import Expandingpill from './expandingpill';

export default Demopills = createReactClass({
    displayName: 'Demopills',
    render() {
        return (
            <div style={{"display": "flex", "flexDirection": "column", "flexGrow": "1"}}>
                <style
                    dangerouslySetInnerHTML={{__html: `\


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
          `}} />
                <div style={{"display": "flex", "flexShrink": "0"}}>
                    <div style={{"display": "flex", "flexDirection": "column", "marginTop": -12}}>
                        {this.props.list.map((elem, i) => {
                                return (
                                    <div
                                        key={i}
                                        style={{"display": "flex", "flexDirection": "column", "marginTop": 12, "flexGrow": "1"}}>
                                        <div style={{"display": "flex", "flexShrink": "0"}}>
                                            <div style={{"flexShrink": "0", "display": "flex", "flexDirection": "column"}}>
                                                <Expandingpill
                                                    open={this.props.step === (i + 1)}
                                                    title={elem.title}
                                                    n={i + 1}
                                                    body={elem.body} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        );
    }
});
