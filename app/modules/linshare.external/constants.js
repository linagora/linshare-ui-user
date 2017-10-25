(function() {
  'use strict';

  /* jshint undef: true */
  /* global _:false, $:false, Waves:false, moment:false*/
  angular
    .module('linshare.external')
    .constant('moment', moment)
    .constant('Waves', Waves)
    .constant('$', $)
    .constant('_', _);
})();
