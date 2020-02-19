'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:CargaDocumentosDocenteCtrl
 * @description
 * # CargaDocumentosDocenteCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('CargaDocumentosDocenteCtrl', function ($scope, $http, $translate, uiGridConstants, contratoRequest, administrativaRequest, nuxeo, $q, coreRequest, $window,$sce, adminMidRequest,$routeParams) {
    //Variable de template que permite la edición de las filas de acuerdo a la condición ng-if
  var tmpl = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div><div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD"</div>';


  $('body').on('hidden.bs.modal', '.modal', function (e) {
    if($('.modal').hasClass('in')) {
    $('body').addClass('modal-open');
    }
});

  //Se utiliza la variable self estandarizada
  var self = this;
  self.mostrar_boton= true;

  self.Documento = $routeParams.docid;

  self.anios = [];

  self.meses_aux = [{
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
  ]


  self.getMeses = function (anio){
     var hoy = new Date();
    if (anio<hoy.getFullYear()){
      self.meses =self.meses_aux;
    }else if(anio==hoy.getFullYear()){

      self.meses = self.meses_aux.slice(0, hoy.getMonth()+1);

    }

  };
  /*
    Creación tabla que tendrá todos los contratos relacionados al docente
  */
  self.gridOptions1 = {
    enableSorting: true,
    enableFiltering: true,
    resizable: true,
    columnDefs: [{
        field: 'Resolucion',
        cellTemplate: tmpl,
        displayName: $translate.instant('RESOLUCION'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
        width: "10%"
      },
      {
        field: 'Vigencia',
        cellTemplate: tmpl,
        displayName: $translate.instant('VIGENCIA'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
        width: "10%"
      },
      {
        field: 'NumeroVinculacion',
        cellTemplate: tmpl,
        displayName: $translate.instant('NUM_VINC'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
        width: "15%"
      },
      {
        field: 'Dedicacion',
        cellTemplate: tmpl,
        displayName: $translate.instant('DED'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
        width: "10%"
      },
      {
        field: 'Dependencia',
        cellTemplate: tmpl,
        displayName: $translate.instant('PRO_CURR'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },
      {
        field: 'IdDependencia',
        visible: false,
        cellTemplate: tmpl,
        displayName: "Id Dependencia",
      },
      {
        field: 'Acciones',
        displayName: $translate.instant('ACC'),
        cellTemplate:
       // ' <a type="button" title="{{\'CAR_SOP\'| translate }}" type="button" class="fa fa-upload fa-lg  faa-shake animated-hover" ng-click="grid.appScope.cargaDocumentosDocente.cargar_soportes(row.entity); grid.appScope.cargaDocumentosDocente.solicitar_pago(row.entity);"  data-toggle="modal" data-target="#modal_carga_listas_docente">'
        ' <a type="button" title="Enviar Solicitud" type="button" class="fa fa-upload fa-lg  faa-shake animated-hover" ng-click="grid.appScope.cargaDocumentosDocente.cargar_soportes(row.entity); grid.appScope.cargaDocumentosDocente.solicitar_pago(row.entity);"  data-toggle="modal" data-target="#modal_check_docente">',
        width: "10%"
      }
    ]
  };


  self.gridOptions1.onRegisterApi = function(gridApi) {
    self.gridApi = gridApi;
  };

  /*
    Creación tabla que tendrá las solicitudes de pago de cada contrato
  */
  self.gridOptions2 = {
    enableSorting: true,
    enableFiltering: true,
    resizable: true,
    enableRowSelection: true,
    rowHeight: 40,
    columnDefs: [{
        field: 'NumeroContrato',
        cellTemplate: tmpl,
        displayName: $translate.instant('NUM_VINC'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },
      {
        field: 'VigenciaContrato',
        cellTemplate: tmpl,
        displayName: $translate.instant('VIGENCIA'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },
      {
        field: 'Mes',
        cellTemplate: tmpl,
        displayName: $translate.instant('MES'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },
      {
        field: 'Ano',
        cellTemplate: tmpl,
        displayName: $translate.instant('ANO'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },
      {
        field: 'EstadoPagoMensual.Nombre',
        cellTemplate: tmpl,
        displayName: $translate.instant('EST_SOL'),
        sort: {
          direction: uiGridConstants.ASC,
          priority: 1
        },
      },
      {
        field: 'Acciones',
        displayName: $translate.instant('ACC'),
        cellTemplate: '<a type="button" title="{{\'VER_SOP\'| translate }}" type="button" class="fa fa-folder-open-o fa-lg  faa-shake animated-hover" ng-click="grid.appScope.cargaDocumentosDocente.obtener_doc(row.entity)" data-toggle="modal" data-target="#modal_ver_soportes">' +
          '</a>&nbsp;'
          //+ ' <a ng-if="row.entity.EstadoPagoMensual.CodigoAbreviacion === \'CD\' || row.entity.EstadoPagoMensual.CodigoAbreviacion === \'RC\' || row.entity.EstadoPagoMensual.CodigoAbreviacion === \'RD\' || row.entity.EstadoPagoMensual.CodigoAbreviacion === \'RP\'" type="button" title="{{\'ENV_REV\'| translate }}" type="button" class="fa fa-send-o fa-lg  faa-shake animated-hover" ng-click="grid.appScope.cargaDocumentosDocente.enviar_revision(row.entity)"  >'
          + ' <a ng-if="row.entity.EstadoPagoMensual.CodigoAbreviacion === \'CD\' || row.entity.EstadoPagoMensual.CodigoAbreviacion === \'RC\' || row.entity.EstadoPagoMensual.CodigoAbreviacion === \'RD\' || row.entity.EstadoPagoMensual.CodigoAbreviacion === \'RP\'" type="button" title="{{\'ENV_REV\'| translate }}" type="button" class="fa fa-send-o fa-lg  faa-shake animated-hover" ng-click="grid.appScope.cargaDocumentosDocente.enviar_revision_check(row.entity)"  >',
        width: "10%"
      }
    ]
  };

  //No permite poder hacer multiples selecciones en la grilla
  self.gridOptions2.multiSelect = false;
  /*
    Función para obtener la data de la fila seleccionada en la grilla
  */
  self.gridOptions2.onRegisterApi = function(gridApi) {
    self.gridApi2 = gridApi;
    self.seleccionados = self.gridApi2.selection.selectedCount;
    self.gridApi2.selection.on.rowSelectionChanged($scope, function(row) {
      //Contiene la info del elemento seleccionado
      self.seleccionado = row.isSelected;
      //Condiciuonal para capturar la información de la fila seleccionado
      if (self.seleccionado) {
        self.fila_seleccionada = row.entity;
      }
    });
  };

  /*
    Enviar solicitud de revisión de soportes a Coordinador
  */
  self.enviar_revision = function (solicitud) {
    swal({
      title: $translate.instant('ENV_REV_WARN'),
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: $translate.instant('CANCELAR'),
      confirmButtonText: $translate.instant('ENVIAR')
    }).then(function () {

      var nombre_docs = solicitud.VigenciaContrato + solicitud.NumeroContrato + solicitud.Persona + solicitud.Mes + solicitud.Ano;

    //  administrativaRequest.get('soporte_pago_mensual', $.param({
    //    query: "PagoMensual:" + solicitud.Id,
    //    limit: 0
    //  })).then(function(responseVal){

    self.obtener_doc(solicitud);


        if(self.documentos!== null){
          solicitud.EstadoPagoMensual = {"Id":1};
          solicitud.Responsable = self.informacion_coordinador.numero_documento_coordinador;
          solicitud.CargoResponsable = "COORDINADOR " + self.contrato.Dependencia;
          solicitud.CargoResponsable = solicitud.CargoResponsable.substring(0,69);
          administrativaRequest.put('pago_mensual', solicitud.Id, solicitud).
          then(function(response){
            swal(
               $translate.instant('SOLICITUD_ENVIADA'),
              $translate.instant('SOLICITUD_EN_ESPERA'),
              'success'
            )
          })
          self.cargar_soportes(self.contrato);


        self.gridApi2.core.refresh();

      }else{
        swal(
          'Error',
          $translate.instant('NO_PUEDE_ENV'),
          'error'
        )
      }//else
          //    });
    });



  };

  /*
    Función para consultar los datos del docente y los contratos asociados a este
  */
  self.obtener_informacion_docente = function() {
    //Petición para obtener la información del docente
    self.gridOptions1.data = [];
    self.contratos = [];
      //Petición para obtener las vinculaciones del docente
      adminMidRequest.get('aprobacion_pago/get_contratos_docente/' + self.Documento)
      .then(function(response) {
        if(self.respuesta_docente !== null || self.respuesta_docente !== undefined){
          //Contiene la respuesta de la petición
          self.respuesta_docente = response.data;
          //Variable que contiene el nombre del docente
          self.nombre_docente = self.respuesta_docente[0].NombreDocente;
          //Carga la información en la tabla
          self.gridOptions1.data = self.respuesta_docente;
        }else{
          swal(
            'Error',
            'No se encontraron vinculaciones vigentes asociadas a su número de documento',
            'error'
        )
        }

      });
   // self.gridApi2.core.refresh();
  };

  self.obtener_informacion_docente();


  /*
  Función que permite realizar una solicitud de pago mensual
  */
  self.solicitar_pago = function(contrato) {
    self.contrato = contrato;
    self.anios = [parseInt(self.contrato.Vigencia), parseInt(self.contrato.Vigencia) -1];
  };


  self.cargar_soportes = function(contrato) {

    self.seleccionado = false;
    self.gridOptions2.data = [];
    self.contrato = contrato;
    self.obtener_informacion_coordinador(self.contrato.IdDependencia);
    administrativaRequest.get("pago_mensual", $.param({
      query: "NumeroContrato:" + self.contrato.NumeroVinculacion + ",VigenciaContrato:" + self.contrato.Vigencia,
      limit: 0
    })).then(function(response) {

      contratoRequest.get('contrato_elaborado', self.contrato.NumeroVinculacion + '/' + self.contrato.Vigencia).then(function(response_ce) {

        self.tipo_contrato = response_ce.data.contrato.tipo_contrato;

        administrativaRequest.get("item_informe_tipo_contrato", $.param({
          query: "TipoContrato:" + self.tipo_contrato,
          limit: 0
        })).then(function(response_iitc) {

          self.items = response_iitc.data;

        });

      });

      self.gridOptions2.data = response.data;

    });
  };

  self.obtener_informacion_coordinador = function(IdDependencia){
    adminMidRequest.get('aprobacion_pago/informacion_coordinador/'+ IdDependencia)
    .then(function(response){
      self.informacion = response.data;
      self.informacion_coordinador = self.informacion.carreraSniesCollection.carreraSnies[0];
    })
  };


  self.verificar_fecha_pago = function(){
    var hoy = new Date();
    if(self.mes !== hoy.getMonth()+1 || self.anio !== hoy.getFullYear()){
      swal({
        title: $translate.instant('VERIFICACION_FECHA_WARN'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: $translate.instant('CANCELAR'),
        confirmButtonText: $translate.instant('ACEPTAR')
      }).then(function () {

        self.enviar_solicitud();

      });



    }else{

      self.enviar_solicitud();
    }
  }


  self.enviar_solicitud = function() {
    self.mostrar_boton= false;

    if (self.mes !== undefined && self.anio !== undefined) {


      //Petición para obtener id de estado pago mensual
      administrativaRequest.get("estado_pago_mensual", $.param({
          query: "CodigoAbreviacion:CD",
          limit: 0
        })).then(function (response) {
        //Variable que contiene el Id del estado pago mensual
        var id_estado = response.data[0].Id;
      //Se arma elemento JSON para la solicitud
      var pago_mensual = {
        CargoResponsable: "DOCENTE",
        EstadoPagoMensual: { Id: id_estado},
        Mes: self.mes,
        Ano: self.anio,
        NumeroContrato: self.contrato.NumeroVinculacion,
        Persona: self.Documento,
        Responsable: self.Documento,
        VigenciaContrato: parseInt(self.contrato.Vigencia)
      };


      administrativaRequest.get("pago_mensual", $.param({
        query: "NumeroContrato:" + self.contrato.NumeroVinculacion +
          ",VigenciaContrato:" + self.contrato.Vigencia +
          ",Mes:" + self.mes +
          ",Ano:" + self.anio,
        limit: 0
      })).then(function(response) {

        if (response.data == null) {

          administrativaRequest.post("pago_mensual", pago_mensual).then(function(response) {
            swal(
              $translate.instant('SOLICITUD_REGISTRADA'),
              $translate.instant('CARGUE_CORRESPONDIENTE'),
              'success'
            )

            self.cargar_soportes(self.contrato);


            self.gridApi2.core.refresh();

         //   self.contrato = {};
            self.mes = {};
            self.anio = {};
            self.mostrar_boton= true;

          });

        } else {

          swal(
            'Error',
            $translate.instant('YA_EXISTE'),
            'error'
          );

          self.mostrar_boton= true;
        }

      });

    });
  }else {
      swal(
        'Error',
        $translate.instant('DEBE_SELECCIONAR'),
        'error'
      );
      self.mostrar_boton= true;
    }

  };

  /*
    Función para cargar los documentos a la carpeta  destino
  */
  self.cargarDocumento = function(nombre, descripcion, documento, callback) {
    var defered = $q.defer();
    var promise = defered.promise;

    nuxeo.operation('Document.Create')
      .params({
        type: 'File',
        name: nombre,
        properties: 'dc:title=' + nombre + ' \ndc:description=' + descripcion
      })
      .input('/default-domain/workspaces/Titán')
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
            var url = doc.uid;
            callback(url);
            defered.resolve(url);
          })
          .catch(function(error) {
            defered.reject(error);
            throw error;
          });
      })
      .catch(function(error) {
        defered.reject(error);
        throw error;
      });

    return promise;
  }

  self.subir_documento = function() {

    var nombre_doc = self.contrato.Vigencia + self.contrato.NumeroVinculacion + self.Documento + self.fila_seleccionada.Mes + self.fila_seleccionada.Ano;


    if (self.archivo) {

      if (self.fileModel!== undefined && self.item!==undefined) {
      self.mostrar_boton= false;
      var descripcion = self.item.ItemInforme.Nombre;
      var aux = self.cargarDocumento(nombre_doc, descripcion, self.fileModel, function(url) {
        //Objeto documento
        var date = new Date();
        date = moment(date).format('DD_MMM_YYYY_HH:mm:ss');
        //var now = date
        self.objeto_documento = {
          "Nombre": nombre_doc,
          "Descripcion": descripcion,
          "TipoDocumento": {
            "Id": 3
          },
          "Contenido": JSON.stringify({
            "NombreArchivo": self.fileModel.name,
            "FechaCreacion": date,
            "Tipo": "Archivo",
            "IdNuxeo": url,
            "Observaciones": self.observaciones
          }),
          "Activo": true
        };

        //Post a la tabla documento del core
        coreRequest.post('documento', self.objeto_documento)
          .then(function(response) {
            self.id_documento = response.data.Id;

            //Objeto soporte_pago_mensual
            self.objeto_soporte = {
              "PagoMensual": {
                "Id": self.fila_seleccionada.Id
              },
              "Documento": self.id_documento,
              "ItemInformeTipoContrato": {
                "Id": self.item.Id
              },
              "Aprobado": false
            };

            //Post a la tabla soporte documento
            administrativaRequest.post('soporte_pago_mensual', self.objeto_soporte)
              .then(function(response) {
                //Bandera de validacion
                swal(
                  $translate.instant('DOCUMENTO_GUARDADO'),
                  $translate.instant('DOCUMENTO_SE_HA_GUARDADO'),
                  'success'
                );
                self.item = undefined;
                //angular.element("input[type='file']").val(null);
                self.fileModel = undefined;
                self.mostrar_boton= true;

              });
          });


      });

    }else{

      swal(
        'Error',
        $translate.instant('DEBE_SUBIR_ARCHIVO'),
        'error'
      );

      self.mostrar_boton= true;

    }
//
    } else if (self.link) {
      if (self.enlace!== undefined && self.item!==undefined) {
        self.mostrar_boton= false;

        var descripcion = self.item.ItemInforme.Nombre;
      //Objeto documento
      self.objeto_documento = {
        "Nombre": nombre_doc,
        "Descripcion": descripcion,
        "TipoDocumento": {
          "Id": 3
        },
        "Contenido": JSON.stringify({
          "Tipo": "Enlace",
          "Enlace": self.enlace,
          "Observaciones": self.observaciones
        }),
        "Activo": true
      };
      //Post a la tabla documento del core
      coreRequest.post('documento', self.objeto_documento)
        .then(function(response) {
          self.id_documento = response.data.Id;

          //Objeto soporte_pago_mensual
          self.objeto_soporte = {
            "PagoMensual": {
              "Id": self.fila_seleccionada.Id
            },
            "Documento": self.id_documento,
            "ItemInformeTipoContrato": {
              "Id": self.item.Id
            },
            "Aprobado": false
          };

          //Post a la tabla soporte documento
          administrativaRequest.post('soporte_pago_mensual', self.objeto_soporte)
            .then(function(response) {
              //Bandera de validacion
              swal(
                $translate.instant('ENLACE_GUARDADO'),
                $translate.instant('ENLACE_SE_HA_GUARDADO'),
                'success'
              );
              self.enlace = undefined;
              self.item = undefined;
              self.mostrar_boton= true;

             });
        });

      }else{

        swal(
          'Error',
          $translate.instant('DEBE_PEGAR_ENLACE'),
          'error'
        );

        self.mostrar_boton= true;

      }
    }
    self.objeto_documento={};

  };

  self.cambiarCheckArchivo = function() {
    if (self.archivo) {
      self.link = false;
    }
  };

  self.cambiarCheckLink = function() {
    if (self.link) {
      self.archivo = false;
    }
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
            $window.open(fileURL, 'Soporte Cumplido', 'resizable=yes,status=no,location=no,toolbar=no,menubar=no,fullscreen=yes,scrollbars=yes,dependent=no,width=700,height=900');
         });
     });
   };

   /*
    Función que obtiene los documentos relacionados a las solicitudes
   */
   self.obtener_doc = function (fila){
     self.fila_sol_pago = fila;
     var nombre_docs = self.contrato.Vigencia + self.contrato.NumeroVinculacion + self.Documento + self.fila_sol_pago.Mes + self.fila_sol_pago.Ano;
     coreRequest.get('documento', $.param ({
      query: "Nombre:" + nombre_docs + ",Activo:true",
      limit:0
    })).then(function(response){
      self.documentos = response.data;
      angular.forEach(self.documentos, function(value) {
        self.descripcion_doc = value.Descripcion;
        value.Contenido = JSON.parse(value.Contenido);

        if (value.Contenido.Tipo === "Enlace") {
            value.Contenido.NombreArchivo = value.Contenido.Tipo;
        };
      });
    })
  };

  /*
    Función para visualizar enlace
  */
  self.visualizar_enlace = function (url){
    $window.open(url);
  };


  /*
    Función para "borrar" un documento
  */
  self.borrar_doc = function(){

   var documento = self.doc;
    /*  swal({
        title: '¿Está seguro(a) de eliminar el soporte?',
        text: "No podrá revertir esta acción",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar'
      }).then(function () {*/
       documento.Contenido = JSON.stringify(documento.Contenido)
       documento.Activo = false;
       coreRequest.put('documento', documento.Id, documento).
       then(function(response){
            self.obtener_doc(self.fila_sol_pago);
      });

    //  });


  };

  self.set_doc = function (doc){

    self.doc = doc;
  };

//Aqui empiezan las funciones que desactivan la funcionalidad de carga de documentos


  self.enviar_solicitud_coordinador = function(){

    self.mostrar_boton= false;

    if (self.mes !== undefined && self.anio !== undefined) {


      //Petición para obtener id de estado pago mensual
      administrativaRequest.get("estado_pago_mensual", $.param({
          query: "CodigoAbreviacion:PRC",
          limit: 0
        })).then(function (response) {
        //Variable que contiene el Id del estado pago mensual
        var id_estado = response.data[0].Id;
      //Se arma elemento JSON para la solicitud
      var pago_mensual = {
        CargoResponsable: "COORDINADOR " + self.contrato.Dependencia,
        EstadoPagoMensual: { Id: id_estado},
        Mes: self.mes,
        Ano: self.anio,
        NumeroContrato: self.contrato.NumeroVinculacion,
        Persona: self.Documento,
        Responsable: self.informacion_coordinador.numero_documento_coordinador,
        VigenciaContrato: parseInt(self.contrato.Vigencia)
      };

      pago_mensual.CargoResponsable= pago_mensual.CargoResponsable.substring(0,69);

      administrativaRequest.get("pago_mensual", $.param({
        query: "NumeroContrato:" + self.contrato.NumeroVinculacion +
          ",VigenciaContrato:" + self.contrato.Vigencia +
          ",Mes:" + self.mes +
          ",Ano:" + self.anio,
        limit: 0
      })).then(function(response) {

        if (response.data == null) {

          administrativaRequest.post("pago_mensual", pago_mensual).then(function(response) {
            swal(
              'Solicitud registrada y enviada',
              'Se ha enviado la solicitud a la coordinación',
              'success'
            )

            self.cargar_soportes(self.contrato);


            self.gridApi2.core.refresh();

         //   self.contrato = {};
            self.mes = {};
            self.anio = {};
            self.mostrar_boton= true;

          });

        } else {

          swal(
            'Error',
            $translate.instant('YA_EXISTE'),
            'error'
          );

          self.mostrar_boton= true;
        }

      });

    });
  }else {
      swal(
        'Error',
        $translate.instant('DEBE_SELECCIONAR'),
        'error'
      );
      self.mostrar_boton= true;
    }


  };


  self.verificar_fecha_pago_check = function(){
    var hoy = new Date();
    if(self.mes !== hoy.getMonth()+1 || self.anio !== hoy.getFullYear()){
      swal({
        title: $translate.instant('VERIFICACION_FECHA_WARN'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: $translate.instant('CANCELAR'),
        confirmButtonText: $translate.instant('ACEPTAR')
      }).then(function () {

        self.enviar_solicitud_coordinador();

      });



    }else{

      self.enviar_solicitud_coordinador();
    }
  }


  self.enviar_revision_check = function (solicitud) {

    swal({
      title: '¿Está seguro(a) de enviar el cumplido a la coordinación?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: $translate.instant('CANCELAR'),
      confirmButtonText: $translate.instant('ENVIAR')
    }).then(function () {
          solicitud.EstadoPagoMensual = {"Id":1};
          solicitud.Responsable = self.informacion_coordinador.numero_documento_coordinador;
          solicitud.CargoResponsable = "COORDINADOR " + self.contrato.Dependencia;

          solicitud.CargoResponsable = solicitud.CargoResponsable.substring(0,69);
          administrativaRequest.put('pago_mensual', solicitud.Id, solicitud).
          then(function(response){
            swal(
               $translate.instant('SOLICITUD_ENVIADA'),
              $translate.instant('SOLICITUD_EN_ESPERA'),
              'success'
            )
            self.cargar_soportes(self.contrato);
            self.gridApi2.core.refresh();
          })


    });



  };



  });
