'use strict';

/**
 * @ngdoc directive
 * @name contractualClienteApp.directive:necesidad/visualizarNecesidad
 * @description
 * # necesidad/visualizarNecesidad
 */
angular.module('contractualClienteApp')
    .directive('visualizarNecesidad', function () {
        return {
            restrict: 'E',
            scope: {
                vigencia: '=',
                numero: '=',
                estado: '=',
            },
            templateUrl: 'views/directives/necesidad/visualizar_necesidad.html',
            controller: function (financieraRequest, administrativaRequest, agoraRequest, oikosRequest, necesidadService, coreRequest, adminMidRequest, $scope) {
                var self = this;
                self.verJustificacion = false;
                self.justificaciones_rechazo = [];
                self.v_necesidad = null;
                self.solicitud_disponibilidad = null;

                $scope.$watch('[vigencia,numero]', function () {
                    self.cargar_necesidad();
                });

                self.cargar_necesidad = function () {
                    self.verJustificacion = [
                        necesidadService.EstadoNecesidadType.Anulada.Id,
                        necesidadService.EstadoNecesidadType.Rechazada.Id,
                        necesidadService.EstadoNecesidadType.Modificada.Id,
                    ].includes($scope.estado.Id);

                    administrativaRequest.get('necesidad', $.param({
                        query: "NumeroElaboracion:" + $scope.numero + ",Vigencia:" + $scope.vigencia
                    })).then(function (response) {
                        self.v_necesidad = response.data[0];
                        if (self.verJustificacion) {
                            administrativaRequest.get('necesidad_rechazada', $.param({
                                query: "Necesidad:" + response.data[0].Id,
                                fields: "Justificacion,Fecha"
                            })).then(function (response) {
                                self.justificaciones_rechazo = response.data ? response.data : [{ Justificacion: "", Fecha: "" }];
                            });
                        }
                        administrativaRequest.get('marco_legal_necesidad', $.param({
                            query: "Necesidad:" + response.data[0].Id,
                            fields: "MarcoLegal"
                        })).then(function (response) {
                            self.marco_legal = response.data;
                        });
                        adminMidRequest.get('solicitud_necesidad/fuente_apropiacion_necesidad/' + self.v_necesidad.Id).then(function (response) {
                            self.ff_necesidad = response.data;
                        });

                        administrativaRequest.get('solicitud_disponibilidad', $.param({
                            query: "Necesidad:" + response.data[0].Id,
                        })).then(function (response) {
                            self.solicitud_disponibilidad =  
                            (response.data != null && response.data.length > 0) ?
                                response.data[0]: {Numero: ''};
                        });

                        administrativaRequest.get('dependencia_necesidad', $.param({
                            query: "Necesidad:" + response.data[0].Id,
                            fields: "JefeDependenciaSolicitante,JefeDependenciaDestino,OrdenadorGasto"
                        })).then(function (response) {
                            self.dependencias = response.data[0];

                            coreRequest.get('jefe_dependencia', $.param({
                                query: 'Id:' + response.data[0].JefeDependenciaSolicitante
                            })).then(function (response) {
                                agoraRequest.get('informacion_persona_natural', $.param({
                                    query: 'Id:' + response.data[0].TerceroId
                                })).then(function (response2) {
                                    self.jefe_dependencia_solicitante = response2.data[0];
                                });
                                oikosRequest.get('dependencia', $.param({
                                    query: 'Id:' + response.data[0].DependenciaId
                                })).then(function (response3) {
                                    self.dependencia_solicitante = response3.data[0];
                                });
                            });

                            coreRequest.get('jefe_dependencia', $.param({
                                query: 'Id:' + response.data[0].JefeDependenciaDestino
                            })).then(function (response) {
                                agoraRequest.get('informacion_persona_natural', $.param({
                                    query: 'Id:' + response.data[0].TerceroId
                                })).then(function (response2) {
                                    self.jefe_dependencia_destino = response2.data[0];
                                });
                                oikosRequest.get('dependencia', $.param({
                                    query: 'Id:' + response.data[0].DependenciaId
                                })).then(function (response3) {
                                    self.dependencia_destino = response3.data[0];
                                });
                            });


                            agoraRequest.get('informacion_persona_natural', $.param({
                                query: 'Id:' + response.data[0].OrdenadorGasto
                            })).then(function (response) {
                                self.ordenador_gasto = response.data[0];
                            });
                        });
                    });
                };

            },
            controllerAs: 'd_visualizarNecesidad'
        };
    });