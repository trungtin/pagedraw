/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from 'underscore';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal } from '../editor/component-lib';
const defaultExport = {};

defaultExport.ModalComponent = createReactClass({
    displayName: "ModalSingleton",
    render() {
        // Use explicit React.createElement instead of CJSX so we can
        // pass the contents [ReactElement]s as positional arguments,
        // instead of an array.  When the arguments are positional,
        // React gives them an implicit key (usually something like
        // ".#{i}" where i is the index of the child), and doesn't yell
        // at us about needing a key property for each.
        // We use the CoffeeScript splat operator (...) to use the array
        // @getContents() as a varargs param, like *this.getContents()
        // in Python.  The call is like
        // React.createElement(Modal, props, child[0], child[1], child[2], ...)

        const sharedModal = React.createElement(Modal, {
                show: this.state.open,
                onHide: this.closeModal,
                container: this.refs.container,
                dialogClassName: this.state.dialogClassName
            },
            ...Array.from(this.getContents())
        );

        // Set up an explicit container for the modal so we can apply the
        // 'bootstrap' class.  Without being in a Bootstrap DOM tree,
        // the modal wont function because we've isolated Bootstrap CSS to
        // only apply under elements with `.bootstrap`.
        // By default the container is a fresh div appended to <body>.  We
        // can't seem to add a class to that fresh div, and we don't want
        // to apply .bootstrap to body because that defeats isolation.

        // FIXME sharedModal, above, references @refs.container, which doesn't
        // exist until the component mounts.  The component needs to render
        // at least once before it mounts, which means there's a subtle bug
        // here.  I *believe* it should never be exhibited unless we load the
        // page with a modal open from the start, so for now let's just
        // pretend this works (JRP 6/4/2016)
        return React.createElement("div", null,
            React.createElement("div", {"className": "bootstrap"},
                React.createElement("div", {"ref": "container"})
            ),
            (sharedModal)
        );
    },

    getContents() {
        let left;
        return (left = (typeof this.state.content_fn === 'function' ? this.state.content_fn(this.closeModal) : undefined)) != null ? left : [];
    },

    getInitialState() {
        return {
            open: false,
            content_fn: null,
            onCloseCallback: null
        };
    },

    show(content_fn, onCloseCallback) { return this.showWithClass(undefined, content_fn, onCloseCallback); },

    showWithClass(cssClass, content_fn, onCloseCallback) {
        this.setState({open: true, content_fn, onCloseCallback, dialogClassName: cssClass});
        return this.forceUpdate();
    },

    closeModal() {
        if (typeof this.state.onCloseCallback === 'function') {
            this.state.onCloseCallback();
        }
        return this.setState(this.getInitialState());
    },

    update(callback) {
        if (this.state.open === false) { return callback(); }
        return this.forceUpdate(callback);
    }
});


let singleton = null;

defaultExport.registerModalSingleton = newSingleton => singleton = newSingleton;

defaultExport.show = (content_fn, onCloseCallback=null) => singleton != null ? singleton.show(content_fn, onCloseCallback) : undefined;

defaultExport.showWithClass = (cssClass, content_fn, onCloseCallback=null) => singleton != null ? singleton.showWithClass(cssClass, content_fn, onCloseCallback) : undefined;

defaultExport.forceUpdate = callback => singleton != null ? singleton.update(callback) : undefined;
export default defaultExport;
