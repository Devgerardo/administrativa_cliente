'use strict';

describe('Controller: SeguimientoycontrolPlanTrabajoDocenteAprobacionCoordinadorPlanTrabajoCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolPlanTrabajoDocenteAprobacionCoordinadorPlanTrabajoCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolPlanTrabajoDocenteAprobacionCoordinadorPlanTrabajoCtrl = $controller('SeguimientoycontrolPlanTrabajoDocenteAprobacionCoordinadorPlanTrabajoCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolPlanTrabajoDocenteAprobacionCoordinadorPlanTrabajoCtrl.awesomeThings.length).toBe(3);
  });
});
