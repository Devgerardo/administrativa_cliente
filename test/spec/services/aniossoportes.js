'use strict';

describe('Service: aniosSoportes', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var aniosSoportes;
  beforeEach(inject(function (_aniosSoportes_) {
    aniosSoportes = _aniosSoportes_;
  }));

  it('should do something', function () {
    expect(!!aniosSoportes).toBe(true);
  });

});
