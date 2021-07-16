angular
  .module('linshare.sharedSpace')
  .constant('WORKGROUP_SEARCH_DEFAULT_PARAMS',  {
    pattern: '',
    types: ['DOCUMENT', 'FOLDER'],
    kinds: [],
    lastAuthors: [],
    creationDateAfter: null,
    creationDateBefore: null,
    modificationDateAfter: null,
    modificationDateBefore: null,
    sizeStart: null,
    sizeEnd: null
  });
