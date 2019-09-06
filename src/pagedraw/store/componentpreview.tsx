// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Generated by https://pagedraw.io/pages/11538
import React from 'react';

import Componenttitle from './componenttitle';


const render = function() {
    return (
        <div className="componentpreview-componentpreview-5">
            <style
                dangerouslySetInnerHTML={{__html: `\
        .componentpreview-componentpreview-5 {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .componentpreview-0 {
            display: flex;
            flex-shrink: 0;
        }

        .componentpreview-componenttitle_instance-8 {
            flex-grow: 1;
            flex-basis: 0px;
            display: flex;
            flex-direction: column;
        }

        .componentpreview-1 {
            display: flex;
            flex-shrink: 0;
            flex-grow: 1;
            flex-basis: 0px;
            min-height: fit-content;
            margin-top: 15px;
        }

        .componentpreview-rectangle_6 {
            flex-grow: 1;
            flex-basis: 0px;
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
        `}} />
            <div className="componentpreview-0">
                <div className="componentpreview-componenttitle_instance-8">
                    <Componenttitle title={this.props.title} />
                </div>
            </div>
            <div className="componentpreview-1">
                <div className="componentpreview-rectangle_6">
                    {this.props.renderPreview()}
                </div>
            </div>
        </div>
    );
};

export default props => render.apply({props});
