/**
 * directives Module
 * @namespace directives
 * @memberOf LinShare
 */
(function() {
  'use strict';

  angular
    .module('linshare.directives', []);

})();

require('./preventDefault/preventDefaultDirective');
require('./otpInput/otpInputDirective');