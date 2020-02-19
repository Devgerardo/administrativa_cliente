'use strict';

describe('Controller: SeguimientoycontrolLegalActaReinicioCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalActaReinicioCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalActaReinicioCtrl = $controller('SeguimientoycontrolLegalActaReinicioCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalActaReinicioCtrl.awesomeThings.length).toBe(3);
  });
});
