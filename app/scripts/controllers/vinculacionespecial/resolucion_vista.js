'use strict';

/**
* @ngdoc function
* @name clienteApp.controller:ResolucionVistaCtrl
* @description
* # ResolucionVistaCtrl
* Controller of the clienteApp
*/
angular.module('contractualClienteApp')
  .controller('ResolucionVistaCtrl', function (administrativaRequest, oikosRequest, coreRequest, adminMidRequest, pdfMakerService, nuxeoClient, $mdDialog, $scope, $http, $translate) {

    var self = this;
    self.resolucion = JSON.parse(localStorage.getItem("resolucion"));

    /**
     * @name generarDocumentoPdfMake
     * @description
     * Realiza las consultas necesarias para armar el pdf con la información de las tablas resolucion y vinculacion_docente
     */
    self.generarDocumentoPdfMake = function () {
      if (self.resolucion.FechaExpedicion != undefined && self.resolucion.FechaExpedicion !== "0001-01-01T00:00:00Z") {
        self.resolucion.FechaExpedicion = new Date(self.resolucion.FechaExpedicion);
      }

      self.proyectos = [];
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
    };

    
    /**
     * @name generarResolucion
     * @description 
     * Arma el documento con la información consultada y utiliza la herramienta pdfMake para mostrarlo
     */
    self.generarResolucion = function () {
      var documento = pdfMakerService.getDocumento(self.contenidoResolucion, self.resolucion, self.contratados, self.proyectos);
      //Se hace uso de la libreria pdfMake para generar el documento y se asigna a la etiqueta con el id vistaPDF
      pdfMake.createPdf(documento).getDataUrl(function (outDoc) {
        document.getElementById('vistaPDF').src = outDoc;
      });
    };

    /**
     * @name consultarDocumentoNuxeo
     * @description
     * Consulta la tabla documento para buscar el id con que fue guardada la resolución en nuxeo y posteriormente lo busca para mostrarlo
     */
    self.consultarDocumentoNuxeo = function () {
      coreRequest.get('documento', $.param ({
        query: "Nombre:ResolucionDVE" + self.resolucion.Id,
        limit:0
      })).then(function(response) {
        if (response.data !== null) {
          var documentoResolucion = response.data[0];
          var idNuxeoResolucion = JSON.parse(documentoResolucion.Contenido).IdNuxeo;
          nuxeoClient.getDocument(idNuxeoResolucion).then(function(doc) {
            document.getElementById('vistaPDF').src = doc.url;
          });
        } else {
          self.generarDocumentoPdfMake();      
        }
      });
    };

    if (self.resolucion.Estado === "Expedida") {
      self.consultarDocumentoNuxeo();
    } else {
      self.generarDocumentoPdfMake();
    }

  });