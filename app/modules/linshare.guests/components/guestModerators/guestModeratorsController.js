angular
  .module('linshare.guests')
  .controller('guestModeratorsController', guestModeratorsController);

guestModeratorsController.$inject = ['_', '$q', 'guestRestService', 'authenticationRestService', 'GUEST_MODERATOR_ROLES'];

function guestModeratorsController(_, $q, guestRestService, authenticationRestService, GUEST_MODERATOR_ROLES) {
  const guestModeratorsVm = this;

  guestModeratorsVm.$onInit = $onInit;
  guestModeratorsVm.$onChanges = $onChanges;
  guestModeratorsVm.changePropertyOrderBy = changePropertyOrderBy;
  guestModeratorsVm.toggleRoleFilter = toggleRoleFilter;
  guestModeratorsVm.updateModeratorRole = updateModeratorRole;
  guestModeratorsVm.removeModerator = removeModerator;
  guestModeratorsVm.moderatorFilter = { account: { name: '' } };
  guestModeratorsVm.MODERATOR_ROLES = GUEST_MODERATOR_ROLES;

  function $onInit() {
    return authenticationRestService.getCurrentUser()
      .then(currentUser => { guestModeratorsVm.currentUser = currentUser; })
      .then(fetchModerators);
  }

  function $onChanges(changesObject) {
    guestModeratorsVm.currentUserRole = changesObject.guest.currentValue && changesObject.guest.currentValue.myRole;

    if (!changesObject.guest.previousValue.uuid) {
      return;
    }

    if (changesObject.guest.previousValue.uuid !== changesObject.guest.currentValue.uuid) {
      fetchModerators();
    }
  }

  function fetchModerators() {
    guestModeratorsVm.status = 'loading';

    if (guestModeratorsVm.MODERATOR_ROLES.includes(guestModeratorsVm.guest.myRole)) {
      return guestRestService.listGuestModerator(guestModeratorsVm.guest.uuid)
        .then(moderators => {
          guestModeratorsVm.status = 'loaded';
          guestModeratorsVm.moderators = moderators;
        })
        .catch(() => {
          guestModeratorsVm.status = 'error';
        });
    }

    return $q.when().then(() => {
      guestModeratorsVm.status = 'loaded';
    });
  }

  function toggleRoleFilter(role) {
    if (guestModeratorsVm.moderatorFilter.role === role ) {
      delete guestModeratorsVm.moderatorFilter.role;

      return;
    }

    guestModeratorsVm.moderatorFilter.role = role;
  }

  function changePropertyOrderBy(orderParam, $event) {
    guestModeratorsVm.propertyOrderBy = orderParam;
    guestModeratorsVm.propertyOrderByAsc =
        guestModeratorsVm.propertyOrderBy === orderParam ? !guestModeratorsVm.propertyOrderByAsc : true;

    const mappingOrderFields = {
      name: 'account.name',
      role: 'role'
    };

    guestModeratorsVm.moderators = _.orderBy(guestModeratorsVm.moderators, [mappingOrderFields[orderParam]], [guestModeratorsVm.propertyOrderByAsc ? 'asc' : 'desc']);
    angular.element('.sort-dropdown a').removeClass('selected-sorting').promise().done(() => {
      angular.element($event.currentTarget).addClass('selected-sorting');
    });
  }

  function updateModeratorRole(moderator, role) {
    moderator.role = role;
    guestRestService.updateGuestModerator(moderator).then(() => {
      if (moderator.account.uuid === guestModeratorsVm.currentUser.uuid) {
        fetchModerators();
      }
    });
  }

  function removeModerator(moderator) {
    guestRestService.removeGuestModerator(moderator).then(deleted => {
      if (moderator.account.uuid === guestModeratorsVm.currentUser.uuid) {
        guestModeratorsVm.currentUserRole = 'NONE';
        guestModeratorsVm.moderators = [];
      }

      _.remove(guestModeratorsVm.moderators, moderator => moderator.uuid === deleted.uui);
    });
  }
}
