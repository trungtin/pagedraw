_ = require 'underscore'
_l = require 'lodash'
React = require 'react'
createReactClass = require 'create-react-class'

SelectOnClick = require './select-on-click'

module.exports = CodeShower = createReactClass
    displayName: 'CodeShower'
    render: ->
        React.createElement(SelectOnClick, null,
            React.createElement("pre", Object.assign({},  @props),
                (@props.content)
            )
        )
