React = require 'react'
ReactDOM = require 'react-dom'

Pricing = require './pricing'

ReactDOM.render(React.createElement(Pricing, null), document.getElementById('app'))
