// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import modal from './modal';
import config from '../config';

let forceUpdate = (root, callback) => root.forceUpdate(() => modal.forceUpdate(() => callback()));

if ((process.env.NODE_ENV !== 'production') && config.reactPerfRecording) {
    // Perf = require 'react-addons-perf'

    forceUpdate = (root, callback) => //  Perf.start()

    root.forceUpdate(() => modal.forceUpdate(() => // Perf.stop()
    // console.log "frame"
    // measurements = Perf.getLastMeasurements()
    // Perf.printInclusive(measurements)
    // Perf.printExclusive(measurements)
    // Perf.printWasted(measurements)
    // Perf.printOperations(measurements)

    callback()));
}


// export a mixin for EditPage.  We probably wouldn't do it this way if we were doing it from scratch
export default {
    dirty(callback) { return forceUpdate(this, callback); }
};
