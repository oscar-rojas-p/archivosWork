const urlGeneral = NombreAplicacion + '/GeneralPost/ProcGeneralPostBDGeneral';
const UrlNueva = NombreAplicacion  + '/GeneralPost/ProcGeneralPost';

//modal registro de linea
const operadorSelectModal = document.querySelector('#selectOperador')
const telefonoInputModal = document.querySelector('#inputTelefono')
const imeiInputModal = document.querySelector('#inputIMEI')
const simCardInputModal = document.querySelector('#inputSimCard')
const planTarifarioSelectModal = document.querySelector('#selectPlanTarifario')
const fechaActivacionModal = document.querySelector('#txtFechaActivacion')
const diaRenovInputModal = document.querySelector('#inputDiaRenov')
const fechaRenovacionModal = document.querySelector('#txtFechaRenovacion')
const vigenciaInputModal = document.querySelector('#inputVigencia')
//modal cambio de estado y situaciones
const logo = document.querySelector('#contenedorLogo')
const switchActivoInput = document.querySelector('#switchActivo')
const switchInactivoInput = document.querySelector('#switchInactivo')
const divInactivar = document.querySelector('#divInactivarLinea')
const switchSuspenderInput = document.querySelector('#f-option')
const switchAnularInput = document.querySelector('#s-option')
const situacionSelect = document.querySelector('#selectSituacion')
const ubicacionSelect = document.querySelector('#selectUbicacion')
let temporalEstado = 0
//operadores
let arrOperadores = []
let longitudOperadores = 0
//empresas
let arrEmpresas = []
let longitudEmpresas = 0
//filtro tree viewer
const optionsTreeViewer = document.querySelector('#opcionesTreeViewer')
let arrayFiltro = []
let jsonFiltro = []
let cadenaDeParametro = ''
/////////
let parametroSinFiltro = ''
let cadenaEmpresasSinFiltro = ''
/////////
let longitudEstados = 0
let longitudSituaciones = 0
/////////

const tablaLineas = document.querySelector('#tablaLineas');
const tablaLineasExportar = document.querySelector('#tabla-LineasExportar')

// --------------- MODALES ------------------
let divRegistro = $('#modalRegistro')
let divHistorial = $('#divHistorial')
let divCambioEstadoySituacion = $('#divEstadoySituacion')
let divFiltrodeFiltros = $('#modalEmpresasOperadoresFiltro')

document.addEventListener("DOMContentLoaded", async () => {
    
    ObjUtil.Modal(divRegistro, 'auto', '640px', true, false, false, true, 'Registrar Línea');
    ObjUtil.Modal(divHistorial, 'auto', '1043px', true, false, false, true, 'Historial de movimientos');
    ObjUtil.Modal(divCambioEstadoySituacion, 'auto' , '600px', true, false, false, true, 'Registrar Movimiento de Línea');
    ObjUtil.Modal(divFiltrodeFiltros, 'auto' , '390px', true, false, false, false, 'Selección específica de empresas')

    $('#txtFechaActivacion').datepicker({
        dateFormat: 'dd/mm/yy',
        maxDate: '+0d'
    });
    $('#txtFechaRenovacion').datepicker({
        dateFormat: 'dd/mm/yy',
    });
    $('#fechaSuspencionOpcion').datepicker({
        dateFormat: 'dd/mm/yy',
    });

    $('#txtBuscar').prop('readonly', true);
    $('#txtBuscar').click(function () {
        $('#txtBuscar').prop('readonly', false);
    })
    onKeyUpTextBuscar($('#tablaLineas'))

    ///////////////////////////////
    $.ui.dialog.prototype._allowInteraction = function (e) {
        return !!$(e.target).closest('.ui-dialog, .ui-datepicker, .select2-dropdown').length;
    };
    ///////////////////////////////

    

    await listarLineas('0*0*0*0*0')
    await llenarCombosOperadores()
    await actualizarDivSelectEmpresas()
    await llenarPersonas()

    //FUNCIONES PARA OCULTAR LAS OPTIONS DE LOS DIV-SELECTS
    document.addEventListener('mouseup', function(e) {
        var select1 = document.getElementById('divSelectOperadores')
        var combo1 = document.getElementById('opcionesOperadores');
        if (!combo1.contains(e.target) && !select1.contains(e.target) && combo1.style.display != 'none') {
            combo1.style.display = 'none';
            document.querySelector('#flechitaOperadores').classList.replace("fa-arrow-up","fa-arrow-down")
        }
    });
    document.addEventListener('mouseup', function(e) {
        var select2 = document.getElementById('divSelectEmpresas')
        var combo2 = document.getElementById('opcionesEmpresas');
        if (!combo2.contains(e.target) && !select2.contains(e.target) && combo2.style.display != 'none') {
            combo2.style.display = 'none';
            document.querySelector('#flechitaEmpresas').classList.replace("fa-arrow-up","fa-arrow-down")
        }
    });
    document.addEventListener('mouseup', function(e) {
        var select1 = document.getElementById('divSelectOperadores')
        var select2 = document.getElementById('divSelectEmpresas')
        var select3 = document.getElementById('divSelectTreeCheckbox')
        var combo3 = document.getElementById('opcionesTreeViewer');
        if ((select1.contains(e.target) || select2.contains(e.target)) && combo3.style.display != 'none') {
            combo3.style.display = 'none';
            document.querySelector('#flechitaSelect').classList.replace("fa-arrow-up","fa-arrow-down")
        }
    });
})

async function llenarCombosOperadores() {
    const data = {
        Procedimiento: 'ProcGeneral',
        Parametro: '',
        Indice: 10
    };

    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0']

    longitudOperadores = jsondata.length

    let strOptions = ''
    let strOptionsDiv = '<input id="optionOperador0" onchange="marcarDesmarcarTodosOperadores(),actualizarDivSelectEmpresas(),nuevoParametroSinFiltro()" type="checkbox" style="cursor:pointer" checked><label for="optionOperador0" style="padding-left:5px;cursor:pointer">Todos</label><br>'

    jsondata.map(function (data, i) {
        strOptions += `<option value="${data.Codigo}">${data.Nombre}</option>`
        strOptionsDiv += `<input id="optionOperador${i+1}" data-codoperador="${data.Codigo}" onchange="verificarCheckOperador(),actualizarDivSelectEmpresas(),nuevoParametroSinFiltro()" type="checkbox" style="cursor:pointer" checked><label for="optionOperador${i+1}" style="padding-left:5px;cursor:pointer">${capitalizarOraciones(data.Nombre)}</label><br>`
    })

    operadorSelectModal.innerHTML = strOptions
    document.querySelector('#comboGeneralOperadores').innerHTML = strOptionsDiv

    getPlanTarifario()
}

async function nuevoParametroSinFiltro(){
    parametroSinFiltro = ''
    arrOperadores.map(function(data,i){
        parametroSinFiltro += data + ','
    })

    parametroSinFiltro = `${parametroSinFiltro.slice(0,-1)}*0*0*0*0`
    //para limpiar las empresas sin filtro
    cadenaEmpresasSinFiltro = ''
    cadenaDeParametro = ''

    arrOperadores.length != 0 && ObjUtil.MostrarMensaje('Se actualizó la lista de empresas',1)
    document.getElementById('divSelectEmpresas').classList.remove('actualizado')
    setTimeout(() => document.getElementById('divSelectEmpresas').classList.add('actualizado'), 100)
    document.getElementById('divSelectTreeCheckbox').classList.remove('actualizado')
    setTimeout(() => document.getElementById('divSelectTreeCheckbox').classList.add('actualizado'), 100)
}

