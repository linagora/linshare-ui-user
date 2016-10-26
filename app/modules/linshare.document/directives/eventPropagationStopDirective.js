(function() {
  'use strict';

  angular
    .module('linshare.document')
    .directive('eventPropagationStop', eventPropagationStopDirective);

  function eventPropagationStopDirective() {
    return {
      link: function(scope, elm, attrs) {
        elm.bind('click', function(event) {
          var hasInfoClass = elm.parent().parent().parent().parent().hasClass('highlight-list-elem');
          if (!attrs.eventPropagationStop || hasInfoClass) {
            event.stopPropagation();
          }
        });
      }
    };
  }
})();

