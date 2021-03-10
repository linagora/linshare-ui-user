/**
 * sidebarContent Directive
 * @namespace linshareUiUserApp
 */
(function() {
  'use strict';

  angular
    .module('linshareUiUserApp')
    .directive('sidebarContent', sidebarContentDirective)
    .run(cacheTemplates);

  /**
   *  @namespace sidebarContentDirective
   *  @desc Return the template to display in right sidebar
   *  @memberOf linshareUiUserApp
   */
  function sidebarContentDirective() {
    return {
      restrict: 'A',
      templateUrl: templateUrlFunc //TODO
    };
  }

  /**
   *  @namespace linkFunc
   *  @desc TemplateUrl function of sidebarContent Directive
   *  @param {Object} elem - jqLite-wrapped element that this directive matches
   *  @param {Object} attrs - Normalized attribute names and their corresponding attribute values
   *  @memberOf linshareUiUserApp
   */
  function templateUrlFunc(elem, attrs) {
    return 'directives/sidebar-content/sidebar-content-' + attrs.sidebarContent + '.html';
  }

  cacheTemplates.$inject = ['$templateCache'];

  function cacheTemplates($templateCache) {
    $templateCache.put('directives/sidebar-content/sidebar-content-active-share-details.html', require('./sidebar-content-active-share-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-contactslists-activities.html', require('./sidebar-content-contactslists-activities.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-contactslists-add-contacts.html', require('./sidebar-content-contactslists-add-contacts.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-contactslists-contact-details.html', require('./sidebar-content-contactslists-contact-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-contactslists-contact-edit.html', require('./sidebar-content-contactslists-contact-edit.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-contactslists-contact.html', require('./sidebar-content-contactslists-contact.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-contactslists-details.html', require('./sidebar-content-contactslists-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-contactslists.html', require('./sidebar-content-contactslists.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-details.html', require('./sidebar-content-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-guest-create.html', require('./sidebar-content-guest-create.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-guest-details-read.html', require('./sidebar-content-guest-details-read.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-guest-details-update.html', require('./sidebar-content-guest-details-update.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-guest-details.html', require('./sidebar-content-guest-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-share-details.html', require('./sidebar-content-share-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-share-recipients-list.html', require('./sidebar-content-share-recipients-list.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-share.html', require('./sidebar-content-share.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-workgroup-details.html', require('./sidebar-content-workgroup-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-workgroup-members.html', require('./sidebar-content-workgroup-members.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-workgroup-node-details.html', require('./sidebar-content-workgroup-node-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-workgroup-node.html', require('./sidebar-content-workgroup-node.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-workgroup.html', require('./sidebar-content-workgroup.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-uploadrequestgroup-create.html', require('./sidebar-content-uploadrequestgroup-create.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-uploadrequestgroup-details.html', require('./sidebar-content-uploadrequestgroup-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-uploadrequest-add-recipients.html', require('./sidebar-content-uploadrequest-add-recipients.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-uploadrequestentry-details.html', require('./sidebar-content-uploadrequestentry-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-uploadrequest-details.html', require('./sidebar-content-uploadrequest-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-token-create.html', require('./sidebar-content-token-create.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-token-details.html', require('./sidebar-content-token-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-token-details.html', require('./sidebar-content-token-details.html'));
    $templateCache.put('directives/sidebar-content/sidebar-content-forward.html', require('./sidebar-content-forward.html'));
  }
})();
