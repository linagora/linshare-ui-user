(function() {
  'use strict';

  angular
    .module(
      'linshare.sharedSpace',
      [
        'linshare.utils',
        'pascalprecht.translate',
        'ngDragDrop'
      ]);

})();

require('./constants');
require('./controllers/SharedSpaceController');
require('./controllers/WorkgroupNodesController');
require('./controllers/WorkgroupVersionsController');
require('./controllers/sharedSpaceMembersController');
require('./components/updateDefaultWorkgroupsRoleDialog/updateDefaultWorkgroupsRoleDialogController');
require('./filters/canDeleteNodesFilter');
require('./filters/canDeleteSharedSpacesFilter');
require('./services/sharedSpacesMemberRestService');
require('./services/workGroupNodesRestService');
require('./services/workGroupPermissionsService');
require('./services/workGroupRolesRestService');
require('./services/sharedSpaceRestService');
require('./services/sharedSpaceRestServiceRun');
require('./services/workgroupVersionsRestService');