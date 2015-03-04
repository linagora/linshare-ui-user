/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

describe('Routes test', function() {

  beforeEach(module('linshareUiUserApp'));

  var location, route, rootScope;

  beforeEach(
    inject( function(_$location_, _$route_, _$rootScope_) {
      location = _$location_;
      route = _$route_;
      rootScope = _$rootScope_;
    }));

  describe('home page route', function() {
    beforeEach(
      inject( function($httpBackend) {
        $httpBackend.expectGET('views/main.html')
          .respond(200, 'main HTML');
      })
    );

    it('should load the Home page on successful load of /', function(){
      location.path('/');
      rootScope.$digest();
      expect(route.current.controller).toBe('MainCtrl')
    });
    it('should redirect to the index path on non-existent route', function(){
      location.path('/not/a/route');
      rootScope.$digest();
      expect(route.current.controller).toBe('MainCtrl')
    })
  });

});
