'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.argoNosqlService
 * @description
 * # argoNosqlService
 * Factory in the contractualClienteApp.
 */
angular.module('contractualClienteApp')
  .factory('argoNosqlRequest', function($http, token_service, CONF) {
        var path = CONF.GENERAL.ARGO_NOSQL_SERVICE;
        //var path = "http://localhost:8084/v1/";
        // Public API here
        return {
            get: function (tabla,params) {
              return $http.get(path+tabla+"/"+params);
            },
            post: function (tabla,elemento) {
              return $http.post(path+tabla,elemento);
            },
            put: function (tabla,id,elemento) {
              return $http.put(path+tabla+"/"+id,elemento);
            },
            delete: function (tabla,id) {
              return $http.delete(path+tabla+"/"+id);
        }
        };
});
