'use strict';

describe('Unit test for menuService', function() {
  beforeEach(module('linshareUiUserApp'));

  var menuService;

  beforeEach(inject(function(_MenuService_) {
    menuService = _MenuService_;
  }));

  it('should return a not null tab', function() {
    expect(menuService.getAvailableTabs()).not.toBeNull();
  });

});
