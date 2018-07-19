'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolPlanTrabajoDocenteAprobacionCoordinadorPlanTrabajoCtrl
 * @description
 * # SeguimientoycontrolPlanTrabajoDocenteAprobacionCoordinadorPlanTrabajoCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolPlanTrabajoDocenteAprobacionCoordinadorPlanTrabajoCtrl', function (homologacionDependenciaService, oikosRequest, $http, uiGridConstants, contratoRequest, $translate, administrativaRequest, academicaWsoService, coreRequest, $q, $window, $sce, nuxeo, adminMidRequest, $routeParams, wso2GeneralService) {
    
     //Se utiliza la variable self estandarizada
     var self = this;

    var tmpl = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div><div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD"</div>';

    /*
      Función que obtiene la información correspondiente al coordinador
    */
    self.obtener_informacion_coordinador = function (documento) {
      //Se realiza petición a servicio de academica que retorna la información del coordinador
      academicaWsoService.get(' ', documento).
        then(function (response) {
          self.informacion_coordinador = response.data;
        //  self.coordinador = self.informacion_coordinador.coordinadorCollection.coordinador[0];
          self.proyectos_coordinador = self.informacion_coordinador.coordinadorCollection.coordinador;
          self.nombre_coordinador = self.informacion_coordinador.coordinadorCollection.coordinador[0].nombre_coordinador;
        })
    };

    self.gridOptions1 = {
      enableSorting: true,
      enableFiltering: true,
      resizable: true,
      rowHeight: 40,
      
      //enableHiding: false,
      columnDefs: [
          {
          field: 'Documento',
          cellTemplate: tmpl,
          displayName: $translate.instant('DOCUMENTO'),
          sort: {
            direction: uiGridConstants.ASC,
          },
          width: "20%",
          enableHiding: false,
        },
        {
          field: 'NombrePersona',
          cellTemplate: tmpl,
          displayName: $translate.instant('NAME_TEACHER'),
          sort: {
            direction: uiGridConstants.ASC,
          },
          enableHiding: false,
        },
        {
        field: 'Acciones',
        displayName: $translate.instant('ACC'),
        cellTemplate: '<a type="button" title="Ver soportes" type="button" class="fa fa-eye fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionCoordinadorPlanTrabajo.obtener_doc(row.entity.PagoMensual)" data-toggle="modal" data-target="#modal_ver_soportes"</a>&nbsp;' +
          '<a type="button" title="Visto bueno" type="button" class="fa fa-check fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionCoordinadorPlanTrabajo.dar_visto_bueno(row.entity.PagoMensual)"></a>&nbsp;'+
          '<a type="button" title="Rechazar" type="button" class="fa fa-close fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionCoordinadorPlanTrabajo.rechazar(row.entity.PagoMensual)"></a>',
        width: "10%",
        enableHiding: false,
      }
      ]
      
    };

    self.gridOptions1.data = [
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      },
      {
        "Documento": "1234567",
        "NombrePersona": "NombrePersona de prueba"
      }
      
    ];



  });
