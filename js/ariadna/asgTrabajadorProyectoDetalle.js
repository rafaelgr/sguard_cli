/*-------------------------------------------------------------------------- 
asgTrabajadorProyectoDetalle.js
Funciones js par la página AsgTrabajadorProyectoDetalle.html
---------------------------------------------------------------------------*/
var asgProyectoId = 0; 
function initForm() {
    // comprobarLogin();
    // de smart admin
    pageSetUp();
    // 
    getVersionFooter();
    vm = new asgProyectoData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());
    $("#btnSalir").click(salir());
    $("#frmAsgProyecto").submit(function () {
        return false;
    });
    
    

    asgProyectoId = gup('AsgProyectoId');
    if (asgProyectoId != 0) {
        var data = {
            asgProyectoId: asgProyectoId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: "/api/asg-proyectos/" + asgProyectoId,
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
        vm.asgProyectoId(0);
        loadTrabajadores(-1);
        loadProyectos(-1);
        loadRoles(-1);
        loadEvaluadores(-1);
    }
}

function asgProyectoData() {
    var self = this;
    self.asgProyectoId = ko.observable();
    self.trabajador = ko.observable();
    self.proyecto = ko.observable();
    self.nombre = ko.observable();
    self.rol = ko.observable();
    // soporte de combos
    self.posiblesTrabajadores = ko.observableArray([]);
    self.posiblesProyectos = ko.observableArray([]);
    self.posiblesRoles = ko.observableArray([]);
    self.posiblesEvaluadores = ko.observableArray([]);
    // valores escogidos
    self.strabajadorId = ko.observable();
    self.sproyectoId = ko.observable();
    self.srolId = ko.observable();
    self.sevaluadorId = ko.observable();
}

function loadData(data) {
    vm.asgProyectoId(data.asgProyectoId);
    vm.nombre(data.nombre);
    vm.trabajador(data.trabajador);
    vm.proyecto(data.proyecto);
    vm.rol(data.rol);
    loadTrabajadores(data.trabajador.trabajadorId);
    loadProyectos(data.proyecto.proyectoId);
    loadRoles(data.rol.rolId);
    if (data.evaluador != null) {
        loadEvaluadores(data.evaluador.evaluadorId);
    } else {
        loadEvaluadores(-1);
    }
}

function loadTrabajadores(trabajadorId){
    $.ajax({
        type: "GET",
        url: "/api/trabajadores",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status){
            vm.posiblesTrabajadores(data);
            vm.strabajadorId(trabajadorId);
        },
        error: errorAjax
    });
}

function loadEvaluadores(evaluadorId) {
    $.ajax({
        type: "GET",
        url: "/api/evaluadores",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesEvaluadores(data);
            vm.sevaluadorId(evaluadorId);
        },
        error: errorAjax
    });
}

function loadProyectos(proyectoId) {
    $.ajax({
        type: "GET",
        url: "/api/proyectos",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesProyectos(data);
            vm.sproyectoId(proyectoId);
        },
        error: errorAjax
    });
}

function loadRoles(rolId) {
    $.ajax({
        type: "GET",
        url: "/api/roles",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesRoles(data);
            vm.srolId(rolId);
        },
        error: errorAjax
    });
}



function datosOK() {
    $('#frmAsgProyecto').validate({
        rules: {
            cmbTrabajadores: { required: true },
            cmbProyectos: { required: true },
            cmbRoles: { required: true }
        },
        // Messages for form validation
        messages: {
            cmbTrabajadores: {required: 'Seleccione una categoría'},
            cmbProyectos: { required: 'Seleccione un proyecto' },
            cmbRoles: { required: 'Seleccione un rol' }
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    if ($("#txtAsgProyecto").val() == "") {
        // si no han rellenado el nombre le generamos uno
        vm.nombre($('#cmbTrabajadores option:selected').text() + " [" + $('#cmbProyectos option:selected').text() + "]");
    }

    return $('#frmAsgProyecto').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            asgProyecto: {
                "asgProyectoId": vm.asgProyectoId(),
                "nombre": vm.nombre(),
                "trabajador": {
                    "trabajadorId": vm.strabajadorId()
                },
                "proyecto": {
                    "proyectoId": vm.sproyectoId()
                },
                "rol": {
                    "rolId": vm.srolId()
                },
                "evaluador": {
                    "evaluadorId": vm.sevaluadorId()
                }
            }
        };
        if (vm.sevaluadorId() == -1) {
            data.asgProyecto.evaluador.evaluadorId = null;
        }
        if (asgProyectoId == 0) {
            $.ajax({
                type: "POST",
                url: "api/asg-proyectos",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // Nos volvemos al general
                    var url = "AsgTrabajadorProyecto.html?AsgProyectoId=" + data.asgProyectoId;
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: "api/asg-proyectos/" + asgProyectoId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // Nos volvemos al general
                    var url = "AsgTrabajadorProyecto.html?AsgProyectoId=" + data.asgProyectoId;
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
        var url = "AsgTrabajadorProyecto.html";
        window.open(url, '_self');
    }
    return mf;
}