async function listarLineas(parametros) {

    document.querySelector('#iconCargar').style.display = ''

    $.fn.dataTable.ext.errMode = function(obj,param,err){
        var tableId = obj.sTableId;
        console.log('Handling DataTable issue of Table '+tableId);
    };

    let filtrado = ''
    if(parametros){
        filtrado = parametros
    }else{
        if(cadenaDeParametro){
            filtrado = cadenaDeParametro
        }else{
            if(parametroSinFiltro){
                filtrado = parametroSinFiltro
            }else{
                if(cadenaEmpresasSinFiltro){
                    filtrado = cadenaEmpresasSinFiltro
                }else{
                    filtrado = '0*0*0*0*0'
                }
            }
        }
    }

    let contador = 0
    for (let i = 1; i <= longitudOperadores; i++) {
        document.querySelector(`#optionOperador${i}`).checked && contador++
    }
    
    let strCabecera = ''
    let strCuerpo = ''
    let strCuerpoExportar = ''
    
    const data = {
        Procedimiento: 'dbo.ProcChipSituacion',
        Parametro:filtrado,
        Indice: 10, 
    };
    const response = await fetch(urlGeneral, DataFetch(data, 'POST')).then(res => res.json());
    const lineas = response['dt0'];
    
    strCabecera =   `
                    <tr>
                        <th data-sort="int" style="vertical-align:middle;text-align:center;width:20px">Nº</th>
                        ${contador==1 ? '' : '<th data-sort="string" style="vertical-align:middle;text-align: center;width:200px;">OPERADOR</th>'}
                        <th data-sort="int" style="vertical-align:middle;text-align: center;width:80px;">TELÉFONO</th>
                        <th data-sort="date" style="vertical-align:middle;text-align: center;width:150px;">FECHA ACTIVACIÓN</th>
                        <th data-sort="date" style="vertical-align:middle;text-align: center;width:150px;">FECHA RENOVACIÓN</th>
                        <th data-sort="string" style="vertical-align:middle;text-align: center;width:150px;">PLAN TARIFARIO</th>
                        <th data-sort="string" style="vertical-align:middle;text-align: center;width:300px;">EMPRESA</th>
                        <th data-sort="string" style="vertical-align:middle;text-align: center;width:300px;">DESTINO</th>
                        <th data-sort="string" style="vertical-align:middle;text-align: center;width:150px;">ESTADO</th>
                        <th data-sort="string" style="vertical-align:middle;text-align: center;width:200px;">SITUACIÓN</th>
                        <th data-sort="string" style="vertical-align:middle;text-align: center;width:200px;">UBICACIÓN</th>
                        <th style="vertical-align:middle;text-align: center;"></th>
                        <th style="vertical-align:middle;text-align: center;"></th>
                    </tr>
                    `

    //tablaLineas.getElementsByTagName('thead')[0].innerHTML = strCabecera
    $('#tablaLineas thead').empty()
    $('#tablaLineas thead').append(strCabecera)

    if (lineas.length == 0) {
        
        let str = `<tr><td colspan="14" style="text-align:center">No hay información que mostrar con los parametros seleccionados</td><tr>`;
        $('#tablaLineas tbody').empty()
        $('#tablaLineas tbody').append(str)
        return;
    }
    
    lineas.map(function(linea, i){

        strCuerpo +=    `
                        <tr class="colorear option" onclick="pintarTrJs(this)">
                            <td style="vertical-align:middle;text-align: center;width:20px">${i+1}</td>
                            ${contador==1 ? '' : '<td style="vertical-align:middle;text-align: center;width:200px;">' + linea.NomProveedor + '</td>'}
                            <td style="vertical-align:middle;text-align: center;width:80px;">${linea.Telefono}</td>
                            <td style="vertical-align:middle;text-align: center;width:150px;">${linea.FechaActivacion ? linea.FechaActivacion : ''}</td>
                            <td style="vertical-align:middle;text-align: center;width:150px;">${linea.FechaRenovacionFin ? linea.FechaRenovacionFin : '' }</td>
                            <td style="vertical-align:middle;text-align: center;width:150px;">${linea.NomChipPlan ? linea.NomChipPlan : '' }</td>
                            <td style="vertical-align:middle;text-align: center;width:300px">${linea.NomEmpresa}</td>
                            <td style="vertical-align:middle;text-align: center;width:300px;">${linea.NomChipDestino}</td>
                            <td style="vertical-align:middle;text-align: center;width:150px;"><span class="${linea.CodEstado == 1 ? 'label label-success' : 'label label-danger'}">${linea.NomEstado}</span></td>
                            <td style="vertical-align:middle;text-align: center;width:200px;"><span style="cursor:pointer" class="label label-primary">${linea.NomSituacion.toUpperCase()}</span></td>
                            <td style="vertical-align:middle;text-align: center;width:200px;"><span style="cursor:pointer" class="label label-info ${linea.NomUnidad? 'info2' :  linea.NomPersona? 'info2': '' }" title="${linea.NomUnidad? linea.NomUnidad :  linea.NomPersona}" >${linea.NomUbicacion.toUpperCase()}</span></td>
                            <td style="vertical-align:middle;text-align: center;"><i onclick="abrirModalEstadoySituacion(${linea.CodProveedor},${linea.CodChip},${linea.Telefono},${linea.CodEstado},${linea.CodSituacion},${linea.CodEmpresaActual})" title="Modificar estado/situación de línea" style="cursor:pointer;color:#2086da;font-size:22px" class="fa fa-mobile info2 " aria-hidden="true"></i></td>
                            <td style="vertical-align:middle;text-align: center"><i onclick="abrirModalHistorial(${linea.CodChip},${linea.Telefono})" title="Historial de movimientos" style="cursor:pointer;color:#2086da;font-size:22px" class="fa fa-history info2 " aria-hidden="true"></i></td>
                        </tr>
                        `
        
        // tr.style.height = '45px'
        //$('.info2').tooltipster({multiple:true})

        strCuerpoExportar +=    `
                                <tr>
                                    <td style="vertical-align:middle;text-align: center">${i+1}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomProveedor}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.Telefono}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.FechaActivacion}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.FechaRenovacionFin}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomChipPlan}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomEmpresa}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomChipDestino}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomUnidad}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.RutaActual}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomEstado}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomSituacion.toUpperCase()}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomUbicacion.toUpperCase()}</td>
                                </tr>
                                `
    })
    //tablaLineas.getElementsByTagName('tbody')[0].innerHTML = strCuerpo
    $('#tablaLineas tbody').empty()
    $('#tablaLineas tbody').append(strCuerpo) 
    tablaLineasExportar.getElementsByTagName('tbody')[0].innerHTML = strCuerpoExportar
    
    //let tabla = $('#tablaLineas').DataTable()
    //stabla.destroy()
    $('#tablaLineas').DataTable( {
        "processing": true,     //spinner por defecto del datatable
        "serverSide": true,     //lado del servidor         
        "ajax" : '',
        "ordering": false,
        "searching": false,     //caja de busqueda
        "bPaginate": false,     //show-entries 
        "scrollY": 700,         //tamaño del alto
        "scroller": {
            loadingIndicator: true
        },
        "deferRender": true,    //renderizado diferido
    } );
    
    document.querySelector('#iconCargar').style.display = 'none'

}

//----------MODAL REGISTRO-----------
async function abrirModalRegistrar(){
    divRegistro.dialog({
        title: 'Registrar Línea',
        buttons: {
            'Guardar': function () {     
                if(telefonoInputModal.value==''||imeiInputModal==''||simCardInputModal.value==''||diaRenovInputModal.value==''||vigenciaInputModal.value==''){
                    ObjUtil.MostrarMensaje("Debe completar todos los campos",2)
                    return
                }else{
                    registrarLinea()
                }             
            },
            'Cancelar': function () {
                divRegistro.dialog("close");
            }
        },
        close: function () {
            divRegistro.dialog("close");
        }
    });
    divRegistro.dialog('open')

    telefonoInputModal.value = ''
    imeiInputModal.value = ''
    simCardInputModal.value = ''
    diaRenovInputModal.value = ''
    vigenciaInputModal.value = ''
}

async function registrarLinea(){
    const data = {
        Procedimiento: 'dbo.ProcChipSituacion',
        Parametro: `${telefonoInputModal.value}|${imeiInputModal.value}|${simCardInputModal.value}|${planTarifarioSelectModal.value}|${fechaActivacionModal.value}|${diaRenovInputModal.value}|${fechaRenovacionModal.value}|${vigenciaInputModal.value}|${CodigoUsuario}`,
        Indice: 20
    };
    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0'][0]
    ObjUtil.MostrarMensaje(jsondata.DesResultado,jsondata.CodResultado);
    if (Number(jsondata.CodResultado) == 1) {
        divRegistro.dialog('close');
        if(cadenaDeParametro){
            await listarLineas()
        }else{
            await listarLineas('0*0*0*0*0')
        }
    }
}

async function getPlanTarifario() {
    const data = {
        Procedimiento: 'dbo.ProcChipPlan',
        Parametro: operadorSelectModal.value,
        Indice: 10
    }

    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0']
    let strOptions = ''

    jsondata.map(function (data, i) {
        strOptions += `<option value="${data.CodChipPlan}">${data.NomChipPlan}</option>`
    })

    planTarifarioSelectModal.innerHTML = strOptions
}
//-----------FIN MODAL REGISTRO------------





//--INICIO MODAL DE MOVIMIENTO DE LINEA--

