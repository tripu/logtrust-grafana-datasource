import {GenericDatasource} from './datasource';
import {GenericDatasourceQueryCtrl} from './query_ctrl';
// import {GenericDatasourceQueryCtrl} from './query_ctrl';
// import CryptoJS from './external/crypto-js';
import moment from 'moment';
// import '/public/vendor/crypto.min.js';
import * as d3 from './external/d3.v3.min';
import _ from 'lodash';
import crypto from './external/crypto-js/core'
import SHA256 from './external/crypto-js/sha256'
import * as crypto2 from './external/crypto-js/index';
// import * as CryptoJS from './external/crypto-js.js';

console.log('moment', moment, 'asdsad', Crypto, 'd3', d3, 'lodash', _);

// console.log('cryto-js', CryptoJS);
console.log('crypto2', crypto2, crypto, SHA256);

class GenericConfigCtrl {
}
GenericConfigCtrl.templateUrl = 'partials/config.html';

class GenericQueryOptionsCtrl {
}
GenericQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

class GenericAnnotationsQueryCtrl {
}
GenericAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

export {
  GenericDatasource as Datasource,
  GenericDatasourceQueryCtrl as QueryCtrl,
  GenericConfigCtrl as ConfigCtrl,
  GenericQueryOptionsCtrl as QueryOptionsCtrl,
  GenericAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
