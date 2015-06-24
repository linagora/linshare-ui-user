'use strict';

describe('Unit test for DocumentService', function () {
  beforeEach(module('linshareUiUserApp'));

  var documentService, $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(
    inject(function (_$httpBackend_, _DocumentService_) {

      $httpBackend = _$httpBackend_;
      documentService = _DocumentService_;

      $httpBackend.expectGET('linshare/authentication/authorized')
        .respond(200, {});
    })
  );

  it('should get all files', function () {
    $httpBackend.expectGET('linshare/documents')
      .respond(200, []);
    documentService.getAllFiles();
    $httpBackend.flush();
  });

  it('should get file Info', function() {
    var uuid = "d90a5e28-7f38-4fce-b42e-b0dcaf8e503f";
    $httpBackend.expectGET('linshare/documents/' + uuid)
      .respond(200, {});

    expect(uuid).not.toBe(null);
    documentService.getFileInfo(uuid);
  });

  it('should download a file', function () {
    $httpBackend.expectGET('linshare/documents/d90a5e28-7f38-4fce-b42e-b0dcaf8e503f/download')
      .respond(200, {});
    documentService.downloadFiles('d90a5e28-7f38-4fce-b42e-b0dcaf8e503f');
    $httpBackend.flush();
  });

  it('should delete a file', function() {
    $httpBackend.expectDELETE('linshare/documents/d90a5e28-7f38-4fce-b42e-b0dcaf8e503f')
      .respond(200);

    documentService.delete('d90a5e28-7f38-4fce-b42e-b0dcaf8e503f');
    $httpBackend.flush();
  });

  it('should get thumbnail of a file', function() {
    $httpBackend.expectGET('linshare/documents/d90a5e28-7f38-4fce-b42e-b0dcaf8e503f/thumbnail')
      .respond(200);

    documentService.getThumbnail('d90a5e28-7f38-4fce-b42e-b0dcaf8e503f');
    $httpBackend.flush();
  });



});
