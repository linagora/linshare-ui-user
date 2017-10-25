(function() {
  'use strict';

  /* jshint undef: true */
  /* global _:false, $:false, moment:false*/
  angular
    .module('linshare.components')
    .constant('moment', moment)
    .constant('$', $)
    .constant('_', _);
})();
