'use strict';

/**
 * @ngdoc function
 * @name clienteApp.controller:ResolucionGeneracionCtrl
 * @description
 * # ResolucionGeneracionCtrl
 * Controller of the clienteApp
 */
angular.module('contractualClienteApp')
  .controller('ResolucionDetalleCtrl', function (administrativaRequest, oikosRequest, coreRequest, adminMidRequest, colombiaHolidaysService, pdfMakerService, $mdDialog, $scope, $translate, $window) {

    var self = this;
    self.resolucion = JSON.parse(localStorage.getItem("resolucion"));
    //TODO: ver porque Json.Parse no transforma las fechas :/
    if (self.resolucion.FechaExpedicion === "0001-01-01T00:00:00Z") {
      self.resolucion.FechaExpedicion = undefined;
    }
    if (self.resolucion.FechaExpedicion != undefined) {
      self.resolucion.FechaExpedicion = new Date(self.resolucion.FechaExpedicion);
    }
    self.proyectos = [];

    oikosRequest.get("dependencia", "query=Id:" + self.resolucion.IdFacultad + "&limit=-1").then(function (response) {
      self.facultad = response.data[0].Nombre;
    });

    oikosRequest.get("dependencia/proyectosPorFacultad/" + self.resolucion.IdFacultad + "/" + self.resolucion.NivelAcademico_nombre, "").then(function (response) {
      self.proyectos = response.data;
    });


    adminMidRequest.get("gestion_documento_resolucion/get_contenido_resolucion", "id_resolucion=" + self.resolucion.Id + "&id_facultad=" + self.resolucion.IdDependenciaFirma).then(function (response) {
      self.contenidoResolucion = response.data;
      adminMidRequest.get("gestion_previnculacion/docentes_previnculados_all", "id_resolucion=" + self.resolucion.Id).then(function (response) {
        self.contratados = response.data;
        self.generarResolucion();
      });
    });

    //*------------Funciones para editar la resolución -----------------*//
    self.agregarArticulo = function () {
      swal({
        title: $translate.instant('ESCRIBA_TEXTO'),
        input: 'textarea',
        showCancelButton: true,
        confirmButtonText: $translate.instant('ACEPTAR'),
        cancelButtonText: $translate.instant('CANCELAR'),
        howLoaderOnConfirm: true,
        preConfirm: function (texto) {
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              if (texto) {
                resolve();
              } else {
                reject($translate.instant('DEBE_INSERTAR'));
              }
            }, 1000);
          });
        },
        allowOutsideClick: false
      }).then(function (texto) {
        self.adicionarArticulo(texto);
      });
    };

    self.adicionarArticulo = function (texto) {
      administrativaRequest.get("resolucion/" + self.resolucion.Id).then(function (/*response*/) {
        if (self.contenidoResolucion.Articulos) {
          self.contenidoResolucion.Articulos.push({
            Texto: texto,
            Paragrafos: null
          });
        } else {
          self.contenidoResolucion.Articulos = [{
            Texto: texto,
            Paragrafos: null
          }];
        }
      });
    };

    self.eliminarArticulo = function (num) {
      if (self.contenidoResolucion.Articulos.length > 1) {
        self.contenidoResolucion.Articulos.splice(num, 1);
      } else {
        swal({
          text: $translate.instant('ALMENOS_UNO'),
          type: "warning"
        });
      }
    };

    self.eliminarParagrafo = function (num1, num2) {
      self.contenidoResolucion.Articulos[num1].Paragrafos.splice(num2, 1);
    };

    self.agregarParagrafo = function (num) {
      swal({
        title: $translate.instant('ESCRIBA_PARAGRAFO'),
        input: 'textarea',
        showCancelButton: true,
        confirmButtonText: $translate.instant('ACEPTAR'),
        cancelButtonText: $translate.instant('CANCELAR'),
        howLoaderOnConfirm: true,
        preConfirm: function (texto) {
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              if (texto) {
                resolve();
              } else {
                reject($translate.instant('DEBE_INSERTAR'));
              }
            }, 1000);
          });
        },
        allowOutsideClick: false
      }).then(function (texto) {
        self.adicionarParagrafo(num, texto);
      });
    };

    self.adicionarParagrafo = function (num, texto) {
      administrativaRequest.get("resolucion/" + self.resolucion.Id).then(function (/*response*/) {
        if (self.contenidoResolucion.Articulos[num].Paragrafos) {
          self.contenidoResolucion.Articulos[num].Paragrafos.push({ Texto: texto });
        } else {
          self.contenidoResolucion.Articulos[num].Paragrafos = [{ Texto: texto }];
        }
      });
    };

    self.guardarCambios = function () {
      if (self.resolucionValida(self.contenidoResolucion)) {

        var ResolucionVinculacionDocente = {
          Id: self.resolucion.Id,
          IdFacultad: self.resolucion.IdFacultad,
          Dedicacion: self.resolucion.Dedicacion,
          NivelAcademico: self.resolucion.NivelAcademico_nombre
        };
        self.contenidoResolucion.Vinculacion = ResolucionVinculacionDocente;
        administrativaRequest.get("resolucion" + "/" + self.resolucion.Id).then(function (response) {
          var res = response.data;
          res.FechaExpedicion = self.resolucion.FechaExpedicion;

          var localRes = JSON.parse(localStorage.getItem("resolucion"));
          localRes.FechaExpedicion = res.FechaExpedicion;
          var local = JSON.stringify(localRes);
          localStorage.setItem('resolucion', local);
          if (self.resolucion.FechaExpedicion != undefined) {
            res.FechaExpedicion = res.FechaExpedicion.toJSON();
          } else {
            res.FechaExpedicion = new Date('0001-01-01').toJSON();
          }
          return administrativaRequest.put("resolucion", self.resolucion.Id, res);
        }).then(function (response) {
          if (response.data !== "OK") {
            throw response.data;
          }
          return administrativaRequest.put("contenido_resolucion", self.resolucion.Id, self.contenidoResolucion);
        }).then(function (response) {
          if (response.data !== "OK") {
            throw response.data;
          }
          swal({
            title: $translate.instant('GUARDADO'),
            text: $translate.instant('GUARDADO_EXITO'),
            type: "success",
            confirmButtonText: $translate.instant('ACEPTAR'),
            showLoaderOnConfirm: true
          }).then(function () {
            $window.location.reload();
          });
        }).catch(function (err) {
          //console.log(err);
          swal({
            title: $translate.instant('ALERTA'),
            text: $translate.instant('PROBLEMA_ALMACENAMIENTO'),
            type: "warning",
            confirmButtonText: $translate.instant('ACEPTAR'),
            showLoaderOnConfirm: true
          });
        });
      } else {
        swal({
          text: $translate.instant('REVISE_DATOS_RESOLUCION'),
          type: "error"
        });
      }
    };

    self.resolucionValida = function (contenidoResolucion) {
      if (!contenidoResolucion.Numero) return false
      if (!contenidoResolucion.Titulo) return false;
      if (!contenidoResolucion.Preambulo) return false;
      if (!contenidoResolucion.Consideracion) return false;

      var resolucionValida = true;
      if (contenidoResolucion.Articulos) {
        contenidoResolucion.Articulos.forEach(function (articulo) {
          if (!articulo.Texto) {
            resolucionValida = false;
            return;
          }
          if (articulo.Paragrafos) {
            articulo.Paragrafos.forEach(function (paragrafo) {
              if (!paragrafo.Texto) {
                resolucionValida = false;
                return;
              }
            });
          }
        });
      }
      return resolucionValida;
    };

    self.generarResolucion = function () {
      if (self.resolucionValida(self.contenidoResolucion)) {
        var documento = pdfMakerService.getDocumento(self.contenidoResolucion, self.resolucion, self.contratados, self.proyectos);
        pdfMake.createPdf(documento).getDataUrl(function (outDoc) {
          document.getElementById('vistaPDF').src = outDoc;
        });
        $("#resolucion").show();
      } else {
        swal({
          text: $translate.instant('REVISE_DATOS_RESOLUCION'),
          type: "error"
        });
      }
    };

    self.getNumeros = function (objeto) {
      var numeros = [];
      if (objeto) {
        for (var i = 0; i < objeto.length; i++) {
          numeros.push(i);
        }
      }
      return numeros;
    };

    self.volver = function () {
      swal({
        text: $translate.instant('CAMBIOS_NO_GUARDADOS'),
        type: 'warning',
        confirmButtonText: $translate.instant('ACEPTAR'),
        cancelButtonText: $translate.instant('CANCELAR'),
        showCancelButton: true,
        cancelButtonColor: '#d33',
        allowOutsideClick: false
      }).then(function () {
        $window.location.href = '#/vinculacionespecial/resolucion_gestion';
      });
    };

    $scope.validarFecha = colombiaHolidaysService.validateDate;

  });
