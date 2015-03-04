/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

describe('Factory: AuthenticationService', function () {

  // load the controller's module
  beforeEach(module('linshareUiUserApp'));

  var MainCtrl,
    scope;
  var restangular, auth_Service, q, log, cookies;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_Restangular_, _authService_, _$q_, _$log_, _$cookies_) {
    restangular = _Restangular_;
    auth_Service = _authService_;
    q = _$q_;
    log = _$log_;
    cookies = _$cookies_;

    //scope = $rootScope.$new();
    //MainCtrl = $controller('MainCtrl', {
    //  $scope: scope
    //});
  }));

  it('should contain an Restangular, authService, $q, $log and $cookies services',
    inject(function(Restangular, authService, $q, $log, $cookies){

    }))
  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
