// 'use strict';

// /**
//  * @ngdoc service
//  * @name contractualClienteApp.token
//  * @description
//  * # token
//  * Factory in the contractualClienteApp.
//  */


// // First, parse the query string
// var params = {},
//     queryString = location.search.substring(1),
//     regex = /([^&=]+)=([^&]*)/g,
//     m;
// while (!!(m = regex.exec(queryString))) {
//     params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
// }
// // And send the token over to the server
// var req = new XMLHttpRequest();
// // consider using POST so query isn't logged
// var query = 'https://' + window.location.host + '?' + queryString;
// req.open('GET', query, true);
// req.onreadystatechange = function(e) {
//     if (req.readyState === 4) {
//         if (req.status === 200) {
//             window.location = params.state;
//         } else if (req.status === 400) {
//             window.alert('There was an error processing the token.');
//         } else {
//             //alert('something else other than 200 was returned');
//         }
//     }
// };

// angular.module('contractualClienteApp')
//     .factory('token_service', function($location, $http, $sessionStorage, CONF, $interval) {

//         var service = {
//             session: $sessionStorage.$default(params),
//             header: null,
//             token: null,
//             setting_basic: {
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//                     "authorization": "Basic " + btoa(CONF.GENERAL.TOKEN.CLIENTE_ID + ":" + CONF.GENERAL.TOKEN.CLIENT_SECRET),
//                     "cache-control": "no-cache",
//                 }
//             },
//             setting_bearer: {
//                 headers: {}
//             },
//             config: {
//                 AUTORIZATION_URL: CONF.GENERAL.TOKEN.AUTORIZATION_URL,
//                 CLIENTE_ID: CONF.GENERAL.TOKEN.CLIENTE_ID,
//                 REDIRECT_URL: CONF.GENERAL.TOKEN.REDIRECT_URL,
//                 RESPONSE_TYPE: CONF.GENERAL.TOKEN.RESPONSE_TYPE,
//                 SCOPE: CONF.GENERAL.TOKEN.SCOPE,
//                 BUTTON_CLASS: CONF.GENERAL.TOKEN.BUTTON_CLASS,
//                 SIGN_OUT_URL: CONF.GENERAL.TOKEN.SIGN_OUT_URL,
//                 SIGN_OUT_REDIRECT_URL: CONF.GENERAL.TOKEN.SIGN_OUT_REDIRECT_URL,
//                 SIGN_OUT_APPEND_TOKEN: CONF.GENERAL.TOKEN.SIGN_OUT_APPEND_TOKEN
//             },

//             live_token: function() {
//                 if (service.session === null) {
//                     service.session = $sessionStorage.$default(params);
//                     return false;
//                 } else {
//                     if (!angular.isUndefined(service.session.id_token)) {
//                         service.header = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(service.session.id_token.split(".")[0]));
//                         service.token = KJUR.jws.JWS.readSafeJSONString(b64utoutf8(service.session.id_token.split(".")[1]));
//                         service.setting_bearer = {
//                             headers: {
//                                 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
//                                 "Authorization": "Bearer " + $sessionStorage.access_token,
//                                 "cache-control": "no-cache",
//                             }
//                         };
//                         return true;
//                     } else {}
//                 }
//             },
//             logout: function() {
//                 window.location = $location.absUrl();
//                 var url = service.config.SIGN_OUT_URL;
//                 url = url + '?id_token_hint=' + service.session.id_token;
//                 url = url + '&post_logout_redirect_uri=' + CONF.GENERAL.TOKEN.SIGN_OUT_REDIRECT_URL;
//                 service.token = null;
//                 $sessionStorage.$reset();
//                 window.location.replace(url);
//             },
//             refresh: function() {
//                 var url = CONF.GENERAL.TOKEN.REFRESH_TOKEN;
//                 var data = {};
//                 url += "?grant_type=refresh_token";
//                 url += "&refresh_token=" + $sessionStorage.refresh_token;
//                 url += "&redirect_uri=" + CONF.GENERAL.TOKEN.REDIRECT_URL;

//                 $http.post(url, data, service.setting_basic)
//                     .then(function(response) {
//                         $sessionStorage.access_token = response.data.access_token;
//                         $sessionStorage.expires_in = response.data.expires_in;
//                         $sessionStorage.id_token = response.data.id_token;
//                         $sessionStorage.refresh_token = response.data.refresh_token;
//                         $sessionStorage.expires_at = null;
//                         service.setExpiresAt();
//                     });
//             },
//             get_id_token: function() {
//                 if ((!angular.isUndefined($sessionStorage.code)) && (angular.isUndefined($sessionStorage.id_token))) {
//                     var url = CONF.GENERAL.TOKEN.REFRESH_TOKEN;
//                     var data = {};
//                     url += "?grant_type=authorization_code";
//                     url += "&code=" + $sessionStorage.code;
//                     url += "&redirect_uri=" + CONF.GENERAL.TOKEN.REDIRECT_URL;

//                     $http.post(url, data, service.setting_basic)
//                         .then(function(response) {
//                             //window.location.replace(CONF.GENERAL.TOKEN.REDIRECT_URL);
//                             location.search = "";
//                             $sessionStorage.$default(response.data);
//                             service.setExpiresAt();
//                         });
//                 }
//                 service.timer();
//             },
//             setExpiresAt: function() {
//                 if (angular.isUndefined($sessionStorage.expires_at) || $sessionStorage.expires_at === null) {
//                     var expires_at = new Date();
//                     expires_at.setSeconds(expires_at.getSeconds() + parseInt($sessionStorage.expires_in) - 60); // 60 seconds less to secure browser and response latency
//                     $sessionStorage.expires_at = expires_at;
//                 }
//             },
//             expired: function() {
//                 return (new Date($sessionStorage.expires_at) < new Date());
//             },

//             timer: function() {
//                 if (!angular.isUndefined($sessionStorage.expires_at) || $sessionStorage.expires_at === null) {
//                     $interval(function() {
//                         if (service.expired()) {
//                             service.refresh();
//                         }
//                     }, 5000);
//                 }
//             }

//         };
//         //
//         service.get_id_token();
//         return service;
//     });