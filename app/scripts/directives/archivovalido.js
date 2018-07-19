'use strict';

/**
 * @ngdoc directive
 * @name contractualClienteApp.directive:archivoValido
 * @description
 * # archivoValido
 */
angular.module('contractualClienteApp')
  .directive('archivoValido', function () {
    return {
      restrict: "A",
      require: ['^form', 'angularBfi'],
      
      link: function (scope,elem,attrs, ctrl) {
            
        elem.bind("change", function(e) {
          //elem[0].files[0].size*0.001 conversion de byte a kilobyte para la validacion
          var extn = elem.val().split(".").pop();
          if(ctrl[1].options.allowedFileExtensions.includes(extn) && (elem[0].files[0].size*0.001 <= ctrl[1].options.maxFileSize)){
            ctrl[0].$valid=true;
          }else{
            ctrl[0].$valid=false;
          }
          scope.$apply();
        })
     
        //checa si el archivo fue removido
        angular.element(document.querySelector('#userUpload')).on('fileclear', function(event) {
          ctrl[0].$valid=false;
          scope.$apply();
        })
      }
     
    };
  });

