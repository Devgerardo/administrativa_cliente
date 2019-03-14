'use strict';

/**
 * @ngdoc overview
 * @name implicitToken
 * @description
 * # implicitToken
 * Service in the implicitToken.
 */
// First, parse the query string
if (window.localStorage.getItem('access_token') === null ||
  window.localStorage.getItem('access_token') === undefined) {
  var params = {},
    queryString = location.hash.substring(1),
    regex = /([^&=]+)=([^&]*)/g;
  var m;
  while ((m = regex.exec(queryString)) !== null) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  // And send the token over to the server
  var req = new XMLHttpRequest();
  // consider using POST so query isn't logged
  var query = 'https://' + window.location.host + '?' + queryString;
  // console.log(query);
  req.open('GET', query, true);
  if (params.id_token !== null && params.id_token !== undefined) {
    window.localStorage.setItem('access_token', params.access_token);
    window.localStorage.setItem('id_token', params.id_token);
    window.localStorage.setItem('state', params.state);
    window.localStorage.setItem('expires_in', params.expires_in);
  } else {
    window.localStorage.clear();
  }
  req.onreadystatechange = function(e) {
    if (req.readyState === 4) {
      if (req.status === 200) {
        //console.log("Status: Ok", e);
      } else if (req.status === 400) {
        console.log("Status: Bad request", e);
      } else {
        console.log("Status: Not recognizable", e);
      }
    }
  };
}


