'use strict';

describe('Controller: SeguimientoycontrolLegalNovedadOtroSiAclaratorioCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalNovedadOtroSiAclaratorioCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalNovedadOtroSiAclaratorioCtrl = $controller('SeguimientoycontrolLegalNovedadOtroSiAclaratorioCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalNovedadOtroSiAclaratorioCtrl.awesomeThings.length).toBe(3);
  });
});
