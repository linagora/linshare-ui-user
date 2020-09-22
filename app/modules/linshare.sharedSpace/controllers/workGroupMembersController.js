/**
 * workGroupMembersController Controller
 * @namespace LinShare.sharedSpace
 */
(function() {
  'use strict';

  angular
    .module('linshare.sharedSpace')
    .config(['$translatePartialLoaderProvider', function($translatePartialLoaderProvider) {
      $translatePartialLoaderProvider.addPart('notification');
    }])
    .controller('WorkGroupMembersController', workGroupMembersController);

  workGroupMembersController.$inject = [
    '$log',
    '$filter',
    '$q',
    '$scope',
    '$translate',
    '_',
    'authenticationRestService',
    'dialogService',
    'lsAppConfig',
    'toastService',
    'workgroupMembersRestService',
    'workgroupRolesRestService'
  ];

  /**
   * @namespace workGroupMembersController
   * @desc Application home management system controller
   * @memberOf LinShare.sharedSpace
   */
  function workGroupMembersController(
    $log,
    $filter,
    $q,
    $scope,
    $translate,
    _,
    authenticationRestService,
    dialogService,
    lsAppConfig,
    toastService,
    workgroupMembersRestService,
    workgroupRolesRestService
  ) {
    /* jshint validthis: true */
    var workgroupMemberVm = this;

    workgroupMemberVm.addMember = addMember;
    workgroupMemberVm.updateRoleFilterOnCurrentMembers = updateRoleFilterOnCurrentMembers;
    workgroupMemberVm.changePropertyOrderBy = changePropertyOrderBy;
    workgroupMemberVm.removeMember = removeMember;
    workgroupMemberVm.updateInputFilterOnCurrentMembers = updateInputFilterOnCurrentMembers;
    workgroupMemberVm.updateMember = updateMember;

    workgroupMemberVm.membersRights = {};
    workgroupMemberVm.searchMemberInput = '';
    workgroupMemberVm.membersSearchFilter = {
      account: {
        mail: undefined,
        name: undefined
      },
      role: {
        uuid: undefined
      }
    };
    workgroupMemberVm.propertyFilter = '';
    workgroupMemberVm.propertyOrderBy = 'firstName';
    workgroupMemberVm.propertyOrderByAsc = true;
    workgroupMemberVm.members = [];

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function activate() {
      workgroupMemberVm.currentWorkGroup = $scope.mainVm.sidebar.getData().currentSelectedDocument;

      workgroupRolesRestService.getList().then(function(roles) {
        var defaultConfiguredRoleIndex = roles.findIndex(function(role){
          return role.name === lsAppConfig.defaultWorkgroupMemberRole;
        });

        workgroupMemberVm.membersRights =
          defaultConfiguredRoleIndex === 0 || defaultConfiguredRoleIndex === -1
            ? roles
            : [].concat(
              roles[defaultConfiguredRoleIndex],
              roles.slice(0, defaultConfiguredRoleIndex),
              roles.slice(defaultConfiguredRoleIndex + 1, roles.length)
            );
        workgroupMemberVm.memberRole = workgroupMemberVm.membersRights[0];
      });
      // TODO : I added the if to work around, the watcher solution is very bad, need to change it !
      $scope.$watch(function() {
        return $scope.mainVm.sidebar.getData().currentSelectedDocument.current;
      }, function(currentWorkGroup) {
        return $q
          .all([
            authenticationRestService.getCurrentUser(),
            workgroupMembersRestService.getList(currentWorkGroup.uuid)
          ])
          .then(function(promises) {
            const loggedUser = promises[0];
            const members = promises[1];
            const currentMember = _.find(members, {'uuid': loggedUser.uuid});

            workgroupMemberVm.currentWorkgroupMember = currentMember;
            workgroupMemberVm.members = members;

            // TODO SideEffect Power!
            $scope.mainVm.sidebar.addData('currentWorkgroupMember', currentMember );
          })
          .catch(function(error) {
            $log.debug(error);
          });

      }, true);
    }

    /**
     * @name addMember
     * @desc Add member to members's list
     * @param {Object} member - Member to add
     * @param {Array<Object>} workgroupMembers - List of members of workgroup
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function addMember(member, workgroupMembers) {
      var currentWorkgroupMember = workgroupMembers.filter(function(workgroupMember) {
        return workgroupMember.userUuid === member.userUuid;
      });

      if (currentWorkgroupMember.length !== 0) {
        toastService.error({
          key: 'TOAST_ALERT.ERROR.MEMBER_ALREADY_IN_WORKGROUP',
          params: {
            firstName: member.firstName,
            lastName: member.lastName
          }
        });
        
        return;
      }

      workgroupMembersRestService
        .create(
          formatWorkgroupMember(
            workgroupMemberVm.currentWorkGroup.current,
            member,
            workgroupMemberVm.memberRole
          )
        )
        .then(function(data) {
          workgroupMembers.push(data.plain());
        });
    }

    /**
     * @name changePropertyOrderBy
     * @desc Manage order options
     * @param {string} orderParam - which order to apply
     * @param {jQuery.Event} $event - Event bound to the change
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    // TODO : When a directive/service will be done for this type of orderBy, apply it here
    function changePropertyOrderBy(orderParam, $event) {
      workgroupMemberVm.propertyOrderBy = orderParam;
      workgroupMemberVm.propertyOrderByAsc =
        workgroupMemberVm.propertyOrderBy === orderParam ? !workgroupMemberVm.propertyOrderByAsc : true;
      workgroupMemberVm.currentWorkGroup.current.members =
        $filter('orderBy')(workgroupMemberVm.currentWorkGroup.current.members, orderParam,
          workgroupMemberVm.propertyOrderByAsc);
      angular.element('.sort-dropdown a').removeClass('selected-sorting').promise().done(function() {
        angular.element($event.currentTarget).addClass('selected-sorting');
      });
    }

    /**
     * @name removeMember
     * @desc Remove member from workgroup members's list
     * @param {Object} member - The member to remove from workgroup members's list
     * @param {Object} currentWorkgroup - The current workgroup from which the member is removed.
     * @returns {Promise} Response of the server
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function removeMember(currentWorkgroup, member) {
      $q.all([
        $translate(
          'SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.TEXT',
          {
            firstName: member.firstName,
            lastName: member.lastName,
            workgroupName: currentWorkgroup.name
          }
        ),
        $translate([
          'SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.TITLE',
          'SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.CANCEL_BUTTON',
          'SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.CONFIRM_BUTTON'
        ])
      ]).then(function(translations) {
        var sentences = {
          text: translations[0],
          title: translations[1]['SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.TITLE'],
          buttons: {
            cancel: translations[1]['SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.CANCEL_BUTTON'],
            confirm: translations[1]['SWEET_ALERT.ON_WORKGROUP_MEMBER_DELETE.CONFIRM_BUTTON']
          }
        };

        return dialogService.dialogConfirmation(sentences, dialogService.dialogType.warning);
      }).then(function() {
        return workgroupMembersRestService.remove(
          workgroupMemberVm.currentWorkGroup.current.uuid,
          member.uuid
        );
      }).then(function() {
        _.remove(workgroupMemberVm.members, member);
        toastService.success({
          key: 'TOAST_ALERT.ACTION.DELETE_WORKGROUP_MEMBER',
          params: {
            firstName: member.firstName,
            lastName: member.lastName,
          }
        });

      });
    }

    /**
     * @name updateMember
     * @desc Update member
     * @param {Object} member - Member to update
     * @param {Role} role - A {@link Role} object.
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function updateMember(member, role) {
      //TODO Nice side-effect here!
      member.role = role;

      workgroupMembersRestService.update(
        formatWorkgroupMember(
          workgroupMemberVm.currentWorkGroup.current,
          member,
          role
        )
      );
    }

    /**
     * @name formatWorkgroupMember
     * @desc Update member
     * @param {Object} workgroup - Current workgroup
     * @param {Object} member - Member to update
     * @param {Role} role - A {@link Role} object.
     * @returns {WorkgroupMember} A {@link WorkgroupMember} object.
     * @memberOf LinShare.sharedSpace.workGroupMembersController
     */
    function formatWorkgroupMember(workgroup, member, role) {
      return {
        role: {
          uuid: role.uuid
        },
        node: {
          uuid: workgroupMemberVm.currentWorkGroup.current.uuid
        },
        account: {
          uuid: member.account ? member.account.uuid : member.userUuid
        }
      };
    }

    // TODO DOC
    function updateInputFilterOnCurrentMembers(value) {
      workgroupMemberVm.membersSearchFilter.account = {
        mail: value !== '' ? value : undefined,
        name: value !== '' ? value : undefined
      };
    }

    // TODO DOC
    function updateRoleFilterOnCurrentMembers(role) {
      workgroupMemberVm.membersSearchFilter.role.uuid = workgroupMemberVm.membersSearchFilter.role.uuid === role.uuid ?
        undefined :
        workgroupMemberVm.membersSearchFilter.role.uuid = role.uuid;
    }
  }
})();
