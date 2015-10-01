/*-------------------------------------------------------------------------- 
conocimientoDetalle.js
Funciones js par la página ConocimientoDetalle.html
---------------------------------------------------------------------------*/
var conocimientoId = 0; 
function initForm() {
    // comprobarLogin();
    // de smart admin
    pageSetUp();
    // 
    getVersionFooter();
    vm = new conocimientoData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());
    $("#btnSalir").click(salir());
    $("#frmConocimiento").submit(function () {
        return false;
    });

    $("#cmbCatConocimientos").select2({
        language: {
            errorLoading: function () { return "La carga falló"; }, 
            inputTooLong: function (e) { var t = e.input.length - e.maximum, n = "Por favor, elimine " + t + " car"; return t == 1?n += "ácter":n += "acteres", n; }, 
            inputTooShort: function (e) { var t = e.minimum - e.input.length, n = "Por favor, introduzca " + t + " car"; return t == 1?n += "ácter":n += "acteres", n; }, 
            loadingMore: function () { return "Cargando más resultados…"; }, 
            maximumSelected: function (e) { var t = "Sólo puede seleccionar " + e.maximum + " elemento"; return e.maximum != 1 && (t += "s"), t; }, 
            noResults: function () { return "No se encontraron resultados"; }, 
            searching: function () { return "Buscando…"; }
        }
    });
    
    $("#cmbHabilidades").select2({
        language: {
            errorLoading: function () { return "La carga falló"; }, 
            inputTooLong: function (e) { var t = e.input.length - e.maximum, n = "Por favor, elimine " + t + " car"; return t == 1?n += "ácter":n += "acteres", n; }, 
            inputTooShort: function (e) { var t = e.minimum - e.input.length, n = "Por favor, introduzca " + t + " car"; return t == 1?n += "ácter":n += "acteres", n; }, 
            loadingMore: function () { return "Cargando más resultados…"; }, 
            maximumSelected: function (e) { var t = "Sólo puede seleccionar " + e.maximum + " elemento"; return e.maximum != 1 && (t += "s"), t; }, 
            noResults: function () { return "No se encontraron resultados"; }, 
            searching: function () { return "Buscando…"; }
        }
    });

    conocimientoId = gup('ConocimientoId');
    if (conocimientoId != 0) {
        var data = {
            conocimientoId: conocimientoId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: "/api/conocimientos/" + conocimientoId,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                var conocimiento = data;
                // hay que buscar las categorias relacionadas
                $.ajax({
                    type: "GET",
                    url: "/api/conocimientos-categorias/" + conocimientoId,
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    success: function (data, status) {
                        var categorias = data;
                        $.ajax({
                            type: "GET",
                            url: "/api/conocimientos-habilidades/" + conocimientoId,
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            success: function (data, status) {
                                var habilidades = data;
                                // hay que mostrarlo en la zona de datos
                                loadData(conocimiento, categorias, habilidades);
                            },
                            error: errorAjax
                        });
                    },
                    error: errorAjax
                });
                // hay que mostrarlo en la zona de datos
                loadData(data);
            },
            error: errorAjax
        });
    } else {
        // se trata de un alta ponemos el id a cero para indicarlo.
        vm.conocimientoId(0);
        loadCatConocimientos(-1);
        loadHabilidades(-1);
    }
}

function conocimientoData() {
    var self = this;
    self.conocimientoId = ko.observable();
    self.nombre = ko.observable();
    self.catConocimiento = ko.observable();
    self.tipo = ko.observable();
    // soporte de combos
    self.posiblesCatConocimientos = ko.observableArray([]);
    self.elegidosCatConocimientos = ko.observableArray([]);
    self.posiblesHabilidades = ko.observableArray([]);
    self.elegidosHabilidades = ko.observableArray([]);
    // valores escogidos
    self.scatConocimientoId = ko.observable();
    self.shabilidadId = ko.observable();
}

function loadData(conocimiento, categorias, habilidades) {
    vm.conocimientoId(conocimiento.conocimientoId);
    vm.nombre(conocimiento.nombre);
    // montaje de las categorías
    loadCatConocimientos(categorias);
    loadHabilidades(habilidades);
}

function loadCatConocimientos(categorias){
    $.ajax({
        type: "GET",
        url: "/api/catConocimientos",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status){
            vm.posiblesCatConocimientos(data);
            $("#cmbCatConocimientos").val(categorias).trigger('change');
        },
        error: errorAjax
    });
}

