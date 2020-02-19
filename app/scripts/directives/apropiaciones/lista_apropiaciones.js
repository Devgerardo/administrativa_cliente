'use strict';

/**
 * @ngdoc directive
 * @name contractualClienteApp.directive:apropiaciones/listaApropiaciones
 * @description
 * # apropiaciones/listaApropiaciones
 */
angular.module('contractualClienteApp')
    .directive('listaApropiaciones', function (financieraRequest, $translate) {
        return {
            restrict: 'E',
            scope: {
                apropiacion: '=',
                vigencia: "=",
                tipo: "<",
                unidadejecutora: "=",
                tipofinanciacion: "=",
                selhijos: "=?"
            },

            templateUrl: 'views/directives/apropiaciones/lista_apropiaciones.html',
            controller: function ($scope) {
                var self = this;
                self.gridOptions = {
                    enableRowSelection: true,
                    enableRowHeaderSelection: false,
                    enableFiltering: true,
                    showTreeExpandNoChildren: false,

                    columnDefs: [{
                        field: 'Rubro.Codigo',
                        displayName: $translate.instant('CODIGO_RUBRO'),
                        headerCellClass: $scope.highlightFilteredHeader + 'text-center ',
                        cellClass: function (row, col) {
                            if (col.treeNode.children.length === 0) {
                                return "unbold ";
                            } else {
                                return "text-info";
                            }
                        },
                        width: '15%'
                    },
                    {
                        field: 'Rubro.Nombre',
                        displayName: $translate.instant('NOMBRE_RUBRO'),
                        headerCellClass: $scope.highlightFilteredHeader + 'text-center ',
                        cellTooltip: function (row) {
                            return row.entity.Rubro.Nombre;
                        },
                        cellClass: function (row, col) {
                            if (col.treeNode.children.length === 0) {
                                return "unbold ";
                            } else {
                                return "text-info";
                            }
                        },
                        width: '58%'
                    },
                    {
                        field: 'Valor',
                        displayName: $translate.instant('VALOR'),
                        cellFilter: 'currency',
                        cellTemplate: '<div align="right">{{row.entity.Valor | currency}}</div>',
                        headerCellClass: $scope.highlightFilteredHeader + 'text-center ',
                        cellClass: function (row, col) {
                            if (col.treeNode.children.length === 0) {
                                return "unbold";
                            } else {
                                return "text-info";
                            }
                        },
                        width: '20%'
                    }
                    ]

                };

                $scope.$watchGroup(['unidadejecutora', 'tipofinanciacion'], function () {
                    if ($scope.unidadejecutora !== undefined && $scope.tipofinanciacion !== undefined) {
                        if ($scope.unidadejecutora === 1 && $scope.tipofinanciacion.Id === 1) {
                            $scope.tipo = "3-3";
                        } else if ($scope.unidadejecutora === 1 && $scope.tipofinanciacion.Id === 2) {
                            $scope.tipo = "3-1";
                        } else if ($scope.unidadejecutora === 2 && $scope.tipofinanciacion.Id === 1) {
                            $scope.tipo = "3-0-0";
                        } else if ($scope.unidadejecutora === 2 && $scope.tipofinanciacion.Id === 2) {
                            $scope.tipo = "3-0";
                        }
                        self.actualiza_rubros();
                        if ($scope.tipo !== "3-0-0") {

                        }
                    }
                }, true);


                self.actualiza_rubros = function () {
                    financieraRequest.get('apropiacion', 'limit=-1&query=Vigencia:' + $scope.vigencia + ",Rubro.Codigo__startswith:" + $scope.tipo + ",Rubro.UnidadEjecutora:" + $scope.unidadejecutora + ",Estado.Id:" + 2).then(function (response) {
                        if (response.data !== null) {
                            self.gridOptions.data = response.data.sort(function (a, b) {
                                if (a.Rubro.Codigo < b.Rubro.Codigo) { return -1; }
                                if (a.Rubro.Codigo > b.Rubro.Codigo) { return 1; }
                                return 0;
                            });
                            self.max_level = 0;
                            var level = 0;
                            for (var i = 0; i < self.gridOptions.data.length; i++) {
                                level = (self.gridOptions.data[i].Rubro.Codigo.match(/-/g) || []).length;
                                if (level > self.max_level) {
                                    self.max_level = level;
                                }
                            }

                            for (var j = 0; j < self.gridOptions.data.length; j++) {
                                level = (self.gridOptions.data[j].Rubro.Codigo.match(/-/g) || []).length;
                                if (level < self.max_level) {
                                    self.gridOptions.data[j].$$treeLevel = level;
                                }
                            }

                        } else {
                            self.gridOptions.data = [];
                        }
                    });
                };



                self.gridOptions.onRegisterApi = function (gridApi) {
                    //set gridApi on scope
                    self.gridApi = gridApi;
                    self.gridApi.grid.registerDataChangeCallback(function () {
                        self.gridApi.treeBase.expandAllRows();
                    });
                    self.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.apropiacion = row.entity;
                    });
                };

                self.gridOptions.isRowSelectable = function (row) {
                    if (row.treeNode.children.length > 0 && $scope.selhijos === true) {
                        return false;
                    } else {
                        return true;
                    }
                };


                self.gridOptions.multiSelect = false;


            },
            controllerAs: 'd_listaApropiaciones'
        };
    });
