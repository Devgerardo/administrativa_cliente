'use strict';
/**
 * @ngdoc function
 * @name contractualClienteApp.controller:menuCtrl
 * @description
 * # menuCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
    .controller('menuCtrl', function($location, $http, $window, $q, $scope, $rootScope, token_service, configuracionRequest, notificacion, $translate, $route, $mdSidenav) {
        var paths = [];
        $scope.language = {
            es: "btn btn-primary btn-circle btn-outline active",
            en: "btn btn-primary btn-circle btn-outline"
        };
        $scope.menu_app = [{
                id: "kronos",
                title: "KRONOS",
                url: "http://10.20.0.254/kronos"
            },
            {
                id: "agora",
                title: "AGORA",
                url: "https://pruebasfuncionarios.intranetoas.udistrital.edu.co/agora"
            }, {
                id: "argo",
                title: "ARGO",
                url: "https://pruebasfuncionarios.intranetoas.udistrital.edu.co/argo"
            }, {
                id: "arka",
                title: "ARKA",
                url: "https://pruebasfuncionarios.intranetoas.udistrital.edu.co/arka"
            }, {
                id: "temis",
                title: "TEMIS",
                url: "https://pruebasfuncionarios.intranetoas.udistrital.edu.co/gefad"
            }, {
                id: "polux",
                title: "POLUX",
                url: "http://10.20.0.254/polux"
            }, {
                id: "jano",
                title: "JANO",
                url: "http://10.20.0.254/kronos"
            }, {
                id: "kyron",
                title: "KYRON",
                url: "http://10.20.0.254/kronos"
            }, {
                id: "sga",
                title: "SGA",
                url: "http://10.20.0.254/kronos"
            }
        ];
        $scope.notificacion = notificacion;
        $scope.actual = "";
        $scope.token_service = token_service;
        $scope.breadcrumb = [];
        $scope.menu_service = [{ //aqui va el servicio de el app de configuracion
                "Id": 3,
                "Nombre": "Seguimiento y control",
                "Url": "url_nivel_1",
                "Opciones": [{
                        "Id": 1,
                        "Nombre": "Segumiento Financiero",
                        "Url": "seguimientoycontrol/financiero",
                        "Opciones": null
                    },
                    {
                        "Id": 2,
                        "Nombre": "Segumiento Legal",
                        "Url": "",
                        "Opciones": null
                    },
                    {
                        "Id": 3,
                        "Nombre": "Segumiento Tecnico",
                        "Url": "",
                        "Opciones": null
                    }
                ]
            },
            { //aqui va el servicio de el app de configuracion
                "Id": 2,
                "Nombre": "Necesidad",
                "Url": "url_nivel_1",
                "Opciones": [{
                        "Id": 3,
                        "Nombre": "Gestion de Necesidades",
                        "Url": "necesidades",
                        "Opciones": null
                    },
                    {
                        "Id": 4,
                        "Nombre": "Generación de solicitudes de necesidad",
                        "Url": "necesidad/necesidad_externa",
                        "Opciones": null
                    }
                ]
            },
            { //RP
                "Id": 1,
                "Nombre": "RP",
                "Url": "",
                "Opciones": [{ //Consulta de solicitud de RP
                    "Id": 1,
                    "Nombre": "Solicitar registro presupuestal",
                    "Url": "rp_solicitud_personas",
                    "Opciones": null
                }]
            },
            {
                "Id": 6,
                "Nombre": "Vinculación especial",
                "Url": "",
                "Opciones": [{
                        "Id": 6,
                        "Nombre": "Gestión de resoluciones",
                        "Url": "vinculacionespecial/resolucion_gestion",
                        "Opciones": null
                    },
                    {
                        "Id": 6,
                        "Nombre": "Aprobación de resoluciones",
                        "Url": "vinculacionespecial/resolucion_aprobacion",
                        "Opciones": null
                    },
                    {
                        "Id": 6,
                        "Nombre": "Administración de resoluciones",
                        "Url": "vinculacionespecial/resolucion_administracion",
                        "Opciones": null
                    }
                ]
            },
            {
                "Id": 5,
                "Nombre": "Plantillas",
                "Url": "plantillas/lista_plantillas",
                "Opciones": null
            }
        ];
        var recorrerArbol = function(item, padre) {
            var padres = "";
            for (var i = 0; i < item.length; i++) {
                if (item[i].Opciones === null) {
                    padres = padre + " , " + item[i].Nombre;
                    paths.push({
                        'path': item[i].Url,
                        'padre': padres.split(",")
                    });
                } else {
                    recorrerArbol(item[i].Opciones, padre + "," + item[i].Nombre);
                }
            }
            return padres;
        };
        $scope.perfil = "ADMINISTRADOR ARGO";

        if(token_service.live_token()){
            token_service.token.role.pop();
            var roles = token_service.token.role.toString();
            //var e_roles = roles.replace(',', '%2C');
            configuracionRequest.get('menu_opcion_padre/ArbolMenus/' + roles + '/Argo', '').then(function(response) {
               
                $rootScope.my_menu = response.data;
                /*configuracionRequest.update_menu(https://10.20.0.162:9443/store/apis/authenticate response.data);
                $scope.menu_service = configuracionRequest.get_menu();*/
            });
        }
        /*
        configuracionRequest.get('menu_opcion_padre/ArbolMenus/' + "ADMINISTRADOR_ARGO" + '/Argo', '').then(function(response) {
            $rootScope.my_menu = response.data;
          });
            /*configuracionRequest.update_menu(https://10.20.0.162:9443/store/apis/authenticate response.data);
            $scope.menu_service = configuracionRequest.get_menu();*/


        var update_url = function() {
            $scope.breadcrumb = [''];
            for (var i = 0; i < paths.length; i++) {
                if ($scope.actual === "/" + paths[i].path) {
                    $scope.breadcrumb = paths[i].padre;
                } else if ('/' === $scope.actual) {
                    $scope.breadcrumb = [''];
                }
            }
        };

        $scope.redirect_url = function(path) {
            var path_sub = path.substring(0, 4);
            switch (path_sub.toUpperCase()) {
                case "HTTP":
                    $window.open(path, "_blank");
                    break;
                default:
                    $location.path(path);
                    break;
            }
        };

        recorrerArbol($scope.menu_service, "");
        paths.push({ padre: ["", "Notificaciones", "Ver Notificaciones"], path: "notificaciones" });

        $scope.$on('$routeChangeStart', function( /*next, current*/ ) {
            $scope.actual = $location.path();
            update_url();
        });

        $scope.changeLanguage = function(key) {
            $translate.use(key);
            switch (key) {
                case 'es':
                    $scope.language.es = "btn btn-primary btn-circle btn-outline active";
                    $scope.language.en = "btn btn-primary btn-circle btn-outline";
                    break;
                case 'en':
                    $scope.language.en = "btn btn-primary btn-circle btn-outline active";
                    $scope.language.es = "btn btn-primary btn-circle btn-outline";
                    break;
                default:
            }
            $route.reload();
        };

        function buildToggler(componentId) {
            return function() {
                $mdSidenav(componentId).toggle();
            };
        }

        $scope.toggleLeft = buildToggler('left');
        $scope.toggleRight = buildToggler('right');

        //Pendiente por definir json del menu
        (function($) {
            $(document).ready(function() {
                $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $(this).parent().siblings().removeClass('open');
                    $(this).parent().toggleClass('open');
                });
            });
        })(jQuery);
});