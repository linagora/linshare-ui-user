'use strict';

describe('documentController', function() {

  beforeEach(module('linshareUiUserApp'));

  var $controller, $httpBackend;

  beforeEach(inject(function(_$controller_, _$httpBackend_, documentService) {
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
  }));

  describe('$scope.allFiles', function() {
    var scope, controller;

    beforeEach(function() {
      scope = {};
      controller = $controller('DocumentController', {$scope: scope});
    });


    it('should get all documents of the user', function() {
      expect(scope.SelectedElement).toEqual([]);
    });

    it('should get all documents of the user', function() {
      //expect(scope.allFiles).toBe();
    })

  });

});
