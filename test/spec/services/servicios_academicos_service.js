'use strict';

describe('Service: serviciosAcademicosService', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var serviciosAcademicosService;
  beforeEach(inject(function (_serviciosAcademicosService_) {
    serviciosAcademicosService = _serviciosAcademicosService_;
  }));

  it('should do something', function () {
    expect(!!serviciosAcademicosService).toBe(true);
  });

});
