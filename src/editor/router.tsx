/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ErrorPage;
import '../frontend/verify-browser-excludes';
import '../frontend/requestIdleCallbackPolyfill';
import 'promise.prototype.finally';
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import _l from 'lodash';
import config from '../config';

// Flip on Electron mode if we detect we're running in Electron
if (__guard__(window.process != null ? window.process.versions : undefined, x => x.electron) != null) {
    window.is_electron = true;
    window.document.body.classList.add('electron');
    if (window.Rollbar != null) {
        window.Rollbar.configure({payload: {client: {javascript: {browser: "Electron/1.0"}}}});
    }
}

// be big meanies and not play nicely on all browsers
const browser = require('browser-detect')();
window.pd_params.mobile = browser.mobile;

if (browser.mobile && ['editor', 'pd_playground'].includes(window.pd_params.route)) {
    ErrorPage = require('../meta-app/error-page');
    ReactDOM.render(React.createElement(ErrorPage, { 
        "message": "Sorry, our editor isn't optimized for mobile yet",  
        "detail": "Try opening this link in Chrome on a laptop or desktop!"
    }), document.getElementById('app'));


} else if (!browser.mobile && (browser.name !== 'chrome') && ['editor', 'pd_playground', 'stackblitz'].includes(window.pd_params.route)) {
    ErrorPage = require('../meta-app/error-page');
    ReactDOM.render(React.createElement(ErrorPage, { 
        "message": "Sorry, our editor is optimized for Chrome",  
        "detail": (
            React.createElement("span", null, "Try opening this link in Chrome! Alternatively, you can also get ", React.createElement("a", {"href": "https://documentation.pagedraw.io/electron"}, "the desktop app"), ".")
        )
    }), document.getElementById('app'));


} else if (window.pd_params.route === 'play') {
    require('./play-prototype').run();

} else {
    let ModalComponent, registerModalSingleton;
    const {Tabs, Tab, Modal, PdButtonOne} = require('./component-lib');
    const modal = ({ModalComponent, registerModalSingleton} = require('../frontend/modal'));
    const analytics = require('../frontend/analytics');

    // NOTE: Requiring './edit-page' has to happen inside the functions below
    // otherwise we require that code for - say - the meta-app as well,
    // which doesn't need it
    const pages = {
        editor() { return require('./edit-page').Editor; },
        pd_playground() { return require('./pd-playground'); },
        stackblitz() { return require('../meta-app/blitz'); },
        dashboard() { return require('../meta-app/dashboard'); },
        new_project() { return require('../meta-app/new-project'); },
        atom_integration() { return require('../ide-integrations/pd-atom'); },
        electron_app() { return require('../ide-integrations/electron-app'); }
    };

    const AppWrapper = createReactClass({
        render() {
            const Route = pages[this.props.route]();
            return React.createElement("div", null,
                React.createElement(ModalComponent, {"ref": "modal"}),
                React.createElement(Route, Object.assign({},  window.pd_params ))
            );
        },

        componentDidMount() {
            return registerModalSingleton(this.refs.modal);
        }
    });

    const CrashView = createReactClass({
        render() {
            return React.createElement("div", null,
                React.createElement("div", {"className": "bootstrap"},
                    React.createElement("div", {"ref": "container"})
                ),
                ( this.state.mounted ?
                    React.createElement(Modal, {"show": true, "container": (this.refs.container)},
                        React.createElement(Modal.Header, null,
                            React.createElement(Modal.Title, null, "Pagedraw crashed")
                        ),
                        React.createElement(Modal.Body, null,
                            React.createElement("p", null, "Pagedraw crashed and we were unable to recover.  You can try reloading the page."),
                            (!this.props.logged_crash ?
                                React.createElement("p", null, `\
We weren’t able to log the crash, likely because an ad blocker is stopping our analytics.  Please describe the crash to us over Intercom in as much detail as possible, or consider disabling your ad blocker. (We’re obviously never going to show you ads)\
`) : undefined
                            ),
                            (!window.electron ?
                                React.createElement("p", null, `\
This problem might be due to one of your browser plugins or extensions interacting with our app. Consider using our `, React.createElement("a", {"href": "https://documentation.pagedraw.io/electron"}, "desktop app"), ` to avoid these issues.
\
`) : undefined
                            )
                        ),
                        React.createElement(Modal.Footer, null,
                            React.createElement(PdButtonOne, {"type": "primary", "onClick": (() => { return window.location = window.location; })}, "Refresh")
                        )
                    ) : undefined
                )
            );
        },

        getInitialState() {
            return {mounted: false};
        },

        componentDidMount() {
            return this.setState({mounted: true});
        }
    });

    let already_unrecoverably_failed = false;


    const blocked_analytics_msg = `\
Pagedraw crashed, but your ad blocker is preventing us from tracking it.
Please let us know about it via intercom, or consider disabling your ad blocker
for this domain (we're obviously never going to show you ads).\
`;

    const unrecoverably_fail = function() {
        const logged_crash = analytics.track("Hard crashed", window.pd_params);
        already_unrecoverably_failed = true;
        const modalRoot = document.createElement('div');
        document.body.appendChild(modalRoot);
        return ReactDOM.render(React.createElement(CrashView, {"logged_crash": (logged_crash)}), modalRoot);
    };


    // last_crash_timestamp :: unix timestamp | null
    let last_crash_timestamp = null;

    let crash_count = 0;

    // if we ever get an uncaught error, throw up this modal that we've crashed
    const onError = function(handler) {
        if (process.env.NODE_ENV !== 'development') {
            return window.addEventListener('error', handler);

        } else {
            // react@16 in dev mode will take issue with the unmounting our handler does.
            // React16's re-throwing happens synchronously, and there's a concurrency
            // issue with unmounting a component during it's render (or something).
            // We avoid this by defering the unmount.
            // React@16 dev mode also does this weird re-throwing thing.  We counter by
            // ignoring all but the first error.
            // While this is okay for now because we're eating the errors anyway,
            // I would never allow this outside dev mode.
            let pending_error = false;
            return window.addEventListener('error', function(evt) {
                if (pending_error) { return; }
                pending_error = true;
                return window.setTimeout(function() {
                    pending_error = false;
                    return handler(evt);
                });
            });
        }
    };

    onError(function(evt) {
        if (__guard__(evt != null ? evt.error : undefined, x1 => x1.stack.search('__evalBundleWrapperForErrorDetector')) >= 0) {
            console.warn(`User code error: ${evt.error.message}`);
            return;
        }

        if (!config.refreshOnUncaughtErrors) { return; }
        if (already_unrecoverably_failed) { return; }

        // note the failure.  Rollbar should pick it up as well, elsewhere.
        crash_count += 1;
        if (!analytics.track("Soft crashed", _l.extend({}, window.pd_params, {crash_count}))) { console.log(blocked_analytics_msg); }
        console.error(`pagedraw crashed x${crash_count}`);
        if (typeof window.didEditorCrashBeforeLoading === 'function') {
            window.didEditorCrashBeforeLoading(true);
        }

        // If we get in an asynchronous crash-recover-crash loop, try to catch it
        // based on if the crashes are less than 3 seconds apart.  If we catch it,
        // hard crash.
        const now = (new Date()).getTime();
        if (last_crash_timestamp && (now < (last_crash_timestamp + config.milisecondsBetweenCrashesBeforeWeHardCrash))) {
            unrecoverably_fail();
            return;
        }
        last_crash_timestamp = now;

        try {
            window.crash_recovery_state = typeof window.get_recovery_state_after_crash === 'function' ? window.get_recovery_state_after_crash() : undefined;
        } catch (error) {}

        try { // recovering
            // get the app dom root
            const domRoot = document.getElementById('app');

            // teardown the app
            ReactDOM.unmountComponentAtNode(domRoot);

            // clear potentially lingering state
            require('../frontend/DraggingCanvas').windowMouseMachine.reset();

            // try to recover
            ReactDOM.render(React.createElement(AppWrapper, {"route": (window.pd_params.route)}), domRoot);

        } catch (error1) { // a failure to recover
            unrecoverably_fail();
        }

        return delete window.crash_recovery_state;
    });

    ReactDOM.render(React.createElement(AppWrapper, {"route": (window.pd_params.route)}), document.getElementById('app'));
}

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}