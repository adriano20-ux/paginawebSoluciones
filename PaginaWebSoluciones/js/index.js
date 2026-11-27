function crearCuenta() {
    var nombre = document.getElementById("regNombre").value;
    var telefono = document.getElementById("regTelefono").value;
    var correo = document.getElementById("regCorreo").value;
    var clave = document.getElementById("regClave").value;
    var clave2 = document.getElementById("regClave2").value;
    var mensaje = document.getElementById("mensajeRegistro");

    if (nombre == "" || telefono == "" || correo == "" || clave == "") {
        mensaje.className = "mensaje error";
        mensaje.innerHTML = "Completa todos los datos.";
        return;
    }

    if (clave != clave2) {
        mensaje.className = "mensaje error";
        mensaje.innerHTML = "Las contraseñas no coinciden.";
        return;
    }

    var datos = { accion: "registrar", nombre: nombre, telefono: telefono, correo: correo, clave: clave };

    llamarApi(datos, function (r) {
        if (!r.ok) {
            mensaje.className = "mensaje error";
            mensaje.textContent = r.error;
            return;
        }
        mensaje.className = "mensaje exito";
        mensaje.innerHTML = "¡Cuenta creada! Ahora inicia sesión.";
    });
}


function iniciarSesion() {
    var correo = document.getElementById("logCorreo").value;
    var clave = document.getElementById("logClave").value;
    var mensaje = document.getElementById("mensajeLogin");

    llamarApi({ accion: "login", correo: correo, clave: clave }, function (r) {
        if (!r.ok) {
            mensaje.className = "mensaje error";
            mensaje.textContent = r.error;
            return;
        }

        if (r.rol == "administrador") {
            window.location.href = "administrador.html";
        } else if (r.rol == "trabajador") {
            window.location.href = "trabajador.html";
        } else {
            window.location.href = "cliente.html";
        }
    });
}
