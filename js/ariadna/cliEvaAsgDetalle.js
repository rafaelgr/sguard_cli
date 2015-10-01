/*-------------------------------------------------------------------------- 
evaAsgDetalle.js
Funciones js par la página EvaAsgDetalle.html
---------------------------------------------------------------------------*/
var responsiveHelper_dt_basic = undefined;
var responsiveHelper_datatable_fixed_column = undefined;
var responsiveHelper_datatable_col_reorder = undefined;
var responsiveHelper_datatable_tabletools = undefined;

var dataEvaluaciones;
var areaId;

var breakpointDefinition = {
    tablet: 1024,
    phone: 480
};

var asgProyectoId = 0;
var evaluacionId = 0;

var trabajador;
var lang;

function initForm() {
    // comprobarLogin();
    // de smart admin
    pageSetUp();
    trabajador = comprobarLoginTrabajador();
    if (trabajador.idioma != null) {
        // el idioma del trabajador
        lang = trabajador.idioma;
    } else {
        // por defecto el idioma es español
        lang = "es";
    }
    // control del idioma    
    i18n.init({ lng: lang }, function (t) {
        $(".I18N").i18n();
        initTablaEvaluaciones();
        $.datepicker.setDefaults($.datepicker.regional[lang]);
        $.validator.addMethod("greaterThan", 
        function (value, element, params) {
            var fv = moment(value, i18n.t("app.dateFormat")).format("YYYY-MM-DD");
            var fp = moment($(params).val(), i18n.t("app.dateFormat")).format("YYYY-MM-DD");
            if (!/Invalid|NaN/.test(new Date(fv))) {
                return new Date(fv) > new Date(fp);
            } else {
                return true;
            }
        
        }, i18n.t("app.dateInicialFinal"));
        validator_languages(lang);
    });
    
    controlBotones(trabajador);
    $("#userName").text(trabajador.nombre);
    
    // 
    getVersionFooter();
    vm = new asgProyectoData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());
    $("#btnSalir").click(salir());
    $("#cmbCatConocimientos").change(cambioCategoria());
    $("#frmEvaluacion").submit(function () {
        return false;
    });
    $("#btnEditar").click(editar());
    // ocultamos el botón de edición
    $("#btnEditar").hide();
    
    //initTablaEvaluaciones();

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
                loadTable1Evaluaciones(asgProyectoId);
                loadCatConocimientos(-1);
            },
            error: errorAjax
        });
    } else {
        // aqui no debería llegar
    }
}

function asgProyectoData() {
    var self = this;
    // datos de la asignción trabajador-proyecto
    self.asgProyectoId = ko.observable();
    self.trabajador = ko.observable();
    self.proyecto = ko.observable();
    self.nombre = ko.observable();
    self.rol = ko.observable();
    self.nomTrabajador = ko.observable();
    self.nomProyecto = ko.observable();
    self.nomRol = ko.observable();
    // datos propios de la evaluabción
    self.evaluacionId = ko.observable();
    self.dFecha = ko.observable();
    self.hFecha = ko.observable();
    self.observaciones = ko.observable();
    // desplegables 2
    self.posiblesCatConocimientos = ko.observableArray([]);
    self.posiblesConocimientos = ko.observableArray([]);
    self.scatConocimientoId = ko.observable();
    self.sconocimientoId = ko.observable();
}

function loadData(data) {
    vm.asgProyectoId(data.asgProyectoId);
    vm.nombre(data.nombre);
    vm.trabajador(data.trabajador);
    vm.nomTrabajador(data.trabajador.nombre);
    vm.proyecto(data.proyecto);
    vm.nomProyecto(data.proyecto.nombre);
    vm.rol(data.rol);
    vm.nomRol(data.rol.nombre);

    // fechas por defecto igual a las del proyecto
    vm.dFecha(moment(data.proyecto.fechaInicio).format(i18n.t("app.dateFormat")));
    if (data.proyecto.fechaFinal != null) {
        vm.hFecha(moment(data.proyecto.fechaFinal).format(i18n.t("app.dateFormat")));
    }
}

