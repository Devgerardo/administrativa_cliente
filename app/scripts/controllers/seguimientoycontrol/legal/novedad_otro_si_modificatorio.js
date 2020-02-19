'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalNovedadOtroSiModificatorioCtrl
 * @description
 * # SeguimientoycontrolLegalNovedadOtroSiModificatorioCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalNovedadOtroSiModificatorioCtrl', function () {
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

      self.gridOptions.data = [{"NombreCampo":"Supervisor","Entrada":"input","Tipo":"text"},
                               {"NombreCampo":"Tipo Compromiso","Entrada":"input","Tipo":"number"},
                               {"NombreCampo":"Ordenador del Gasto","Entrada":"select","Tipo":""}];

    self.generarActa = function(){
      swal(
        'Buen trabajo!',
        'Se ha generado el acta, se iniciará la descarga',
        'success'
      );
    };

  });