async function abrirModalEstadoySituacion(codigoProveedor,codigoChip,telefono,valorEstado,valorSituacion,codigoEmpresa){
    divCambioEstadoySituacion.dialog({
        title: 'Registrar Movimiento de Línea',
        buttons: {
            'Guardar':function() {  
                guardarMovimientoDeLinea(codigoChip)
            },
            'Cancelar': function() {
                divCambioEstadoySituacion.dialog("close");
            }
        },
        close: function () {
            divCambioEstadoySituacion.dialog("close");
        }
    });
    divCambioEstadoySituacion.dialog('open')

    switch (codigoProveedor) {
        case 1:
            logo.innerHTML = `
                <img src="data:image/jpeg;base64,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" alt="">
                <h2 style="text-align:center;margin-top:-48px">987654321</h2>
            `
            break;
        case 2:
            logo.innerHTML = `
                <img src="data:image/png;base64,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" alt="">
                <h2 style="text-align:center;margin-top:-48px">987654321</h2>
            `
            break;
        case 3:
            logo.innerHTML = `
                <img src="data:image/jpeg;base64,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" alt="">
                <h2 style="text-align:center;margin-top:-48px">987654321</h2>
            `
            break;
        case 4:
            logo.innerHTML = `
                <img src="data:image/png;base64,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" alt="">
                <h2 style="text-align:center;margin-top:-48px">987654321</h2>
            `
            break;
        default:
            break;
    }
    document.getElementById('divEstadoySituacion').parentElement.childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[3].innerText = telefono
    document.getElementById('divEstadoySituacion').parentElement.childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[3].style.marginLeft = '25px'
    document.querySelector('#inputComentario').value = ''
    temporalEstado = valorEstado
    
    if(valorEstado == 1){
        switchActivoInput.checked = true
        switchInactivoInput.checked = false
        divInactivar.style.display = "none"
        document.querySelector('#divSituacionesActivo').style.display = ""
    }else{
        switchActivoInput.checked = false
        switchInactivoInput.checked = true
        divInactivar.style.display = ""
        document.querySelector('#divSituacionesActivo').style.display = "none"

        //setear el valor de la situacion
        if(valorSituacion == 8){ //8-suspendido
            switchSuspenderInput.checked = true
            switchAnularInput.checked = false
        }else if(valorSituacion == 9){ //9-anulado
            switchSuspenderInput.checked = false
            switchAnularInput.checked = true
        }else{
            switchSuspenderInput.checked = false
            switchAnularInput.checked = false
        }
    }
    await llenarComboSituacion(valorEstado,valorSituacion)

    if(codigoEmpresa){
        document.querySelector('#selectEmpresa').value = codigoEmpresa
    }
}
async function guardarMovimientoDeLinea(codigoChip){

    let codigoSituacion = 0
    let codigoUbicacion = 0
    let codigoPersona = 0
    let comentario = ''
    let codigoEmpresa = 4
    let fechaSuspension = null
    if(switchActivoInput.checked){
        codigoSituacion = situacionSelect.value
        document.querySelector('#divUbicacion').style.display != 'none' && (codigoUbicacion = ubicacionSelect.value)
        document.querySelector('#divPersonas').style.display != 'none' && (codigoPersona = $('#selectPersona').val())
        document.querySelector('#divComentario').style.display != 'none' && (comentario = document.querySelector('#inputComentario').value)
        document.querySelector('#divEmpresas').style.display != 'none' && (codigoEmpresa = document.querySelector('#selectEmpresa').value)
    }else{
        codigoEmpresa = 0
        codigoSituacion = switchSuspenderInput.checked ? 8 : 9
        switchSuspenderInput.checked && (fechaSuspension = document.querySelector('#fechaSuspencionOpcion').value)
    }

    const data = {
        Procedimiento: 'dbo.ProcChipSituacion',
        Parametro: `${codigoChip}|${switchActivoInput.checked ? 1 : 2}|${codigoSituacion}|${codigoUbicacion}|${codigoPersona}|${codigoEmpresa}|${comentario}|${CodigoUsuario}|${fechaSuspension}`,
        Indice: 30,
    };
    const response = await fetch(urlGeneral, DataFetch(data, 'POST')).then(res => res.json());
    const jsondata = response['dt0'][0];

    await ObjUtil.MostrarMensaje(jsondata.DesResultado,jsondata.CodResultado);

    if (Number(jsondata.CodResultado) == 1) {

        divCambioEstadoySituacion.dialog('close');
        if(cadenaDeParametro){
            await listarLineas()
        }else{
            await listarLineas('0*0*0*0*0')
        }
    }
}
function activoInactivo(value){ //1 activo - 2 inactivo
    if(temporalEstado==1){
        if (value == 1){
            divInactivar.style.display = "none"
        }else{
            divInactivar.style.display = ""
            switchSuspenderInput.checked = false
            switchAnularInput.checked = false
        }
    }else{
        if (value == 1){
            divInactivar.style.display = "none"
            document.querySelector('#divSituacionesActivo').style.display = ""

            llenarComboSituacion(1,7)  //setea el valor de disponible al estado del chip   
        }else{
            divInactivar.style.display = ""
            document.querySelector('#divSituacionesActivo').style.display = "none"
            
        }
    }
}
async function llenarComboSituacion(estado,codigoSituacion){
    const data = {
        Procedimiento: 'ProcChipSituacion',
        Parametro: estado,
        Indice: 12
    };

    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0']
    let strOptions = ''

    jsondata.map(function (data, i) {
        strOptions += `<option value="${data.CodSituacion}">${data.NomSituacion}</option>`
    })

    situacionSelect.innerHTML = strOptions
    situacionSelect.value = codigoSituacion
    await llenarComboUbicacion(codigoSituacion)
}
async function llenarComboUbicacion(situacion){
    document.querySelector('#inputComentario').value = ''

    situacion = parseInt(situacion)
    const data = {
        Procedimiento: 'ProcChipSituacion',
        Parametro: situacion,
        Indice: 13
    };

    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0']

    if(situacion == 2 || situacion == 3 || situacion == 4 || situacion == 5){
        document.querySelector('#divComentario').style.display = ''
    }else{
        document.querySelector('#divComentario').style.display = 'none'
    }

    if(situacion == 1){
        document.querySelector('#selectEmpresa').innerHTML = await llenarEmpresasModalMovimiento(0)
        document.querySelector('#divEmpresas').style.display = ''
    }else{
        document.querySelector('#divEmpresas').style.display = 'none'
    }

    if(jsondata.length == 0){
        document.querySelector('#divUbicacion').setAttribute('style','display:none')
        document.querySelector('#divPersonas').style.display = 'none'
        return
    }
    document.querySelector('#divUbicacion').setAttribute('style','display:')

    let strOptions = ''
    jsondata.map(function (data, i) {
        strOptions += `<option value="${data.CodUbicacion}">${data.NomUbicacion}</option>`
    })

    ubicacionSelect.innerHTML = strOptions
    
    if(situacion == 6 && ubicacionSelect.value == 3){
        document.querySelector('#divPersonas').style.display = ''
    }else{
        document.querySelector('#divPersonas').style.display = 'none'
    }

}
async function cambioUbicacion(val){
    val == 4 ? document.querySelector('#divComentario').style.display = '' : document.querySelector('#divComentario').style.display = 'none'

    if(val == 6){
        document.querySelector('#selectEmpresa').innerHTML = await llenarEmpresasModalMovimiento(1)
        document.querySelector('#divEmpresas').style.display = ''
    }else{
        document.querySelector('#divEmpresas').style.display = 'none'
    }

    val == 3 ? document.querySelector('#divPersonas').style.display = '' : document.querySelector('#divPersonas').style.display = 'none'
}
async function llenarPersonas(){
    let Data = {
        Procedimiento: 'pna.ProcProgramacionAusencia ',
        Parametro: '',
        Indice: 12
    }
    const response = await fetch(UrlNueva, DataFetch(Data, 'POST')).then(res => res.json());
    const jsondata = response['dt0'];
    let strOpciones = ''
    
    $('#selectPersona').empty()
    
    jsondata.map(function(data){
        strOpciones += `<option value="${data.CodPersona}">${capitalizarOraciones(data.NomPersona)}</option>`
    })
    //document.querySelector('#selectPersona').innerHTML = strOpciones
    $('#selectPersona').append(strOpciones);
    $('#selectPersona').select2();
    $('#selectPersona')[0].parentElement.childNodes[2].style.width = '68%'
    $('#selectPersona')[0].parentElement.childNodes[2].childNodes[0].childNodes[0].style.height = '36px'
    $('#selectPersona')[0].parentElement.childNodes[2].childNodes[0].childNodes[0].style.paddingTop = '2px'
    $('#selectPersona')[0].parentElement.childNodes[2].childNodes[0].childNodes[0].style.borderRadius = '11px'
    $('#selectPersona')[0].parentElement.childNodes[2].childNodes[0].childNodes[0].style.border = '2px solid rgb(0 0 0 / 7%)'
}
async function llenarEmpresasModalMovimiento(opcion){
    let Data = {
        Procedimiento: 'ProcChipSituacion',
        Parametro: 0,
        Indice: 14
    }
    const response = await fetch(urlGeneral, DataFetch(Data, 'POST')).then(res => res.json());
    const jsondata = response['dt0'];
    let stropciones = ''
    opcion == 1 && (stropciones = '<option value="4">ABEXA</option>')
    jsondata.map(function(data,i){
        stropciones += `<option value="${data.CodEmpresa}">${data.NomEmpresa}</option>`
    })
    // document.querySelector('#selectEmpresa').innerHTML = stropciones
    return stropciones
}
//--FIN MODAL DE MOVIMIENTO DE LINEA--



