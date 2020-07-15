angular
  .module('linshare.document')
  .run(cacheTemplates);

cacheTemplates.$inject = ['$templateCache'];

function cacheTemplates($templateCache) {
  $templateCache.put('modules/linshare.document/views/documentsList-cardHeader.html', require('./views/documentsList-cardHeader.html'));
  $templateCache.put('modules/linshare.document/views/documentsList-dropArea.html', require('./views/documentsList-dropArea.html'));
}