function datosOK() {
    $('#frmEvaluacion').validate({
        rules: {
            cmbConocimientos: { required: true },
            txtDFecha: { required: true, date:true },
            txtHFecha: { date:true, greaterThan: "#txtDFecha" }
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    $.validator.methods.date = function (value, element) {
        return this.optional(element) || moment(value, i18n.t("app.dateFormat")).isValid();
    }
    return $('#frmEvaluacion').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        // control de fechas 
        var fecha1, fecha2;
        if (moment(vm.dFecha(), i18n.t("app.dateFormat")).isValid())
            fecha1 = moment(vm.dFecha(), i18n.t("app.dateFormat")).format("YYYY-MM-DD");
        if (moment(vm.hFecha(), i18n.t("app.dateFormat")).isValid()){
            fecha2 = moment(vm.hFecha(), i18n.t("app.dateFormat")).format("YYYY-MM-DD");
        } else {
            fecha2 = null;
        }
        var data = {
            evaluacion: {
                "evaluacionId": 0,
                "asgProyecto": {
                    "asgProyectoId": asgProyectoId
                },
                "conocimiento": {
                    "conocimientoId": vm.sconocimientoId()
                },
                "dFecha": fecha1,
                "hFecha": fecha2,
                "observaciones": vm.observaciones()
            }
        };
        $.ajax({
            type: "POST",
            url: "api/evaluaciones",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                loadTable1Evaluaciones(asgProyectoId);
                limpiarCampos();
            },
            error: errorAjax
        });
    };
    return mf;
}

function salir() {
    var mf = function () {
        var url = "CliEvaPorTrabajador.html";
        window.open(url, '_self');
    }
    return mf;
}

// ---------->
function initTablaEvaluaciones() {
    tablaCarro = $('#dt_evaluacion').dataTable({
        autoWidth: true,
        preDrawCallback: function () {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_evaluacion'), breakpointDefinition);
            }
        },
        rowCallback: function (nRow) {
            responsiveHelper_dt_basic.createExpandIcon(nRow);
        },
        drawCallback: function (oSettings) {
            responsiveHelper_dt_basic.respond();
        },
        language: {
            processing: i18n.t("general.jtable.processing"),
            info: i18n.t("general.jtable.info"),
            infoEmpty: i18n.t("general.jtable.infoEmpty"),
            infoFiltered: i18n.t("general.jtable.infoFiltered"),
            infoPostFix: i18n.t("general.jtable.infoPostFix"),
            loadingRecords: i18n.t("general.jtable.loadingRecords"),
            zeroRecords: i18n.t("general.jtable.zeroRecords"),
            emptyTable: i18n.t("general.jtable.emptyTable"),
            paginate: {
                first: i18n.t("general.jtable.paginate.first"),
                previous: i18n.t("general.jtable.paginate.previous"),
                next: i18n.t("general.jtable.paginate.next"),
                last: i18n.t("general.jtable.paginate.last")
            },
            aria: {
                sortAscending: i18n.t("general.jtable.aria.sortAscending"),
                sortDescending: i18n.t("general.jtable.aria.sortDescending")
            }
        },
        data: dataEvaluaciones,
        columns: [
            {
                data: "conocimiento.nombre"
            }, 
            {
                data: "dFecha",
                render: function (data) {
                    // controlamos que si la fecha es nula no se muestre
                    if (moment(data).isValid())
                        return moment(data).format(i18n.t("app.dateFormat"));
                    else
                        return "";
                },
                class: "text-center"
            }, 
            {
                data: "hFecha",
                render: function (data) {
                    // controlamos que si la fecha es nula no se muestre
                    if (moment(data).isValid())
                        return moment(data).format(i18n.t("app.dateFormat"));
                    else
                        return "";
                },
                class: "text-center"
            }, 
            {
                data: "observaciones"
            }, 
            {
                data: "evaluacionId",
                render: function (data, type, row) {
                    var bt1 = "<button class='btn btn-circle btn-danger btn-lg' onclick='deleteEvaluacion(" + data + ");' title='" + i18n.t("app.eliminar") + "'> <i class='fa fa-trash-o fa-fw'></i> </button>";
                    var bt2 = "<button class='btn btn-circle btn-success btn-lg' onclick='editEvaluacion(" + data + ");' title='" + i18n.t("app.editar") + "'> <i class='fa fa-edit fa-fw'></i> </button>";
                    var html = "<div class='pull-right'>" + bt1 + " " + bt2 + "</div>";
                    return html;
                    }
            }]
    });
}

function loadTable1Evaluaciones(asgProyectoId) {
    // enviar la consulta por la red (AJAX)
    var data = {
        "asgProyectoId": asgProyectoId
    };
    $.ajax({
        type: "POST",
        url: "api/evaluaciones-buscar",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data, status) {
            // hay que mostrarlo en la zona de datos
            loadTable2Evaluaciones(data);
        },
        error: errorAjax
    });
}

