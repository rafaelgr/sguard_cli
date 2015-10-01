/*-------------------------------------------------------------------------- 
proyectoDetalle.js
Funciones js par la página ProyectoDetalle.html
---------------------------------------------------------------------------*/
var proyectoId = 0; 
function initForm() {
    // comprobarLogin();
    // de smart admin
    pageSetUp();
    //
    // $.datepicker.setDefaults($.datepicker.regional['es']);
    //
    $.validator.addMethod("greaterThan", 
        function (value, element, params) {
        var fv = moment(value, "DD/MM/YYYY").format("YYYY-MM-DD");
        var fp = moment($(params).val(), "DD/MM/YYYY").format("YYYY-MM-DD");
            if (!/Invalid|NaN/.test(new Date(fv))) {
                return new Date(fv) > new Date(fp);
        } else {
            // esto es debido a que permitimos que la segunda fecha nula
            return true;
        }
    }, 'La fecha final debe ser mayor que la inicial.');
    

    $.datepicker.regional['es'] = {
        closeText: 'Cerrar',
        prevText: '&#x3C;Ant',
        nextText: 'Sig&#x3E;',
        currentText: 'Hoy',
        monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio','julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
        monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun','jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
        dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    

    $.datepicker.setDefaults($.datepicker.regional['es']);
    

    getVersionFooter();
    vm = new admData();
    ko.applyBindings(vm);
    // asignación de eventos al clic
    $("#btnAceptar").click(aceptar());
    $("#btnSalir").click(salir());
    $("#frmProyecto").submit(function () {
        return false;
    });

    proyectoId = gup('ProyectoId');
    if (proyectoId != 0) {
        var data = {
            proyectoId: proyectoId
        }
        // hay que buscar ese elemento en concreto
        $.ajax({
            type: "GET",
            url: "/api/proyectos/" + proyectoId,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (data, status) {
                // hay que mostrarlo en la zona de datos
                loadData(data);
                loadTemplatePC1();
            },
            error: errorAjax
        });
    } else {
        // se trata de un alta ponemos el id a cero para indicarlo.
        vm.proyectoId(0);
    }
}

function admData() {
    var self = this;
    self.proyectoId = ko.observable();
    self.nombre = ko.observable();
    self.fechaInicio = ko.observable();
    self.fechaFinal = ko.observable();
}

function loadData(data) {
    vm.proyectoId(data.proyectoId);
    vm.nombre(data.nombre);
    vm.fechaInicio(moment(data.fechaInicio).format("DD/MM/YYYY"));
    if (data.fechaFinal != null){
        vm.fechaFinal(moment(data.fechaFinal).format("DD/MM/YYYY"));
    } else {
        vm.fechaFinal(null);
    }
}

function datosOK() {
    $('#frmProyecto').validate({
        rules: {
            txtNombre: { required: true },
            txtFechaInicio: { required: true, date: true },
            txtFechaFinal: { date: true, greaterThan: "#txtFechaInicio"}
        },
        // Messages for form validation
        messages: {
            txtNombre: {required: 'Introduzca el nombre'},
            txtFechaInicio: {required: 'Introduzca una fecha de inicio', date: 'Debe ser una fecha válida'},
            txtFechaFinal: { date: 'Debe ser una fecha válida' }
        },
        // Do not change code below
        errorPlacement: function (error, element) {
            error.insertAfter(element.parent());
        }
    });
    $.validator.methods.date = function (value, element) {
        return this.optional(element) || moment(value, "DD/MM/YYYY").isValid();
    }
    return $('#frmProyecto').valid();
}

function aceptar() {
    var mf = function () {
        if (!datosOK())
            return;
        // control de fechas 
        var fecha1, fecha2;
        if (moment(vm.fechaInicio(), "DD/MM/YYYY").isValid())
            fecha1 = moment(vm.fechaInicio(), "DD/MM/YYYY").format("YYYY-MM-DD");
        if (moment(vm.fechaFinal(), "DD/MM/YYYY").isValid()){
            fecha2 = moment(vm.fechaFinal(), "DD/MM/YYYY").format("YYYY-MM-DD");
        } else {
            fecha2 = null;
        }
        var data = {
            proyecto: {
                "proyectoId": vm.proyectoId(),
                "nombre": vm.nombre(),
                "fechaInicio": fecha1,
                "fechaFinal": fecha2
            }
        };
        if (proyectoId == 0) {
            $.ajax({
                type: "POST",
                url: "api/proyectos",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "ProyectoGeneral.html?ProyectoId=" + vm.proyectoId();
                    window.open(url, '_self');
                },
                error: errorAjax
            });
        } else {
            $.ajax({
                type: "PUT",
                url: "api/proyectos/" + proyectoId,
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(data),
                success: function (data, status) {
                    // hay que mostrarlo en la zona de datos
                    loadData(data);
                    // Nos volvemos al general
                    var url = "ProyectoGeneral.html?ProyectoId=" + vm.proyectoId();
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
        var url = "ProyectoGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}

function loadTemplatePC1(){
    // cargar la tabla con un único valor que es el que corresponde.
    var data = {
        informe: "pproyectoconocimiento",
        tipo: "j",
        id: proyectoId
    }
    // hay que buscar ese elemento en concreto
    $.ajax({
        type: "POST",
        url: myconfig.apiUrl + "/api/informes",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (data, status) {
            // hay que mostrarlo en la zona de datos
            // vm.asignaciones(data);
            loadTemplatePC2(data[0]);
        },
        error: errorAjax
    });
}
function loadTemplatePC2(data) {
    //
    // Grab the template script
    var theTemplateScript = $("#ac-conocimientos").html();
    // Compile the template
    var theTemplate = Handlebars.compile(theTemplateScript);
    // Pass our data to the template
    var theCompiledHtml = theTemplate(data);
    // Add the compiled html to the page
    $('#hdbContent').html(theCompiledHtml);
}