'use strict';

/**
 * @ngdoc function
 * @name clienteApp.controller:ContratoRegistroHorasCtrl
 * @description
 * # ContratoRegistroHorasCtrl
 * Controller of the clienteApp
 */
angular.module('contractualClienteApp')
    .controller('ContratoRegistroHorasCtrl', function (amazonAdministrativaRequest, administrativaRequest, adminMidRequest, oikosRequest, coreAmazonRequest, financieraRequest, sicapitalRequest, idResolucion, colombiaHolidaysService, pdfMakerService, nuxeoClient, coreRequest, $mdDialog, lista, resolucion, $translate, $window, $scope) {

        var self = this;
        self.contratoGeneralBase = {};
        self.contratoGeneralBase.Contrato = {};
        self.acta = {};
        self.estado = false;
        self.CurrentDate = new Date();
        self.esconderBoton = false;
        self.idResolucion = idResolucion;
        self.FechaExpedicion = null;
        self.resolucionTest = JSON.parse(localStorage.getItem("resolucion"));

        administrativaRequest.get('resolucion/' + self.idResolucion).then(function (response) {
            self.resolucionActual = response.data;
            if (self.resolucionActual.FechaExpedicion != undefined && self.resolucionActual.FechaExpedicion !== "0001-01-01T00:00:00Z") {
                self.FechaExpedicion = new Date(self.resolucionActual.FechaExpedicion);
            }
            return administrativaRequest.get('tipo_resolucion/' + self.resolucionActual.IdTipoResolucion.Id);
        }).then(function (response) {
            self.resolucionActual.IdTipoResolucion.NombreTipoResolucion = response.data.NombreTipoResolucion;
            adminMidRequest.get("gestion_documento_resolucion/get_contenido_resolucion", "id_resolucion=" + self.resolucionActual.Id + "&id_facultad=" + self.resolucionActual.IdDependenciaFirma).then(function (response) {
                self.contenidoResolucion = response.data;
                adminMidRequest.get("gestion_previnculacion/docentes_previnculados_all", "id_resolucion=" + self.resolucionActual.Id).then(function (response) {
                    self.contratadosPdf = response.data;
                });
            });
        });

        oikosRequest.get('dependencia/' + resolucion.Facultad).then(function (response) {
            resolucion.FacultadNombre = response.data.Nombre;
        });

        administrativaRequest.get("modificacion_resolucion/", "query=ResolucionNueva:" + self.idResolucion).then(function (response) {
            self.resolucionModificada = response.data[0].ResolucionAnterior;
            administrativaRequest.get("resolucion/" + self.resolucionModificada).then(function (response) {
                self.numeroResolucionModificada = response.data.NumeroResolucion;
            });
        });

        administrativaRequest.get("resolucion_vinculacion_docente/" + self.idResolucion).then(function (response) {
            self.datosFiltro = response.data;
            oikosRequest.get("dependencia/" + self.datosFiltro.IdFacultad.toString()).then(function (response) {
                self.contratoGeneralBase.Contrato.SedeSolicitante = response.data.Id.toString();
                self.sede_solicitante_defecto = response.data.Nombre;
            });
            adminMidRequest.get("gestion_previnculacion/docentes_previnculados", "id_resolucion=" + self.idResolucion.toString()).then(function (response) {
                self.contratados = response.data;
            });
            oikosRequest.get("dependencia/proyectosPorFacultad/" + resolucion.Facultad + "/" + self.datosFiltro.NivelAcademico, "").then(function (response) {
                self.proyectos = response.data;
            });
            coreAmazonRequest.get("ordenador_gasto", "query=DependenciaId%3A" + self.datosFiltro.IdFacultad.toString()).then(function (response) {
                if (response.data === null) {
                    coreAmazonRequest.get("ordenador_gasto/1").then(function (response) {
                        self.ordenadorGasto = response.data;
                    });
                } else {
                    self.ordenadorGasto = response.data[0];
                }
            });
        });

        coreAmazonRequest.get("punto_salarial", "sortby=Vigencia&order=desc&limit=1").then(function (response) {
            self.punto_salarial = response.data[0];
        });

        coreAmazonRequest.get("salario_minimo", "sortby=Vigencia&order=desc&limit=1").then(function (response) {
            self.salario_minimo = response.data[0];
        });

        amazonAdministrativaRequest.get('vigencia_contrato', $.param({
            limit: -1
        })).then(function (response) {
            self.vigencia_data = response.data;
        });

        self.asignarValoresDefecto = function () {
            self.contratoGeneralBase.Contrato.Vigencia = new Date().getFullYear();
            self.contratoGeneralBase.Contrato.FormaPago = { Id: 240 };
            self.contratoGeneralBase.Contrato.DescripcionFormaPago = "Abono a Cuenta Mensual de acuerdo a puntas y hotras laboradas";
            self.contratoGeneralBase.Contrato.Justificacion = "Docente de Vinculacion Especial";
            self.contratoGeneralBase.Contrato.UnidadEjecucion = { Id: 269 };
            self.contratoGeneralBase.Contrato.LugarEjecucion = { Id: 4 };
            self.contratoGeneralBase.Contrato.Observaciones = "Contrato de Docente Vinculación Especial";
            self.contratoGeneralBase.Contrato.TipoControl = 181;
            self.contratoGeneralBase.Contrato.ClaseContratista = 33;
            self.contratoGeneralBase.Contrato.TipoMoneda = 137;
            self.contratoGeneralBase.Contrato.OrigenRecursos = 149;
            self.contratoGeneralBase.Contrato.OrigenPresupuesto = 156;
            self.contratoGeneralBase.Contrato.TemaGastoInversion = 166;
            self.contratoGeneralBase.Contrato.TipoGasto = 146;
            self.contratoGeneralBase.Contrato.RegimenContratacion = 136;
            self.contratoGeneralBase.Contrato.Procedimiento = 132;
            self.contratoGeneralBase.Contrato.ModalidadSeleccion = 123;
            self.contratoGeneralBase.Contrato.TipoCompromiso = 35;
            self.contratoGeneralBase.Contrato.TipologiaContrato = 46;
            self.contratoGeneralBase.Contrato.FechaRegistro = new Date();
            self.contratoGeneralBase.Contrato.UnidadEjecutora = 1;
            self.contratoGeneralBase.Contrato.Condiciones = "Sin condiciones";
            self.acta.Descripcion = "Acta inicio resolución Docente Vinculación Especial";
        };

        self.asignarValoresDefecto();

        financieraRequest.get("unidad_ejecutora/1").then(function (response) {
            self.unidad_ejecutora_defecto = response.data;
        });
        amazonAdministrativaRequest.get("parametros/240").then(function (response) {
            self.forma_pago_defecto = response.data;
        });
        amazonAdministrativaRequest.get("parametros/136").then(function (response) {
            self.regimen_contratacion_defecto = response.data;
        });


        self.cancelar = function () {
            $mdDialog.hide();
        };


        self.realizarContrato = function () {
            if (self.datosFiltro.Dedicacion === "HCH") {
                self.contratoGeneralBase.Contrato.TipoContrato = { Id: 3 };
                self.contratoGeneralBase.Contrato.ObjetoContrato = "Docente de Vinculación Especial - Honorarios";
            } else if (self.datosFiltro.Dedicacion === "HCP") {
                self.contratoGeneralBase.Contrato.TipoContrato = { Id: 2 };
                self.contratoGeneralBase.Contrato.ObjetoContrato = "Docente de Vinculación Especial - Salario";
            } else {
                self.contratoGeneralBase.Contrato.TipoContrato = { Id: 18 };
                self.contratoGeneralBase.Contrato.ObjetoContrato = "Docente de Vinculación Especial - Medio Tiempo Ocasional (MTO) - Tiempo Completo Ocasional (TCO)";
            }
            if (self.FechaExpedicion) {
                swal({
                    title: $translate.instant('EXPEDIR'),
                    text: $translate.instant('SEGURO_EXPEDIR'),
                    html: '<p><b>' + $translate.instant('NUMERO') + ': </b>' + resolucion.Numero.toString() + '</p>' +
                        '<p><b>' + $translate.instant('FACULTAD') + ': </b>' + resolucion.FacultadNombre + '</p>' +
                        '<p><b>' + $translate.instant('NIVEL_ACADEMICO') + ': </b>' + resolucion.NivelAcademico + '</p>' +
                        '<p><b>' + $translate.instant('DEDICACION') + ': </b>' + resolucion.Dedicacion + '</p>',
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonText: $translate.instant('ACEPTAR'),
                    cancelButtonText: $translate.instant('CANCELAR'),
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: false,
                    allowOutsideClick: false
                }).then(function () {
                    self.guardarContratos();
                }, function (dismiss) {
                    if (dismiss === 'cancel') {
                        swal({
                            text: $translate.instant('EXPEDICION_NO_REALIZADA'),
                            type: 'error',
                            allowOutsideClick: false
                        });
                    }
                });
            } else {
                swal({
                    text: $translate.instant('COMPLETE_CAMPOS'),
                    type: 'warning'
                });
            }
        };

        self.cancelarExpedicion = function () {
            $mdDialog.hide();
        };

        self.guardarContratos = function () {
            self.estado = true;
            self.esconderBoton = true;
            var conjuntoContratos = [];
            if (self.contratados) {
                self.contratados.forEach(function (contratado) {
                    var contratoGeneral = JSON.parse(JSON.stringify(self.contratoGeneralBase.Contrato));
                    var actaI = JSON.parse(JSON.stringify(self.acta));
                    actaI.FechaInicio = contratado.FechaInicio;
                    contratoGeneral.Contratista = parseInt(contratado.IdPersona);
                    contratoGeneral.DependenciaSolicitante = contratado.IdProyectoCurricular.toString();
                    contratoGeneral.PlazoEjecucion = parseInt(contratado.NumeroHorasSemanales);
                    contratoGeneral.OrdenadorGasto = self.ordenadorGasto.Id;
                    contratoGeneral.ValorContrato = parseInt(contratado.ValorContrato);
                    var contratoVinculacion = {
                        ContratoGeneral: contratoGeneral,
                        ActaInicio: actaI,
                        VinculacionDocente: {
                            Id: parseInt(contratado.Id),
                            NumeroSemanasNuevas: contratado.NumeroSemanasNuevas,
                            NumeroHorasNuevas: contratado.NumeroHorasNuevas,
                            NivelAcademico: self.resolucionTest.NivelAcademico_nombre,
                            Dedicacion: self.resolucionTest.Dedicacion
                        }
                    };
                    if (self.datosFiltro.NivelAcademico.toLowerCase() === "pregrado") {
                        contratoVinculacion.VinculacionDocente.IdPuntoSalarial = self.punto_salarial.Id;
                    } else if (self.datosFiltro.NivelAcademico.toLowerCase() === "posgrado") {
                        contratoVinculacion.VinculacionDocente.IdSalarioMinimo = self.salario_minimo.Id;
                    }
                    conjuntoContratos.push(contratoVinculacion);
                });
                var expedicionResolucion = {
                    Vinculaciones: conjuntoContratos,
                    idResolucion: self.idResolucion,
                    FechaExpedicion: self.FechaExpedicion
                };
                resolucion.FechaExpedicion = self.FechaExpedicion;
                adminMidRequest.post("expedir_resolucion/validar_datos_expedicion", expedicionResolucion).then(function (response) {
                    if (response.status === 201) {

                        adminMidRequest.post("expedir_resolucion/expedirModificacion", expedicionResolucion).then(function (response) {
                            self.estado = false;
                            if (response.status === 233) {
                                swal({
                                    text: response.data,
                                    title: "Alerta",
                                    type: "error",
                                    confirmButtonText: $translate.instant('ACEPTAR'),
                                    showLoaderOnConfirm: true,
                                    allowOutsideClick: false
                                });
                            } else {
                                self.guardarResolucionNuxeo();
                            }
                        });
                    } else {

                        swal({
                            text: response.data,
                            title: "Alerta",
                            type: "error",
                            confirmButtonText: $translate.instant('ACEPTAR'),
                            showLoaderOnConfirm: true,
                            allowOutsideClick: false
                        });
                    }
                });
            } else {
                swal({
                    text: $translate.instant('NO_DOCENTES'),
                    title: "Alerta",
                    type: "warning",
                    confirmButtonText: $translate.instant('ACEPTAR'),
                    showLoaderOnConfirm: true,
                    allowOutsideClick: false
                });
            }
        };

        /**
         * @name guardarResolucionNuxeo
         * @description 
         * Genera el documento de la resolución en formato blob y lo carga en nuexeo, posteriormente lo guarda en la tabla documento del core
         */
        self.guardarResolucionNuxeo = function () {
            resolucion.NivelAcademico_nombre = resolucion.NivelAcademico;
            var documento = pdfMakerService.getDocumento(self.contenidoResolucion, resolucion, self.contratadosPdf, self.proyectos);
            pdfMake.createPdf(documento).getBlob(function (blobDoc) {
                var aux = nuxeoClient.createDocument("ResolucionDVE" + self.idResolucion, "Resolución DVE expedida", blobDoc, function(url) {
                    var date = new Date();
                    date = moment(date).format('DD_MMM_YYYY_HH:mm:ss');
                    self.objeto_documento = {
                      "Nombre": "ResolucionDVE" + self.idResolucion,
                      "Descripcion": "Resolución de vinculación especial",
                      "TipoDocumento": {
                        "Id": 6
                      },
                      "Contenido": JSON.stringify({
                        "NombreArchivo": "Resolucion_" + self.resolucionActual.NumeroResolucion + ".pdf",
                        "FechaCreacion": date,
                        "Tipo": "Archivo",
                        "IdNuxeo": url,
                        "Observaciones": "Ninguna"
                      }),
                      "CodigoAbreviacion": "RES-DVE",
                      "Activo": true
                    };
            
                    //Post a la tabla documento del core
                    coreRequest.post('documento', self.objeto_documento).then(function(response) {
                        self.id_documento = response.data.Id;
                        console.log(self.id_documento);
                        if (self.id_documento != null && self.id_documento != undefined) {
                            swal({
                                title: $translate.instant('EXPEDIDA'),
                                text: $translate.instant('DATOS_REGISTRADOS'),
                                type: 'success',
                                allowOutsideClick: false,
                                confirmButtonText: $translate.instant('ACEPTAR')
                            }).then(function () {
                                $window.location.reload();
                            });
                        }
                    });
                });
            });
        };
        $scope.validarFecha = colombiaHolidaysService.validateDate;
    });
