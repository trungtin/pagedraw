// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import '../../coffeescript-register-web';
import '../load_compiler';
import { Doc } from '../doc';
import _l from 'lodash';
import { migration } from './map_prod';

//# DEBUG=true coffee src/migrations/minor-migration.coffee
//# MIGRATION=true coffee src/migrations/minor-migration.coffee

migration('minor-migration', function(docjson) {
    if (docjson === null) { return null; }
    return Doc.deserialize(docjson).serialize();
});
