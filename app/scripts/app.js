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
        'ngStorage',
        'ngWebSocket',
        'angularMoment',
        'ui.utils.masks',
        'pascalprecht.translate',
        'nvd3',
        'ui.grid.expandable',
        'ui.grid.pinning',
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
        'implicitToken',
        //'planTrabajoService'
        //'planTrabajoMidService',
    ])
    .run(function(amMoment) {
        amMoment.changeLocale('es');
    })
    .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    }])
    .config(function($mdDateLocaleProvider) {
        $mdDateLocaleProvider.formatDate = function(date) {
            return date ? moment.utc(date).format('YYYY-MM-DD') : '';
        };
    })
    .config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
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
            .when('/seguimientoycontrol/plan_trabajo_docente/carga_documentos_docente', {
              templateUrl: 'views/seguimientoycontrol/plan_trabajo_docente/carga_documentos_docente.html',
              controller: 'SeguimientoycontrolPlanTrabajoDocenteCargaDocumentosDocenteCtrl',
              controllerAs: 'planTrabajoDocenteCargaDocumentos'
            })
            .when('/seguimientoycontrol/plan_trabajo_docente/aprobacion_coordinador_plan_trabajo', {
              templateUrl: 'views/seguimientoycontrol/plan_trabajo_docente/aprobacion_coordinador_plan_trabajo.html',
              controller: 'SeguimientoycontrolPlanTrabajoDocenteAprobacionCoordinadorPlanTrabajoCtrl',
              controllerAs: 'aprobacionCoordinadorPlanTrabajo'
            })
            .when('/seguimientoycontrol/plan_trabajo_docente/aprobacion_decano', {
              templateUrl: 'views/seguimientoycontrol/plan_trabajo_docente/aprobacion_decano.html',
              controller: 'SeguimientoycontrolPlanTrabajoDocenteAprobacionDecanoCtrl',
              controllerAs: 'aprobacionDecanoPlanTrabajo'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
