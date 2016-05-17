'use strict';

/*jshint ignore:start */
describe('Testing Documents Module: ', function () {

  // load the module
  beforeEach(module('linshare.document'));

  var LinshareDocumentService, httpBackend;

  beforeEach(inject(function(_$httpBackend_, _LinshareDocumentService_) {
    httpBackend = _$httpBackend_;
    LinshareDocumentService = _LinshareDocumentService_;
  }));

  describe('Test LinshareDocumentService', function() {
    var uuid = '9df4bf16-c95f-413d-aed2-b934e32dd346';
    beforeEach(inject(function () {

    }));

    it('Should get all Files', function() {
      httpBackend.expect('GET', '/documents').respond();
      LinshareDocumentService.getAllFiles();
      httpBackend.flush();
    });

    it('Should get a file info', function () {
      httpBackend.expectGET('/documents/' + uuid).respond();
      LinshareDocumentService.getFileInfo(uuid);
      httpBackend.flush();
    });

    it('Should download File', function () {
      httpBackend.expectGET('/documents/' + uuid + '/download').respond();
      LinshareDocumentService.downloadFiles(uuid);
      httpBackend.flush();
    });

    it('Should get Thumbnail', function () {
      httpBackend.expectGET('/documents/' + uuid + '/thumbnail').respond();
      LinshareDocumentService.getThumbnail(uuid);
      httpBackend.flush();
    });

    it('Should upload Files', function () {
      var documentDto = {
        uuid: uuid,
        name: 'doc.js'
      };
      httpBackend.expectPOST('/documents', documentDto).respond();
      LinshareDocumentService.uploadFiles(documentDto);
      httpBackend.flush();
    });

    it('Should delete a File', function () {
      httpBackend.expectDELETE('/documents/' + uuid).respond();
      LinshareDocumentService.delete(uuid);
      httpBackend.flush();
    });
  });

  describe('Test LinshareDocumentController', function() {

    var $scope, controller;
    var documentsList = [
      {
        uuid: '276aa208-8c8c-403c-aa28-bb80e5c7e74a',
        name: 'doc1',
        size: 1555
      }, {
        uuid: 'c3828932-c31d-4f0b-8db0-38c6eb49613b',
        name: 'doc2',
        size: 2566
      }
    ];

    // Inject the controller for each assertion and a mock scope
    beforeEach(inject(
      function($controller, $rootScope, $filter, ngTableParams) {
        $scope = $rootScope.$new();
        controller = $controller('LinshareDocumentController', {$scope: $scope, documentsList: documentsList});
      }));

    it('should have tableParams set', function(){
      expect($scope.tableParams).toBeDefined();
    });

    it('Should call download service per selected document ', function() {
      //var selectedDocuments = ['doc1', 'doc2', 'doc3', 'doc4', 'doc5'];
      var selectedDocuments = documentsList;
      spyOn(LinshareDocumentService, 'downloadFiles');
      $scope.download(selectedDocuments);
      expect(LinshareDocumentService.downloadFiles.calls.count()).toEqual(selectedDocuments.length);
    });

    it('Should call delete selected documents', function() {
      expect($scope.deleteSelected).toBeDefined();
    });
  });

});
/*jshint ignore:end */

