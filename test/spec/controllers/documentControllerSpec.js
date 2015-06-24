'use strict';

describe('documentController', function() {

  beforeEach(module('linshareUiUserApp'));

  var $controller, $httpBackend, $rootScope;

  beforeEach(inject(function(_$controller_, _$httpBackend_, _$rootScope_) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
  }));

  describe('$scope.allFiles', function() {
    var scope, controller;

    beforeEach(function() {
      scope = $rootScope.$new();
      controller = $controller('DocumentController', {$scope: scope});
    });


    it('should have SelectedElement set', function() {
      expect(scope.SelectedElement).toBeDefined();
    });

    it('should get all documents of the user', function() {
      expect(scope.tableParams).toBeDefined();
    })

  });

});
