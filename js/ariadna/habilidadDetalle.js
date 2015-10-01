/*-------------------------------------------------------------------------- 
habilidadDetalle.js
Funciones js par la página HabilidadDetalle.html
---------------------------------------------------------------------------*/
var habilidadId = 0; 
function initForm() {
    // comprobarLogin();
    // de smart admin
    pageSetUp();
    // 
    getVersionFooter();
    vm = new habilidadData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());
    $("#btnSalir").click(salir());
    $("#frmHabilidad").submit(function () {
        return false;
    });
    
    

    habilidadId = gup('HabilidadId');
    if (habilidadId != 0) {
        var data = {
            habilidadId: habilidadId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: "/api/habilidades/" + habilidadId,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                // hay que mostrarlo en la zona de datos
                loadData(data);
                loadTemplatePC1();
            },
            error: errorAjax
        });
    } else {
        // se trata de un alta ponemos el id a cero para indicarlo.
        vm.habilidadId(0);
        loadServicios(-1);
    }
}

function habilidadData() {
    var self = this;
    self.habilidadId = ko.observable();
    self.nombre = ko.observable();
    self.servicio = ko.observable();
    self.tipo = ko.observable();
    // soporte de combos
    self.posiblesServicios = ko.observableArray([]);
    // valores escogidos
    self.sservicioId = ko.observable();
}

function loadData(data) {
    vm.habilidadId(data.habilidadId);
    vm.nombre(data.nombre);
    vm.servicio(data.servicio);
    vm.tipo(data.tipo);
    loadServicios(data.servicio.servicioId);
}

function loadServicios(servicioId){
    $.ajax({
        type: "GET",
        url: "/api/servicios",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status){
            vm.posiblesServicios(data);
            vm.sservicioId(servicioId);
        },
        error: errorAjax
    });
}

function datosOK() {
    $('#frmHabilidad').validate({
        rules: {
            txtNombre: { required: true },
            cmbServicios: { required: true }
        },
        // Messages for form validation
        messages: {
            txtNombre: {required: 'Introduzca el nombre'},
            cmbServicios: {required: 'Seleccione un servicio'}
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    //// comprobamos que ha seleccionado al menos una categoría y un tipo
    //if (vm.sservicioId() < 0 || vm.stipoId() < 0) {
    //    mostrarMensajeSmart("Debe seleccionar una categoría y un tipo");
    //    return false;
    //}
    return $('#frmHabilidad').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            habilidad: {
                "habilidadId": vm.habilidadId(),
                "nombre": vm.nombre(),
                "servicio": {
                    "servicioId": vm.sservicioId()
                }
            }
        };
        if (habilidadId == 0) {
            $.ajax({
                type: "POST",
                url: "api/habilidades",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // Nos volvemos al general
                    var url = "HabilidadGeneral.html?HabilidadId=" + data.habilidadId;
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: "api/habilidades/" + habilidadId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // Nos volvemos al general
                    var url = "HabilidadGeneral.html?HabilidadId=" + data.habilidadId;
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
        var url = "HabilidadGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}

function loadTemplatePC1() {
    // cargar la tabla con un único valor que es el que corresponde.
    var data = {
        informe: "phabilidadtrabajador",
        tipo: "j",
        id: habilidadId
    }
    // hay que buscar ese elemento en concreto
    $.ajax({
        type: "POST",
        url: myconfig.apiUrl + "/api/informes",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data, status) {
            // hay que mostrarlo en la zona de datos
            // vm.asignaciones(data);
            loadTemplatePC2(data[0]);
        },
        error: errorAjax
    });
}
function loadTemplatePC2(data) {
    //
    // Grab the template script
    var theTemplateScript = $("#ac-conocimientos").html();
    // Compile the template
    var theTemplate = Handlebars.compile(theTemplateScript);
    // Pass our data to the template
    var theCompiledHtml = theTemplate(data);
    // Add the compiled html to the page
    $('#hdbContent').html(theCompiledHtml);
}