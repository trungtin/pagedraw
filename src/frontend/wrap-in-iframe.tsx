/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _l from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { windowMouseMachine } from './DraggingCanvas';
import util from '../util';
import $ from 'jquery';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';

const InsideWrapper = createReactClass({
    displayName: 'IframeInsideWrapper',
    render() {
        return React.createElement(React.Fragment, null, ([
            React.createElement(React.Fragment, {"key": ('render')}, (this.props.render())),
            ...Array.from(((this.props.includeCssUrls != null ? this.props.includeCssUrls : []).map((url, i) => React.createElement("link", {"key": (i), "rel": "stylesheet", "href": (url)}))))
        ]));
    },

    // FIXME: not abstracted away
    childContextTypes: {
        contentWindow: propTypes.object
    },

    getChildContext() {
        let left;
        return _l.extend({}, ((left = (typeof this.props.getChildContext === 'function' ? this.props.getChildContext() : undefined)) != null ? left : {}), {contentWindow: this.props.iframeWindow});
    }});

const defaultExport = {};

defaultExport.WrapInIframe = createReactClass({
    contextTypes: {
        enqueueForceUpdate: propTypes.func
    },

    displayName: 'WrapInIframe',
    render() {
        return React.createElement("iframe", {"style": (_l.extend({border: 'none'}, this.props.style)), "ref": "iframe"});
    },

    enqueueForceUpdate(element) {
        if (this.context.enqueueForceUpdate != null) {
            return this.context.enqueueForceUpdate(element);
        } else {
            return element.forceUpdate();
        }
    },

    componentDidUpdate() {
        if (this._component != null) {
            return this.enqueueForceUpdate(this._component);
        } else {
            return this.enqueueForceUpdate({forceUpdate: callback => this.rerenderFromScratch(callback)});
        }
    },

    componentWillUnmount() {
        return ReactDOM.unmountComponentAtNode(this.refs.iframe.contentWindow.document.getElementById('react-mount-point'));
    },

    componentDidMount() {
        const iframeWindow = this.refs.iframe.contentWindow;

        const mount_point = iframeWindow.document.createElement('div');
        mount_point.id = 'react-mount-point';

        // Normalize iframe CSS
        _l.extend(mount_point.style, {display: 'flex', height: '100%'});
        _l.extend(iframeWindow.document.body.style, {margin: '0px', height: '100%'});

        iframeWindow.document.body.appendChild(mount_point);

        return (typeof this.props.registerIframe === 'function' ? this.props.registerIframe(this.refs.iframe) : undefined);
    },

    rerenderFromScratch(callback) {
        const iframeWindow = this.refs.iframe.contentWindow;
        const elem = React.createElement(InsideWrapper, {"includeCssUrls": (this.props.includeCssUrls), "ref": (o => { return this._component = o; }),  
            "iframeWindow": (iframeWindow), "render": (this.props.render), "getChildContext": (this.props.getChildContext)});
        return ReactDOM.render(elem, iframeWindow.document.getElementById('react-mount-point'), callback);
    }
});
export default defaultExport;
