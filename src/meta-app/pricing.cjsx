React = require 'react'
createReactClass = require 'create-react-class'
propTypes = require 'prop-types'
ReactDOM = require 'react-dom'
PagedrawnPricing = require '../pagedraw/pricing'

PricingDesktop = createReactClass
    render: ->
        React.createElement(PagedrawnPricing, null)

module.exports = PricingDesktop
