'use strict';

/**
 * @ngdoc directive
 * @name financieraClienteApp.directive:listaAvances
 * @description
 * # listaAvances
 */
angular.module('contractualClienteApp')
    .directive('listaAvances', function (administrativaRequest, gridApiService, $translate, financieraRequest) {
        return {
            restrict: 'E',
            scope: {
                data: '=',
            },
            templateUrl: 'views/directives/avances/lista_avances.html',
            controllerAs: 'd_listaAvances',

            controller: function ($scope) {
                var self = this;
                self.gridOptions = {
                    enableRowSelection: true,
                    enableRowHeaderSelection: false,
                    enableFiltering: true,
                    useExternalPagination: true,
                    useExternalSorting: true,
                    showTreeExpandNoChildren: false,

                    columnDefs: [{
                        field: 'Id',
                        visible: false,
                        displayName: $translate.instant('ID_AVANCE'),
                        headerCellClass: $scope.highlightFilteredHeader + 'text-center ',
                    },
                    {
                        field: 'ProcesoExterno',
                        displayName: $translate.instant('PROCESO_EXTERNO'),
                        headerCellClass: $scope.highlightFilteredHeader + 'text-center ',
                        width: '20%',
                        visible: false,
                    },
                    {
                        field: 'Consecutivo',
                        displayName: $translate.instant('CONSECUTIVO_PROCESO_EXTERNO'),
                        headerCellClass: $scope.highlightFilteredHeader + 'text-center ',
                        width: '20%'
                    },
                    {
                        field: 'Nombre',
                        displayName: $translate.instant('NOMBRE_PROCESO_EXTERNO'),
                        headerCellClass: $scope.highlightFilteredHeader + 'text-center ',
                    }
                    ],
                    onRegisterApi: function (gridApi) {
                        self.gridApi = gridApi;
                        self.gridApi = gridApiService.pagination(self.gridApi, self.actualizarAvances, $scope);
                        self.gridApi = gridApiService.filter(self.gridApi, self.actualizarAvances, $scope);

                        self.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                            $scope.data = row.entity;
                        });
                    }
                };

                self.actualizarNombre = function (data) {
                    data.forEach(function (d,i) {
                        financieraRequest.get('solicitud_avance/' + d.ProcesoExterno,"").then(function(response) {
                            data[i].Nombre = response.data.Objetivo;
                        });
                    });
                };

                self.actualizarAvances = function (offset, query) {
                    var initQuery = "Necesidad__isnull:true";
                    query = (query === "") ? initQuery : [initQuery, query].join(",");

                    var req = administrativaRequest.get("necesidad_proceso_externo", $.param({
                        limit: self.gridOptions.paginationPageSize,
                        offset: offset,
                        query: query
                    }))
                    req.then(function (response) {
                        gridApiService.paginationFunc(self.gridOptions, offset)(response);
                        self.actualizarNombre(self.gridOptions.data);
                    });
                    return req;
                };

                self.actualizarAvances(0, "");

            }
        };
    });