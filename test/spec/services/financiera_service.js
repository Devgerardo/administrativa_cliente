'use strict';

describe('Service: financieraRequest', function () {

  // load the service's module
  beforeEach(module('financieraService'));

  // instantiate service
  var financieraRequest;
  beforeEach(inject(function (_financieraRequest_) {
    financieraRequest = _financieraRequest_;
  }));

  it('should do something', function () {
    expect(!!financieraRequest).toBe(true);
  });

});
