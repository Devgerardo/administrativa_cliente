'use strict';

angular.module('contractualClienteApp')
    .factory('pdfMakerNecesidadesService', function ($http, $filter, $translate, necesidadService) {
        var self = this;

        self.docDefinition = function (trNecesidad) {

            return new Promise(function (resolve, reject) {

                var imagen = { imagen: "" }
                var dataDias = necesidadService.calculo_total_dias_rev(trNecesidad.Necesidad.DiasDuracion);
                var jefeDependenciaDestino = {};
                var jefeDependenciaSolicitante = {};
                var dependenciaData = [];
                var apropiacionesData = [];
                var perfil_data = [];

                $http.get("scripts/models/imagen.json").then(function (response) {
                    imagen = response.data;

                    return necesidadService.getJefeDependencia(trNecesidad.DependenciaNecesidadDestino);
                }).then(function (JD) {
                    jefeDependenciaDestino = JD;

                    return necesidadService.getJefeDependencia(trNecesidad.DependenciaNecesidad.JefeDependenciaSolicitante, true);
                }).then(function (JD) {
                    jefeDependenciaSolicitante = JD;

                    return necesidadService.getAllDependencias();
                }).then(function (Dependencias) {
                    dependenciaData = Dependencias;
                    apropiacionesData = trNecesidad.Ffapropiacion;
                    return necesidadService.getParametroEstandar();
                }).then(function (response) {
                    perfil_data = response.data;

                    var dependenciaDestino = dependenciaData.filter(function (d) { return d.Id === trNecesidad.DependenciaNecesidadDestino })[0]
                    var dependenciaSolicitante = dependenciaData.filter(function (d) { return d.Id === trNecesidad.DependenciaNecesidadSolicitante })[0]
                    var perfil = trNecesidad.DetalleServicioNecesidad ?
                        perfil_data.filter(function (d) { return d.Id === trNecesidad.DetalleServicioNecesidad.Perfil })[0] :
                        { ValorParametro: "" };

                    resolve({
                        header: function (currentPage, pageCount) {
                            return {
                                style: ['header', "p"],
                                margin: [0, 0, 0, 15],
                                table: {
                                    // headers are automatically repeated if the table spans over multiple pages
                                    // you can declare how many rows should be treated as headers
                                    headerRows: 1,
                                    widths: ['10%', '*', '40%'],
                                    body: [
                                        [
                                            {
                                                height: 60,
                                                width: 60,
                                                image: imagen.imagen,
                                                alignment: 'center',
                                                rowSpan: 4,
                                            },
                                            { text: 'Solicitud Necesidad'.toUpperCase(), rowSpan: 4, margin: [0, 33, 0, 0], style: "headerTitle" },
                                            { text: "Dependencia Solicitante", style: "title1", border: [true, true, true, false] }
                                        ],
                                        [
                                            "",
                                            "",
                                            { text: dependenciaSolicitante.Nombre.toUpperCase(), border: [true, false, true, true] }
                                        ],
                                        [
                                            "",
                                            "",
                                            {
                                                alignment: 'center',
                                                columns: [
                                                    [{ text: "Vigencia", style: "title1" }, trNecesidad.Necesidad.Vigencia],
                                                    [{ text: "No. Solicitud", style: "title1" }, trNecesidad.Necesidad.NumeroElaboracion]
                                                ],
                                                columnGap: 10
                                            }
                                        ],
                                        [
                                            "",
                                            "",
                                            "Página " + currentPage.toString() + " de " + pageCount,

                                        ]
                                    ]
                                }
                            }
                        },
                        content: [
                            {
                                style: "p",
                                layout: {
                                    fillColor: function (i, node) {
                                        return (i % 2 === 1) ? '#CCCCCC' : null;
                                    }
                                },
                                table: {
                                    headerRows: 0,
                                    widths: ["100%"],

                                    body: [
                                        [{ alignment: "center", text: [{ bold: true, text: "Fecha de Solicitud: " }, moment(trNecesidad.Necesidad.FechaSolicitud).format("D [de] MMMM [de] YYYY")] }],
                                        [{ style: "title1", text: "JUSTIFICACIÓN (Identifique de forma clara y conta la necesidad de la contratación)" }],
                                        [{ alignment: "justify", text: trNecesidad.Necesidad.Justificacion.toUpperCase() }],
                                        [{ style: "title2", text: "ESPECIFICACIONES TÉCNICAS: Si la compra o el servicio contempla especificaciones del orden técnico descríbalas." }],
                                        [
                                            {
                                                table: {
                                                    headerRows: 1,
                                                    widths: ["auto", "*", "auto", "auto"],
                                                    body: [
                                                        ["Descripción", "", "Cantidad", "Unidad"],
                                                        [
                                                            ["Cod. 1", "Especificación:"],
                                                            [perfil.ValorParametro, "Actividad",
                                                            {
                                                                text: trNecesidad.ActividadEspecifica ?
                                                                    trNecesidad.ActividadEspecifica.map(function (ae, i) { return (i + 1).toString() + '. ' + ae.Descripcion }).join('. ') : "Ninguna", alignment: "justify"
                                                            }],
                                                            { text: 1, alignment: 'center' },
                                                            ""
                                                        ]
                                                    ]
                                                }
                                            }
                                        ],
                                        [{ style: "title1", text: "Información del contacto".toUpperCase() }],
                                        [[
                                            {
                                                columnGap: 10,
                                                columns: [
                                                    { style: "title2", text: "Objeto:", width: "auto" },
                                                    { alignment: "justify", text: trNecesidad.Necesidad.Objeto }
                                                ]
                                            },
                                            {
                                                columnGap: 10,
                                                columns: [
                                                    { style: "title2", text: "Duración:", width: "auto" },
                                                    { text: (trNecesidad.Necesidad.DiasDuracion == 0) ? 'PAGO ÚNICO' : 'Años: ' + dataDias.anos + ', Meses: ' + dataDias.meses + ', Días: ' + dataDias.dias }
                                                ]
                                            },
                                            {
                                                columnGap: 10,
                                                columns: [
                                                    { style: "title2", text: "Valor Estimado:", width: "auto" },
                                                    { text: $filter('currency')(trNecesidad.Necesidad.Valor, '$') }
                                                ]
                                            }
                                        ]],
                                        [{ style: "title1", text: "Datos del supervisor/interventor".toUpperCase() }],
                                        [[
                                            {
                                                columnGap: 10,
                                                columns: [
                                                    { style: "title2", text: "Nombre:", width: "12%" },
                                                    {
                                                        text: [
                                                            jefeDependenciaDestino.Persona.PrimerNombre,
                                                            jefeDependenciaDestino.Persona.SegundoNombre,
                                                            jefeDependenciaDestino.Persona.PrimerApellido,
                                                            jefeDependenciaDestino.Persona.SegundoApellido
                                                        ].join(" ").toUpperCase()
                                                    }
                                                ]
                                            },
                                            {
                                                columnGap: 10,
                                                columns: [
                                                    { style: "title2", text: "Dependencia:", width: "12%" },
                                                    { text: dependenciaDestino.Nombre.toUpperCase() }
                                                ]
                                            },
                                        ]],
                                        [{ style: "title1", text: "Plan de Contratación/Rubro Presupuestal y/o centro de costos".toUpperCase() }],
                                        // [//generar desde aqui curl http://10.20.0.254/financiera_api/v1/apropiacion/?query=Id:44529
                                        [
                                            Array.prototype.concat.apply([], apropiacionesData.map(function (apg, i) {
                                                return [{
                                                    margin: [0, 0, 0, 5],
                                                    columnGap: 10,
                                                    columns: [
                                                        { text: apg.Apropiacion.Rubro.Codigo, width: "auto" },
                                                        { text: apg.Apropiacion.Rubro.Nombre.toUpperCase(), width: "*" },
                                                        { text: $filter('currency')(apg.Monto, '$'), width: "auto" }
                                                    ]
                                                }].concat([
                                                    {
                                                        alignment: "center",
                                                        columnGap: 10,
                                                        columns: [
                                                            { text: "", width: "15%" },
                                                            { text: "Centro de Costo".toUpperCase() },
                                                            { text: "", width: "6%" },
                                                            { text: "Actividad".toUpperCase() },
                                                            { text: "" },
                                                        ]
                                                    }
                                                ]).concat(
                                                    apg.Fuentes.map(function (f, i) {
                                                        return {
                                                            columnGap: 10,
                                                            columns: [
                                                                { text: i + 1, width: "15%" },
                                                                { text: dependenciaDestino.Nombre.toUpperCase() },
                                                                { text: f.InfoFuente[0].Codigo, width: "6%" },
                                                                { text: f.InfoFuente[0].Nombre },
                                                                { text: $filter('currency')(f.MontoParcial, '$'), width: "auto" },
                                                            ]
                                                        }
                                                    })
                                                ).concat([
                                                    {
                                                        margin: [0, 5, 0, 5],
                                                        alignment: "center",
                                                        columnGap: 10,
                                                        columns: [
                                                            { text: "", width: "15%" },
                                                            { text: "Producto".toUpperCase() },
                                                            { text: "", width: "6%" },
                                                            { text: "Descripción".toUpperCase() },
                                                            { text: "" },
                                                        ]
                                                    }
                                                ]).concat(
                                                    apg.Productos != null ? apg.Productos.map(function (p) {
                                                        return {
                                                            columnGap: 10,
                                                            columns: [
                                                                { text: "", width: "15%" },
                                                                { text: p.ProductoRubroInfo[0].Producto.Nombre.toUpperCase() },
                                                                { text: "", width: "6%" },
                                                                { text: p.ProductoRubroInfo[0].Producto.Descripcion },
                                                                { text: "" },
                                                            ]
                                                        }
                                                    }) : ""
                                                );
                                            }))
                                        ],
                                        [{ style: "title1", text: "Marco Legal".toUpperCase() }],
                                        [{
                                            text: (trNecesidad.MarcoLegalNecesidad && trNecesidad.MarcoLegalNecesidad.length > 0) ?
                                                trNecesidad.MarcoLegalNecesidad.map(function (ml, i) { return (i + 1).toString() + ". " + ml.MarcoLegal.NombreDocumento }).join("\n") : "Ninguno"
                                        }],
                                        //TODO: agregar los requisitos minimos a la lógica de negocios
                                        // [{ style: "title1", text: "Requisitos Mínimos".toUpperCase() }],
                                        // [[
                                        //     {
                                        //         table: {
                                        //             headerRows: 1,
                                        //             widths: ["auto", "*", "*"],
                                        //             body: [
                                        //                 ["Secuencia", "Requisito", "Observaciones"],
                                        //                 [1, "Técnico".toUpperCase(), "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Malit profecta versatur nomine ocurreret multavit, officiis viveremus aeternum superstitio suspicor alia nostram, quando nostros congressus susceperant concederetur leguntur iam, vigiliae democritea tantopere causae, atilii plerumque ipsas potitur pertineant multis rem quaeri pro, legendum didicisse credere ex maluisset per videtis. Cur discordans praetereat aliae ruinae dirigentur orestem eodem, praetermittenda divinum. Collegisti, deteriora malint loquuntur officii cotidie finitas referri doleamus ambigua acute. Adhaesiones ratione beate arbitraretur detractis perdiscere, constituant hostis polyaeno. Diu concederetur."]
                                        //             ]
                                        //         }
                                        //     }
                                        // ]],
                                        [{ style: "title1", text: "Anexos".toUpperCase() }],
                                        [[
                                            {
                                                table: {
                                                    headerRows: 1,
                                                    widths: ["auto", "*", "*"],
                                                    body: [
                                                        ["Secuencia", "Requisito", "Observaciones"],
                                                    ]
                                                }
                                            }
                                        ]],
                                        [""],
                                        [{
                                            alignment: "center",
                                            margin: [10, 30, 10, 20],
                                            stack: [
                                                {
                                                    text: [
                                                        jefeDependenciaSolicitante.Persona.PrimerNombre,
                                                        jefeDependenciaSolicitante.Persona.SegundoNombre,
                                                        jefeDependenciaSolicitante.Persona.PrimerApellido,
                                                        jefeDependenciaSolicitante.Persona.SegundoApellido
                                                    ].join(" ").toUpperCase()
                                                },
                                                { bold: true, text: "Firma del Responsable de la dependencia solicitante" }
                                            ]
                                        }]
                                    ]
                                }
                            }
                        ],

                        styles: {
                            header: {
                                alignment: 'center',
                            },
                            p: {
                                fontSize: 9
                            },
                            headerTitle: {
                                fontSize: 10,
                                bold: true,
                                alignment: "center"
                            },
                            title1: {
                                fontSize: 9,
                                bold: true,
                                alignment: "center"
                            },
                            title2: {
                                fontSize: 9,
                                bold: true,
                            }

                        },
                        pageMargins: [50, 100, 60, 60],
                        // a string or { width: number, height: number }
                        pageSize: 'letter',

                        // by default we use portrait, you can change it to landscape if you wish
                        pageOrientation: 'portrait',

                    });

                });
            });
        };

        return self;
    });
