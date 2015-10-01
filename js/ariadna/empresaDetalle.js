/*-------------------------------------------------------------------------- 
empresaDetalle.js
Funciones js par la página EmpresaDetalle.html
---------------------------------------------------------------------------*/
var empresaId = 0; 
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
    $("#frmEmpresa").submit(function () {
        return false;
    });

    empresaId = gup('EmpresaId');
    if (empresaId != 0) {
        var data = {
            empresaId: empresaId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: "/api/empresas/" + empresaId,
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
        vm.empresaId(0);
    }
}

function admData() {
    var self = this;
    self.empresaId = ko.observable();
    self.nombre = ko.observable();
}

function loadData(data) {
    vm.empresaId(data.empresaId);
    vm.nombre(data.nombre);
}

function datosOK() {
    $('#frmEmpresa').validate({
        rules: {
            txtNombre: { required: true },
            txtLogin: { required: true },
            txtEmail: { required: true, email:true }
        },
        // Messages for form validation
        messages: {
            txtNombre: {required: 'Introduzca el nombre'},
            txtLogin: {required: 'Introduzca el login'},
            txtEmail: {required: 'Introduzca el correo', email: 'Debe usar un correo válido'}
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    return $('#frmEmpresa').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            empresa: {
                "empresaId": vm.empresaId(),
                "nombre": vm.nombre()
            }
        };
        if (empresaId == 0) {
            $.ajax({
                type: "POST",
                url: "api/empresas",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "EmpresaGeneral.html?EmpresaId=" + vm.empresaId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: "api/empresas/" + empresaId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "EmpresaGeneral.html?EmpresaId=" + vm.empresaId();
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
        var url = "EmpresaGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}