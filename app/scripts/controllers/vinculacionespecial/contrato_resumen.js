'use strict';

/**
 * @ngdoc function
 * @name contractualClienteApp.controller:ContratoResumenCtrl
 * @description
 * # ContratoResumenCtrl
 * Controller of the contractualClienteApp
 */
angular.module('contractualClienteApp')
  .controller('ContratoResumenCtrl', function ($scope, $translate, amazonAdministrativaRequest, coreRequest, oikosRequest, adminMidRequest, idResolucion, $mdDialog) {

    var self = this;

    self.idResolucion = idResolucion;

    self.precontratados = {
      paginationPageSizes: [10, 15, 20],
      paginationPageSize: 10,
      enableSorting: true,
      enableFiltering: true,
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      columnDefs: [
        { field: 'Id', visible: false },
        { field: 'NombreCompleto', width: '25%', displayName: $translate.instant('NOMBRE') },
        { field: 'Documento', displayName: $translate.instant('CEDULA') },
        { field: 'Expedicion', displayName: $translate.instant('EXPEDICION') },
        { field: 'Categoria', displayName: $translate.instant('CATEGORIA') },
        { field: 'Dedicacion', displayName: $translate.instant('DEDICACION') },
        { field: 'HorasSemanales', displayName: $translate.instant('HORAS_SEMANALES') },
        { field: 'Semanas', displayName: $translate.instant('SEMANAS') },
        { field: 'ValorContrato', displayName: $translate.instant('VALOR_CONTRATO'), cellClass: "valorEfectivo" },
        {
          field: 'ProyectoCurricular', visible: false, filter: {
            noTerm: true,
            condition: function (searchTerm, cellValue) {
              return (cellValue === self.getNumeroProyecto(self.selectedIndex));
            }
          }
        }
      ]
    };

    self.refresh = function () {
      self.precontratados.data = JSON.parse(JSON.stringify(self.precontratados.data));
    };

    amazonAdministrativaRequest.get("resolucion_vinculacion_docente/" + self.idResolucion).then(function (response) {
      self.datosFiltro = response.data;
      self.datosFiltro.IdFacultad = self.datosFiltro.IdFacultad.toString();
      oikosRequest.get("proyecto_curricular/" + self.datosFiltro.NivelAcademico.toLowerCase() + "/" + self.datosFiltro.IdFacultad).then(function (response) {
        if (response.data === null) {
          oikosRequest.get("facultad/" + self.datosFiltro.IdFacultad).then(function (response) {
            self.proyectos = [response.data];
          });
        } else {
          self.proyectos = response.data;
        }
      });
      amazonAdministrativaRequest.get("precontratado/" + self.idResolucion.toString()).then(function (response) {
        self.precontratados.data = response.data;
        if (self.precontratados.data) {
          self.precontratados.data.forEach(function (row) {
            adminMidRequest.get("calculo_salario/Contratacion/" + row.Id).then(function (response) {
              row.ValorContrato = self.FormatoNumero(response.data, 0);
            });
            row.NombreCompleto = row.PrimerNombre + ' ' + row.SegundoNombre + ' ' + row.PrimerApellido + ' ' + row.SegundoApellido;
          });
        }
      });
    });

    self.getNumeroProyecto = function (num) {
      if (self.proyectos[num]) {
        return self.proyectos[num].Id;
      } else {
        return 0;
      }
    };

    self.FormatoNumero = function (amount, decimals) {

      amount += '';
      amount = parseFloat(amount.replace(/[^0-9\.]/g, ''));

      decimals = decimals || 0;

      if (isNaN(amount) || amount === 0) {
        return parseFloat(0).toFixed(decimals);
      }

      amount = '' + amount.toFixed(decimals);

      var amount_parts = amount.split('.'),
        regexp = /(\d+)(\d{3})/;

      while (regexp.test(amount_parts[0])) {
        amount_parts[0] = amount_parts[0].replace(regexp, '$1' + ',' + '$2');
      }

      return amount_parts.join('.');
    };

    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

  });
