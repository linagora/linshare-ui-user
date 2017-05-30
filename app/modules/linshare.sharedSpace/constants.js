(function() {
  'use strict';

  /* jshint undef: true */
  /* global _:false, swal:false, moment:false */
  angular
    .module('linshare.sharedSpace')
    .constant('swal', swal)
    .constant('moment', moment)
    .constant('_', _);
})();
