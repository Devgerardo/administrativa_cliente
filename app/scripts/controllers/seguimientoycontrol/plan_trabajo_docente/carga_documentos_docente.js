'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl
 * @description
 * # SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')

  .controller('SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl', function ($scope, $http, $translate, uiGridConstants, administrativaRequest, nuxeoClient, coreRequest, $window, academicaWsoService, $interval, $timeout, planTrabajoService, planTrabajoMidService) {
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
    self.cargando = false;
    self.cargandoDocumentos = false;
    self.index = -1;
    self.indexTemp = -1;
    self.observacionesDoc;
    self.observacionesDocTemp;
  

    self.Documento = token_service.getAppPayload().appUserDocument;
    self.proyectosCurriculares = [];
    self.anio;
    self.periodo;
    self.pasoCadena = 0;
    //self.documentos = [];

    self.limpiarArchivo = $scope.limpiarArchivo;


    //self.Documento = $routeParams.docid; 

    /*
      Creación tabla que tendrá todas las activiadades del plan de trabajo del docente
    */
    self.gridOptions1 = {
      enableRowSelection: true,
      enableFullRowSelection: true,
      multiSelect: false,
      noUnselect: true,
      //saveSelection: true,

      enableSorting: false,
      enableFiltering: false,
      resizable: true,
      enableColumnMenus: false,
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,
      columnDefs: [{
        name: 'actividad',
        displayName: $translate.instant('ACTIVIDAD')
      },
      {
        name: 'cod_proyecto',
        //displayName: 'IdProyecto',
        visible: false
      },
      {
        name: 'cod_actividad',
        visible: false
      },
      {
        name: 'cur_id',
        visible: false
      },
      {
        field: 'Acciones',
        displayName: $translate.instant('ACC'),
        cellTemplate:
          ' <a type="button" title="Ver solicitudResp" class="fa fa-eye fa-lg  faa-shake animated-hover" ng-click="grid.appScope.dimensionarGrilla(); grid.appScope.cargarsolicitudSoporte(row.entity)"  data-toggle="modal" data-target="#modal_ver_solicitud_actividad"></a>',
        // ' <a type="button" title="Ver solicitudResp" class="fa fa-eye fa-lg  faa-shake animated-hover" ng-click="grid.appScope.dimensionarGrilla()"  data-toggle="modal" data-target="#modal_ver_solicitudResp_actividad"></a>',
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
          self.filaActividad = row.entity;
        }
      });
    };

    self.gridOptions1.appScopeProvider = self;

    self.gridOptions2 = {
      enableRowSelection: true,
      enableFullRowSelection: true,
      multiSelect: false,
      noUnselect: true,
      enableSorting: true,
      enableFiltering: false,
      resizable: true,
      enableColumnMenus: false,
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,

      columnDefs: [{
        name: 'fechaCreacion',//debe llamarse tal cual se llame el campo en el response
        displayName: $translate.instant('SOPORTE'),
      },
      {
        name: 'estado',
        displayName: $translate.instant('ESTADO'),
      },
      {
        name: 'codEstado',
        visible: false
      },
      {
        field: 'Acciones',
        displayName: $translate.instant('ACC'),
        cellTemplate:
          '<a type="button" title="Ver soportes" type="button" class="fa fa-folder fa-lg"' +
          'ng-click="grid.appScope.planTrabajoDocenteCargaDocumentos.setRow(row.entity); grid.appScope.planTrabajoDocenteCargaDocumentos.traerArchivoNuxeo()" data-toggle="modal" data-target="#modal_ver_soportes"</a>&nbsp' +
          '<a type="button" title="Enviar solicitudResp" ng-if="row.entity.codEstado===1" class="fa fa-send-o fa-lg faa-shake animated-hover" ng-click="grid.appScope.planTrabajoDocenteCargaDocumentos.setRow(row.entity);  grid.appScope.planTrabajoDocenteCargaDocumentos.enviar_solicitudResp_soporte()"></a>&nbsp' +
          '<a type="button" title="Borrar documento" ng-if="row.entity.codEstado===1" class="fa fa-trash-o fa-lg faa-shake animated-hover" ng-click="grid.appScope.planTrabajoDocenteCargaDocumentos.setRow(row.entity); grid.appScope.planTrabajoDocenteCargaDocumentos.borrar_doc()"></a>',
        width: "10%",
      }
      ]
    };

    self.gridOptions2.onRegisterApi = function (gridApi) {
      self.gridApi2 = gridApi;

      self.seleccionados = self.gridApi2.selection.selectedCount;
      self.gridApi2.selection.on.rowSelectionChanged($scope, function (row) {
        //Contiene la info del elemento seleccionado
        self.seleccionado = row.isSelected;
        //Condicional para capturar la información de la fila seleccionado
        if (self.seleccionado) {
          self.fila_seleccionada = row.entity;
        }
      });
      self.gridApi2.core.refresh();
    };

    self.dimensionarGrilla = function (parametro) {
      //console.log("dimensionar");
      self.cargandoDocumentos = true;
      $interval(function () {
        self.gridApi1.core.handleWindowResize();
      }, 500, 10);
      $timeout(function () {
        self.cargandoDocumentos = false;
      }, 2000); // 3
    };

    self.setRow = function (fila) {
      self.fila_seleccionada = fila;
      self.setIndex();
    };

    self.setIndex = function () {
      self.index = self.gridOptions2.data.indexOf(self.fila_seleccionada);
      self.observacionesDoc = self.documentos[self.index].observaciones;
    }

    self.cambiarObservaciones = function () {
      if (self.checkObservaciones) {
        self.observacionesDoc = self.documentos[self.index].observacionesSupervisor;
      } else {
        self.observacionesDoc = self.documentos[self.index].observaciones;
      }
    }



    /**
     * @ngdoc method
     * @name cargarPeriodos
     * @methodOf 
     * @description
     * Funcion para cargar los periodos que el docente puede elegir
     */
    self.cargarPeriodos = function () {
      self.cargando = true;
      academicaWsoService.get('periodos', "")
        .then(function (responsePeriodos) {
          self.periodosTemp = responsePeriodos.data.periodosCollection.datosPeriodos;
          self.periodos = self.periodosTemp.filter(function (objPeriodo) {
            return (objPeriodo.anio >= 2018 || (objPeriodo.anio == 2017 && objPeriodo.periodo != 1));
          });

          angular.forEach(self.periodos, function (periodo) {
            periodo.nombre = periodo.anio + "-" + periodo.periodo;
          });
          self.cargando = false;
        })
        .catch(function (error) {
          swal(
            'Error',
            "No se pudo cargar los periodos",
            'warning'
          );
        });
    }

    self.cargarPeriodos();

    /**
    * @ngdoc method
    * @name cargarActividades
    * @description
    * Función que con la cedula del docente y el semestre busca en la base de datos las actividades que este
    * tiene asociadas y con ellas llena un ui-grid, en caso de no encontrars actividades se muestra una alerta.
    */
    self.cargarActividades = function () {

      if (self.periodoSeleccionado != null && self.periodoSeleccionado != undefined) {
        var semestre = self.periodoSeleccionado.replace('-', '/');
        var arregloPeriodo = semestre.split("/");
        self.anio = arregloPeriodo[0];
        self.periodo = arregloPeriodo[1];

        self.cargando = true;
        academicaWsoService.get('consulta_plan_trabajo', self.Documento + "/" + semestre)
          //academicaWsoService.get('consulta_plan_trabajo', "93401747/2017/3")
          .then(function (response) {
            if (response.data.planCollection.plan != null && response.data.planCollection.plan != undefined) {
              self.actividades = response.data.planCollection.plan;
              // angular.forEach(self.actividades, function (actividad) {
              //   if(actividad.cod_asignatura !== 0){
              //     actividad.cod_actividad = actividad.cur_id;
              //   }
              // });
              self.gridOptions1.data = self.actividades;
              self.cargando = false;
              //delete self.seleccionado;
              self.actividades.forEach(function (actividad) {
                if (actividad.cod_proyecto !== '0' && !self.proyectosCurriculares.includes(actividad.cod_proyecto)) {
                  self.proyectosCurriculares.push(actividad.cod_proyecto);
                }
              });
            } else {
              swal(
                'Error',
                "No se encontraron actividades asociadas al docente",
                'warning'
              );
            }
            self.cargando = false;
          })
          .catch(function (error) {
            swal(
              'Error',
              "No se pudo cargar las actividades",
              'warning'
            );
            self.cargando = false;
          });
      }
    };

    /**
    * @ngdoc function
    * @name crear_solicitudResp_soporte
    * @description
    * Método que implementa la logica necesaria para hacer las solicitudRespuesta de revision por cada una de las
    * organizaciones a las que corresponde la actividad
    *
    * 
    */
    self.crearsolicitudResp = function () {

      self.organizacion = [];

      planTrabajoMidService.get("/solicitud_soporte_plan_trabajo/obtener_supervisor_actividad/", $.param({
        actividad: self.filaActividad.cod_actividad
      }))
      .then(function(supervisorResp){
        if (self.filaActividad.cod_proyecto !== '0') {//es carga lectiva y si esta asociada a un proyecto
          self.organizacion[0] = self.filaActividad.cod_proyecto;
        } else {
          if(supervisorResp == "coordinador"){
            self.organizacion = self.proyectosCurriculares;
          }
          
        }
  
        for (let i = 0; i < self.organizacion.length; i++) {
          var intTemp = + self.organizacion;
          self.subir_documento(intTemp);
        }
      })
      .catch(function(error){
        swal(
          'Error',
          $translate.instant('No se pudo crear la solicitud'),
          'error'
        );
      })

      

    
      //$scope.limpiarArchivo();
    }

    /*
      Función que obtiene y muestra el contenido del archivo
    */
    self.traerArchivoNuxeo = function () {

      console.log("trear Archivo");
      
      if(self.documentos[self.index].tipo === "Archivo"){

      if (self.indexTemp !== self.index) {
        self.indexTemp = self.index;

        nuxeoClient.getDocument(self.documentos[self.index].idNuxeo)
          .then(function (archivoResp) {
            
            self.documentos[self.index].blobUrl = archivoResp.url;
            self.abrir = true;
          })
          .catch(function (error) {
            swal(
              $translate.instant("ERROR"),
              $translate.instant("ERROR.CARGAR_DOCUMENTO"),
              'warning'
            );
          });
        }
      }
    }

    /*
      Funcion que guarda los ids de los documentos en las tablas documento y solicitudResp_soporte_plan_trabajo de la base de datos
    */
    self.subir_documento = function (organizacion) {

      var nombre_doc = self.Documento + self.filaActividad.actividad + self.anio + self.periodo;
      var dominio = 'Pruebas Administrativa/plan_trabajo_docente';

      if (self.archivo) {

        if (self.fileModel !== undefined) {

          var descripcion = "soporte de la actividad: " + self.filaActividad.actividad;
          var aux = nuxeoClient.createDocument(nombre_doc, descripcion, self.fileModel, dominio, function (url) {//revisar lo del parametro del callback, si la funcion falla no debería hacer nada
            //Objeto documento
            var date = new Date();
            date = moment(date).format('DD_MMM_YYYY_HH:mm:ss');

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
                //console.log(response);
                self.id_documento = response.data.Id;
                return self.id_documento;
              })
              .then(function (documentoResp) {
                //console.log(documentoResp);
                var fecha = new Date();
                self.objeto_solicitudResp = {
                  "Estado": { "id": 1 },//estado: documento guardado
                  "Persona": self.Documento,
                  //"Id":0,
                  "Dependencia": Number(organizacion),
                  "Documento": documentoResp,
                  "Observaciones": "",
                  "Anio": Number(self.anio),
                  "Periodo": Number(self.periodo),
                  "Actividad": Number(self.filaActividad.cod_actividad),
                  "Fecha": fecha,
                  "Grupo": Number(self.filaActividad.cur_id)
                }
                return planTrabajoService.post('solicitud_soporte_plan_trabajo', self.objeto_solicitudResp);
              })
              .then(function (solicitudResp) {
                //console.log(solicitudResp);
                swal(
                  $translate.instant('EL ARCHIVO HA SIDO GUARDADO'),
                  'success'
                );
                self.userUpload = {};
                self.observaciones = "";
              })
              .catch(function (error) {
                swal(
                  'Error',
                  $translate.instant('El documento no pudo guardarse '),
                  'error'
                );
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
      } else if (self.link) {
        if (self.enlace !== undefined) {
          var descripcion = "soporte de la actividad: " + self.filaActividad.actividad;
          var date = new Date();
          date = moment(date).format('DD_MMM_YYYY_HH:mm:ss');
          //Objeto documento
          self.objeto_documento = {
            "Nombre": nombre_doc,
            "Descripcion": descripcion,
            "TipoDocumento": {
              "Id": 3
            },
            "Contenido": JSON.stringify({
              "FechaCreacion": date,
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
              console.log("id documento: " + self.id_documento);
              return self.id_documento;
            })
            .then(function (documento) {
              var fecha = new Date();
              self.objeto_solicitudResp = {
                "Estado": { "id": 1 },
                "Persona": self.Documento,
                //"Id":0,
                "Organizacion": Number(organizacion),
                "Documento": documentoResp,
                "Observaciones": "",
                "Anio": Number(self.anio),
                "Periodo": Number(self.periodo),
                "Actividad": Number(self.filaActividad.cod_actividad),
                "Fecha": fecha,
                "Grupo":  Number(self.filaActividad.cur_id)
              }
              return planTrabajoService.post('solicitud_soporte_plan_trabajo', self.objeto_solicitudResp);
            })
            .then(function () {
              swal(
                $translate.instant('EL ENLACE HA SIDO GUARDADO'),
                'success'
              );
              self.enlace.value = "";
            })
            .catch(function (error) {
              console.log("error " + error);
            });
        } else {
          swal(
            'Error',
            $translate.instant('DEBE_PEGAR_ENLACE'),
            'error'
          );
        }
      }
      self.objeto_documento = {};
      self.objeto_solicitudResp = {};
    };

    self.cambiarCheckArchivo = function () {
      if (self.archivo) {
        self.link = false;//ngmodel del checkbox
      }
    };

    self.cambiarCheckLink = function () {
      if (self.link) {
        self.archivo = false;//ngmodel del checkbox
      }
    };

    /**
     * @ngdoc function
     * @name cargarsolicitudSoporte
     * @description funcion que consulta en la base de datos las solicitud de revision
     * de los soportes y lo documentos asociadas al docente para la actividad seleccionada
     * en el periodo seleccionado
     */

    //mejorar cadena!!
    self.cargarsolicitudSoporte = function (row) {

      self.filaActividad = row;
    

      planTrabajoService.get("solicitud_soporte_plan_trabajo", $.param({
        query: "persona:" + self.Documento + ",anio:" + self.anio + ",periodo:" + self.periodo
          + ",actividad:" + self.filaActividad.cod_actividad,
        limit: -1
      }))
        .then(function (solicitudResp) {
          //console.log(solicitudResp);
          self.documentos = [];
          (async function () {
            for (var i = 0; i < solicitudResp.data.length; i++) {

              var value = solicitudResp.data[i];
              //console.log(value);
              self.documentos[i] = {};
              self.documentos[i].solicitud = solicitudResp.data[i];
              self.documentos[i].idSolicitud = value.Id;
              self.documentos[i].documento = value.Documento;
              self.documentos[i].observacionesSupervisor = value.Observaciones;
              self.documentos[i].estado = value.Estado.Nombre;
              self.documentos[i].codEstado = value.Estado.Id;

              await coreRequest.get('documento', $.param({
                query: "Id:" + self.documentos[i].documento
              }))
                .then(function (documentoResp) {
                  documentoResp.data[0].Contenido = JSON.parse(documentoResp.data[0].Contenido);

                  self.documentos[i].nombre = documentoResp.data[0].Nombre;
                  //self.documentos[i].tipoDocumento = documentoResp.data[0].TipoDocumento; trae todo el registro de la tabla tipo documento no solo el id
                  self.documentos[i].descripcion = documentoResp.data[0].Descripcion;
                  self.documentos[i].fechaCreacion = documentoResp.data[0].Contenido.FechaCreacion;
                  self.documentos[i].observaciones = documentoResp.data[0].Contenido.Observaciones;
                  self.documentos[i].tipo = documentoResp.data[0].Contenido.Tipo;
                  if (self.documentos[i].tipo === "Archivo") {
                    self.documentos[i].idNuxeo = documentoResp.data[0].Contenido.IdNuxeo;
                    self.documentos[i].nombreArchivo = documentoResp.data[0].Contenido.NombreArchivo;

                  } else {
                    self.documentos[i].enlace = documentoResp.data[0].Contenido.Enlace;
                    self.documentos[i].nombreArchivo = "Enlace";
                  }
                })
                .catch(function (error) {
                  console.log(error);
                });
            }
          })()
            .catch(function (error) {
              console.log(error);
            });

          //console.log(self.documentos);
          self.gridOptions2.data = self.documentos;
        })
        .catch(function (error) {
          self.gridOptions2.data = {};
          swal(
            'Error',
            //$translate.instant('DEBE_PEGAR_ENLACE'),
            'No se encontraron soportes acosiados a esta actividad',
            'error'
          );
          //console.log(error);
        });
    }

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
      var documento = {};
      documento.id_documento = self.documentos[self.index].documento;
      documento.id_nuxeo = self.documentos[self.index].idNuxeo;
      documento.id_solicitud = self.documentos[self.index].idSsolicitud;
      alert("eliminar: " + documento.id_documento + " " + documento.id_nuxeo);
      //var documento = self.doc;
      swal({
        title: '¿Está seguro(a) de eliminar el soporte?',
        text: "No podrá revertir esta acción",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Aceptar',
        //closeOnClickOutside: false,
        allowOutsideClick: false
      })
        .then(function () {
          return planTrabajoService.delete('solicitud_soporte_plan_trabajo', self.documento.id_solicitud);
        })
        .then(function (solicitudEliminada) {
          return coreRequest.delete('documento', documento.id_documento);
        })
        .then(function (docEliminado) {
          console.log("eliminado de core " + docEliminado);
          var dominio = 'Pruebas Administrativa/plan_trabajo_docente';
          return nuxeoClient.deleteDocument(dominio, documento.idNuxeo);
        })
        .then(function () {
          swal(
            'DOCUMENTO ELIMINADO ',
            'success'
          );
        })
        .catch(function (error) {
          console.log(error);
          if (error !== 'cancel') {
            swal(
              'Error',
              "No se pudo eliminar el documento",
              'error'
            );
          }
        });
    }

    //self.borrar_doc();

    self.set_doc = function (doc) {
      self.doc = doc;
    };

    /*
    * @ngdoc function
    * @name enviar_solicitudResp_soporte
    * @description
    * Método que envia el soporte asociado a una actividad del plan de trbaajo para que el coordinador lo valide
    * 
    * @param {solicitudResp} fila seleccionada en el grid que contiene la información del soporte
    * 
    */
    self.enviar_solicitudResp_soporte = function (solicitudResp) {
      //console.log("enviada");
      swal({
        title: '¿Está seguro(a) de enviar el soporte a la coordinación?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: $translate.instant('CANCELAR'),
        confirmButtonText: $translate.instant('ENVIAR')
      }).then(function () {
        var pos = self.gridOptions1.data.indexOf(self.filaActividad);
        self.documentos[pos].solicitud.Estado.Id=2;
        //self.documentos[pos].solicitud.FechaCreacion.Id=2;
        planTrabajoService.put('solicitud_soporte_plan_trabajo', self.documentos[pos].id_solicitud, self.documentos[pos].solicitud)
        .then(function(){
          swal(
            'SOLICITUD ENVIADA',
            'success'
          )
          grid.appScope.cargarsolicitudSoporte(self.indexActividad);
          self.gridApi2.core.refresh();
        })
        .catch(function(error){
          swal(
            'Error',
            "No se pudo enviar la solicitud",
            'warning'
          );
          console.log(error);
        });        
      }).catch(function(error){//excepcion lanzada al cerrar la swal

      });
    }









  });
