/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

describe('Testing AuthenticationService Factory: ', function () {

  // load the controller's module
  beforeEach(module('linshareUiUserApp'));
  //beforeEach(angular.mock.module('linshareUiUserApp'));

  var MainCtrl, scope;
  var restangular, auth_Service, cookies, authenticationService, $httpBackend;
  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, _AuthenticationService_) {

    authenticationService = _AuthenticationService_;
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('linshare/authentication/authorized')
      .respond(200, {
        uuid: "9a9ece25-7a0e-4d75-bb55-d4070e25e1e1",
        creationDate: 1434729746196,
        modificationDate: 1434729746196,
        locale: 'FRENCH'
      });
  }));

  it('should contain an Restangular, authService, $q, $log and $cookies services', function(){
      authenticationService.getCurrentUser();
      $httpBackend.flush();
    });

  it('should attach a list of awesomeThings to the scope', function () {
    authenticationService.login('bart.simpson', 'secret');
    //expect(scope.awesomeThings.length).toBe(3);
  });
});
