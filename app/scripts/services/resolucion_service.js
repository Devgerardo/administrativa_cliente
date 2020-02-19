'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.resolucionService
 * @description
 * # resolucionService
 * Factory in the contractualClienteApp.
 */
angular.module('contractualClienteApp')
  .factory('resolucionRequest', function($http, CONF, token_service) {
        // Service logic
        // ...
        var path = CONF.GENERAL.RESOLUCION_SERVICE;
        //var path = "http://localhost:8085/v1/";
        //var path = "http://10.20.2.150:8082/v1/";
        //var path = "http://10.20.0.138:8090/v1/";
        // Public API here
        return {
            get: function(tabla, params) {
                if(angular.isUndefined(params)){
                    return $http.get(path + tabla, token_service.setting_bearer.headers);
                }else{
                    return $http.get(path + tabla + "/?" + params, token_service.setting_bearer.headers);
                }
            },
            post: function(tabla, elemento) {
                return $http.post(path + tabla, elemento, token_service.setting_bearer.headers);
            },
            put: function(tabla, id, elemento) {
                return $http.put(path + tabla + "/" + id, elemento, token_service.setting_bearer.headers);
            },
            delete: function(tabla, id) {
                return $http.delete(path + tabla + "/" + id, token_service.setting_bearer.headers);
            }
        };
    });

