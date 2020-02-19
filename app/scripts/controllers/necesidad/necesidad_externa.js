'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:NecesidadNecesidadExternaCtrl
 * @description
 * # NecesidadNecesidadExternaCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
    .controller('NecesidadExternaCtrl', function ($translate, administrativaRequest, $scope, financieraRequest, academicaRequest) {
        var ctrl = this;
        $scope.botones = [
            { clase_color: "ver", clase_css: "fa fa-eye fa-lg  faa-shake animated-hover", titulo: $translate.instant('BTN.VER'), operacion: 'ver', estado: true },
            { clase_color: "ver", clase_css: "fa fa-check-square-o fa-lg faa-shake animated-hover", titulo: $translate.instant('BTN.SOLICITAR'), operacion: 'solicitud', estado: true },
        ];
        ctrl.gridOptions = {
            paginationPageSizes: [5, 15, 20],
            paginationPageSize: 5,
            enableFiltering: true,
            enableSorting: true,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            columnDefs: [{
                field: 'TipoNecesidad.Nombre',
                displayName: $translate.instant('TIPO'),
                width: '10%',
            },
            {
                field: 'TipoNecesidad.Descripcion',
                displayName: $translate.instant('DESCRIPCION'),
                width: '80%',
            },
            {
                name: $translate.instant('OPCIONES'),
                enableFiltering: false,
                width: '10%',
                cellTemplate: '<btn-registro funcion="grid.appScope.loadrow(fila,operacion)" grupobotones="grid.appScope.botones" fila="row"></btn-registro>'
            }
            ]
        };
        ctrl.gridOptions.enablePaginationControls = true;
        ctrl.gridOptions.multiSelect = false;
        ctrl.get_all_necesidad_externa = function () {
            administrativaRequest.get("necesidad_proceso_externo", $.param({
                limit: -1,
                sortby: "Id",
                order: "asc"
            }))
                .then(function (response) {
                    ctrl.gridOptions.data = response.data;
                });
        };
        ctrl.get_all_necesidad_externa();

        ctrl.get_avance = function (id) {
            financieraRequest.get("solicitud_avance", $.param({
                limit: -1,
                query: "Id:" + id,
                sortby: "Id",
                order: "asc"
            }))
                .then(function (response) {
                    ctrl.solicitud = response.data[0];
                    financieraRequest.get("avance_estado_avance", $.param({
                        query: "SolicitudAvance.Id:" + ctrl.solicitud.Id,
                        sortby: "FechaRegistro",
                        limit: -1,
                        order: "desc"
                    }))
                        .then(function (estados) {
                            ctrl.solicitud.Estado = estados.data;
                        });
                    //aqui va la conexions con el beneficiario
                    academicaRequest.get("documento=" + ctrl.solicitud.Beneficiario)
                        .then(function (response) {
                            ctrl.solicitud.Tercero = response.data[0];
                        });
                    financieraRequest.get("solicitud_tipo_avance", $.param({
                        query: "SolicitudAvance.Id:" + ctrl.solicitud.Id,
                        sortby: "Id",
                        limit: -1,
                        order: "asc"
                    }))
                        .then(function (response) {
                            ctrl.solicitud.Tipos = response.data;
                            ctrl.solicitud.Total = 0;
                            angular.forEach(response.data, function (tipo) {
                                ctrl.solicitud.Total += tipo.Valor;
                                financieraRequest.get("requisito_tipo_avance", $.param({
                                    query: "TipoAvance:" + tipo.TipoAvance.Id + ",Activo:1",
                                    limit: -1,
                                    fields: "RequisitoAvance,TipoAvance,Id",
                                    sortby: "TipoAvance",
                                    order: "asc"
                                }))
                                    .then(function (response) {
                                        tipo.Requisitos = response.data;
                                        var sol = 0;
                                        var leg = 0;
                                        angular.forEach(tipo.Requisitos, function (data) {
                                            data.SolicitudTipoAvance = { Id: tipo.Id };
                                            data.RequisitoTipoAvance = { Id: data.Id };
                                            if (data.RequisitoAvance.EtapaAvance.Id === 1) { //Solicitud
                                                sol++;
                                            }
                                            if (data.RequisitoAvance.EtapaAvance.Id === 2) { //Legalización
                                                leg++;
                                            }
                                            tipo.n_solicitar = sol;
                                            tipo.n_legalizar = leg;
                                        });
                                    });
                            });
                        });
                });
        };

        $scope.loadrow = function (row, operacion) {
            ctrl.operacion = operacion;
            ctrl.row_entity = row.entity;
            switch (operacion) {
                case "ver":
                    break;
                case "solicitud":
                    switch (ctrl.row_entity.TipoNecesidad.CodigoAbreviacion) {
                        case "N":

                            break;
                        case "A":
                            ctrl.get_avance(ctrl.row_entity.ProcesoExterno);
                            $('#modalNecesidadAvance').modal('show');
                            break;
                    }

                    break;
                default:
            }
        };

        ctrl.gridOptions.onRegisterApi = function (gridApi) {
            ctrl.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function () { });
        };
    });