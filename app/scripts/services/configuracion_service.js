'use strict';


/**
 * @ngdoc overview
 * @name configuracionService
 * @description
 * # configuracionService
 * Service in the contractualClienteApp.
 */

angular.module('configuracionService', [])

/**
 * @ngdoc service
 * @name configuracionService.service:configuracionRequest
 * @requires $http
 * @param {injector} $http componente http de angular
 * @requires $websocket
 * @param {injector} $websocket componente websocket de angular-websocket
 * @description
 * # configuracionRequest
 * Factory que permite gestionar los servicios para construir y gestion los elementos que se muestran por el cliente a traves del menú
 */

.factory('configuracionRequest', function($http, $q, CONF, token_service) {
    // Service logic
    // ...
    var path = CONF.GENERAL.CONFIGURACION_SERVICE;
    // Public API here

    return {

        /**
         * @ngdoc function
         * @name configuracionService.service:configuracionRequest#get_acciones
         * @methodOf configuracionService.service:configuracionRequest
         * @param {string} path url del menu a consultar opciones
         * @param {string} a menu
         * @description Metodo get_acciones para obtener las acciones ejecutables en un modulo
         */
        get_acciones: function(path, a) {
            a = a || [];
            for (var i = 0; i < a.length; i++) {
                if (a[i].Url === path) {
                    return a[i];
                } else if (a[i].Opciones !== null) {
                    var y;
                    if ((y = this.get_acciones(path, a[i].Opciones)) && y != null) {
                        return y;
                    }
                }
            }
            return null;
        },

        /**
         * @ngdoc function
         * @name configuracionService.service:configuracionRequest#get
         * @methodOf configuracionService.service:configuracionRequest
         * @param {string} tabla Nombre de la tabla en el API
         * @param {string} params parametros para filtrar la busqueda
         * @return {array|object} objeto u objetos del get
         * @description Metodo GET del servicio
         */
        get: function(tabla, params) {
            return $http.get(path + tabla + params, token_service.setting_bearer.headers);
        },
        /**
         * @ngdoc function
         * @name configuracionService.service:configuracionRequest#post
         * @param {string} tabla Nombre de la tabla en el API
         * @param {object} elemento objeto a ser creado por el API
         * @methodOf configuracionService.service:configuracionRequest
         * @return {array|string} mensajes del evento en el servicio
         * @description Metodo POST del servicio
         */
        post: function(tabla, elemento) {
            return $http.post(path + tabla, elemento, token_service.setting_bearer.headers);
        },

        /**
         * @ngdoc function
         * @name configuracionService.service:configuracionRequest#put
         * @param {string} tabla Nombre de la tabla en el API
         * @param {string|int} id del elemento en el API
         * @param {object} elemento objeto a ser actualizado por el API
         * @methodOf configuracionService.service:configuracionRequest
         * @return {array|string} mensajes del evento en el servicio
         * @description Metodo PUT del servicio
         */
        put: function(tabla, id, elemento) {
            return $http.put(path + tabla + "/" + id, elemento, token_service.setting_bearer.headers);
        },

        /**
         * @ngdoc function
         * @name configuracionService.service:configuracionRequest#delete
         * @methodOf configuracionService.service:configuracionRequest
         * @param {string} tabla Nombre de la tabla en el API
         * @param {object} elemento objeto a ser eliminado por el API
         * @return {array|string} mensajes del evento en el servicio
         * @description Metodo DELETE del servicio
         */
        delete: function(tabla, id) {
            return $http.delete(path + tabla + "/" + id, token_service.setting_bearer.headers);
        }
    };

});
