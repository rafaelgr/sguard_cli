/*-------------------------------------------------------------------------- 
rondaDetalle.js
Funciones js par la página RondaDetalle.html
---------------------------------------------------------------------------*/
var rondId = 0; 
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
    $("#frmRonda").submit(function () {
        return false;
    });

    rondId = gup('RondaId');
    if (rondId != 0) {
        var data = {
            rondaId: rondId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/rondas/detalle/" + rondId,
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
        vm.rondaId(0);
    }
}

function admData() {
    var self = this;
    self.rondaId = ko.observable();
    self.nombre = ko.observable();
}

function loadData(data) {
    vm.rondaId(data.rondaId);
    vm.nombre(data.nombre);
}

function datosOK() {
    $('#frmRonda').validate({
        rules: {
            txtNombre: { required: true }
        },
        // Messages for form validation
        messages: {
            txtNombre: {required: 'Introduzca el nombre'}
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    return $('#frmRonda').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            ronda: {
                "rondaId": vm.rondaId(),
                "nombre": vm.nombre()
            }
        };
        if (rondId == 0) {
            $.ajax({
                type: "POST",
                url: myconfig.apiUrl + "/api/rondas",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "RondaGeneral.html?RondaId=" + vm.rondaId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: myconfig.apiUrl + "/api/rondas/" + rondId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "RondaGeneral.html?RondaId=" + vm.rondaId();
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
        var url = "RondaGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}