/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FormControl;
import React from 'react';
import createReactClass from 'create-react-class';
import _l from 'lodash';
import _ from 'underscore';

const debounce = (wait_ms, fn) => _.debounce(fn, wait_ms);

export default FormControl = createReactClass({
    render() {
        const passthrough_props = _l.omit(this.props, ['valueLink', 'tag', 'debounced']);

        // checkbox is weird with checkedLink, so just special case it
        if (this.props.type === 'checkbox') {
            // use <FormControl type="checkbox" label="foo" /> to make an <input type="checkbox" value="foo" />
            const label = passthrough_props['label'];
            delete passthrough_props['label'];

            return React.createElement("input", Object.assign({"type": "checkbox", "value": (label), "title": (label),  
                "checked": (this.props.valueLink.value != null ? this.props.valueLink.value : false),  
                "onChange": (this.onCheckedChanged)
                }, passthrough_props ));
        }

        const Tag = this.props.tag != null ? this.props.tag : 'input';
        return React.createElement(Tag, Object.assign({"value": (this._internalValue != null ? this._internalValue : ''), "onChange": (this.onChange)}, passthrough_props ));
    },

    onCheckedChanged(evt) {
        return this.props.valueLink.requestChange(evt.target.checked);
    },

    componentWillMount() {
        if (this.props.debounced && (this.props.type === 'checkbox')) {
            throw new Error('Checkbox debouncing not supported');
        }

        this._internalValue = this.props.valueLink.value;
        if (this._expectedExternalValue == null) { this._expectedExternalValue = this.props.valueLink.value != null ? this.props.valueLink.value : ""; }

        return this.debouncedRequestChange = debounce(200, () => {
            const new_value = this._internalValue;

            // no-op if the value hasn't actually changed
            if (new_value === this._expectedExternalValue) { return; }

            // update our belief of what the external state should be
            this._expectedExternalValue = new_value;

            // No need to requestChange if the external value is already what we want
            if (this._expectedExternalValue === this.props.valueLink.value) { return; }

            // push the new value back out
            return this.props.valueLink.requestChange(this._expectedExternalValue);
        });
    },

    onChange(evt) {
        // But update the internalValue on any onChange
        this._internalValue = evt.target.value;
        if (this.props.debounced) {
            this.debouncedRequestChange();
            return this.forceUpdate();
        } else {
            return this.props.valueLink.requestChange(this._internalValue);
        }
    },

    componentWillReceiveProps(new_props) {
        // no-op if the value we should be (from props) is what we already are
        if (new_props.valueLink.value !== this._expectedExternalValue) {
            // record our new internal state
            this._internalValue = new_props.valueLink.value;
            return this._expectedExternalValue = new_props.valueLink.value;
        }
    },

    componentWillUnmount() {
        if ((this._internalValue != null) && (this._internalValue !== this.props.valueLink.value)) {
            return window.requestIdleCallback(() => {
                return this.props.valueLink.requestChange(this._internalValue);
            });
        }
    }
});
