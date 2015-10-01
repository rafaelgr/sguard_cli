/*-------------------------------------------------------------------------- 
trabajadorDetalle.js
Funciones js par la página TrabajadorDetalle.html
---------------------------------------------------------------------------*/
var responsiveHelper_dt_basic = undefined;
var responsiveHelper_datatable_fixed_column = undefined;
var responsiveHelper_datatable_col_reorder = undefined;
var responsiveHelper_datatable_tabletools = undefined;

var dataAsgProyectos;

var breakpointDefinition = {
    tablet: 1024,
    phone: 480
};


var trabajadorId = 0; 
function initForm() {
    // comprobarLogin();
    // de smart admin
    pageSetUp();
    // 
    getVersionFooter();
    vm = new admData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());
    $("#btnSalir").click(salir());
    $("#btnAceptarEvaluado").click(aceptarEvaluado());    

    $("#frmTrabajador").submit(function () {
        return false;
    });
    initTablaAsgProyectos();
    trabajadorId = gup('TrabajadorId');
    if (trabajadorId != 0) {
        var data = {
            trabajadorId: trabajadorId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: "/api/trabajadores/" + trabajadorId,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                // hay que mostrarlo en la zona de datos
                loadData(data);
            },
            error: errorAjax
        });
    } else {
        // se trata de un alta ponemos el id a cero para indicarlo.
        vm.trabajadorId(0);
        // y ocultamos el campo adicional en alta
        loadEmpresas(-1);
    }
}

function admData() {
    var self = this;
    self.trabajadorId = ko.observable();
    self.nombre = ko.observable();
    self.dni = ko.observable();
    self.login = ko.observable();
    self.password = ko.observable();
    self.evaluador = ko.observable();
    self.posiblesTrabajadores = ko.observableArray([]);
    self.trabajadorEvaluado = ko.observable();
    self.posiblesIdiomas = ko.observableArray(myconfig.idiomas);
    self.idioma = ko.observable();
    // soporte de combos
    self.posiblesEmpresas = ko.observableArray([]);
    // valores escogidos
    self.sempresaId = ko.observable();
}

function loadData(data) {
    vm.trabajadorId(data.trabajadorId);
    vm.nombre(data.nombre);
    vm.dni(data.dni);
    vm.login(data.login);
    vm.password(data.password);
    vm.evaluador(data.evaluador);
    if (data.evaluador == 1) {
        $("#flEvaluados").show();
        cargarEvaluados(vm.trabajadorId());
    }
    vm.idioma(data.idioma);
    if (data.empresaId != null){
        loadEmpresas(data.empresaId);
    } else {
        loadEmpresas(-1);
    }
}

function loadEmpresas(empresaId) {
    $.ajax({
        type: "GET",
        url: "/api/empresas",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesEmpresas(data);
            vm.sempresaId(empresaId);
        },
        error: errorAjax
    });
}


function datosOK() {
    $('#frmTrabajador').validate({
        rules: {
            txtNombre: { required: true },
            txtDni: { required: true }
        },
        // Messages for form validation
        messages: {
            txtNombre: {required: 'Introduzca el nombre'},
            txtDni: {required: 'Introduzca el dni'}
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    return $('#frmTrabajador').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            trabajador: {
                "trabajadorId": vm.trabajadorId(),
                "nombre": vm.nombre(),
                "dni": vm.dni(),
                "login": vm.login(),
                "password": vm.password(),
                "evaluador": vm.evaluador(),
                "idioma": vm.idioma(),
                "empresaId": vm.sempresaId()
            }
        };
        if (trabajadorId == 0) {
            $.ajax({
                type: "POST",
                url: "api/trabajadores",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "TrabajadorGeneral.html?TrabajadorId=" + vm.trabajadorId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: "api/trabajadores/" + trabajadorId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "TrabajadorGeneral.html?TrabajadorId=" + vm.trabajadorId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        }
    };
    return mf;
}

function salir() {
    var mf = function () {
        var url = "TrabajadorGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}

function loadPosiblesTrabajadores(){
    $.ajax({
        type: "GET",
        url: "api/trabajadores",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesTrabajadores(data);
        },
        error: errorAjax
    });
}

function aceptarEvaluado(){
    var mf = function() {
        if (vm.trabajadorEvaluado() == null) return;
        data = {
            trabajador: vm.trabajadorEvaluado()
        };
        $.ajax({
            type: "POST",
            url: "api/evaluados/" + vm.trabajadorId(),
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                cargarEvaluados(vm.trabajadorId());
            },
            error: errorAjax
            });
    }
    return mf;
}

function cargarEvaluados(id){
    // cargar la tabla con un único valor que es el que corresponde.
    var buscar = {
        evaluadorId: id
    }
    // hay que buscar ese elemento en concreto
    $.ajax({
        type: "POST",
        url: "api/asg-proyectos-buscar",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(buscar),
        success: function (data, status) {
            // hay que mostrarlo en la zona de datos
            //var data2 = [data];
            loadTablaAsgProyectos(data);
        },
        error: errorAjax
    });
}

function initTablaAsgProyectos() {
    tablaCarro = $('#dt_asgProyecto').dataTable({
        bPaginate: false,
        bFilter: false,
        bInfo: false,
        autoWidth: true,
        preDrawCallback: function () {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_asgProyecto'), breakpointDefinition);
            }
        },
        rowCallback: function (nRow) {
            responsiveHelper_dt_basic.createExpandIcon(nRow);
        },
        drawCallback: function (oSettings) {
            responsiveHelper_dt_basic.respond();
        },
        language: {
            processing: "Procesando...",
            info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
            infoFiltered: "(filtrado de un total de _MAX_ registros)",
            infoPostFix: "",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "Ningún dato disponible en esta tabla",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            },
            aria: {
                sortAscending: ": Activar para ordenar la columna de manera ascendente",
                sortDescending: ": Activar para ordenar la columna de manera descendente"
            }
        },
        data: dataAsgProyectos,
        columns: [{
                data: "nombre"
            }, {
                data: "trabajador.nombre"
            }, {
                data: "proyecto.nombre"
            }, {
                data: "rol.nombre"
            }]
    });
}

function loadTablaAsgProyectos(data) {
    var dt = $('#dt_asgProyecto').dataTable();
    if (data !== null && data.length === 0) {
        // mostrarMensajeSmart('No se han encontrado registros');
        // $("#tbAsgProyecto").hide();
        dt.fnClearTable();
        dt.fnDraw();
        $("#tbAsgProyecto").show();
    } else {
        dt.fnClearTable();
        dt.fnAddData(data);
        dt.fnDraw();
        $("#tbAsgProyecto").show();
    }
}