async function abrirModalHistorial(codigoChip,numeroTelefono){
    divHistorial.dialog({
        title: 'Historial de Movimientos',
        buttons: {
            'Cerrar': function () {
                divHistorial.dialog("close");
            }
        },
        close: function () {
            divHistorial.dialog("close");
        }
    });
    divHistorial.dialog('open')
    
    await llenarTablaHistorial(codigoChip)
    let numeroParaModal = `${numeroTelefono.toString().slice(0,3)} ${numeroTelefono.toString().slice(3,6)} ${numeroTelefono.toString().slice(6,9)}`

    divHistorial[0].parentElement.childNodes[0].childNodes[0].innerHTML = `Historial de Movimientos [${numeroParaModal}]`


    // divHistorial[0].parentElement.style.top = '175px'

}

async function llenarTablaHistorial(codigoChip){
    const data = {
        Procedimiento: 'dbo.ProcChipSituacion',
        Parametro: codigoChip,
        Indice: 19
    };

    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0']

    let strCabecera = ''
    let strCuerpo = ''
    
    strCabecera =   `
                        <tr>
                            <th style="text-align:center;vertical-align:middle;width:30px">Nº</th>
                            <th style="text-align:center;vertical-align:middle">FECHA</th>
                            <th style="text-align:center;vertical-align:middle">EMPRESA</th>
                            <th style="text-align:center;vertical-align:middle;width:200px;">COMENTARIO</th>
                            <th style="text-align:center;vertical-align:middle">USUARIO</th>
                            <th style="text-align:center;vertical-align:middle">ESTADO</th>
                            <th style="text-align:center;vertical-align:middle;width:142px">SITUACIÓN</th>
                            <th style="text-align:center;vertical-align:middle;width:157px">UBICACIÓN</th>
                        </tr>
                    `

    document.querySelector('#tablaHistorial').getElementsByTagName('thead')[0].innerHTML = strCabecera

    if(jsondata.length == 0){
        strCuerpo =   '<tr><td style="text-align:center" colspan="8">No hay información para mostrar...</td></tr>'
    }else{
        jsondata.map(function(datos,i){
            strCuerpo +=    `
                            <tr style="${i==0 ? 'background:#bdecb6;cursor:pointer' : ''}">
                                <td style="text-align:center;vertical-align:middle">${i+1}</td>
                                <td style="text-align:center;vertical-align:middle">${datos.FechaAccion}</td>
                                <td style="text-align:center;vertical-align:middle">${datos.NomEmpresa}</td>
                                <td class="info2" style="text-align:center;vertical-align:middle;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;cursor:pointer" title="${datos.Comentario}">${datos.Comentario}</td>
                                <td style="text-align:center;vertical-align:middle">${datos.NomUsuario}</td>
                                <td style="text-align:center;vertical-align:middle" ${i==0 && 'title="Estado actual de la linea"'} class="info2"><span class="${datos.NomEstado == 'ACTIVO' ? 'label label-success' : 'label label-danger'}">${datos.NomEstado.toUpperCase()}</span></td>
                                <td style="text-align:center;vertical-align:middle"><span style="cursor:pointer" class="label label-primary">${datos.NomSituacion.toUpperCase()}</span></td>
                                <td style="text-align:center;vertical-align:middle"><span style="cursor:pointer" class="label label-info ${datos.PadronUnidad? 'info2' :  datos.NomPersona? 'info2': '' }" title="${datos.PadronUnidad ? datos.PadronUnidad+' '+datos.PlacaUnidad :  datos.NomPersona}" >${datos.NomUbicacion.toUpperCase()}</span></td>
                                
                            </tr>
                            `
        })
    }

    document.querySelector('#tablaHistorial').getElementsByTagName('tbody')[0].innerHTML = strCuerpo
    
    $('.info2').tooltipster({multiple:true})
}

async function exportarExcel(){
    var opciones = {
        sistema: 'GESTION DE LINEAS',
        title: 'GESTION DE LINEAS',
        filename: 'GESTION DE LINEAS',
        empresa: nomEmpresa,
    }
    var parametros = {
        ruc: Ruc,
        nomUsuario: NomUsuario,
    }
    fnExcelReport("tabla-LineasExportar", opciones, parametros, "GESTION DE LINEAS");
}



//FUNCIONES PARA EL DIV-SELECT OPERADORES
async function desplegarOpcionesOperadores(){
    if(document.querySelector('#opcionesOperadores').style.display == 'none'){
        document.querySelector('#opcionesOperadores').style.display = ''
        document.querySelector('#flechitaOperadores').classList.replace("fa-arrow-down","fa-arrow-up")
    }else{
        document.querySelector('#opcionesOperadores').style.display = 'none'
        document.querySelector('#flechitaOperadores').classList.replace("fa-arrow-up","fa-arrow-down")
    }
}
async function marcarDesmarcarTodosOperadores(){
    if(document.querySelector('#optionOperador0').checked){
        for (let i = 1; i <= longitudOperadores; i++) {
            document.querySelector(`#optionOperador${i}`).checked = true
        }
    }else{
        for (let i = 1; i <= longitudOperadores; i++) {
            document.querySelector(`#optionOperador${i}`).checked = false
        }
        ObjUtil.MostrarMensaje('Seleccionar al menos un operador',2)
    }
}
async function verificarCheckOperador(){
    arrOperadores = []
    let cont=0
    for (let i = 1; i <= longitudOperadores; i++) {
        if(document.querySelector(`#optionOperador${i}`).checked){
            cont++
        }
    }
    if(cont==longitudOperadores){
        document.querySelector('#optionOperador0').checked = true
        document.querySelector('#optionOperador0').indeterminate = false
    }else if(cont==0){
        document.querySelector('#optionOperador0').checked = false
        document.querySelector('#optionOperador0').indeterminate = false
        ObjUtil.MostrarMensaje('Seleccionar al menos un operador',2)
    }else{
        document.querySelector('#optionOperador0').checked = false
        document.querySelector('#optionOperador0').indeterminate = true
    }
}
async function actualizarDivSelectEmpresas(){
    arrOperadores = []
    for (let i = 1; i <= longitudOperadores; i++) {
        if(document.querySelector(`#optionOperador${i}`).checked){
            arrOperadores.push(document.querySelector(`#optionOperador${i}`).getAttribute('data-codoperador'))
        }
    }
    await llenarEmpresa(arrOperadores.toString())
}

