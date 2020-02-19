'use strict';

describe('Controller: SeguimientoycontrolLegalActaLiquidacionCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalActaLiquidacionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalActaLiquidacionCtrl = $controller('SeguimientoycontrolLegalActaLiquidacionCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalActaLiquidacionCtrl.awesomeThings.length).toBe(3);
  });
});
