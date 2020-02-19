'use strict';

/**
* @ngdoc directive
* @name contractualClienteApp.reportesSpagobi
* @description
* # reportesSpagobi
*/
angular.module('contractualClienteApp')
  .directive('reportesSpagobi', function () {
    return {
      restrict: "E",
      scope:{ 
          reporte: "@",
          resolucion: "@",
          dependencia: "=",
          vigencia: "=",
          necesidad: "=",
          boton: "="
      },
      template: '<div id="frame" ></div>',
      controller:function($scope){
        var sbi = Sbi.sdk;

        sbi.services.setBaseUrl({
          protocol: 'https', 
          host: 'intelligentia.udistrital.edu.co', 
          port: '8443', 
          contextPath: 'SpagoBI', 
          controllerPath: 'servlet/AdapterHTTP'
        });

        $scope.$watch('resolucion || boton', function() {
          if ($scope.reporte && $scope.reporte.length !== 0) {
            var parametros = '';
            if ($scope.resolucion) {

              parametros = 'id_resolucion=' + $scope.resolucion + '&vigencia=' + $scope.vigencia;

            } else if ($scope.dependencia && $scope.vigencia) {
              parametros = 'id_dependencia=' + $scope.dependencia + '&vigencia=' + $scope.vigencia + '&numero_elaboracion=' + $scope.necesidad;
            }
            
            function execTest() {
              var url = sbi.api.getDocumentHtml({
                documentLabel: $scope.reporte, 
                executionRole: '/spagobi/user/admin', 
                parameters: {'PARAMETERS':parametros}, 
                displayToolbar: true, 
                displaySliders: true, 
                iframe: {
                    style: 'border: 0px;',
                    height: '500px;',
                    width: '100%.'
                }
              });
              $('#frame').html('');
              $('#frame').append(url);
            };

            sbi.api.authenticate({
              params: {
                user: 'sergio_orjuela',
                password: 'sergio_orjuela'
              },
              callback: {
                fn: execTest,
                scope: this
              }
            });
          }
        });
      },
      controllerAs:'d_reportesSpagobi'
    };
  });