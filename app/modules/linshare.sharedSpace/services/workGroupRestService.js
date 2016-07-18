'use strict';

angular.module('linshareUiUserApp')
  .factory('WorkGroupRestService', function(Restangular, $log) {

    return {

      //WORKGROUP

      getAllWorkGroups: function() {
        $log.info('WorkGroupRestService - Get All WorkGroups');
        return Restangular.all('threads').getList();
      },
      getWorkGroup: function(WorkGroupUuid) {
        $log.info('WorkGroupRestService - Get WorkGroup Information');
        return Restangular.one('threads', WorkGroupUuid).get();
      },
      createWorkGroup: function(WorkGroupDto) {
        $log.info('WorkGroupRestService - Create WorkGroup');
        return Restangular.all('threads').post(WorkGroupDto);
      },
      updateWorkGroup: function(WorkGroupDto) {
        $log.info('WorkGroupRestService - Update WorkGroup');
        return Restangular.one('threads', WorkGroupDto.uuid).post(WorkGroupDto);
      },
      getWorkGroupContents: function(WorkGroupUuid) {
        $log.info('WorkGroupRestService -  Get all WorkGroupEntries of the WorkGroup ', WorkGroupUuid);
        return Restangular.one('threads', WorkGroupUuid).getList('entries');
      },
      deleteWorkGroup: function(WorkGroupUuid) {
        $log.info('WorkGroupRestService - Delete WorkGroups');
        return Restangular.one('threads', WorkGroupUuid).remove();
      },

      //WORKGROUPS ENTRIES - FILES

      getWorkGroupEntry: function(workGroupUuid, entryUuid) {
        $log.info('WorkGroupRestService -  Get a WorkGroupEntry ' + entryUuid + ' of the WorkGroup ', workGroupUuid);
        return Restangular.one('threads', workGroupUuid).one('entries', entryUuid).get();
      },
      downloadWorkGroupEntry: function(workGroupUuid, entryUuid) {
        $log.info('WorkGroupRestService -  Download a WorkGroupEntry ' + entryUuid + ' of the WorkGroup ', workGroupUuid);
        return Restangular.one('threads', workGroupUuid).one('entries', entryUuid).customGET('download');
      },
      getWorkGroupThumbnail: function(workGroupUuid, entryUuid) {
        return Restangular.one('threads', workGroupUuid).one('entries', entryUuid).customGET('thumbnail');
      },
      deleteWorkGroupEntry: function(workGroupUuid, entryUuid) {
        $log.info('WorkGroupRestService -  Delete a WorkGroupEntry ' + entryUuid + ' of the WorkGroup ', workGroupUuid);
        return Restangular.one('threads', workGroupUuid).one('entries', entryUuid).remove();
      }
    };
  });
