'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolLegalConsultaNovedadesCtrl
 * @description
 * # SeguimientoycontrolLegalConsultaNovedadesCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolLegalConsultaNovedadesCtrl', function () {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var self = this;
    self.gridOptions = {
      enableFiltering : true,
      enableSorting : true,
      enableRowSelection: false,
      multiSelect: false,
      enableSelectAll: false,
      columnDefs : [
        {field: 'row',  displayName: 'No',width: 50,  cellTemplate: '<div class="ui-grid-cell-contents">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>'},
        {field: 'fecharegistro',  displayName: 'Fecha de Registro',width: 150},
        {field: 'tipo' ,  displayName: 'Tipo de Novedad',width: 160},
        {field: 'numerosolicitud',  displayName: 'Número Solicitud',width: 150},
        {field: 'fechasolicitud',  displayName: 'Fecha de Solicitud',width: 150},
        {field: 'observacion',  displayName: 'Observación', width: 300},
        {field: 'motivo',  displayName: 'Motivo', width: 250},
        {field: 'accion',  displayName: 'Acción',
        cellTemplate: '<center>' +
            '<a class="ver" ng-click="grid.appScope.TiposAvance.load_row(row,\'ver\')" data-toggle="modal" data-target="#modalVer">' +
            '<i class="fa fa-eye fa-lg  faa-shake animated-hover" aria-hidden="true" data-toggle="tooltip" title="{{\'BTN.VER\' | translate }}"></i></a> ' +
            '<a class="borrar" ng-click="grid.appScope.TiposAvance.load_row(row,\'delete\');">' +
            '<i data-toggle="tooltip" title="{{\'BTN.BORRAR\' | translate }}" class="fa fa-trash fa-lg  faa-shake animated-hover" aria-hidden="true"></i></a>' +
            '</center>',
          width: 100}
      ],
      onRegisterApi : function( gridApi ) {
        self.gridApi = gridApi;
      }
    };

    self.gridOptions.data = [{"fecharegistro": "20-06-2017",
                              "tipo":"cesión",
                              "numerosolicitud":"123",
                              "fechasolicitud":"07-06-2017",
                              "observacion": "PRUEBA",
                              "motivo":"PRUEBA"},
                              {"fecharegistro": "20-06-2017",
                                                        "tipo":"suspensión",
                                                        "numerosolicitud":"123",
                                                        "fechasolicitud":"07-06-2017",
                                                        "observacion": "PRUEBA",
                                                        "motivo":"PRUEBA"}

                            ];
  });