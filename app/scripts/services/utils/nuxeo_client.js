'use strict';

angular.module('nuxeoClient',[])
  .factory('nuxeoClient', function ($q,nuxeo) {
    return {
      /**
       * @ngdoc method
       * @name createDocument
       * @param {string} nombre Nombre del documento que se carga
       * @param {string} descripcion Descripción del documento que se carga
       * @param {blob} documento Blob del documento que se carga
       * @param {function} callback Función que se ejecuta luego de que se resuelve la promesa 
       * @returns {Promise} Objeto de tipo promesa que indica si ya se cumplió la petición y se resuleve con la url del objeto cargado. 
       * @description 
       */
      createDocument : function(nombre, descripcion, documento, callback) {
        var defer = $q.defer();
        nuxeo.connect().then(function(client) {
          nuxeo.operation('Document.Create')
          .params({
            type: 'File',
            name: nombre,
            properties: 'dc:title=' +  nombre + ' \ndc:description=' + descripcion
          })
          .input('/default-domain/workspaces/oas/oas_app/resoluciones')
          .execute()
          .then(function(doc) {
            var nuxeoBlob = new Nuxeo.Blob({
              content: documento
            });
            nuxeo.batchUpload()
              .upload(nuxeoBlob)
              .then(function(res) {
                return nuxeo.operation('Blob.AttachOnDocument')
                  .param('document', doc.uid)
                  .input(res.blob)
                  .execute();
              })
              .then(function() {
                return nuxeo.repository().fetch(doc.uid, {
                  schemas: ['dublincore', 'file']
                });
              })
              .then(function(doc) {
                if(!angular.isUndefined(callback)){
                  callback(doc.uid)
                }
                defer.resolve(doc.uid);
              })
              .catch(function(error) {
                defer.reject(error);
                throw error;
              });
          })
          .catch(function(error) {
            defer.reject(error);
            throw error;
          });
        })
        .catch(function(error){
          // cannot connect
          defer.reject(error);
          throw error;
        });
        return defer.promise;
      },

      /**
       * @ngdoc method
       * @name getDocumento
       * @param {uid} uid Uid del documento que se cargara
       * @returns {Promise} bjeto de tipo promesa que indica si ya se cumplio la petición y se resuleve con el objeto cargado.
       * @description 
       */
      getDocument : function(uid){
        var defer = $q.defer();
        nuxeo.operation('Document.GetBlob')
          .input(uid)
          .execute()
          .then(function(responseBlob){
            return responseBlob.blob()
          })
          .then(function(blob){
            var document = {
              url : URL.createObjectURL(blob),
              blob : blob,
            }
            defer.resolve(document);
          })
          .catch(function(error){
              defer.reject(error)
          });
        return defer.promise;
      },
    };
  });
