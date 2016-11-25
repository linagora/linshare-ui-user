(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .factory('sharedSpaceBreadcrumbService', sharedSpaceBreadcrumbService);

  function sharedSpaceBreadcrumbService($q, workgroupFoldersRestService) {

    return {
      build: build
    };

    function build(workgroupUuid, ancestors) {
      var deferred = $q.defer();
      var breadcrumb = [];
      _.forEach(ancestors, function(ancestor) {
        workgroupFoldersRestService.get(workgroupUuid, ancestor).then(function(folder) {
          breadcrumb[setPosition(ancestors, folder)] = ({uuid: folder.uuid, name: folder.name, parent: folder.parent});
        });
      });
      deferred.resolve(breadcrumb);
      return deferred.promise;
    }

    function setPosition(ancestors, folder) {
      for(var i = 0; i < ancestors.length; i++) {
        if (folder.uuid === ancestors[i]) {
          return i;
        }
      }
      return 0;
    }
  }
})();
