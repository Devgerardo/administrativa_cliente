'use strict';

/**
 * @ngdoc function
 * @name clienteApp.controller:ResolucionAprobacionCtrl
 * @description
 * # ResolucionAprobacionCtrl
 * Controller of the clienteApp
 */
angular.module('contractualClienteApp')
    .controller('ResolucionAprobacionCtrl', function (administrativaRequest, adminMidRequest, titan_request, gridApiService, $scope, $window, $mdDialog, $translate) {

        var self = this;
        self.CurrentDate = new Date();

        //Tabla para mostrar los datos básicos de las resoluciones almacenadas dentro del sistema
        self.resolucionesInscritas = {
            paginationPageSizes: [10, 15, 20],
            paginationPageSize: 10,
            enableSorting: true,
            enableFiltering: true,
            enableRowSelection: false,
            enableRowHeaderSelection: false,
            useExternalPagination: true,
            useExternalFiltering: true,
            columnDefs: [{
                field: 'Id',
                visible: false
            },
            {
                field: 'FechaExpedicion',
                visible: false
            },
            {
                field: 'Facultad',
                visible: false
            },
            {
                field: 'Numero',
                cellClass: function (grid, row /*, col, rowRenderIndex, colRenderIndex*/) {
                    if (row.entity.Estado === "Cancelada") {
                        return 'resolucionCancelada';
                    } else if (row.entity.Estado === "Expedida") {
                        return 'resolucionExpedida';
                    }
                },
                width: '10%',
                displayName: $translate.instant('NUMERO')
            },
            {
                field: 'Vigencia',
                cellClass: function (grid, row /*, col, rowRenderIndex, colRenderIndex*/) {
                    if (row.entity.Estado === "Cancelada") {
                        return 'resolucionCancelada';
                    } else if (row.entity.Estado === "Expedida") {
                        return 'resolucionExpedida';
                    }
                },
                width: '10%',
                displayName: $translate.instant('VIGENCIA')
            },
            {
                field: 'FacultadNombre',
                enableFiltering: false,
                cellClass: function (grid, row /*, col, rowRenderIndex, colRenderIndex*/) {
                    if (row.entity.Estado === "Cancelada") {
                        return 'resolucionCancelada';
                    } else if (row.entity.Estado === "Expedida") {
                        return 'resolucionExpedida';
                    }
                },
                width: '15%',
                displayName: $translate.instant('FACULTAD')
            },
            {
                field: 'TipoResolucion',
                cellClass: function (grid, row/*, col, rowRenderIndex, colRenderIndex*/) {
                    if (row.entity.Estado === "Cancelada") {
                        return 'resolucionCancelada';
                    } else if (row.entity.Estado === "Expedida") {
                        return 'resolucionExpedida';
                    }
                },
                width: '15%',
                displayName: $translate.instant('TIPO_RESOLUCION')
            },
            {
                field: 'NivelAcademico',
                cellClass: function (grid, row /*, col, rowRenderIndex, colRenderIndex*/) {
                    if (row.entity.Estado === "Cancelada") {
                        return 'resolucionCancelada';
                    } else if (row.entity.Estado === "Expedida") {
                        return 'resolucionExpedida';
                    }
                },
                width: '15%',
                displayName: $translate.instant('NIVEL')
            },
            {
                field: 'Dedicacion',
                cellClass: function (grid, row /*, col, rowRenderIndex, colRenderIndex*/) {
                    if (row.entity.Estado === "Cancelada") {
                        return 'resolucionCancelada';
                    } else if (row.entity.Estado === "Expedida") {
                        return 'resolucionExpedida';
                    }
                },
                width: '10%',
                displayName: $translate.instant('DEDICACION')
            },
            {
                field: 'Estado',
                cellClass: function (grid, row /*, col, rowRenderIndex, colRenderIndex*/) {
                    if (row.entity.Estado === "Cancelada") {
                        return 'resolucionCancelada';
                    } else if (row.entity.Estado === "Expedida") {
                        return 'resolucionExpedida';
                    }
                },
                width: '15%',
                displayName: $translate.instant('ESTADO')
            },
            {
                name: $translate.instant('OPCIONES'),
                cellClass: function (grid, row /*, col, rowRenderIndex, colRenderIndex*/) {
                    if (row.entity.Estado === "Cancelada") {
                        return 'resolucionCancelada';
                    } else if (row.entity.Estado === "Expedida") {
                        return 'resolucionExpedida';
                    }
                },
                enableFiltering: false,
                width: '10%',
                //Los botones son mostrados de acuerdo alestado de las resoluciones (ver,aprobar)
                cellTemplate: '<center>' +
                    '<a class="ver" ng-click="grid.appScope.verVisualizarResolucion(row)">' +
                    '<i title="{{\'VER_BTN\' | translate }}" class="fa fa-eye fa-lg  faa-shake animated-hover"></i></a> ' +
                    '<a ng-if="row.entity.Estado==\'Solicitada\'" class="ver" ng-click="grid.appScope.verModificarEstado(row,\'APROBADA\',5)">' +
                    '<i title="{{\'APROBADA_BTN\' | translate }}" class="fa fa-check fa-lg  faa-shake animated-hover"></i></a> ' +
                    '<a ng-if="row.entity.Estado==\'Aprobada\'" class="ver" ng-click="grid.appScope.verModificarEstado(row,\'DESAPROBADA\',1)">' +
                    '<i title="{{\'DESAPROBADA_BTN\' | translate }}" class="fa fa-ban fa-lg  faa-shake animated-hover"></i></a> ' +
                    '</center>'
            }
            ],
            onRegisterApi: function (gridApi) {
                self.gridApi = gridApi;
                self.gridApi = gridApiService.pagination(self.gridApi, self.cargarDatosResolucion, $scope);
                self.gridApi = gridApiService.filter(self.gridApi, self.cargarDatosResolucion, $scope);
            }
        };

        //Funcion para cargar los datos de las resoluciones creadas y almacenadas dentro del sistema
        self.cargarDatosResolucion = function (offset, query) {
            if(query == undefined) query = "";
            var req = adminMidRequest.get("gestion_resoluciones/get_resoluciones_inscritas", $.param({
                limit: self.resolucionesInscritas.paginationPageSize,
                offset: offset,
                query: typeof (query) === "string" ? query : query.join(",")
            }), true)
            req.then(gridApiService.paginationFunc(self.resolucionesInscritas, offset));
            return req;
        };

        //Función para realizar la aprobación de la resolución
        $scope.verModificarEstado = function (row, nombreEstado, idEstado) {
            administrativaRequest.get("resolucion/" + row.entity.Id).then(function (response) {
                var Resolucion = response.data;
                var resolucion_estado = {
                    FechaRegistro: self.CurrentDate,
                    Usuario: "",
                    Estado: {
                        Id: idEstado,
                    },
                    Resolucion: Resolucion
                };
                swal({
                    title: $translate.instant('CONFIRMAR_' + nombreEstado),
                    html:
                        $translate.instant('NUMERO_RESOLUCION') + '<br>' +
                        Resolucion.NumeroResolucion,
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: $translate.instant(nombreEstado + '_BTN'),
                    cancelButtonText: $translate.instant('CANCELAR'),
                    allowOutsideClick: false
                }).then(function () {
                    self.cambiarEstado(resolucion_estado, nombreEstado);
                });
            });
        };


        //Función donde se despliega un mensaje de alerta previo a la restauración de la resolución
        $scope.verRestaurarResolucion = function (row) {
            swal({
                title: $translate.instant('PREGUNTA_RESTAURAR'),
                html: '<p><b>Número: </b>' + row.entity.Numero.toString() + '</p>' +
                    '<p><b>Facultad: </b>' + row.entity.Facultad + '</p>' +
                    '<p><b>Nivel académico: </b>' + row.entity.NivelAcademico + '</p>' +
                    '<p><b>Dedicación: </b>' + row.entity.Dedicacion + '</p>',
                type: 'success',
                showCancelButton: true,
                confirmButtonText: $translate.instant('ACEPTAR'),
                cancelButtonText: $translate.instant('CANCELAR'),
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false,
                allowOutsideClick: false
            }).then(function () {
                self.restaurarResolucion(row);
            }, function (dismiss) {
                if (dismiss === 'cancel') {
                    swal({
                        text: $translate.instant('NO_RESTAURACION_RESOLUCION'),
                        type: 'error'
                    });
                }
            });
        };

        //Función para asignar controlador de la vista resolucion_vista.html, donde se pasa por parámetro el id de la resolucion seleccionada con ayuda de $mdDialog
        $scope.verVisualizarResolucion = function (row) {

            var resolucion = {
                Id: row.entity.Id,
                Numero: row.entity.Numero,
                NivelAcademico_nombre: row.entity.NivelAcademico,
                IdFacultad: row.entity.Facultad,
                Vigencia: row.entity.Vigencia,
                Periodo: row.entity.Periodo,
                NumeroSemanas: row.entity.NumeroSemanas,
                Dedicacion: row.entity.Dedicacion,
                FacultadNombre: row.entity.FacultadNombre,
                FechaExpedicion: row.entity.FechaExpedicion,
                TipoResolucion: row.entity.TipoResolucion,
                IdDependenciaFirma: row.entity.IdDependenciaFirma,
                FacultadFirmaNombre: row.entity.FacultadFirmaNombre,
                Estado: row.entity.Estado
            };

            var local = JSON.stringify(resolucion);
            localStorage.setItem('resolucion', local);

            $mdDialog.show({
                controller: "ResolucionVistaCtrl",
                controllerAs: 'resolucionVista',
                templateUrl: 'views/vinculacionespecial/resolucion_vista.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: true,

            });
        };

        //Función para realizar la restauración y verificación de la resolución
        self.restaurarResolucion = function (row) {
            administrativaRequest.get("resolucion/" + row.entity.Id).then(function (response) {
                var nuevaResolucion = response.data;
                //Cambio de estado y fecha de expedicion de la resolucion en caso de que ya hubiese sido expedida.
                nuevaResolucion.Estado = true;
                nuevaResolucion.FechaExpedicion = null;
                //Se actualizan los datos de la resolución
                administrativaRequest.put("resolucion/RestaurarResolucion", nuevaResolucion.Id, nuevaResolucion).then(function (response) {
                    if (response.data === "OK") {
                        self.cargarDatosResolucion(self.offset, self.query);
                    }
                });
            });
        };


        //Se hace el llamado de la función para cargar datos de resoluciones
        self.cargarDatosResolucion(self.offset, self.query);


        //Función para cambiar el estado de la resolución
        self.cambiarEstado = function (resolucion_estado, estadoNuevo) {
            administrativaRequest.post("resolucion_estado", resolucion_estado).then(function (response) {
                if (response.statusText === "Created") {
                    self.cargarDatosResolucion(self.offset, self.query);
                    swal(
                        'Felicidades',
                        $translate.instant(estadoNuevo),
                        'success'
                    ).then(function () {
                        $window.location.reload();
                    });
                } else {
                    swal(
                        'Error',
                        'Ocurrió un error',
                        'error'
                    );
                }
            });
        };

    });
