'use strict';

describe('Testing Authentication Module: ', function () {

  // load the module
  beforeEach(module('linshare.authentication'));

  var AuthenticationService, httpBackend;

  beforeEach(inject(function(_$httpBackend_, _AuthenticationService_) {
    httpBackend = _$httpBackend_;
    AuthenticationService = _AuthenticationService_;
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
      AuthenticationService.login('login', 'passwd');
      httpBackend.flush();
    });

    it('Should call http-interceptor login confirmed when loggin succeed', function () {
      var login = 'john@doe.com', password = 'password';
      spyOn(authService, 'loginConfirmed');

      httpBackend.when('GET', 'linshare/authentication/authorized?ignoreAuthModule=true')
        .respond({uuid: '9514', firstName: 'John', lastName: 'Doe'});
      AuthenticationService.login(login, password);
      httpBackend.flush();
      expect(authService.loginConfirmed.calls.any()).toEqual(true);
    });

    it('Should call http-interceptor logout cancelled when logout succeed', function () {
      spyOn(authService, 'loginCancelled');
      httpBackend.whenGET('linshare/authentication/logout').respond(200);
      httpBackend.when('GET', 'linshare/authentication/authorized')
        .respond(200);
      AuthenticationService.logout();
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
      AuthenticationService.getCurrentUser();
      httpBackend.flush();
    });

    it('Logout function should call AuthenticationService login', function () {

      spyOn(AuthenticationService, 'login').and.callThrough();
      $scope.submitLoginForm();
      expect(AuthenticationService.login.calls.any()).toEqual(true);
    });

    it('Logout function should call AuthenticationService logout', function () {
      spyOn(AuthenticationService, 'logout');
      $scope.logout();
      expect(AuthenticationService.logout.calls.any()).toEqual(true);
    });

  });



});
