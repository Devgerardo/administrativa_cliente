'use strict';

/**
* @ngdoc function
* @name clienteApp.controller:NecesidadReportesCtrl
* @description muestra los reportes generados con SpagoBI
* # NecesidadReportesCtrl
* Controller of the clienteApp
*/
angular.module('contractualClienteApp')
  .controller('NecesidadReportesCtrl', function (necesidadService, adminMidRequest, resolucion, administrativaRequest, $scope, $window, $mdDialog, $translate, gridApiService) {
    var self = this;
    self.nombreReporte = "";
    self.resolucionId = 0;
    self.generarReporte = 0;

    necesidadService.getAllDependencias().then(function (Dependencias) {
      self.dependencias = Dependencias;
    })
    //TODO: Generar años a partir de 2018 hasta la fecha actual
    self.vigencias = [2018];

    self.consultarReporte = function() {
      if (self.dependencia && self.vigencia) {
        self.numeroElaboracion = self.numeroElaboracion ? self.numeroElaboracion : 0;
        self.generarReporte++;
      } else {
        swal({
          title: $translate.instant('ERROR'),
          text: $translate.instant('COMPLETE_CAMPOS'),
          type: 'error',
          confirmButtonText: $translate.instant('ACEPTAR')
        })
      }
    }

  });
