angular
  .module('linshare.sharedSpace')
  .controller('workgroupSearchBoxController', workgroupSearchBoxController);

workgroupSearchBoxController.$inject = ['_', '$translate', 'moment', 'unitService', 'autocompleteUserRestService', 'WORKGROUP_SEARCH_DEFAULT_PARAMS', 'toastService'];

function workgroupSearchBoxController (_, $translate, moment, unitService, autocompleteUserRestService, WORKGROUP_SEARCH_DEFAULT_PARAMS, toastService) {
  const workgroupSearchBoxVm = this;

  workgroupSearchBoxVm.$onInit = $onInit;
  workgroupSearchBoxVm.unitService = unitService;
  workgroupSearchBoxVm.reset = reset;
  workgroupSearchBoxVm.submit = submit;
  workgroupSearchBoxVm.submitOnEnter = submitOnEnter;
  workgroupSearchBoxVm.updateTypesList = updateTypesList;
  workgroupSearchBoxVm.getSelectedFileKinds = getSelectedFileKinds;
  workgroupSearchBoxVm.addLastAuthor = addLastAuthor;
  workgroupSearchBoxVm.removeAuthor = removeAuthor;
  workgroupSearchBoxVm.userRepresentation = userRepresentation;
  workgroupSearchBoxVm.autocompleteUserRestService = autocompleteUserRestService;

  function $onInit() {
    workgroupSearchBoxVm.maxDate = moment().add(1, 'day').hours(23).minutes(59).seconds(59);
    workgroupSearchBoxVm.params = {
      sizeUnit: unitService.units.MB,
      ...WORKGROUP_SEARCH_DEFAULT_PARAMS,
      ...workgroupSearchBoxVm.params,
      types: workgroupSearchBoxVm.params && workgroupSearchBoxVm.params.types || [...WORKGROUP_SEARCH_DEFAULT_PARAMS.types],
      lastAuthors: workgroupSearchBoxVm.param && workgroupSearchBoxVm.param.lastAuthors || [...WORKGROUP_SEARCH_DEFAULT_PARAMS.lastAuthors]
    };
    workgroupSearchBoxVm.searchFiles = workgroupSearchBoxVm.params.types.includes('DOCUMENT');
    workgroupSearchBoxVm.searchFolders = workgroupSearchBoxVm.params.types.includes('FOLDER');
    workgroupSearchBoxVm.searchRevisions = workgroupSearchBoxVm.params.types.includes('DOCUMENT_REVISION');
  }

  function submit() {
    // Set end date hour to end of day
    if (workgroupSearchBoxVm.params.modificationDateBefore) {
      workgroupSearchBoxVm.params.modificationDateBefore.setHours(23, 59, 59, 999);
    }

    if (workgroupSearchBoxVm.params.creationDateBefore) {
      workgroupSearchBoxVm.params.creationDateBefore.setHours(23, 59, 59, 999);
    }

    if (!workgroupSearchBoxVm.searchFiles) {
      workgroupSearchBoxVm.params.kinds = [];
    }

    workgroupSearchBoxVm.onSubmit(workgroupSearchBoxVm.params);
  }

  function reset() {
    workgroupSearchBoxVm.params = {
      sizeUnit: unitService.units.MB,
      ...WORKGROUP_SEARCH_DEFAULT_PARAMS,
      types: [...WORKGROUP_SEARCH_DEFAULT_PARAMS.types],
      lastAuthors: [...WORKGROUP_SEARCH_DEFAULT_PARAMS.lastAuthors]
    };

    workgroupSearchBoxVm.searchFiles = workgroupSearchBoxVm.params.types.includes('DOCUMENT');
    workgroupSearchBoxVm.searchFolders = workgroupSearchBoxVm.params.types.includes('FOLDER');
    workgroupSearchBoxVm.searchRevisions = workgroupSearchBoxVm.params.types.includes('DOCUMENT_REVISION');

    submit();
  }

  function submitOnEnter($event) {
    if ($event.keyCode === 13) {
      submit();
    }
  }

  function updateTypesList(type, addToList) {
    const typeIndex = workgroupSearchBoxVm.params.types.indexOf(type);

    if (addToList && typeIndex === -1) {
      workgroupSearchBoxVm.params.types =  [...workgroupSearchBoxVm.params.types, type];
    }

    if (!addToList && typeIndex !== -1) {
      workgroupSearchBoxVm.params.types.splice(typeIndex, 1);
    }
  }

  function getSelectedFileKinds() {
    if (workgroupSearchBoxVm.params.kinds.length === 0) {
      return $translate.instant('WORKGROUP_SEARCH_BOX.TYPES.ANY');
    }

    return workgroupSearchBoxVm.params.kinds
      .map(kind => $translate.instant(`WORKGROUP_SEARCH_BOX.TYPES.${kind}`))
      .join(', ');
  }

  function userRepresentation(user) {
    if (_.isString(user)) {
      return user;
    }

    if (_.isObject(user)) {
      return `<span>${user.display}</span> <span><i class="zmdi zmdi-email"></i> &nbsp;${user.mail}'</span>`;
    }
  }

  function addLastAuthor() {
    if (
      !workgroupSearchBoxVm.lastAuthorModel ||
      workgroupSearchBoxVm.params.lastAuthors.some(author => author.accountUuid === workgroupSearchBoxVm.lastAuthorModel.accountUuid)
    ) {
      toastService.error({key: 'TOAST_ALERT.WARNING.AUTHOR_ALREADY_EXISTS'});
      workgroupSearchBoxVm.lastAuthorModel =  null;

      return;
    }

    workgroupSearchBoxVm.params.lastAuthors.push(workgroupSearchBoxVm.lastAuthorModel);
    workgroupSearchBoxVm.lastAuthorModel =  null;
  }

  function removeAuthor(event, mail) {
    event.stopPropagation();

    const selectedIndex = workgroupSearchBoxVm.params.lastAuthors.map(author => author.mail).indexOf(mail);

    if (selectedIndex >= 0) {
      workgroupSearchBoxVm.params.lastAuthors.splice(selectedIndex, 1);
    }
  }
}