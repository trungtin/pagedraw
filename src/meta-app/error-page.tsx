// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import createReactClass from 'create-react-class';
import { Helmet } from 'react-helmet';
import config from '../config';
import Banner from '../pagedraw/banner';

export default createReactClass({
    render() {
        return (
            <div
                style={{display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2em'}}>
                <Helmet>
                    <meta
                        name="viewport"
                        content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
                </Helmet>
                <div style={{flex: 1}}>
                    {config.errorPageHasPagedrawBanner ?
                            <Banner
                                username={window.pd_params.current_user != null ? window.pd_params.current_user.name : undefined} /> : undefined}
                    <div className="bootstrap" style={{textAlign: 'center', marginTop: 150}}>
                        <img
                            src="https://documentation.pagedraw.io/img/down_pagedog.png"
                            style={{width: "80%", maxWidth: 900}} />
                        <h3>
                            {this.props.message}
                        </h3>
                        {(this.props.detail != null) ? <p style={{maxWidth: 800, margin: 'auto'}}>
                            {this.props.detail}
                        </p> : undefined}
                        {this.props.children}
                    </div>
                </div>
                <footer style={{textAlign: 'center', fontFamily: 'Lato', margin: '2em'}}>
                    <hr style={{width: '80%', maxWidth: 900}} />
                    {`\
        Pagedraw — `}
                    <a href="https://pagedraw.io/">
                        pagedraw.io
                    </a>
                    {" | "}
                    <a href="https://documentation.pagedraw.io/">
                        documentation
                    </a>
                </footer>
            </div>
        );
    }
});
