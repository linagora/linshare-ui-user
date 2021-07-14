angular
  .module('linshare.sharedSpace')
  .constant('WORKGROUP_SEARCH_DEFAULT_PARAMS',  {
    pattern: '',
    type: ['DOCUMENT', 'FOLDER'],
    kind: [],
    lastAuthor: [],
    creationDateAfter: null,
    creationDateBefore: null,
    modificationDateAfter: null,
    modificationDateBefore: null,
    sizeStart: null,
    sizeEnd: null
  });
