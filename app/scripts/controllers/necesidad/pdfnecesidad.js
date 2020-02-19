'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:PdfnecesidadCtrl
 * @description
 * # PdfnecesidadCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('PdfnecesidadCtrl', function (pdfMakerNecesidadesService, $scope, $routeParams, necesidadService) {
    self = this;

    $scope.IdNecesidad = $scope.IdNecesidad;

    self.generarNecesidad = function (IdNecesidad) {
      necesidadService.initNecesidad(IdNecesidad).then(function (trNecesidad) {
        $scope.trNecesidad = trNecesidad;

        pdfMakerNecesidadesService.docDefinition($scope.trNecesidad).then(function (docDefinition) {
          var a = pdfMake.createPdf(docDefinition)
          a.getDataUrl(function (outDoc) {
            document.querySelector('#vistaPDF').src = outDoc;
          });
        })


      })
    }
    self.generarNecesidad($scope.IdNecesidad);

  });
