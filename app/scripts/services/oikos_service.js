'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.oikosService
 * @description
 * # oikosService
 * Factory in the contractualClienteApp.
 */
angular.module('oikosService', [])
    .factory('oikosRequest', function($http, token_service, CONF) {
        // Service logic
        // ...
        var path = CONF.GENERAL.OIKOS_SERVICE;
        //var path = "http://10.20.2.121:8090/v1/";
        // Public API here
        return {
            get: function(tabla, params) {
              if(angular.isUndefined(params) || params === ""){
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
