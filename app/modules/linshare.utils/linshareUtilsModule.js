/**
 * Utils Module
 * @namespace utils
 * @memberOf LinShare
 */
(function() {
  'use strict';

  angular.module('linshare.utils', []);
})();

require('./constant');
require('./dialog/dialogService');
require('./dialog/dialogInput/dialogInputController');
require('./document/documentModelRestService');
require('./document/documentUtilsService');
require('./filters/lsDateFilter');
require('./item/itemUtilsConstant');
require('./item/itemUtilsService');
require('./form/formUtilsService');