/*-------------------------------------------------------------------------- 
puntoDetalle.js
Funciones js par la página PuntoDetalle.html
---------------------------------------------------------------------------*/
var puntId = 0; 
function initForm() {
    comprobarLogin();
    // de smart admin
    pageSetUp();
    // 
    getVersionFooter();
    vm = new admData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());
    $("#btnSalir").click(salir());
    $("#frmPunto").submit(function () {
        return false;
    });

    puntId = gup('PuntoId');
    if (puntId != 0) {
        var data = {
            puntoId: puntId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/puntos/" + puntId,
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
        vm.puntoId(0);
    }
}

function admData() {
    var self = this;
    self.puntoId = ko.observable();
    self.nombre = ko.observable();
    self.tag = ko.observable();
    self.bloque = ko.observable();
    self.edificio = ko.observable();
    self.cota = ko.observable();
    self.observaciones = ko.observable();
}

function loadData(data) {
    vm.puntoId(data.puntoId);
    vm.nombre(data.nombre);
    vm.tag(data.tag);
    vm.bloque(data.bloque);
    vm.edificio(data.edificio);
    vm.cota(data.cota);
    vm.observaciones(data.observaciones);
}

function datosOK() {
    $('#frmPunto').validate({
        rules: {
            txtNombre: { required: true },
            txtTag: { required: true }
        },
        // Messages for form validation
        messages: {
            txtNombre: {required: 'Introduzca el nombre'},
            txtTag: {required: 'Introduzca el login'}
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    return $('#frmPunto').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            punto: {
                "puntoId": vm.puntoId(),
                "nombre": vm.nombre(),
                "tag": vm.tag(),
                "bloque": vm.bloque(),
                "edificio": vm.edificio(),
                "cota": vm.cota(),
                "observaciones": vm.observaciones()
            }
        };
        if (puntId == 0) {
            $.ajax({
                type: "POST",
                url: myconfig.apiUrl + "/api/puntos",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "PuntoControlGeneral.html?PuntoId=" + vm.puntoId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: myconfig.apiUrl + "/api/puntos/" + puntId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "PuntoControlGeneral.html?PuntoId=" + vm.puntoId();
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
        var url = "PuntoControlGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}