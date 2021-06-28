angular
  .module('linshare.sharedSpace')
  .run(getFullResponseForSearchResults);

getFullResponseForSearchResults.$inject = ['Restangular'];

function getFullResponseForSearchResults(Restangular) {
  Restangular.addResponseInterceptor(function(data, operation, what, url, response) {
    if (url.includes('/nodes/search')) {
      return response;
    }

    return data;
  });
}