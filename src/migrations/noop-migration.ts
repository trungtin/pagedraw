import '../../coffeescript-register-web';
import { migrationCheck } from './map_prod';

migrationCheck(docjson => docjson);
