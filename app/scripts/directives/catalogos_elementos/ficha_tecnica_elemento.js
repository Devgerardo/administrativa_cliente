'use strict';

/**
 * @ngdoc directive
 * @name contractualClienteApp.directive:catalogosElementos/fichaTecnicaElemento
 * @description
 * # catalogosElementos/fichaTecnicaElemento
 */
angular.module('contractualClienteApp')
  .directive('catalogosElementos/fichaTecnicaElemento', function () {
    return {
      restrict: 'E',
      templateUrl: 'add-view.html',
      controller:function(){
      },
      controllerAs:'d_catalogosElementos/fichaTecnicaElemento'
    };
  });
