'use strict';

/**
 * @ngdoc directive
 * @name contractualClienteApp.directive:apropiaciones/fuentesApropiacion
 * @description
 * # apropiaciones/fuentesApropiacion
 */
angular.module('contractualClienteApp')
  .directive('fuentesApropiacion', function (financieraRequest) {
    return {
      restrict: 'E',
      scope: {
        apropiacion: '=',
        fuenteapropiacion: '=',
        initFuenteapropiacion: '=?',
        dependenciasolicitante: '='
      },
      templateUrl: 'views/directives/apropiaciones/fuentes_apropiacion.html',
      controller: function ($scope, $translate) {
        var self = this;
        $scope.fuente = $translate.instant('FUENTE');

        self.gridOptions = {
          paginationPageSizes: [5, 10, 15],
          paginationPageSize: 5,
          enableRowSelection: true,
          enableFiltering: true,
          enableRowHeaderSelection: false,
          useExternalPagination: false,
          enableHorizontalScrollbar: 0,
          enableVerticalScrollbar: 0,
          enableSelectAll: true,
          columnDefs: [{
            field: 'FuenteFinanciamiento.Nombre',
            displayName: $translate.instant('FUENTE'),
            headerCellClass: $scope.highlightFilteredHeader + 'text-center text-info',
            cellTooltip: function (row) {
              return row.entity.FuenteFinanciamiento.Nombre;
            }
          }
          ]
        };


        self.gridOptions.onRegisterApi = function (gridApi) {
          self.gridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged($scope, function () {
            $scope.fuenteapropiacion = self.gridApi.selection.getSelectedRows();
          });
        };

        financieraRequest.get('fuente_financiamiento_apropiacion', $.param({
          query: "Apropiacion:" + $scope.apropiacion + ",Dependencia:" + $scope.dependenciasolicitante
        })).then(function (response) {
          self.gridOptions.data = response.data;
        }).then(function (t) {
          // Se inicializa el grid api para seleccionar
          self.gridApi.grid.modifyRows(self.gridOptions.data);

          // se observa cambios en idActividades para completar $scope.actividades y seleccionar las respectivas filas en la tabla
          $scope.$watch('initFuenteApropiacion', function () {
            self.fuenteapropiacion = [];
            $scope.initFuenteapropiacion.forEach(function (fuente) {
              var tmp = self.gridOptions.data.filter(function (e) { return e.FuenteFinanciamiento.Id == fuente.FuenteFinanciamiento[0].Id })
              if (tmp.length > 0) {
                tmp[0].MontoParcial = fuente.MontoParcial;
                $scope.fuenteapropiacion.push(tmp[0]); //enriquecer actividades
                self.gridApi.selection.selectRow(tmp[0]); //seleccionar las filas
              }
            });
          });
        });

        $scope.$watch('[d_fuentesApropiacion.gridOptions.paginationPageSize, d_fuentesApropiacion.gridOptions.data]', function () {
          if ((self.gridOptions.data.length <= self.gridOptions.paginationPageSize || self.gridOptions.paginationPageSize === null) && self.gridOptions.data.length > 0) {
            $scope.gridHeight = self.gridOptions.rowHeight * 2 + (self.gridOptions.data.length * self.gridOptions.rowHeight);
            if (self.gridOptions.data.length <= 5) {
              self.gridOptions.enablePaginationControls = false;
            }
          } else {
            $scope.gridHeight = self.gridOptions.rowHeight * 3 + (self.gridOptions.paginationPageSize * self.gridOptions.rowHeight);
            self.gridOptions.enablePaginationControls = true;
          }
        }, true);


      },
      controllerAs: 'd_fuentesApropiacion'
    };
  });
