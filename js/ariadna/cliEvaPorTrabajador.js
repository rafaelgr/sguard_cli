/*-------------------------------------------------------------------------- 
evaPorTrabajador.js
Funciones js par la página EvaPorTrabajador.html

---------------------------------------------------------------------------*/
var responsiveHelper_dt_basic = undefined;
var responsiveHelper_datatable_fixed_column = undefined;
var responsiveHelper_datatable_col_reorder = undefined;
var responsiveHelper_datatable_tabletools = undefined;

var dataAsgProyectos;
var asgProyectoId;

var breakpointDefinition = {
    tablet: 1024,
    phone: 480
};

var trabajador;
var lang;

function initForm() {
    //comprobarLogin();
    // de smart admin
    pageSetUp();
    getVersionFooter();
    trabajador = comprobarLoginTrabajador();
    if (trabajador.idioma != null) {
        // el idioma del trabajador
        lang = trabajador.idioma;
    } else {
        // por defecto el idioma es español
        lang = "es";
    }
    // fijar idiona
    i18n.init({ lng: trabajador.idioma }, function (t) {
        $(".I18N").i18n();
        initTablaAsgProyectos();
        validator_languages(lang);
    });

    $("#userName").text(trabajador.nombre);
    controlBotones(trabajador);
    
    vm = new asgProyectoData();
    ko.applyBindings(vm);

    //
    $('#btnBuscar').click(buscarAsgProyectos());
    $('#frmBuscar').submit(function () {
        return false
    });
    //$('#txtBuscar').keypress(function (e) {
    //    if (e.keyCode == 13)
    //        buscarAsgProyectos();
    //});
    //

    // carga del desplegable.
    loadTrabajadores(trabajador.trabajadorId);
}

function asgProyectoData() {
    var self = this;
    // soporte de combos
    self.posiblesTrabajadores = ko.observableArray([]);
    // valores escogidos
    self.strabajadorId = ko.observable();
}

function loadTrabajadores(evaluadorId) {
    data = {
        "evaluadorId": evaluadorId
    };
    $.ajax({
        type: "POST",
        url: "/api/trabajadores-buscar",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data, status) {
            vm.posiblesTrabajadores(data);
            vm.strabajadorId(-1);
        },
        error: errorAjax
    });
}

function initTablaAsgProyectos() {
    tablaCarro = $('#dt_asgProyecto').dataTable({
        autoWidth: true,
        preDrawCallback: function () {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_asgProyecto'), breakpointDefinition);
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
        data: dataAsgProyectos,
        columns: [{
            data: "nombre"
            }, {
                data: "trabajador.nombre"
            }, {
                data: "proyecto.nombre"
            }, {
                data: "rol.nombre"
            },
         {
            data: "asgProyectoId",
            render: function (data, type, row) {
                var bt1 = "<button class='btn btn-circle btn-success btn-lg' onclick='editAsgProyecto(" + data + ");' title='" + i18n.t("app.evaluar") + "'> <i class='fa fa-edit fa-gears'></i> </button>";
                var html = "<div class='pull-right'>" + bt1 + "</div>";
                return html;
            }
        }]
    });
}

function datosOK() {
    //TODO: Incluir en la validación si el certificado figura en el almacén de certificados.
    $('#frmBuscar').validate({
        rules: {
            cmbTrabajadores: { required: true },
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    return $('#frmBuscar').valid();
}

function loadTablaAsgProyectos(data) {
    var dt = $('#dt_asgProyecto').dataTable();
    if (data !== null && data.length === 0) {
        mostrarMensajeSmart('No se han encontrado registros');
        $("#tbAsgProyecto").hide();
    } else {
        dt.fnClearTable();
        dt.fnAddData(data);
        dt.fnDraw();
        $("#tbAsgProyecto").show();
    }
}

function buscarAsgProyectos() {
    var mf = function () {
        if (!datosOK()) {
            return;
        }
        // enviar la consulta por la red (AJAX)
        var data = {
            "trabajadorId": vm.strabajadorId()
        };
        $.ajax({
            type: "POST",
            url: "api/asg-proyectos-buscar",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                // hay que mostrarlo en la zona de datos
                loadTablaAsgProyectos(data);
            },
            error: errorAjax
        });
    };
    return mf;
}


function editAsgProyecto(id) {
    // hay que abrir la página de detalle de asgProyecto
    // pasando en la url ese ID
    var url = "CliEvaAsgDetalle.html?AsgProyectoId=" + id;
    window.open(url, '_self');
}


