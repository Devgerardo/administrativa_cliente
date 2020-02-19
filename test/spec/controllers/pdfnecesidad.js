'use strict';

describe('Controller: PdfnecesidadCtrl', function () {

  // load the controller's module
  beforeEach(module('contractualClienteApp'));

  var PdfnecesidadCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PdfnecesidadCtrl = $controller('PdfnecesidadCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(PdfnecesidadCtrl.awesomeThings.length).toBe(3);
  });
});
