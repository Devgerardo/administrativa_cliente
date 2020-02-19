'use strict';

angular.module('contractualClienteApp')
    .controller('ResolucionAdicionCtrl', function (financieraMidRequest, amazonAdministrativaRequest, administrativaRequest, financieraRequest, resolucion, adminMidRequest, oikosRequest, colombiaHolidaysService, $localStorage, $scope, $mdDialog, $translate, $window, gridApiService) {

        var self = this;

        self.resolucion = JSON.parse(localStorage.getItem("resolucion"));
        self.estado = false;
        self.proyectos = [];
        self.vigencia_data = self.resolucion.Vigencia;
        self.fecha = new Date();
        self.saldo_disponible = true;
        self.semanasTranscurridas = 0;
        var desvinculacionesData = [];
        self.offset = 0;
        self.cambio_disp = false;
        self.mostrar_modificar = true;

        self.precontratados = {
            paginationPageSizes: [10, 15, 20],
            paginationPageSize: 10,
            enableRowSelection: false,
            enableRowHeaderSelection: false,
            enableFiltering: true,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: true,
            useExternalPagination: false,
            enableSelectAll: false,
            columnDefs: [
                { field: 'Id', visible: false },
                { field: 'FechaRegistro', visible: false },
                { field: 'FechaInicio', visible: false },
                { field: 'NombreCompleto', width: '15%', displayName: $translate.instant('NOMBRE') },
                { field: 'IdPersona', width: '10%', displayName: $translate.instant('DOCUMENTO_DOCENTES') },
                { field: 'Categoria', width: '10%', displayName: $translate.instant('CATEGORIA') },
                { field: 'ProyectoNombre', width: '23%', displayName: $translate.instant('PROYECTO_CURRICULAR') },
                { field: 'IdDedicacion.Id', visible: false },
                { field: 'Disponibilidad', visible: false },
                { field: 'DependenciaAcademica', visible: false },
                { field: 'NumeroHorasSemanales', width: '8%', displayName: $translate.instant('HORAS_SEMANALES') },
                { field: 'NumeroSemanas', width: '7%', displayName: $translate.instant('SEMANAS') },
                { field: 'NumeroDisponibilidad', width: '9%', displayName: $translate.instant('NUM_DISPO_DOCENTE') },
                { field: 'ValorContrato', width: '11%', displayName: $translate.instant('VALOR_CONTRATO'), cellClass: "valorEfectivo", cellFilter: "currency" },
                {
                    field: 'IdProyectoCurricular',
                    visible: false,
                    filter: {
                        term: self.term
                    }
                },
                { field: 'Vigencia', visible: false },
                { field: 'NumeroContrato', visible: false },
                {
                    field: 'cancelar',
                    enableSorting: false,
                    enableFiltering: false,
                    width: '8%',
                    displayName: $translate.instant('OPCIONES'),
                    cellTemplate: '<center>' +
                        '<a class="borrar" ng-click="grid.appScope.mostrar_modal_adicion(row)">' +
                        '<i title="{{\'ADICIONAR_BTN\' | translate }}" class="fa fa-plus-circle  faa-shake animated-hover"></i></a></div>' +
                        '</center>'
                }
            ],

            onRegisterApi: function (gridApi) {
                self.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function () {
                    self.personasSeleccionadas = gridApi.selection.getSelectedRows();

                });
            }
        };

        self.Disponibilidades = {
            paginationPageSizes: [10, 15, 20],
            paginationPageSize: 10,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableFiltering: true,
            multiSelect: false,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: true,
            useExternalPagination: true,
            enableSelectAll: false,
            columnDefs: [{
                field: 'NumeroDisponibilidad',
                displayName: $translate.instant('NUM_DISPO_DOCENTE')
            },
            {
                field: 'Vigencia',
                displayName: $translate.instant('VIGENCIA_DISP')
            },
            {
                field: 'FechaRegistro',
                displayName: $translate.instant('FECHA_DISP'),
                cellTemplate: '<span>{{row.entity.FechaRegistro| date:"yyyy-MM-dd":"+0900"}}</span>'
            }
            ],

            onRegisterApi: function (gridApi) {
                self.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function () {
                    self.disponibilidad_elegida = gridApi.selection.getSelectedRows();
                    if (self.disponibilidad_elegida.length == 0) {
                        self.disponibilidad_nueva = self.disponibilidad_anterior;
                    } else {
                        self.disponibilidad_nueva = [];
                        self.DisponibilidadApropiacion = self.disponibilidad_elegida[0].DisponibilidadApropiacion;
                        self.listar_apropiaciones();
                    }
                });

                self.gridApi = gridApiService.pagination(self.gridApi, self.actualizarLista, $scope);
                self.gridApi = gridApiService.filter(self.gridApi, self.actualizarLista, $scope);
            }
        };

        self.Apropiaciones = {
            paginationPageSizes: [10, 15, 20],
            paginationPageSize: 10,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableFiltering: true,
            multiSelect: false,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: true,
            useExternalPagination: false,
            enableSelectAll: false,
            columnDefs: [

                {
                    field: 'Valor',
                    cellFilter: "currency",
                    displayName: $translate.instant('VALOR_APROPIACION')
                },
                {
                    field: 'Apropiacion.Saldo',
                    cellFilter: "currency",
                    displayName: $translate.instant('SALDO_APROPIACION')
                }
            ],

            onRegisterApi: function (gridApi) {
                self.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function () {
                    self.apropiacion_elegida = gridApi.selection.getSelectedRows();
                    if (self.apropiacion_elegida.length != 0) {
                        self.disponibilidad_nueva = self.apropiacion_elegida[0];
                    } else {
                        self.disponibilidad_nueva = [];
                    }
                });
            }
        };

        oikosRequest.get("dependencia/proyectosPorFacultad/" + self.resolucion.IdFacultad + "/" + self.resolucion.NivelAcademico_nombre, "").then(function (response) {
            self.proyectos = response.data;
            self.defaultSelectedPrecont = self.proyectos[0].Id;
        });

        administrativaRequest.get("modificacion_resolucion", "limit=-1&query=ResolucionNueva:" + self.resolucion.Id).then(function (response) {
            self.resolucionModificacion = self.resolucion.Id;
            self.resolucion.Id = response.data[0].ResolucionAnterior;
            self.resolucion_id_nueva = response.data[0].ResolucionNueva;
            self.id_modificacion_resolucion = response.data[0].Id;
            self.get_docentes_vinculados().then(function () {
                //   //refresca una vez cargados los docentes precontratados
                self.precontratados.gridApi.core.refresh();
            });
        });
        //Función para visualizar docentes ya vinculados a resolución
        self.get_docentes_vinculados = function () {

            self.estado = true;
            adminMidRequest.get("gestion_previnculacion/docentes_previnculados", "id_resolucion=" + self.resolucion.Id).then(function (response) {
                self.precontratados.data = response.data;
                self.estado = false;

            });

            self.precontratados.columnDefs[12].filter.term = self.term;


        };


        $scope.mostrar_modal_adicion = function (row) {
            self.persona_a_modificar = row.entity;
            //Consulta si el semáforo está completo (nueva carga académica aprobada)
            adminMidRequest.post("gestion_desvinculaciones/consultar_categoria", self.persona_a_modificar).then(function (response) {
                if (response.data === "OK") {
                    self.cambio_disp = false;
                    self.Apropiaciones.data = [];
                    self.horas_actuales = row.entity.NumeroHorasSemanales;
                    self.semanas_actuales = row.entity.NumeroSemanas;
                    self.disponibilidad_actual = row.entity.NumeroDisponibilidad;
                    self.disponibilidad_actual_id = row.entity.Disponibilidad;
                    
                    financieraRequest.get("disponibilidad/TotalDisponibilidades/" + self.vigencia_data, 'UnidadEjecutora=1')
                        .then(function (response) {
                            self.Disponibilidades.totalItems = response.data;
                            self.actualizarLista(self.offset, '');
                        });
                    amazonAdministrativaRequest.get("acta_inicio", $.param({
                        query: 'NumeroContrato:' + self.persona_a_modificar.NumeroContrato.String + ',Vigencia:' + self.persona_a_modificar.Vigencia.Int64
                    })).then(function (response) {
                        self.acta = response.data[0];
                        self.fechaIni = new Date(self.acta.FechaInicio);
                        self.fechaActa = self.fechaUtc(self.fechaIni);
                        if (self.FechaInicio == undefined) {
                            self.calculoSemanasTranscurridas(self.fecha);
                            self.maximoSemanasSugeridas = self.semanas_actuales - self.semanasTranscurridas;
                            self.maximoSugeridasInicial = self.maximoSemanasSugeridas;
                            self.maximoSemanasAdicionar = self.semanas_actuales;
                        }
                        financieraRequest.get("disponibilidad/", $.param({query: "DisponibilidadApropiacion.Id:" + self.disponibilidad_actual_id})).then(function (response) {
                            self.disponibilidad_anterior = response.data[0].DisponibilidadApropiacion[0];
                            self.disponibilidad_nueva = self.disponibilidad_anterior;
                            $('#modal_adicion').modal('show');
                        });
                    });
                } else {
                    swal({
                        title: $translate.instant('NO_PUEDE_ADICIONAR'),
                        text: $translate.instant('DEBE_APROBAR_CARGA'),
                        type: 'warning',
                        confirmButtonText: $translate.instant('ACEPTAR')
                    });
                }
            });
        };

        self.actualizarLista = function (offset, query) {
            var req = financieraMidRequest.get('disponibilidad/ListaDisponibilidades/' + self.vigencia_data,
                $.param({
                    limit: self.Disponibilidades.paginationPageSize,
                    offset: offset,
                    query: typeof (query) === "string" ? query : query.join(","),
                    UnidadEjecutora: 1
                }));
            req.then(gridApiService.paginationFunc(self.Disponibilidades, offset));
            return req;
        };

        self.listar_apropiaciones = function () {

            var disponibilidadAp = self.DisponibilidadApropiacion;
            adminMidRequest.post("consultar_disponibilidades/listar_apropiaciones", disponibilidadAp).then(function (response) {
                self.Apropiaciones.data = response.data;
            });

        };

        self.RecargarDatosPersonas = function () {
            adminMidRequest.get("gestion_previnculacion/Precontratacion/docentes_x_carga_horaria", "vigencia=" + self.resolucion.Vigencia + "&periodo=" + self.resolucion.Periodo + "&tipo_vinculacion=" + self.resolucion.Dedicacion + "&facultad=" + self.resolucion.IdFacultad).then(function (response) {
                self.datosDocentesCargaLectiva.data = response.data;

            });
        };

        self.RecargarDisponibilidades = function () {
            financieraRequest.get('disponibilidad', "limit=-1?query=Vigencia:" + self.vigencia_data).then(function (response) {
                self.Disponibilidades.data = response.data;

            });
        };

        self.RecargarApropiaciones = function () {
            self.Apropiaciones.data = [];

        };

        self.Calcular_horas_totales = function () {
            self.horas_totales = parseInt(self.horas_actuales) + parseInt(self.horas_a_adicionar);

        };

        self.Calcular_semanas_totales = function () {
            self.semanas_totales = parseInt(self.semanas_actuales) + parseInt(self.semanas_a_adicionar);

        };

        self.cambiar_disponibilidad = function () {
            self.cambio_disp = !self.cambio_disp;
        };

        self.realizar_nueva_vinculacion = function () {
            if (self.disponibilidad_nueva != undefined && self.disponibilidad_nueva.length != 0){
                if (self.semanas_a_adicionar != undefined && self.horas_a_adicionar != undefined && self.FechaInicio != undefined) {
                    if (self.semanas_a_adicionar <= self.semanasRestantes) {
                        self.mostrar_modificar = false;
                        var vinculacionDocente = {
                            Id: self.persona_a_modificar.Id,
                            FechaRegistro: self.persona_a_modificar.FechaRegistro,
                            IdPersona: self.persona_a_modificar.IdPersona,
                            NumeroHorasSemanales: parseInt(self.horas_actuales),
                            NumeroHorasNuevas: parseInt(self.horas_a_adicionar),
                            NumeroSemanas: parseInt(self.semanas_actuales),
                            NumeroSemanasNuevas: parseInt(self.semanas_a_adicionar),
                            NumeroSemanasRestantes: parseInt(self.semanasRestantes),
                            IdResolucion: { Id: self.persona_a_modificar.IdResolucion.Id },
                            IdDedicacion: { Id: parseInt(self.persona_a_modificar.IdDedicacion.Id) },
                            IdProyectoCurricular: parseInt(self.persona_a_modificar.IdProyectoCurricular),
                            Categoria: self.persona_a_modificar.Categoria.toUpperCase(),
                            ValorContrato: self.persona_a_modificar.ValorContrato,
                            Dedicacion: self.persona_a_modificar.IdDedicacion.NombreDedicacion.toUpperCase(),
                            NivelAcademico: self.resolucion.NivelAcademico_nombre,
                            Disponibilidad: parseInt(self.disponibilidad_actual_id),
                            Vigencia: { Int64: parseInt(self.resolucion.Vigencia), valid: true },
                            NumeroContrato: self.persona_a_modificar.NumeroContrato,
                            FechaInicio: self.persona_a_modificar.FechaInicio,
                            FechaInicioNueva: self.FechaInicio,
                            DependenciaAcademica: self.persona_a_modificar.DependenciaAcademica,
                        };

                        desvinculacionesData[0] = vinculacionDocente;

                        var objeto_a_enviar = {
                            IdModificacionResolucion: self.id_modificacion_resolucion,
                            IdNuevaResolucion: self.resolucion_id_nueva,
                            DisponibilidadNueva: self.disponibilidad_nueva,
                            TipoDesvinculacion: "Adición",
                            DocentesDesvincular: desvinculacionesData
                        };
                        adminMidRequest.post("gestion_desvinculaciones/validar_saldo_cdp", objeto_a_enviar).then(function (response) {
                            self.mostrar_modificar = true;
                            if (response.data == "OK") {
                                self.realizarAdicion(objeto_a_enviar);
                            } else {
                                swal({
                                    title: $translate.instant('PREGUNTA_SEGURO'),
                                    text: $translate.instant('CDP_SIN_SALDO'),
                                    type: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#3085d6',
                                    cancelButtonColor: '#d33',
                                    confirmButtonText: $translate.instant('VINCULAR_DOCENTES'),
                                    cancelButtonText: $translate.instant('CANCELAR'),
                                    confirmButtonClass: 'btn btn-success',
                                    cancelButtonClass: 'btn btn-danger',
                                    buttonsStyling: false,
                                    allowOutsideClick: false
                                }).then(function () {
                                    self.mostrar_modificar = false;
                                    self.realizarAdicion(objeto_a_enviar);
                                }, function (dismiss) {
                                    self.mostrar_modificar = true;
                                });
                            }
                        });
                    }
                }
            } else {
                swal({
                    title: $translate.instant('ERROR'),
                    text: $translate.instant('ERROR_ELEG_DISP'),
                    type: 'info',
                    confirmButtonText: $translate.instant('ACEPTAR')
                });
            }
        };

        self.realizarAdicion = function (objetoAdicion) {
            adminMidRequest.post("gestion_desvinculaciones/adicionar_horas", objetoAdicion).then(function (response) {
                if (response.data == "OK") {
                    swal({
                        text: $translate.instant('ALERTA_ADICION_EXITOSA'),
                        type: 'success',
                        confirmButtonText: $translate.instant('ACEPTAR')

                    });
                    //LIMPIAR GRID
                    desvinculacionesData = [];
                    $window.location.reload();
                } else {
                    swal({
                        title: $translate.instant('ERROR'),
                        text: $translate.instant('ALERTA_ERROR_ADICION'),
                        type: 'info',
                        confirmButtonText: $translate.instant('ACEPTAR')
                    });
                    //LIMPIAR GRID
                    desvinculacionesData = [];
                    $window.location.reload();
                }
            });
        }

        //Función para hacer el cálculo de semanas entre la fecha de inicio original hasta la fecha de inicio de la adición
        //Función para hacer el cálculo de semanas en dos casos:
        //(1) Entre la fecha de inicio original y la fecha actual para determinar el máximo de semanas a adicionar
        //(2) Entre la fecha de inicio original y la fecha de inicio escogida en la adición para determinar las semanas restantes
        self.calculoSemanasTranscurridas = function (fechaCalculo) {
            var dias = (fechaCalculo - self.fechaActa) / 1000 / 60 / 60 / 24;
            if (dias > 0) {
                var semanasDecimal = dias / 30 * 4; // cálculo con base en mes de 30 días y 4 semanas
                var decimal = semanasDecimal % 1;
                self.semanasTranscurridas = semanasDecimal - decimal;
                if (decimal > 0) {
                    self.semanasTranscurridas = self.semanasTranscurridas + 1;
                }
            } else {
                self.semanasTranscurridas = 0;
            }
        };

        self.CalculoSemanasRestantes = function () {
            self.calculoSemanasTranscurridas(self.FechaInicio);
            self.semanasRestantes = self.semanas_actuales - self.semanasTranscurridas;
            self.maximoSemanasAdicionar = self.semanasRestantes;
            self.maximoSemanasSugeridas = self.maximoSugeridasInicial;
            if (self.FechaInicio > self.fecha) {
                self.maximoSemanasSugeridas = self.semanasRestantes;
            }
        }

        //Función para convertir las fechas a UTC declaradas desde el cliente (Las que vengan por gets corregirlas desde los apis)
        self.fechaUtc = function (fecha) {
            var _fechaConUtc = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), fecha.getUTCHours(), fecha.getUTCMinutes(), fecha.getUTCSeconds());
            return _fechaConUtc;
        };
        $scope.validarFecha = colombiaHolidaysService.validateDate;
    });
