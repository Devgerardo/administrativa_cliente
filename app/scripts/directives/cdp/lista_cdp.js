'use strict';

/**
 * @ngdoc directive
 * @name contractualClienteApp.directive:cdp/listaCdp
 * @description
 * # cdp/listaCdp
 */
angular.module('contractualClienteApp')
    .directive('listaCdp', function(financieraRequest, financieraMidRequest, agoraRequest, administrativaRequest) {
        return {
            restrict: 'E',
            scope: {
                gridOptions_rubros: '=',
                cdp: '=',
                rubros: '=',
                necesidad: '='
            },
            templateUrl: 'views/directives/cdp/lista_cdp.html',
            controller: function($scope) {
                var self = this;
                self.gridOptions_cdp = {
                    enableRowSelection: true,
                    enableRowHeaderSelection: false,
                    enableFiltering: true,

                    columnDefs: [
                        { field: 'Id', visible: false },
                        { field: 'Vigencia', displayName: 'Vigencia' },
                        { field: 'NumeroDisponibilidad', displayName: 'Consecutivo' },
                        { field: 'Solicitud.SolicitudDisponibilidad.Necesidad.Objeto', displayName: 'Objeto' },
                        { field: 'Solicitud..DependenciaSolicitante.Nombre', displayName: 'Ordenador' },
                    ]

                };



                financieraRequest.get('disponibilidad', 'limit=-1').then(function(response) {
                    self.gridOptions_cdp.data = response.data;
                    angular.forEach(self.gridOptions_cdp.data, function(data) {
                        financieraMidRequest.get('disponibilidad/SolicitudById/' + data.Solicitud, '').then(function(response) {
                            data.Solicitud = response.data[0];
                        });

                    });
                });

                self.gridOptions_cdp.onRegisterApi = function(gridApi) {
                    //set gridApi on scope

                    self.gridApi = gridApi;
                    gridApi.selection.on.rowSelectionChanged($scope, function(row) {
                        $scope.cdp = row.entity;
                        var CdpId = $scope.cdp.Solicitud.SolicitudDisponibilidad.Id;
                        administrativaRequest.get('solicitud_disponibilidad', 'query=Id:' + CdpId).then(function(responseN) {
                            $scope.necesidad = responseN.data[0];
                        });
                        financieraRequest.get('disponibilidad_apropiacion', 'limit=-1&query=Disponibilidad.Id:' + $scope.cdp.Id).then(function(response) {

                            $scope.rubros = response.data;

                            angular.forEach($scope.rubros, function(data) {
                                var rp = {
                                    Disponibilidad: data.Disponibilidad, // se construye rp auxiliar para obtener el saldo del CDP para la apropiacion seleccionada
                                    Apropiacion: data.Apropiacion
                                };
                                financieraRequest.post('disponibilidad/SaldoCdp', rp).then(function(response) {
                                    data.Saldo = response.data;
                                });

                            });
                        });
                    });
                };
                self.gridOptions_cdp.multiSelect = false;
            },
            controllerAs: 'd_listaCdp'
        };
    });