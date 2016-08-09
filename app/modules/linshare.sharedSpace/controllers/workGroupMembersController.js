/**
 * @author Alpha Sall.
 */

'use strict';

angular.module('linshareUiUserApp')
.controller('WorkGroupMembersController', WorkGroupMembersController);

function WorkGroupMembersController($scope, workGroupMembersRestService, $stateParams, members, currentWorkgroup, $timeout) {

  $scope.sidebarRightDataType = 'add-member';
  $scope.mactrl.sidebarToggle.right = true;
  var thisCtrl = this;
  thisCtrl.currentWorkGroup = currentWorkgroup;
  thisCtrl.workgroupUuid = $stateParams.id;
  thisCtrl.workgroupMembers = members;
  thisCtrl.membersRights = {admin: 'ADMIN', write: 'WRITE', readonly: 'READ'};
  thisCtrl.memberRole = thisCtrl.membersRights.write;

  thisCtrl.propertyFilter = 'name';

  thisCtrl.addMember = addMember;
  thisCtrl.removeMember = removeMember;
  thisCtrl.updateMember = updateMember;

  thisCtrl.sortSearchMember = function($event) {
    thisCtrl.toggleSelectedSortMembers = !thisCtrl.toggleSelectedSortMembers;
    var currTarget = $event.currentTarget;
    angular.element('.double-drop a ').removeClass('selectedSortingMembers') ;
    $timeout(function() {
      angular.element(currTarget).addClass('selectedSortingMembers');
    }, 200);
  };

  function removeMember(workgroupMembers, member) {
    _.remove(workgroupMembers, member);
    return workGroupMembersRestService.delete(thisCtrl.workgroupUuid, member.uuid);
  }

  function addMember(member, listMembers) {
    var jsonMember = {
      userMail: member.mail,
      userDomainId: member.domain,
      readonly: thisCtrl.memberRole === thisCtrl.membersRights.readonly,
      admin: thisCtrl.memberRole === thisCtrl.membersRights.admin
    };
    workGroupMembersRestService.create(thisCtrl.workgroupUuid, jsonMember).then(function(data) {
      listMembers.push(data.plain());
    });
  }

  function updateMember() {

  }
}
