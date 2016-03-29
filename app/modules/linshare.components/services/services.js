/**
 * Created by Alpha O. Sall on 2/29/16.
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
        axis:'yx',
        mouseWheel: {
          enable: true,
          axis: mousewheelaxis,
          preventDefault: true
        }
      });
    };

    return ss;
  })

  //==============================================
  // BOOTSTRAP GROWL
  //==============================================

  .service('growlService', function() {
    var fromTopAlignRight = {from: 'top', align: 'right', icon: 'icon', timer: 1000};
    var fromBottomAlignLeft = {from: 'bottom', align: 'left', icon: 'icon', timer: 1000};
    var fromBottomAlignRight = {from: 'bottom', align: 'right', icon: 'icon', timer: 1000};
    var fromTopCenter = {from: 'top', align: 'center', icon: 'icon', timer: 0};
    // option = {from, align, icon, type, animIn, animOut}

    var growlNotifyer = function(message, type, option) {
      $.growl({
        icon: option.icon,
        title: '',
        message: message,
        url: ''
      },{
        element: 'body',
        type: type,
        allow_dismiss: true,
        placement: {
          from: option.from,
          align: option.align
        },
        offset: {
          x: 20,
          y: 85
        },
        spacing: 10,
        z_index: 1031,
        delay: 2500,
        timer: option.timer,
        url_target: '_blank',
        mouse_over: false,
        animate: {
          enter: option.animIn,
          exit: option.animOut
        },
        icon_type: 'class',
        template: '<div data-growl="container" class="alert" role="alert">' +
        '<button type="button" class="close" data-growl="dismiss">' +
        '<span aria-hidden="true">&times;</span>' +
        '<span class="sr-only">Close</span>' +
        '</button>' +
        '<span data-growl="icon"></span>' +
        '<span data-growl="title"></span>' +
        '<span data-growl="message"></span>' +
        '<a href="#" data-growl="url"></a>' +
        '</div>'
      });
    };
    return {
      notifyer: growlNotifyer,
      notifyTopRight: function(message, type) {
        return growlNotifyer(message, type, fromTopAlignRight);
      },
      notifyBottomLeft: function(message, type) {
        return growlNotifyer(message, type, fromBottomAlignLeft);
      },
      notifyBottomRight: function(message, type) {
        return growlNotifyer(message, type, fromBottomAlignRight);
      },
      notifyTopCenter: function(message, type) {
        return growlNotifyer(message, type, fromTopCenter);
      }
    }
  });
