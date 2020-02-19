'use strict';

/**
 * @ngdoc service
 * @name financieraClienteApp.grid/gridapiService
 * @description
 * # grid/gridapiService
 * Service in the financieraClienteApp.
 */
angular.module('gridApiService', [])
    /**
         * @ngdoc service
         * @name gridApiService.service:gridApiService
         * @description
         * # gridApiService
         * Fabrica sobre la cual se consumen los servicios para paginado externo en uigrid
         */
    .factory('gridApiService', function ($timeout) {
        //var path = CONF.GENERAL.ACADEMICA_SERVICE;
        // Public API here
        var filter = function (grid) {
            var query = [];
            angular.forEach(grid.columns, function (value, key) {
                if (value.filters[0].term) {
                    var formtstr = value.colDef.name.replace('[0]', '');
                    //console.log("change ", value.filters[0].term);
                    query.push(formtstr + '__icontains:' + value.filters[0].term);
                };
            });
            return query;
        };

        return {
            /**
            * @ngdoc function
            * @name gridApiService.service:gridApiService#filter
            * @methodOf gridApiService.service:gridApiService
            * @param {object} gridApi gridApi de uigrid para poner filtrado externo
            * @return {object} gridApi con filtrado externa
            * @description Metodo gridApi del servicio
            */
            filter: function (gridApi, consulFunc, $scope) {
                var self = this;
                gridApi.core.on.filterChanged($scope, function () {
                    var self = this;
                    $scope.offset = 0;
                    //self.grid.paginationCurrentPage = 1;
                    if (angular.isDefined($scope.filterTimeout)) {
                        $timeout.cancel($scope.filterTimeout);
                    }
                    $scope.filterTimeout = $timeout(function () { consulFunc($scope.offset, filter(self.grid)) }, 500);
                });
                return gridApi;
            },
            /**
             * @ngdoc function
             * @name gridApiService.service:gridApiService#pagination
             * @methodOf gridApiService.service:gridApiService
             * @param {object} gridApi gridApi de uigrid para poner paginado externo
             * @return {object} gridApi con paginacion externa
             * @description Metodo gridApi del servicio
             */
            pagination: function (gridApi, consulFunc, $scope) {
                var self = this;

                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    var self = this;
                    $scope.offset = (newPage - 1) * pageSize;
                    consulFunc($scope.offset, filter(self.grid));

                });
                return gridApi;
            },
            paginationFunc: function (table, offset) {
                return function (response) {
                    if (response.data === null) {
                        table.data = [];
                    } else {
                        table.data = response.data;
                        table.totalItems = offset + table.data.length + 1;
                    }
                };
            }
        };
    });