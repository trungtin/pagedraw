React = require 'react'
ReactDOM = require 'react-dom'
_l = require 'lodash'

{Helmet} = require 'react-helmet'

{ModalComponent, registerModalSingleton} = require '../../frontend/modal'
createReactClass = require 'create-react-class'


pages = {
    library_landing: -> require('./landing')
    library_page: -> require('./show')
}

AppWrapper = createReactClass
    render: ->
        Route = pages[@props.route]()
        React.createElement("div", null,
            React.createElement(Helmet, null,
                React.createElement("link", {"rel": "stylesheet", "type": "text/css", "href": "#{window.pd_config.static_server}/library.css"}),
                React.createElement("link", {"rel": "stylesheet", "href": "#{window.pd_config.static_server}/bootstrap-namespaced.css"})
            ),
            React.createElement("div", null,
                React.createElement(ModalComponent, {"ref": "modal"}),
                React.createElement(Route, Object.assign({},  window.pd_params ))
            )
        )

    componentDidMount: ->
        registerModalSingleton(@refs.modal)

ReactDOM.render(React.createElement(AppWrapper, {"route": (window.pd_params.route)}), document.getElementById('app'))
