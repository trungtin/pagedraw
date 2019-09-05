/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import config from '../config';
const defaultExport = {};

// Returns whether track was succesful
defaultExport.track = function(...args) {
    if (config.logOnAnalytics) {
        console.log("Tracking event");
        console.log(args);
    }

    if (config.environment === 'production') {
        if (window.analytics != null) {
            window.analytics.track(...Array.from(args || []));
            return true;

        } else {
            return false;
        }
    } else {
        return true;
    }
};
export default defaultExport;
