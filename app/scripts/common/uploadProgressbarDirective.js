"use strict";

angular.module('linshareUiUserApp')
  .directive('lsUploadProgressbar', function(){
    return {
      restrict : 'E',
      link: function(scope, elm, attrs){
        scope.data = attrs.tanta;
      },
      template : '<div><table><tr ng-repeat="file in scope.data"><td>{{$index+1}}}}</td>' +
     '<td>{{file}}</td></tr></table></div>'
    }
  });
