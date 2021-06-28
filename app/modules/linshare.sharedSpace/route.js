// angular
//   .module('linshare.sharedSpace')
//   .config(routes);

// routes.$inject = ['$stateProvider'];

// function routes($stateProvider) {
//   $stateProvider
//     .state('sharedspace.search', {
//       url: '/search?sharedSpace&folder',
//       template: require('./views/workgroupNodesSearch.html'),
//       controller: 'workgroupNodesSearchController',
//       controllerAs: 'workgroupSearchVm',
//       params: {
//         sharedSpace: null,
//         folder: null,
//         searchParams: {}
//       },
//       resolve: {
//         sharedSpace: ($stateParams, sharedSpaceRestService) => sharedSpaceRestService.get($stateParams.sharedSpace, false, true),
//         folder: ($stateParams, workgroupNodesRestService) => workgroupNodesRestService.get(
//           $stateParams.sharedSpace, $stateParams.folder, true),
//         permissions: (sharedSpace, workgroupPermissionsService) => {
//           const { getWorkgroupsPermissions,formatPermissions} = workgroupPermissionsService;

//           return getWorkgroupsPermissions([sharedSpace])
//             .then(formatPermissions)
//             .then(formatted => formatted[Object.keys(formatted)[0]]);
//         }
//       }
//     });
// }