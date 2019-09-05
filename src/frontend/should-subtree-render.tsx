let ShouldSubtreeRender;
import React from 'react';
import createReactClass from 'create-react-class';

export default ShouldSubtreeRender = createReactClass({
    displayName: 'ShouldSubtreeRender',
    shouldComponentUpdate(nextProps) { return nextProps.shouldUpdate; },
    render() { return this.props.subtree(); }
});
