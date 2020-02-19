'use strict';

describe('Controller: SeguimientoycontrolLegalActaAdicionProrrogaCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalActaAdicionProrrogaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalActaAdicionProrrogaCtrl = $controller('SeguimientoycontrolLegalActaAdicionProrrogaCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalActaAdicionProrrogaCtrl.awesomeThings.length).toBe(3);
  });
});
