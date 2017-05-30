(function() {
  'use strict';

  /* jshint undef: true */
  /* global _:false, swal:false */
  angular
    .module('linshare.upload')
    .constant('swal', swal)
    .constant('_', _);
})();
