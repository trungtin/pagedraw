// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Generated by https://pagedraw.io/pages/11538
import React from 'react';

import Createlibrary from './createlibrary';


const render = function() {
    return (
        <div className="pd-onhover-parent createlibrarycard">
            <style
                dangerouslySetInnerHTML={{__html: `\
        @import url('https://fonts.googleapis.com/css?family=Lato:');

        .createlibrarycard {
            display: flex;
            flex-grow: 1;
        }

        .createlibrarycard-default-5 {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .createlibrarycard-0-0-0 {
            display: flex;
            flex-shrink: 0;
        }

        .createlibrarycard-rectangle-6 {
            display: flex;
            flex-direction: column;
            padding-top: 9px;
            padding-bottom: 10px;
            border-radius: 5px;
            box-shadow: 0px 2px 20px 0px rgb(215, 215, 215);
            cursor: default;
            background: rgb(255, 255, 255);
            border: 1px solid rgb(255, 255, 255);
        }

        .createlibrarycard-0-0-0-0-0 {
            display: flex;
            flex-shrink: 0;
            padding-left: 10px;
            padding-right: 10px;
        }

        .createlibrarycard-build_your_own_library_-1 {
            width: 283px;
            flex-shrink: 0;
            font-family: "Lato", sans-serif;
            color: rgb(47, 47, 47);
            font-size: 28px;
            line-height: 32px;
            letter-spacing: 0px;
            font-weight: bold;
            font-style: normal;
            text-decoration: none;
            text-align: left;
            word-wrap: break-word;
        }

        .createlibrarycard-0-0-0-0-1 {
            display: flex;
            flex-shrink: 0;
            margin-top: 9px;
            padding-left: 9px;
            padding-right: 10px;
        }

        .createlibrarycard-import_your_existing_code_components_into_a_pagedraw_library_or_create_a_new_one_-5 {
            width: 190px;
            flex-shrink: 0;
            font-family: "Lato", sans-serif;
            color: rgb(107, 107, 107);
            font-size: 14px;
            line-height: 16px;
            letter-spacing: 0px;
            font-weight: normal;
            font-style: normal;
            text-decoration: none;
            text-align: left;
            word-wrap: break-word;
        }

        .createlibrarycard-0-0-0-0-1-1 {
            display: flex;
            flex-direction: column;
            margin-left: 10px;
            padding-top: 13px;
            padding-bottom: 12px;
        }

        .createlibrarycard-0-0-0-0-1-1-0 {
            display: flex;
            flex-shrink: 0;
        }

        .createlibrarycard-createlibrary-4 {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
        }

        .createlibrarycard-_hover-9 {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .createlibrarycard-1-0 {
            display: flex;
            flex-shrink: 0;
        }

        .createlibrarycard-rectangle-8 {
            display: flex;
            flex-direction: column;
            padding-top: 9px;
            padding-bottom: 10px;
            border-radius: 5px;
            box-shadow: 0px 2px 30px 2px rgb(215, 215, 215);
            cursor: default;
            background: rgb(255, 255, 255);
            border: 1px solid rgb(255, 255, 255);
        }

        .createlibrarycard-1-0-0-0 {
            display: flex;
            flex-shrink: 0;
            padding-left: 10px;
            padding-right: 10px;
        }

        .createlibrarycard-build_your_own_library_-5 {
            width: 283px;
            flex-shrink: 0;
            font-family: "Lato", sans-serif;
            color: rgb(47, 47, 47);
            font-size: 28px;
            line-height: 32px;
            letter-spacing: 0px;
            font-weight: bold;
            font-style: normal;
            text-decoration: none;
            text-align: left;
            word-wrap: break-word;
        }

        .createlibrarycard-1-0-0-1 {
            display: flex;
            flex-shrink: 0;
            margin-top: 9px;
            padding-left: 9px;
            padding-right: 10px;
        }

        .createlibrarycard-import_your_existing_code_components_into_a_pagedraw_library_or_create_a_new_one_-9 {
            width: 190px;
            flex-shrink: 0;
            font-family: "Lato", sans-serif;
            color: rgb(107, 107, 107);
            font-size: 14px;
            line-height: 16px;
            letter-spacing: 0px;
            font-weight: normal;
            font-style: normal;
            text-decoration: none;
            text-align: left;
            word-wrap: break-word;
        }

        .createlibrarycard-1-0-0-1-1 {
            display: flex;
            flex-direction: column;
            margin-left: 10px;
            padding-top: 13px;
            padding-bottom: 12px;
        }

        .createlibrarycard-1-0-0-1-1-0 {
            display: flex;
            flex-shrink: 0;
        }

        .createlibrarycard-createlibrary_instance-2 {
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
        `}} />
            {(('default') === "default") ?
                    <div className="createlibrarycard-default-5">
                        <div className="createlibrarycard-0-0-0">
                            <div className="createlibrarycard-rectangle-6">
                                <div className="createlibrarycard-0-0-0-0-0">
                                    <div className="createlibrarycard-build_your_own_library_-1">
                                        {`\
            Build your own library\
            `}
                                    </div>
                                </div>
                                <div className="createlibrarycard-0-0-0-0-1">
                                    <div
                                        className="createlibrarycard-import_your_existing_code_components_into_a_pagedraw_library_or_create_a_new_one_-5">
                                        {`\
            Import your existing code components into a Pagedraw library or create a new one\
            `}
                                    </div>
                                    <div className="createlibrarycard-0-0-0-0-1-1">
                                        <div className="createlibrarycard-0-0-0-0-1-1-0">
                                            <div
                                                onClick={this.props.onClick}
                                                className="createlibrarycard-createlibrary-4">
                                                <Createlibrary />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : undefined}
            <div className="pd-onhover createlibrarycard-_hover-9">
                <div className="createlibrarycard-1-0">
                    <div className="createlibrarycard-rectangle-8">
                        <div className="createlibrarycard-1-0-0-0">
                            <div className="createlibrarycard-build_your_own_library_-5">
                                {`\
        Build your own library\
        `}
                            </div>
                        </div>
                        <div className="createlibrarycard-1-0-0-1">
                            <div
                                className="createlibrarycard-import_your_existing_code_components_into_a_pagedraw_library_or_create_a_new_one_-9">
                                {`\
        Import your existing code components into a Pagedraw library or create a new one\
        `}
                            </div>
                            <div className="createlibrarycard-1-0-0-1-1">
                                <div className="createlibrarycard-1-0-0-1-1-0">
                                    <div
                                        onClick={this.props.onClick}
                                        className="createlibrarycard-createlibrary_instance-2">
                                        <Createlibrary />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default props => render.apply({props});
