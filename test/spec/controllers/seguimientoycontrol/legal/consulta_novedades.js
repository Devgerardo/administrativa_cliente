'use strict';

describe('Controller: SeguimientoycontrolLegalConsultaNovedadesCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalConsultaNovedadesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalConsultaNovedadesCtrl = $controller('SeguimientoycontrolLegalConsultaNovedadesCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalConsultaNovedadesCtrl.awesomeThings.length).toBe(3);
  });
});