//FUNCIONES PARA EL DIV-SELECT EMPRESAS
async function desplegarOpcionesEmpresas(){
    if(document.querySelector('#opcionesEmpresas').style.display == 'none'){
        document.querySelector('#opcionesEmpresas').style.display = ''
        document.querySelector('#flechitaEmpresas').classList.replace("fa-arrow-down","fa-arrow-up")
    }else{
        document.querySelector('#opcionesEmpresas').style.display = 'none'
        document.querySelector('#flechitaEmpresas').classList.replace("fa-arrow-up","fa-arrow-down")
    }
}
async function llenarEmpresa(codOperadores){
    const data = {
        Procedimiento: 'ProcChipSituacion',
        Parametro: codOperadores,
        Indice: 14
    };

    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0']
    
    longitudEmpresas = jsondata.length
    
    let strOptionsDiv = ''
    
    if(longitudEmpresas==0){
        strOptionsDiv = '<span style="margin-left:59px">--No hay información para mostrar--</span>'
    }else{
        jsondata.map(function (data, i) {
            strOptionsDiv += `<input id="optionEmpresa${i+1}" data-codempresa="${data.CodEmpresa}" onchange="" type="checkbox" style="cursor:pointer" checked><label for="optionEmpresa${i+1}" style="padding-left:5px;cursor:pointer">${capitalizarOraciones(data.NomEmpresa)}</label><br>`
        })
    }
    
    document.querySelector('#comboGeneralEmpresas').innerHTML = strOptionsDiv
    await llenarFiltro()
}
async function marcarTodoEmpresa(){
    for (let i = 1; i <= longitudEmpresas; i++) {
        document.querySelector(`#optionEmpresa${i}`).checked = true
    }
}
async function desmarcarTodoEmpresa(){
    for (let i = 1; i <= longitudEmpresas; i++) {
        document.querySelector(`#optionEmpresa${i}`).checked = false
    }
}
async function aplicarEmpresa(){
    await verificarCheckEmpresas()

    let cont = 0
    for (let i = 1; i <= longitudEmpresas; i++) {
        document.querySelector(`#optionEmpresa${i}`).checked && cont++
    }

    cadenaEmpresasSinFiltro = ''
    
    let operadoresSinFiltro = ''
    arrOperadores.map(function(data,i){
        operadoresSinFiltro += data + ','
    })
    operadoresSinFiltro = operadoresSinFiltro.slice(0,-1)

    if(arrEmpresas.length == 0){
        cadenaEmpresasSinFiltro = '*0*0*0*0'
    }

    arrEmpresas.map(function(data,i){
        cadenaEmpresasSinFiltro += `${operadoresSinFiltro}*${data}*0*0*0~` 
    })
    cadenaEmpresasSinFiltro = cadenaEmpresasSinFiltro.slice(0,-1)
    //para limpiar el valor de los operadores sin filtro
    parametroSinFiltro = ''
    cadenaDeParametro = ''

    if(cont==0){
        ObjUtil.MostrarMensaje('Seleccionar al menos una empresa',2)
        document.querySelector('#comboGeneralFiltro').innerHTML = '<span style="margin-left:59px">--No hay información para mostrar--</span>'
        return
    }
    ObjUtil.MostrarMensaje('Se aplicó el filtro para las empresas seleccionadas',1)
    document.querySelector('#opcionesEmpresas').style.display = 'none'
    document.querySelector('#flechitaEmpresas').classList.replace("fa-arrow-up","fa-arrow-down")

    await llenarFiltro()

    document.getElementById('divSelectTreeCheckbox').classList.remove('actualizado')
    setTimeout(() => document.getElementById('divSelectTreeCheckbox').classList.add('actualizado'), 100)

}
async function verificarCheckEmpresas(){
    arrEmpresas = []
    for (let i = 1; i <= longitudEmpresas; i++) {
        if(document.querySelector(`#optionEmpresa${i}`).checked){
            arrEmpresas.push(document.querySelector(`#optionEmpresa${i}`).getAttribute('data-codempresa'))
        } 
    }
}

