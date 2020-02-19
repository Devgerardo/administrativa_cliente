'use strict';

describe('Controller: SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl = $controller('SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl.awesomeThings.length).toBe(3);
  });
});
