'use strict';

describe('Directive: gridResize', function () {

  // load the directive's module
  beforeEach(module('contractualClienteApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<grid-resize></grid-resize>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the gridResize directive');
  }));
});
