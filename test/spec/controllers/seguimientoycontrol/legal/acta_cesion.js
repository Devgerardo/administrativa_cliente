'use strict';

describe('Controller: SeguimientoycontrolLegalActaCesionCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalActaCesionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalActaCesionCtrl = $controller('SeguimientoycontrolLegalActaCesionCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalActaCesionCtrl.awesomeThings.length).toBe(3);
  });
});
