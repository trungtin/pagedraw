// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ShouldSubtreeRender;
import React from 'react';
import createReactClass from 'create-react-class';

export default ShouldSubtreeRender = createReactClass({
    displayName: 'ShouldSubtreeRender',
    shouldComponentUpdate(nextProps) { return nextProps.shouldUpdate; },
    render() { return this.props.subtree(); }
});
