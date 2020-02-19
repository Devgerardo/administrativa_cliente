'use strict';

angular.module('contractualClienteApp')
    .controller('ResolucionCancelacionCtrl', function(amazonAdministrativaRequest, administrativaRequest, financieraRequest, resolucion, adminMidRequest, oikosRequest, $localStorage, $scope, $mdDialog, $translate, $window) {

        var self = this;

        self.resolucion = JSON.parse(localStorage.getItem("resolucion"));
        self.estado = false;
        self.carga = false;
        self.proyectos = [];
        self.fecha = new Date();
        self.maximoSemanas = 1;
        self.fechaActual = new Date();
        self.semanasTranscurridas = 0;
        self.mostrar_cancelar = true;

        var desvinculacionesData = [];

        self.precontratados = {
            paginationPageSizes: [10, 15, 20],
            paginationPageSize: 10,
            enableRowSelection: true,
            enableRowHeaderSelection: true,
            enableFiltering: true,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: true,
            useExternalPagination: false,
            enableSelectAll: false,
            data: [],
            columnDefs: [
                { field: 'Id', visible: false },
                { field: 'NombreCompleto', width: '17%', displayName: $translate.instant('NOMBRE') },
                { field: 'IdPersona', width: '10%', displayName: $translate.instant('DOCUMENTO_DOCENTES') },
                { field: 'Categoria', width: '10%', displayName: $translate.instant('CATEGORIA') },
                { field: 'ProyectoNombre', width: '22%', displayName: $translate.instant('PROYECTO_CURRICULAR') },
                { field: 'IdDedicacion.Id', visible: false },
                { field: 'Disponibilidad', visible: false },
                { field: 'DependenciaAcademica', visible: false },
                { field: 'NumeroHorasSemanales', width: '10%', displayName: $translate.instant('HORAS_SEMANALES') },
                { field: 'NumeroSemanas', width: '7%', displayName: $translate.instant('SEMANAS') },
                { field: 'NumeroDisponibilidad', width: '9%', displayName: $translate.instant('NUM_DISPO_DOCENTE') },
                { field: 'ValorContrato', width: '13%', displayName: $translate.instant('VALOR_CONTRATO'), cellClass: "valorEfectivo", cellFilter: "currency" },
                { field: 'IdProyectoCurricular', visible: false },
                { field: 'Vigencia', visible: false },
                { field: 'NumeroContrato', visible: false },
            ],

            onRegisterApi: function (gridApi) {
                self.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function () {
                    self.personasSeleccionadas = gridApi.selection.getSelectedRows();
                    self.rps = [];
                    self.personasSeleccionadas.forEach(function (persona, indice) {
                        oikosRequest.get("dependencia/" + persona.IdProyectoCurricular).then(function (response) {
                            persona.Proyecto = response.data.Nombre;
                        });
                       self.getRPs(persona.NumeroContrato.String,persona.Vigencia.Int64, persona.IdPersona, indice);
                    });
                    if (self.personasSeleccionadas.length > 0) {
                        amazonAdministrativaRequest.get("acta_inicio", $.param({
                            query: 'NumeroContrato:' + self.personasSeleccionadas[0].NumeroContrato.String + ',Vigencia:' + self.personasSeleccionadas[0].Vigencia.Int64
                        })).then(function (response) {
                            self.acta = response.data[0];
                            self.fechaIni = new Date(self.acta.FechaInicio);
                            self.fechaActa = self.fechaUtc(self.fechaIni);
                            self.calculoSemanas();
                            self.semanasOriginales = self.personasSeleccionadas[0].NumeroSemanas;
                            self.maximoSemanas = self.semanasOriginales - self.semanasTranscurridas;
                        }); 
                    }
                });
            }
        };

        self.estado = true;
        administrativaRequest.get('modificacion_resolucion', $.param({
            limit: -1,
            query: 'ResolucionNueva:' + self.resolucion.Id
        })).then(function (response) {
            adminMidRequest.get("gestion_previnculacion/docentes_previnculados/?id_resolucion=" + response.data[0].ResolucionAnterior).then(function (response) {
                self.precontratados.data = response.data;
                self.estado = false;
                self.carga = true;
                if (self.precontratados.data === null) {
                    self.precontratados.data = [];
                }
                //self.sin_docentes_por_cancelar();
            });
        });

        oikosRequest.get("dependencia/proyectosPorFacultad/" + self.resolucion.IdFacultad + "/" + self.resolucion.NivelAcademico_nombre, "").then(function (response) {
            self.proyectos = response.data;
            self.defaultSelectedPrecont = self.proyectos[0].Id;
        });

        administrativaRequest.get("modificacion_resolucion", "limit=-1&query=ResolucionNueva:" + self.resolucion.Id).then(function (response) {
            self.resolucionModificacion = self.resolucion.Id;
            self.resolucion.Id = response.data[0].ResolucionAnterior;
            self.id_modificacion_resolucion = response.data[0].Id;

        });
        //Función para visualizar docentes ya vinculados a resolución
        self.get_docentes_vinculados = function () {

            self.estado = true;
            adminMidRequest.get("gestion_previnculacion/docentes_previnculados", "id_resolucion=" + self.resolucion.Id).then(function (response) {
                self.precontratados.data = response.data;
                self.estado = false;

            }).then(function () {
                self.carga = true;
            });
            if (self.personasSeleccionadas && self.personasSeleccionadas !== []) {
                self.personasSeleccionadas.push(self.personasSeleccionadas[0]);
            }

        };



        self.verCancelarInscripcionDocente = function (row) {
            swal({
                title: $translate.instant('PREGUNTA_SEGURO'),
                text: $translate.instant('CONFIRMAR_DESVINCULACION'),
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: $translate.instant('DESVINCULAR_DOCENTE'),
                cancelButtonText: $translate.instant('CANCELAR'),
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false,
                allowOutsideClick: false
            }).then(function () {
                self.desvincularDocente(row);
            }, function (dismiss) {
                if (dismiss === 'cancel') {
                    swal(
                        $translate.instant('CANCELADO'),
                        $translate.instant('DESVINCULACION_CANCELADA'),
                        'error'
                    );
                }
            });
        };


        self.desvincularDocente = function () {
            self.mostrar_cancelar = false;
            self.personasSeleccionadas.forEach(function (personaSeleccionada) {
                personaSeleccionada.InformacionRp = JSON.parse( personaSeleccionada.InformacionRp);
                personaSeleccionada.InformacionRp.rp =parseInt(personaSeleccionada.InformacionRp.rp,10);
                personaSeleccionada.InformacionRp.vigencia =parseInt(personaSeleccionada.InformacionRp.vigencia,10);
                var docente_a_desvincular = {
                    Id: personaSeleccionada.Id,
                    IdPersona: personaSeleccionada.IdPersona,
                    NumeroHorasSemanales: personaSeleccionada.NumeroHorasSemanales,
                    NumeroSemanas: personaSeleccionada.NumeroSemanas,
                    NumeroSemanasNuevas: self.semanasReversar,
                    IdResolucion: { Id: personaSeleccionada.IdResolucion.Id },
                    IdDedicacion: { Id: personaSeleccionada.IdDedicacion.Id },
                    IdProyectoCurricular: personaSeleccionada.IdProyectoCurricular,
                    Estado: Boolean(false),
                    FechaRegistro: self.fecha,
                    ValorContrato: personaSeleccionada.ValorContrato,
                    Categoria: personaSeleccionada.Categoria,
                    Disponibilidad: personaSeleccionada.Disponibilidad,
                    Vigencia: personaSeleccionada.Vigencia,
                    DependenciaAcademica: personaSeleccionada.DependenciaAcademica,
                    NumeroContrato: personaSeleccionada.NumeroContrato,
                    Dedicacion: personaSeleccionada.IdDedicacion.NombreDedicacion.toUpperCase(),
                    NivelAcademico:personaSeleccionada.IdResolucion.NivelAcademico,
                    NumeroRp:personaSeleccionada.InformacionRp.rp,
                    VigenciaRp:personaSeleccionada.InformacionRp.vigencia,
                    FechaInicio:personaSeleccionada.FechaInicio
                };
                desvinculacionesData.push(docente_a_desvincular);
                

            });
            var objeto_a_enviar = {
                IdModificacionResolucion: self.id_modificacion_resolucion,
                IdNuevaResolucion: self.resolucionModificacion,
                DocentesDesvincular: desvinculacionesData
            };


            adminMidRequest.post("gestion_desvinculaciones/actualizar_vinculaciones_cancelacion", objeto_a_enviar).then(function (response) {
                if (response.data === "OK") {
                    self.persona = null;
                    swal({
                        text: $translate.instant('ALERTA_DESVIN_EXITOSA'),
                        type: 'success',
                        confirmButtonText: $translate.instant('ACEPTAR'),
                        allowOutsideClick: false

                    });
                    $window.location.reload();
                } else {
                    swal({
                        title: $translate.instant('ERROR'),
                        text: $translate.instant('ALERTA_ERROR_DESVIN'),
                        type: 'error',
                        confirmButtonText: $translate.instant('ACEPTAR'),
                        allowOutsideClick: false
                    });

                }
            });


        };

        //Función para hacer el cálculo de semanas transcurridas desde la fecha de inicio hasta la fecha actual
        self.calculoSemanas = function () {
            var dias = (self.fechaUtc(self.fechaActual) - self.fechaActa) / 1000 / 60 / 60 / 24;
            if (dias > 0) {
                var semanasDecimal = dias / 30 * 4; // cálculo con base en mes de 30 días y 4 semanas
                var decimal = semanasDecimal % 1;
                self.semanasTranscurridas = semanasDecimal - decimal;
                if (decimal > 0) {
                    self.semanasTranscurridas = self.semanasTranscurridas + 1;
                }
            }
        };
        
        //Función para convertir las fechas a UTC declaradas desde el cliente (Las que vengan por gets corregirlas desde los apis)
        self.fechaUtc = function (fecha) {
            var _fechaConUtc = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), fecha.getUTCHours(), fecha.getUTCMinutes(), fecha.getUTCSeconds());
            return _fechaConUtc;
        };

        self.volver = function () {
            $window.location.href = '#/vinculacionespecial/resolucion_gestion';
        }

        self.getRPs = function(vinculacion,vigencia,identificacion, indice){

            adminMidRequest.get("gestion_previnculacion/rp_docente/"+vinculacion+"/"+vigencia+"/"+identificacion, "").then(function (response) {
            self.rps[indice] = response.data.cdp_rp_docente.cdp_rp;
            
            });

        }


    });
