/**
 * Created by Alpha Sall on 3/3/15.
 */
'use strict';

describe('/Routes test/', function() {

  beforeEach(module('linshareUiUserApp'));

  var location, route, rootScope;

  beforeEach(
    inject( function($injector) {
      location = $injector.get('$location');
      route = $injector.get('$route');
      rootScope = $injector.get('$rootScope');
    }));

  describe('/home page route/', function() {
    beforeEach(
      inject( function($httpBackend) {
        $httpBackend.expectGET('linshare/authentication/authorized')
          .respond(200, 'main HTML');
      })
    );

    it('should load the Home page on successful load of /', inject(function($httpBackend){
      $httpBackend.expectGET('views/home/home.html')
        .respond(200, 'main HTML');
      location.path('/home');
      rootScope.$digest();
      expect(route.current.controller).toBe('HomeController')
    }));

    it('should load login page on path call /login', inject(function ($httpBackend) {
      $httpBackend.expectGET('views/common/loginForm.html')
        .respond(200, 'login HTML');
      location.path('/login');
      rootScope.$digest();
      expect(route.current.controller).toBe('AuthenticationController');
      })
    );

    it('should load login page on path call /received', inject(function ($httpBackend) {
        $httpBackend.expectGET('views/documents/received.html')
          .respond(200, 'login HTML');
        location.path('/received');
        rootScope.$digest();
        expect(route.current.controller).toBe('ReceivedController');
      })
    );

    it('should redirect to the index path on non-existent route', inject(function($httpBackend){
      $httpBackend.expectGET('views/home/home.html')
        .respond(200, 'main HTML');
      location.path('/not/a/route');
      rootScope.$digest();
      expect(route.current.controller).toBe('HomeController')
    }))
  });

});
