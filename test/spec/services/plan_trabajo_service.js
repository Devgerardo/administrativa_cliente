'use strict';

describe('Service: planTrabajoService', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var planTrabajoService;
  beforeEach(inject(function (_planTrabajoService_) {
    planTrabajoService = _planTrabajoService_;
  }));

  it('should do something', function () {
    expect(!!planTrabajoService).toBe(true);
  });

});
