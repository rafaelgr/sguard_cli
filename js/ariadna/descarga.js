/*-------------------------------------------------------------------------- 
usuarioDetalle.js
Funciones js par la página UsuarioDetalle.html
---------------------------------------------------------------------------*/
// variables y objetos usados
var miniUnidad = function (codigo, nombre) {
    this.Codigo = codigo;
    this.Nombre = nombre;
}


function initForm() {
    //comprobarLogin();
    // de smart admin
    pageSetUp();
    getVersionFooter();
    // 
    $("#btnSalir").click(salir());
    var facturaId = gup("facturaId");
    var administradorId = gup("administradorId");
    var dataB = {
        facturaId: facturaId,
        administradorId: administradorId
    };
    $.ajax({
        type: "POST",
        url: "FacturaApi.aspx/VerXml",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(dataB),
        success: function (data, status) {
            var url = data.d;
            $("#refXML").attr("href", url);
            $("#refXML").text(url);
        },
        error: errorAjax
    });
    $.ajax({
        type: "POST",
        url: "FacturaApi.aspx/VerPdf",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(dataB),
        success: function (data, status) {
            var url = data.d;
            $("#refPDF").attr("href", url);
            $("#refPDF").text(url);
        },
        error: errorAjax
    });
    $.ajax({
        type: "POST",
        url: "FacturaApi.aspx/VerXsig",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(dataB),
        success: function (data, status) {
            var url = data.d;
            $("#refXSIG").attr("href", url);
            $("#refXSIG").text(url);
        },
        error: errorAjax
    });
}


function salir() {
    var mf = function () {
        var url = "FacturaGeneral.html";
        window.open(url, '_self');
    }
    return mf;
}

