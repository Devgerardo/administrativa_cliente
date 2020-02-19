'use strict';

/**
* @ngdoc function
* @name clienteApp.controller:ResolucionReportesCtrl
* @description muestra los reportes generados con SpagoBI
* # ResolucionReportesCtrl
* Controller of the clienteApp
*/
angular.module('contractualClienteApp')
  .controller('ResolucionReportesCtrl', function (oikosRequest, adminMidRequest, resolucion, administrativaRequest, $scope, $window, $mdDialog, $translate, gridApiService) {
    var self = this;
    self.nombreReporte = "";
    self.resolucionId = 0;
    self.vigencias = [];
    
    var anio = new Date().getFullYear();
    for (var v = 2018; v <= anio; v++){
      self.vigencias.push(v);
    }

    oikosRequest.get('dependencia_tipo_dependencia', $.param({
      query: "TipoDependenciaId.Id:2",
      fields: "DependenciaId",
      limit: -1
    })).then(function (response) {
        self.facultades = response.data;
    });    

    self.consultarReporte = function() {
      if (self.facultad && self.numeroResolucion && self.vigencia) {
        administrativaRequest.get("resolucion", $.param({
          query: "IdDependencia:" + self.facultad + ",Vigencia:" + self.vigencia + ",NumeroResolucion:" + self.numeroResolucion,
          limit: 1,
          sortby: "id_resolucion",
          order: "desc"
        }, true)).then(function (resolucion) {
          if (resolucion.data !== null ){
            if (resolucion.data[0].IdTipoResolucion.Id === 1){
              administrativaRequest.get("resolucion_estado", $.param({
                query: "Resolucion.Id:" + resolucion.data[0].Id,
                limit: 1,
                sortby: "Id",
                order: "desc"
              }, true)).then(function (estado) {
                if (estado.data[0].Estado.Id === 2){
                  self.resolucionId = resolucion.data[0].Id;
                } else {
                  swal({
                    title: $translate.instant('ERROR'),
                    text: $translate.instant('RESOLUCION_NO_EXPEDIDA'),
                    type: 'error',
                    confirmButtonText: $translate.instant('ACEPTAR')
                  });
                }
              });
            } else {
              swal({
                title: $translate.instant('ERROR'),
                text: $translate.instant('RESOLUCION_NO_VINCULACION'),
                type: 'error',
                confirmButtonText: $translate.instant('ACEPTAR')
              });
            }
          } else {
            swal({
              title: $translate.instant('ERROR'),
              text: $translate.instant('NO_EXISTE_RESOLUCION'),
              type: 'error',
              confirmButtonText: $translate.instant('ACEPTAR')
            });
          }
        })
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