function loadTable2Evaluaciones(data) {
    var dt = $('#dt_evaluacion').dataTable();
    if (data !== null && data.length === 0) {
        //mostrarMensajeSmart('No se han encontrado registros');
    } else {
        dt.fnClearTable();
        dt.fnAddData(data);
        dt.fnDraw();
        $("#tbEvaluacion").show();
    }
}

function loadCatConocimientos(catConocimientoId) {
    $.ajax({
        type: "GET",
        url: "/api/catConocimientos",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesCatConocimientos(data);
            vm.scatConocimientoId(catConocimientoId);
        },
        error: errorAjax
    });
}

function loadConocimientosEdit(conocimientoId) {
    $.ajax({
        type: "GET",
        url: "/api/conocimientos",
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.posiblesConocimientos(data);
            vm.sconocimientoId(conocimientoId);
        },
        error: errorAjax
    });
}

function loadConocimientos(catConocimientoId) {
    var data = {
        catConocimientoId: catConocimientoId
    }
    $.ajax({
        type: "POST",
        url: "/api/conocimientos-buscar",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data, status) {
            vm.posiblesConocimientos(data);
            vm.sconocimientoId(-1);
        },
        error: errorAjax
    });
}

function cambioCategoria() {
    var mf = function () {
        loadConocimientos(vm.scatConocimientoId());
    }
    return mf;
}




function deleteEvaluacion(id) {
    // mensaje de confirmación
    var mens = i18n.t("app.deleteMens");
    $.SmartMessageBox({
        title: "<i class='fa fa-info'></i> " + i18n.t("app.mensaje"),
        content: mens,
        buttons: '['+ i18n.t("app.aceptar") +'][' + i18n.t("app.cancelar") + ']'
    }, function (ButtonPressed) {
        if (ButtonPressed === i18n.t("app.aceptar")) {
            var data = {
                proyectoId: id
            };
            $.ajax({
                type: "DELETE",
                url: "api/evaluaciones/" + id,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    loadTable1Evaluaciones(asgProyectoId);
                },
                error: errorAjax
            });
        }
        if (ButtonPressed === i18n.t("app.cancelar")) {
            // no hacemos nada (no quiere borrar)
        }
    });
}

function editEvaluacion(id) {
    // se muestra el botón de editar y se oculta el de crear.
    $("#btnAceptar").hide();
    $("#btnEditar").show();
    // se obtiene la evaluación que coincide con el id pasado.
    $.ajax({
        type: "GET",
        url: "/api/evaluaciones/" + id,
        dataType: "json",
        contentType: "application/json",
        success: function (data, status) {
            vm.evaluacionId(data.evaluacionId);
            // cargar los valores en los campos correspondientes.
            loadConocimientosEdit(data.conocimiento.conocimientoId);
            if (data.hFecha != null) {
                vm.hFecha(moment(data.hFecha).format('DD/MM/YYYY'));
            } else {
                vm.hFecha(null);
            }
            if (data.dFecha != null) {
                vm.dFecha(moment(data.dFecha).format('DD/MM/YYYY'));
            } else {
                vm.dFecha(null);
            }
            vm.observaciones(data.observaciones);
        },
        error: errorAjax
    });
}

function editar() {
    var mf = function () {
        if (!datosOK())
            return;
        // control de fechas 
        var fecha1, fecha2;
        if (moment(vm.dFecha(), "DD/MM/YYYY").isValid())
            fecha1 = moment(vm.dFecha(), "DD/MM/YYYY").format("YYYY-MM-DD");
        if (moment(vm.hFecha(), "DD/MM/YYYY").isValid()) {
            fecha2 = moment(vm.hFecha(), "DD/MM/YYYY").format("YYYY-MM-DD");
        } else {
            fecha2 = null;
        }
        var data = {
            evaluacion: {
                "evaluacionId": vm.evaluacionId(),
                "asgProyecto": {
                    "asgProyectoId": asgProyectoId
                },
                "conocimiento": {
                    "conocimientoId": vm.sconocimientoId()
                },
                "dFecha": fecha1,
                "hFecha": fecha2,
                "observaciones": vm.observaciones()
            }
        };
        $.ajax({
            type: "PUT",
            url: "api/evaluaciones/" + vm.evaluacionId(),
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                // se oculta el botón de edición y se muestra el de creación
                $("#btnAceptar").show();
                $("#btnEditar").hide();
                // recargamos la tabla con los cambios
                loadTable1Evaluaciones(asgProyectoId);
                //
                limpiarCampos();
            },
            error: errorAjax
        });
    }
    return mf;
}

function limpiarCampos() {
    loadCatConocimientos(-1);
    vm.sconocimientoId(-1);
    vm.observaciones(null);
}