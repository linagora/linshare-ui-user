/**
 * @author Alpha Sall
 */

'use strict';

angular.module('linshare.components')
  .factory('autocompleteUserRestService', function(Restangular, $q, $log) {
    return function(pattern, searchType, threadUuid) {
        $log.debug('autocompleteUserRestService' );
        return Restangular.all('autocomplete').one(pattern).get({type: searchType, threadUuid: threadUuid});
    };
  });
