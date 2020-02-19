'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:NecesidadNecesidadContratacionDocenteCtrl
 * @description
 * # NecesidadNecesidadContratacionDocenteCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('NecesidadContratacionDocenteCtrl', function (administrativaRequest, $scope, agoraRequest, oikosRequest, coreAmazonRequest, coreRequest, $translate) {
    var self = this;
    self.documentos = [];
    self.formuIncompleto = true;

    $scope.info_general = false;
    $scope.info_responsables = false;
    $scope.info_objeto = false;
    $scope.info_legal = false;
    $scope.finan = false;
    self.fecha_actual = new Date();
    self.vigencia = self.fecha_actual.getFullYear();

    function validarDatos(datosPorValidar) {
      var faltanCampos = false;
      for (var dato in datosPorValidar) {
        if (datosPorValidar[dato] === undefined) {
          faltanCampos = true;
        } else if (datosPorValidar[dato].length === 0) {
          faltanCampos = true;
        }
      }
      return faltanCampos;
    }

    self.validar_formu = function (arrVariables, parteValidar) {
      switch (parteValidar) {
        case 0: // responsables
          if ($scope.info_responsables) {
            if (validarDatos(arrVariables)) {
              $scope.info_responsables = true; // Si faltan datos mantiene abierta info_responsables
              swal({
                position: 'top-right',
                type: 'error',
                title: 'Complete todos los campos obligatorios en el formulario',
                showConfirmButton: false,
                timer: 2000
              });
            } else {
              $scope.info_responsables = false;
              self.formuIncompleto = false;
            }
          } else {
            $scope.info_responsables = true;
          }
          break;

        case 1: // General
          if ($scope.info_general) {
            if (validarDatos(arrVariables)) {
              $scope.info_general = true; // Si faltan datos mantiene abierta info_responsables
              swal({
                position: 'top-right',
                type: 'error',
                title: 'Complete todos los campos obligatorios en el formulario',
                showConfirmButton: false,
                timer: 2000
              });
            } else {
              $scope.info_general = false;
              self.formuIncompleto = false;
            }
          } else {
            $scope.info_general = true;
          }
          break;

        case 2: // Objeto contractual
          if ($scope.info_objeto) {
            if (validarDatos(arrVariables)) {
              $scope.info_objeto = true; // Si faltan datos mantiene abierta info_responsables
              swal({
                position: 'top-right',
                type: 'error',
                title: 'Complete todos los campos obligatorios en el formulario',
                showConfirmButton: false,
                timer: 2000
              });
            } else {
              $scope.info_objeto = false;
              self.formuIncompleto = false;
            }
          } else {
            $scope.info_objeto = true;
          }
          break;
        case 3: // Marco legal
          if ($scope.info_legal) {
            $scope.info_legal = false;
          } else {
            $scope.info_legal = true;
          }
          break;
        default:
          self.formuIncompleto = true;
          break;
      }
    };



    $scope.$watchGroup([/*'necesidadContratacionDocente.necesidad.UnidadEjecutora', */'necesidadContratacionDocente.necesidad.TipoFinanciacionNecesidad'], function () {
      self.f_apropiacion_fun = [];
    }, true);

    $scope.$watch('necesidadContratacionDocente.rol_ordenador_gasto', function () {
      coreRequest.get('jefe_dependencia', $.param({
        query: "DependenciaId:" + self.rol_ordenador_gasto,
        limit: -1
      })).then(function (response) {
        agoraRequest.get('informacion_persona_natural', $.param({
          query: 'Id:' + response.data[0].TerceroId,
          limit: -1
        })).then(function (response) {
          self.ordenador_gasto = response.data[0];
          self.dep_ned.OrdenadorGasto = parseInt(response.data[0].Id);
        });
      });
    }, true);

    oikosRequest.get('dependencia', $.param({
      limit: -1,
      sortby: "Nombre",
      order: "asc",
    })).then(function (response) {
      self.dependencia_data = response.data;
    });

    coreAmazonRequest.get('ordenador_gasto', $.param({
      limit: -1,
      sortby: "Cargo",
      order: "asc",
    })).then(function (response) {
      self.ordenador_gasto_data = response.data;
    });

    self.dep_ned = {
      JefeDependenciaSolicitante: 29
    };

    coreRequest.get('jefe_dependencia/' + self.dep_ned.JefeDependenciaSolicitante, ''
    ).then(function (response) {
      self.dependencia_solicitante_data = response.data;
      oikosRequest.get('dependencia/' + self.dependencia_solicitante_data.DependenciaId, ''
      ).then(function (response) {
        self.dependencia_solicitante = response.data;
        agoraRequest.get('informacion_persona_natural/' + self.dependencia_solicitante_data.TerceroId, ''
        ).then(function (response) {
          self.persona_solicitante = response.data;
          self.dep_ned.JefeDependenciaDestino = self.dep_ned.JefeDependenciaSolicitante;
        });
      });
    });

    self.necesidad = {};
    self.necesidad.TipoNecesidad = {
      Id: 5
    };
    self.necesidad.UnidadEjecutora = 1;
    self.necesidad.ModalidadSeleccion = {
      Id: 8
    };
    self.necesidad.TipoFinanciacionNecesidad = {
      Id: 2
    };
    self.necesidad.TipoContratoNecesidad = {
      Id: 3
    };
    self.variable = {};
    self.necesidad.UnicoPago = true;
    self.necesidad.AgotarPresupuesto = false;
    self.necesidad.Valor = 0;
    self.fecha = new Date();
    self.necesidad.DiasDuracion = 0;
    self.f_apropiacion_fun = [];
    //self.f_apropiacion_inv = [];
    self.asd = [];


    self.planes_anuales = [{
      Id: 1,
      Nombre: "Necesidad1 -2017"
    }];



    // function
    self.duracionEspecial = function (especial) {
      self.ver_duracion_fecha = false;
      if (especial === 'duracion') {
        self.ver_duracion_fecha = true;
        self.necesidad.UnicoPago = false;
        self.necesidad.AgotarPresupuesto = false;
      } else if (especial === "unico_pago") {
        self.necesidad.DiasDuracion = 0;
        self.necesidad.UnicoPago = true;
        self.necesidad.AgotarPresupuesto = false;
        self.ver_duracion_fecha = false;
      } else if (especial === "agotar_presupuesto") {
        self.necesidad.UnicoPago = false;
        self.necesidad.AgotarPresupuesto = true;
        self.ver_duracion_fecha = true;
      }
    };


    self.calculo_total_dias = function () {
      if (self.anos === undefined) {
        self.anos = 0;
      }
      if (self.meses === undefined) {
        self.meses = 0;
      }
      if (self.dias === undefined) {
        self.dias = 0;
      }
      self.necesidad.DiasDuracion = ((parseInt(self.anos) * 360) + (parseInt(self.meses) * 30) + parseInt(self.dias));
    };


    administrativaRequest.get('estado_necesidad', $.param({
      query: "Nombre:Solicitada"
    })).then(function (response) {
      self.necesidad.EstadoNecesidad = response.data[0];
    });


    administrativaRequest.get('modalidad_seleccion', $.param({
      limit: -1,
      sortby: "NumeroOrden",
      order: "asc",
    })).then(function (response) {
      self.modalidad_data = response.data;
    });




    self.agregar_ffapropiacion = function (apropiacion) {
      var Fap = {
        aprop: apropiacion,
        Apropiacion: apropiacion.Id,
        MontoParcial: 0,
      };


      // Busca si en f_apropiacion_fun ya existe el elemento que intenta agregarse, comparandolo con su id
      // si lo que devuelve filter es un arreglo mayor que 0, significa que el elemento a agregar ya existe
      // por lo tanto devuelve un mensaje de alerta
      if (self.f_apropiacion_fun.filter(function (element) {
        return element.Apropiacion === apropiacion.Id;
      }).length > 0) {
        swal(
          'Apropiación ya agregada',
          'El rubro: <b>' + Fap.aprop.Rubro.Nombre + '</b> ya ha sido agregado',
          'warning'
        );
        // Por el contrario, si el tamaño del arreglo que devuelve filter es menor a 0
        // significa que no encontró ningún elemento que coincida con el id y agrega el objeto al arreglo
      } else {
        self.f_apropiacion_fun.push(Fap);
      }

    };

    self.eliminarRubro = function (rubro) {
      for (var i = 0; i < self.f_apropiacion_fun.length; i++) {
        if (self.f_apropiacion_fun[i] === rubro) {
          self.f_apropiacion_fun.splice(i, 1);
        }
      }

    };




    $scope.$watch('necesidadContratacionDocente.f_apropiacion_fun', function () {
      self.valor_fun = 0;
      for (var i = 0; i < self.f_apropiacion_fun.length; i++) {
        self.valor_fun += self.f_apropiacion_fun[i].MontoParcial;
      }
    }, true);


    self.submitForm = function (form) {
      if (form.$valid) {
        self.crear_solicitud();
      } else {
        swal(
          'Faltan datos en el formulario',
          'Completa todos los datos obligatorios del formulario',
          'warning'
        );
      }
    };

    self.crear_solicitud = function () {
      self.marcos_legales = [];
      self.f_apropiaciones = [];


      if (self.documentos.length > 0) {
        for (var j = 0; j < self.documentos.length; j++) {
          var marco = {};
          marco.MarcoLegal = self.documentos[j];
          self.marcos_legales.push(marco);
        }
      }

      self.f_apropiaciones = self.f_apropiacion_fun;
      self.necesidad.Valor = self.valor_fun;


      self.tr_necesidad = {
        Necesidad: self.necesidad,
        MarcoLegalNecesidad: self.marcos_legales,
        Ffapropiacion: self.f_apropiaciones,
        DependenciaNecesidad: self.dep_ned
      };


      administrativaRequest.post("tr_necesidad_docente", self.tr_necesidad).then(function (response) {
        self.alerta = "";
        for (var i = 1; i < response.data.length; i++) {
          self.alerta = self.alerta + response.data[i] + "\n";
        }
        swal({
          text: self.alerta,
          type: response.data[0],
          confirmButtonColor: "#449D44",
          confirmButtonText: $translate.instant('CONFIRMAR')
        }).then(function () {
          //si da click en ir a contratistas
          if (response.data[0] === "success") {
            location.href = '#/necesidades';
          }
        });
      });
    };
  });
