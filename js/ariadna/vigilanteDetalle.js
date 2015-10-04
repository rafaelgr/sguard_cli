/*-------------------------------------------------------------------------- 
vigilanteDetalle.js
Funciones js par la página VigilanteDetalle.html
---------------------------------------------------------------------------*/
var vigilId = 0; 
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
    $("#frmVigilante").submit(function () {
        return false;
    });

    vigilId = gup('VigilanteId');
    if (vigilId != 0) {
        var data = {
            vigilanteId: vigilId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/vigilantes/" + vigilId,
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
        vm.vigilanteId(0);
    }
}

function admData() {
    var self = this;
    self.vigilanteId = ko.observable();
    self.nombre = ko.observable();
    self.tag = ko.observable();
}

function loadData(data) {
    vm.vigilanteId(data.vigilanteId);
    vm.nombre(data.nombre);
    vm.tag(data.tag);
}

function datosOK() {
    $('#frmVigilante').validate({
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
    return $('#frmVigilante').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            vigilante: {
                "vigilanteId": vm.vigilanteId(),
                "nombre": vm.nombre(),
                "tag": vm.tag()
            }
        };
        if (vigilId == 0) {
            $.ajax({
                type: "POST",
                url: myconfig.apiUrl + "/api/vigilantes",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "VigilanteGeneral.html?VigilanteId=" + vm.vigilanteId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: myconfig.apiUrl + "/api/vigilantes/" + vigilId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "VigilanteGeneral.html?VigilanteId=" + vm.vigilanteId();
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
        var url = "VigilanteGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}