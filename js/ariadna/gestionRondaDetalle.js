/*-------------------------------------------------------------------------- 
gestionRondaDetalle.js
Funciones js par la página GestionRondaDetalle.html
---------------------------------------------------------------------------*/
var responsiveHelper_dt_basic = undefined;
var responsiveHelper_datatable_fixed_column = undefined;
var responsiveHelper_datatable_col_reorder = undefined;
var responsiveHelper_datatable_tabletools = undefined;

var dataPuntos;

var breakpointDefinition = {
    tablet: 1024,
    phone: 480
};

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
    $("#btnSalir").click(salir());
    $("#frmRonda").submit(function() {
        return false;
    });


    // inicializar la tabla asociada.
    initTablaPuntos();

    rondId = gup('RondaRealizadaId');
    if (rondId != 0) {
        var data = {
                rondaId: rondId
            }
            // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: myconfig.apiUrl + "/api/rondas-realizadas/detalle/" + rondId,
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
        vm.rondaRealizadaId(0);
    }
}

function admData() {
    var self = this;
    self.rondaRealizadaId = ko.observable();
    self.rondaId = ko.observable();
    self.vigilanteId = ko.observable();
    self.fecha = ko.observable();
    self.hora = ko.observable();
    self.rnombre = ko.observable();
    self.vnombre = ko.observable();
    self.resultado = ko.observable();
    self.puntos = ko.observableArray([]);
}

function loadData(data) {
    vm.rondaRealizadaId(data.rondaRealizadaId);
    vm.rondaId(data.rondaId);
    vm.vigilanteId(data.vigilanteId);
    vm.rnombre(data.rnombre);
    vm.vnombre(data.vnombre);
    vm.fecha(moment(data.fecha).format('DD/MM/YYYY'));
    vm.hora(data.hora);
    vm.resultado(data.resultado);
    vm.puntos(data.puntos);
    loadTablaPuntos(data.puntos);
}


function initTablaPuntos() {
    tablaCarro = $('#dt_rondapuntos').dataTable({
        autoWidth: true,
        preDrawCallback: function() {
            // Initialize the responsive datatables helper once.
            if (!responsiveHelper_dt_basic) {
                responsiveHelper_dt_basic = new ResponsiveDatatablesHelper($('#dt_rondapuntos'), breakpointDefinition);
            }
        },
        rowCallback: function(nRow) {
            responsiveHelper_dt_basic.createExpandIcon(nRow);
        },
        drawCallback: function(oSettings) {
            responsiveHelper_dt_basic.respond();
        },
        fnRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            if (aData.presultado != 'CORRECTO'){
                $(nRow).css('color', 'red')
            }
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
        data: dataPuntos,
        columns: [{
            data: "orden"
        }, {
            data: "pnombre"
        }, {
            data: "pfecha",
            render: function(data, type, row) {
                return moment(data).format('DD/MM/YYYY');
            }
        }, {
            data: "phora"
        }, {
            data: "presultado"
        }]
    });
}

function loadTablaPuntos(data) {
    var dt = $('#dt_rondapuntos').dataTable();
    if (data !== null && data.length === 0) {
        //mostrarMensajeSmart('No se han encontrado registros');
        //$("#tbAsgObjetivoPA").hide();
        dt.fnClearTable();
        dt.fnDraw();
    } else {
        dt.fnClearTable();
        dt.fnAddData(data);
        dt.fnDraw();
    }
}


function salir() {
    var mf = function() {
        var url = "GestionRonda.html";
        window.open(url, '_self');
    }
    return mf;
}