function loadHabilidades(habilidades) {
    $.ajax({
        type: "GET",
        url: "/api/habilidades",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesHabilidades(data);
            $("#cmbHabilidades").val(habilidades).trigger('change');
        },
        error: errorAjax
    });
}
function datosOK() {
    $('#frmConocimiento').validate({
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
    //// comprobamos que ha seleccionado al menos una categoría y un tipo
    //if (vm.scatConocimientoId() < 0 || vm.stipoId() < 0) {
    //    mostrarMensajeSmart("Debe seleccionar una categoría y un tipo");
    //    return false;
    //}
    return $('#frmConocimiento').valid();
}

function aceptar2() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            conocimiento: {
                "conocimientoId": vm.conocimientoId(),
                "nombre": vm.nombre(),
                "catConocimiento": {
                    "catConocimientoId": vm.scatConocimientoId()
                }
            }
        };
        if (conocimientoId == 0) {
            $.ajax({
                type: "POST",
                url: "api/conocimientos",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // Nos volvemos al general
                    var url = "ConocimientoGeneral.html?ConocimientoId=" + data.conocimientoId;
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: "api/conocimientos/" + conocimientoId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // Nos volvemos al general
                    var url = "ConocimientoGeneral.html?ConocimientoId=" + data.conocimientoId;
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        }
    };
    return mf;
}


function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        var data = {
            conocimiento: {
                "conocimientoId": vm.conocimientoId(),
                "nombre": vm.nombre()
            }
        };
        if (conocimientoId == 0) {
            async.series(
                [
                    function (callback) {
                        $.ajax({
                            type: "POST",
                            url: "api/conocimientos",
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            success: function (data, status) {
                                conocimientoId = data.conocimientoId;
                                callback(null, null);
                            },
                            error: function (xhr, textStatus, errorThrwon) { 
                                callback(xhr, null);
                            }
                        });
                    }, 
                    function (callback) {
                        var data = {
                            "conocimientoId": conocimientoId,
                            "categorias": vm.elegidosCatConocimientos()
                        };
                        $.ajax({
                            type: "POST",
                            url: "api/conocimientos-categorias",
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            success: function (data, status) {
                                callback(null, null);
                            },
                            error: function (xhr, textStatus, errorThrwon) {
                                callback(xhr, null);
                            }
                        });
                    }, 
                    function (callback) {
                        var data = {
                            "conocimientoId": conocimientoId,
                            "habilidades": vm.elegidosHabilidades()
                        };
                        $.ajax({
                            type: "POST",
                            url: "api/conocimientos-habilidades",
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            success: function (data, status) {
                                callback(null, null);
                            },
                            error: function (xhr, textStatus, errorThrwon) {
                                callback(xhr, null);
                            }
                        });
                    }
                ], 
                function (err, results) {
                    if (err != null) {
                        errorAjaxSerial(err);
                    } else {
                        // Nos volvemos al general
                        var url = "ConocimientoGeneral.html?ConocimientoId=" + conocimientoId;
                        window.open(url, '_self');
                    }
                }
            );
        } else {
            async.series(
                [
                    function (callback) {
                        $.ajax({
                            type: "PUT",
                            url: "api/conocimientos/" + conocimientoId,
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            success: function (data, status) {
                                callback(null, null);
                            },
                            error: function (xhr, textStatus, errorThrwon) {
                                callback(xhr, null);
                            }
                        });
                    }, 
                    function (callback) {
                        var data = {
                            "conocimientoId": vm.conocimientoId(),
                            "categorias": vm.elegidosCatConocimientos()
                        };
                        $.ajax({
                            type: "POST",
                            url: "api/conocimientos-categorias",
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            success: function (data, status) {
                                callback(null, null);
                            },
                            error: function (xhr, textStatus, errorThrwon) {
                                callback(xhr, null);
                            }
                        });
                    }, 
                    function (callback) {
                        var data = {
                            "conocimientoId": conocimientoId,
                            "habilidades": vm.elegidosHabilidades()
                        };
                        $.ajax({
                            type: "POST",
                            url: "api/conocimientos-habilidades",
                            dataType: "json",
                            contentType: "application/json",
                            data: JSON.stringify(data),
                            success: function (data, status) {
                                callback(null, null);
                            },
                            error: function (xhr, textStatus, errorThrwon) {
                                callback(xhr, null);
                            }
                        });
                    }
                ], 
                function (err, results) {
                    if (err != null) {
                        errorAjaxSerial(err);
                    } else {
                        // Nos volvemos al general
                        var url = "ConocimientoGeneral.html?ConocimientoId=" + conocimientoId;
                        window.open(url, '_self');
                    }
                }
            );
        }
    };
    return mf;
}

function salir() {
    var mf = function () {
        var url = "ConocimientoGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}