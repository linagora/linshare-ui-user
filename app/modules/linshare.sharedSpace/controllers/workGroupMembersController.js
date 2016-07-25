/**
 * @author Alpha Sall.
 */

'use strict';

angular.module('linshareUiUserApp')
.controller('WorkGroupMembersController', WorkGroupMembersController);

function WorkGroupMembersController($scope, workGroupRestService, $stateParams, members, currentWorkgroup) {

  $scope.sidebarRightDataType = 'add-member';
  $scope.mactrl.sidebarToggle.right = true;
  var thisCtrl = this;
  thisCtrl.currentWorkGroup = currentWorkgroup;
  thisCtrl.workgroupUuid = $stateParams.id;
  thisCtrl.workgroupMembers = members;
  thisCtrl.membersRights = {admin: 'ADMIN', write: 'WRITE', readonly: 'READ'};
  thisCtrl.memberRole = thisCtrl.membersRights.write;

  thisCtrl.addMember = addMember;
  thisCtrl.removeMember = removeMember;
  thisCtrl.updateMember = updateMember;

  function removeMember(workgroupMembers, member) {
    _.remove(workgroupMembers, member);
    return workGroupRestService.deleteMember(thisCtrl.workgroupUuid, member.uuid);
  }

  function addMember(member, listMembers) {
    var jsonMember = {
      mail: member.mail,
      domain: member.domain,
      readonly: thisCtrl.memberRole === thisCtrl.membersRights.readonly,
      admin: thisCtrl.memberRole === thisCtrl.membersRights.admin
    };
    workGroupRestService.createMember(thisCtrl.workgroupUuid, jsonMember).then(function(data) {
      listMembers.push(data.plain());
    });
  }

  function updateMember() {

  }
}
