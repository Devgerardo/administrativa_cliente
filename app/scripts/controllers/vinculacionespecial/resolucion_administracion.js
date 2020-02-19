'use strict';

/**
* @ngdoc function
* @name clienteApp.controller:ResolucionAdministracionCtrl
* @description
* # ResolucionAdministracionCtrl
* Controller of the clienteApp
*/
angular.module('contractualClienteApp')
  .controller('ResolucionAdministracionCtrl', function (administrativaRequest, adminMidRequest, titan_request, $scope, $window, $mdDialog, $translate, gridApiService) {

    var self = this;

    //Tabla para mostrar los datos básicos de las resoluciones almacenadas dentro del sistema
    self.resolucionesAprobadas = {
      paginationPageSizes: [10, 15, 20],
      paginationPageSize: 10,
      enableSorting: true,
      enableFiltering: true,
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      useExternalPagination: true,
      useExternalFiltering: true,
      columnDefs: [
        {
          field: 'Id',
          visible: false
        },
        {
          field: 'FechaExpedicion',
          visible: false
        },
        {
          field: 'Facultad',
          visible: false
        },
        {
          field: 'Numero',
          cellClass: function (grid, row/*, col, rowRenderIndex, colRenderIndex*/) {
            if (row.entity.Estado === "Cancelada") {
              return 'resolucionCancelada';
            } else if (row.entity.Estado === "Expedida") {
              return 'resolucionExpedida';
            }
          },
          width: '10%',
          displayName: $translate.instant('NUMERO')
        },
        {
          field: 'Vigencia',
          cellClass: function (grid, row/*, col, rowRenderIndex, colRenderIndex*/) {
            if (row.entity.Estado === "Cancelada") {
              return 'resolucionCancelada';
            } else if (row.entity.Estado === "Expedida") {
              return 'resolucionExpedida';
            }
          },
          width: '10%',
          displayName: $translate.instant('VIGENCIA')
        },
        {
          field: 'FacultadNombre',
          enableFiltering: false,
          cellClass: function (grid, row/*, col, rowRenderIndex, colRenderIndex*/) {
            if (row.entity.Estado === "Cancelada") {
              return 'resolucionCancelada';
            } else if (row.entity.Estado === "Expedida") {
              return 'resolucionExpedida';
            }
          },
          width: '15%',
          displayName: $translate.instant('FACULTAD')
        },
        {
          field: 'TipoResolucion',
          cellClass: function (grid, row/*, col, rowRenderIndex, colRenderIndex*/) {
            if (row.entity.Estado === "Cancelada") {
              return 'resolucionCancelada';
            } else if (row.entity.Estado === "Expedida") {
              return 'resolucionExpedida';
            }
          },
          width: '15%',
          displayName: $translate.instant('TIPO_RESOLUCION')
        },
        {
          field: 'NivelAcademico',
          cellClass: function (grid, row/*, col, rowRenderIndex, colRenderIndex*/) {
            if (row.entity.Estado === "Cancelada") {
              return 'resolucionCancelada';
            } else if (row.entity.Estado === "Expedida") {
              return 'resolucionExpedida';
            }
          },
          width: '15%',
          displayName: $translate.instant('NIVEL')
        },
        {
          field: 'Dedicacion',
          cellClass: function (grid, row/*, col, rowRenderIndex, colRenderIndex*/) {
            if (row.entity.Estado === "Cancelada") {
              return 'resolucionCancelada';
            } else if (row.entity.Estado === "Expedida") {
              return 'resolucionExpedida';
            }
          },
          width: '10%',
          displayName: $translate.instant('DEDICACION')
        },
        {
          field: 'Estado',
          cellClass: function (grid, row/*, col, rowRenderIndex, colRenderIndex*/) {
            if (row.entity.Estado === "Cancelada") {
              return 'resolucionCancelada';
            } else if (row.entity.Estado === "Expedida") {
              return 'resolucionExpedida';
            }
          },
          width: '15%',
          displayName: $translate.instant('ESTADO')
        },
        {
          name: $translate.instant('OPCIONES'),
          cellClass: function (grid, row/*, col, rowRenderIndex, colRenderIndex*/) {
            if (row.entity.Estado === "Cancelada") {
              return 'resolucionCancelada';
            } else if (row.entity.Estado === "Expedida") {
              return 'resolucionExpedida';
            }
          },
          enableFiltering: false,
          width: '10%',
          //Los botones son mostrados de acuerdo alestado de las resoluciones (ver,expedir,restaurar)
          cellTemplate: '<center>' +
            '<a class="ver" ng-click="grid.appScope.verVisualizarResolucion(row)">' +
            '<i title="{{\'VER_BTN\' | translate }}" class="fa fa-eye fa-lg  faa-shake animated-hover"></i></a> ' +
            '<a ng-if="row.entity.Estado==\'Aprobada\'&&row.entity.TipoResolucion==\'Vinculación\'" class="ver" ng-click="grid.appScope.verRealizarExpedicion(row)">' +
            '<i title="{{\'EXPEDIR_BTN\' | translate }}" class="fa fa-file-text fa-lg  faa-shake animated-hover"></i></a> ' +
            '<a ng-if="row.entity.Estado==\'Aprobada\'&&row.entity.TipoResolucion==\'Adición\'" class="ver" ng-click="grid.appScope.verRealizarExpedicionHoras(row)">' +
            '<i title="{{\'EXPEDIR_BTN\' | translate }}" class="fa fa-file-text fa-lg  faa-shake animated-hover"></i></a> ' +
            '<a ng-if="row.entity.Estado==\'Aprobada\'&&row.entity.TipoResolucion==\'Reducción\'" class="ver" ng-click="grid.appScope.verRealizarExpedicionHoras(row)">' +
            '<i title="{{\'EXPEDIR_BTN\' | translate }}" class="fa fa-file-text fa-lg  faa-shake animated-hover"></i></a> ' +
            '<a ng-if="row.entity.Estado==\'Aprobada\'&&row.entity.TipoResolucion==\'Cancelación\'" class="ver" ng-click="grid.appScope.verRealizarExpedicionCancelar(row)">' +
            '<i title="{{\'EXPEDIR_BTN\' | translate }}" class="fa fa-file-text fa-lg  faa-shake animated-hover"></i></a> ' +
            '</center>'
        }
      ],
      onRegisterApi: function (gridApi) {
        self.gridApi = gridApi;
        self.gridApi = gridApiService.pagination(self.gridApi, self.cargarDatosResolucion, $scope);
        self.gridApi = gridApiService.filter(self.gridApi, self.cargarDatosResolucion, $scope);
      }
    };

    //Funcion para cargar los datos de las resoluciones creadas y almacenadas dentro del sistema
    self.cargarDatosResolucion = function (offset, query) {
      if (query == undefined) query = "";
      var req = adminMidRequest.get("gestion_resoluciones/get_resoluciones_aprobadas", $.param({
        limit: self.resolucionesAprobadas.paginationPageSize,
        offset: offset,
        query: typeof (query) === "string" ? query : query.join(",")
      }), true)
      req.then(gridApiService.paginationFunc(self.resolucionesAprobadas, offset));
      return req;
    };

    //Función para asignar controlador de la vista contrato_registro.html (expedición de la resolución), donde se pasa por parámetro el id de la resolucion seleccionada, la lista de resoluciones paraque sea recargada y los datos completos de la resolución con ayuda de $mdDialog
    $scope.verRealizarExpedicion = function (row) {
      $mdDialog.show({
        controller: "ContratoRegistroCtrl",
        controllerAs: 'contratoRegistro',
        templateUrl: 'views/vinculacionespecial/contrato_registro.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false,
        fullscreen: true,
        locals: { idResolucion: row.entity.Id, lista: self, resolucion: row.entity }
      });
    };


    //Función para asignar controlador de la vista contrato_registro_horas.html (expedición de la resolución de modificación de horas), donde se pasa por parámetro el id de la resolucion seleccionada, la lista de resoluciones paraque sea recargada y los datos completos de la resolución con ayuda de $mdDialog
    $scope.verRealizarExpedicionHoras = function (row) {
      $mdDialog.show({
        controller: "ContratoRegistroHorasCtrl",
        controllerAs: 'contratoRegistroHoras',
        templateUrl: 'views/vinculacionespecial/contrato_registro_horas.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        fullscreen: true,
        locals: { idResolucion: row.entity.Id, lista: self, resolucion: row.entity }
      });
    };

    //Función para asignar controlador de la vista contrato_registro_cancelar.html (expedición de la resolución de cancelación de vinculaciones), donde se pasa por parámetro el id de la resolucion seleccionada, la lista de resoluciones paraque sea recargada y los datos completos de la resolución con ayuda de $mdDialog
    $scope.verRealizarExpedicionCancelar = function (row) {
      $mdDialog.show({
        controller: "ContratoRegistroCancelarCtrl",
        controllerAs: 'contratoRegistroCancelar',
        templateUrl: 'views/vinculacionespecial/contrato_registro_cancelar.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false,
        fullscreen: true,
        locals: { idResolucion: row.entity.Id, lista: self, resolucion: row.entity }
      });
    };

    //Función para realizar la cancelación y verificación de la resolución
    self.cancelarResolucion = function (row) {
      //Se verifica que no existan liquidaciones asoociadas a los contratos pertenecientes a la resolucion
      adminMidRequest.post("cancelacion_valida/" + row.entity.Id).then(function (response) {
        if (response.data === "OK") {
          administrativaRequest.get("resolucion/" + row.entity.Id).then(function (response) {
            var nuevaResolucion = response.data;
            //Cambio de estado
            nuevaResolucion.Estado = false;
            //Se actualiza el estado de la resolución
            administrativaRequest.put("resolucion/CancelarResolucion", nuevaResolucion.Id, nuevaResolucion).then(function (response) {
              if (response.data === "OK") {
                self.cargarDatosResolucion(self.offset, self.query);
              }
            });
          });
        } else {
          swal({
            text: $translate.instant('NO_CANCELADA_PAGOS'),
            type: 'warning'
          });
        }
      });
    };

    //Función donde se despliega un mensaje de alerta previo a la restauración de la resolución
    $scope.verRestaurarResolucion = function (row) {
      swal({
        title: $translate.instant('PREGUNTA_RESTAURAR'),
        html:
          '<p><b>Número: </b>' + row.entity.Numero.toString() + '</p>' +
          '<p><b>Facultad: </b>' + row.entity.FacultadNombre + '</p>' +
          '<p><b>Nivel académico: </b>' + row.entity.NivelAcademico + '</p>' +
          '<p><b>Dedicación: </b>' + row.entity.Dedicacion + '</p>',
        type: 'success',
        showCancelButton: true,
        confirmButtonText: $translate.instant('ACEPTAR'),
        cancelButtonText: $translate.instant('CANCELAR'),
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false
      }).then(function () {
        self.restaurarResolucion(row);
      }, function (dismiss) {
        if (dismiss === 'cancel') {
          swal({
            text: $translate.instant('NO_RESTAURACION_RESOLUCION'),
            type: 'error'
          });
        }
      });
    };

    //Función para asignar controlador de la vista resolucion_vista.html, donde se pasa por parámetro el id de la resolucion seleccionada con ayuda de $mdDialog
    $scope.verVisualizarResolucion = function (row) {

      var resolucion = {
        Id: row.entity.Id,
        Numero: row.entity.Numero,
        NivelAcademico_nombre: row.entity.NivelAcademico,
        IdFacultad: row.entity.Facultad,
        Vigencia: row.entity.Vigencia,
        Periodo: row.entity.Periodo,
        NumeroSemanas: row.entity.NumeroSemanas,
        Dedicacion: row.entity.Dedicacion,
        FacultadNombre: row.entity.FacultadNombre,
        FechaExpedicion: row.entity.FechaExpedicion,
        TipoResolucion: row.entity.TipoResolucion,
        IdDependenciaFirma: row.entity.IdDependenciaFirma,
        FacultadFirmaNombre: row.entity.FacultadFirmaNombre,
        Estado: row.entity.Estado
      };

      var local = JSON.stringify(resolucion);
      localStorage.setItem('resolucion', local);

      $mdDialog.show({
        controller: "ResolucionVistaCtrl",
        controllerAs: 'resolucionVista',
        templateUrl: 'views/vinculacionespecial/resolucion_vista.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        fullscreen: true
      });
    };

    //Función para realizar la restauración y verificación de la resolución
    self.restaurarResolucion = function (row) {
      administrativaRequest.get("resolucion/" + row.entity.Id).then(function (response) {
        var nuevaResolucion = response.data;
        //Cambio de estado y fecha de expedicion de la resolucion en caso de que ya hubiese sido expedida.
        nuevaResolucion.Estado = true;
        nuevaResolucion.FechaExpedicion = null;
        //Se actualizan los datos de la resolución
        administrativaRequest.put("resolucion/RestaurarResolucion", nuevaResolucion.Id, nuevaResolucion).then(function (response) {
          if (response.data === "OK") {
            self.cargarDatosResolucion(self.offset, self.query);
          }
        });
      });
    };

    //Se hace el llamado de la función para cargar datos de resoluciones
    self.cargarDatosResolucion(self.offset, self.query);
  });