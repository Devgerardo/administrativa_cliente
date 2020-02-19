'use strict';

describe('Service: administrativaRequest', function () {

  // load the service's module
  beforeEach(module('administrativaService'));

  // instantiate service
  var administrativaRequest;
  beforeEach(inject(function (_administrativaRequest_) {
    administrativaRequest = _administrativaRequest_;
  }));

  it('should do something', function () {
    expect(!!administrativaRequest).toBe(true);
  });

});
