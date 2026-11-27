var URL_API = "api/api.php";

function llamarApi(datos, cuando) {
    fetch(URL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(datos)
    })
        .then(function (respuesta) {
            return respuesta.text();
        })
        .then(function (texto) {
            var resultado;
            try {
                resultado = JSON.parse(texto);
            } catch (e) {
                resultado = { ok: false, error: "El servidor no respondió bien. Abre la página desde http://localhost/SolucionesITorres/ con Apache y MySQL encendidos." };
            }
            cuando(resultado);
        })
        .catch(function () {
            cuando({ ok: false, error: "No se pudo conectar con el servidor. Enciende Apache y MySQL en XAMPP." });
        });
}


function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


function cerrarSesion() {
    llamarApi({ accion: "logout" }, function () {
        window.location.href = "index.html";
    });
}


function protegerPagina(rolPermitido, cuando) {
    llamarApi({ accion: "sesion" }, function (r) {
        if (!r.ok || r.rol != rolPermitido) {
            alert("Primero debes iniciar sesión");
            window.location.href = "index.html";
            return;
        }
        cuando(r);
    });
}
