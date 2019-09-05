/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const defaultExport = {};
//# Single source of truth for our pagedraw.json recommendations

defaultExport.recommended_pagedraw_json_for_app_id = (app_id, filepath_prefix) => `\
{"app": "${app_id}", "managed_folders": ["${filepath_prefix.endsWith('/') ? filepath_prefix : filepath_prefix + '/'}"] }\
`;
export default defaultExport;
