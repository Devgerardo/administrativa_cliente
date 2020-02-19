'use strict';

/**
 * @ngdoc function
 * @name clienteApp.controller:ResolucionGeneracionCtrl
 * @description
 * # ResolucionGeneracionCtrl
 * Controller of the clienteApp
 */
angular.module('contractualClienteApp')
    .controller('ResolucionGeneracionCtrl', function (adminMidRequest, administrativaRequest, oikosRequest, $mdDialog, $scope, $routeParams, $window, $translate) {

        var self = this;

        self.CurrentDate = new Date();
        self.anioPeriodo = new Date().getFullYear();
        self.objeto_facultad = {};
        self.vigencias = [];
        for (var v = 2018; v <= self.anioPeriodo; v++){
            self.vigencias.push(v);
        }
        self.resolucionesExpedidasPeriodo = {
            paginationPageSizes: [10, 15, 20],
            paginationPageSize: 10,
            enableSorting: true,
            enableFiltering: true,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            columnDefs: [{
                field: 'Id',
                visible: false
            },
            {
                field: 'FechaExpedicion',
                visible: false
            },
            {
                field: 'Estado',
                visible: false
            },
            {
                field: 'Numero',
                width: '10%',
                displayName: $translate.instant('NUMERO')
            },
            {
                field: 'Vigencia',
                width: '10%',
                displayName: $translate.instant('VIGENCIA')
            },
            {
                field: 'Periodo',
                width: '10%',
                displayName: $translate.instant('PERIODO')
            },
            {
                field: 'NombreFacultad',
                width: '27%',
                displayName: $translate.instant('FACULTAD')
            },
            {
                field: 'NivelAcademico',
                width: '15%',
                displayName: $translate.instant('NIVEL')
            },
            {
                field: 'Dedicacion',
                width: '10%',
                displayName: $translate.instant('DEDICACION')
            },
            {
                field: 'NumeroSemanas',
                width: '8%',
                displayName: $translate.instant('SEMANAS')
            },
            {
                field: 'Estado',
                width: '10%',
                displayName: $translate.instant('ESTADO')
            },


            ]
        };

        self.resolucionesExpedidasPeriodo.multiSelect = false;

        self.resolucionesExpedidasPeriodo.onRegisterApi = function (gridApi) {
            self.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                self.resolucion_a_cancelar_seleccionada = row.entity;
            });

        };

        oikosRequest.get('dependencia_tipo_dependencia', $.param({
            query: "TipoDependenciaId.Id:2",
            fields: "DependenciaId",
            limit: -1
        })).then(function (response) {
            self.facultades = response.data;
        });

        administrativaRequest.get("resolucion_vinculacion/expedidas_vigencia_periodo_vinculacion", "vigencia=" + self.anioPeriodo).then(function (response) {
            self.resolucionesExpedidasPeriodo.data = response.data;
            if (self.resolucionesExpedidasPeriodo.data !== null) {
                self.resolucionesExpedidasPeriodo.data.forEach(function (resolucion) {
                    if (resolucion.FechaExpedicion !== null) {
                        //dado que el servicio no está almacenando la Feha de expedición directamente como null, se toma el valor "0001-01-01T00:00:00Z" como tal
                        if (resolucion.FechaExpedicion.toString() === "0001-01-01T00:00:00Z") {
                            resolucion.FechaExpedicion = null;
                            resolucion.EstadoTexto = "Creada";
                        } else {
                            if (resolucion.Estado) {
                                resolucion.EstadoTexto = "Expedida";
                            } else {
                                resolucion.EstadoTexto = "Cancelada";
                            }
                        }
                    } else {
                        if (resolucion.Estado) {
                            resolucion.EstadoTexto = "Expedida";
                        } else {
                            resolucion.EstadoTexto = "Cancelada";
                        }
                    }
                    self.facultades.forEach(function (dependencia) {
                        if (dependencia.DependenciaId.Id == resolucion.Facultad){
                            resolucion.NombreFacultad = dependencia.DependenciaId.Nombre;
                        }
                    });
                });
            }
        });


        self.resolucion = {};

        administrativaRequest.get('tipo_resolucion', $.param({
            limit: -1,
            sortby: "Id",
            order: "asc"
        })).then(function (response) {
            self.tipos_resolucion = response.data;
            self.tipoResolucionDefecto = self.tipos_resolucion[0].Id;
        });



        self.crearResolucion = function () {
            self.objeto_facultad = JSON.parse(self.resolucion.facultad);
            if (self.resolucion.numero &&
                self.resolucion.facultad &&
                self.resolucion.nivelAcademico &&
                self.resolucion.dedicacion &&
                self.resolucion.numeroSemanas &&
                self.resolucion.Periodo) {
                swal({
                    title: $translate.instant('DATOS_RESOLUCION'),
                    html: '<p><b>' + $translate.instant('NUMERO') + ': </b>' + self.resolucion.numero.toString() + '</p>' +
                        '<p><b>' + $translate.instant('FACULTAD') + ': </b>' + self.objeto_facultad.Nombre + '</p>' +
                        '<p><b>' + $translate.instant('NIVEL') + ': </b>' + self.resolucion.nivelAcademico + '</p>' +
                        '<p><b>' + $translate.instant('NIVEL') + ': </b>' + self.resolucion.dedicacion + '</p>' +
                        '<p><b>' + $translate.instant('INFORMACION_CONTENIDO') + '</b></p>',
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: $translate.instant('CONFIRMAR_GUARDAR_RESOLUCION'),
                    cancelButtonText: $translate.instant('CANCELAR_GUARDAR_RESOLUCION'),
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: false,
                    allowOutsideClick: false
                }).then(function () {
                    self.guardarResolucion();
                }, function ( /*dismiss*/) { });
            }
        };

        self.guardarResolucion = function () {
            if (self.tipo_resolucion_elegida === '1') {
                self.resolucion_a_cancelar_seleccionada = [];
            }

            var tipoResolucion = {
                Id: parseInt(self.tipo_resolucion_elegida)
            };


            var resolucionData = {
                NumeroResolucion: self.resolucion.numero,
                IdDependencia: self.objeto_facultad.Id,
                NumeroSemanas: parseInt(self.resolucion.numeroSemanas),
                Periodo: parseInt(self.resolucion.Periodo),
                IdTipoResolucion: tipoResolucion,
                IdDependenciaFirma: self.firmaRector ? 7 : self.objeto_facultad.Id,
                PeriodoCarga: self.mostrarCamposCarga ? parseInt(self.resolucion.PeriodoCarga) : parseInt(self.resolucion.Periodo),
                VigenciaCarga: self.mostrarCamposCarga ? self.resolucion.VigenciaCarga : (new Date()).getFullYear()
            };

            var resolucionVinculacionDocenteData = {
                IdFacultad: self.objeto_facultad.Id,
                Dedicacion: self.resolucion.dedicacion,
                NivelAcademico: self.resolucion.nivelAcademico
            };

            var objeto_resolucion = {
                Resolucion: resolucionData,
                ResolucionVinculacionDocente: resolucionVinculacionDocenteData,
                ResolucionVieja: self.resolucion_a_cancelar_seleccionada.Id,
                NomDependencia: self.objeto_facultad.Nombre,
            };
            

            adminMidRequest.post("gestion_resoluciones/insertar_resolucion_completa", objeto_resolucion).then(function (response) {
                if (response.data) {
                    self.resolucion_creada = response.data;
                    swal({
                        text: $translate.instant('ALERTA_RESOLUCION_EXITOSA'),
                        type: 'success',
                        confirmButtonText: $translate.instant('ACEPTAR'),
                        allowOutsideClick: false
                    }).then(function () {
                        $window.location.href = '#/vinculacionespecial/resolucion_gestion';
                    });

                } else {
                    swal({
                        title: $translate.instant('ERROR'),
                        text: $translate.instant('ALERTA_ERROR_RESOLUCION'),
                        type: 'error',
                        confirmButtonText: $translate.instant('ACEPTAR')
                    }).then(function () {
                        $window.location.href = '#/vinculacionespecial/resolucion_gestion';
                    });
                }

            });


        };

        self.AsociarResolucionCancelacion = function () {

            if (self.resolucion_a_cancelar_seleccionada && self.resolucion.numero) {
                self.resolucion.nivelAcademico = self.resolucion_a_cancelar_seleccionada.NivelAcademico;
                self.resolucion.dedicacion = self.resolucion_a_cancelar_seleccionada.Dedicacion;
                self.resolucion.numeroSemanas = self.resolucion_a_cancelar_seleccionada.NumeroSemanas;
                self.resolucion.Periodo = self.resolucion_a_cancelar_seleccionada.Periodo;
                self.objeto_facultad.Id = self.resolucion_a_cancelar_seleccionada.Facultad;
                self.guardarResolucion();



            } else {
                swal({
                    title: $translate.instant('ERROR'),
                    text: $translate.instant('ALERTA_SELEC_RESOLUCION'),
                    type: 'info',
                    confirmButtonText: $translate.instant('ACEPTAR')
                });
            }

        };

    });
