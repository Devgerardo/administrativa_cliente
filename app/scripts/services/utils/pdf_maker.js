'use strict';

angular.module('contractualClienteApp')
    .factory('pdfMakerService', function ($http, $translate) {
        var self = {};
        self.imagen = { imagen: "" };
        //TODO: una imagen en base64 en un archivo JSON? por qué no directo
        $http.get("scripts/models/imagen.json")
            .then(function (response) {
                self.imagen = response.data;

            });
        //Función para obtener el contenido de las tablas por proyecto currícular de los docentes asociados a la resolución
        self.getCuerpoTabla = function (idProyecto, nivelAcademico, datos, tipoResolucion) {
            var cuerpo = [];
            var encabezado = [];
            var modificacion = true;
            var segundaFila = [];
            var terceraFila = [];
            var columnas = [];
            var tituloHoras = 'HORAS_SEMANALES';
            if (nivelAcademico === 'POSGRADO') {
                tituloHoras = 'HORAS_SEMESTRALES'
            }

            columnas = ['NombreCompleto', 'TipoDocumento', 'IdPersona', 'LugarExpedicionCedula', 'Categoria', 'Dedicacion', 'NumeroHorasSemanales', 'NumeroMeses'];
            encabezado = [{ text: $translate.instant('NOMBRE'), style: 'encabezado' }, { text: $translate.instant('TIPO_DOCUMENTO'), style: 'encabezado' }, { text: $translate.instant('CEDULA'), style: 'encabezado' }, { text: $translate.instant('EXPEDICION'), style: 'encabezado' }, { text: $translate.instant('CATEGORIA'), style: 'encabezado' }, { text: $translate.instant('DEDICACION'), style: 'encabezado' }, { text: $translate.instant(tituloHoras), style: 'encabezado' }, { text: $translate.instant('PERIODO_VINCULACION'), style: 'encabezado' }, { text: $translate.instant('VALOR_CONTRATO'), style: 'encabezado' }];

            switch (tipoResolucion) {
                case "Vinculación":
                    columnas.push('ValorContratoFormato', 'NumeroDisponibilidad');
                    encabezado.push({ text: $translate.instant('DISPONIBILIDAD_PDF'), style: 'encabezado' });
                    if (nivelAcademico === 'POSGRADO'){
                        columnas = ['NombreCompleto', 'TipoDocumento', 'IdPersona', 'LugarExpedicionCedula', 'Categoria', 'Dedicacion', 'NumeroHorasSemanales', 'ValorContratoFormato', 'NumeroDisponibilidad'];
                        encabezado = [{ text: $translate.instant('NOMBRE'), style: 'encabezado' }, { text: $translate.instant('TIPO_DOCUMENTO'), style: 'encabezado' }, { text: $translate.instant('CEDULA'), style: 'encabezado' }, { text: $translate.instant('EXPEDICION'), style: 'encabezado' }, { text: $translate.instant('CATEGORIA'), style: 'encabezado' }, { text: $translate.instant('DEDICACION'), style: 'encabezado' }, { text: $translate.instant('HORAS_SEMESTRALES'), style: 'encabezado' }, { text: $translate.instant('VALOR_CONTRATO'), style: 'encabezado' }, { text: $translate.instant('DISPONIBILIDAD_PDF'), style: 'encabezado' }];
                    }
                    modificacion = false;
                    break;
                case "Adición":
                    columnas.push('ValorContratoInicialFormato', '', 'NumeroDisponibilidad');
                    segundaFila.push('NumeroHorasModificacion', 'NumeroMesesNuevos', '', 'ValorModificacionFormato');
                    terceraFila.push('NumeroHorasNuevas', '', 'ValorContratoFormato', '');
                    encabezado.push({ text: $translate.instant('LABEL_VALOR_ADICIONAR'), style: 'encabezado' }, { text: $translate.instant('DISPONIBILIDAD_PDF'), style: 'encabezado' });
                    break;
                case "Reducción":
                    columnas.push('ValorContratoInicialFormato', '', 'NumeroRp');
                    segundaFila.push('NumeroHorasModificacion', 'NumeroMesesNuevos', '', 'ValorModificacionFormato');
                    terceraFila.push('NumeroHorasNuevas', '', 'ValorContratoFormato', '');
                    encabezado.push({ text: $translate.instant('VALOR_CONTRATO_REV'), style: 'encabezado' }, { text: $translate.instant('NUMERO_REGISTRO_PRESUPUESTAL'), style: 'encabezado' });
                    break;
                case "Cancelación":
                    columnas.push('ValorContratoInicialFormato', 'ValorModificacionFormato', 'NumeroRp');
                    segundaFila.push('NumeroHorasSemanales', 'NumeroMesesNuevos', 'ValorContratoFormato');
                    encabezado.push({ text: $translate.instant('VALOR_CONTRATO_REV'), style: 'encabezado' }, { text: $translate.instant('NUMERO_REGISTRO_PRESUPUESTAL'), style: 'encabezado' });
                    break;
                default: break;
            }

            cuerpo.push(encabezado);
            if (datos) {
                datos.forEach(function (fila) {
                    //Se veriica que el docente este asociado al proyecto curricular actual
                    if (fila.IdProyectoCurricular === idProyecto) {
                        //Si la resolución es de cancelación, adición o reducción la tabla es diferente
                        if (modificacion) {
                            var tablaModificacion = [];
                            if (tipoResolucion == 'Cancelación'){
                                tablaModificacion = self.tablaCancelacion(columnas, fila, segundaFila);
                            } else {
                                tablaModificacion = self.tablaModificacionHoras(columnas, fila, segundaFila, terceraFila);
                            }
                            cuerpo.push(tablaModificacion[0]);
                            cuerpo.push(tablaModificacion[1]);
                            if (tablaModificacion[2] != undefined) {
                                cuerpo.push(tablaModificacion[2]);
                            }
                        } else {
                            var datoFila = [];
                            columnas.forEach(function (columna) {
                                //Cada dato es almacenado como un String dentro de la matriz de la tabla
                                datoFila.push(fila[columna] != undefined ? fila[columna].toString() : '');
                            });
                            //La fila es agregada a la tabla con los datos correspondientes
                            cuerpo.push(datoFila);
                        }
                    }
                });
            }
            return cuerpo;
        };

        self.tablaModificacionHoras = function (columnas, fila, segundaFila, terceraFila) {
            var datoFila = [];
            var segunda = [];
            var tercera = [];
            var cantidadColumnas = columnas.length;

            for (var i = 0, j = 0; i < cantidadColumnas; i++){
                if (i < 6 || i > 9) {
                    datoFila.push({ text: fila[columnas[i]] != undefined ? fila[columnas[i]].toString() : '', rowSpan: 3 });
                }
                if (i > 5 && i < 10) {
                    datoFila.push({ text: fila[columnas[i]] != undefined ? fila[columnas[i]].toString() : '' });
                    segunda[i] = fila[segundaFila[j]] != undefined ? fila[segundaFila[j]].toString() : '';
                    tercera[i] = fila[terceraFila[j]] != undefined ? fila[terceraFila[j]].toString() : '';
                    tercera[i] = i == 6 ? 'Total ' + tercera[i] : tercera[i] ;
                    j++;
                }
            }
            return [datoFila, segunda, tercera];
        }

        self.tablaCancelacion = function (columnas, fila, segundaFila, terceraFila) {
            var datoFila = [];
            var segunda = [];
            var cantidadColumnas = columnas.length;

            for (var i = 0, j = 0; i < cantidadColumnas; i++){
                if (i < 6 || i > 8) {
                    datoFila.push({ text: fila[columnas[i]].toString(), rowSpan:2 });
                }
                if (i > 5 && i < 9) {
                    datoFila.push({ text: fila[columnas[i]].toString() });
                    segunda[i] = 'Pasa a '+fila[segundaFila[j]].toString();
                    j++;
                }
            }
            return [datoFila, segunda];
        }

        //Función que devuelve en contenido de la resolución en un arreglo de estructuras
        self.getContenido = function (contenidoResolucion, resolucion, contratados, proyectos) {
            var contenido = [];
            var fechaParaPDF = "";
            var fechaExpedicion = resolucion.FechaExpedicion;

            if (fechaExpedicion != undefined && typeof fechaExpedicion === "object") {
                fechaExpedicion = fechaExpedicion.toJSON();
            }
            if (fechaExpedicion == undefined || fechaExpedicion === "0001-01-01T00:00:00Z") {
                fechaParaPDF = "Fecha de expedición pendiente";
            }
            else {
                fechaExpedicion = fechaExpedicion.split('T')[0];
                fechaParaPDF = fechaExpedicion;
            }
            contenido.push({
                text: $translate.instant('RESOLUCION') + " " + 'No ' + contenidoResolucion.Numero,
                style: 'titulo'
            });
            contenido.push({
                text: "(" + fechaParaPDF + ")",
                style: 'titulo'
            });
            contenido.push({
                text: " ",
                style: 'titulo'
            });
            contenido.push({
                text: contenidoResolucion.Titulo,
                style: 'epigrafe'
            });
            contenido.push(self.getPreambuloTexto(contenidoResolucion.Preambulo));
            contenido.push({
                text: $translate.instant('CONSIDERANDO'),
                style: 'sub_titulo'
            });
            contenido.push(self.getConsideracionTexto(contenidoResolucion.Consideracion));
            contenido.push({
                text: $translate.instant('RESUELVE'),
                style: 'sub_titulo'
            });
            var numero = 0;
            //Se agregan artículos al documento
            if (contenidoResolucion.Articulos) {
                var index = 1;
                contenidoResolucion.Articulos.forEach(function (articulo) {
                    contenido.push(self.getArticuloTexto(articulo, numero));
                    if (index === 1) {
                        proyectos.forEach(function (proyecto) {
                            var proyectoVisible = false;
                            if (contratados) {
                                contratados.forEach(function (fila) {
                                    if (fila.IdProyectoCurricular === proyecto.Id) {
                                        proyectoVisible = true;
                                    }
                                });
                            }
                            if (proyectoVisible) {
                                contenido.push({
                                    text: proyecto.Nombre,
                                    style: 'texto'
                                });
                                contenido.push(self.getTabla(proyecto.Id, resolucion.NivelAcademico_nombre, contratados, resolucion.TipoResolucion));
                            }

                        });
                    }
                    index++;
                    numero++;
                });
            }
            contenido.push({
                text: $translate.instant('COMUNIQUESE_Y_CUM'),
                style: 'sub_titulo'
            });
            contenido.push({
                text: $translate.instant('DADO_A_LOS'),
                style: 'texto'
            })
            contenido.push({
                text: contenidoResolucion.OrdenadorGasto.NombreOrdenador,
                style: 'nombre_ordenador'
            });
            contenido.push({
                text: '-- ' + contenidoResolucion.OrdenadorGasto.Cargo + ' --',
                style: 'nombre_cargo'
            });
            contenido.push(self.getTablaRevision(resolucion.Dedicacion));
            return contenido;
        };

        //Devuelve el contenido del documento en una estrutura formato "JSON"
        self.getDocumento = function (contenidoResolucion, resolucion, contratados, proyectos) {
            var documento = {
                info: {
                    title: $translate.instant('RESOLUCION')
                },
                pageMargins: [40, 160, 40, 40],
                header: [{
                    alignment: 'center',
                    height: 'auto',
                    margin: [0, 15, 0, 0],
                    table: {
                        height: 'auto',
                        widths: ['*'],
                        body: [
                            [
                                {
                                    height: 120,
                                    width: 120,
                                    image: self.imagen.imagen,
                                    alignment: 'center'
                                }
                            ],
                            [{text: resolucion.FacultadFirmaNombre, font: 'Calibri', fontSize: 8, bold: true}]
                        ]
                },
                    layout: 'noBorders'
                }],
                content: self.getContenido(contenidoResolucion, resolucion, contratados, proyectos),
                //Definición de los estilosutilizados dentro del documento
                styles: {
                    //Encabezados de las tablas
                    encabezado: {
                        font: 'Calibri',
                        fontSize: 9,
                        alignment: 'center'
                    },
                    //Contenido de las tablas
                    tabla: {
                        font: 'Calibri',
                        fontSize: 8.5,
                        margin: [-20, 5, -10, 0]
                    },
                    //Texto normal
                    texto: {
                        font: 'Calibri',
                        fontSize: 12,
                        margin: [30, 5],
                        alignment: 'justify',
                    },
                    titulo: {
                        font: 'MinionPro',
                        bold: true,
                        fontSize: 12,
                        alignment: 'center'
                    },
                    epigrafe: {
                        font: 'MinionPro',
                        bold: true,
                        italics: true,
                        fontSize: 12,
                        alignment: 'center'
                    },
                    //Considerando, resuelve...
                    sub_titulo: {
                        font: 'Calibri',
                        fontSize: 12,
                        bold: true,
                        alignment: 'center'
                    },
                    //Artículo, parágrafo...
                    texto_numeracion: {
                        font: 'Calibri',
                        fontSize: 12,
                        bold: true,
                        alignment: 'justify'
                    },
                    tabla_revision: {
                        fontSize: 6,
                        alignment: 'center'
                    },
                    //Nombre del ordenador del gasto y cargo
                    nombre_ordenador: {
                        font: 'MinionPro',
                        bold: true,
                        fontSize: 12,
                        margin: [30, 80, 30, 0],
                        alignment: 'center'
                    },
                    nombre_cargo: {
                        font: 'MinionPro',
                        bold: false,
                        fontSize: 12,
                        margin: [30, 0, 30, 30],
                        alignment: 'center'
                    },
                    pie_pagina: {
                        fontSize: 8,
                        alignment: 'center'
                    }
                },
                //Pie de página de la resolución
                footer: function (page, pages) {
                    return {
                        columns: [
                            '',
                            {
                                alignment: 'right',
                                text: [
                                    'Página ',
                                    { text: page.toString(), bold: true },
                                    ' de ',
                                    { text: pages.toString(), bold: true }
                                ]
                            }
                        ],
                        margin: [10, 0, 20],
                        style: "pie_pagina"
                    };
                },
            };
            return documento;
        };

        //Función para obtener la estructura de la tabla de contratados
        self.getTabla = function (idProyecto, nivelAcademico, datos, tipoResolucion) {
            return {
                style: 'tabla',
                table: {
                    headerRows: 1,
                    body: self.getCuerpoTabla(idProyecto, nivelAcademico, datos, tipoResolucion)
                }
            };
        };

        //Obtener tabla del final
        self.getTablaRevision = function (resolucionDedicacion) {
            if(resolucionDedicacion === "TCO-MTO"){
                return {
                    style: 'tabla_revision',
                    table: {
                        headerRows: 1,
                        widths: [80, 150, 150, 80],
                        body: [
                            ['', { text: $translate.instant('NOMBRE_COMPLETO'), style: 'tabla_revision' }, { text: $translate.instant('CARGO_PDF'), style: 'tabla_revision' }, { text: $translate.instant('FIRMA'), style: 'tabla_revision' }],
                            [{ text: $translate.instant('ELABORO'), style: 'tabla_revision' }, { text: 'Edilberto Fernández Santos', style: 'tabla_revision' }, { text: 'Auxiliar Administrativo DRH', style: 'tabla_revision' }, ''],
                            [{ text: $translate.instant('REVISO_APROBO'), style: 'tabla_revision' }, { text: 'Fernando Antonio Torres Gómez', style: 'tabla_revision' }, { text: 'Jefe Oficina Asesora Jurídica', style: 'tabla_revision' }, ''],
                            [{ text: $translate.instant('REVISO_APROBO'), style: 'tabla_revision' }, { text: 'Camilo Andrés Bustos Parra', style: 'tabla_revision' }, { text: 'Secretario general', style: 'tabla_revision' }, ''],
                            [{ text: $translate.instant('REVISO_APROBO'), style: 'tabla_revision' }, { text: 'William Fernando Castrillón Cardona', style: 'tabla_revision' }, { text: 'Vicerrector Académico', style: 'tabla_revision' }, ''],
                        ]
                    }
                };
            }else{
                return {
                    style: 'tabla_revision',
                    table: {
                        headerRows: 1,
                        widths: [80, 150, 150, 80],
                        body: [
                            ['', { text: $translate.instant('NOMBRE_COMPLETO'), style: 'tabla_revision' }, { text: $translate.instant('CARGO_PDF'), style: 'tabla_revision' }, { text: $translate.instant('FIRMA'), style: 'tabla_revision' }],
                            [{ text: $translate.instant('ELABORO'), style: 'tabla_revision' }, { text: 'Edilberto Fernández Santos', style: 'tabla_revision' }, { text: 'Auxiliar Administrativo DRH', style: 'tabla_revision' }, ''],
                            [{ text: $translate.instant('REVISO2'), style: 'tabla_revision' }, { text: 'Carlos David Padilla Leal', style: 'tabla_revision' }, { text: 'Asesor CPS OAJ', style: 'tabla_revision' }, ''],
                            [{ text: $translate.instant('REVISO_APROBO'), style: 'tabla_revision' }, { text: 'Fernando Antonio Torres Gómez', style: 'tabla_revision' }, { text: 'Jefe Oficina Asesora Jurídica', style: 'tabla_revision' }, ''],
                            [{ text: $translate.instant('REVISO_APROBO'), style: 'tabla_revision' }, { text: 'Camilo Andrés Bustos Parra', style: 'tabla_revision' }, { text: 'Secretario general', style: 'tabla_revision' }, ''],
                            [{ text: $translate.instant('REVISO_APROBO'), style: 'tabla_revision' }, { text: 'William Fernando Castrillón Cardona', style: 'tabla_revision' }, { text: 'Vicerrector Académico', style: 'tabla_revision' }, ''],
                        ]
                    }
                };
            }
            
        };

        //Función para obtener el texto del preámbulo dentro de una estructura
        self.getPreambuloTexto = function (preambulo) {
            return {
                text: preambulo,
                style: 'texto'
            };
        };

        //Función para obtener el texto de la consideración dentro de una estructura
        self.getConsideracionTexto = function (consideracion) {
            return {
                text: consideracion,
                style: 'texto'
            };
        };

        //Funcion para obtener el texto de los artiulos consu paragrafos dentro de una estructura
        self.getArticuloTexto = function (articulo, numero) {
            var aux = [{ text: $translate.instant('ARTICULO') + " " + (numero + 1) + 'º. ', style: 'texto_numeracion' }, articulo.Texto ];
            if (articulo.Paragrafos !== null) {
                // Solo se enumeran si hay más de uno
                if (articulo.Paragrafos.length === 1) {
                    aux.push({ text: " " + $translate.instant('PARAGRAFO') + ". ", style: 'texto_numeracion' });
                    aux.push(articulo.Paragrafos[0].Texto);
                } else {
                var numeroParagrafo = 1;
                //Cada paragrafo se inserta dentro del texto del articulo
                articulo.Paragrafos.forEach(function (paragrafo) {
                        aux.push({ text: " " + $translate.instant('PARAGRAFO') + " " + numeroParagrafo + 'º. ', style: 'texto_numeracion' });
                    aux.push(paragrafo.Texto);
                    numeroParagrafo++;
                });
            }
            }

            return {
                text: aux,
                style: 'texto'
            };
        };

        /*
        *Funciones para convertir numero a texto, utilizado para paragrafos y artículos
        */

        //Función que retorna las unidades del número en texto
        self.getUnidades = function (num) {
            switch (num) {
                case 1: return 'PRIMERO';
                case 2: return 'SEGUNDO';
                case 3: return 'TERCERO';
                case 4: return 'CUARTO';
                case 5: return 'QUINTO';
                case 6: return 'SEXTO';
                case 7: return 'SEPTIMO';
                case 8: return 'OCTAVO';
                case 9: return 'NOVENO';
            }
            return '';
        };

        //Función que retorna las decenas del número en texto
        self.getDecenas = function (numero) {
            var decena = Math.floor(numero / 10);
            var unidad = numero - (decena * 10);
            switch (decena) {
                case 0: return self.getUnidades(unidad);
                case 1: return 'DECIMO' + self.getUnidades(unidad);
                case 2: return 'VIGÉSIMO ' + self.getUnidades(unidad);
                case 3: return 'TRIGÉSIMO ' + self.getUnidades(unidad);
                case 4: return 'CUADRAGÉSIMO ' + self.getUnidades(unidad);
                case 5: return 'QUINCUAGÉSIMO ' + self.getUnidades(unidad);
                case 6: return 'SEXAGÉSIMO ' + self.getUnidades(unidad);
                case 7: return 'SEPTUAGÉSIMO ' + self.getUnidades(unidad);
                case 8: return 'OCTAGÉSIMO ' + self.getUnidades(unidad);
                case 9: return 'NONAGÉSIMO ' + self.getUnidades(unidad);
            }
            return '';
        };

        //Función que retorna los números de entrada en texto formato orden
        self.numeroALetras = function (numero) {
            if (numero === 0) {
                return 'CERO ';
            } else {
                return self.getDecenas(numero);
            }
        };

        //Función que retorna un número en formato monetario "99.999.999"
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
        return self;
    });
