// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import $ from 'jquery';

// prevent user from zooming page in Chrome

$(document).bind('wheel', function(evt) {
    if (evt.ctrlKey === true) {
        // it's a pinch-zoom event; Chrome does pinch-zoom as scroll with ctrl key held
        return evt.preventDefault();
    }
});
