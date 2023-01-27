/// <reference path="jquery.base64.min.js" />

document.write('<script src="../Scripts/exportar/jquery.base64.min.js"></script>')

function fnExcelReportGuiaInspectoria(nomTabla, opciones, parametros, titulo, flagTablaOculta) {
    //var tabla= $('#'+nomTabla);
    //console.log(flagTablaOculta);
    //console.log(tabla[0]);

    
    var lenColumn = $('#' + nomTabla).find('thead tr').eq(0).find('th').length;


    var nomSistema = titulo;
    var nomFileName = 'REPORTE';
    var nomTitulo = 'REPORTE';
    var nomEmpresa = '';
    var ruc = '';
    var fechaIni = '';
    var fechaFin = '';
    var ruta = '';
    var unidad = '';
    var usuarioImpresion = '';
    var usuario = '';
    var nombreInspector = '';
    var horaInicio = '';
    var horaFin = '';

    var f = new Date();
    var fechaActual = (f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear() + " " + f.getHours() + ":" + f.getMinutes());

    if (opciones != undefined) {
        if (opciones.sistema != undefined) {
            nomSistema = opciones.sistema;
        }
        if (opciones.title != undefined) {
            nomTitulo = opciones.title;
        }
        if (opciones.filename != undefined) {
            nomFileName = opciones.filename;
        }
        if (opciones.empresa != undefined) {
            nomEmpresa = opciones.empresa;
        }
    }

    if (parametros != undefined) {
        //fecha inicio
        if (parametros.fechaInicio != undefined) {
            fechaIni = parametros.fechaInicio;
        }
        //fecha fin
        if (parametros.fechaFin != undefined) {
            fechaFin = parametros.fechaFin;
        }
        if (parametros.nomRuta != undefined) {
            ruta = parametros.nomRuta;
        }
        if (parametros.nomUnidad != undefined) {
            unidad = parametros.nomUnidad;
        }
        if (parametros.nomUsuario != undefined) {
            usuario = parametros.nomUsuario;
        }
        if (parametros.ruc != undefined) {
            ruc = parametros.ruc;
        }
        if (parametros.usuarioImpresion != undefined) {
            usuarioImpresion = parametros.usuarioImpresion;
        }
        //nombre de inspector
        if (parametros.nombreInspector != undefined) {
            nombreInspector = parametros.nombreInspector;
        }
        //hora inicio
        if (parametros.horaInicio != undefined) {
            horaInicio = parametros.horaInicio;
        }
        //hora fin
        if (parametros.horaFin != undefined) {
            horaFin = parametros.horaFin;
        }
    }

    var nuevaFechaFile = '';
    var nomEmp = nomEmpresa.toUpperCase();
    nuevaFechaFile = fechaIni.replace(/-/g, "_");
    nuevaFechaFile = nuevaFechaFile.replace(/ /g, "");

    if (parametros.fechaInicio != undefined) {
        nomFileName = nomEmp + '_' + nomFileName.replace(/ /g, "_") + '_' + nuevaFechaFile;
    } else {
        nomFileName = nomEmp + '_' + nomFileName.replace(/ /g, "_");
    }

    var tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
    var textRange; var j = 0;
    var tablaHtml; //= document.getElementById(nomTabla);

    //console.log('------------------------------');
    //console.log(tablaHtml);

    //console.log('----------' + nomTabla  + '-------------');
    //console.log($('#' + nomTabla + ' tbody > tr:visible'));
    var htmlTabla = $('<table  />');
    var htmlTablaThead = $('<thead />');
    var htmlTablaTbody = $('<tbody />');

    var htmlTablaTfoot = $('<tfoot />');

    /*obteniendo el thead*/
    $.each($('#' + nomTabla + ' thead > tr' + (flagTablaOculta == true ? ':visible' : '')), function () {
        htmlTablaThead.append($(this)[0].outerHTML);
    });
    htmlTabla.append(htmlTablaThead[0]);

    /*obteniendo el tbody*/
    $.each($('#' + nomTabla + ' tbody > tr' + (flagTablaOculta == true ? ':visible' : '')), function () {
        htmlTablaTbody.append($(this)[0].outerHTML);
    });

    //console.log(htmlTablaThead[0]);
    //console.log(htmlTablaTbody[0]);
    //return;
    htmlTabla.append(htmlTablaTbody[0]);

    /*agregando tfoot*/
    $.each($('#' + nomTabla + ' tfoot > tr' + (flagTablaOculta == true ? ':visible' : '')), function () {
        htmlTablaTfoot.append($(this)[0].outerHTML);
    });
    htmlTabla.append(htmlTablaTfoot[0]);



    //console.log(htmlTabla[0]);
    tablaHtml = htmlTabla[0];

    //console.log(tablaHtml);
    //return;
    //return false;
    var fecAhora = new Date().toLocaleString();
    //"/Imagenes/Logos/TGA.png"
    var html = '<table>';
    var logo = ""

    var cabeceraExcel = '';

    html += `
            <tr>
                <td colspan ="${lenColumn - 1}" style="font-size:23px;text-align:center;text-decoration:underline;vertical-align:middle" rowspan="2">${nomTitulo}</td>
                <td style="text-align:left;">Usuario: ${usuario}</td>
            </tr>
            <tr>
                <td style="text-align:left;">F.Impre: ${fechaActual}</td>
            </tr>
            <tr>
                <td colspan ="${lenColumn - 1}" style="text-align:center;">${fechaIni == '' ? '' : 'Del: ' + fechaIni + ' ' + (fechaFin == '' ? '' : 'Al: ' + fechaFin)}</td>
                <td style="text-align:center;">T-GOA</td>
            </tr>
            <tr>
                <td colspan="${lenColumn}"></td>   
            </tr>
            <tr>
                <td></td>
                <td style="font-size: 11pt;font-weight: 700;">Empresa:</td>
                <td colspan="${lenColumn-2}" style="font-size: 11pt;font-weight: 700;">${nomEmpresa}</td>   
            </tr>
            <tr>
                <td></td>
                <td style="font-size: 11pt;font-weight: 700;">RUC:</td>
                <td colspan="${lenColumn-2}" style="text-align:left;font-weight: 700;">${ruc}</td>
            </tr>
            <tr>
                <td colspan="${lenColumn}"></td>   
            </tr>
            `
    if (nombreInspector != '') {
        html += `
                <tr>
                    <td></td>
                    <td style="text-align:left;font-weight: 700;">Inspector:</td>
                    <td colspan="${lenColumn-2}" style="text-align:left;font-weight: 700;">${nombreInspector}</td>
                </tr>
                `
    }

    if (horaInicio != '') {
        html += `
                <tr>
                    <td></td>
                    <td style="text-align:left;font-weight: 700;">Hora Inicio:</td>
                    <td colspan="${lenColumn-2}" style="text-align:left;font-weight: 700;">${horaInicio}</td>
                </tr>
                `
    }

    if (horaFin != '') {
        html += `
                <tr>
                    <td></td>
                    <td style="text-align:left;font-weight: 700;">Hora Fin:</td>
                    <td colspan="${lenColumn-2}" style="text-align:left;font-weight: 700;">${horaFin}</td>
                </tr>
                <tr>
                    <td colspan="${lenColumn}"></td>   
                </tr>
                `
    }

    cabeceraExcel = convertirCaracteresEspecialesAUniversal(html);



    //html = html + '<tr><td colspan="2">';

    var tab = document.getElementById(nomTabla); // id of table
    var tab = tablaHtml;
    //var tabCabecera = document.getElementById('tbCabecera');

    for (j = 0; j < tab.rows.length; j++) {
        tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
        //tab_text=tab_text+"</tr>";
    }

    tab_text = tab_text + "</table>";

    //console.log(tab_text);
    //return;

    var $tbtabla = $('<table />');
    var strHTMLTABLE;
    $.each($(tab_text).find('tbody > tr'), function (i) {
        $(this).find('td').css({ "background-color": "", "font-size": "10pt" });
        $(this).find('th').css({ "background-color": "#6098b9", "color": "white","font-size": "11pt", "height": "30px" });
        if (i % 2 == 0) {
            $tbtabla.append($(this).css("background-color", "white").css("height", "25px"));
        } else {
            $tbtabla.append($(this).css("background-color", "#ebf7fd !important").css("height", "25px"));
        }

        if (i == 0) {
            $tbtabla.append($(this).css("background-color", "#2d78d6").css("color", "white"));
        }
    });


    var strTablaFinal = $tbtabla.html();

    tab_text = strTablaFinal;
    tab_text = tab_text.replace("<tbody>", "").replace("</tbody>", "");
    tab_text = "<table >" + tab_text + "</table>";

    tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    //tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
    tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params
    tab_text = tab_text.replace(/<button[^>]*>|<\/button>/gi, ""); // reomves buttons params


    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    // if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
    // {
    //     txtArea1.document.open("txt/html", "replace");
    //     txtArea1.document.write(tab_text);
    //     txtArea1.document.close();
    //     txtArea1.focus();
    //     sa = txtArea1.document.execCommand("SaveAs", true, "Say Thanks to Sumit.xls");
    // }
    // else                 //other browser not tested on IE 11


    html = html + tab_text + '</td></tr></table>';


    var tablaFinalExcel = tab_text;

    //    console.log(tablaFinalExcel);
    //console.log("___");
    ////console.log(cabeceraExcel);
    //cabeceraExcel = cabeceraExcel + '</table>';
    //return;

    // sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(html));
    var data_type = 'data:application/vnd.ms-excel;base64';
    var a = document.createElement('a');
    tablaFinalExcel = convertirCaracteresEspecialesAUniversal(tablaFinalExcel);
    nomFileName = nomFileName.replace(/\//g, "");
    html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html"; charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>' + nomFileName + '</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>' + cabeceraExcel + tablaFinalExcel +
            '</body></html>'

    //a.href = data_type + ', ' + $.base64.encode(html);
    //a.download = nomFileName + '.xls';

    var csvData = new Blob([html], { type: 'text/csv' }); //new way
    var csvUrl = URL.createObjectURL(csvData);

    var filename = nomFileName + ".xls"

    $(a).attr({
        'download': nomFileName + '.xls',
        'href': csvUrl
    });

    a.click();
}

function reporteExcel() {
    // console.log('exportar a excel');
    var opciones = {
        sistema: 'SISTEMA WEB CITECTRAN',
        title: 'REPORTE DE KILOMETRAJE POR TIEMPO',
        filename: 'Reporte_kilometraje_tiempo'
    };
    fnExcelReport("tbPrueba", opciones);
}


function convertirCaracteresEspecialesAUniversal(strTexto) {

    strTexto = strTexto.replace(/á/g, "&aacute;");
    strTexto = strTexto.replace(/Á/g, "&Aacute;");
    strTexto = strTexto.replace(/é/g, "&eacute;");
    strTexto = strTexto.replace(/É/g, "&Eacute;");
    strTexto = strTexto.replace(/í/g, "&iacute;");
    strTexto = strTexto.replace(/Í/g, "&Iacute;");
    strTexto = strTexto.replace(/ó/g, "&oacute;");
    strTexto = strTexto.replace(/Ó/g, "&Oacute;");
    strTexto = strTexto.replace(/ú/g, "&uacute;");
    strTexto = strTexto.replace(/Ú/g, "&Uacute;");
    strTexto = strTexto.replace(/ñ/g, "&ntilde;");
    strTexto = strTexto.replace(/Ñ/g, "&Ntilde;");

    return strTexto;
}