'use strict';

describe('Service: coreService', function () {

  // load the service's module
  beforeEach(module('coreService'));

  // instantiate service
  var coreRequest;
  beforeEach(inject(function (_coreRequest_) {
    coreRequest = _coreRequest_;
  }));

  it('should do something', function () {
    expect(!!coreRequest).toBe(true);
  });

});
