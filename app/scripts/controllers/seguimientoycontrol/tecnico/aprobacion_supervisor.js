'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:AprobacionSupervisorCtrl
 * @description
 * # AprobacionSupervisorCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('AprobacionSupervisorCtrl', function ($scope, $http, $translate, uiGridConstants, contratoRequest, administrativaRequest, nuxeo, $q, coreRequest, $window,$sce, adminMidRequest,$routeParams, wso2GeneralService, amazonAdministrativaRequest) {
    //Variable de template que permite la edición de las filas de acuerdo a la condición ng-if
    var tmpl = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div><div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD"</div>';

    //Se utiliza la variable self estandarizada
    var self = this;
    self.Documento = '79513808';
    self.objeto_docente = [];
    self.nombres_docentes_incumplidos = '';
    self.mes = '';

    self.meses = [{
        Id: 1,
        Nombre: $translate.instant('ENERO')
      },
      {
        Id: 2,
        Nombre: $translate.instant('FEBRERO')
      },
      {
        Id: 3,
        Nombre: $translate.instant('MARZO')
      },
      {
        Id: 4,
        Nombre: $translate.instant('ABRIL')
      },
      {
        Id: 5,
        Nombre: $translate.instant('MAYO')
      },
      {
        Id: 6,
        Nombre: $translate.instant('JUNIO')
      },
      {
        Id: 7,
        Nombre: $translate.instant('JULIO')
      },
      {
        Id: 8,
        Nombre: $translate.instant('AGOSTO')
      },
      {
        Id: 9,
        Nombre: $translate.instant('SEPT')
      },
      {
        Id: 10,
        Nombre: $translate.instant('OCTU')
      },
      {
        Id: 11,
        Nombre: $translate.instant('NOV')
      },
      {
        Id: 12,
        Nombre: $translate.instant('DIC')
      }
    ];

    self.d = new Date();
    self.anios = [(self.d.getFullYear()), (self.d.getFullYear() + 1)];

    /*
      Creación tabla que tendrá todos los docentes relacionados al coordinador
    */
    self.gridOptions1 = {
      enableSorting: true,
      enableFiltering: true,
      resizable: true,
      rowHeight: 40,
      columnDefs: [
        {
          field: 'NombreDependencia',
          cellTemplate: tmpl,
          displayName: 'DEPENDENCIA',//$translate.instant('PRO_CURR')//,
          sort: {
            direction: uiGridConstants.ASC,
            priority: 1
          },
          width: "15%"
        },
        {
          field: 'PagoMensual.Persona',
          cellTemplate: tmpl,
          displayName: $translate.instant('DOCUMENTO'),
          sort: {
            direction: uiGridConstants.ASC,
            priority: 1
          },
          width: "15%"
        },
        {
          field: 'NombrePersona',
          cellTemplate: tmpl,
          displayName: 'NOMBRE CONTRATISTA',//$translate.instant('NAME_TEACHER'),
          sort: {
            direction: uiGridConstants.ASC,
            priority: 1
          },
        },

        {
          field: 'PagoMensual.NumeroContrato',
          cellTemplate: tmpl,
          displayName: $translate.instant('NUM_VIN'),
          sort: {
            direction: uiGridConstants.ASC,
            priority: 1
          },
        },
        {
          field: 'PagoMensual.Mes',
          cellTemplate: tmpl,
          displayName: $translate.instant('MES_SOLICITUD'),
          sort: {
            direction: uiGridConstants.ASC,
            priority: 1
          },
        },
        {
          field: 'PagoMensual.Ano',
          cellTemplate: tmpl,
          displayName: $translate.instant('ANO_SOLICITUD'),
          sort: {
            direction: uiGridConstants.ASC,
            priority: 1
          },
        },
      {
        field: 'Acciones',
        displayName: $translate.instant('ACC'),
        cellTemplate: '<a type="button" title="Ver soportes" type="button" class="fa fa-eye fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionSupervisor.obtener_doc(row.entity.PagoMensual)" data-toggle="modal" data-target="#modal_ver_soportes"</a>&nbsp;' +
          '<a type="button" title="Visto bueno" type="button" class="fa fa-check fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionSupervisor.dar_visto_bueno(row.entity.PagoMensual)"></a>&nbsp;'+
          '<a type="button" title="Rechazar" type="button" class="fa fa-close fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionSupervisor.rechazar(row.entity.PagoMensual)"></a>',
        width: "10%"
      }
      ]
};


    /*
      Función que permite obtener la data de la fila seleccionada
    */
    self.gridOptions1.onRegisterApi = function (gridApi) {
      self.gridApi = gridApi;
    };



    /*
    Función que al recibir el número de documento del coordinador cargue los correspondientes
    */
    self.obtener_contratistas_supervisor = function () {

      self.obtener_informacion_supervisor(self.Documento);
      //Petición para obtener el Id de la relación de acuerdo a los campos
      adminMidRequest.get('aprobacion_pago/solicitudes_supervisor_contratistas/'+self.Documento).then(function (response) {
        self.documentos = response.data;
        console.log(self.documentos);
        //self.obtener_informacion_docente();
        self.gridOptions1.data = self.documentos;
      });
};


    /*
      Función que obtiene la información correspondiente al supervisor
    */
    self.obtener_informacion_supervisor = function (documento) {
      //Se realiza petición a servicio de academica que retorna la información del coordinador
      amazonAdministrativaRequest.get('informacion_proveedor', $.param({
        query: "NumDocumento:" + documento,
        limit: 0
      })).then(function (response) {
        console.log(response.data);
        //Información contratista
        self.info_supervisor = response.data;
        self.nombre_supervisor = self.info_supervisor[0].NomProveedor;
        console.log(self.nombre_supervisor);
    });
  };

    /**/

    self.obtener_contratistas_supervisor();


    self.dar_visto_bueno = function (pago_mensual) {
      contratoRequest.get('contrato', pago_mensual.NumeroContrato + '/' + pago_mensual.VigenciaContrato)
      .then(function (response) {
        self.aux_pago_mensual = pago_mensual;
        //console.log(self.aux_pago_mensual);
        console.log(response.data);
        self.contrato = response.data.contrato;

        //Obtiene la información correspondiente del ordenador
        adminMidRequest.get('aprobacion_pago/informacion_ordenador/' + self.contrato.numero_contrato + '/' + pago_mensual.VigenciaContrato)
        .then(function (responseOrdenador){
          self.ordenador = responseOrdenador.data;
          self.aux_pago_mensual.Responsable = self.ordenador.NumeroDocumento.toString();
          self.aux_pago_mensual.CargoResponsable = self.ordenador.Cargo;




        administrativaRequest.get('estado_pago_mensual', $.param({
          limit: 0,
          query: 'CodigoAbreviacion:AS'
        })).then(function (responseCod) {

          var sig_estado = responseCod.data;
          console.log(sig_estado);
          self.aux_pago_mensual.EstadoPagoMensual.Id = sig_estado[0].Id;

          console.log(self.aux_pago_mensual);


          administrativaRequest.put('pago_mensual', self.aux_pago_mensual.Id, self.aux_pago_mensual)
          .then(function (response) {

           if(response.data==="OK"){

                swal(
                  'Aprobación soportes ',
                  'Tiene la validación del supervisor del contrato',
                  'success'
                )
                self.obtener_contratistas_supervisor();
                self.gridApi.core.refresh();

           }else{
            swal(
              'Error',
              'No se ha podido registrar la validación del supervisor',
              'error'
            );
           }

          });

        })
     });
     });

    };

    self.rechazar = function (pago_mensual) {

      contratoRequest.get('contrato', pago_mensual.NumeroContrato + '/' + pago_mensual.VigenciaContrato)
      .then(function (response) {
        self.aux_pago_mensual = pago_mensual;
       // self.contrato = response.data.contrato;
        //self.aux_pago_mensual.Responsable = self.contrato.supervisor.documento_identificacion;

        administrativaRequest.get('estado_pago_mensual', $.param({
          limit: 0,
          query: 'CodigoAbreviacion:RS'
        })).then(function (responseCod) {

          var sig_estado = responseCod.data;
          self.aux_pago_mensual.EstadoPagoMensual.Id = sig_estado[0].Id;

          administrativaRequest.put('pago_mensual', self.aux_pago_mensual.Id, self.aux_pago_mensual)
          .then(function (response) {

            if(response.data==="OK"){

              swal(
                'Rechazo registrado',
                'Se ha registrado el rechazo de los soportes',
                'success'
              )
              self.obtener_contratistas_supervisor();
              self.gridApi.core.refresh();
             }else{


              swal(
                'Error',
                'No se ha podido registrar el rechazo',
                'error'
              );
             }

          });

        })
      });

    };

    /*
      Función para ver los soportes de los contratistas a cargo
    */
    self.obtener_doc = function (fila){
      self.fila_sol_pago = fila;
      var nombre_docs = self.fila_sol_pago.VigenciaContrato + self.fila_sol_pago.NumeroContrato + self.fila_sol_pago.Persona + self.fila_sol_pago.Mes + self.fila_sol_pago.Ano;
      coreRequest.get('documento', $.param ({
       query: "Nombre:" + nombre_docs + ",Activo:true",
       limit:0
     })).then(function(response){
       console.log(self.documentos);
       self.documentos = response.data;
       angular.forEach(self.documentos, function(value) {
         self.descripcion_doc = value.Descripcion;
         value.Contenido = JSON.parse(value.Contenido);
       });
     })
   };

   /*
     Función que permite obtener un documento de nuxeo por el Id
   */
   self.getDocumento = function(docid){
    nuxeo.header('X-NXDocumentProperties', '*');

    self.obtenerDoc = function () {
      var defered = $q.defer();

      nuxeo.request('/id/'+docid)
          .get()
          .then(function(response) {
            self.doc=response;
            var aux=response.get('file:content');
            self.document=response;
            defered.resolve(response);
          })
          .catch(function(error){
              defered.reject(error)
          });
      return defered.promise;
    };

    self.obtenerFetch = function (doc) {
      var defered = $q.defer();

      doc.fetchBlob()
        .then(function(res) {
          defered.resolve(res.blob());

        })
        .catch(function(error){
              defered.reject(error)
          });
      return defered.promise;
    };

      self.obtenerDoc().then(function(){

         self.obtenerFetch(self.document).then(function(r){
             self.blob=r;
             var fileURL = URL.createObjectURL(self.blob);
             self.content = $sce.trustAsResourceUrl(fileURL);
             $window.open(fileURL, 'Soporte', 'resizable=yes,status=no,location=no,toolbar=no,menubar=no,fullscreen=yes,scrollbars=yes,dependent=no,width=700,height=900', true);
          });
      });
    };


    /*
      Función para enviar un comentario en el soporte    */
    self.enviar_comentario = function(documento){
        swal({
          title: '¿Está seguro(a) de enviar la observación?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Aceptar'
        }).then(function () {
             documento.contenido = JSON.stringify(documento.contenido);
             coreRequest.put('documento', documento.Id, documento).
             then(function(response){
                  self.obtener_doc(self.fila_sol_pago);
            });

        });
    };
});