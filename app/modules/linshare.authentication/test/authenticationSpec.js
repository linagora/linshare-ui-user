'use strict';

/*jshint ignore:start */
describe('Testing Authentication Module: ', function () {

  // load the module
  beforeEach(module('linshare.authentication'));

  var authenticationRestService, httpBackend;

  beforeEach(inject(function(_$httpBackend_, _authenticationRestService_) {
    httpBackend = _$httpBackend_;
    authenticationRestService = _authenticationRestService_;
  }));

  describe('Test authenticationService', function() {
    var Restangular, authService;

    beforeEach(inject(function (_Restangular_, _authService_) {
      Restangular = _Restangular_;
      authService = _authService_;
      httpBackend.expect('GET', 'linshare/authentication/authorized')
        .respond({uuid: '9514', firstName: 'John', lastName: 'Doe'});
    }));

    it('Login end point should be called', function() {

      httpBackend.when('GET', 'linshare/authentication/authorized?ignoreAuthModule=true')
        .respond({uuid: '9514', firstName: 'John', lastName: 'Doe'});
      authenticationRestService.login('login', 'passwd');
      httpBackend.flush();
    });

    it('Should call http-interceptor login confirmed when loggin succeed', function () {
      var login = 'john@doe.com', password = 'password';
      spyOn(authService, 'loginConfirmed');

      httpBackend.when('GET', 'linshare/authentication/authorized?ignoreAuthModule=true')
        .respond({uuid: '9514', firstName: 'John', lastName: 'Doe'});
      authenticationRestService.login(login, password);
      httpBackend.flush();
      expect(authService.loginConfirmed.calls.any()).toEqual(true);
    });

    it('Should call http-interceptor logout cancelled when logout succeed', function () {
      spyOn(authService, 'loginCancelled');
      httpBackend.whenGET('linshare/authentication/logout').respond(200);
      httpBackend.when('GET', 'linshare/authentication/authorized')
        .respond(200);
      authenticationRestService.logout();
      httpBackend.flush();
      expect(authService.loginCancelled.calls.any()).toEqual(true);
    })
  });

  describe('Test Authentication Controller', function() {

    var $scope, controller;

    // Inject the controller for each assertion and a mock scope
    beforeEach(inject(
      function($controller, $rootScope) {
        $scope = $rootScope.$new();
        controller = $controller('AuthenticationController', {$scope: $scope});
    }));

    it('should submit if $scope.input not empty', function() {
      expect($scope.submitted).toEqual(false);
    });

    it('should submit authentication', function() {
      httpBackend.expect('GET', 'linshare/authentication/authorized')
        .respond({uuid: '9514', firstName: 'John', lastName: 'Doe'});
      authenticationRestService.getCurrentUser();
      httpBackend.flush();
    });

    it('Logout function should call authenticationRestService login', function () {

      spyOn(authenticationRestService, 'login').and.callThrough();
      $scope.submitLoginForm();
      expect(authenticationRestService.login.calls.any()).toEqual(true);
    });

    it('Logout function should call authenticationRestService logout', function () {
      spyOn(authenticationRestService, 'logout');
      $scope.logout();
      expect(authenticationRestService.logout.calls.any()).toEqual(true);
    });

  });



});
/* jshint ignore:end */
