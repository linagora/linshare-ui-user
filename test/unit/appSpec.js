'use strict';

describe('/Routes test/', function() {

  beforeEach(module('linshareUiUserApp'));

  var location, route, rootScope, state;

  beforeEach(
    inject( function(_$state_, _$location_, _$rootScope_, $route) {
      location = _$location_;
      route = $route;
      rootScope = _$rootScope_;
      state = _$state_;
    }));

  describe('files route', function() {
    beforeEach(
      inject( function($httpBackend) {
        $httpBackend.whenGET('i18n/plouf/fr/general.json')
          .respond(200, 'main HTML');
        $httpBackend.whenGET('linshare/documents')
          .respond(200, 'main HTML');
        $httpBackend.whenGET('views/common/common.html')
          .respond(200, 'main HTML');
      })
    );

    it('should load the Home page on successful load of /', function(){

      state.go('documents.files');
      location.path('/files');
      rootScope.$digest();
      //expect(state.current.url).toBe('/files');

    });
  });

});
