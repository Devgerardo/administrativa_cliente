'use strict';

describe('Controller: SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl = $controller('SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl.awesomeThings.length).toBe(3);
  });
});
