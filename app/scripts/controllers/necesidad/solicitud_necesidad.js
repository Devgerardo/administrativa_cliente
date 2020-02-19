'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:NecesidadSolicitudNecesidadCtrl
 * @description
 * # NecesidadSolicitudNecesidadCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
    .controller('SolicitudNecesidadCtrl', function (administrativaRequest, $scope, $sce, $http, $filter, $window, agoraRequest, oikosRequest, coreAmazonRequest, financieraRequest, coreRequest, $translate, $routeParams, necesidadService) {
        var self = this;

        self.IdNecesidad = $routeParams.IdNecesidad;

        self.documentos = [];
        self.avance = undefined;
        self.formuIncompleto = true;

        self.apro = undefined;

        self.dep_ned = {
            JefeDependenciaSolicitante: 6
        };

        self.fecha_actual = new Date();
        self.vigencia = self.fecha_actual.getFullYear();

        self.deepCopy = function (obj) {
            return JSON.parse(JSON.stringify(obj));
        };

        self.variable = {};

        self.DuracionEspecial = 'unico_pago';
        self.fecha = new Date();
        self.f_apropiacion = [];
        self.ActividadEspecifica = [];
        self.especificaciones = [];
        self.requisitos_minimos = [];
        self.actividades_economicas = [];
        self.actividades_economicas_id = [];
        self.productos = [];
        self.f_valor = 0;
        self.asd = [];
        self.valorTotalEspecificaciones = 0;
        self.planes_anuales = [{
            Id: 1,
            Nombre: "Necesidad1 -2017"
        }];

        self.duracionEspecialMap = {
            duracion: [true, false, false, undefined],
            unico_pago: [false, true, false, 0],
            agotar_presupuesto: [true, false, true, undefined]
        };

        // El tipo de solicitud de contrato
        self.duracionEspecialFunc = function (especial) {
            self.necesidad.DiasDuracion = necesidadService.calculo_total_dias(self.anos, self.meses, self.dias);

            var s = self.duracionEspecialMap[especial];
            if (!s) return;

            self.ver_duracion_fecha = s[0];
            self.necesidad.UnicoPago = s[1];
            self.necesidad.AgotarPresupuesto = s[2];
            self.necesidad.DiasDuracion = s[3] == undefined ? self.necesidad.DiasDuracion : s[3];
        };

        self.duracionEspecialReverse = function () {
            var test = [self.necesidad.UnicoPago, self.necesidad.AgotarPresupuesto];
            Object.keys(self.duracionEspecialMap).forEach(function (k) {
                var v = self.duracionEspecialMap[k].slice(1, 3);
                if (_.isEqual(test, v)) {
                    self.DuracionEspecial = k;
                    self.ver_duracion_fecha = self.duracionEspecialMap[k][0];
                }
            });
        };

        necesidadService.initNecesidad(self.IdNecesidad).then(function (trNecesidad) {
            self.necesidad = trNecesidad.Necesidad;
            self.detalle_servicio_necesidad = trNecesidad.DetalleServicioNecesidad;
            self.ActividadEspecifica = trNecesidad.ActividadEspecifica;
            if (self.necesidad.TipoContratoNecesidad.Id == 2) self.actividades_economicas_id = trNecesidad.ActividadEconomicaNecesidad.map(function (d) { return parseInt(d.ActividadEconomica); });

            if (trNecesidad.Ffapropiacion) {
                self.f_apropiaciones = trNecesidad.Ffapropiacion;
                //necesidadService.groupByApropiacion(self.f_apropiaciones, false).then(function (fap) { self.f_apropiacion = fap });
                self.f_apropiaciones.forEach(function (apropiacion) {
                    var cantidadFuentes = apropiacion.Fuentes.length;
                    for (var i = 0; i < cantidadFuentes; i++) {
                        apropiacion.Fuentes[i].FuenteFinanciamiento = apropiacion.Fuentes[i].InfoFuente;
                    }
                    self.f_apropiacion.push({
                        Apropiacion: apropiacion.Apropiacion.Id,
                        aprop: apropiacion.Apropiacion,
                        fuentes: apropiacion.Fuentes,
                        initFuentes: apropiacion.Fuentes,
                        Monto: apropiacion.Monto,
                        productos: apropiacion.Productos,
                        initProductos: apropiacion.Productos
                    });
                })
            }

            self.documentos = trNecesidad.MarcoLegalNecesidad ? trNecesidad.MarcoLegalNecesidad.map(function (d) { return d.MarcoLegal; }) : [];
            self.dep_ned = trNecesidad.DependenciaNecesidad;
            self.dependencia_destino = trNecesidad.DependenciaNecesidadDestino;
            self.rol_ordenador_gasto = trNecesidad.RolOrdenadorGasto;
            self.duracionEspecialReverse();
            var data = necesidadService.calculo_total_dias_rev(self.necesidad.DiasDuracion);
            self.anos = data.anos;
            self.meses = data.meses;
            self.dias = data.dias;


            $scope.$watch('solicitudNecesidad.detalle_servicio_necesidad.NucleoConocimiento', function () {
                if (!self.detalle_servicio_necesidad) return
                coreAmazonRequest.get('snies_nucleo_basico', $.param({
                    query: 'Id:' + self.detalle_servicio_necesidad.NucleoConocimiento,
                    limit: -1
                })).then(function (response) {
                    if (response.data != null && response.data.lenght > 0)
                        self.nucleoarea = response.data[0].IdArea.Id;
                });
            }, true);

            $scope.$watch('solicitudNecesidad.dependencia_destino', function () {
                necesidadService.getJefeDependencia(self.dependencia_destino).then(function (JD) {
                    self.jefe_destino = JD.Persona;
                    self.dep_ned.JefeDependenciaDestino = JD.JefeDependencia.Id;
                }).catch(function (err) {
                    //console.log(err)
                });
            }, true);


            $scope.$watch('solicitudNecesidad.rol_ordenador_gasto', function () {
                necesidadService.getJefeDependencia(self.rol_ordenador_gasto).then(function (JD) {
                    self.ordenador_gasto = JD.Persona;
                    self.dep_ned.OrdenadorGasto = parseInt(JD.Persona.Id);
                }).catch(function (err) {
                    //console.log(err)
                });
            }, true);

        });

        self.estructura = {
            init: {
                forms: {
                    Avances: false,
                    Responsables: true,
                    General: true,
                    ObjetoContractual: true,
                    MarcoLegal: true,
                    Especificaciones: true,
                    Financiamiento: true,
                },
                Responsables: {
                    DependenciaSolicitante: true,
                    JefeDependenciaSolicitante: true,
                    DependenciaDestino: true,
                    JefeDependenciaDestino: true,
                    OrdenadorGasto: true,
                    RolOrdenadorGasto: true,
                },
                General: {
                    PlanAnualAdquisiciones: true,
                    UnidadEjecutora: true,
                    EstudioMercado: true,
                    ModalidadSeleccion: true,
                    Supervisor: true,
                    AnalisisRiesgo: true,
                },
                ObjetoContractual: {
                    ObjetoContrato: true,
                    JustificacionContrato: true,
                }
            },
            Contratacion: {
                forms: {
                },
            },
            Avances: {
                forms: {
                    Avances: true,
                    Especificaciones: false,
                },
                General: {
                    EstudioMercado: false,
                    ModalidadSeleccion: false,
                    Supervisor: false,
                },
            },
            ServiciosPublicos: {
                forms: {
                    //Avances: false,
                    Especificaciones: false,
                },
                General: {
                    EstudioMercado: false,
                    ModalidadSeleccion: false,
                    Supervisor: false,
                },
            }
        };

        self.forms = _.extend({}, self.estructura.init.forms);
        self.fields = _.extend({}, self.estructura.init);

        var alertInfo = {
            type: 'error',
            title: 'Complete todos los campos obligatorios en el formulario',
            showConfirmButton: false,
            timer: 2000,
        };

        self.validar_formu = function (form) {
            if (form.$invalid) {
                swal(alertInfo);
                form.open = false;
                return false;
            } else {
                form.open = !form.open;
                return true;
            }
        };

        coreRequest.get('jefe_dependencia/' + self.dep_ned.JefeDependenciaSolicitante, $.param({ query: 'FechaInicio__lte:' + moment().format('YYYY-MM-DD') + ',FechaFin__gte:' + moment().format('YYYY-MM-DD') })).then(function (response) {
            self.dependencia_solicitante_data = response.data;
        });

        $scope.$watch('solicitudNecesidad.especificaciones.Valor', function () {
            self.valor_iva = (self.especificaciones.Iva / 100) * self.especificaciones.Valor * self.especificaciones.Cantidad;
        }, true);

        $scope.$watch('solicitudNecesidad.especificaciones.Iva', function () {
            self.valor_iva = (self.especificaciones.Iva / 100) * self.especificaciones.Valor * self.especificaciones.Cantidad;
        }, true);

        $scope.$watch('solicitudNecesidad.especificaciones.Cantidad', function () {
            self.valor_iva = (self.especificaciones.Iva / 100) * self.especificaciones.Valor * self.especificaciones.Cantidad;
        }, true);

        $scope.$watch('solicitudNecesidad.valor_iva', function () {
            self.valor_total = (self.especificaciones.Valor * self.especificaciones.Cantidad) + self.valor_iva;
        }, true);

        coreAmazonRequest.get('snies_area', $.param({
            limit: -1,
            query: 'Estado:ACTIVO'
        })).then(function (response) {
            self.nucleo_area_data = response.data;
        });

        $scope.$watch('solicitudNecesidad.nucleoarea', function () {
            coreAmazonRequest.get('snies_nucleo_basico', $.param({
                query: 'IdArea.Id:' + self.nucleoarea,
                limit: -1
            })).then(function (response) {
                self.nucleo_conocimiento_data = response.data;
            });
        }, true);

        $scope.$watch('solicitudNecesidad.necesidad.TipoNecesidad.Id', function () {
            if (!self.necesidad) return
            var TipoNecesidad = self.necesidad.TipoNecesidad.Id;
            self.CambiarTipoNecesidad(TipoNecesidad);
        })

        necesidadService.getAllDependencias().then(function (Dependencias) {
            self.dependencia_data = Dependencias;
        })

        coreAmazonRequest.get('ordenador_gasto', $.param({
            limit: -1,
            sortby: "Cargo",
            order: "asc",
        })).then(function (response) {
            self.ordenador_gasto_data = response.data;
        });

        oikosRequest.get('dependencia', $.param({
            query: 'Id:122',
            limit: -1
        })).then(function (response) {
            self.dependencia_solicitante = response.data[0];
        });

        agoraRequest.get('informacion_persona_natural', $.param({
            query: 'Id:52204982',
            limit: -1
        })).then(function (response) {
            self.persona_solicitante = response.data[0];
        });


        //TODO: cambio de identificacion en financiera a oikos (7,12, etc)
        //oikosRequest.get('dependencia', $.param({
        financieraRequest.get('unidad_ejecutora', $.param({
            limit: -1,
            sortby: "Nombre",
            order: "asc",
        })).then(function (response) {
            //self.unidad_ejecutora_data = response.data.filter(function(d) {return (d.Id === 7 || d.Id === 12)}); //TODO: usar query:Id__in:(7,12) con la sistaxis correcta si beego tiene soporte
            self.unidad_ejecutora_data = response.data;
        });

        administrativaRequest.get('tipo_necesidad', $.param({
            limit: -1,
            sortby: "NumeroOrden",
            order: "asc",
        })).then(function (response) {
            self.tipo_necesidad_data = response.data;
            //ocultar terporalmente funcionalidad no implementada
            //TODO: implementar la demas funcionalidad
            var tmpSet = [2, 4, 5] // Ocultando: Nomina, Seguridad Social, Contratacion docente
            self.tipo_necesidad_data = self.tipo_necesidad_data.filter(function (tn) { return !tmpSet.includes(tn.Id) })
        });

        agoraRequest.get('unidad', $.param({
            limit: -1,
            sortby: "Unidad",
            order: "asc",
        })).then(function (response) {
            self.unidad_data = response.data;
        });

        //Temporal viene dado por un servicio de javier
        agoraRequest.get('informacion_persona_natural', $.param({
            limit: -1,
            sortby: "PrimerNombre",
            order: "asc",
        })).then(function (response) {
            self.persona_data = response.data;
        });

        necesidadService.getParametroEstandar().then(function (response) {
            self.parametro_estandar_data = response.data;
        });
        //-----

        administrativaRequest.get('modalidad_seleccion', $.param({
            limit: -1,
            sortby: "NumeroOrden",
            order: "asc",
        })).then(function (response) {
            self.modalidad_data = response.data;
        });

        administrativaRequest.get('tipo_financiacion_necesidad', $.param({
            limit: -1
        })).then(function (response) {
            self.tipo_financiacion_data = response.data;
        });

        administrativaRequest.get('tipo_contrato_necesidad', $.param({
            limit: -1,
            query: 'Estado:true'
        })).then(function (response) {
            self.tipo_contrato_data = response.data;
        });

        $http.get("scripts/models/marco_legal.json")
            .then(function (response) {

                self.MarcoLegalNecesidadText = $sce.trustAsHtml(response.data.common_text);

            });

        self.agregar_ffapropiacion = function (apropiacion) {
            if (apropiacion == undefined) {
                return
            }
            var Fap = {
                aprop: apropiacion,
                Apropiacion: apropiacion.Id,
                MontoPorApropiacion: 0,
            };

            // Busca si en f_apropiacion ya existe el elemento que intenta agregarse, comparandolo con su id
            // si lo que devuelve filter es un arreglo mayor que 0, significa que el elemento a agregar ya existe
            // por lo tanto devuelve un mensaje de alerta
            if (self.f_apropiacion.filter(function (element) { return element.Apropiacion === apropiacion.Id; }).length > 0) {
                swal(
                    'Apropiación ya agregada',
                    'El rubro: <b>' + Fap.aprop.Rubro.Nombre + '</b> ya ha sido agregado',
                    'warning'
                );
                // Por el contrario, si el tamaño del arreglo que devuelve filter es menor a 0
                // significa que no encontró ningún elemento que coincida con el id y agrega el objeto al arreglo
            } else {
                self.f_apropiacion.push(Fap);
            }

        };

        self.eliminarRubro = function (rubro) {
            for (var i = 0; i < self.f_apropiacion.length; i++) {
                if (self.f_apropiacion[i] === rubro) {
                    self.f_apropiacion.splice(i, 1);
                }
            }

        };

        self.eliminarRequisito = function (requisito) {
            for (var i = 0; i < self.requisitos_minimos.length; i++) {
                if (self.requisitos_minimos[i] === requisito) {
                    self.requisitos_minimos.splice(i, 1);
                }
            }
        };

        self.eliminarActividad = function (actividad) {
            for (var i = 0; i < self.ActividadEspecifica.length; i++) {
                if (self.ActividadEspecifica[i] === actividad) {
                    self.ActividadEspecifica.splice(i, 1);
                }
            }
        };

        $scope.$watch('solicitudNecesidad.f_apropiacion', function () {
            self.f_valor = 0;

            for (var i = 0; i < self.f_apropiacion.length; i++) {
                self.f_apropiacion[i].MontoPorApropiacion = 0;
                if (self.f_apropiacion[i].fuentes !== undefined) {
                    for (var k = 0; k < self.f_apropiacion[i].fuentes.length; k++) {
                        self.f_apropiacion[i].MontoPorApropiacion += self.f_apropiacion[i].fuentes[k].MontoParcial;
                    }
                }
                self.f_valor += self.f_apropiacion[i].MontoPorApropiacion;
            }
        }, true);

        $scope.$watch('solicitudNecesidad.productos', function () {
            self.valorTotalEspecificaciones = 0;
            for (var i = 0; i < self.productos.length; i++) {
                self.valorTotalEspecificaciones += ((self.productos[i].Valor * 0.19) + self.productos[i].Valor) * self.productos[i].Cantidad;
            }
        }, true);

        $scope.$watch('solicitudNecesidad.necesidad.TipoContratoNecesidad.Id', function () {
            if (self.necesidad && self.necesidad.TipoContratoNecesidad.Id === 1 /* tipo compra */) {
                self.MostrarTotalEspc = true;
            } else {
                self.MostrarTotalEspc = false;
            }

            self.valorTotalEspecificaciones = 0;
            self.productos = [];
        }, true);

        self.agregarActEsp = function (actividad) {
            var a = {};
            a.Descripcion = actividad;
            self.ActividadEspecifica.push(a);
        };

        self.quitar_act_esp = function (i) {
            self.ActividadEspecifica.splice(i, 1);
        };

        self.submitForm = function (form) {
            if (form.$valid) {
                self.crear_solicitud();
            } else {
                swal(
                    'Faltan datos en el formulario',
                    'Completa todos los datos obligatorios del formulario',
                    'warning'
                ).then(function (event) {
                    var e = angular.element('.ng-invalid-required')[2];
                    e.focus(); // para que enfoque el elemento
                    e.classList.add("ng-dirty") //para que se vea rojo
                })
            }
        };

        self.crear_solicitud = function () {
            self.actividades_economicas_id = self.actividades_economicas.map(function (ae) { return { ActividadEconomica: ae.Codigo } });
            self.marcos_legales = self.documentos.map(function (d) { return { MarcoLegal: d } });

            // if (self.necesidad.TipoContratoNecesidad) {
            //     if (self.f_valor !== self.valorTotalEspecificaciones && self.necesidad.TipoContratoNecesidad.Id === 1 /*tipo compra*/) {
            //         swal(
            //             'Error',
            //             'El valor del contrato (' + self.valorTotalEspecificaciones + ') debe ser igual que el de la financiación(' + self.f_valor + ')',
            //             'warning'
            //         );
            //         return;
            //     }
            // }

            self.f_apropiaciones = [];
            self.productos_apropiaciones = [];
            self.f_apropiacion
                .filter(function (fap) { return fap.fuentes !== undefined })
                .forEach(function (fap) {
                    fap.fuentes.forEach(function (fuente) {
                        var f = {
                            Apropiacion: fap.Apropiacion,
                            MontoParcial: fuente.MontoParcial,
                            FuenteFinanciamiento: fuente.FuenteFinanciamiento.Id,
                        };
                        self.f_apropiaciones.push(f);
                    });
                    //Construye objeto relación producto-rubro para persistir
                    if (fap.productos && fap.productos.length > 0) {
                        fap.productos.forEach(function (producto) {
                            var prod = {
                                ProductoRubro: producto.Id,
                                Apropiacion: fap.Apropiacion
                            };
                            self.productos_apropiaciones.push(prod);
                        })
                    }
                });

            self.necesidad.Valor = self.f_valor;

            self.tr_necesidad = {
                Necesidad: self.necesidad,
                ActividadEspecifica: self.ActividadEspecifica,
                ActividadEconomicaNecesidad: self.actividades_economicas_id,
                MarcoLegalNecesidad: self.marcos_legales,
                Ffapropiacion: self.f_apropiaciones,
                DependenciaNecesidad: self.dep_ned,
                DetalleServicioNecesidad: self.detalle_servicio_necesidad,
                ProductosNecesidad: self.productos_apropiaciones
            };

            var NecesidadHandle = function (response) {
                self.alerta_necesidad = response.data;
                if ((response.status !== 200 || self.alerta_necesidad !== "Ok") && typeof (self.alerta_necesidad) === "string") {
                    swal({
                        title: '',
                        type: 'error',
                        text: self.alerta_necesidad,
                        showCloseButton: true,
                        confirmButtonText: $translate.instant("CERRAR")
                    });
                    return;
                }
                if (self.alerta_necesidad.Type === "error" && typeof (self.alerta_necesidad.Body) === "string") {
                    swal({
                        title: '',
                        type: 'error',
                        text: self.alerta_necesidad.Body,
                        showCloseButton: true,
                        confirmButtonText: $translate.instant("CERRAR")
                    });
                    return;
                }
                if (typeof (self.alerta_necesidad) === "string")
                    self.alerta_necesidad = { Type: "success" }

                var templateAlert = "<table class='table table-bordered'><th>" +
                    $translate.instant('NO_NECESIDAD') + "</th><th>" +
                    $translate.instant('UNIDAD_EJECUTORA') + "</th><th>" +
                    $translate.instant('DEPENDENCIA_DESTINO') + "</th><th>" +
                    $translate.instant('TIPO_CONTRATO') + "</th><th>" +
                    $translate.instant('VALOR') + "</th>";

                var forEachResponse = function (data) {
                    if (data.Type === "error")
                        templateAlert += "<tr class='danger'>";
                    else
                        templateAlert += "<tr class='" + data.Type + "'>";

                    var n = typeof (data.Body) === "object" ? data.Body.Necesidad : self.necesidad;

                    templateAlert +=
                        "<td>" + n.NumeroElaboracion + "</td>" +
                        "<td>" + self.unidad_ejecutora_data.filter(function (u) { return u.Id === n.UnidadEjecutora })[0].Nombre + "</td>" +
                        "<td>" + self.dependencia_data.filter(function (dd) { return dd.Id === self.dependencia_destino })[0].Nombre + "</td>" +
                        "<td>" + (n.TipoContratoNecesidad.Nombre ? n.TipoContratoNecesidad.Nombre : '') + "</td>" +
                        "<td>" + $filter('currency')(n.Valor) + "</td>";

                    templateAlert += "</tr>";

                    if (self.avance) {
                        self.avance.Necesidad = { Id: n.Id }
                        administrativaRequest.put('necesidad_proceso_externo/', self.avance.Id, self.avance);
                    }
                }

                forEachResponse(self.alerta_necesidad);

                templateAlert = templateAlert + "</table>";
                swal({
                    title: '',
                    type: self.alerta_necesidad.Type,
                    width: 800,
                    html: templateAlert,
                    showCloseButton: true,
                    confirmButtonText: $translate.instant("CERRAR")
                });
                if (self.alerta_necesidad.Type === "success") {
                    $window.location.href = '#/necesidades';
                }
            };

            if (self.IdNecesidad) {
                if (self.tr_necesidad.Necesidad.EstadoNecesidad.Id != necesidadService.EstadoNecesidadType.Rechazada.Id) {
                    swal(
                        'Error',
                        'La necesidad no se puede editar, estado de la necesidad: (' + self.tr_necesidad.Necesidad.EstadoNecesidad.Nombre + ')',
                        'warning'
                    );
                    return;
                }
                self.tr_necesidad.Necesidad.EstadoNecesidad = necesidadService.EstadoNecesidadType.Modificada;
                administrativaRequest.put("tr_necesidad", self.IdNecesidad, self.tr_necesidad).then(NecesidadHandle)
            } else {
                self.tr_necesidad.Necesidad.EstadoNecesidad = necesidadService.EstadoNecesidadType.Solicitada;
                administrativaRequest.post("tr_necesidad", self.tr_necesidad).then(NecesidadHandle)
            }
        };


        self.ResetNecesidad = function () {
            var TipoNecesidad = self.necesidad.TipoNecesidad.Id;
            necesidadService.initNecesidad().then(function (trNecesidad) {
                self.necesidad = trNecesidad.Necesidad;
                self.necesidad.TipoNecesidad = { Id: parseInt(TipoNecesidad) };
                self.CambiarTipoNecesidad(TipoNecesidad);
            });

        };

        // Control de visualizacion de los campos individuales en el formulario
        self.CambiarTipoNecesidad = function (TipoNecesidad) {
            self.forms = _.merge({}, self.estructura.init.forms);
            self.fields = _.merge({}, self.estructura.init);

            self.TipoNecesidadType = ["", "Contratacion", "", "Avances", "", "", "ServiciosPublicos"];

            _.merge(self.forms, self.estructura[self.TipoNecesidadType[TipoNecesidad]].forms);
            _.merge(self.fields, self.estructura[self.TipoNecesidadType[TipoNecesidad]])
            self.necesidad.TipoContratoNecesidad = { Id: 3 }; //Tipo Contrato Necesidad: No Aplica
        };

    });