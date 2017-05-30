/**
 * Created by Alpha O. Sall on 29/02/16.
 */
'use strict';

angular.module('linshare.components')

  // =========================================================================
  // Malihu Scroll - Custom Scroll bars
  // =========================================================================
  .service('scrollService', function() {
    var ss = {};
    ss.malihuScroll = function scrollBar(selector, theme, mousewheelaxis) {
      $(selector).mCustomScrollbar({
        theme: theme,
        scrollInertia: 100,
        axis: 'yx',
        mouseWheel: {
          enable: true,
          axis: mousewheelaxis,
          preventDefault: true
        }
      });
    };

    return ss;
  });
