'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:SeguimientoycontrolPlanTrabajoDocenteAprobacionDecanoCtrl
 * @description
 * # SeguimientoycontrolPlanTrabajoDocenteAprobacionDecanoCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('SeguimientoycontrolPlanTrabajoDocenteAprobacionDecanoCtrl', function ($translate, uiGridConstants, $scope, $interval, $timeout, serviciosAcademicosService) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    var self = this;
    self.cargando = false;

    var tmpl = '<div ng-if="!row.entity.editable">{{COL_FIELD}}</div><div ng-if="row.entity.editable"><input ng-model="MODEL_COL_FIELD"</div>';

    self.gridOptions1 = {
      enableSorting: true,
      enableFiltering: true,
      resizable: true,
      multiSelect: false,
      noUnselect: true,
      enableFullRowSelection: true,
      resizable: true,
      //enableColumnMenus: false,
      enableHorizontalScrollbar: 2,
      enableVerticalScrollbar: 2,

      //enableHiding: false,

      paginationPageSizes: [10, 20, 30],
      paginationPageSize: 10,

      columnDefs: [
        {
          field: 'id',
          cellTemplate: tmpl,
          displayName: $translate.instant('DOCUMENTO'),
          sort: {
            direction: uiGridConstants.ASC,
          },
          width: "20%",
          enableHiding: false,
        },
        {
          field: 'nombre',
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
          cellTemplate: '<a type="button" title="Ver soportes" type="button" ng-click="grid.appScope.aprobacionDecanoPlanTrabajo.setRow(row.entity); grid.appScope.aprobacionDecanoPlanTrabajo.cargarSolicitudesDocente(row.entity)" class="fa fa-eye fa-lg  faa-shake animated-hover" data-toggle="modal" data-target="#modal_ver_solicitudes_docente"</a>',
          width: "10%",
          enableHiding: false,
        }
      ]
    };

    self.gridOptions1.onRegisterApi = function (gridApi) {
      self.gridApi1 = gridApi;
      self.seleccionados = self.gridApi1.selection.selectedCount;
      self.gridApi1.selection.on.rowSelectionChanged($scope, function (row) {
        //Contiene la info del elemento seleccionado
        self.seleccionado = row.isSelected;
        //Condicional para capturar la información de la fila seleccionado
        if (self.seleccionado) {
          self.fila_seleccionada = row.entity;
          console.log(self.fila_seleccionada.NombrePersona);
        }
      });
    };

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

      columnDefs: [
        {
          name: 'nombreActividad',
          displayName: $translate.instant('ACTIVIDAD'),
        },
        {
          name: 'descripcion',//debe llamarse tal cual se llame el campo en el response
          displayName: $translate.instant('SOPORTE'),
        },
        {
          name: 'fechaCreacion',//debe llamarse tal cual se llame el campo en el response
          displayName: $translate.instant('FECHA DE ENVIO'),
        },
        {
          name: 'estado',
          displayName: $translate.instant('ESTADO'),
        },
        {
          name: 'codEstado',
          //visible: false
        },
        {
          field: 'Acciones',
          displayName: $translate.instant('ACC'),
          cellTemplate:
            '<a type="button" title="Ver soportes" type="button" class="fa fa-folder fa-lg faa-shake animated-hover"' +
            'ng-click="grid.appScope.aprobacionDecanoPlanTrabajo.setIndex(row.entity);grid.appScope.aprobacionDecanoPlanTrabajo.traerArchivoNuxeo()" data-toggle="modal" data-target="#modal_ver_soportes"</a>&nbsp' +
            '<a ng-if="row.entity.codEstado === 3 || row.entity.codEstado === 5 || row.entity.codEstado === 7" type="button" title="Visto bueno" type="button" class="fa fa-check fa-lg  faa-shake animated-hover"' +
            'ng-click="grid.appScope.aprobacionDecanoPlanTrabajo.setIndex(row.entity);grid.appScope.aprobacionDecanoPlanTrabajo.dar_visto_bueno()"></a>&nbsp;' +
            '<a ng-if="row.entity.codEstado === 3 || row.entity.codEstado === 5 || row.entity.codEstado === 7" type="button" title="Desaprobar" type="button" class="fa fa-close fa-lg  faa-shake animated-hover"' +
            'ng-click="grid.appScope.aprobacionDecanoPlanTrabajo.setIndex(row.entity);grid.appScope.aprobacionDecanoPlanTrabajo.desaprobar();"></a>',
          width: "10%",
        }
      ]
    };

    self.cargarDependencias = function(){
      coreAmazonRequest.get("jefe_dependencia/?TerceroId:1234567892")
      .then(function(dependeciasResp){
        self.dependencias = dependeciasResp;
      })      
    }

    self.dimensionarGrilla = function (parametro) {
      //console.log("dimensionar");
      self.cargando = true;
      $interval(function () {
        self.gridApi1.core.handleWindowResize();
      }, 500, 10);
      $timeout(function () {
        self.cargando = false;
      }, 2000); // 3
    };


    self.cargarProyectosCurriculares = function () {
      self.proyectos = [];
      serviciosAcademicosService.get("consulta_organizacion/33")
        .then(function (proyectosResponse) {
          if (proyectosResponse.data.planCollection.plan != null && proyectosResponse.data.planCollection.plan != undefined) {

            self.proyectosResponse.data.planCollection.forEach(function (dependencia) {

              self.proyectos.push(dependencia);

            });
          }
        })
        .catch(function () {
          swal(
            'Error',
            "No se pudo cargar los periodos",
            'warning'
          );
        })
    }

    //self.cargarProyectosCurriculares();

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

    //self.cargarPeriodos();

    /** 
     * 
     * 
    */
    self.cargarDocentes = function () {

      self.cargando = true;

      if (self.periodoSeleccionado != null && self.periodoSeleccionado != undefined) {
        //var semestre = self.periodoSeleccionado.replace('-', '/');
        var arregloPeriodo = self.periodoSeleccionado.split("-");
        self.anio = arregloPeriodo[0];
        self.periodo = arregloPeriodo[1];

        self.proyectoSeleccionado = 181;
        planTrabajoMidService.get("/solicitud_soporte_plan_trabajo/docentes_solicitudes/", $.param({
          iddependencia: self.proyectoSeleccionado,
          estados: "estado:3,estado:5,estado:6,estado:7, estado:8",//estados de esperando aprovacion y rechazado
          anio: self.anio,
          periodo: self.periodo,
        }))
          .then(function (docentesResp) {
            var dataAux = []
            angular.forEach(docentesResp.data, function (docente) {
              var docenteAux = {}
              if (docente.SegundoNombre !== undefined) {
                docente.SegundoNombre = docente.SegundoNombre + " ";
              }
              docenteAux.id = docente.Id;
              docenteAux.nombre = docente.PrimerNombre + " " + docente.SegundoNombre + "" + docente.PrimerApellido + " " + docente.SegundoApellido;
              dataAux.push(docenteAux);
            });
            self.gridOptions1.data = dataAux;
            self.gridApi1.core.refresh();
            self.cargando = false;
          })
          .catch(function (error) {
            swal(
              'Error',
              "No se pudo cargar la informacion",
              'warning'
            );
            console.log(error)
          })
      }
    }

    self.setIndex = function (fila) {
      self.setRow(fila);
      self.index = self.gridOptions2.data.indexOf(self.fila_seleccionada);
    }

    self.setRow = function (fila) {
      self.fila_seleccionada = fila;
      //self.setIndex();
    };

    self.cambiarObservaciones = function () {
      if (self.checkObservaciones) {
        self.observacionesDoc = self.solicitudes[self.index].observaciones;
        self.observacionesCoordinador = observacionesDoc;
      } else {
        self.observacionesDoc = self.solicitudes[self.index].observacionesDocente;
      }
    }


    /**
     * 
     * 
     * 
     * 
     * 
     *  
    */
    self.cargarSolicitudesDocente = function (fila) {

      self.cargandoSolicitudesDocente = true;

      planTrabajoService.get("solicitud_soporte_plan_trabajo", $.param({
        limit: -1,
        query: "persona:" + self.fila_seleccionada.id + ",anio:" + self.anio + ",periodo:" + self.periodo
          + ",organizacion:" + self.proyectoSeleccionado,
        orCondition: "estado:3,estado:5,estado:6,estado:7"//estados de esperando aprovacion y rechazado
      }))
        .then(function (solicitudesResp) {
          self.solicitudes = [];

          self.cargarActividades().then(function (planResp) {
            (async function () {
              for (let solicitudR of solicitudesResp.data) {
                var solicitud = {};
                solicitud.documento = solicitudR.Documento;
                solicitud.id = solicitudR.Id;
                solicitud.observaciones = solicitudR.Observaciones;
                solicitud.solicitudOriginal = solicitudR;
                solicitud.estado = solicitudR.Estado.Nombre;
                console.log(solicitud.estado);
                solicitud.codEstado = solicitudR.Estado.Id;
                var aux = $filter('filter')(planResp, { 'cod_actividad': solicitud.Actividad });
                solicitud.nombreActividad = aux[0].nombre;//remover '[0]' cuando se agregue el id del grupo
                solicitud.horas = aux.horas;

                console.log(solicitud);

                await coreRequest.get('documento', $.param({
                  query: "Id:" + solicitud.documento
                }))
                  .then(function (documentoResp) {
                    console.log(documentoResp);
                    documentoResp.data[0].Contenido = JSON.parse(documentoResp.data[0].Contenido);
                    solicitud.nombreDoc = documentoResp.data[0].Nombre;
                    solicitud.descripcion = documentoResp.data[0].Descripcion;
                    solicitud.fechaCreacion = documentoResp.data[0].Contenido.FechaCreacion;
                    solicitud.observacionesDocente = documentoResp.data[0].Contenido.Observaciones;
                    solicitud.tipo = documentoResp.data[0].Contenido.Tipo;
                    if (solicitud.tipo === "Archivo") {
                      solicitud.idNuxeo = documentoResp.data[0].Contenido.IdNuxeo;
                      solicitud.nombreArchivo = documentoResp.data[0].Contenido.NombreArchivo;

                    } else {
                      solicitud.enlace = documentoResp.data[0].Contenido.Enlace;
                      solicitud.nombreArchivo = "Enlace";
                    }
                    self.solicitudes.push(solicitud);
                  })
                  .catch(function (error) {
                    console.log(error);
                  })
              }
            })();
            self.gridOptions2.data = self.solicitudes;
            self.gridApi2.core.refresh();
            //self.dimensionarGrilla();
            self.cargandoSolicitudesDocente = false;
          })
            .catch(function (error) {
              console.log(error);
            })
        })
        .catch(function (error) {
          swal(
            $translate.instant("ERROR"),
            $translate.instant("ERROR AL CARGAR LAS SOLICITUDES"),
            'warning'
          );
          console.log(error);
        })
    }


    self.traerArchivoNuxeo = function (fila) {

      console.log("trear Archivo");

      if (self.solicitudes[self.index].tipo === "Archivo") {

        if (self.indexTemp !== self.index) {
          self.indexTemp = self.index;

          console.log(self.solicitudes[self.index].idNuxeo);

          nuxeoClient.getDocument(self.solicitudes[self.index].idNuxeo)
            .then(function (archivoResp) {
              console.log(archivoResp);
              self.solicitudes[self.index].blobUrl = archivoResp.url;
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
    * @ngdoc function
    * @name dar_visto_bueno
    * @description
    * Método que envia el soporte asociado a una actividad del plan de trbaajo para que el coordinador lo valide
    * 
    * @param {solicitudResp} fila seleccionada en el grid que contiene la información del soporte
    * 
    */
    self.dar_visto_bueno = function (solicitudResp) {
      swal({
        title: '¿Está seguro(a) de aprobar el documento?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: $translate.instant('CANCELAR'),
        confirmButtonText: $translate.instant('ENVIAR')
      }).then(function () {
        self.solicitudes[self.index].solicitudOriginal.Estado.Id = 6;
        //self.documentos[pos].solicitud.FechaCreacion=;
        planTrabajoService.put('solicitud_soporte_plan_trabajo', self.solicitudes[self.index].id, self.solicitudes[self.index].solicitudOriginal)
          .then(function () {
            swal(
              'DOCUMENTO APROVADO',
              'El documento ha sido aprobado',
              'success'
            )
          })
          .catch(function (error) {
            swal(
              'Error',
              "No se pudo aprobar el documento",
              'warning'
            );
            console.log(error);
          });
        //grid.appScope.cargarsolicitudSoporte(self.indexActividad);
        self.solicitudes.splice(self.index, 1);
        self.gridApi2.core.refresh();
      }).catch(function (error) {//excepcion lanzada al cerrar la swal

      });
    }

    /*
    * @ngdoc function
    * @name dar_visto_bueno
    * @description
    * Método que envia el soporte asociado a una actividad del plan de trbaajo para que el coordinador lo valide
    * 
    * @param {solicitudResp} fila seleccionada en el grid que contiene la información del soporte
    * 
    */
    self.desaprobar = function (solicitudResp) {
      if (observacionesCoordinador === "") {
        swal(
          'Error',
          "Debe incluir una observación que indice la razón de la desaprobación",
          'warning'
        );
      } else {
        swal({
          title: '¿Está seguro(a) de desaprobar el documento?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: $translate.instant('CANCELAR'),
          confirmButtonText: $translate.instant('ENVIAR')
        }).then(function () {
          //var pos = self.gridOptions1.data.indexOf(self.filaActividad);
          console.log(self.gridOptions2.data);
          self.solicitudes[self.index].solicitudOriginal.Estado.Id = 5;
          //self.documentos[pos].solicitud.FechaCreacion=;
          planTrabajoService.put('solicitud_soporte_plan_trabajo', self.solicitudes[self.index].id, self.solicitudes[self.index].solicitudOriginal)
            .then(function () {
              swal(
                'DOCUMENTO DESAPROBADO',
                'El documento ha sido desaprobado',
                'success'
              )
            })
            .catch(function (error) {
              swal(
                'Error',
                "No se pudo rechazar el documento",
                'warning'
              );
              console.log(error);
            });
          //grid.appScope.cargarsolicitudSoporte(self.indexActividad);
          //self.solicitudes[self.index].estado = 4;

          console.log(self.gridOptions2.data);
          self.gridOptions2.data[self.index].codEstado = 5;
          console.log(self.gridOptions2.data);
          self.gridApi2.core.refresh();
        }).catch(function (error) {//excepcion lanzada al cerrar la swal

        });
      }
    }

    self.enviar_observaciones = function () {
      if (observacionesCoordinador !== "") {
        swal({
          title: '¿Está seguro(a) de enviar la observación?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Aceptar'
        }).then(function () {

          self.solicitudes[self.index].solicitudOriginal.Observaciones = self.observacionesDoc;
          coreRequest.put('documento', self.solicitudes[self.index].id, self.solicitudes[self.index]).
            then(function (response) {
              swal(
                'DOCUMENTO APROVADO',
                'Se han guardado las observaciones',
                'success'
              )
            });
        });
      }
    }

    /*
    Función para visualizar enlace
    */
    self.visualizar_enlace = function (url) {
      console.log(self.fila_seleccionada.tipo)
      console.log(self.index)
      console.log(self.solicitudes)
      console.log(url)
      $window.open(url);
    };




  });
