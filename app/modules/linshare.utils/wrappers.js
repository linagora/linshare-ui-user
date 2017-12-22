(function() {
  'use strict';

  /* jshint undef: true */
  /* global _:false, swal:false */
  angular
    .module('linshare.utils')
    .constant('swal', swal)
    .constant('_', _);
})();
