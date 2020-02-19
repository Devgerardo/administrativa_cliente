'use strict';

describe('Service: rolesService', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var rolesService;
  beforeEach(inject(function (_rolesService_) {
    rolesService = _rolesService_;
  }));

  it('should do something', function () {
    expect(!!rolesService).toBe(true);
  });

});
