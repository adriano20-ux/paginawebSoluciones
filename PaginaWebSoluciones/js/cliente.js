protegerPagina("cliente", function (usuario) {
    document.getElementById("nombreCliente").textContent = usuario.nombre;
    mostrarMisSolicitudes();
});


function solicitarServicio() {
    var servicio = document.getElementById("servicioElegido").value;
    var descripcion = document.getElementById("descripcion").value;

    if (servicio == "" || descripcion == "") {
        alert("Elige un servicio y escribe una descripción");
        return;
    }

    var datos = { accion: "solicitar_servicio", servicio: servicio, descripcion: descripcion };

    llamarApi(datos, function (r) {
        if (!r.ok) {
            alert(r.error);
            return;
        }
        document.getElementById("descripcion").value = "";
        document.getElementById("mensajeServicio").innerHTML = "¡Servicio solicitado! Mira su avance abajo.";
        mostrarMisSolicitudes();
    });
}


function solicitarProducto() {
    var producto = document.getElementById("productoElegido").value;
    var cantidad = Number(document.getElementById("cantidad").value);

    if (producto == "" || cantidad < 1) {
        alert("Elige un producto y una cantidad");
        return;
    }

    var datos = { accion: "solicitar_producto", producto: producto, cantidad: cantidad };

    llamarApi(datos, function (r) {
        if (!r.ok) {
            alert(r.error);
            return;
        }
        document.getElementById("mensajeProducto").innerHTML = "¡Producto solicitado!";
        mostrarMisSolicitudes();
    });
}


function mostrarMisSolicitudes() {
    llamarApi({ accion: "mis_solicitudes" }, function (r) {
        if (!r.ok) {
            alert(r.error);
            return;
        }

        var lista = r.solicitudes;
        var filas = "";
        var total = 0;
        var pendientes = 0;
        var terminadas = 0;

        for (var i = 0; i < lista.length; i++) {
            var s = lista[i];

            total = total + 1;

            if (s.estado == "Pendiente") {
                pendientes = pendientes + 1;
            }
            if (s.estado == "Terminado" || s.estado == "Entregado") {
                terminadas = terminadas + 1;
            }

            var avance = 1;
            if (s.estado == "Asignado") {
                avance = 2;
            }
            if (s.estado == "En proceso") {
                avance = 3;
            }
            if (s.estado == "Terminado" || s.estado == "Entregado") {
                avance = 4;
            }

            var tecnico = s.tecnico;
            if (tecnico == "") {
                tecnico = "Sin asignar";
            }
            if (s.tipo == "Producto") {
                tecnico = "-";
            }

            filas = filas + "<tr>";
            filas = filas + "<td>" + s.id + "</td>";
            filas = filas + "<td>" + s.tipo + "</td>";
            filas = filas + "<td>" + escapar(s.nombre) + " (x" + s.cantidad + ")</td>";
            filas = filas + "<td>" + s.fecha + "</td>";
            filas = filas + "<td>" + escapar(tecnico) + "</td>";
            filas = filas + "<td><b>" + s.estado + "</b></td>";
            filas = filas + "<td><progress value='" + avance + "' max='4'></progress></td>";
            filas = filas + "</tr>";
        }

        if (filas == "") {
            filas = "<tr><td colspan='7'>Todavía no tienes solicitudes.</td></tr>";
        }

        document.getElementById("tablaSolicitudes").innerHTML = filas;
        document.getElementById("totalSolicitudes").innerHTML = total;
        document.getElementById("totalPendientes").innerHTML = pendientes;
        document.getElementById("totalTerminadas").innerHTML = terminadas;
    });
}
