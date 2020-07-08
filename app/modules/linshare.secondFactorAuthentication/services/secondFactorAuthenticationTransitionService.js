/**
 * secondFactorAuthenticationTransitionService
 * @namespace LinShare.secondFactorAuthentication
 */
(function() {
  'use strict';

  angular
    .module('linshare.secondFactorAuthentication')
    .factory('secondFactorAuthenticationTransitionService', secondFactorAuthenticationTransitionService);

  secondFactorAuthenticationTransitionService.$inject = [
    '$transitions',
    '$state',
    'authenticationRestService',
    'SECOND_FA_REQUIRED_TRANSITION_STATES'
  ];

  /**
   * @namespace secondFactorAuthenticationTransitionService
   * @descService to interact with secondFactorAuthenticationList object by REST
   * @memberOf LinShare.secondFactorAuthentication
   */
  function secondFactorAuthenticationTransitionService(
    $transitions,
    $state,
    authenticationRestService,
    SECOND_FA_REQUIRED_TRANSITION_STATES
  ) {
    var
      deregister,
      service = {
        registerHook: registerHook,
        deregisterHook: deregisterHook
      };

    return service;

    ////////////

    function registerHook() {
      deregister = $transitions.onFinish({
        from: function(state) {
          return SECOND_FA_REQUIRED_TRANSITION_STATES.from.includes(state.name);
        },
        to: function(state) {
          return state.name !== 'secondFactorAuthentication' && state.includes.common;
        }
      }, function(transition) {
        return authenticationRestService.getCurrentUser().then(function(user) {
          if (user.secondFARequired && !user.secondFAEnabled) {
            transition.abort();
            return $state.go('secondFactorAuthentication');
          }

          deregister();
        });
      });
    }

    function deregisterHook() {
      if (deregister) {
        deregister();
      }
    }
  }
})();
