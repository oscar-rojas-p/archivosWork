<style>
    /* estilo de la tabla el scrool bar */
    table.scroll tbody,
    table.scroll thead tr { display: block; }
    table.scroll tbody {
        height: 800px;
        overflow-y: auto;
        overflow-x: scroll;
    }
</style>

<style>
    .divScrol {
        overflow:scroll;
        height:91%;
        width:99%;
    }
    .divScrol table {
    width:400px;
    background-color:lightgray;
    }

    .select2 {
        margin-top: -11px;
    }
</style>

<div id="cabecera">
    <div id="divParametros" class="sombraFueraDeMapa" style="text-align: left; padding: 1em; height: 60px">
        <section id="secntionFechaInicio" style="display: inline">
            <i title="Fecha Inicio" class="medium material-icons dp48 datepicker" style="cursor: pointer; margin-left: 15px;">date_range</i>
            <input onchange="listarIncidencias()" style="text-align: center; width: 7em; margin-bottom: 1em;" type="text" id="txtFechaInicio" value="<%: Date.Now.ToString("dd/MM/yyyy")%>" />
        </section>     
        <section id="secntionFechaFin" style="display: inline">
            <i title="Fecha Fin" class="medium material-icons dp48 datepicker" style="cursor: pointer; margin-left: 15px;">date_range</i>
            <input onchange="listarIncidencias()" style="text-align: center; width: 7em; margin-bottom: 1em;" type="text" id="txtFechaFin" value="<%: Date.Now.ToString("dd/MM/yyyy")%>" />
        </section>
        <section id="sectionConductor" style="display: inline;">
            <i title="Nombre Conductor" class="fa fa-bus" aria-hidden="true" style="margin-bottom: 14px;font-size: 20px;cursor: pointer; margin-left: 15px;vertical-align: middle;"></i>
            <select id="selectConductor" onchange="listarIncidencias()" style="width: 200px;margin-bottom: 13px;border-radius: 5px;">
            </select>
        </section>
        <section id="sectionInspector" style="display: inline">
            <i title="Nombre Inspector" class="fa fa-user" aria-hidden="true" style="margin-bottom: 14px ;font-size: 20px;cursor: pointer; margin-left: 15px; vertical-align: middle;"></i>
            <select id="selectInspector" onchange="listarIncidencias()" style="width: 200px;margin-bottom: 13px;border-radius: 5px;">
            </select>
        </section>
        <!-- <section id="sectionVista" style="display: inline">
            <i title="Tipo de Vista" class="fas fa-list" aria-hidden="true" style="margin-bottom: 14px ;font-size: 20px;cursor: pointer; margin-left: 15px; vertical-align: middle;"></i>
            <select id="selectVista" onchange="listarIncidencias()" style="width: 200px;margin-bottom: 13px;border-radius: 5px;">
                <option value="1">CONSOLIDADO</option>
                <option value="2">DETALLADO</option>
            </select>
        </section> -->
        <button title="Exportar a Excel" class="fluent-button button trans" onclick="exportarGuiaInspectoria();" style="margin-bottom: 1em;margin-left: 7px;" type="button">
            <img src="../../Imagenes/Iconos/icoExcel.png" /></button>

        <table>
            <tr>
                <td>
                    <div class="subTitulo" style="margin-top: -61px;margin-right: 10px; display: inline; position:absolute; right: 0;">
                        <h2>Guia de Inspectoria</h2>
                    </div>
                </td>
            </tr>
        </table>   
    </div>
</div>

<div style="margin-left: 15px;margin-right: 15px;margin-top: 15px;" class="divScrol">
    <table style="width:100%" id="tbGuiaInspectoria" class="Tabla" border="1">
        <thead class="ui-widget-header">
        </thead>
        <tbody class="ui-widget-content">
        </tbody>
    </table>
</div>
<div>
    <table id="tbExportarGuia" class="Tabla" border="1" style="display: none;">
        <thead class="ui-widget-header">
        </thead>
        <tbody class="ui-widget-content">
        </tbody>
    </table>
</div>


