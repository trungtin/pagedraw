/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import React from 'react';
import createReactClass from 'create-react-class';
import _l from 'lodash';
import { default as TheirSplitPane } from 'react-split-pane';
import { assert } from '../util';

export default createReactClass({
    render() {
        assert(() => (this.props.onDragStarted == null));
        assert(() => (this.props.onDragFinished == null));
        return React.createElement("div", null,
            React.createElement(TheirSplitPane, Object.assign({},  this.props, {"onDragStarted": (() => this.setState({draggingPane: true})), "onDragFinished": (() => this.setState({draggingPane: false}))}),
                (this.props.children)
            ),
            (this.state.draggingPane ? React.createElement("div", {"style": ({position: 'fixed', width: '100vw', height: '100vh'})}) : undefined)
        );
    },

    getInitialState() {
        return {draggingPane: false};
    }
});
