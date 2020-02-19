'use strict';

angular.module('contractualClienteApp')
  .controller('ResolucionCancelacionDetalleCtrl', function (administrativaRequest, financieraRequest, resolucion, adminMidRequest, oikosRequest, $localStorage, $scope, $mdDialog, $translate, $window) {

    var self = this;

    self.resolucionVieja = {};
    self.resolucionNueva = JSON.parse(localStorage.getItem("resolucion"));
    self.estado = false;
    self.proyectos = [];
    self.fecha = new Date();
    var desvinculacionesData = [];

    self.precontratados = {
      paginationPageSizes: [10, 15, 20],
      paginationPageSize: 10,
      enableRowSelection: false,
      enableRowHeaderSelection: false,
      enableFiltering: true,
      enableHorizontalScrollbar: 0,
      enableVerticalScrollbar: true,
      useExternalPagination: false,
      enableSelectAll: false,
      columnDefs: [
        { field: 'Id', visible: false },
        { field: 'NombreCompleto', width: '15%', displayName: $translate.instant('NOMBRE') },
        { field: 'IdPersona', width: '10%', displayName: $translate.instant('DOCUMENTO_DOCENTES') },
        { field: 'Categoria', width: '10%', displayName: $translate.instant('CATEGORIA') },
        { field: 'IdDedicacion.NombreDedicacion', width: '10%', displayName: $translate.instant('DEDICACION') },
        { field: 'IdDedicacion.Id', visible: false },
        { field: 'Disponibilidad', visible: false },
        { field: 'NumeroHorasSemanales', width: '8%', displayName: $translate.instant('HORAS_SEMANALES') },
        { field: 'NumeroSemanas', width: '10%', displayName: $translate.instant('SEMANAS_REV') },
        { field: 'NumeroDisponibilidad', width: '12%', displayName: $translate.instant('NUM_DISPO_DOCENTE') },
        { field: 'ValorContrato', width: '15%', displayName: $translate.instant('VALOR_CONTRATO_REV'), cellClass: "valorEfectivo", cellFilter: "currency" },
        {
          field: 'IdProyectoCurricular', visible: false, filter: {
            term: self.term
          }
        },
        {
          field: 'cancelar',
          enableSorting: false,
          enableFiltering: false,
          width: '15%',
          displayName: $translate.instant('OPCIONES'),
          cellTemplate: '<center>' +
            '<a class="borrar" ng-click="grid.appScope.verAnularDesvinculacion(row)">' +
            '<i title="{{\'ANULAR_BTN\' | translate }}" class="fa fa-times-circle-o fa-lg  faa-shake animated-hover"></i></a></div>' +
            '</center>'
        }
      ],

      onRegisterApi: function (gridApi) {
        self.precontratados.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function () {
          self.personasSeleccionadas = gridApi.selection.getSelectedRows();

        });
      }
    };

    oikosRequest.get("dependencia/proyectosPorFacultad/" + self.resolucionNueva.IdFacultad + "/" + self.resolucionNueva.NivelAcademico_nombre, "").then(function (response) {
      self.proyectos = response.data;
      self.defaultSelectedPrecont = self.proyectos[0].Id;
    });

    administrativaRequest.get("modificacion_resolucion", "limit=-1&query=ResolucionNueva:" + self.resolucionNueva.Id).then(function (response) {
      self.resolucionVieja.Id = response.data[0].ResolucionAnterior;
      self.id_modificacion_resolucion = response.data[0].Id;
      self.get_docentes_vinculados().then(function () {
        //   //refresca una vez cargados los docentes precontratados
        self.precontratados.gridApi.core.refresh();
      });
    });
    //Función para visualizar docentes ya vinculados a resolución
    self.get_docentes_vinculados = function () {

      self.estado = true;
      var r = adminMidRequest.get("gestion_desvinculaciones/docentes_desvinculados", "id_resolucion=" + self.resolucionNueva.Id).then(function (response) {
        self.precontratados.data = response.data;
        self.estado = false;
      });

      self.precontratados.columnDefs[11].filter.term = self.term;
      return r;

    };



    $scope.verAnularDesvinculacion = function (row) {
      swal({
        title: $translate.instant('PREGUNTA_SEGURO'),
        text: $translate.instant('PREGUNTA_SEGURO_ANULAR_DESV'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: $translate.instant('CONFIRMACION_ANULAR_DESV'),
        cancelButtonText: $translate.instant('CANCELAR'),
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false,
        allowOutsideClick: false
      }).then(function () {
        self.AnularDesvinculacionDocente(row);
      }, function (dismiss) {
        if (dismiss === 'cancel') {
          swal(
            $translate.instant('CANCELADO'),
            $translate.instant('ANULACION_CANCELADA'),
            'error'
          );
        }
      });
    };


    self.AnularDesvinculacionDocente = function (row) {

      var docente_a_anular = {
        Id: row.entity.Id,
        NumeroContrato: row.entity.NumeroContrato,
        Vigencia: row.entity.Vigencia,
        IdPersona: row.entity.IdPersona,
        NumeroHorasSemanales: row.entity.NumeroHorasSemanales,
        NumeroSemanas: row.entity.NumeroSemanas,
        IdResolucion: { Id: self.resolucionVieja.Id },
        IdDedicacion: { Id: row.entity.IdDedicacion.Id },
        IdProyectoCurricular: row.entity.IdProyectoCurricular,
        Estado: Boolean(true),
        FechaRegistro: self.fecha,
        ValorContrato: row.entity.ValorContrato,
        Categoria: row.entity.Categoria,
        DependenciaAcademica: row.entity.DependenciaAcademica,
        Disponibilidad: row.entity.Disponibilidad
      };

      desvinculacionesData.push(docente_a_anular);

      var objeto_a_enviar = {
        IdModificacionResolucion: self.id_modificacion_resolucion,
        DocentesDesvincular: desvinculacionesData
      };

      //Se cambia la lógica de la anulación para que sea igual a la de adiciones, debido a que se cambió la vinculación de la misma manera
      adminMidRequest.post("gestion_desvinculaciones/anular_adicion", objeto_a_enviar).then(function (response) {
        if (response.data === "OK") {


          swal({
            text: $translate.instant('ALERTA_ANULACION_EXITOSA'),
            type: 'success',
            confirmButtonText: $translate.instant('ACEPTAR'),
            allowOutsideClick: false

          });
          $window.location.reload();
        } else {
          swal({
            title: $translate.instant('ERROR'),
            text: $translate.instant('ALERTA_ERROR_ANULACION'),
            type: 'error',
            confirmButtonText: $translate.instant('ACEPTAR'),
            allowOutsideClick: false
          });

        }

      });

    };

    self.volver = function () {
      $window.location.href = '#/vinculacionespecial/resolucion_gestion';
    }
  });
