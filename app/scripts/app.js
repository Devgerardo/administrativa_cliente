'use strict';

/**
 * @ngdoc overview
 * @name contractualClienteApp
 * @description
 * # contractualClienteApp
 *
 * Main module of the application.
 */
angular
    .module('contractualClienteApp', [
        // Librerias
        'ngCookies',
        'angular-loading-bar',
        'ngAnimate',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        //'ngSanitize',
        'afOAuth2',
        'treeControl',
        'ngMaterial',
        'ui.grid',
        'ui.grid.edit',
        'ui.grid.rowEdit',
        'ui.grid.cellNav',
        'ui.grid.treeView',
        'ui.grid.selection',
        'ui.grid.pagination',
        'ui.grid.exporter',
        'ui.grid.autoResize',
        'ui.grid.exporter',
        'ui.grid.expandable',
        'ui.grid.pinning',
        'ngStorage',
        'ngWebSocket',
        'angularMoment',
        'ui.utils.masks',
        'pascalprecht.translate',
        'nvd3',
        'ui.knob',
        'file-model',
        'angularBootstrapFileinput',
        // Servicios
        'financieraService',
        'coreService',
        'coreAmazonService',
        'administrativaService',
        'agoraService',
        'oikosService',
        'oikosAmazonService',
        'financieraMidService',
        'adminMidService',
        'sicapitalService',
        'titan_service',
        'amazonAdministrativaService',
        'academicaService',
        'contratoService',
        'gridOptionsService',
        'configuracionService',
        'requestService',
        'gridApiService',
        'colombiaHolidaysService',
        'nuxeoClient'
    ])
    .run(function(amMoment) {
        amMoment.changeLocale('es');
    })
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
        cfpLoadingBarProvider.spinnerTemplate = '<div class="loading-div"><div><span class="fa loading-spinner"></div><div class="fa sub-loading-div">Por favor espere, cargando...</div></div>';
    }])
    .config(function($mdDateLocaleProvider) {
        $mdDateLocaleProvider.formatDate = function(date) {
            return date ? moment.utc(date).format('YYYY-MM-DD') : '';
        };
    })
    .config(['$locationProvider', '$routeProvider' ,'$httpProvider', function($locationProvider, $routeProvider, $httpProvider) {
    
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $locationProvider.hashPrefix(""); 
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/notificaciones', {
                templateUrl: 'views/notificaciones.html',
                controller: 'NotificacionesCtrl',
                controllerAs: 'notificaciones'

            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                controllerAs: 'about'
            })
            .when('/necesidad/solicitud_necesidad/:IdNecesidad?', {
                templateUrl: 'views/necesidad/solicitud_necesidad.html',
                controller: 'SolicitudNecesidadCtrl',
                controllerAs: 'solicitudNecesidad'
            })
            .when('/necesidades', {
                templateUrl: 'views/necesidad/necesidades.html',
                controller: 'NecesidadesCtrl',
                controllerAs: 'necesidades'
            })
            .when('/necesidad/necesidad-pdf/:IdNecesidad?', {
                templateUrl: 'views/necesidad/pdfnecesidad.html',
                controller: 'PdfnecesidadCtrl',
                controllerAs: 'necesidadPdf'
            })
            .when('/necesidad/necesidad_reportes', {
                templateUrl: 'views/necesidad/necesidad_reportes.html',
                controller: 'NecesidadReportesCtrl',
                controllerAs: 'necesidadReportes'
            })
            .when('/rp_solicitud_personas', {
                templateUrl: 'views/rp/rp_solicitud_personas.html',
                controller: 'RpSolicitudPersonasCtrl',
                controllerAs: 'rpSolicitudPersonas'
            })
            .when('/rp/rp_solicitud/', {
                templateUrl: 'views/rp/rp_solicitud.html',
                controller: 'RpSolicitudCtrl',
                controllerAs: 'rpSolicitud'
            })
            .when('/seguimientoycontrol/financiero', {
                templateUrl: 'views/seguimientoycontrol/financiero.html',
                controller: 'SeguimientoycontrolFinancieroCtrl',
                controllerAs: 'sFinanciero'
            })
            .when('/seguimientoycontrol/financiero/contrato', {
                templateUrl: 'views/seguimientoycontrol/financiero/contrato.html',
                controller: 'SeguimientoycontrolFinancieroContratoCtrl',
                controllerAs: 'sFcontrato'
            })
            .when('/seguimientoycontrol/financiero/ordenes_pago', {
                templateUrl: 'views/seguimientoycontrol/financiero/ordenes_pago.html',
                controller: 'SeguimientoycontrolFinancieroOrdenesPagoCtrl',
                controllerAs: 'sFordenesPago'
            })
            .when('/seguimientoycontrol/financiero/estadisticas', {
                templateUrl: 'views/seguimientoycontrol/financiero/estadisticas.html',
                controller: 'SeguimientoycontrolFinancieroEstadisticasCtrl',
                controllerAs: 'sFestadisticas'
            })
            .when('/vinculacionespecial/resolucion_generacion', {
                templateUrl: 'views/vinculacionespecial/resolucion_generacion.html',
                controller: 'ResolucionGeneracionCtrl',
                controllerAs: 'resolucionGeneracion'
            })
            .when('/vinculacionespecial/resolucion_cancelacion', {
                templateUrl: 'views/vinculacionespecial/resolucion_cancelacion.html',
                controller: 'ResolucionCancelacionCtrl',
                controllerAs: 'resolucionCancelacion'
            })
            .when('/vinculacionespecial/resolucion_cancelacion_detalle', {
                templateUrl: 'views/vinculacionespecial/resolucion_cancelacion_detalle.html',
                controller: 'ResolucionCancelacionDetalleCtrl',
                controllerAs: 'resolucionCancelacionDetalle'
            })
            .when('/vinculacionespecial/resolucion_adicion', {
                templateUrl: 'views/vinculacionespecial/resolucion_adicion.html',
                controller: 'ResolucionAdicionCtrl',
                controllerAs: 'resolucionAdicion'
            })
            .when('/vinculacionespecial/resolucion_reduccion', {
                templateUrl: 'views/vinculacionespecial/resolucion_reduccion.html',
                controller: 'ResolucionReduccionCtrl',
                controllerAs: 'resolucionReduccion'
            })
            .when('/vinculacionespecial/resolucion_adicion_detalle', {
                templateUrl: 'views/vinculacionespecial/resolucion_adicion_detalle.html',
                controller: 'ResolucionAdicionDetalleCtrl',
                controllerAs: 'resolucionAdicionDetalle'
            })
            .when('/vinculacionespecial/resolucion_reduccion_detalle', {
                templateUrl: 'views/vinculacionespecial/resolucion_reduccion_detalle.html',
                controller: 'ResolucionReduccionDetalleCtrl',
                controllerAs: 'resolucionReduccionDetalle'
            })
            .when('/vinculacionespecial/hojas_de_vida_seleccion', {
                templateUrl: 'views/vinculacionespecial/hojas_de_vida_seleccion.html',
                controller: 'HojasDeVidaSeleccionCtrl',
                controllerAs: 'hojasDeVidaSeleccion'
            })
            .when('/vinculacionespecial/contrato_registro', {
                templateUrl: 'views/vinculacionespecial/contrato_registro.html',
                controller: 'ContratoRegistroCtrl',
                controllerAs: 'contratoRegistro'
            })
            .when('/vinculacionespecial/contrato_registro_horas', {
                templateUrl: 'views/vinculacionespecial/contrato_registro_horas.html',
                controller: 'ContratoRegistroHorasCtrl',
                controllerAs: 'contratoRegistroHoras'
            })
            .when('/vinculacionespecial/contrato_registro_cancelar', {
                templateUrl: 'views/vinculacionespecial/contrato_registro_cancelar.html',
                controller: 'ContratoRegistroCancelarCtrl',
                controllerAs: 'contratoRegistroCancelar'
            })
            .when('/vinculacionespecial/resolucion_reportes', {
                templateUrl: 'views/vinculacionespecial/resolucion_reportes.html',
                controller: 'ResolucionReportesCtrl',
                controllerAs: 'resolucionReportes'
            })
            .when('/vinculacionespecial/resolucion_gestion', {
                templateUrl: 'views/vinculacionespecial/resolucion_gestion.html',
                controller: 'ResolucionGestionCtrl',
                controllerAs: 'resolucionGestion'
            })
            .when('/vinculacionespecial/resolucion_detalle', {
                templateUrl: 'views/vinculacionespecial/resolucion_detalle.html',
                controller: 'ResolucionDetalleCtrl',
                controllerAs: 'resolucionDetalle'
            })
            .when('/vinculacionespecial/resolucion_vista', {
                templateUrl: 'views/vinculacionespecial/resolucion_vista.html',
                controller: 'ResolucionVistaCtrl',
                controllerAs: 'resolucionVista'
            })
            .when('/vinculacionespecial/resolucion_administracion', {
                templateUrl: 'views/vinculacionespecial/resolucion_administracion.html',
                controller: 'ResolucionAdministracionCtrl',
                controllerAs: 'resolucionAdministracion'
            })
            .when('/vinculacionespecial/resolucion_aprobacion', {
                templateUrl: 'views/vinculacionespecial/resolucion_aprobacion.html',
                controller: 'ResolucionAprobacionCtrl',
                controllerAs: 'resolucionAprobacion'
            })
            .when('/plantillas/generacion_minuta', {
                templateUrl: 'views/plantillas/generacion_plantilla.html',
                controller: 'GeneracionPlantillaCtrl',
                controllerAs: 'generacionPlantilla'
            })
            .when('/plantillas/lista_plantillas', {
                templateUrl: 'views/plantillas/lista_plantillas.html',
                controller: 'ListaPlantillasCtrl',
                controllerAs: 'listaPlantillas'
            })
            .when('/necesidad/necesidad_externa', {
                templateUrl: 'views/necesidad/necesidad_externa.html',
                controller: 'NecesidadExternaCtrl',
                controllerAs: 'necesidadExterna'
            })
            .when('/necesidad/necesidad_contratacion_docente', {
                templateUrl: 'views/necesidad/necesidad_contratacion_docente.html',
                controller: 'NecesidadContratacionDocenteCtrl',
                controllerAs: 'necesidadContratacionDocente'
            })
            .when('/seguimientoycontrol/legal', {
              templateUrl: 'views/seguimientoycontrol/legal.html',
              controller: 'SeguimientoycontrolLegalCtrl',
              controllerAs: 'sLegal'
            })
            .when('/seguimientoycontrol/legal/acta_inicio/:contrato_id/:contrato_vigencia', {
              templateUrl: 'views/seguimientoycontrol/legal/acta_inicio.html',
              controller: 'SeguimientoycontrolLegalActaInicioCtrl',
              controllerAs: 'sLactaInicio'
            })
            .when('/seguimientoycontrol/legal/acta_suspension/:contrato_id/:contrato_vigencia', {
              templateUrl: 'views/seguimientoycontrol/legal/acta_suspension.html',
              controller: 'SeguimientoycontrolLegalActaSuspensionCtrl',
              controllerAs: 'sLactaSuspension'
            })
            .when('/seguimientoycontrol/legal/acta_reinicio/:contrato_id/:contrato_vigencia', {
              templateUrl: 'views/seguimientoycontrol/legal/acta_reinicio.html',
              controller: 'SeguimientoycontrolLegalActaReinicioCtrl',
              controllerAs: 'sLactaReinicio'
            })
            .when('/seguimientoycontrol/legal/acta_cesion/:contrato_id/:contrato_vigencia', {
              templateUrl: 'views/seguimientoycontrol/legal/acta_cesion.html',
              controller: 'SeguimientoycontrolLegalActaCesionCtrl',
              controllerAs: 'sLactaCesion'
            })
            .when('/seguimientoycontrol/legal/acta_adicion_prorroga/:contrato_id/:contrato_vigencia', {
              templateUrl: 'views/seguimientoycontrol/legal/acta_adicion_prorroga.html',
              controller: 'SeguimientoycontrolLegalActaAdicionProrrogaCtrl',
              controllerAs: 'sLactaAdicionProrroga'
            })
            .when('/seguimientoycontrol/legal/acta_liquidacion', {
              templateUrl: 'views/seguimientoycontrol/legal/acta_liquidacion.html',
              controller: 'SeguimientoycontrolLegalActaLiquidacionCtrl',
              controllerAs: 'sLactaLiquidacion'
            })
            .when('/seguimientoycontrol/legal/acta_terminacion_liquidacion_bilateral/:contrato_id/:contrato_vigencia', {
              templateUrl: 'views/seguimientoycontrol/legal/acta_terminacion_liquidacion_bilateral.html',
              controller: 'SeguimientoycontrolLegalActaTerminacionLiquidacionBilateralCtrl',
              controllerAs: 'sLactaTerminacionAnticipada'
            })
            .when('/seguimientoycontrol/legal/novedad_otro_si_aclaratorio', {
              templateUrl: 'views/seguimientoycontrol/legal/novedad_otro_si_aclaratorio.html',
              controller: 'SeguimientoycontrolLegalNovedadOtroSiAclaratorioCtrl',
              controllerAs: 'sLotroSiAclaratorio'
            })
            .when('/seguimientoycontrol/legal/novedad_otro_si_modificatorio', {
              templateUrl: 'views/seguimientoycontrol/legal/novedad_otro_si_modificatorio.html',
              controller: 'SeguimientoycontrolLegalNovedadOtroSiModificatorioCtrl',
              controllerAs: 'sLotroSiModificatorio'
            })
            .when('/seguimientoycontrol/tecnico/aprobacion_coordinador/:docid', {
              templateUrl: 'views/seguimientoycontrol/tecnico/aprobacion_coordinador.html',
              controller: 'AprobacionCoordinadorCtrl',
              controllerAs: 'aprobacionCoordinador'
            })
            .when('/seguimientoycontrol/tecnico/aprobacion_documentos/:docid', {
              templateUrl: 'views/seguimientoycontrol/tecnico/aprobacion_documentos.html',
              controller: 'AprobacionDocumentosCtrl',
              controllerAs: 'aprobacionDocumentos'
            })
            .when('/seguimientoycontrol/tecnico/aprobacion_pago/:docid', {
              templateUrl: 'views/seguimientoycontrol/tecnico/aprobacion_pago.html',
              controller: 'AprobacionPagoCtrl',
              controllerAs: 'aprobacionPago'
            })
            .when('/seguimientoycontrol/tecnico/carga_documentos_docente/:docid', {
              templateUrl: 'views/seguimientoycontrol/tecnico/carga_documentos_docente.html',
              controller: 'CargaDocumentosDocenteCtrl',
              controllerAs: 'cargaDocumentosDocente'
            })
            .when('/seguimientoycontrol/tecnico/carga_documentos_contratista', {
              templateUrl: 'views/seguimientoycontrol/tecnico/carga_documentos_contratista.html',
              controller: 'cargaDocumentosContratistaCtrl',
              controllerAs: 'cargaDocumentosContratista'
            })
            .when('/seguimientoycontrol/tecnico/aprobacion_supervisor', {
              templateUrl: 'views/seguimientoycontrol/tecnico/aprobacion_supervisor.html',
              controller: 'AprobacionSupervisorCtrl',
              controllerAs: 'aprobacionSupervisor'
            })
            .when('/seguimientoycontrol/tecnico/aprobacion_ordenador', {
              templateUrl: 'views/seguimientoycontrol/tecnico/aprobacion_ordenador.html',
              controller: 'AprobacionOrdenadorCtrl',
              controllerAs: 'aprobacionOrdenador'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
