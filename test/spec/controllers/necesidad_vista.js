'use strict';

describe('Controller: NecesidadVistaCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var NecesidadVistaCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NecesidadVistaCtrl = $controller('NecesidadVistaCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(NecesidadVistaCtrl.awesomeThings.length).toBe(3);
  });
});
