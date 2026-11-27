protegerPagina("trabajador", function () {
    mostrarServicios();
});


function mostrarServicios() {
    llamarApi({ accion: "listar_solicitudes" }, function (r) {
        if (!r.ok) {
            alert(r.error);
            return;
        }

        var lista = r.solicitudes;
        var filas = "";

        for (var i = 0; i < lista.length; i++) {
            var s = lista[i];

            if (s.tipo == "Servicio") {

                var tecnico = s.tecnico;
                var acciones = "";

                if (s.tecnico == "") {
                    tecnico = "Sin asignar";
                    acciones = "Esperando al administrador";
                } else if (s.estado == "Terminado") {
                    acciones = "Ya terminó";
                } else {
                    acciones = "<select id='estado" + s.id + "'>";
                    acciones = acciones + "<option>En proceso</option>";
                    acciones = acciones + "<option>Terminado</option>";
                    acciones = acciones + "</select> ";
                    acciones = acciones + "<button class='boton chico' onclick='cambiarEstado(" + s.id + ")'>Guardar</button>";
                }

                filas = filas + "<tr>";
                filas = filas + "<td>" + s.id + "</td>";
                filas = filas + "<td>" + escapar(s.cliente) + "<br>Tel: " + escapar(s.telefono) + "</td>";
                filas = filas + "<td>" + escapar(s.nombre) + "</td>";
                filas = filas + "<td>" + escapar(s.descripcion) + "</td>";
                filas = filas + "<td>" + s.fecha + "</td>";
                filas = filas + "<td>" + escapar(tecnico) + "</td>";
                filas = filas + "<td><b>" + s.estado + "</b></td>";
                filas = filas + "<td>" + acciones + "</td>";
                filas = filas + "</tr>";
            }
        }

        if (filas == "") {
            filas = "<tr><td colspan='8'>No hay servicios solicitados.</td></tr>";
        }

        document.getElementById("tablaServicios").innerHTML = filas;
    });
}


function cambiarEstado(id) {
    var nuevoEstado = document.getElementById("estado" + id).value;

    llamarApi({ accion: "cambiar_estado", id: id, estado: nuevoEstado }, function (r) {
        if (!r.ok) {
            alert(r.error);
            return;
        }
        mostrarServicios();
    });
}
