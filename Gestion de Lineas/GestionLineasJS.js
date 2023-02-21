const urlGeneral = NombreAplicacion + '/GeneralPost/ProcGeneralPostBDGeneral';
//parametros cabecera
const operadorSelectCabecera = document.querySelector('#selectOperadoresCabecera')
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
//modal cambio de estado
const switchActivoInput = document.querySelector('#switchActivo')
const switchInactivoInput = document.querySelector('#switchInactivo')
const divActivar = document.querySelector('#divActivarLinea')
const divInactivar = document.querySelector('#divInactivarLinea')
const switchSuspenderInput = document.querySelector('#f-option')
const switchAnularInput = document.querySelector('#s-option')
//modal cambio de situaciones
const situacionSelect = document.querySelector('#selectSituacion')
const ubicacionSelect = document.querySelector('#selectUbicacion')

const tablaLineas = document.querySelector('#tabla-Lineas');
const tablaLineasExportar = document.querySelector('#tabla-LineasExportar')

let indicador = 1

// --------------- MODALES ------------------
let divRegistro = $('#modalRegistro')
let divCambioEstado = $('#divCambioEstado')
let divEdicionSituacionUbicacion = $('#divEdicionSituacionUbicacion')
let divHistorial = $('#divHistorial')
//////div con pestañas///////
let divCambioEstadoySituacion = $('#divEstadoySituacion')
/////////////

document.addEventListener("DOMContentLoaded", async () => {
    
    ObjUtil.Modal(divRegistro, 'auto', '480px', true, false, false, true, 'Registrar Linea');
    ObjUtil.Modal(divCambioEstado, 'auto', '763px', true, false, false, true, 'Cambio de Estado');
    ObjUtil.Modal(divEdicionSituacionUbicacion, 'auto', '576px', true, false, false, true, 'Registrar Movimiento de Linea');
    //nuevo modal para listar el historial
    ObjUtil.Modal(divHistorial, 'auto', '1000px', true, false, false, true, 'Historial de movimientos');
    /////////nuevo modal para el cambio de estado y el cambio de situacion///////////////
    ObjUtil.Modal(divCambioEstadoySituacion, 'auto' , '800px', true, false, false, true, 'Cambio de Estados y Situaciones');
    /////////////////////////////////////////////////////////////////////////////////////

        $('#txtFechaActivacion').datepicker({
        dateFormat: 'dd/mm/yy',
        maxDate: '+0d'
    });
    $('#txtFechaRenovacion').datepicker({
        dateFormat: 'dd/mm/yy',
    });

    await llenarCombosOperadores()
    await listarLineas()

})

