// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Generated by https://pagedraw.io/pages/11538
import React from 'react';

import Librarylist from './librarylist';


const render = function() {
    return (
        <div className="libssidebar-libssidebar-3">
            <style
                dangerouslySetInnerHTML={{__html: `\
        @import url('https://fonts.googleapis.com/css?family=Lato:');

        .libssidebar-libssidebar-3 {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            padding-top: 20px;
            background: rgb(251, 251, 251);
        }

        .libssidebar-0 {
            display: flex;
            flex-shrink: 0;
            padding-left: 20px;
            padding-right: 20px;
        }

        .libssidebar-libraries_currently_in_this_project_-5 {
            width: 270px;
            flex-shrink: 0;
            font-family: "Lato", sans-serif;
            color: rgb(0, 0, 0);
            font-size: 22px;
            line-height: 25px;
            letter-spacing: 0px;
            font-weight: bold;
            font-style: normal;
            text-decoration: none;
            text-align: left;
            word-wrap: break-word;
        }

        .libssidebar-1 {
            display: flex;
            flex-shrink: 0;
            margin-top: 12px;
            padding-left: 20px;
            padding-right: 20px;
        }

        .libssidebar-line-7 {
            width: 270px;
            height: 1px;
            flex-shrink: 0;
            background: #D8D8D8;
        }

        .libssidebar-2 {
            display: flex;
            flex-shrink: 0;
            margin-top: 12px;
            padding-left: 20px;
            padding-right: 20px;
        }

        .libssidebar-librarylist-7 {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
        }

        .libssidebar-3 {
            width: 0px;
            flex-shrink: 0;
            flex-grow: 1;
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
        `}} />
            <div className="libssidebar-0">
                <div className="libssidebar-libraries_currently_in_this_project_-5">
                    <div>
                        Libraries currently
                    </div>
                    <div>
                        in this project
                    </div>
                </div>
            </div>
            <div className="libssidebar-1">
                <div className="libssidebar-line-7" />
            </div>
            <div className="libssidebar-2">
                <div className="libssidebar-librarylist-7">
                    <Librarylist libraries={this.props.libraries} />
                </div>
            </div>
            <div className="libssidebar-3" />
        </div>
    );
};

export default props => render.apply({props});
