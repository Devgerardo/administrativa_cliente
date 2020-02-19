'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:RpSolicitudPersonasCtrl
 * @description
 * # RpSolicitudPersonasCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
    .factory("contrato", function() {
        return {};
    })
    .controller('RpSolicitudPersonasCtrl', function($window, $filter, gridOptionsService, contratoRequest, requestRequest, administrativaRequest, $scope, contrato, resolucion, financieraRequest, financieraMidRequest, amazonAdministrativaRequest, adminMidRequest, $translate, disponibilidad, resolucionRequest) {
        var self = this;
        self.offset = 0;
        self.filter = '';
        var query;
        var seleccion;
        var contrato_unidad = {};
        var resoluciones = [];
        var contratos_disponibilidades = [];
        self.boton_solicitar = false;
        self.resolucion = resolucion;
        self.contrato = contrato;
        self.disponibilidad = disponibilidad;
        $scope.vigenciaModel = null;
        $scope.vigencias = null;
        var fecha_actual = new Date();
        $scope.vigencia_actual  = fecha_actual.getFullYear();
        $scope.vigencias_resoluciones = null;
        $scope.contrato_int = $translate.instant('CONTRATO');
        $scope.vigencia_contrato = $translate.instant('VIGENCIA_CONTRATO');
        $scope.contratista_nombre = $translate.instant('NOMBRE_CONTRATISTA');
        $scope.contratista_documento = $translate.instant('DOCUMENTO_CONTRATISTA');
        $scope.valor_contrato = $translate.instant('VALOR');
        self.resolucion_bool = false;
        self.cdp_bool = false;
        self.contrato_bool = false;
        $scope.radioB = 0;
        self.gridAp = null;
        self.gridApiCDP = null;
        self.gridApiResolucion = null;
        self.resolucionNumero = "";
        self.resolucionId = "";
        self.tipoResolucion = "";
        self.carga = false;
        self.disponibilidad.splice(0, self.disponibilidad.length);
        self.resolucion.splice(0, self.resolucion.length);
        self.gridOptions = {};
        amazonAdministrativaRequest.get('vigencia_contrato', "").then(function(response) {
            $scope.vigencias = response.data;

        });
        //grid modal
        self.gridOptionsResolucionPersonas = {
            enableSelectAll: false,
            enableRowHeaderSelection: false,
            enableSorting: true,
            enableFiltering: true,
            enableRowSelection: false,
            multiSelect: false,
            columnDefs: [

                { field: 'Id', visible: false },
                { field: 'Numero_contrato', width: '14%', displayName: $translate.instant('VINCULACION'), },
                { field: 'Vigencia_contrato', width: '12%', displayName: $translate.instant('VIGENCIA') },
                { field: 'Nombre_completo', width: '40%', displayName: $translate.instant('NOMBRE') },
                { field: 'Id', width: '14%', displayName: $translate.instant('DOCUMENTO') },
                { field: 'Valor_contrato', width: '20%', cellTemplate: '<div align="right">{{row.entity.Valor_contrato | currency:undefined:0 }}</div>', displayName: $translate.instant('VALOR') }
            ]
        };



        //GRID CONTRATISTAS
        self.gridOptionsContratistas = {
            enableSelectAll: false,
            enableRowHeaderSelection: false,
            enableSorting: true,
            enableFiltering: true,
            multiSelect: false,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 10,
            useExternalPagination: true,
            columnDefs: [{
                    field: 'ContratoSuscrito[0].NumeroContratoSuscrito',
                    displayName: $translate.instant('CONTRATO'),
                    width: "15%",
                    enableFiltering: true
                },
                {
                    field: 'VigenciaContrato',
                    displayName: $translate.instant('VIGENCIA_CONTRATO'),
                    visible: true,
                    width: "15%",
                    enableFiltering: false
                },
                {
                    field: 'Contratista.NomProveedor',
                    displayName: $translate.instant('NOMBRE_CONTRATISTA'),
                    width: "30%",
                    enableFiltering: false
                },
                {
                    field: 'Contratista.NumDocumento',
                    displayName: $translate.instant('DOCUMENTO_CONTRATISTA'),
                    width: "20%",
                    enableFiltering: false
                },
                {
                    field: 'ValorContrato',
                    displayName: $translate.instant('VALOR'),
                    cellTemplate: '<div align="right">{{row.entity.ValorContrato | currency:undefined:0 }}</div>',
                    enableFiltering: false
                },
            ],
            onRegisterApi: function(gridApi) {
                self.gridAp = gridApi;
            }
        };

        //<RESOLUCION GRID
        self.gridOptionsResolucion = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableSorting: true,
            enableFiltering: true,
            multiSelect: false,
            rowHeight: 40,
            columnDefs: [{
                    field: 'Resolucion.Id',
                    visible: false
                },
                {
                    field: 'Resolucion.NumeroResolucion',
                    displayName: $translate.instant('NUMERO_RESOLUCION'),
                },
                {
                    field: 'Resolucion.Vigencia',
                    displayName: $translate.instant('VIGENCIA'),
                },
                {
                    field: 'Resolucion.IdTipoResolucion.NombreTipoResolucion',
                    displayName: $translate.instant('TIPO_RESOLUCION'),
                },
                {
                    field: 'Resolucion.FechaExpedicion',
                    displayName: $translate.instant('FECHA'),
                    cellTemplate: '<div align="center">{{row.entity.Resolucion.FechaExpedicion | date:"dd-MM-yyyy":"+0900" }}</div>'
                },
                {
                    field: 'Boton',
                    displayName: $translate.instant('VER'),
                    cellTemplate: '<a><span class="fa fa-eye" data-toggle="modal" data-target="#resolucionModal" ng-click="grid.appScope.rpSolicitudPersonas.setResolucion(row.entity)""></span></a>'
                }

            ],
            onRegisterApi: function(gridApi) {
                self.gridApiResolucion = gridApi;
            }
        };
        //RESOLUCION GRID>

        //<PROVEEDOR GRID
        self.gridOptionsProveedor = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableSorting: true,
            enableFiltering: true,
            multiSelect: false,
            columnDefs: [{
                    field: 'Id',
                    displayName: $translate.instant('ID'),
                },
                {
                    field: 'NumDocumento',
                    displayName: $translate.instant('NUMERO_DOCUMENTO'),
                },
                {
                    field: 'Tipopersona',
                    displayName: $translate.instant('TIPO_PERSONA'),
                },
                {
                    field: 'NomProveedor',
                    displayName: $translate.instant('NOMBRE_PROVEEDOR'),
                    width: "50%",
                },
            ]
        };

        //PROVEEDOR GRID>

        //CDP GRID para cargar los CDP hay que meter esto en una funcion

        self.gridOptions_cdp = {
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            enableFiltering: true,
            multiSelect: false,
            paginationPageSizes: [25, 50, 75],
            paginationPageSize: 10,
            useExternalPagination: true,
            columnDefs: [
                { field: 'Id', visible: false },
                { field: 'Vigencia', displayName: $translate.instant('VIGENCIA'), enableFiltering: false },
                { field: 'NumeroDisponibilidad', displayName: $translate.instant('DISPONIBILIDAD') },
                { field: 'Estado.Nombre', displayName: $translate.instant('ESTADO') },
                { field: 'Solicitud.SolicitudDisponibilidad.Numero', displayName: $translate.instant('SOLICITUD'), enableFiltering: false },
                {
                    field: 'FechaRegistro',
                    displayName: $translate.instant('FECHA_REGISTRO'),
                    cellTemplate: '<div align="center">{{row.entity.FechaRegistro | date:"yyyy-MM-dd":"+0900" }}</div>'
                },
            ],
            onRegisterApi: function(gridApi) {
                self.gridApiCDP = gridApi;
            }
        };

        //CDP GRID --

        //se busca de acuerdo al filtro seleccionado en la interfaz cdp,resolucion o contratos

        self.cargar_filtro = function() {
            //si es filtro por contrato
            self.buscar = true;
            var vigenciaActual;
            if ($scope.vigenciaModel === null) {
                vigenciaActual = $scope.vigencias[0];
            } else {
                vigenciaActual = $scope.vigenciaModel;
            }
            if ($scope.radioB === 1) {
                self.resolucion_bool = false;
                self.cdp_bool = false;
                self.contrato_bool = true;


                self.gridOptions = {};
                self.carga = true;
                self.filter = '';
                self.cargarDatos(adminMidRequest, 'contrato_general/ListaContratoContratoSuscrito/' + vigenciaActual, 'limit=10', self.gridOptionsContratistas, self.offset, self.filter);
                // amazonAdministrativaRequest.get('proveedor_contrato_persona/'+vigenciaActual,"").then(function(response) {
                //      self.gridOptions.data = response.data;
                //     });


            }

            //si es filtro por cdp
            if ($scope.radioB === 2) {
                self.resolucion_bool = false;
                self.cdp_bool = true;
                self.contrato_bool = false;
                self.gridOptions = {};
                self.carga = true;



                //selecciona la vigencia actual

                //gridOptionsService.build(financieraMidRequest, 'disponibilidad/ListaDisponibilidades/'+vigenciaActual,'limit=' + 0 + '&offset=' + 0 + '&query=Estado.Nombre__not_in:Agotado,DisponibilidadProcesoExterno.TipoDisponibilidad.Id:1' + "&UnidadEjecutora=" + 1,self.gridOptions_cdp)
                self.filter = 'Estado.Nombre__not_in:Agotado,DisponibilidadProcesoExterno.TipoDisponibilidad.Id:1';
                self.cargarDatos(financieraMidRequest, 'disponibilidad/ListaDisponibilidades/' + vigenciaActual, 'limit=10&UnidadEjecutora=' + 1, self.gridOptions_cdp, self.offset, self.filter);


                //  gridOptionsService.build(financieraRequest,'disponibilidad','limit=-1&query=Estado.Nombre__not_in:Agotado',self.gridOptions_cdp).then(function(data){
                //    self.grid =data;
                // });
                // financieraRequest.get('disponibilidad','limit=-1&query=Estado.Nombre__not_in:Agotado').then(function(response) {
                //   self.gridOptions_cdp.data = response.data;
                // });
            }

            //si es filtro por resolucion
            if ($scope.radioB === 3) {




                //selecciona la vigencia actual

                http://10.20.0.254/resoluciones_crud/v1/resolucion_estado

                self.gridOptions = {};
                self.carga = true;
                gridOptionsService.build(resolucionRequest, 'resolucion_estado/' ,'query=Resolucion.Vigencia:'+vigenciaActual + ',Estado.Id:2&limit=-1' , self.gridOptionsResolucion).then(function(data) {
                    self.gridOptions = data;
                    self.gridOptions.onRegisterApi = function(gridApi) {
                        self.gridApi = gridApi;
                    };
                    self.carga = false;
                });
                //  gridOptionsService.build(amazonAdministrativaRequest,'resolucion/resolucion_por_estado/'+vigenciaActual+'/'+'/2','',self.gridOptionsResolucion).then(function(data){
                //    self.grid =data;
                // });
                // amazonAdministrativaRequest.get('resolucion/resolucion_por_estado/'+vigenciaActual+'/'+'/2',"").then(function(response) {
                //   self.gridOptionsResolucion.data=response.data;
                //     });



                self.resolucion_bool = true;
                self.cdp_bool = false;
                self.contrato_bool = false;
            }



        };

        self.cargarDatos = function(service, endpoint, params, grid, offset, query) {
            gridOptionsService.build(service, endpoint, params + "&offset=" + offset + "&query=" + query, grid).then(function(data) {
                self.gridOptions = data;
                self.gridOptions.onRegisterApi = function(gridApi) {
                    self.gridApi = gridApi;
                    self.gridApi.core.on.filterChanged($scope, function() {
                        service.cancel();
                        var grid = this.grid;
                        var query = self.filter;
                        angular.forEach(grid.columns, function(value, key) {
                            if (value.filters[0].term) {
                                var formtstr = value.colDef.name.replace('[0]', '');
                                if (query === '') {
                                    query = formtstr + '__icontains:' + value.filters[0].term;
                                } else {
                                    query = query + ',' + formtstr + '__icontains:' + value.filters[0].term;
                                }
                            }
                        });
                        self.offset = 0;
                        self.cargarDatos(service, endpoint, params, grid, self.offset, query);
                    });
                    self.gridApi.pagination.on.paginationChanged($scope, function(newPage, pageSize) {

                        //self.gridOptions.data = {};
                        var query = self.filter;
                        var grid = this.grid;
                        angular.forEach(grid.columns, function(value, key) {
                            if (value.filters[0].term) {
                                var formtstr = value.colDef.name.replace('[0]', '');
                                if (query === '') {
                                    query = formtstr + '__icontains:' + value.filters[0].term;
                                } else {
                                    query = query + ',' + formtstr + '__icontains:' + value.filters[0].term;
                                }

                            }
                        });
                        self.offset = (newPage - 1) * pageSize;
                        self.cargarDatos(service, endpoint, params, grid, self.offset, query);
                    });
                    self.gridOptions.totalItems = 50000;
                };
            });
        };
        //se buscan los contratos por la vigencia seleccionada
        self.buscar_resoluciones_vigencia = function() {
            query = "";
            if ($scope.vigenciaModel !== undefined || $scope.vigenciaModel === null) {
                amazonAdministrativaRequest.get('proveedor_contrato_persona/' + $scope.vigenciaModel).then(function(response) {
                    self.gridOptions.data = response.data;
                });

            }
        };

        //se buscan los contratos por la vigencia seleccionada
        self.buscar_contratos_vigencia = function() {
            query = "";
            if ($scope.vigenciaModel !== undefined || $scope.vigenciaModel === null) {
                amazonAdministrativaRequest.get('proveedor_contrato_persona/' + $scope.vigenciaModel).then(function(response) {
                    self.gridOptions.data = response.data;
                });

            }
        };

        self.setResolucion = function(resolucion) {
            var existe_contrato = false;
            self.gridOptionsResolucionPersonas.data = [];
            var vinculacion_docente = [];
            resoluciones = [];
            self.no_datos = true;
            var numContrato = "";
            var vigenciaContrato;
            //variables para mostrar en el modal
            self.resolucionId = resolucion.NumeroResolucion;
            self.resolucionVigencia = resolucion.Vigencia;
            //
            //peticion para traer los docentes asociados a una resolucion
            resolucionRequest.get('vinculacion_docente', "limit=-1&query=IdResolucion.Id:" + resolucion.Resolucion.Id + ",Estado:true").then(function(response) {
                if (response.data !== null) {
                    vinculacion_docente = response.data;
                    //consulta para traer la informacion de las personas de los docentes asociados a una resolucion
                    for (var x = 0; x < vinculacion_docente.length; x++) {
                        numContrato = vinculacion_docente[x].NumeroContrato;
                        vigenciaContrato = vinculacion_docente[x].Vigencia;

                        if (numContrato !== "" || vigenciaContrato !== "" || vigenciaContrato !== 0) {
                            self.buscar_personas(numContrato, vigenciaContrato, existe_contrato, vinculacion_docente);
                        }

                    }
                }
                else{
                    existe_contrato = false;
                    self.no_datos = true;
                }
            });
        };

        self.buscar_personas = function(numContrato, vigenciaContrato, existe_contrato, vinculacion_docente) {
            amazonAdministrativaRequest.get('proveedor_contrato_persona/' + numContrato.String + "/" + vigenciaContrato.Int64, "", "").then(function(response) {
                if (response.data !== null) {
                    existe_contrato = true;
                    resoluciones.push(response.data[0]);
                }
                if (resoluciones.length === vinculacion_docente.length || resoluciones.length === 0) {
                    self.gridOptionsResolucionPersonas.data = resoluciones;
                    if (existe_contrato === false) {
                        self.no_datos = false;
                    }
                }
            });
        };

        self.mostrar_estadisticas = function() {
            var numContrato;
            var vigenciaContrato;
            resoluciones = [];
            var vinculacion_docente = [];
            self.contrato.splice(0, self.contrato.length);
            self.resolucion.splice(0, self.resolucion.length);
            seleccion = self.gridApi.selection.getSelectedRows();
            if (seleccion.length === 0) {
                swal("Alertas", "Debe seleccionar un parametro para solicitar el registro presupuestal", "error");
            } else {
                self.boton_solicitar = true;
                // si es solicitud por contrato
                if ($scope.radioB === 1) {
                    for (var i = 0; i < seleccion.length; i++) {
                        contrato_unidad = [];
                        contrato_unidad.Numero_contrato = seleccion[i].Id;
                        contrato_unidad.Numero_suscrito = seleccion[i].ContratoSuscrito[0].NumeroContratoSuscrito;
                        contrato_unidad.Vigencia_contrato = seleccion[i].VigenciaContrato;
                        contrato_unidad.Documento = seleccion[i].Contratista.NumDocumento;
                        contrato_unidad.Valor_contrato = seleccion[i].ValorContrato;
                        contrato_unidad.Nombre_completo = seleccion[i].Contratista.NomProveedor;
                        contrato_unidad.Contratista = seleccion[i].Contratista;
                        contrato_unidad.Objeto_contrato = seleccion[i].ObjetoContrato;
                        contrato_unidad.Fecha_registro = seleccion[i].FechaRegistro;
                        self.contrato.push(contrato_unidad);
                    }
                    self.saving = true;
                    self.btnGenerartxt = "Generando...";
                    self.saving = false;
                    self.btnGenerartxt = "Generar";
                    $window.location.href = '#/rp/rp_solicitud/';
                    // si es solicitud por cdp
                } else if ($scope.radioB === 2) {
                    self.disponibilidad.push(seleccion[0]);
                    self.saving = true;
                    self.btnGenerartxt = "Generando...";
                    self.saving = false;
                    self.btnGenerartxt = "Generar";
                    $window.location.href = '#/rp/rp_solicitud/';

                    // si es solicitud por resolucion
                } else if ($scope.radioB === 3) {
                    self.resolucion.push(seleccion[0]);
                    resolucionRequest.get('vinculacion_docente', "limit=-1&query=IdResolucion.Id:" + seleccion[0].Resolucion.Id + ",Estado:true").then(function(response) {
                        if (response.data !== null) {
                            vinculacion_docente = response.data;
                            //consulta para traer la informacion de las personas de los docentes asociados a una resolucion
                            for (var x = 0; x < vinculacion_docente.length; x++) {
                                numContrato = vinculacion_docente[x].NumeroContrato;
                                vigenciaContrato = vinculacion_docente[x].Vigencia;
                                if (numContrato !== "" || vigenciaContrato !== "" || vigenciaContrato !== 0) {
                                    self.generar_txt_cdp(numContrato, vigenciaContrato, vinculacion_docente);
                                }
                            }
                        }
                    });
                }
            }
        };

        self.generar_txt = function(x) {

            amazonAdministrativaRequest.get('proveedor_contrato_persona/' + contratos_disponibilidades[x].NumeroContrato + "/" + contratos_disponibilidades[x].Vigencia, "").then(function(response) {

                if (response.data !== null) {
                    self.contrato.push(response.data[0]);
                    if (contratos_disponibilidades.length === x) {
                        self.saving = true;
                        self.btnGenerartxt = "Generando...";
                        self.saving = false;
                        self.btnGenerartxt = "Generar";
                        $window.location.href = '#/rp/rp_solicitud/';
                    }
                }
            });
        };

        self.generar_txt_cdp = function(numContrato, vigenciaContrato, vinculacion_docente) {

            
            amazonAdministrativaRequest.get('proveedor_contrato_persona/' + numContrato.String + "/" + vigenciaContrato.Int64 , "").then(function(response) {
                if (response.data !== null) {
                    self.contrato.push(response.data[0]);
                } else {
                    swal("Alertas", "No existen contratos asociados a esta resolución", "error");
                    self.boton_solicitar = false;
                }
                if (self.contrato.length === vinculacion_docente.length) {
                    amazonAdministrativaRequest.get('contrato_disponibilidad', "query=NumeroContrato:" + self.contrato[0].Numero_contrato + ",Vigencia:" + self.contrato[0].Vigencia_contrato).then(function(response) {

                        financieraRequest.get('disponibilidad', "query=NumeroDisponibilidad:" + response.data[0].NumeroCdp + ",Vigencia:" + response.data[0].VigenciaCdp).then(function(response) {
                            self.disponibilidad.push(response.data[0]);
                            self.saving = true;
                            self.btnGenerartxt = "Generando...";
                            self.saving = false;
                            self.btnGenerartxt = "Generar";
                            $window.location.href = '#/rp/rp_solicitud/';
                        });
                    });
                }
            });
        };
    });