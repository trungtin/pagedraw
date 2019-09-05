// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let editorReactStylesForPdom, pdomToReact, pdomToReactWithPropOverrides;
import _ from 'underscore';
import _l from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import { assert } from '../util';
import { isExternalComponent } from '../libraries';
import Dynamic from '../dynamic';
import { renderExternalInstance } from '../libraries';
import { styleForDiv, htmlAttrsForPdom } from '../pdom';
const defaultExport = {};

defaultExport.editorReactStylesForPdom = (editorReactStylesForPdom= function(pdom) {
    const styles = styleForDiv(pdom);

    // remove relative urls
    // we get a fresh object from styleForDiv, so we can safely mutate here
    // in the editor, only show images in ImageBlocks with absolute URLs
    // Otherwise we get a lot of 404s on https://pagedraw.io/pages/undefined
    const URL_VALUE_REGEX = /url\s*\((('.*')|(".*"))\)/;
    const ABSOLUTE_URL_VALUE_REGEX = /url\s*\((('http(s?):\/\/.*')|("http(s?):\/\/.*"))\)/;
    for (let key of Array.from(Object.keys(styles))) {
        const value = styles[key];
        if (_l.isString(value) && value.match(URL_VALUE_REGEX) && !value.match(ABSOLUTE_URL_VALUE_REGEX)) {
            delete styles[key];
        }
    }

    return styles;
});

const escapedHTMLForTextContent = function(textContent) {
    // differs from the implementation of the same in core because in core we have to escape stuff like
    // spaces into `&nbsp;`, while React takes care of that for us.  Also we're returning ReactElement-ishes
    // where core's returning a string
    const escapedLines = textContent.split('\n');
    if (escapedLines.length === 1) { return escapedLines[0]; }
    return escapedLines.map(function(line, i) { if (_l.isEmpty(line)) { return React.createElement("br", {"key": (i)}); } else { return React.createElement("div", {"key": (i)}, (line)); } });
};

// Note: In React 16.4.1
const ExternalInstanceErrorBoundary = createReactClass({
    displayName: 'ExternalInstanceErrorBoundary',

    getInitialState() {
        return {error: null};
    },

    render() {
        if (this.state.error != null) {
            return React.createElement("div", {"style": ({flexGrow: '1', padding: '0.5em', backgroundColor: '#ff7f7f', overflow: 'hidden'})},
                (this.state.error.message)
            );
        }

        return this.props.children;
    },

    componentDidCatch(error) {
        return this.setState({error});
    }
});

defaultExport.WindowContextProvider = createReactClass({
    displayName: 'WindowContextProvider',
    childContextTypes: {
        contentWindow: propTypes.object
    },
    getChildContext() {
        return {contentWindow: this.props.window};
    },

    render() {
        return this.props.children;
    }
});


const ExternalInstanceRenderer = createReactClass({
    displayName: 'ExternalInstanceRenderer',

    contextTypes: {
        contentWindow: propTypes.object
    },

    render() {
        // There should be a contentWindow in the context here but if there isn't in prod
        // we just use regular window and keep going
        assert(() => (this.context.contentWindow != null));
        return renderExternalInstance((this.context.contentWindow != null ? this.context.contentWindow : window), this.props.instanceRef, this.props.props);
    }
}); // <3 @props.props


defaultExport.pdomToReact = (pdomToReact = function(pdom, key) {
    // Does not put editors or contentEditors on screen; ignores backingBlocks

    if (key == null) { key = undefined; }
    const props = _l.extend(htmlAttrsForPdom(pdom), {style: editorReactStylesForPdom(pdom)}, {key});
    props.className = props.class;
    delete props.class;

    const Tag = pdom.tag;

    if (isExternalComponent(Tag)) {
        // External component props come through pdom.props, not through the regular htmlAttrs way
        assert(() => _l.isEmpty(htmlAttrsForPdom(pdom)) && _l.isEmpty(editorReactStylesForPdom(pdom)) && _l.isEmpty(props.className));
        return React.createElement(ExternalInstanceErrorBoundary, {"key": (key)},
            React.createElement(ExternalInstanceRenderer, {"instanceRef": (Tag.componentSpec.ref), "props": (pdom.props)})
        );

    // Allowing innerHTML in the editor is a security vulnerability
    } else if (pdom.innerHTML != null) {
        throw new Error("innerHTML is bad");

    } else if (!_l.isEmpty(pdom.textContent)) {
        return React.createElement(Tag, Object.assign({},  props), (escapedHTMLForTextContent(pdom.textContent)));

    } else if (!_.isEmpty(pdom.children)) {
        return React.createElement(Tag, Object.assign({},  props), (pdom.children.map((child, i) => pdomToReact(child, i))));

    } else {
        return React.createElement(Tag, Object.assign({},  props ));
    }
});

// Exact same as the above but with prop overrides
// note that map_props takes ownership of the props object, and thus may mutate or destroy it
defaultExport.pdomToReactWithPropOverrides = (pdomToReactWithPropOverrides = function(
    pdom,
    key,
    map_props
) {
    // Does not put editors or contentEditors on screen; ignores backingBlocks

    if (key == null) { key = undefined; }
    if (map_props == null) { map_props = (pdom, props) => props; }
    let props = _l.extend(htmlAttrsForPdom(pdom), {style: editorReactStylesForPdom(pdom)}, {key});
    props.className = props.class;
    delete props.class;

    props = map_props(pdom, props);

    const Tag = pdom.tag;

    if (isExternalComponent(Tag)) {
        // External component props come through pdom.props, not through the regular htmlAttrs way
        assert(() => _l.isEmpty(htmlAttrsForPdom(pdom)) && _l.isEmpty(editorReactStylesForPdom(pdom)) && _l.isEmpty(props.className));
        return React.createElement(ExternalInstanceErrorBoundary, {"key": (key)},
            React.createElement(ExternalInstanceRenderer, {"instanceRef": (Tag.componentSpec.ref), "props": (pdom.props)})
        );

    // Allowing innerHTML in the editor is a security vulnerability
    } else if (pdom.innerHTML != null) {
        throw new Error("innerHTML is bad");

    } else if (!_l.isEmpty(pdom.textContent)) {
        return React.createElement(Tag, Object.assign({},  props), (escapedHTMLForTextContent(pdom.textContent)));

    } else if (!_.isEmpty(pdom.children)) {
        return React.createElement(Tag, Object.assign({},  props), (pdom.children.map((child, i) => pdomToReactWithPropOverrides(child, i, map_props))));

    } else {
        return React.createElement(Tag, Object.assign({},  props ));
    }
});
export default defaultExport;
