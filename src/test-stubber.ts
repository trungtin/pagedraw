/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*

Usage:

Production code wants to get the current date, but test code wants to be deterministic, so
it should always be Jan 1, 1970 for test code.

--- in regular code ---
fn = ->
    ...
    now = new Date()
    ...

--- instead ---
fn = ->
    ...
    now = stubbable "fn:current_date", -> new Date()
    ...

--- and in the test code ---

stub "fn:current_date", -> new Date("January 1, 1970")
fn()
* fn's `now` variable will be `new Date("January 1, 1970")`


*/

const registered_stubs = {};

const defaultExport = {};

defaultExport.stub = (name, override_impl) => registered_stubs[name] = override_impl;

defaultExport.stubbable = function(name, ...rest) {
    let stub;
    const adjustedLength = Math.max(rest.length, 1), params = rest.slice(0, adjustedLength - 1), dfault_impl = rest[adjustedLength - 1];
    const registered_stub_exists = (registered_stubs[name] != null);
    if ((stub = registered_stubs[name]) != null) {
        return stub(...Array.from(params || []));
    } else {
        return dfault_impl();
    }
};

defaultExport.stubbable_as = name => dfault_impl => (function(...params) {
    const fn = (registered_stubs[name] != null ? registered_stubs[name] : dfault_impl);
    return fn(...Array.from(params || []));
});

export default defaultExport;

