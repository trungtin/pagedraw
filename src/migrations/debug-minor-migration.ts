// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import '../../coffeescript-register-web';
import '../load_compiler';
import { Doc } from '../doc';
import _l from 'lodash';
import { debugBeforeMapProd } from './map_prod';

debugBeforeMapProd(docjson => Doc.deserialize(docjson).serialize());
