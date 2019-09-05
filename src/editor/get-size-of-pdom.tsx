// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let getSizeOfPdom, mountReactElement;
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import { assert } from '../util';
import { WindowContextProvider, pdomToReact } from './pdom-to-react';

let check = 0;

const defaultExport = {};

defaultExport.mountReactElement = (mountReactElement = function(element, mount_point) {
    check = 1;

    // This assumes ReactDOM.render is synchronous so we can synchronously return.  This
    // assumption might not be true in future versions of React so I'm adding a test that
    // throws if you try to update our version of React. (GLG 07/05/2017)
    //
    // NOTE: We used to wrap element in a GeometryGetter component and wait for componentDidMount
    // React has a weird behavior where componentDidMount gets fired *before* the child error boundary finishes
    // rerendering after catching the error. Now we have to call ReactDOM.render and do ReactDOM.findDOMNode after
    // it because that's the only way we can do this synchronously.
    const component = ReactDOM.render(element, mount_point, function() {
        if (check !== 1) {
            throw new Error('Get size of react element is not synchronous');
        }
        return check = 2;
    });

    if (check !== 2) {
        throw new Error('Get size of react element is not synchronous');
    }
    check = 0;

    assert(() => ReactDOM.findDOMNode(component) != null);

    return ReactDOM.findDOMNode(component);
});

const getSizeOfReactElement = function(element, mount_point) {
    const retVal = mountReactElement(element, mount_point).getBoundingClientRect();
    ReactDOM.unmountComponentAtNode(mount_point);
    return retVal;
};


defaultExport.getSizeOfPdom = (getSizeOfPdom = (pdom, offscreen_node) => getSizeOfReactElement(React.createElement(WindowContextProvider, {"window": (window)}, (pdomToReact(pdom))), offscreen_node));
export default defaultExport;
