'use strict';

describe('Service: argoNosqlService', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var argoNosqlService;
  beforeEach(inject(function (_argoNosqlService_) {
    argoNosqlService = _argoNosqlService_;
  }));

  it('should do something', function () {
    expect(!!argoNosqlService).toBe(true);
  });

});