//FUNCIONES PARA EL DIV-SELECT FILTRO
async function desplegarOpcionesFiltro(){
    if(optionsTreeViewer.style.display == 'none'){
        optionsTreeViewer.style.display = ''
        document.querySelector('#flechitaSelect').classList.replace("fa-arrow-down","fa-arrow-up")
    }else{
        optionsTreeViewer.style.display = 'none'
        document.querySelector('#flechitaSelect').classList.replace("fa-arrow-up","fa-arrow-down")
    }
}
async function llenarFiltro(){
    await verificarCheckEmpresas()

    const data1 = {
        Procedimiento: 'dbo.ProcChipSituacion',
        Parametro: `${arrOperadores.toString()}|${arrEmpresas.toString()}`,
        Indice: 15
    };
    const Datos1 = await fetch(urlGeneral, DataFetch(data1, "POST")).then(res => res.json())
    const jsondataEstados = Datos1['dt0']
    
    if(jsondataEstados.length==0){
        document.querySelector('#comboGeneralFiltro').innerHTML = '<span style="margin-left:59px">--No hay información para mostrar--</span'
        return
    }

    let arrEstados = []
    jsondataEstados.map(function(Estados){
        arrEstados.push(Estados.CodEstado)
    })

    const data2 = {
        Procedimiento: 'dbo.ProcChipSituacion',
        Parametro: `${arrOperadores.toString()}|${arrEmpresas.toString()}|${arrEstados.toString()}`,
        Indice: 16
    };
    const Datos2 = await fetch(urlGeneral, DataFetch(data2, "POST")).then(res => res.json())
    const jsondataSituaciones = Datos2['dt0']

    let arrSituaciones = []
    jsondataSituaciones.map(function(Situaciones){
        arrSituaciones.push(Situaciones.CodSituacion)
    })

    const data3 = {
        Procedimiento: 'dbo.ProcChipSituacion',
        Parametro: `${arrOperadores.toString()}|${arrEmpresas.toString()}|${arrEstados.toString()}|${arrSituaciones.toString()}`,
        Indice: 17
    };
    const Datos3 = await fetch(urlGeneral, DataFetch(data3, "POST")).then(res => res.json())
    const jsondataUbicaciones = Datos3['dt0']

    //LLENADO DIMNAMICO DEL JSON PARA EL FILTRO
    jsonFiltro = []
    jsondataEstados.map(function(est,i){
        jsonFiltro.push({
            'CodEstado':est.CodEstado,
            'NomEstado':est.NomEstado,
            'Situaciones':[]
        })
        jsondataSituaciones.map(function(sit,j){
            if(est.CodEstado == sit.CodEstado){
                jsonFiltro[i].Situaciones.push({
                    'CodSituacion':sit.CodSituacion,
                    'NomSituacion':sit.NomSituacion,
                    'Ubicaciones':[],
                    'EmpresasOperadores':[]
                })
                // jsondataUbicaciones.map(function(ubic){
                //     if(sit.CodSituacion == ubic.CodSituacion){
                //         jsonFiltro[i].Situaciones[j]?.Ubicaciones.push({
                //             'CodUbicacion':ubic.CodUbicacion,
                //             'NomUbicacion':ubic.NomUbicacion,
                //             'EmpresasOperadores':[]
                //         })
                //     }
                // })
            }
        })
    })

    jsonFiltro.map(function(datos1,i){
        datos1.Situaciones.map(function(datos2,j){
            jsondataUbicaciones.map(function(datos3,k){
                if(datos2.CodSituacion==datos3.CodSituacion){
                    datos2.Ubicaciones.push({
                        'CodUbicacion':datos3.CodUbicacion,
                        'NomUbicacion':datos3.NomUbicacion,
                        'EmpresasOperadores':[]
                    })
                }
            })
        })
    })

    await armadoFinalEpresasOperadoresFiltro()

    //DIV PARA GUARDAR LOS DATOS
    document.querySelector('#comboGeneralFiltro').innerHTML = ''

    let divEstado = ''
    let divSituacion = ''
    let divUbicacion = ''
    jsonFiltro.map( function(elmEstado,i){
        divEstado = document.createElement('div')
        divEstado.setAttribute('id',`estado-${i+1}`)
        divEstado.insertAdjacentHTML('beforeend',`<i id="iconCombo${i+1}" onclick="mostrarOcultarCombitos('estado',${i})" class="fa fa-minus" aria-hidden="true" style="cursor:pointer"></i><input id="optionGeneral${i+1}" onchange="pintarCheckBoxesHijos('estado',${i})" type="checkbox" style="margin-left:4px;cursor:pointer" checked><label for="optionGeneral${i+1}" style="padding-left:5px;cursor:pointer">${capitalizarOraciones(elmEstado.NomEstado)}</label>`)
        divSituacion = document.createElement('div')
        divSituacion.setAttribute('id',`combo${i+1}`)
        divSituacion.setAttribute('style','display:block;margin-left:30px')
        elmEstado.Situaciones.map(function(elmSituacion,j){
            if(elmSituacion.Ubicaciones.length==0){
                divSituacion.insertAdjacentHTML('beforeend',`<input id="option${i+1}_${j+1}" onchange="pintarCheckBoxesHijos('situacion',${i},${j}),desmarcarCheckBoxesParents('situacion',${i})" type="checkbox" style="margin-left:15px;cursor:pointer" checked><label for="option${i+1}_${j+1}" style="padding-left:5px;cursor:pointer">${elmSituacion.NomSituacion}</label><i class="fa fa-external-link info2" onclick="abrirFiltrodeFiltros(${i},${j})" title="Modificar seleccion de empresas" aria-hidden="true" style="margin-left:10px;font-size:12px;cursor:pointer"></i><br>`)
                $('.info2').tooltipster({multiple:true})
            }else{
                divSituacion.insertAdjacentHTML('beforeend',`<i id="iconCombo${i+1}_${j+1}" onclick="mostrarOcultarCombitos('situacion',${i},${j})" class="fa fa-plus" aria-hidden="true" style="cursor:pointer"></i><input id="option${i+1}_${j+1}" onchange="pintarCheckBoxesHijos('situacion',${i},${j}),desmarcarCheckBoxesParents('situacion',${i})" type="checkbox" style="margin-left:4px;cursor:pointer" checked><label for="option${i+1}_${j+1}" style="padding-left:5px;cursor:pointer">${capitalizarOraciones(elmSituacion.NomSituacion)}</label><br>`)
                divUbicacion = document.createElement('div')
                divUbicacion.setAttribute('id',`combo${i+1}_${j+1}`)
                divUbicacion.setAttribute('style','display:none;margin-left:30px;')
                elmSituacion.Ubicaciones.map(function(elmUbicacion,k){
                    divUbicacion.insertAdjacentHTML('beforeend',`<input id="option${i+1}_${j+1}_${k+1}" onchange="desmarcarCheckBoxesParents('ubicacion',${i},${j})" type="checkbox" style="margin-left:15px;cursor:pointer" checked><label for="option${i+1}_${j+1}_${k+1}" style="padding-left:5px;cursor:pointer">${elmUbicacion.NomUbicacion}</label><i class="fa fa-external-link info2" onclick="abrirFiltrodeFiltros(${i},${j},${k})" title="Modificar seleccion de empresas" aria-hidden="true" style="margin-left:10px;font-size:12px;cursor:pointer"></i><br>`)
                    $('.info2').tooltipster({multiple:true})
                })
                divSituacion.append(divUbicacion)
                $('.info2').tooltipster({multiple:true})
            }
        })
        divEstado.append(divSituacion)
        $('.info2').tooltipster({multiple:true})
        document.querySelector('#comboGeneralFiltro').append(divEstado)
    })
}
async function armadoFinalEpresasOperadoresFiltro(){
    jsonFiltro.map(async function(estados){
        estados.Situaciones.map(async function(situaciones){
            const data = {
                Procedimiento: 'dbo.ProcChipSituacion',
                Parametro: `${arrOperadores.toString()}|${arrEmpresas.toString()}|${situaciones.CodSituacion}|0`,
                Indice: 18
            };
            const Data = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
            const jsondataUltimo = Data['dt0']
            if(situaciones.Ubicaciones.length==0){
                if(jsondataUltimo.length != 0){
                    jsondataUltimo.map(function(datos){
                        situaciones.EmpresasOperadores.push({
                            'CodEmpresa':datos.CodEmpresa,
                            'NomEmpresa':datos.NomEmpresa,
                            'CodProveedor':datos.CodProveedor,
                            'NomProveedor':datos.NomProveedor,
                            'valorCheck':true
                        })
                    })
                }
            }else{
                situaciones.Ubicaciones.map(async function(ubicaciones){
                    const data = {
                        Procedimiento: 'dbo.ProcChipSituacion',
                        Parametro: `${arrOperadores.toString()}|${arrEmpresas.toString()}|${situaciones.CodSituacion}|${ubicaciones.CodUbicacion}`,
                        Indice: 18
                    };
                    const Data = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
                    const jsondataUltimo = Data['dt0']
                    jsondataUltimo.map(function(datos){
                        ubicaciones.EmpresasOperadores.push({
                            'CodEmpresa':datos.CodEmpresa,
                            'NomEmpresa':datos.NomEmpresa,
                            'CodProveedor':datos.CodProveedor,
                            'NomProveedor':datos.NomProveedor,
                            'valorCheck':true
                        })
                    })
                })
            }
        })
    })
}
async function mostrarOcultarCombitos(tipo,codigoEstado,codigoSituacion){
    switch (tipo) {
        case "estado":
            if(document.querySelector(`#combo${codigoEstado+1}`).style.display == 'block'){
                document.querySelector(`#combo${codigoEstado+1}`).style.display = 'none'
                document.querySelector(`#iconCombo${codigoEstado+1}`).classList.replace('fa-minus','fa-plus')
            }else{
                document.querySelector(`#combo${codigoEstado+1}`).style.display = 'block'
                document.querySelector(`#iconCombo${codigoEstado+1}`).classList.replace('fa-plus','fa-minus')
            }
            break;
        case "situacion":
            if(document.querySelector(`#combo${codigoEstado+1}_${codigoSituacion+1}`).style.display == 'block'){
                document.querySelector(`#combo${codigoEstado+1}_${codigoSituacion+1}`).style.display = 'none'
                document.querySelector(`#iconCombo${codigoEstado+1}_${codigoSituacion+1}`).classList.replace('fa-minus','fa-plus')
            }else{
                document.querySelector(`#combo${codigoEstado+1}_${codigoSituacion+1}`).style.display = 'block'
                document.querySelector(`#iconCombo${codigoEstado+1}_${codigoSituacion+1}`).classList.replace('fa-plus','fa-minus')
            }
            break;
        default:
            break;
    }
}
async function pintarCheckBoxesHijos(tipo,codigoEstado,codigoSituacion){
    switch (tipo) {
        case "estado":
            if(document.querySelector(`#optionGeneral${codigoEstado+1}`).checked){
                jsonFiltro[codigoEstado].Situaciones.map(function(data,i){
                    document.querySelector(`#option${codigoEstado+1}_${i+1}`).checked = true
                    document.querySelector(`#option${codigoEstado+1}_${i+1}`).indeterminate = false
                    jsonFiltro[codigoEstado].Situaciones[i].Ubicaciones.map(function(data,j){
                        document.querySelector(`#option${codigoEstado+1}_${i+1}_${j+1}`).checked = true
                        document.querySelector(`#option${codigoEstado+1}_${i+1}_${j+1}`).indeterminate = false
                    })
                })
            }else{
                jsonFiltro[codigoEstado].Situaciones.map(function(data,i){
                    document.querySelector(`#option${codigoEstado+1}_${i+1}`).checked = false
                    jsonFiltro[codigoEstado].Situaciones[i].Ubicaciones.map(function(data,j){
                        document.querySelector(`#option${codigoEstado+1}_${i+1}_${j+1}`).checked = false
                    })
                })
            }
            break;
        case "situacion":
            if(jsonFiltro[codigoEstado].Situaciones[codigoSituacion].Ubicaciones.length!=0){
                if(document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}`).checked){
                    jsonFiltro[codigoEstado].Situaciones[codigoSituacion].Ubicaciones.map(function(data,i){
                        document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}_${i+1}`).checked = true
                    })
                }else{
                    jsonFiltro[codigoEstado].Situaciones[codigoSituacion].Ubicaciones.map(function(data,i){
                        document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}_${i+1}`).checked = false
                    })
                }
            }
            break;
        default:
            break;
    }
}
async function desmarcarCheckBoxesParents(tipo,codigoEstado,codigoSituacion){
    let cont = 0
    switch (tipo) {
        case 'situacion':
            cont = 0
            let longSituacion = jsonFiltro[codigoEstado].Situaciones.length
            jsonFiltro[codigoEstado].Situaciones.map(function(data,i){
                document.querySelector(`#option${codigoEstado+1}_${i+1}`).checked  && cont++
            })
            if(cont == longSituacion){
                document.querySelector(`#optionGeneral${codigoEstado+1}`).checked = true
                document.querySelector(`#optionGeneral${codigoEstado+1}`).indeterminate = false
            }else if(cont==0){
                document.querySelector(`#optionGeneral${codigoEstado+1}`).checked = false
                document.querySelector(`#optionGeneral${codigoEstado+1}`).indeterminate = false
            }else{
                document.querySelector(`#optionGeneral${codigoEstado+1}`).checked = false
                document.querySelector(`#optionGeneral${codigoEstado+1}`).indeterminate = true
            }
            break;
        case 'ubicacion':
            cont = 0
            let longUbicacion = jsonFiltro[codigoEstado].Situaciones[codigoSituacion].Ubicaciones.length
            jsonFiltro[codigoEstado].Situaciones[codigoSituacion].Ubicaciones.map(function(data,i){
                document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}_${i+1}`).checked  && cont++
            })
            if(cont == longUbicacion){
                document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}`).checked = true
                document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}`).indeterminate = false 
                cont = 0
                let longSituacion = jsonFiltro[codigoEstado].Situaciones.length
                jsonFiltro[codigoEstado].Situaciones.map(function(data,i){
                    document.querySelector(`#option${codigoEstado+1}_${i+1}`).checked && cont++
                })
                if(cont == longSituacion){
                    document.querySelector(`#optionGeneral${codigoEstado+1}`).checked = true
                    document.querySelector(`#optionGeneral${codigoEstado+1}`).indeterminate = false
                }else{
                    document.querySelector(`#optionGeneral${codigoEstado+1}`).checked = false
                    document.querySelector(`#optionGeneral${codigoEstado+1}`).indeterminate = true
                } 
            }else if(cont==0){
                document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}`).checked = false
                document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}`).indeterminate = false
                cont = 0
                jsonFiltro[codigoEstado].Situaciones.map(function(data,i){
                    document.querySelector(`#option${codigoEstado+1}_${i+1}`).checked && cont++
                })
                if(cont==0){
                    document.querySelector(`#optionGeneral${codigoEstado+1}`).checked = false
                    document.querySelector(`#optionGeneral${codigoEstado+1}`).indeterminate = false
                }
            }else{
                document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}`).checked = false
                document.querySelector(`#option${codigoEstado+1}_${codigoSituacion+1}`).indeterminate = true
                document.querySelector(`#optionGeneral${codigoEstado+1}`).checked = false
                document.querySelector(`#optionGeneral${codigoEstado+1}`).indeterminate = true
            }
            break;
        default:
            break;
    }
}
async function marcarTodoFiltro(){
    jsonFiltro.map(function(data,i){
        document.querySelector(`#optionGeneral${i+1}`).checked = true
        document.querySelector(`#optionGeneral${i+1}`).indeterminate = false
        data.Situaciones.map(function(data2,j){
            document.querySelector(`#option${i+1}_${j+1}`).checked = true
            document.querySelector(`#option${i+1}_${j+1}`).indeterminate = false
            data2.Ubicaciones.map(function(data3,k){
                document.querySelector(`#option${i+1}_${j+1}_${k+1}`).checked = true
                document.querySelector(`#option${i+1}_${j+1}_${k+1}`).indeterminate = false
            })
        })
    })
}
async function desmarcarTodoFiltro(){
    jsonFiltro.map(function(data,i){
        document.querySelector(`#optionGeneral${i+1}`).checked = false
        document.querySelector(`#optionGeneral${i+1}`).indeterminate = false
        data.Situaciones.map(function(data2,j){
            document.querySelector(`#option${i+1}_${j+1}`).checked = false
            document.querySelector(`#option${i+1}_${j+1}`).indeterminate = false
            data2.Ubicaciones.map(function(data3,k){
                document.querySelector(`#option${i+1}_${j+1}_${k+1}`).checked = false
                document.querySelector(`#option${i+1}_${j+1}_${k+1}`).indeterminate = false
            })
        })
    })
}
async function aplicarFiltro(verificadorInicio){
    cadenaDeParametro = ''
    let cadenaCompleta = ''
    let empresasMarcadas = []
    let operadoresMarcados = []

    //LLENAR LA CADENA DE TEXTO QUE SE USARA COMO PARAMETRO
    jsonFiltro.map(function(data1,i){
        data1.Situaciones.map(function(data2,j){
            
            if(data2.Ubicaciones.length==0){
                empresasMarcadas = []
                operadoresMarcados = []
                let valorIteradorEmpresa = ''
                if(document.querySelector(`#option${i+1}_${j+1}`).checked){
                    data2.EmpresasOperadores.map(function(data4){
                        if(data4.valorCheck){
                            if(valorIteradorEmpresa!=data4.CodEmpresa){
                                valorIteradorEmpresa = data4.CodEmpresa
                                empresasMarcadas.push({
                                    'codigoEmpresa':data4.CodEmpresa,
                                    'parteFinalConcatenacion':`${data1.CodEstado}*${data2.CodSituacion}*0`,
                                    'codigoOperadores':''
                                })
                            }
                            operadoresMarcados.push({
                                'codigoEmpresa':data4.CodEmpresa,
                                'codigoOperador':data4.CodProveedor
                            })
                        }
                    })
                    empresasMarcadas.map(function(test){
                        operadoresMarcados.map(function(test2){
                            if(test.codigoEmpresa==test2.codigoEmpresa){
                                test.codigoOperadores = test.codigoOperadores ? test.codigoOperadores + ',' + test2.codigoOperador : test2.codigoOperador
                            }
                        })
                    })

                    empresasMarcadas.map(function(data){
                        cadenaCompleta += `${data.codigoOperadores}*${data.codigoEmpresa}*${data.parteFinalConcatenacion}~`
                    })
                }
            }else{
                data2.Ubicaciones.map(function(data3,k){
                    empresasMarcadas = []
                    operadoresMarcados = []
                    let valorIteradorEmpresa = ''
                    if(document.querySelector(`#option${i+1}_${j+1}_${k+1}`).checked){
                        data3.EmpresasOperadores.map(function(data4,m){
                            if(data4.valorCheck){
                                if(valorIteradorEmpresa!=data4.CodEmpresa){
                                    valorIteradorEmpresa = data4.CodEmpresa
                                    empresasMarcadas.push({
                                        'codigoEmpresa':data4.CodEmpresa,
                                        'parteFinalConcatenacion':`${data1.CodEstado}*${data2.CodSituacion}*${data3.CodUbicacion}`,
                                        'codigoOperadores':''
                                    })
                                }
                                operadoresMarcados.push({
                                    'codigoEmpresa':data4.CodEmpresa,
                                    'codigoOperador':data4.CodProveedor
                                })
                            }
                        })
                        empresasMarcadas.map(function(test){
                            operadoresMarcados.map(function(test2){
                                if(test.codigoEmpresa==test2.codigoEmpresa){
                                    test.codigoOperadores = test.codigoOperadores ? test.codigoOperadores + ',' + test2.codigoOperador : test2.codigoOperador
                                }
                            })
                        })
    
                        empresasMarcadas.map(function(data){
                            cadenaCompleta += `${data.codigoOperadores}*${data.codigoEmpresa}*${data.parteFinalConcatenacion}~`
                        })
                    }
                })
            }
        })
    })

    if(cadenaCompleta.slice(-1)=='~'){
        cadenaDeParametro = cadenaCompleta.slice(0,-1)
    }else{
        cadenaDeParametro = cadenaCompleta
    }

    if(!verificadorInicio){
        if(cadenaDeParametro.length != 0){
            ObjUtil.MostrarMensaje('Se guardaron los filtros seleccionados, presione el botón "Procesar"',1)
            document.querySelector('#divSelectTreeCheckbox').innerHTML = `<span style="opacity: .8;">Se guardaron las opciones marcadas</span><i id="flechitaSelect" style="float:right;margin-top:2px" class="fa fa-arrow-down" aria-hidden="true"></i>`
            optionsTreeViewer.style.display = 'none'
            document.querySelector('#flechitaSelect').classList.replace("fa-arrow-up","fa-arrow-down")
        }else{
            ObjUtil.MostrarMensaje('Ningun filtro seleccionado',2)
            document.querySelector('#divSelectTreeCheckbox').innerHTML = `<span style="opacity: .8;">Marque las opciones para filtrar</span><i id="flechitaSelect" style="float:right;margin-top:2px" class="fa fa-arrow-up" aria-hidden="true"></i>`
        }
    }
}
let arrEmprOper = []
async function abrirFiltrodeFiltros(codigoEstado,codigoSituacion,codigoUbicacion){
    divFiltrodeFiltros.dialog({
        title: 'Selección Específica de Empresas',
        buttons: {
            'Guardar': function () {
                if(typeof codigoUbicacion === 'number'){
                    guardarCambiosUltimoFiltro(codigoEstado,codigoSituacion,codigoUbicacion)
                }else{
                    guardarCambiosUltimoFiltro(codigoEstado,codigoSituacion)
                }
            },
            'Cancelar': function () {
                divFiltrodeFiltros.dialog("close");
            }
        },
        close: function () {
            divFiltrodeFiltros.dialog("close");
        }
    });
    divFiltrodeFiltros.dialog('open')

    divFiltrodeFiltros[0].parentElement.style.top = '175px'

    
    let nombreEstado = jsonFiltro[codigoEstado].NomEstado
    let nombreSituacion = jsonFiltro[codigoEstado].Situaciones[codigoSituacion].NomSituacion
    let nombreUbicacion = ''
    if(typeof codigoUbicacion === 'number'){
        nombreUbicacion = jsonFiltro[codigoEstado].Situaciones[codigoSituacion].Ubicaciones[codigoUbicacion].NomUbicacion
        document.querySelector('#legendFiltroFinal').innerText = `${capitalizarOraciones(nombreEstado)} → ${capitalizarOraciones(nombreSituacion)} → ${capitalizarOraciones(nombreUbicacion)}`
    }else{
        document.querySelector('#legendFiltroFinal').innerText = `${capitalizarOraciones(nombreEstado)} → ${capitalizarOraciones(nombreSituacion)}`
    }
    
    let contenedor = document.querySelector('#contenedorFiltroFinal')
    let divEmpresa = ''
    let divOperadores = ''
    let validadorRepeticionEmpresas = ''
    let numeroContadorEmpresas = 0
    
    contenedor.innerHTML = ''
    
    if(typeof codigoUbicacion === 'number'){
        arrEmprOper = []
        arrEmprOper = jsonFiltro[codigoEstado].Situaciones[codigoSituacion].Ubicaciones[codigoUbicacion].EmpresasOperadores
    }else{
        arrEmprOper = []
        arrEmprOper = jsonFiltro[codigoEstado].Situaciones[codigoSituacion].EmpresasOperadores
    }

    if(arrEmprOper.length == 0){
        return
    }
    
    let empresasMomentaneo = []
    let valorAnterior = ''
    arrEmprOper.map(function(data,i){
        if(valorAnterior != data.CodEmpresa){
            valorAnterior = data.CodEmpresa
            empresasMomentaneo.push({
                'codigoEmpresa' : data.CodEmpresa,
                'nombreEmpresa' : data.NomEmpresa,
                'operadores' : []
            })
        }
    })
    empresasMomentaneo.map(function(dataP,i){
        arrEmprOper.map(function(data,j){
            if(dataP.codigoEmpresa == data.CodEmpresa){
                dataP.operadores.push({
                    'codigoOperador' : data.CodProveedor,
                    'nombreOperador' : data.NomProveedor,
                    'checkvalue' : data.valorCheck
                })
            }
        })
    })

    arrEmprOper.map(function(data,i){
        if(validadorRepeticionEmpresas != data.CodEmpresa){
            validadorRepeticionEmpresas = data.CodEmpresa
            divEmpresa = document.createElement('div')
            divEmpresa.setAttribute('id',`empresaDiv_${numeroContadorEmpresas+1}`)

            let valorCheck = ''
            let valorIndeterminate = ''
            empresasMomentaneo.map(function(dataP,j){
                if(data.CodEmpresa == dataP.codigoEmpresa){
                    let cont = 0
                    dataP.operadores.map(function(operadores){
                        if(operadores.checkvalue){
                            cont++
                        }
                    })
                    if(cont == dataP.operadores.length){
                        valorCheck = true
                        valorIndeterminate = false
                    }else if(cont == 0){
                        valorCheck = false
                        valorIndeterminate = false
                    }else{
                        valorCheck = false
                        valorIndeterminate = true
                    }
                }
            })

            divEmpresa.insertAdjacentHTML('beforeend',`<i id="iconCombito${numeroContadorEmpresas+1}" title="Expandir Operadores" onclick="mostrarOcultarCombitosFiltroFinal(${numeroContadorEmpresas+1})" class="fa fa-plus" aria-hidden="true" style="cursor:pointer"></i><input id="codempresa_${data.CodEmpresa}" onchange="pintarHijosCombitoFiltroFinal(${data.CodEmpresa})" type="checkbox" style="margin-left:4px"><label style="padding-left:5px">${data.NomEmpresa}</label>`)
            divOperadores = document.createElement('div')
            divOperadores.setAttribute('id',`combito_${numeroContadorEmpresas+1}`)
            divOperadores.setAttribute('style','display:none;margin-left:30px')
            divOperadores.insertAdjacentHTML('beforeend',`<input id="codempresa_${data.CodEmpresa}_codproveedor_${data.CodProveedor}" onchange="desmarcarParentsFiltroFinal(${data.CodEmpresa})" type="checkbox" style="margin-left:15px" ${data.valorCheck == true ? 'checked' : '!checked'}><label style="padding-left:5px" >${data.NomProveedor}</label><br>`)
            
            divEmpresa.append(divOperadores)
            contenedor.append(divEmpresa)

            document.querySelector(`#codempresa_${data.CodEmpresa}`).checked = valorCheck
            document.querySelector(`#codempresa_${data.CodEmpresa}`).indeterminate = valorIndeterminate

            numeroContadorEmpresas++
        }else{
            divOperadores.insertAdjacentHTML('beforeend',`<input id="codempresa_${data.CodEmpresa}_codproveedor_${data.CodProveedor}" onchange="desmarcarParentsFiltroFinal(${data.CodEmpresa})" type="checkbox" style="margin-left:15px" ${data.valorCheck == true ? 'checked' : '!checked'}><label style="padding-left:5px">${data.NomProveedor}</label><br>`)

            divEmpresa.append(divOperadores)
        }
    })

}
async function mostrarOcultarCombitosFiltroFinal(codigoCombo){
    if(document.querySelector(`#combito_${codigoCombo}`).style.display == 'block'){
        document.querySelector(`#combito_${codigoCombo}`).style.display = 'none'
        document.querySelector(`#iconCombito${codigoCombo}`).classList.replace('fa-minus','fa-plus')
    }else{
        document.querySelector(`#combito_${codigoCombo}`).style.display = 'block'
        document.querySelector(`#iconCombito${codigoCombo}`).classList.replace('fa-plus','fa-minus')
    }
}
async function pintarHijosCombitoFiltroFinal(empresaMarcada){
    let valorBool = false
    if(document.querySelector(`#codempresa_${empresaMarcada}`).checked){
        valorBool = true
    }
    arrEmprOper.map(function(data,i){
        if(document.querySelector(`#codempresa_${empresaMarcada}_codproveedor_${data.CodProveedor}`)){
            document.querySelector(`#codempresa_${empresaMarcada}_codproveedor_${data.CodProveedor}`).checked = valorBool
        }
    })
}
async function desmarcarParentsFiltroFinal(empresa){
    let cont = 0
    let cont2 = 0
    arrEmprOper.map(function(data){
        if(document.querySelector(`#codempresa_${empresa}_codproveedor_${data.CodProveedor}`)){
            cont++
            if(document.querySelector(`#codempresa_${empresa}_codproveedor_${data.CodProveedor}`).checked){
                cont2++
            }
        }
    })
    if(cont2 == cont){
        document.querySelector(`#codempresa_${empresa}`).checked = true
        document.querySelector(`#codempresa_${empresa}`).indeterminate = false
    }else if(cont2 == 0){
        document.querySelector(`#codempresa_${empresa}`).checked = false
        document.querySelector(`#codempresa_${empresa}`).indeterminate = false
    }else{
        document.querySelector(`#codempresa_${empresa}`).checked = false
        document.querySelector(`#codempresa_${empresa}`).indeterminate = true
    }
}
async function guardarCambiosUltimoFiltro(codigoEstado,codigoSituacion,codigoUbicacion){
    ObjUtil.MostrarMensaje('Selección específica de empresas guardada',1)
    if(typeof codigoUbicacion === 'number'){

        jsonFiltro[codigoEstado].Situaciones[codigoSituacion].Ubicaciones[codigoUbicacion].EmpresasOperadores.map(function(data,i){
            data.valorCheck = document.querySelector(`#codempresa_${data.CodEmpresa}_codproveedor_${data.CodProveedor}`).checked ? true : false
        })

    }else{

        jsonFiltro[codigoEstado].Situaciones[codigoSituacion].EmpresasOperadores.map(function(data,i){
            data.valorCheck = document.querySelector(`#codempresa_${data.CodEmpresa}_codproveedor_${data.CodProveedor}`).checked ? true : false
        })
    }
    divFiltrodeFiltros.dialog("close");
}



function capitalizarOraciones(oracion){
    let oracionCapitalizada = ''
    let palabras = oracion.split(' ')
    for (let i = 0; i < palabras.length; i++){
        oracionCapitalizada += `${palabras[i].slice(0,1).toUpperCase()}${palabras[i].slice(1).toLowerCase()} `
    }
    return (oracionCapitalizada.slice(0,-1))
}
function verificarMes(valor){
    if(valor>31||valor==0){
        ObjUtil.MostrarMensaje('El valor debe ser entre 1 - 31',2)
        document.querySelector('#inputDiaRenov').value = ''
    }
}