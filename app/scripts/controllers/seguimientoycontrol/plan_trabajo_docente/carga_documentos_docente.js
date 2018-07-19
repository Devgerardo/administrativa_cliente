'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl
 * @description
 * # SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')

  .controller('SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl', function ($scope, $http, $translate, uiGridConstants, contratoRequest, administrativaRequest, nuxeo, $q, coreRequest, $window, $sce, adminMidRequest, $routeParams, academicaWsoService) {
    //Variable de template que permite la edición de las filas de acuerdo a la condición ng-if
    var tmpl = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div><div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD"</div>';


    $('body').on('hidden.bs.modal', '.modal', function (e) {
      if ($('.modal').hasClass('in')) {
        $('body').addClass('modal-open');
      }
    });

    //Se utiliza la variable self estandarizada
    var self = this;
    self.mostrar_boton = true;
    
    
    //self.actividades = [];
   
    //self.Documento = $routeParams.docid; 

    /*
      Creación tabla que tendrá todas las activiadades del plan de trabajo del docente
    */
    self.gridOptions1 = {
      enableRowSelection: true,
      enableFullRowSelection: false,
      multiSelect: false,
      noUnselect: true,

      enableSorting: false,
      enableFiltering: false,
      resizable: true,
      enableColumnMenus: false,

      columnDefs: [{
        name: 'actividad',
        displayName: $translate.instant('ACTIVIDAD'),
      
      },
      {
        field: 'Acciones',
        displayName: $translate.instant('ACC'),
        cellTemplate: 
        '<a type="button" title="Ver soportes" type="button" class="fa fa-eye fa-lg  faa-shake animated-hover"' +
          'ng-click="grid.appScope.planTrabajoDocenteCargaDocumentos.obtener_doc(row.entity.PagoMensual)" data-toggle="modal" data-target="#modal_ver_soportes"</a>&nbsp'+
        ' <a type="button" title="Enviar Solicitud" type="button" class="fa fa-upload fa-lg  faa-shake animated-hover" ng-click="grid.appScope.cargaDocumentosDocente.cargar_soportes(row.entity); grid.appScope.cargaDocumentosDocente.solicitar_pago(row.entity);"  data-toggle="modal" data-target="#modal_check_docente">',
      width: '10%',
      }
      ]
    };



    /*
      funcion para obtener la fila seleccionada
    */
    self.gridOptions1.onRegisterApi = function (gridApi) {
      self.gridApi1 = gridApi;
      self.seleccionados = self.gridApi1.selection.selectedCount;
      self.gridApi1.selection.on.rowSelectionChanged($scope, function (row) {
        //Contiene la info del elemento seleccionado
        self.seleccionado = row.isSelected;
        //Condicional para capturar la información de la fila seleccionado
        if (self.seleccionado) {
          self.fila_seleccionada = row.entity;
          //console.log(self.fila_seleccionada.Actividad);
        }
      });
    };
    
    /*
      Funcion para cargas los periodos que el docente puede elegir
    */
    self.cargarPeriodos = function () {
      self.cargando = false;
      academicaWsoService.get('periodos', "")
        .then(function (responsePeriodos) {
          self.periodosTemp = responsePeriodos.data.periodosCollection.datosPeriodos;
          self.periodos = self.periodosTemp.filter(function (objPeriodo) {
            return (objPeriodo.anio >= 2018 || (objPeriodo.anio == 2017 && objPeriodo.periodo!=1));
          });

          angular.forEach(self.periodos, function (periodo) {
            periodo.nombre = periodo.anio + "-" + periodo.periodo;
          });
          self.cargando = false;
        })
        .catch(function (error) {
          console.log(error)
        });
    }

    self.cargarPeriodos();

    /*
    Función para cargar la información del plan de trabajo docente en un semestre
    */
    self.cargarActividades = function (semestre) {
      self.cargando = true;
      if (semestre != null && semestre != undefined)
        //self.gridOptions1.data =[];
        var semestre = semestre.replace('-', '/');
      console.log(semestre);
      // academicaWsoService.get('consulta_plan_trabajo', "93401747/"+semestre)
      academicaWsoService.get('consulta_plan_trabajo', "93401747/2017/3")
        .then(function (response) {
          console.log("filas: " + self.gridOptions1.data.length);
          console.log("response.data", response.data);
          console.log("response.data.planCollection", response.data.planCollection);
          console.log("response.data.planCollection.plan", response.data.planCollection.plan);
          console.log(response.data.planCollection.plan);
          self.actividades = response.data.planCollection.plan;
          self.gridOptions1.data = self.actividades;
          self.cargando = false;
        })
        .catch(function (error) {
          console.log(error);
        });
    };

    /*
      Función para consultar los datos del docente y los contratos asociados a este
    */
    self.obtener_informacion_coordinador = function (IdDependencia) {
      adminMidRequest.get('aprobacion_pago/informacion_coordinador/' + IdDependencia)
        .then(function (response) {
          self.informacion = response.data;
          self.informacion_coordinador = self.informacion.carreraSniesCollection.carreraSnies[0];
        })
    };


    self.subirDocumento = function () {
      var nombre = "documentoPrueba";
      var descripcion = "descripcion prueba";
      console.log("filemodel", self.fileModel)
      self.cargarDocumento(nombre, descripcion, self.fileModel)
        .then(function (url) {
          console.log(url);
          self.getDocumento(url);
        }).catch(function (error) {
          console.log(error);
        })
    }

    self.getDocumento = function (docid) {
      nuxeo.header('X-NXDocumentProperties', '*');

      nuxeo.request('/id/' + docid)
        .get()
        .then(function (response) {
          self.doc = response;
          //var aux = response.get('file:content');
          self.doc.fetchBlob()
            .then(function (res) {
              self.blob = res;
              var fileURL = URL.createObjectURL(self.blob);
              //console.log(fileURL);
              self.content = $sce.trustAsResourceUrl(fileURL);
              $window.open(fileURL);

            })
            .catch(function (error) {
              defer.reject(error)
            });
        })
        .catch(function (error) {
          defer.reject(error)
        });
    }

    self.enviar_solicitud = function () {
      self.mostrar_boton = false;

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
            EstadoPagoMensual: { Id: id_estado },
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
          })).then(function (response) {

            if (response.data == null) {

              administrativaRequest.post("pago_mensual", pago_mensual).then(function (response) {
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
                self.mostrar_boton = true;

              });

            } else {

              swal(
                'Error',
                $translate.instant('YA_EXISTE'),
                'error'
              );

              self.mostrar_boton = true;
            }

          });

        });
      } else {
        swal(
          'Error',
          $translate.instant('DEBE_SELECCIONAR'),
          'error'
        );
        self.mostrar_boton = true;
      }

    };

    /*
      Función para cargar los documentos a la carpeta destino
    */
    self.cargarDocumento = function (nombre, descripcion, documento) {
      var defered = $q.defer();
      var promise = defered.promise;

      console.log("documento", documento);

      nuxeo.operation('Document.Create')
        .params({
          type: 'File',
          name: nombre,
          properties: 'dc:title=' + nombre + ' \ndc:description=' + descripcion
        })
        .input('/default-domain/workspaces/Pruebas Administrativa/plan_trabajo_docente')
        .execute()
        .then(function (doc) {
          var nuxeoBlob = new Nuxeo.Blob({
            content: documento
          });
          nuxeo.batchUpload()
            .upload(nuxeoBlob)
            .then(function (res) {
              return nuxeo.operation('Blob.AttachOnDocument')
                .param('document', doc.uid)
                .input(res.blob)
                .execute();
            })
            .then(function () {
              return nuxeo.repository().fetch(doc.uid, {
                schemas: ['dublincore', 'file']
              });
            })
            .then(function (doc) {
              var url = doc.uid;
              defered.resolve(url);
            })
            .catch(function (error) {
              throw error;
              defered.reject(error)
            });
        })
        .catch(function (error) {
          throw error;
          defered.reject(error)
        });

      return promise;
    }

    self.subir_documento = function () {

      var nombre_doc = self.contrato.Vigencia + self.contrato.NumeroVinculacion + self.Documento + self.fila_seleccionada.Mes + self.fila_seleccionada.Ano;


      if (self.archivo) {

        if (self.fileModel !== undefined && self.item !== undefined) {
          self.mostrar_boton = false;
          var descripcion = self.item.ItemInforme.Nombre;
          var aux = self.cargarDocumento(nombre_doc, descripcion, self.fileModel, function (url) {
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
              .then(function (response) {
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
                  .then(function (response) {
                    //Bandera de validacion
                    swal(
                      $translate.instant('DOCUMENTO_GUARDADO'),
                      $translate.instant('DOCUMENTO_SE_HA_GUARDADO'),
                      'success'
                    );
                    self.item = undefined;
                    //angular.element("input[type='file']").val(null);
                    self.fileModel = undefined;
                    self.mostrar_boton = true;

                  });
              });


          });

        } else {

          swal(
            'Error',
            $translate.instant('DEBE_SUBIR_ARCHIVO'),
            'error'
          );

          self.mostrar_boton = true;

        }
        //
      } else if (self.link) {
        if (self.enlace !== undefined && self.item !== undefined) {
          self.mostrar_boton = false;

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
            .then(function (response) {
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
                .then(function (response) {
                  //Bandera de validacion
                  swal(
                    $translate.instant('ENLACE_GUARDADO'),
                    $translate.instant('ENLACE_SE_HA_GUARDADO'),
                    'success'
                  );
                  self.enlace = undefined;
                  self.item = undefined;
                  self.mostrar_boton = true;

                });
            });

        } else {

          swal(
            'Error',
            $translate.instant('DEBE_PEGAR_ENLACE'),
            'error'
          );

          self.mostrar_boton = true;

        }
      }
      self.objeto_documento = {};

    };

    self.cambiarCheckArchivo = function () {
      if (self.archivo) {
        self.link = false;
      }
    };

    self.cambiarCheckLink = function () {
      if (self.link) {
        self.archivo = false;
      }
    };

    /*
      Función que permite obtener un documento de nuxeo por el Id
    */
    self.getDocumento = function (docid) {
      nuxeo.header('X-NXDocumentProperties', '*');

      self.obtenerDoc = function () {
        var defered = $q.defer();

        nuxeo.request('/id/' + docid)
          .get()
          .then(function (response) {
            self.doc = response;
            var aux = response.get('file:content');
            self.document = response;
            defered.resolve(response);
          })
          .catch(function (error) {
            defered.reject(error)
          });
        return defered.promise;
      };

      self.obtenerFetch = function (doc) {
        var defered = $q.defer();

        doc.fetchBlob()
          .then(function (res) {
            defered.resolve(res.blob());

          })
          .catch(function (error) {
            defered.reject(error)
          });
        return defered.promise;
      };

      self.obtenerDoc().then(function () {

        self.obtenerFetch(self.document).then(function (r) {
          self.blob = r;
          var fileURL = URL.createObjectURL(self.blob);
          self.content = $sce.trustAsResourceUrl(fileURL);
          $window.open(fileURL, 'Soporte Cumplido', 'resizable=yes,status=no,location=no,toolbar=no,menubar=no,fullscreen=yes,scrollbars=yes,dependent=no,width=700,height=900');
        });
      });
    };

    /*
     Función que obtiene los documentos relacionados a las solicitudes
    */
    self.obtener_doc = function (fila) {
      self.fila_sol_pago = fila;
      var nombre_docs = self.contrato.Vigencia + self.contrato.NumeroVinculacion + self.Documento + self.fila_sol_pago.Mes + self.fila_sol_pago.Ano;
      coreRequest.get('documento', $.param({
        query: "Nombre:" + nombre_docs + ",Activo:true",
        limit: 0
      })).then(function (response) {
        self.documentos = response.data;
        angular.forEach(self.documentos, function (value) {
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
    self.visualizar_enlace = function (url) {
      $window.open(url);
    };


    /*
      Función para "borrar" un documento
    */
    self.borrar_doc = function () {

      var documento = self.doc;
        swal({
          title: '¿Está seguro(a) de eliminar el soporte?',
          text: "No podrá revertir esta acción",
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Aceptar'
        }).then(function () {
      documento.Contenido = JSON.stringify(documento.Contenido)
      documento.Activo = false;
      coreRequest.delete('documento', documento.Id).
        then(function (response) {
          self.obtener_doc(self.fila_sol_pago);
        });
      });
    }

    self.set_doc = function (doc) {
      self.doc = doc;
    };

    //Aqui empiezan las funciones que desactivan la funcionalidad de carga de documentos


    self.enviar_solicitud_coordinador = function () {

      self.mostrar_boton = false;

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
            EstadoPagoMensual: { Id: id_estado },
            Mes: self.mes,
            Ano: self.anio,
            NumeroContrato: self.contrato.NumeroVinculacion,
            Persona: self.Documento,
            Responsable: self.informacion_coordinador.numero_documento_coordinador,
            VigenciaContrato: parseInt(self.contrato.Vigencia)
          };

          pago_mensual.CargoResponsable = pago_mensual.CargoResponsable.substring(0, 69);

          administrativaRequest.get("pago_mensual", $.param({
            query: "NumeroContrato:" + self.contrato.NumeroVinculacion +
              ",VigenciaContrato:" + self.contrato.Vigencia +
              ",Mes:" + self.mes +
              ",Ano:" + self.anio,
            limit: 0
          })).then(function (response) {

            if (response.data == null) {

              administrativaRequest.post("pago_mensual", pago_mensual).then(function (response) {
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
                self.mostrar_boton = true;

              });

            } else {

              swal(
                'Error',
                $translate.instant('YA_EXISTE'),
                'error'
              );

              self.mostrar_boton = true;
            }

          });

        });
      } else {
        swal(
          'Error',
          $translate.instant('DEBE_SELECCIONAR'),
          'error'
        );
        self.mostrar_boton = true;
      }


    };


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
        solicitud.EstadoPagoMensual = { "Id": 1 };
        solicitud.Responsable = self.informacion_coordinador.numero_documento_coordinador;
        solicitud.CargoResponsable = "COORDINADOR " + self.contrato.Dependencia;
        solicitud.CargoResponsable = solicitud.CargoResponsable.substring(0, 69);
        administrativaRequest.put('pago_mensual', solicitud.Id, solicitud).
          then(function (response) {
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
