'use strict';

describe('Service: resolucionRequest', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var resolucionRequest;
  beforeEach(inject(function (_resolucionService_) {
    resolucionRequest = _resolucionRequest_;
  }));

  it('should do something', function () {
    expect(!!resolucionRequest).toBe(true);
  });

});
