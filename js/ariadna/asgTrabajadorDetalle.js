/*-------------------------------------------------------------------------- 
asgTrabajadorDetalle.js
Funciones js par la página AsgTrabajadorDetalle.html
---------------------------------------------------------------------------*/
var asgTrabajadorId = 0; 
function initForm() {
    // comprobarLogin();
    // de smart admin
    pageSetUp();
    // 
    getVersionFooter();
    vm = new asgTrabajadorData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());
    $("#btnSalir").click(salir());
    $("#frmAsgTrabajador").submit(function () {
        return false;
    });
    
    

    asgTrabajadorId = gup('AsgTrabajadorId');
    if (asgTrabajadorId != 0) {
        var data = {
            asgTrabajadorId: asgTrabajadorId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: "/api/asg-trabajadores/" + asgTrabajadorId,
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
        vm.asgTrabajadorId(0);
        loadTrabajadores(-1);
        loadEjercicios(-1);
        loadPaises(-1);
        loadUnidades(-1);
        loadAreas(-1);
        loadPuestos(-1);
    }
}

function asgTrabajadorData() {
    var self = this;
    self.asgTrabajadorId = ko.observable();
    self.trabajador = ko.observable();
    self.ejercicio = ko.observable();
    self.nombre = ko.observable();
    self.pais = ko.observable();
    self.unidad = ko.observable();
    self.area = ko.observable();
    self.puesto = ko.observable();
    self.fijo = ko.observable();
    self.variable = ko.observable();
    // soporte de combos
    self.posiblesTrabajadores = ko.observableArray([]);
    self.posiblesEjercicios = ko.observableArray([]);
    self.posiblesPaises = ko.observableArray([]);
    self.posiblesUnidades = ko.observableArray([]);
    self.posiblesAreas = ko.observableArray([]);
    self.posiblesPuestos = ko.observableArray([]);
    // valores escogidos
    self.strabajadorId = ko.observable();
    self.sejercicioId = ko.observable();
    self.spaisId = ko.observable();
    self.sunidadId = ko.observable();
    self.sareaId = ko.observable();
    self.spuestoId = ko.observable();
}

function loadData(data) {
    vm.asgTrabajadorId(data.asgTrabajadorId);
    vm.nombre(data.nombre);
    vm.trabajador(data.trabajador);
    vm.ejercicio(data.ejercicio);
    vm.pais(data.pais);
    vm.unidad(data.unidad);
    vm.area(data.area);
    vm.puesto(data.puesto);
    vm.fijo(data.fijo);
    vm.variable(data.variable);
    loadTrabajadores(data.trabajador.trabajadorId);
    loadEjercicios(data.ejercicio.ejercicioId);
    loadPaises(data.pais.paisId);
    loadUnidades(data.unidad.unidadId);
    loadAreas(data.area.areaId);
    loadPuestos(data.puesto.puestoId);
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

function loadEjercicios(ejercicioId) {
    $.ajax({
        type: "GET",
        url: "/api/ejercicios",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesEjercicios(data);
            vm.sejercicioId(ejercicioId);
        },
        error: errorAjax
    });
}

function loadPaises(paisId) {
    $.ajax({
        type: "GET",
        url: "/api/paises",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesPaises(data);
            vm.spaisId(paisId);
        },
        error: errorAjax
    });
}

function loadUnidades(unidadId) {
    $.ajax({
        type: "GET",
        url: "/api/unidades",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesUnidades(data);
            vm.sunidadId(unidadId);
        },
        error: errorAjax
    });
}

function loadAreas(areaId) {
    $.ajax({
        type: "GET",
        url: "/api/areas",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesAreas(data);
            vm.sareaId(areaId);
        },
        error: errorAjax
    });
}

function loadPuestos(puestoId) {
    $.ajax({
        type: "GET",
        url: "/api/puestos",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesPuestos(data);
            vm.spuestoId(puestoId);
        },
        error: errorAjax
    });
}





function datosOK() {
    $('#frmAsgTrabajador').validate({
        rules: {
            cmbTrabajadores: { required: true },
            cmbEjercicios: { required: true },
            cmbPaises: { required: true },
            cmbUnidades: { required: true },
            cmbAreas: { required: true },
            cmbPuestos: { required: true },
            txtFijo: { required: true, number:true, min:0, max:99999999},
            txtVariable: { required: true, number: true, min: 0, max: 99},
        },
        // Messages for form validation
        messages: {
            cmbTrabajadores: {required: 'Seleccione una categoría'},
            cmbEjercicios: { required: 'Seleccione un ejercicio' },
            cmbPaises: { required: 'Seleccione un pais' },
            cmbUnidades: { required: 'Seleccione una unidad' },
            cmbAreas: { required: 'Seleccione un area' },
            cmbPuestos: { required: 'Seleccione un puesto' },
            txtFijo: { required: "Introduzca un fijo", min:"Valor incorrecto", max:"Valor incorrecto" },
            txtVariable: {required: "Introduzca un variable", min: "Valor incorrecto", max: "Valor incorrecto"}
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    if ($("#txtAsgTrabajador").val() == "") {
        // si no han rellenado el nombre le generamos uno
        vm.nombre($('#cmbTrabajadores option:selected').text() + " [" + $('#cmbEjercicios option:selected').text() + "]");
    }

    return $('#frmAsgTrabajador').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            asgTrabajador: {
                "asgTrabajadorId": vm.asgTrabajadorId(),
                "nombre": vm.nombre(),
                "trabajador": {
                    "trabajadorId": vm.strabajadorId()
                },
                "ejercicio": {
                    "ejercicioId": vm.sejercicioId()
                },
                "pais": {
                    "paisId": vm.spaisId()
                },
                "unidad": {
                    "unidadId": vm.sunidadId()
                },
                "area": {
                    "areaId": vm.sareaId()
                },
                "puesto": {
                    "puestoId": vm.spuestoId()
                },
                "fijo": vm.fijo(),
                "variable": vm.variable()
            }
        };
        if (asgTrabajadorId == 0) {
            $.ajax({
                type: "POST",
                url: "api/asg-trabajadores",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // Nos volvemos al general
                    var url = "AsgTrabajadorGeneral.html?AsgTrabajadorId=" + data.asgTrabajadorId;
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: "api/asg-trabajadores/" + asgTrabajadorId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // Nos volvemos al general
                    var url = "AsgTrabajadorGeneral.html?AsgTrabajadorId=" + data.asgTrabajadorId;
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
        var url = "AsgTrabajadorGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}