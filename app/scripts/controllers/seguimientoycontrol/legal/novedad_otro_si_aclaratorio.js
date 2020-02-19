'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalNovedadOtroSiAclaratorioCtrl
 * @description
 * # SeguimientoycontrolLegalNovedadOtroSiAclaratorioCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalNovedadOtroSiAclaratorioCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];


        var self= this;



        self.gridOptions = {
          enableFiltering : true,
          enableSorting : true,
          enableRowSelection: false,
          multiSelect: true,
          enableSelectAll: false,
          columnDefs : [
            {field: 'NombreCampo',  displayName: 'Campo Contrato',width: 350},
          ],
          onRegisterApi : function( gridApi ) {
            self.gridApi = gridApi;
          }
        };

          self.gridOptions.data = [{"NombreCampo":"Objeto Contrato"},
                                   {"NombreCampo":"Forma Pago"}];

        self.generarActa = function(){
          swal(
            'Buen trabajo!',
            'Se ha generado el acta, se iniciará la descarga',
            'success'
          );
        };
  });
