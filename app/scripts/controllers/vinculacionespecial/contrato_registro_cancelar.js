'use strict';

/**
 * @ngdoc function
 * @name clienteApp.controller:ContratoRegistroCancelarCtrl
 * @description
 * # ContratoRegistroCancelarCtrl
 * Controller of the clienteApp
 */

angular.module('contractualClienteApp')
    .controller('ContratoRegistroCancelarCtrl', function (amazonAdministrativaRequest, administrativaRequest, adminMidRequest, oikosRequest, coreAmazonRequest, financieraRequest, sicapitalRequest, idResolucion, colombiaHolidaysService, pdfMakerService, nuxeoClient, coreRequest, $scope, $mdDialog, lista, resolucion, $translate, $window) {

        var self = this;
        self.contratoCanceladoBase = {};
        self.idResolucion = idResolucion;
        self.estado = false;
        self.cantidad = 0;
        self.maximoSemanas = 0;
        self.semanasTranscurridas = 0;
        self.fechaActa = new Date();
        self.fecha_actual = new Date();
        self.fechaFinal = new Date();
        self.esconderBoton = false;
        self.FechaExpedicion = null;

        administrativaRequest.get('resolucion/' + self.idResolucion).then(function (response) {
            self.resolucionActual = response.data;
            if (self.resolucionActual.FechaExpedicion != undefined && self.resolucionActual.FechaExpedicion !== "0001-01-01T00:00:00Z") {
                self.FechaExpedicion = new Date(self.resolucionActual.FechaExpedicion);
            }
            self.maximoSemanas = self.resolucionActual.NumeroSemanas;
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


        administrativaRequest.get("resolucion_vinculacion_docente/" + self.idResolucion).then(function (response) {
            self.datosFiltro = response.data;
            oikosRequest.get("dependencia/" + self.datosFiltro.IdFacultad.toString()).then(function (response) {
                self.sede_solicitante_defecto = response.data.Nombre;
            });
            adminMidRequest.get("gestion_desvinculaciones/docentes_cancelados", "id_resolucion=" + self.idResolucion.toString()).then(function (response) {
                self.contratados = response.data;
                var yeison = JSON.parse(JSON.stringify(self.contratados));
                self.cantidad = Object.keys(yeison).length;
                amazonAdministrativaRequest.get("acta_inicio", $.param({
                    query: 'NumeroContrato:' + self.contratados[0].NumeroContrato.String + ',Vigencia:' + self.contratados[0].Vigencia.Int64
                })).then(function (response) {
                    self.acta = response.data[0];
                });
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

        self.cancelarExpedicion = function () {
            $mdDialog.hide();
        };


        self.asignarValoresDefecto = function () {
            self.contratoCanceladoBase.Usuario = "";
            self.contratoCanceladoBase.Estado = true;
        };

        self.cancelar = function () {
            $mdDialog.hide();
        };

        self.cancelarContrato = function () {
            self.asignarValoresDefecto();
            if (self.FechaExpedicion && self.contratoCanceladoBase.MotivoCancelacion) {
                swal({
                    title: $translate.instant('EXPEDIR'),
                    text: $translate.instant('SEGURO_EXPEDIR'),
                    html: '<p><b>' + $translate.instant('NUMERO') + ': </b>' + resolucion.Numero.toString() + '</p>' +
                        '<p><b>' + $translate.instant('FACULTAD') + ': </b>' + resolucion.Facultad + '</p>' +
                        '<p><b>' + $translate.instant('NIVEL_ACADEMICO') + ': </b>' + resolucion.NivelAcademico + '</p>' +
                        '<p><b>' + $translate.instant('DEDICACION') + ': </b>' + resolucion.Dedicacion + '</p>' +
                        '<p><b>' + $translate.instant('NUMERO_CANCELACIONES') + ': </b>' + self.cantidad + '</p>',
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: $translate.instant('ACEPTAR'),
                    cancelButtonText: $translate.instant('CANCELAR'),
                    confirmButtonClass: 'btn btn-success',
                    cancelButtonClass: 'btn btn-danger',
                    buttonsStyling: false,
                    allowOutsideClick: false
                }).then(function () {
                    if (self.FechaExpedicion && self.contratoCanceladoBase.MotivoCancelacion) {
                        self.expedirCancelar();
                    } else {
                        swal({
                            text: $translate.instant('COMPLETE_CAMPOS'),
                            type: 'error'
                        });
                    }
                }, function (dismiss) {
                    if (dismiss === 'cancel') {
                        swal({
                            text: $translate.instant('EXPEDICION_NO_REALIZADA'),
                            type: 'error'
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

        self.expedirCancelar = function () {
            self.estado = true;
            self.esconderBoton = true;
            var conjuntoContratos = [];
            if (self.contratados) {
                self.contratados.forEach(function (contratado) {
                    var contratoCancelado = JSON.parse(JSON.stringify(self.contratoCanceladoBase));
                    contratoCancelado.NumeroContrato = contratado.NumeroContrato.String;
                    contratoCancelado.Vigencia = contratado.Vigencia.Int64;
                    var CancelacionContrato = {
                        ContratoCancelado: contratoCancelado,
                        VinculacionDocente: {
                            Id: parseInt(contratado.Id),
                            NumeroSemanasNuevas: contratado.NumeroSemanasNuevas }
                    };
                    conjuntoContratos.push(CancelacionContrato);
                });
                var expedicionResolucion = {
                    Vinculaciones: conjuntoContratos,
                    idResolucion: self.idResolucion,
                    FechaExpedicion: self.FechaExpedicion
                };
                resolucion.FechaExpedicion = self.FechaExpedicion;
                adminMidRequest.post("expedir_resolucion/cancelar", expedicionResolucion).then(function () {
                    self.estado = false;
                    self.guardarResolucionNuxeo();
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

        self.cancelados = {
            paginationPageSizes: [10, 15, 20],
            paginationPageSize: 10,
            enableSorting: true,
            enableFiltering: true,
            enableRowSelection: false,
            enableRowHeaderSelection: false,
            columnDefs: [
                { field: 'NombreCompleto', width: '22%', displayName: $translate.instant('NOMBRE') },
                { field: 'IdPersona', width: '13%', displayName: $translate.instant('DOCUMENTO_DOCENTES') },
                { field: 'Categoria', width: '10%', displayName: $translate.instant('CATEGORIA') },
                { field: 'NumeroHorasSemanales', width: '12%', displayName: $translate.instant('HORAS_SEMANALES') },
                { field: 'NumeroSemanas', width: '12%', displayName: $translate.instant('SEMANAS_REV') },
                { field: 'NumeroDisponibilidad', width: '9%', displayName: $translate.instant('NUM_DISPO_DOCENTE') },
                { field: 'NumeroRp', width: '7%', displayName: $translate.instant('NUMERO_REGISTRO_PRESUPUESTAL') },
                { field: 'ValorContrato', width: '15%', displayName: $translate.instant('VALOR_CONTRATO_REV'), cellClass: "valorEfectivo", cellFilter: "currency" }
            ]
        };

        //Función para visualizar docentes para cancelar su vinculacion resolución
        self.get_docentes_cancelados = function () {
            self.estado = true;
            self.info_desvincular = !self.info_desvincular;
            adminMidRequest.get("gestion_desvinculaciones/docentes_desvinculados", "id_resolucion=" + self.idResolucion).then(function (response) {
                self.cancelados.data = response.data;
            });
        };

        self.get_docentes_cancelados();

        /**
         * @name guardarResolucionNuxeo
         * @description 
         * Genera el documento de la resolución en formato blob y lo carga en nuexeo, posteriormente lo guarda en la tabla documento del core
         */
        self.guardarResolucionNuxeo = function () {
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
                                text: $translate.instant('DATOS_CANCELADOS'),
                                type: 'success',
                                confirmButtonText: $translate.instant('ACEPTAR'),
                                allowOutsideClick: false
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