<script>
    let UrlGeneral = "../Controladores/GeneralPostController.ashx"
    let valorFechaInicio = document.getElementById('txtFechaInicio')
    let valorFechaFin = document.getElementById('txtFechaFin')
    let conductorSelect = document.getElementById('selectConductor')
    let inspectorSelect = document.getElementById('selectInspector')
    let horaComienzoInspector = 0
    let horaFinalIsnpector = 0

    $(document).ready(function () {
        $('#txtFechaInicio').datepicker({
            dateFormat: 'dd/mm/yy',
            maxDate: '+0D',
        });
        $('#txtFechaFin').datepicker({
            dateFormat: 'dd/mm/yy',
            maxDate: '+0D',
        });

        listarConductores();
        listarInspectores();
        listarIncidencias();
    })

    function listarIncidencias(){
        $('#tbGuiaInspectoria thead').empty()
        $('#tbGuiaInspectoria tbody').empty()
        $('#tbExportarGuia thead').empty()
        $('#tbExportarGuia tbody').empty()
        horaComienzoInspector = 0
        horaFinalIsnpector = 0
        let strCabecera = ''
        let strCabeceraExportar = '' 
        let strCuerpo = ''
        let strCuerpoExportar = ''

        strCabecera =   `
                        <tr>
                            <th style="text-align: center;width: 30px">N&deg;</th>
                            <th style="text-align: center;width: 116px">FECHA</th>
                            <th style="text-align: center;" title="Paradero Control">P. CONTROL</th>
                            <th style="text-align: center;width: 116px">HORA SUBIDA</th>
                            <th style="text-align: center;width: 116px">HORA BAJADA</th>
                            <th style="text-align: center;width: 85px">PADRON</th>
                            <th style="text-align: center;width: 85px">PLACA</th>
                            ${conductorSelect.value == 0 && '<th style="text-align: center;width: 210px" title="Nombre del Conductor">N. CONDUCTOR</th>'}
                            <th style="text-align: center;" >INCIDENCIAS</th>
                            <th style="text-align: center;" >OBSERVACIONES</th>
                            <th style="text-align: center;width: 100px">REINTEGROS</th>
                            ${inspectorSelect.value == 0 && '<th style="text-align: center;width: 210px" title="Nombre del Inspector">N. INSPECTOR</th>'}
                        </tr>
                        `
        $('#tbGuiaInspectoria thead').append(strCabecera)

        strCabeceraExportar =       `
                                    <tr>
                                        <th style="text-align: center;">N</th>
                                        <th style="text-align: center;">FECHA</th>
                                        <th style="text-align: center;">PARADERO CONTROL</th>
                                        <th style="text-align: center;">HORA SUBIDA</th>
                                        <th style="text-align: center;">HORA BAJADA</th>
                                        <th style="text-align: center;">PADRON</th>
                                        <th style="text-align: center;">PLACA</th>
                                        <th style="text-align: center;">NOMBRE CONDUCTOR</th>
                                        <th style="text-align: center;">INCIDENCIAS</th>
                                        <th style="text-align: center;">OBSERVACIONES</th>
                                        <th style="text-align: center;">REINTEGROS</th>
                                        ${inspectorSelect.value == 0 && '<th style="text-align: center;">NOMBRE INSPECTOR</th>'}
                                    </tr>
                                    `
        $('#tbExportarGuia thead').append(strCabeceraExportar)
        
        const Data = {
            Procedimiento: "ins.ProcReporteInspectoria", 
            Parametro: `${valorFechaInicio.value}|${valorFechaFin.value}|${conductorSelect.value}|${inspectorSelect.value}`,
            Indice: 24
        }

        var lenColumn = $('#tbGuiaInspectoria').find('thead tr').eq(0).find('th').length;
        var lenColumnExport = $('#tbExportarGuia').find('thead tr').eq(0).find('th').length;

        $.getJSON(urlGeneral, Data, function (Datos) {
            let jsonDatos = Datos['dt0']

            if(jsonDatos.length == 0){
                strCuerpo = `<tr>
                                <td colspan="${lenColumn}">No se ha encontrado informacion con los parametros seleccionados.</td> 
                            </tr>`

                strCuerpoExportar = `<tr>
                                        <td style="text-align:center" colspan="${lenColumnExport}">No se ha encontrado informacion con los parametros seleccionados.</td> 
                                    </tr>`

                $('#tbGuiaInspectoria tbody').append(strCuerpo)
                $('#tbExportarGuia tbody').append(strCuerpoExportar)
            }else{
                $.each(jsonDatos, function (i) {
                    //intervalo de horarios de sus actividades en caso sea un solo inspector
                    if(inspectorSelect.value != 0){
                        if(i == 0){
                            horaComienzoInspector = this.HoraSubida
                        }
                        if(i == jsonDatos.length - 1){
                            horaFinalIsnpector = this.HoraBajada
                        }
                    }
                    strCuerpo +=    `<tr>
                                        <td style="text-align:center">${i+1}</td>
                                        <td style="text-align:center">${this.Fecha}</td>
                                        <td style="text -align:center">${this.NomZona == '' ? '-' : this.NomZona}</td>
                                        <td style="text-align:center">${this.HoraSubida}</td>
                                        <td style="text-align:center">${this.HoraBajada}</td>
                                        <td style="text-align:center">${this.Padron}</td>
                                        <td style="text-align:center">${this.Placa}</td>
                                        ${conductorSelect.value == 0 && '<td style="text-align:left" title="' + this.NomConductor + '">' + this.NomConductor + '</td>'}
                                        <td style="text-align:center" title="${this.NomIncidencia == '' ? '' : this.NomIncidencia}">${this.NomIncidencia == '' ? '-' : this.NomIncidencia}</td>
                                        <td style="text-align:center" title="${this.Observacion == '' ? '' : this.Observacion}">${this.Observacion == '' ? '-' : this.Observacion}</td>
                                        <td style="text-align:center">${this.Reintegro}</td>
                                        ${inspectorSelect.value == 0 && '<td style="text-align:left" title="' + this.NomInspector + '">' + this.NomInspector + '</td>'}
                                    <tr>`
                    strCuerpoExportar +=    `<tr>
                                                <td style="text-align:center">${i+1}</td>
                                                <td style="text-align:center">${this.Fecha}</td>
                                                <td style="text-align:center">${this.NomZona == '' ? '-' : this.NomZona}</td>
                                                <td style="text-align:center">${this.HoraSubida}</td>
                                                <td style="text-align:center">${this.HoraBajada}</td>
                                                <td style="text-align:center">${this.Padron}</td>
                                                <td style="text-align:center">${this.Placa}</td>
                                                <td style="text-align:center">${this.NomConductor}</td>
                                                <td style="text-align:center">${this.NomIncidencia == '' ? '-' : this.NomIncidencia}</td>
                                                <td style="text-align:center">${this.Observacion == '' ? '-' : this.Observacion}</td>
                                                <td style="text-align:center">${this.Reintegro}</td>
                                                ${inspectorSelect.value == 0 && '<td style="text-align:center">' + this.NomInspector + '</td>'}
                                            <tr>`
                });
                $('#tbGuiaInspectoria tbody').append(strCuerpo)
                $('#tbExportarGuia tbody').append(strCuerpoExportar)
            }
        })
    }

    function listarConductores(){
        const Data = {
            Procedimiento: "dbo.ProcPersonaV3", 
            Parametro: '4',
            Indice: 13
        }
        $.getJSON(urlGeneral, Data, function (Datos) {
            let jsonDatos = Datos['dt0']
            var strConductores = '';
            strConductores += '<option value="0">--TODOS--</option>'
            $.each(jsonDatos, function (i) {
                strConductores += `<option value="${this.CodPersona}">${this.Persona}</option>`;
            });
            $('#selectConductor').empty();
            $('#selectConductor').append(strConductores);
            $('#selectConductor').select2();
        })
    }

    function listarInspectores(){
        const Data = {
            Procedimiento: "ins.ProcReporteInspectoria", 
            Parametro: '',
            Indice: 16
        }
        $.getJSON(urlGeneral, Data, function (Datos) {
            let jsonDatos = Datos['dt0']
            var strInspectores = '';
            strInspectores += '<option value="0">--TODOS--</option>'
            $.each(jsonDatos, function (i) {
                strInspectores += `<option value="${this.CodPersona}">${this.Inspector}</option>`;
            });
            $('#selectInspector').empty();
            $('#selectInspector').append(strInspectores);
            $('#selectInspector').select2();
        })
    }

    function exportarGuiaInspectoria(){
        var nomEmp = nombreDeEmpresa.toUpperCase();
        var opciones = {
            sistema: 'GUIA DE INSPECTORIA',
            title: 'GUIA DE INSPECTORIA',
            filename: 'GUIA DE INSPECTORIA',
            empresa: nomEmp,
        }

        if(inspectorSelect.value == 0){
            var parametros = {
                ruc: codUrl,
                nomUsuario: UsuarioGeneral,
                fechaInicio: $("#txtFechaInicio").val(),
                fechaFin: $("#txtFechaFin").val()
            }
        }else{
            var parametros = {
                ruc: codUrl,
                nomUsuario: UsuarioGeneral,
                fechaInicio: $("#txtFechaInicio").val(),
                fechaFin: $("#txtFechaFin").val(),
                nombreInspector: inspectorSelect.options[inspectorSelect.selectedIndex].text,
                horaInicio: horaComienzoInspector,
                horaFin: horaFinalIsnpector
            }
        }
        fnExcelReportGuiaInspectoria("tbExportarGuia", opciones, parametros, "GUIA DE INSPECTORIA");
    }

    function formatoFecha(fecha){
        let dia = fecha.slice(8,10)
        let mes = fecha.slice(5,7)
        let anio = fecha.slice(0,4)
        return dia + '/' + mes + '/' + anio;
    }

</script>