angular.module('implicitToken', [])
  .factory('token_service', function($q, CONF, md5, $interval, autenticacionMidRequest) {

    var service = {
      //session: $localStorage.default(params),
      header: null,
      token: null,
      logout_url: null,
      loaded_data:false,
      getLoginData: function() {
        //Para  llamar el api de autenticacion
        var deferred = $q.defer();
        if (window.localStorage.getItem('access_token') !== null &&
          window.localStorage.getItem('access_token') !== undefined) {
          if (window.localStorage.getItem('access_code') === null ||
            window.localStorage.getItem('access_code') === undefined) {
            var appUserInfo = JSON.parse(atob(window.localStorage.getItem('id_token').split('.')[1]));
            var appUserDocument;
            var appUserRole;
            var emailInfo = {
              //Email: "karianov@correo.udistrital.edu.co"
              Email: appUserInfo.sub,
              Rol: appUserInfo.role,
              Documento: appUserInfo.documento
            };
            autenticacionMidRequest.post("token/emailToken", emailInfo, {
                headers: {
                  'Accept': 'application/json',
                  "Authorization": "Bearer " + window.localStorage.getItem('access_token'),
                }
              })
              .then(function(respuestaAutenticacion) {
                //console.log("Respuesta del mid de autentiación:", respuestaAutenticacion);
                appUserDocument = respuestaAutenticacion.data.Codigo; 
                appUserRole = respuestaAutenticacion.data.Rol;            
                window.localStorage.setItem('access_code', btoa(JSON.stringify(appUserDocument)));
                window.localStorage.setItem('access_role', btoa(JSON.stringify(appUserRole)));
                //console.log("appUserDocument", respuestaAutenticacion.data.Codigo)
                deferred.resolve(true);
              })
              .catch(function(excepcionAutenticacion) {
                console.log("Excepción durante la autentiación:", excepcionAutenticacion);
                //service.logout();
              });
          } else {
            deferred.resolve(true);
          }
        } else {
          deferred.resolve(true);
        }
        return deferred.promise;
      },
      generateState: function() {
        var text = ((Date.now() + Math.random()) * Math.random()).toString().replace('.', '');
        return md5.createHash(text);
      },
      setting_bearer: {
        headers: {}
      },
      getHeader: function() {
        service.setting_bearer = {
          headers: {
            'Accept': 'application/json',
            "Authorization": "Bearer " + window.localStorage.getItem('access_token'),
          }
        };
        return service.setting_bearer;
      },
      login: function() {
        if (!CONF.GENERAL.TOKEN.nonce) {
          CONF.GENERAL.TOKEN.nonce = service.generateState();
        }
        if (!CONF.GENERAL.TOKEN.state) {
          CONF.GENERAL.TOKEN.state = service.generateState();
        }
        var url = CONF.GENERAL.TOKEN.AUTORIZATION_URL + '?' +
          'client_id=' + encodeURIComponent(CONF.GENERAL.TOKEN.CLIENTE_ID) + '&' +
          'redirect_uri=' + encodeURIComponent(CONF.GENERAL.TOKEN.REDIRECT_URL) + '&' +
          'response_type=' + encodeURIComponent(CONF.GENERAL.TOKEN.RESPONSE_TYPE) + '&' +
          'scope=' + encodeURIComponent(CONF.GENERAL.TOKEN.SCOPE);
        if (CONF.GENERAL.TOKEN.nonce) {
          url += '&nonce=' + encodeURIComponent(CONF.GENERAL.TOKEN.nonce);
        }
        url += '&state=' + encodeURIComponent(CONF.GENERAL.TOKEN.state);
        window.location = url;
        return url;
      },
      live_token: function() {
        if (window.localStorage.getItem('id_token') === 'undefined' || window.localStorage.getItem('id_token') === null || service.logoutValid()) {
          service.login();
          return false;
        } else {
          service.setting_bearer = {
            headers: {
              'Accept': 'application/json',
              "Authorization": "Bearer " + window.localStorage.getItem('access_token'),
            }
          };
          service.logout_url = CONF.GENERAL.TOKEN.SIGN_OUT_URL;
          service.logout_url += '?id_token_hint=' + window.localStorage.getItem('id_token');
          service.logout_url += '&post_logout_redirect_uri=' + CONF.GENERAL.TOKEN.SIGN_OUT_REDIRECT_URL;
          service.logout_url += '&state=' + window.localStorage.getItem('state');
          return true;
        }
      },
      getPayload: function() {
        var id_token = window.localStorage.getItem('id_token').split('.');
        return JSON.parse(atob(id_token[1]));
      },
      // Contiene el documento para las búsquedas
      getAppPayload: function() {
        var id_token = window.localStorage.getItem('id_token').split('.');
        var access_code = window.localStorage.getItem('access_code');
        var access_role = window.localStorage.getItem('access_role');
        var data = JSON.parse(atob(id_token[1]));
        data.appUserDocument = JSON.parse(atob(access_code));
        data.appUserRole = JSON.parse(atob(access_role));
        return data;
      },
      logout: function() {
        window.location.replace(service.logout_url);
      },
      expired: function() {
        return (new Date(window.localStorage.getItem('expires_at')) < new Date());
      },

      setExpiresAt: function() {
        if (angular.isUndefined(window.localStorage.getItem('expires_at')) || window.localStorage.getItem('expires_at') === null) {
          var expires_at = new Date();
          expires_at.setSeconds(expires_at.getSeconds() + parseInt(window.localStorage.getItem('expires_in')) - 60); // 60 seconds less to secure browser and response latency
          window.localStorage.setItem('expires_at', expires_at);
        }
      },

      timer: function() {
        if (!angular.isUndefined(window.localStorage.getItem('expires_at')) || window.localStorage.getItem('expires_at') === null) {
          $interval(function() {
            if (service.expired()) {
              window.localStorage.clear();
            }
          }, 5000);
        }
      },

      logoutValid: function() {
        var state;
        var valid = true;
        var queryString = location.search.substring(1);
        var regex = /([^&=]+)=([^&]*)/g;
        var m;
        while (!!(m = regex.exec(queryString))) {
          state = decodeURIComponent(m[2]);
        }
        if (window.localStorage.getItem('state') === state) {
          window.localStorage.clear();
        } else {
          valid = false;
        }
        return valid;
      }
    };
    service.setExpiresAt();
    service.timer();
    return service;
});