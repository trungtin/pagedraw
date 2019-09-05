React = require 'react'
createReactClass = require 'create-react-class'
{Helmet} = require 'react-helmet'

config = require '../config'
Banner = require '../pagedraw/banner'

module.exports = createReactClass
    render: ->
        React.createElement("div", {"style": (display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2em')},
            React.createElement(Helmet, null,
                React.createElement("meta", {"name": "viewport", "content": "width=device-width; initial-scale=1.0; maximum-scale=1.0;"})
            ),
            React.createElement("div", {"style": (flex: 1)},
                (if config.errorPageHasPagedrawBanner
                    React.createElement(Banner, {"username": (window.pd_params.current_user?.name)})
                ),
                React.createElement("div", {"className": "bootstrap", "style": (textAlign: 'center', marginTop: 150)},
                    React.createElement("img", {"src": "https://documentation.pagedraw.io/img/down_pagedog.png", "style": (width: "80%", maxWidth: 900)}),
                    React.createElement("h3", null, (@props.message)),
                    (React.createElement("p", {"style": (maxWidth: 800, margin: 'auto')}, (@props.detail)) if @props.detail?),
                    (@props.children)
                )
            ),
            React.createElement("footer", {"style": (textAlign: 'center', fontFamily: 'Lato', margin: '2em')},
                React.createElement("hr", {"style": (width: '80%', maxWidth: 900)}), """
                Pagedraw — """, React.createElement("a", {"href": "https://pagedraw.io/"}, "pagedraw.io"), " | ", React.createElement("a", {"href": "https://documentation.pagedraw.io/"}, "documentation")
            )
        )
