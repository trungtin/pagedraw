// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Generated by https://pagedraw.io/pages/11538
import React from 'react';


const render = function() {
    return (
        <div className="installationhuge">
            <style
                dangerouslySetInnerHTML={{__html: `\
        @import url('https://fonts.googleapis.com/css?family=Lato:');

        .installationhuge {
            display: flex;
            flex-grow: 1;
        }

        .installationhuge-installed-0 {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .installationhuge-0-0-0 {
            display: flex;
            flex-shrink: 0;
        }

        .installationhuge-rectangle_3 {
            display: flex;
            flex-direction: column;
            padding-top: 6px;
            padding-bottom: 7px;
            border-radius: 30px;
            cursor: default;
            background: rgb(115, 201, 78);
        }

        .installationhuge-0-0-0-0-0 {
            display: flex;
            flex-shrink: 0;
            padding-left: 9px;
            padding-right: 9px;
        }

        .installationhuge-installed_-8 {
            width: 94px;
            flex-shrink: 0;
            font-family: "Lato", sans-serif;
            color: rgb(255, 255, 255);
            font-size: 15px;
            line-height: 17px;
            letter-spacing: 0px;
            font-weight: normal;
            font-style: normal;
            text-decoration: none;
            text-align: center;
            word-wrap: break-word;
        }

        .installationhuge-default-1 {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .installationhuge-1-0-0 {
            display: flex;
            flex-shrink: 0;
        }

        .installationhuge-rectangle_3-1 {
            display: flex;
            flex-direction: column;
            padding-top: 6px;
            padding-bottom: 7px;
            border-radius: 30px;
            cursor: pointer;
            background: rgb(57, 150, 253);
        }

        .installationhuge-1-0-0-0-0 {
            display: flex;
            flex-shrink: 0;
            padding-left: 9px;
            padding-right: 9px;
        }

        .installationhuge-add_to_app_-2 {
            width: 94px;
            flex-shrink: 0;
            font-family: "Lato", sans-serif;
            color: rgb(255, 255, 255);
            font-size: 15px;
            line-height: 17px;
            letter-spacing: 0px;
            font-weight: normal;
            font-style: normal;
            text-decoration: none;
            text-align: center;
            word-wrap: break-word;
        }

        .installationhuge-upgrade-5 {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        .installationhuge-2-0-0 {
            display: flex;
            flex-shrink: 0;
        }

        .installationhuge-rectangle_3-3 {
            display: flex;
            flex-direction: column;
            padding-top: 6px;
            padding-bottom: 7px;
            border-radius: 30px;
            cursor: pointer;
            background: rgb(78, 84, 201);
        }

        .installationhuge-2-0-0-0-0 {
            display: flex;
            flex-shrink: 0;
            padding-left: 9px;
            padding-right: 9px;
        }

        .installationhuge-_upgrade_-7 {
            width: 94px;
            flex-shrink: 0;
            font-family: "Lato", sans-serif;
            color: rgb(255, 255, 255);
            font-size: 15px;
            line-height: 17px;
            letter-spacing: 0px;
            font-weight: normal;
            font-style: normal;
            text-decoration: none;
            text-align: center;
            word-wrap: break-word;
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
            {((this.props.installed) === "installed") ?
                    <div className="installationhuge-installed-0">
                        <div className="installationhuge-0-0-0">
                            <div className="installationhuge-rectangle_3">
                                <div className="installationhuge-0-0-0-0-0">
                                    <div className="installationhuge-installed_-8">
                                        {`\
            Installed\
            `}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : undefined}
            {((this.props.installed) === "default") ?
                    <div className="installationhuge-default-1">
                        <div className="installationhuge-1-0-0">
                            <div onClick={this.props.onClick} className="installationhuge-rectangle_3-1">
                                <div className="installationhuge-1-0-0-0-0">
                                    <div className="installationhuge-add_to_app_-2">
                                        {`\
            Add to app\
            `}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : undefined}
            {((this.props.installed) === "upgrade") ?
                    <div className="installationhuge-upgrade-5">
                        <div className="installationhuge-2-0-0">
                            <div onClick={this.props.onClick} className="installationhuge-rectangle_3-3">
                                <div className="installationhuge-2-0-0-0-0">
                                    <div className="installationhuge-_upgrade_-7">
                                        {`\
            + Upgrade \
            `}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : undefined}
        </div>
    );
};

export default props => render.apply({props});
