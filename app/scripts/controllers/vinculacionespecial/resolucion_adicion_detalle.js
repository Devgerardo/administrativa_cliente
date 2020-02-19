'use strict';

angular.module('contractualClienteApp')
  .controller('ResolucionAdicionDetalleCtrl', function (administrativaRequest, financieraRequest, resolucion, adminMidRequest, oikosRequest, $localStorage, $scope, $mdDialog, $translate, $window) {

    var self = this;

    self.resolucion = JSON.parse(localStorage.getItem("resolucion"));
    self.resolucion_id_nueva = self.resolucion.Id;
    self.estado = false;
    self.proyectos = [];
    self.vigencia_data = self.resolucion.Vigencia;
    self.fecha = new Date();
    self.saldo_disponible = true;
    var desvinculacionesData = [];

    self.precontratados_adicion = {
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
        { field: 'FechaRegistro', visible: false },
        { field: 'NombreCompleto', width: '15%', displayName: $translate.instant('NOMBRE') },
        { field: 'IdPersona', width: '10%', displayName: $translate.instant('DOCUMENTO_DOCENTES') },
        { field: 'Categoria', width: '10%', displayName: $translate.instant('CATEGORIA') },
        { field: 'Dedicacion', width: '15%', displayName: $translate.instant('DEDICACION') },
        { field: 'IdDedicacion.Id', visible: false },
        { field: 'Disponibilidad', visible: false },
        { field: 'NumeroHorasSemanales', width: '10%', displayName: $translate.instant('LABEL_HORAS_A_ADICIONAR') },
        { field: 'NumeroSemanas', width: '10%', displayName: $translate.instant('LABEL_SEMANAS_A_ADICIONAR') },
        { field: 'NumeroDisponibilidad', width: '10%', displayName: $translate.instant('NUM_DISPO_DOCENTE') },
        { field: 'ValorContrato', width: '10%', displayName: $translate.instant('LABEL_VALOR_ADICIONAR'), cellClass: "valorEfectivo", cellFilter: "currency" },
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
            '<a class="borrar" ng-click="grid.appScope.verAnularAdicion(row)">' +
            '<i title="{{\'ANULAR_BTN\' | translate }}" class="fa fa-times-circle-o fa-lg  faa-shake animated-hover"></i></a></div>' +
            '</center>'
        }
      ],

      onRegisterApi: function (gridApi) {
        self.precontratados_adicion.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function () {
          self.personasSeleccionadas = gridApi.selection.getSelectedRows();

        });
      }
    };



    oikosRequest.get("dependencia/proyectosPorFacultad/" + self.resolucion.IdFacultad + "/" + self.resolucion.NivelAcademico_nombre, "").then(function (response) {
      self.proyectos = response.data;
      self.defaultSelectedPrecont = self.proyectos[0].Id;
    });

    administrativaRequest.get("modificacion_resolucion", "limit=-1&query=ResolucionNueva:" + self.resolucion.Id).then(function (response) {
      self.resolucion.Id = response.data[0].ResolucionAnterior;
      self.resolucion_id_nueva = response.data[0].ResolucionNueva;
      self.id_modificacion_resolucion = response.data[0].Id;
      self.get_docentes_vinculados_adicion().then(function () {
        //   //refresca una vez cargados los docentes precontratados
        self.precontratados_adicion.gridApi.core.refresh();
      });
    });
    //Función para visualizar docentes ya vinculados a resolución
    self.get_docentes_vinculados_adicion = function () {

      self.estado = true;
      var r = adminMidRequest.get("gestion_desvinculaciones/docentes_desvinculados", "id_resolucion=" + self.resolucion_id_nueva).then(function (response) {
        self.precontratados_adicion.data = response.data;
        self.estado = false;

      });

      self.precontratados_adicion.columnDefs[12].filter.term = self.term;
      return r;

    };

    $scope.verAnularAdicion = function (row) {
      swal({
        title: $translate.instant('PREGUNTA_SEGURO'),
        text: $translate.instant('ALERTA_SEGURO_ANULACION_ADICION'),
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: $translate.instant('CONFIRMACION_ANULACION_ADICION'),
        cancelButtonText: $translate.instant('CANCELAR'),
        confirmButtonClass: 'btn btn-success',
        cancelButtonClass: 'btn btn-danger',
        buttonsStyling: false
      }).then(function () {
        self.AnularAdicionDocente(row);
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

    self.AnularAdicionDocente = function (row) {


      var docente_a_anular = {
        Id: row.entity.Id,
        IdPersona: row.entity.IdPersona,
        NumeroHorasSemanales: row.entity.NumeroHorasSemanales,
        NumeroSemanas: row.entity.NumeroSemanas,
        IdResolucion: { Id: self.resolucion.Id },
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


      adminMidRequest.post("gestion_desvinculaciones/anular_adicion", objeto_a_enviar).then(function (response) {
        if (response.data === "OK") {


          swal({
            text: $translate.instant('ALERTA_ANULACION_EXITOSA'),
            type: 'success',
            confirmButtonText: $translate.instant('ACEPTAR')

          });
          $window.location.reload();
        } else {
          swal({
            title: $translate.instant('ERROR'),
            text: $translate.instant('ALERTA_ERROR_ANULACION'),
            type: 'error',
            confirmButtonText: $translate.instant('ACEPTAR')
          });

        }

      });

    };

  });
