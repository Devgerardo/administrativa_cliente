'use strict';

describe('Service: planTrabajoMidService', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var planTrabajoMidService;
  beforeEach(inject(function (_planTrabajoMidService_) {
    planTrabajoMidService = _planTrabajoMidService_;
  }));

  it('should do something', function () {
    expect(!!planTrabajoMidService).toBe(true);
  });

});
