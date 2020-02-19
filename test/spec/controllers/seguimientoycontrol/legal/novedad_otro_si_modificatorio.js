'use strict';

describe('Controller: SeguimientoycontrolLegalNovedadOtroSiModificatorioCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalNovedadOtroSiModificatorioCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalNovedadOtroSiModificatorioCtrl = $controller('SeguimientoycontrolLegalNovedadOtroSiModificatorioCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalNovedadOtroSiModificatorioCtrl.awesomeThings.length).toBe(3);
  });
});
