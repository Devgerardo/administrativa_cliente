'use strict';

/**
 * @ngdoc service
 * @name coreService.coreRequest
 * @description
 * # coreRequest
 * Factory in the coreRequest.
 */
angular.module('coreService', [])
    .factory('coreRequest', function($http, token_service, CONF) {
        // Service logic
        // ...
        //var path = "http://10.20.2.78:8081/v1/";
        //var path = "http://10.20.0.254/core_amazon_crud/v1/";
        var path = CONF.GENERAL.CORE_SERVICE;
        // Public API here
        return {
            get: function(tabla, params) {
                return $http.get(path + tabla + "/?" + params, token_service.setting_bearer.headers);
                // return $http.get(path + tabla );
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