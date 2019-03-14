'use strict';

describe('Service: implicitToken', function () {

  // load the service's module
  beforeEach(module('contractualClienteApp'));

  // instantiate service
  var implicitToken;
  beforeEach(inject(function (_implicitToken_) {
    implicitToken = _implicitToken_;
  }));

  it('should do something', function () {
    expect(!!implicitToken).toBe(true);
  });

});