//----------MODAL REGISTRO-----------
function abrirModalRegistrar(){
    divRegistro.dialog({
        title: 'Registrar Linea',
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
        Parametro: `${telefonoInputModal.value}|${imeiInputModal.value}|${simCardInputModal.value}|${planTarifarioSelectModal.value}|${fechaActivacionModal.value}|${diaRenovInputModal.value}|${fechaRenovacionModal.value}|${vigenciaInputModal.value}`,
        Indice: 20
    };
    console.log("datos: ",data.Parametro)
    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0'][0]
    ObjUtil.MostrarMensaje(jsondata.DesResultado,jsondata.CodResultado);
    if (Number(jsondata.CodResultado) == 1) {
        divRegistro.dialog('close');
        listarLineas();
    }
}

async function llenarCombosOperadores() {
    const data = {
        Procedimiento: 'ProcGeneral',
        Parametro: '',
        Indice: 10
    };

    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0']
    let strOptions = ''
    let strOptionsCabecera = '<option value=0>---TODOS---</option>'

    jsondata.map(function (data, i) {
        strOptions += `<option value="${data.Codigo}">${data.Nombre}</option>`
        strOptionsCabecera += `<option value="${data.Codigo}">${data.Nombre}</option>`
    })

    operadorSelectModal.innerHTML = strOptions
    operadorSelectCabecera.innerHTML = strOptionsCabecera

    getPlanTarifario()
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

async function listarLineas() {
    let strCuerpoExportar = ''
    let strCabecera = ''
    const tbodyLineas = tablaLineas.getElementsByTagName("tbody")[0];        
    tbodyLineas.innerHTML = '';
    
    const data = {
        Procedimiento: 'ProcChipSituacion',
        Parametro:`${operadorSelectCabecera.value}|0|0`,
        Indice: 10, 
    };
    const response = await fetch(urlGeneral, DataFetch(data, 'POST')).then(res => res.json());
    const lineas = response['dt0'];

    strCabecera =   `
                    <tr>
                        <th style="text-align: center;Width:20px">Nº</th>
                        <th style="text-align: center;width:120px;" title="Padrón">PAD.</th>
                        <th style="text-align: center;width:150px;">PLACA</th>
                        <th style="text-align: center;width:150px;">RUTA</th>
                        <th style="text-align: center;width:300px;">DESTINO</th>
                        ${operadorSelectCabecera.value == 0 ? '<th style="text-align: center;width:300px;">OPERADOR</th>' : ''}
                        <th style="text-align: center;width:200px;">TELÉFONO</th>
                        <th style="text-align: center;width:30%;">EMPRESA</th>
                        <th style="text-align: center;width:150px;" title="Fecha de Renovación">F.ACTIVACIÓN</th>
                        <th style="text-align: center;width:150px;" title="Periodo de Renovación">P.RENOVACIÓN</th>
                        <th style="text-align: center;width:150px;">ESTADO</th>
                        <th style="text-align: center;width:150px;" title="Plan Tarifario">P.TARIFARIO</th>
                        <th style="text-align: center;width:200px;">SITUACIÓN</th>
                        <th style="text-align: center;width:200px;"></th>
                        <th style="text-align: center;width:200px;"></th>
                    </tr>
                    `

    tablaLineas.getElementsByTagName('thead')[0].innerHTML = strCabecera

    if (lineas.length == 0) {
        tbodyLineas.innerHTML = `<tr><td colspan="14" style="text-align:center">No hay información que mostrar con los parametros seleccionados</td><tr>`;
        return;
    }
    
    lineas.forEach((linea, i) => {
        const tr = document.createElement('tr');
        tr.setAttribute('class', 'colorear option')
        tr.addEventListener('click', () => pintarTrJs(tr));
        tr.innerHTML =
                        `  
                            <td style="vertical-align:middle;text-align: center;Width:20px">${i+1}</td>
                            <td style="vertical-align:middle;text-align: center;width:120px;">${linea.PadronActual}</td>
                            <td style="vertical-align:middle;text-align: center;width:150px;">${linea.PlacaActual}</td>
                            <td style="vertical-align:middle;text-align: center;width:150px;">${linea.RutaActual}</td>
                            <td style="vertical-align:middle;text-align: center;width:300px;">${linea.NomChipDestino}</td>
                            ${operadorSelectCabecera.value == 0 ? '<td style="vertical-align:middle;text-align: center;width:300px;">' + linea.NomProveedor + '</td>' : ''}
                            <td style="vertical-align:middle;text-align: center;width:200px;">${linea.Telefono}</td>
                            <td style="vertical-align:middle;text-align: center;width:30%;">${linea.NomEmpresa}</td>
                            <td style="vertical-align:middle;text-align: center;width:150px;">${linea.FechaActivacion}</td>
                            <td style="vertical-align:middle;text-align: center;width:150px;">${linea.FechaRenovacionInicio}</td>
                            <td style="vertical-align:middle;text-align: center;width:150px;"><span class="${linea.CodEstado == 1 ? 'label label-success' : 'label label-danger'}">${linea.NomEstado}</span></td>
                            <td style="vertical-align:middle;text-align: center;width:150px;">${linea.PlanTarifario}</td>
                            <td style="vertical-align:middle;text-align: center;width:200px;">${linea.NomSituacion}</td>
                            <td style="vertical-align:middle;text-align: center"><i onclick="abrirModalEstadoySituacion(${linea.CodChip},${linea.Telefono},${linea.CodEstado},${linea.CodSituacion})" title="Modificar Estado o Situacion de Linea" style="cursor:pointer;color:#2086da;font-size:18px" class="fa fa-pencil" aria-hidden="true"></i></td>
                            <td style="vertical-align:middle;text-align: center"><button onclick="abrirModalHistorial()" style="color: black !important">Historial</button></td>
                        `
        // tr.querySelector('.eliminar-act').addEventListener('click', () => eliminarActividad(act));
        tbodyLineas.append(tr);

        strCuerpoExportar +=    `
                                <tr>
                                    <td style="vertical-align:middle;text-align: center">${i+1}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.PadronActual}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.PlacaActual}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.RutaActual}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomChipDestino}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomProveedor}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.Telefono}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomEmpresa}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.FechaActivacion}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.FechaRenovacionInicio}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomEstado}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.PlanTarifario}</td>
                                    <td style="vertical-align:middle;text-align: center">${linea.NomSituacion}</td>
                                </tr>
                                `
    })
    tablaLineasExportar.getElementsByTagName('tbody')[0].innerHTML = strCuerpoExportar
}

async function abrirModalEstadoySituacion(codigoChip,telefono,valorEstado,valorSituacion){
    divCambioEstadoySituacion.dialog({
        title: 'Registrar Movimiento de Linea',
        buttons: {
            'Guardar': function() {  
                if(indicador == 1){
                    guardarEstado(codigoChip)       //funcion para la primera pestaña
                }else{
                    guardarSituacionUbicacion(codigoChip) //funcion para la segunda pestaña
                }
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

    document.getElementById('divEstadoySituacion').parentElement.childNodes[1].childNodes[3].childNodes[1].childNodes[1].childNodes[3].innerText = telefono

    //para mostrar u ocultar dependiendo de la vista
    $("#cajaCambiarEstado").css('background','#3286ecb5')
    $("#cajaCambiarSituacion").css('background','#BEC0C2')
    await editarEstado()
    
    //para setear los valores en la pestaña estados
    if(valorEstado == 1){
        switchActivoInput.checked = true
        switchInactivoInput.checked = false
        //DESAPARECER el div de inactivo y APARECER el div activo
        divInactivar.style.display = "none"
        divActivar.style.display = ""
        document.querySelector('#cajaCambiarSituacion').style.display = ''
    }else{
        switchActivoInput.checked = false
        switchInactivoInput.checked = true
        //APARECER el div de inactivo y DESAPARECER el div activo
        divInactivar.style.display = ""
        divActivar.style.display = "none"
        document.querySelector('#cajaCambiarSituacion').style.display = 'none'
        //setear el valor de la situacion
        if(valorSituacion == 8){ //8-suspendido
            switchSuspenderInput.checked = true
            switchAnularInput.checked = false
        }else{ //9-anulado
            switchSuspenderInput.checked = false
            switchAnularInput.checked = true
        }
    }
    //para setear los valores en la pestaña situaciones
    await llenarComboSituacion(valorEstado,valorSituacion)

    indicador = 1       //inicia con la primera pestaña
}

async function guardarSituacionUbicacion(codigoChip){

    const data = {
        Procedimiento: 'ProcChipSituacion',
        Parametro: `${codigoChip}|${situacionSelect.value}|${ubicacionSelect.value}|${CodigoUsuario}`,
        Indice: 30,
    };
    const response = await fetch(urlGeneral, DataFetch(data, 'POST')).then(res => res.json());
    const jsondata = response['dt0'][0];
    ObjUtil.MostrarMensaje(jsondata.DesResultado,jsondata.CodResulado);
    if (Number(jsondata.CodResulado) == 1) {
        divCambioEstadoySituacion.dialog('close');
        listarLineas();
    }
}

async function guardarEstado(codigoChip){

    let codigoEstado = switchActivoInput.checked ? 1 : 2  //1-activo 2-inactivo
    let codigoSituacion = 0
    if(codigoEstado == 2){
        if(switchSuspenderInput.checked){
            codigoSituacion = 8
        }else{
            codigoSituacion = 9
        }
    }
    //cuando es activo enviar parametros 0 tanto en codSituacion como en CodUbicacion
    const data = {
        Procedimiento: 'ProcChipSituacion',
        Parametro: `${codigoChip}|${codigoEstado}|${codigoSituacion}|0|${CodigoUsuario}`,
        Indice: 31,
    };
    const response = await fetch(urlGeneral, DataFetch(data, 'POST')).then(res => res.json());
    const jsondata = response['dt1'][0];
    ObjUtil.MostrarMensaje(jsondata.DesResultado,jsondata.CodResultado);
    if (Number(jsondata.CodResultado) == 1) {
        divCambioEstadoySituacion.dialog('close');
        listarLineas();
    }
}

function activoInactivo(value){ //1 activo - 2 inactivo
    if (value == 1){
        divInactivar.style.display = "none"
        divActivar.style.display = ""
        document.querySelector('#cajaCambiarSituacion').style.display = ''
        llenarComboSituacion(1,7)   //setea el valor de disponible al estado del chip   
    }else{
        divInactivar.style.display = ""
        divActivar.style.display = "none"
        document.querySelector('#cajaCambiarSituacion').style.display = 'none'
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
    situacion = parseInt(situacion)
    const data = {
        Procedimiento: 'ProcChipSituacion',
        Parametro: situacion,
        Indice: 13
    };

    const Datos = await fetch(urlGeneral, DataFetch(data, "POST")).then(res => res.json())
    const jsondata = Datos['dt0']

    if(situacion == 1){
        document.querySelector('#selectUbicacion').setAttribute('disabled',true)
    }else{
        document.querySelector('#selectUbicacion').removeAttribute('disabled')
    }

    if(situacion == 2 || situacion == 3 || situacion == 4 || situacion == 5){
        document.querySelector('#divComentario').style.display = ''
    }else{
        document.querySelector('#divComentario').style.display = 'none'
    }

    if(jsondata.length == 0){
        document.querySelector('#divUbicacion').setAttribute('style','display:none')
        return
    }
    document.querySelector('#divUbicacion').setAttribute('style','display:')

    let strOptions = ''
    jsondata.map(function (data, i) {
        strOptions += `<option value="${data.CodUbicacion}">${data.NomUbicacion}</option>`
    })

    ubicacionSelect.innerHTML = strOptions
}

async function abrirModalHistorial(){
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
}

//funcion para cambiar la vista del modal para la primera pestaña
async function editarEstado(){

    indicador = 1

    $("#cajaCambiarEstado").css('background','#3286ecb5')
    $("#cajaCambiarSituacion").css('background','#BEC0C2')
    document.querySelector('#div2doModal').style.display = 'none'
    document.querySelector('#btnsActivoInactivo').style.display = ''
    if(switchActivoInput.checked){
        document.querySelector('#divActivarLinea').style.display = ''
        document.querySelector('#divInactivarLinea').style.display = 'none'
    }else{
        document.querySelector('#divActivarLinea').style.display = 'none'
        document.querySelector('#divInactivarLinea').style.display = ''
    }
}

//funcion para cambiar la vista del modal para la segunda pestaña
async function editarSituacion(){

    indicador = 2

    $("#cajaCambiarEstado").css('background','#BEC0C2')
    $("#cajaCambiarSituacion").css('background','#3286ecb5')
    document.querySelector('#div2doModal').style.display = ''
    document.querySelector('#btnsActivoInactivo').style.display = 'none'
    document.querySelector('#divActivarLinea').style.display = 'none'
    document.querySelector('#divInactivarLinea').style.display = 'none'
}

async function cambioUbicacion(val){
    if(val == 4){
        document.querySelector('#divComentario').style.display = ''
    }else{
        document.querySelector('#divComentario').style.display = 'none'
    }
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

//////////////////////////////////////////////////////////////////////////////
let options = document.getElementById("options");
let optionList = ["Fabricación", "Almacén", "Producción", "Distribución", "Prototipo", "Corporativo"];
const estadosCombo  = ["Fabricación", "Almacén", "Producción", "Distribución", "Prototipo", "Corporativo"];
const situacionCombo  = ["Unidad", "Reten", "", "Distribución", "Prototipo", "Corporativo"];
const ubicacionCombo  = ["Fabricación", "Almacén", "Producción", "Distribución", "Prototipo", "Corporativo"];
let isOpen = false;
//options.addEventListener("click", addToUIOptions);
function getMessage() {
    message.className = "message";

    if (options.firstElementChild.classList.contains("hide-option")) {
        message.classList.add("danger");

        document.body.appendChild(message);

        deleteMessage(message);
    }
    else {
        message.classList.add("success");
        message.textContent = "Thanks for completing :)";

        document.body.appendChild(message);

        deleteMessage(message);
    }

}
function deleteMessage(el) {
    setTimeout(() => {
        document.body.removeChild(el);
    }, 6000);
}
function addToUIOptions(e) {
    if (e.target.classList.contains("hide-option")) {
        controlOptions(e);
    }
    else {
        const pickedOption = e.target;

        if (options.firstElementChild.classList.contains("hide-option")) {
            options.removeChild(options.firstElementChild);
        }
        options.insertAdjacentElement("afterbegin", pickedOption);

        deleteOptions();
        controlOptions(e);
    }
}
function controlOptions(e) {
    if (isOpen === false) {
        createOptions();
        options.classList.add("opened");
        isOpen = true;
    }
    else {
        deleteOptions();
        options.classList.remove("opened");
        isOpen = false;
    }
}
function deleteOptions() {
    while (options.childElementCount > 1) {
        options.removeChild(options.lastElementChild);
    }
}
function createOptions() {
    optionList.forEach(element => {
        if (options.firstElementChild.textContent !== element) {
            let option = document.createElement("div");
            option.className = "option";
            option.textContent = element;

            options.firstElementChild.insertAdjacentElement("afterend", option);
        }
    });
};
//////////////////////////////////////////////////////////////////////////////






//FUNCIONES PARA EL TREE VIEWER
var checks = document.querySelectorAll("input[type=checkbox]");

for(var i = 0; i < checks.length; i++){
    checks[i].addEventListener( 'change', function() {
        if(this.checked) {
        showChildrenChecks(this);
        } else {
        hideChildrenChecks(this)
        }
    });
}

function showChildrenChecks(elm) {
    var pN = elm.parentNode;
    var childCheks = pN.children;

    for(var l = 0; l < childCheks.length; l++){
        if(hasClass(childCheks[l], 'child-check')){
            childCheks[l].classList.add("active");    
        }
    }
}

function hideChildrenChecks(elm) {
    var pN = elm.parentNode;
    var childCheks = pN.children;

    for(var i = 0; i < childCheks.length; i++){
        if(hasClass(childCheks[i], 'child-check')){
            childCheks[i].classList.remove("active");      
        }
    }
}

function hasClass(elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}

async function desplegarOpcionesArbol(){
    let options = document.querySelector('#opcionesTreeViewer')
    if(options.style.display == 'none'){
        options.style.display = ''
    }else{
        options.style.display = 'none'
    }
}

async function aplicarFiltros(){
    let options = document.querySelector('#opcionesTreeViewer')
    options.style.display = 'none'
}