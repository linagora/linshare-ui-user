(function() {
  'use strict';

  angular
    .module(
      'linshare.sharedSpace',
      [
        'linshare.utils',
        'pascalprecht.translate',
      ]);

})();

require('./constants');
require('./controllers/SharedSpaceController');
require('./controllers/WorkgroupNodesController');
require('./controllers/WorkgroupVersionsController');
require('./controllers/workGroupMembersController');
require('./filters/canDeleteNodesFilter');
require('./filters/canDeleteWorkgroupsFilter');
require('./services/workGroupMemberRestService');
require('./services/workGroupNodesRestService');
require('./services/workGroupPermissionsService');
require('./services/workGroupRolesRestService');
require('./services/workGroupRestService');
require('./services/workgroupRestServiceRun');
require('./services/workgroupVersionsRestService');