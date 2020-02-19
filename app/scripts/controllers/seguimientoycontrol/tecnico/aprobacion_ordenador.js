'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:AprobacionCoordinadorCtrl
 * @description
 * # AprobacionCoordinadorCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('AprobacionOrdenadorCtrl', function (homologacionDependenciaService, oikosRequest, $http, uiGridConstants, contratoRequest, $translate, administrativaRequest, academicaWsoService, coreRequest, $q, $window, $sce, nuxeo, adminMidRequest, $routeParams, wso2GeneralService) {
    //Variable de template que permite la edición de las filas de acuerdo a la condición ng-if
    var tmpl = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div><div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD"</div>';

    //Se utiliza la variable self estandarizada
    var self = this;
    self.Documento = $routeParams.docid;
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
      Función para obtener la imagen del escudo de la universidad
    */
    $http.get("scripts/models/imagen_ud.json")
     .then(function(response) {
       self.imagen = response.data;
    });

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
          field: 'Dependencia.Nombre',
          cellTemplate: tmpl,
          displayName: $translate.instant('PRO_CURR'),
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
          displayName: $translate.instant('NAME_TEACHER'),
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
        cellTemplate: //'<a type="button" title="Ver soportes" type="button" class="fa fa-eye fa-lg  faa-shake animated-hover"' +
          //'ng-click="grid.appScope.aprobacionCoordinador.obtener_doc(row.entity.PagoMensual)" data-toggle="modal" data-target="#modal_ver_soportes"</a>&nbsp;' +
          '<a type="button" title="Visto bueno" type="button" class="fa fa-check fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionCoordinador.dar_visto_bueno(row.entity.PagoMensual)"></a>&nbsp;'+
          '<a type="button" title="Rechazar" type="button" class="fa fa-close fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.aprobacionCoordinador.rechazar(row.entity.PagoMensual)"></a>',
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
    self.obtener_docentes_coordinador = function () {

      self.obtener_informacion_coordinador(self.Documento);
      //Petición para obtener el Id de la relación de acuerdo a los campos
      adminMidRequest.get('aprobacion_pago/solicitudes_coordinador/'+self.Documento).then(function (response) {
        self.documentos = response.data;
        //self.obtener_informacion_docente();
        self.gridOptions1.data = self.documentos;
      });
};


    /*
      Función que obtiene la información correspondiente al coordinador
    */
    self.obtener_informacion_coordinador = function (documento) {
      //Se realiza petición a servicio de academica que retorna la información del coordinador
      academicaWsoService.get('coordinador_carrera_snies', documento).
        then(function (response) {
          self.informacion_coordinador = response.data;
        //  self.coordinador = self.informacion_coordinador.coordinadorCollection.coordinador[0];
          self.proyectos_coordinador = self.informacion_coordinador.coordinadorCollection.coordinador;
          self.nombre_coordinador = self.informacion_coordinador.coordinadorCollection.coordinador[0].nombre_coordinador;
        })
    };

    /**/

    self.obtener_docentes_coordinador();


    self.dar_visto_bueno = function (pago_mensual) {
      contratoRequest.get('contrato_elaborado', pago_mensual.NumeroContrato + '/' + pago_mensual.VigenciaContrato).then(function (response) {
        self.aux_pago_mensual = pago_mensual;
        self.contrato = response.data.contrato;
        self.aux_pago_mensual.Responsable = self.contrato.supervisor.documento_identificacion.toString();

        administrativaRequest.get('estado_pago_mensual', $.param({
          limit: 0,
          query: 'CodigoAbreviacion:PAD'
        })).then(function (responseCod) {

          var sig_estado = responseCod.data;
          self.aux_pago_mensual.EstadoPagoMensual.Id = sig_estado[0].Id;


          administrativaRequest.put('pago_mensual', self.aux_pago_mensual.Id, self.aux_pago_mensual).then(function (response) {

           if(response.data==="OK"){

            swal(
              'Visto bueno registrado',
              'Se ha registrado el visto bueno del cumplido',
              'success'
            )
            self.obtener_docentes_coordinador();
            self.gridApi.core.refresh();
           }else{


            swal(
              'Error',
              'No se ha podido registrar el visto bueno',
              'error'
            );
           }

          });

        })
      });

    };

    self.rechazar = function (pago_mensual) {

      contratoRequest.get('contrato_elaborado', pago_mensual.NumeroContrato + '/' + pago_mensual.VigenciaContrato).then(function (response) {
        self.aux_pago_mensual = pago_mensual;
       // self.contrato = response.data.contrato;
        //self.aux_pago_mensual.Responsable = self.contrato.supervisor.documento_identificacion;

        administrativaRequest.get('estado_pago_mensual', $.param({
          limit: 0,
          query: 'CodigoAbreviacion:RC'
        })).then(function (responseCod) {

          var sig_estado = responseCod.data;
          self.aux_pago_mensual.EstadoPagoMensual.Id = sig_estado[0].Id;

          administrativaRequest.put('pago_mensual', self.aux_pago_mensual.Id, self.aux_pago_mensual).then(function (response) {

            if(response.data==="OK"){

              swal(
                'Rechazo registrado',
                'Se ha registrado el rechazo del cumplido',
                'success'
              )
              self.obtener_docentes_coordinador();
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
      Función para ver documentos de los docentes a cargo
    */
    self.obtener_doc = function (fila){
      self.fila_sol_pago = fila;
      var nombre_docs = self.fila_sol_pago.VigenciaContrato + self.fila_sol_pago.NumeroContrato + self.fila_sol_pago.Persona + self.fila_sol_pago.Mes + self.fila_sol_pago.Ano;
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
             $window.open(fileURL, 'Soporte Cumplido', 'resizable=yes,status=no,location=no,toolbar=no,menubar=no,fullscreen=yes,scrollbars=yes,dependent=no,width=700,height=900', true);
          });
      });
    };


    /*
      Función para "borrar" un documento
    */
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



    /*
      Función que genera el documento de quienes no cumplieron con sus obligaciones
    */
    self.generarPDF = function (){


      homologacionDependenciaService.get('proyecto_curricular_snies', self.coordinador.codigo_snies).
      then(function(response){
        console.log(self.coordinador.codigo_snies);
        self.proyecto_homologado = response.data.homologacion;

            //adminMidRequest.get('aprobacion_pago/certificacion_visto_bueno/*/**/*').
            adminMidRequest.get('/aprobacion_pago/certificacion_visto_bueno/'+ self.proyecto_homologado.id_oikos +'/' + self.mes.Id + '/' + self.anio).
              then(function(responseMid){
               self.docentes_incumplidos = responseMid.data;

                oikosRequest.get('dependencia_padre', $.param({
                  query:'Hija:' + self.proyecto_homologado.id_oikos
                })).then(function(responseHom)
              {
                self.facultad = responseHom.data[0];

                var date = new Date()
                var dia = moment(date).format('D');
                var mes = moment(date).format('M');
                var anio = moment(date).format('YYYY');
                var contenido = [];
                //console.log(self.contenido);
                contenido.push( {text:'EL SUSCRITO COORDINADOR DEL PROYECTO CURRICULAR DE ' + self.coordinador.nombre_proyecto_curricular + ' DE LA ' + self.facultad.Padre.Nombre + ' DE LA UNIVERSIDAD DISTRITAL FRANCISCO JOSÉ DE CALDAS', bold: true,  alignment: 'center', style:'top_space'}, '\n\n\n\n');
                //console.log(self.contenido);
                contenido.push({text:'CERTIFICA QUE: ', bold: true,  alignment: 'center', style:'top_space'}, '\n\n\n\n');
                contenido.push({text:'Los Docentes de Vinculación Especial contratados para el periodo Académico 2018-1, del Proyecto Curricular de ' + self.coordinador.nombre_proyecto_curricular + ' cumplieron a cabalidad con las funciones docentes durante el mes de ' +self.mes.Nombre+ ' de ' +self.anio+ ' (según calendario académico).', style:'general_font'}, '\n\n')
                if(self.docentes_incumplidos){
                  contenido.push({text:'A excepción de las siguientes novedades: ', style:'general_font'}, '\n')
                  angular.forEach(self.docentes_incumplidos, function(value) {
                   contenido.push({text: value.NumDocumento + ', ' + value.Nombre + ', ' + value.NumeroContrato + ', No se le aprueba cumplido.', style:'lista'});
                 });
                }
                contenido.push('\n',{text:'La presente certificación se expide el día ' + dia + ' del mes de ' + self.meses[mes-1].Nombre + ' de ' + anio +'.',  style:'general_font'}, '\n\n\n\n\n\n');
                contenido.push({text:'' + self.coordinador.nombre_coordinador, style:'bottom_space'});
                contenido.push({text:'Coordinador', style:'bottom_space'});
                contenido.push({text:'Proyecto Curricular ' + self.coordinador.nombre_proyecto_curricular, style:'bottom_space'});


                //Generación documento
                var docDefinition = {
                  pageMargins: [30, 140, 40, 40],
                  header: {
                   height: 120,
                   width: 120,
                   image: self.imagen.imagen,
                   margin: [100, 15,5,5],
                   alignment: 'center'
                 },
                 content: contenido,
                 styles: {
                   top_space: {
                     fontSize: 11,
                     marginTop: 30
                   },
                   bottom_space: {
                     fontSize: 12,
                     bold: true,
                     alignment:'center'
                     //marginBottom: 30
                   },
                   general_font:{
                     fontSize: 11,
                     alignment: 'justify'
                   },
                   lista:{
                     fontSize: 9,
                     alignment:'justify'
                   }
                 }
                }

                //Variable para obtener la fecha y hora que se genera el dcoumento
                var date = new Date();
                date = moment(date).format('DD_MMM_YYYY_HH_mm_ss');
                //console.log(self.contenido);
                pdfMake.createPdf(docDefinition).download('Certificación cumplido coordinación ' + date + '.pdf');


              });
                //console.log(self.contenido);


                //Sirve para descargar el documento y setearle el nombre
              //  pdfMake.createPdf(docDefinition).download('Certificación cumplido coordinación ' + date + '.pdf');
               });
          });
    };
});
