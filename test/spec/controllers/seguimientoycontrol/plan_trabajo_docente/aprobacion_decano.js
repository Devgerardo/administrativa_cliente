'use strict';

describe('Controller: SeguimientoycontrolPlanTrabajoDocenteAprobacionDecanoCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolPlanTrabajoDocenteAprobacionDecanoCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolPlanTrabajoDocenteAprobacionDecanoCtrl = $controller('SeguimientoycontrolPlanTrabajoDocenteAprobacionDecanoCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolPlanTrabajoDocenteAprobacionDecanoCtrl.awesomeThings.length).toBe(3);
  });
});
