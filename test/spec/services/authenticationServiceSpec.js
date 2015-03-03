/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

describe('Factory: AuthenticationService', function () {

  // load the controller's module
  beforeEach(module('linshareUiUserApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));

  it('should contain an Restangular, authService, $q, $log and $cookies services',
    inject(function(Restangular, authService, $q, $log, $cookies){

    }))
  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
