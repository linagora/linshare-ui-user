'use strict';

angular.module('linshareUiUserApp')
  .factory('workGroupRestService', function(Restangular, $log, $stateParams) {

    return {

      //WORKGROUP
      workGroupUuid: $stateParams.uuid,

      getAll: function() {
        $log.info('WorkGroupRestService - Get All WorkGroups');
        return Restangular.all('threads').getList();
      },
      get: function(WorkGroupUuid) {
        $log.info('WorkGroupRestService - Get WorkGroup Information');
        return Restangular.one('threads', WorkGroupUuid).get();
      },
      create: function(WorkGroupDto) {
        $log.info('WorkGroupRestService - Create WorkGroup');
        return Restangular.all('threads').post(WorkGroupDto);
      },
      update: function(WorkGroupDto) {
        $log.info('WorkGroupRestService - Update WorkGroup');
        return Restangular.one('threads', WorkGroupDto.uuid).customPUT(WorkGroupDto);
      },
      deleteWorkGroup: function(WorkGroupUuid) {
        $log.info('WorkGroupRestService - Delete WorkGroups');
        return Restangular.one('threads', WorkGroupUuid).remove();
      }
    };
  })

  // WORKGROUPS ENTRIES REST SERVICE- FILES
  .factory('workGroupEntriesRestService', function(Restangular, $log) {

    return {
      getAll: function(WorkGroupUuid) {
        $log.info('workGroupEntriesRestService -  Get all WorkGroupEntries of the WorkGroup ', WorkGroupUuid);
        return Restangular.one('threads', WorkGroupUuid).getList('entries');
      },
      get: function(workGroupUuid, entryUuid) {
        $log.info('workGroupEntriesRestService -  Get a WorkGroupEntry ' + entryUuid + ' of the WorkGroup ', workGroupUuid);
        return Restangular.one('threads', workGroupUuid).one('entries', entryUuid).get();
      },
      download: function(workGroupUuid, entryUuid) {
        $log.info('workGroupEntriesRestService -  Download a WorkGroupEntry ' + entryUuid + ' of the WorkGroup ', workGroupUuid);
        return Restangular.one('threads', workGroupUuid).one('entries', entryUuid).customGET('download');
      },
      copy: function(workGroupUuid, entryUuid) {
        $log.info('workGroupEntriesRestService - Copy a entry ' + entryUuid + ' of the workgroup', workGroupUuid);
        return Restangular.one('threads', workGroupUuid).one('entries/copy', entryUuid).post();
      },
      getThumbnail: function(workGroupUuid, entryUuid) {
        return Restangular.one('threads', workGroupUuid).one('entries', entryUuid).customGET('thumbnail');
      },
      delete: function(entryUuid) {
        $log.info('workGroupEntriesRestService -  Delete a WorkGroupEntry ' + entryUuid + ' of the WorkGroup ', this.workGroupUuid);
        return Restangular.one('threads', this.workGroupUuid).one('entries', entryUuid).remove();
      }
    };
  })

  // WORKGROUPS MEMBERS REST SERVICE
  .factory('workGroupMembersRestService', function(Restangular, $log) {

    return {
      getAll: function(workGroupUuid) {
        $log.info('WorkGroupRestService -  Get a WorkGroup Member ' + workGroupUuid);
        return Restangular.one('threads', workGroupUuid).all('members').getList();
      },
      create: function(workGroupUuid, member) {
        $log.info('WorkGroupRestService -  createMember');
        return Restangular.one('threads', workGroupUuid).all('members').post(member);
      },
      get: function(workGroupUuid, memberUuid) {
        $log.info('WorkGroupRestService -  getMember');
        return Restangular.one('threads', workGroupUuid).one('members', memberUuid).get();
      },
      update: function(workGroupUuid, member) {
        $log.info('WorkGroupRestService -  updateMember');
        return Restangular.one('threads', workGroupUuid).one('members', member.uuid).customPUT(member);
      },
      delete: function(workGroupUuid, memberUuid) {
        $log.info('WorkGroupRestService -  deleteMember');
        return Restangular.one('threads', workGroupUuid).one('members', memberUuid).remove();
      }
    };
  });
