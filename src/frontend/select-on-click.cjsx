React = require 'react'
createReactClass = require 'create-react-class'

module.exports = SelectOnClick = createReactClass
    displayName: 'ExportView'
    render: ->
        React.createElement("div", {"onClick": (@selectSelf), "style": (userSelect: 'auto'), "ref": "children"}, (@props.children))

    selectSelf: ->
        window.getSelection().selectAllChildren(this.refs.children)
