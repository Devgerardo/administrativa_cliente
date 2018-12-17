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
      require: ['ngModel', 'angularBfi'],

      link: function postLink(scope, elem, attrs, ctrl) {
        
        elem.on("change", function () {
          var files = elem[0].files[0];//files[0] para un solo archivo, .files para varios
          ctrl[0].$setViewValue(files);
        });

        attrs.$observe('archivoValido', function (value) {
          ctrl[0].$validate();
        });

        ctrl[0].$validators.archivoValido = function (modelValue, viewValue) {
          console.log("flag: "+ ctrl[0].$isEmpty(viewValue));
          var extn = elem.val().split(".").pop();
          return ctrl[0].$isEmpty(viewValue) || (ctrl[1].options.allowedFileExtensions.includes(extn) && (elem[0].files[0].size * 0.001 <= ctrl[1].options.maxFileSize)); 
        };

        //checa si el archivo fue removido
        angular.element(document.querySelector('#userUpload')).on('fileclear', function (event) {
          ctrl[0].$valid = false;
          var files = undefined;
          ctrl[0].$setViewValue(files);
          ctrl[0].$render();       
        });

        scope.limpiarArchivo = function(){
          console.log("limpiado");
          document.querySelector('#userUpload').fileupload('clear');
        }


      }
    }
  });

