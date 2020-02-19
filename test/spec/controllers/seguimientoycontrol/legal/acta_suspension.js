'use strict';

describe('Controller: SeguimientoycontrolLegalActaSuspensionCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var SeguimientoycontrolLegalActaSuspensionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SeguimientoycontrolLegalActaSuspensionCtrl = $controller('SeguimientoycontrolLegalActaSuspensionCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(SeguimientoycontrolLegalActaSuspensionCtrl.awesomeThings.length).toBe(3);
  });
});
