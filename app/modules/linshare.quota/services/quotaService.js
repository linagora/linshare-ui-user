/**
 * quotaService factory
 * @namespace LinShare.quota
 */
(function() {
  'use strict';

  angular
    .module('linshare.quota')
    .factory('quotaService', quotaService);

  quotaService.$inject = ['_'];

  /**
   *  @namespace quotaService
   *  @desc Service to interact with quota object
   *  @memberof LinShare.quota
   */
  function quotaService(_) {
    var service = {
      buildQuota: buildQuota
    };

    return service;

    ////////////

    /**
     *  @name buildQuota
     *  @desc Build quota object
     *  @param {Object} quotaData - Quota data
     *  @returns {Object} quota object built
     *  @memberOf linshare.quota.quotaService
     */
    function buildQuota (quotaData) {
      var quotaBuilt = Object.assign(
        {},
        quotaData,
        {
          bars: {
            user: {
              value: Math.floor((quotaData.usedSpace / quotaData.quota) * 100),
              type: 'user'
            }
          },
          remaining: quotaData.quota - quotaData.usedSpace,
          percent: Math.floor(((quotaData.usedSpace ) / quotaData.quota) * 100),
          progressBarColor: 'quotas-progress-bar-green'
        }
      );

      if (!_.isNil(quotaData.domainUsedSpace)) {
        quotaBuilt = Object.assign(
          {},
          quotaBuilt,
          {
            bars: Object.assign(
              {},
              quotaBuilt.bars,
              {
                domain: {
                  value: Math.floor(((quotaData.domainUsedSpace - quotaData.usedSpace) / quotaData.quota) * 100),
                  type: 'domain'
                }
              }
            )
          },
          {
            remaining: quotaData.quota - quotaData.domainUsedSpace,
            percent: Math.floor(((quotaData.domainUsedSpace ) / quotaData.quota) * 100)
          }
        );
      }

      if (quotaBuilt.percent >= 85 && quotaBuilt.percent < 95) {
        quotaBuilt.progressBarColor = 'quotas-progress-bar-orange';
      }

      if (quotaBuilt.percent >= 95) {
        quotaBuilt.progressBarColor = 'quotas-progress-bar-red';
      }

      return quotaBuilt;
    }
  }
})();
