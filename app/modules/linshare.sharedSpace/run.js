angular
  .module('linshare.sharedSpace')
  .run(getFullResponseForSearchResults)
  .run(extendSharedSpaceNodeModel);

getFullResponseForSearchResults.$inject = ['Restangular'];
extendSharedSpaceNodeModel.$inject = ['documentModelRestService'];

function getFullResponseForSearchResults(Restangular) {
  Restangular.addResponseInterceptor(function(data, operation, what, url, response) {
    if (url.includes('/nodes/search')) {
      return response;
    }

    return data;
  });
}

function extendSharedSpaceNodeModel(documentModelRestService) {
  documentModelRestService.launchExtendModel('nodes');
}