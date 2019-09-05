React = require 'react'
createReactClass = require 'create-react-class'
_l = require 'lodash'
TheirSplitPane = (require 'react-split-pane').default
{assert} = require '../util'

module.exports = createReactClass
    render: ->
        assert => not @props.onDragStarted?
        assert => not @props.onDragFinished?
        React.createElement("div", null,
            React.createElement(TheirSplitPane, Object.assign({},  @props, {"onDragStarted": (=> @setState({draggingPane: yes})), "onDragFinished": (=> @setState({draggingPane: no}))}),
                (@props.children)
            ),
            (React.createElement("div", {"style": (position: 'fixed', width: '100vw', height: '100vh')}) if @state.draggingPane)
        )

    getInitialState: ->
        draggingPane: no
