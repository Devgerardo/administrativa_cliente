'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.planTrabajoService
 * @description
 * # planTrabajoService
 * Service in the contractualClienteApp.
 */
angular.module('contractualClienteApp')
    .service('planTrabajoService', function ($http,CONF) {
    var path = CONF.GENERAL.PLAN_TRABAJO_SERVICE;
        // Public API here
        return {
           /**
            * @ngdoc function
            * @name planTrabajoService.service:planTrabajoService#get
            * @methodOf academicaService.service:academicaRequest
            * @param {string} params parametros para filtrar la busqueda
            * @return {array|object} objeto u objetos del get
            * @description Metodo GET del servicio
            */
           get: function(tabla, params) {
               var peticion = path + tabla + "?" + params;
               return $http.get(peticion);
           },

           /**
            * @ngdoc function
            * @name planTrabajoService.service:planTrabajoService#post
            * @param {object} elemento objeto a ser creado por el API
            * @methodOf academicaService.service:academicaRequest
            * @return {array|string} mensajes del evento en el servicio
            * @description Metodo POST del servicio
            */
           post: function(tabla, elemento) {
               return $http.post(path+tabla, elemento);
           },

           /**
            * @ngdoc function
            * @name planTrabajoService.service:planTrabajoService#delete
            * @param {id} identificador de la solicitud a eliminar
            * @methodOf planTrabajoService.service:academicaRequest
            * @return {array|string} mensajes del evento en el servicio
            * @description Metodo DELETE del servicio
            */
           delete: function(tabla, id) {
               return $http.delete(path + tabla + "/" + id);
           },

           /**
            * @ngdoc function
            * @name planTrabajoService.service:planTrabajoService#delete
            * @param {id} identificador de la solicitud a eliminar
            * @methodOf planTrabajoService.service:academicaRequest
            * @return {array|string} mensajes del evento en el servicio
            * @description Metodo DELETE del servicio
            */
           put: function(tabla, id, elemento) {
               console.log("put");
               return $http.put(path + tabla + "/" + id, elemento);
           }
        };
  
  
  });







   