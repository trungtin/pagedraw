// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import config from '../config';

// NOTE: This class doesnt try to make any guarantees about what will happen when
// a shadow dom gets in between two divs, CSS/layout-wise. It's up to the user to
// make sure the CSS works.
//
// It might be possible to make
// <A><ShadowDOM><B/></ShadowDOM></A>
// always CSS equal to
// <A><B/></A>
// but I don't know how to do that
export default createReactClass({
    contextTypes: {
        enqueueForceUpdate: propTypes.func
    },

    render() {
        return <div className="shadow-host" ref="shadowHost" />;
    },

    componentDidUpdate() {
        return this.rerender();
    },

    componentDidMount() {
        this.shadowRoot = this.refs.shadowHost.attachShadow({mode: 'open'});
        return this.rerender();
    },

    rerender() {
        // FIXME: Might want to ReactDOM.render only once here
        const elemWithStyles = <React.Fragment>
            {[
                this.props.children,
                ...Array.from(((this.props.includeCssUrls != null ? this.props.includeCssUrls : []).map((url, i) => <link key={i} rel="stylesheet" href={url} />)))
            ]}
        </React.Fragment>;
        return this.context.enqueueForceUpdate({
            forceUpdate: callback => ReactDOM.render(elemWithStyles, this.shadowRoot, callback)
        });
    }});
