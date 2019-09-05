React = require 'react'
createReactClass = require 'create-react-class'
ToggleIcon = require './toggle-icon'

module.exports = createReactClass
    displayName: 'LockToggle'

    render: ->
        checkedIcon = React.createElement("i", {"className": "locker material-icons md-14 md-dark"}, "lock_outline")
        uncheckedIcon = uncheckedIcon = React.createElement("i", {"className": "locker material-icons md-14 md-dark"}, "lock_open")
        React.createElement(ToggleIcon, {"valueLink": (@props.valueLink), "checkedIcon": (checkedIcon), "uncheckedIcon": (uncheckedIcon)})
