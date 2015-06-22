'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('linshareUiUserApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('HomeController', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeHome).toBe('Welcome to LinShare, THE Secure, Open-Source File Sharing Tool.');
  });
});
