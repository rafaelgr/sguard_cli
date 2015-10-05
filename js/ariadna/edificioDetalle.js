﻿/*-------------------------------------------------------------------------- 
edificioDetalle.js
Funciones js par la página EdificioDetalle.html
---------------------------------------------------------------------------*/
var adminId = 0;

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
    $("#frmEdificio").submit(function() {
        return false;
    });

    adminId = gup('EdificioId');
    if (adminId != 0) {
        var data = {
                edificioId: adminId
            }
            // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/edificios/" + adminId,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(data, status) {
                // hay que mostrarlo en la zona de datos
                loadData(data);
            },
            error: errorAjax
        });
    } else {
        // se trata de un alta ponemos el id a cero para indicarlo.
        vm.edificioId(0);
    }
}

function admData() {
    var self = this;
    self.edificioId = ko.observable();
    self.nombre = ko.observable();
    self.grupo = ko.observable();
    //-- apoyo combos
    self.posiblesCombos =ko.observableArray();
}

function loadData(data) {
    vm.edificioId(data.edificioId);
    vm.nombre(data.nombre);
}

function datosOK() {
    return $('#frmEdificio').valid();
}

function aceptar() {
    var mf = function() {
        if (!datosOK())
            return;
        var data = {
            edificio: {
                "edificioId": vm.edificioId(),
                "nombre": vm.nombre()
            }
        };
        if (adminId == 0) {
            $.ajax({
                type: "POST",
                url: myconfig.apiUrl + "/api/edificios",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "EdificioGeneral.html?EdificioId=" + vm.edificioId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: myconfig.apiUrl + "/api/edificios/" + adminId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function(data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "EdificioGeneral.html?EdificioId=" + vm.edificioId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        }
    };
    return mf;
}

function salir() {
    var mf = function() {
        var url = "EdificioGeneral.html";
        window.open(url, '_self');
    };
    return mf;
}
