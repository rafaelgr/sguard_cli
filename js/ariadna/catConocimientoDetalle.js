/*-------------------------------------------------------------------------- 
catConocimientoDetalle.js
Funciones js par la página CatConocimientoDetalle.html
---------------------------------------------------------------------------*/
var catConocimientoId = 0; 
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
    $("#frmCatConocimiento").submit(function () {
        return false;
    });

    catConocimientoId = gup('CatConocimientoId');
    if (catConocimientoId != 0) {
        var data = {
            catConocimientoId: catConocimientoId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: "/api/catConocimientos/" + catConocimientoId,
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
        vm.catConocimientoId(0);
    }
}

function admData() {
    var self = this;
    self.catConocimientoId = ko.observable();
    self.nombre = ko.observable();
    self.login = ko.observable();
    self.password = ko.observable();
    self.email = ko.observable();
}

function loadData(data) {
    vm.catConocimientoId(data.catConocimientoId);
    vm.nombre(data.nombre);
    vm.login(data.login);
    vm.password(data.password);
    vm.email(data.email);
}

function datosOK() {
    $('#frmCatConocimiento').validate({
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
    return $('#frmCatConocimiento').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            catConocimiento: {
                "catConocimientoId": vm.catConocimientoId(),
                "nombre": vm.nombre()
            }
        };
        if (catConocimientoId == 0) {
            $.ajax({
                type: "POST",
                url: "api/catConocimientos",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "CatConocimientoGeneral.html?CatConocimientoId=" + vm.catConocimientoId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: "api/catConocimientos/" + catConocimientoId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "CatConocimientoGeneral.html?CatConocimientoId=" + vm.catConocimientoId();
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
        var url = "CatConocimientoGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}