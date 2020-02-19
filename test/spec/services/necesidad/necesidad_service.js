'use strict';

describe('Service: necesidadService', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var necesidadService;
  beforeEach(inject(function (_necesidadService_) {
    necesidadService = _necesidadService_;
  }));

it('should do something', function () {
  expect(!!necesidadService).toBe(true);
});

});
