/*-------------------------------------------------------------------------- 
proyectoGeneral.js
Funciones js par la página ProyectoGeneral.html

---------------------------------------------------------------------------*/
var responsiveHelper_dt_basic = undefined;
var responsiveHelper_datatable_fixed_column = undefined;
var responsiveHelper_datatable_col_reorder = undefined;
var responsiveHelper_datatable_tabletools = undefined;

var dataProyectos;
var proyectoId;

var breakpointDefinition = {
    tablet: 1024,
    phone: 480
};


function initForm() {
    //comprobarLogin();
    // de smart admin
    pageSetUp();
    getVersionFooter();
    //
    $('#btnBuscar').click(buscarProyectos());
    $('#btnAlta').click(crearProyecto());
    $('#frmBuscar').submit(function () {
        return false
    });
    //$('#txtBuscar').keypress(function (e) {
    //    if (e.keyCode == 13)
    //        buscarProyectos();
    //});
    //
    initTablaProyectos();
    // comprobamos parámetros
    proyectoId = gup('ProyectoId');
    if (proyectoId !== '') {
        // cargar la tabla con un único valor que es el que corresponde.
        var data = {
            id: proyectoId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: "api/proyectos/" + proyectoId,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                // hay que mostrarlo en la zona de datos
                var data2 = [data];
                loadTablaProyectos(data2);
            },
            error: errorAjax
        });
    }
}

function initTablaProyectos() {
    tablaCarro = $('#dt_proyecto').dataTable({
        autoWidth: true,
        preDrawCallback: function () {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_proyecto'), breakpointDefinition);
            }
        },
        rowCallback: function (nRow) {
            responsiveHelper_dt_basic.createExpandIcon(nRow);
        },
        drawCallback: function (oSettings) {
            responsiveHelper_dt_basic.respond();
        },
        language: {
            processing: "Procesando...",
            info: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
            infoFiltered: "(filtrado de un total de _MAX_ registros)",
            infoPostFix: "",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "Ningún dato disponible en esta tabla",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            },
            aria: {
                sortAscending: ": Activar para ordenar la columna de manera ascendente",
                sortDescending: ": Activar para ordenar la columna de manera descendente"
            }
        },
        data: dataProyectos,
        columns: [
            { data: "nombre" },
            { data: "fechaInicio",
                render: function (data) {
                    // controlamos que si la fecha es nula no se muestre
                    if (moment(data).isValid())
                        return moment(data).format('DD/MM/YYYY');
                    else
                        return "";
                },
                class: "text-center" },
            { data: "fechaFinal",
                render: function (data) {
                    // controlamos que si la fecha es nula no se muestre
                    if (moment(data).isValid())
                        return moment(data).format('DD/MM/YYYY');
                    else
                        return "";
                },
                class: "text-center" }, 
            { data: "proyectoId",
              render: function (data, type, row) {
                    var bt1 = "<button class='btn btn-circle btn-danger btn-lg' onclick='deleteProyecto(" + data + ");' title='Eliminar registro'> <i class='fa fa-trash-o fa-fw'></i> </button>";
                    var bt2 = "<button class='btn btn-circle btn-success btn-lg' onclick='editProyecto(" + data + ");' title='Editar registro'> <i class='fa fa-edit fa-fw'></i> </button>";
                    var html = "<div class='pull-right'>" + bt1 + " " + bt2 + "</div>";
                    return html;
            }
        }]
    });
}

function datosOK() {
    //TODO: Incluir en la validación si el certificado figura en el almacén de certificados.
    $('#frmBuscar').validate({
        rules: {
            txtBuscar: { required: true },
        },
        // Messages for form validation
        messages: {
            txtBuscar: {
                required: 'Introduzca el texto a buscar'
            }
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    return $('#frmBuscar').valid();
}

function loadTablaProyectos(data) {
    var dt = $('#dt_proyecto').dataTable();
    if (data !== null && data.length === 0) {
        mostrarMensajeSmart('No se han encontrado registros');
        $("#tbProyecto").hide();
    } else {
        dt.fnClearTable();
        dt.fnAddData(data);
        dt.fnDraw();
        $("#tbProyecto").show();
    }
}

function buscarProyectos() {
    var mf = function () {
        if (!datosOK()) {
            return;
        }
        // obtener el n.serie del certificado para la firma.
        var aBuscar = $('#txtBuscar').val();
        // enviar la consulta por la red (AJAX)
        var data = {
            "nombre": aBuscar
        };
        $.ajax({
            type: "POST",
            url: "api/proyectos-buscar",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                // hay que mostrarlo en la zona de datos
                loadTablaProyectos(data);
            },
            error: errorAjax
        });
    };
    return mf;
}

function crearProyecto() {
    var mf = function () {
        var url = "ProyectoDetalle.html?ProyectoId=0";
        window.open(url, '_self');
    };
    return mf;
}

function deleteProyecto(id) {
    // mensaje de confirmación
    var mens = "¿Realmente desea borrar este registro?";
    $.SmartMessageBox({
        title: "<i class='fa fa-info'></i> Mensaje",
        content: mens,
        buttons: '[Aceptar][Cancelar]'
    }, function (ButtonPressed) {
        if (ButtonPressed === "Aceptar") {
            var data = {
                proyectoId: id
            };
            $.ajax({
                type: "DELETE",
                url: "api/proyectos/" + id,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    var fn = buscarProyectos();
                    fn();
                },
                error: errorAjax
            });
        }
        if (ButtonPressed === "Cancelar") {
            // no hacemos nada (no quiere borrar)
        }
    });
}

function editProyecto(id) {
    // hay que abrir la página de detalle de proyecto
    // pasando en la url ese ID
    var url = "ProyectoDetalle.html?ProyectoId=" + id;
    window.open(url, '_self');
}


