'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalActaLiquidacionCtrl
 * @description
 * # SeguimientoycontrolLegalActaLiquidacionCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalActaLiquidacionCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];



    var self= this;

    self.generarActa = function(){
      swal(
        'Buen trabajo!',
        'Se ha generado el acta, se iniciará la descarga',
        'success'
      );
    };

  });
