'use strict';

/**
 * @ngdoc service
 * @name contractualClienteApp.necesidad/necesidadService
 * @description
 * # necesidad/necesidadService
 * Service in the contractualClienteApp.
 */
angular.module('contractualClienteApp')
  .service('necesidadService', function (administrativaRequest, coreRequest, agoraRequest, oikosRequest, financieraRequest, adminMidRequest) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var self = this;
    self.EstadoNecesidadType = {};



    administrativaRequest.get('estado_necesidad', $.param({})).then(function (response) {
      var keys = ["Solicitada", "Aprobada", "Rechazada", "Anulada", "Modificada", "Enviada", "CdpSolicitado"];
      keys.forEach(function (v, i) {
        self.EstadoNecesidadType[v] = response.data[i];
      });
    });

    self.calculo_total_dias = function (anos, meses, dias) {
      anos = anos == undefined ? 0 : anos;
      meses = meses == undefined ? 0 : meses;
      dias = dias == undefined ? 0 : dias;

      return ((parseInt(anos) * 360) + (parseInt(meses) * 30) + parseInt(dias));
    };

    self.calculo_total_dias_rev = function (DiasDuracion) {
      var c = DiasDuracion;
      var data = { anos: 0, meses: 0, dias: 0 };
      data.anos = Math.floor(c / 360);
      c %= 360;
      data.meses = Math.floor(c / 30);
      c %= 30;
      data.dias = c;
      return data;
    };

    //Obtiene todo el jefe de dependencia demendiendo del id del jefe o la dependencia, si idOrDep es true, se utilizará el id del jefe
    self.getJefeDependencia = function (idDependencia, idOrDep) {
      var out = { JefeDependencia: {}, Persona: {} }
      return new Promise(function (resolve, reject) {
        if (!idDependencia) reject(out);

        coreRequest.get('jefe_dependencia', $.param({
          query: (idOrDep ? "Id:" + idDependencia : "DependenciaId:" + idDependencia) + ',FechaInicio__lte:' + moment().format('YYYY-MM-DD') + ',FechaFin__gte:' + moment().format('YYYY-MM-DD'),
          limit: -1,
        })).then(function (response) {
          out.JefeDependencia = response.data[0]; //TODO: cambiar el criterio para tomar en cuenta el periodo de validez del jefe

          return agoraRequest.get('informacion_persona_natural', $.param({
            query: 'Id:' + response.data[0].TerceroId,
            limit: -1
          }))
        }).then(function (response) {
          out.Persona = response.data[0];
          resolve(out);
        }).catch(function (error) {
          reject(error);
        });
      });
    };

    self.getAllDependencias = function () {
      return new Promise(function (resolve, reject) {
        oikosRequest.get('dependencia', $.param({
          limit: -1,
          sortby: "Nombre",
          order: "asc",
        })).then(function (response) {
          resolve(response.data);
        });
      });
    };

    self.getApropiacionesData = function (Ffapropiacion) {
      var apropiaciones_data = [];
      return new Promise(function (resolve, reject) {
        if (Ffapropiacion.length === 0) resolve([]);
        Ffapropiacion.map(function (ap, i, arr) {
          financieraRequest.get('apropiacion', $.param({
            query: 'Id:' + ap.Apropiacion
          })).then(function (response) {
            apropiaciones_data.push(response.data[0]);
            if (i == arr.length - 1) {
              resolve(apropiaciones_data);
            }
          });
        });
      });
    };

    self.getAllFuentesFinanciacion = function (idApropiacion, dependencia) {
      return new Promise(function (resolve, reject) {
        financieraRequest.get('fuente_financiamiento_apropiacion', $.param({
          query: 'Apropiacion:' + idApropiacion + ',Dependencia:' + dependencia
        })).then(function (response) {
          resolve(
            response.data.map(function (fa) {
              return fa.FuenteFinanciamiento;
            })
          );
        })
      });
    };


    self.groupBy = function (list, keyGetter) {
      var map = new Map();
      list.forEach(function (item) {
        var key = keyGetter(item);
        var collection = map.get(key);
        if (!collection) {
          map.set(key, [item]);
        } else {
          collection.push(item);
        }
      });
      return map;
    }

    self.groupByApropiacion = function (f_apropiaciones, incluirFuentes) {
      // agrupar por ID apropiacion
      var tmp = self.groupBy(f_apropiaciones, function (apro) { return apro.Apropiacion });
      var f_apropiacion = [];

      //crear cada una de las apropiaciones con sus respectivo array de fuentes
      return new Promise(function (resolve, reject) {

        var counter = 0;
        tmp.forEach(function (apropiacion, idApropiacion) {
          var monto = 0;

          new Promise(function (resolve, reject) {
            var fuentes = [];
            apropiacion.forEach(function (fuente, i) {
              monto += fuente.MontoParcial;
              if (incluirFuentes) {
                financieraRequest.get('fuente_financiamiento', $.param({
                  query: 'Id:' + fuente.FuenteFinanciamiento
                })).then(function (response) {
                  fuentes.push({ Monto: fuente.MontoParcial, FuenteFinanciamiento: response.data[0] })
                  if (i === apropiacion.length - 1) resolve(fuentes);
                })
              } else {
                fuentes.push({ Monto: fuente.MontoParcial, FuenteFinanciamiento: { Id: fuente.FuenteFinanciamiento } });
                if (i === apropiacion.length - 1) resolve(fuentes);
              }
            });
          }).then(function (fuentes) {
            f_apropiacion.push({
              Apropiacion: idApropiacion,
              fuentes: fuentes,
              initFuentes: fuentes,
              Monto: monto
            });
            if (counter === tmp.size - 1) resolve(f_apropiacion);
            counter++;
          })
        });
      })
    };

    self.getParametroEstandar = function () {
      return agoraRequest.get('parametro_estandar', $.param({
        query: "ClaseParametro:" + 'Tipo Perfil',
        limit: -1
      }));
    }

    self.initNecesidad = function (IdNecesidad) {
      var trNecesidad = {};
      if (IdNecesidad) {
        return administrativaRequest.get('necesidad', $.param({
          query: 'Id:' + IdNecesidad
        })).then(function (response) {
          trNecesidad.Necesidad = response.data[0];
          return new Promise(function (resolve, reject) {
            if (trNecesidad.Necesidad.TipoContratoNecesidad.Id === 2) { // Tipo Servicio
              administrativaRequest.get('detalle_servicio_necesidad', $.param({
                query: 'Necesidad:' + IdNecesidad
              })).then(function (response) {
                trNecesidad.DetalleServicioNecesidad = response.data[0];

                return administrativaRequest.get('actividad_especifica', $.param({
                  query: 'Necesidad:' + IdNecesidad
                }))
              }).then(function (response) {
                trNecesidad.ActividadEspecifica = response.data;

                return administrativaRequest.get('actividad_economica_necesidad', $.param({
                  query: 'Necesidad:' + IdNecesidad
                }))
              }).then(function (response) {
                trNecesidad.ActividadEconomicaNecesidad = response.data;
                resolve("OK");
              });
            } else resolve("Ok");
          }).then(function (response) {
              
            return adminMidRequest.get('solicitud_necesidad/fuente_apropiacion_necesidad/' + IdNecesidad).then(function (response) {
              trNecesidad.Ffapropiacion = response.data;

              return administrativaRequest.get('marco_legal_necesidad', $.param({
                query: 'Necesidad:' + IdNecesidad
              }))
            }).then(function (response) {
              trNecesidad.MarcoLegalNecesidad = response.data;

              return administrativaRequest.get('dependencia_necesidad', $.param({
                query: 'Necesidad:' + IdNecesidad
              }))
            }).then(function (response) {
              trNecesidad.DependenciaNecesidad = response.data[0];

              return coreRequest.get('jefe_dependencia', $.param({
                query: "Id:" + trNecesidad.DependenciaNecesidad.JefeDependenciaDestino + ',FechaInicio__lte:' + moment().format('YYYY-MM-DD') + ',FechaFin__gte:' + moment().format('YYYY-MM-DD'),
                limit: -1,
              }))
            }).then(function (response) {
              trNecesidad.DependenciaNecesidadDestino = response.data[0].DependenciaId;

              return coreRequest.get('jefe_dependencia', $.param({
                query: "Id:" + trNecesidad.DependenciaNecesidad.JefeDependenciaSolicitante + ',FechaInicio__lte:' + moment().format('YYYY-MM-DD') + ',FechaFin__gte:' + moment().format('YYYY-MM-DD'),
                limit: -1,
              }))
            }).then(function (response) {
              trNecesidad.DependenciaNecesidadSolicitante = response.data[0].DependenciaId;

              return coreRequest.get('jefe_dependencia', $.param({
                query: "TerceroId:" + trNecesidad.DependenciaNecesidad.OrdenadorGasto + ',FechaInicio__lte:' + moment().format('YYYY-MM-DD') + ',FechaFin__gte:' + moment().format('YYYY-MM-DD'),
                limit: -1
              }))
            }).then(function (response) {
              trNecesidad.RolOrdenadorGasto = response.data[0].DependenciaId;
              return new Promise(function (resolve, reject) {
                resolve(trNecesidad);
              });
            });
          });
        });


      } else {
        trNecesidad.Necesidad = {};
        trNecesidad.Necesidad.TipoNecesidad = { Id: 1 };
        trNecesidad.Necesidad.TipoContratoNecesidad = { Id: "" };
        trNecesidad.Necesidad.DiasDuracion = 0;
        trNecesidad.Necesidad.UnicoPago = true;
        trNecesidad.ActividadEspecifica = [];
        trNecesidad.DetalleServicioNecesidad = { NucleoConocimiento: 0 }
        trNecesidad.DependenciaNecesidad = { JefeDependenciaSolicitante: 6 };
        trNecesidad.Necesidad.AgotarPresupuesto = false;
        trNecesidad.Necesidad.Valor = 0;
        administrativaRequest.get('estado_necesidad', $.param({
          query: "Nombre:Solicitada"
        })).then(function (response) {
          trNecesidad.Necesidad.EstadoNecesidad = response.data[0];
        });

        return new Promise(function (resolve, reject) {
          resolve(trNecesidad);
        });
      }


    };

    return self;
  });
