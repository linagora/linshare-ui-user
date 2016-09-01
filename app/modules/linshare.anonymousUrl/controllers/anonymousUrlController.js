/**
 * @author Alpha O. Sall
 */

'use strict';

angular.module('linshare.anonymousUrl')
  .controller('AnonymousUrlController', function(AnonymousUrlService, NgTableParams, $filter, anonymousUrlUuid, $translatePartialLoader) {

    $translatePartialLoader.addPart('filesList');
    $translatePartialLoader.addPart('anonymousUrl');

    this.urlUuid = anonymousUrlUuid;

    this.anonymousUrlData = {};

    this.anonymousUrlShareEntries = [];

    this.baseUrl = AnonymousUrlService.baseUrl;

    this.status = AnonymousUrlService.status;

    this.paramFilter = {
      name: ''
    };

    var self = this;

    this.tableParams = new NgTableParams({
      page: 1,
      sorting: {modificationDate: 'desc'},
      filter: self.paramFilter,
      count: 10
    }, {
      total: this.anonymousUrlShareEntries.length,
      getData: function($defer, params) {
        AnonymousUrlService.getAnonymousUrl(self.urlUuid).then(function(anonymousUrl) {
          self.anonymousUrlData = anonymousUrl.data;
          self.anonymousUrlShareEntries = self.anonymousUrlData.documents;
          var filteredData = params.filter() ?
            $filter('filter')(self.anonymousUrlShareEntries, params.filter()) : self.anonymousUrlShareEntries;
          var files = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
          params.total(files.length);
          $defer.resolve(files.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        });
      }
    });

    this.download = function(uuid) {
      AnonymousUrlService.download(uuid).then(function(data) {
        downloadFileFromResponse('test_de_fichier', 'image/png', data.data);
      });
    };
  });

function downloadFileFromResponse(fileName, fileType, fileStream) {
  var blob = new Blob([fileStream], {type: fileType});
  var windowUrl = window.URL || window.webkitURL || window.mozURL || window.msURL;
  var urlObject = windowUrl.createObjectURL(blob);

  // create tag element a to simulate a download by click
  var a = document.createElement('a');
  a.setAttribute('href', urlObject);
  a.setAttribute('download', fileName);

  // create a click event and dispatch it on the tag element
  var event = new MouseEvent('click');
  a.dispatchEvent(event);
}
