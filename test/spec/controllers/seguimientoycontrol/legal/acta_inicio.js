'use strict';

describe('Controller: SeguimientoycontrolLegalActaInicioCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalActaInicioCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalActaInicioCtrl = $controller('SeguimientoycontrolLegalActaInicioCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalActaInicioCtrl.awesomeThings.length).toBe(3);
  });
});
