// ---------- Gráficos con Google Charts ----------
google.charts.load("current", { packages: ["corechart"] });

// Datos de los gráficos (se llenan en mostrarDashboard)
var datosServicios = [];
var datosVentas = [];

function dibujarGraficos() {
    // Si Google Charts todavía no cargó, esta función se vuelve a llamar sola al terminar de cargar
    if (!google.visualization || !google.visualization.arrayToDataTable) {
        return;
    }

    // Gráfico 1: servicios del mes por estado
    var tablaServicios = google.visualization.arrayToDataTable(
        [["Estado", "Servicios", { role: "style" }, { role: "annotation" }]].concat(datosServicios)
    );
    var opcionesServicios = {
        legend: { position: "none" },
        height: 230,
        chartArea: { left: 40, top: 20, width: "88%", height: "70%" },
        vAxis: { minValue: 0, format: "0", gridlines: { count: 5 } }
    };
    new google.visualization.ColumnChart(document.getElementById("graficoServicios"))
        .draw(tablaServicios, opcionesServicios);

    // Gráfico 2: ventas por mes
    var tablaVentas = google.visualization.arrayToDataTable(
        [["Mes", "Ventas (S/)", { role: "annotation" }]].concat(datosVentas)
    );
    var opcionesVentas = {
        legend: { position: "none" },
        height: 230,
        colors: ["#2563eb"],
        chartArea: { left: 50, top: 20, width: "88%", height: "70%" },
        vAxis: { minValue: 0, format: "decimal" }
    };
    new google.visualization.ColumnChart(document.getElementById("graficoVentas"))
        .draw(tablaVentas, opcionesVentas);
}

google.charts.setOnLoadCallback(dibujarGraficos);

// Que los gráficos se ajusten si cambia el tamaño de la ventana
window.addEventListener("resize", dibujarGraficos);


// ---------- Dashboard y gráficos ----------
function mostrarDashboard(lista, clientes) {
    var hoy = new Date();
    var mesActual = hoy.getMonth() + 1;

    var pendientes = 0;
    var enProceso = 0;
    var terminados = 0;
    var productosPendientes = 0;
    var ventasMes = 0;
    var ventasTotal = 0;

    var mesPendiente = 0;
    var mesAsignado = 0;
    var mesProceso = 0;
    var mesTerminado = 0;

    var ventas = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (var i = 0; i < lista.length; i++) {
        var s = lista[i];

        if (s.tipo == "Servicio") {
            if (s.estado == "Pendiente" || s.estado == "Asignado") {
                pendientes = pendientes + 1;
            }
            if (s.estado == "En proceso") {
                enProceso = enProceso + 1;
            }
            if (s.estado == "Terminado") {
                terminados = terminados + 1;
            }

            // Servicios de este mes
            if (s.mes == mesActual) {
                if (s.estado == "Pendiente") {
                    mesPendiente = mesPendiente + 1;
                }
                if (s.estado == "Asignado") {
                    mesAsignado = mesAsignado + 1;
                }
                if (s.estado == "En proceso") {
                    mesProceso = mesProceso + 1;
                }
                if (s.estado == "Terminado") {
                    mesTerminado = mesTerminado + 1;
                }
            }
        }

        if (s.tipo == "Producto" && s.estado == "Pendiente") {
            productosPendientes = productosPendientes + 1;
        }

        // Es una venta si el servicio terminó o el producto se entregó
        if (s.estado == "Terminado" || s.estado == "Entregado") {
            ventasTotal = ventasTotal + s.total;
            ventas[s.mes] = ventas[s.mes] + s.total;
            if (s.mes == mesActual) {
                ventasMes = ventasMes + s.total;
            }
        }
    }

    document.getElementById("kClientes").innerHTML = clientes.length;
    document.getElementById("kSolicitudes").innerHTML = lista.length;
    document.getElementById("kPendientes").innerHTML = pendientes;
    document.getElementById("kProceso").innerHTML = enProceso;
    document.getElementById("kTerminados").innerHTML = terminados;
    document.getElementById("kProductos").innerHTML = productosPendientes;
    document.getElementById("kVentasMes").innerHTML = "S/ " + ventasMes;
    document.getElementById("kVentasTotal").innerHTML = "S/ " + ventasTotal;

    var meses = ["", "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    // [etiqueta, valor, color, número que se muestra sobre la barra]
    datosServicios = [
        ["Pendiente", mesPendiente, "#f59e0b", String(mesPendiente)],
        ["Asignado", mesAsignado, "#8b5cf6", String(mesAsignado)],
        ["En proceso", mesProceso, "#2563eb", String(mesProceso)],
        ["Terminado", mesTerminado, "#16a34a", String(mesTerminado)]
    ];

    datosVentas = [];
    for (var m = 1; m <= 12; m++) {
        datosVentas.push([meses[m], ventas[m], String(ventas[m])]);
    }

    dibujarGraficos();
}


function mostrarServicios(lista) {
    var filas = "";

    for (var i = lista.length - 1; i >= 0; i--) {
        var s = lista[i];

        if (s.tipo == "Servicio") {

            var tecnico = s.tecnico;
            if (tecnico == "") {
                tecnico = "Sin asignar";
            }

            var accion = "";
            if (s.estado == "Terminado") {
                accion = "Ya terminó";
            } else {
                accion = "<select id='tec" + s.id + "'>";
                accion = accion + "<option>Carlos Ramos</option>";
                accion = accion + "<option>Luis Paredes</option>";
                accion = accion + "<option>María Quispe</option>";
                accion = accion + "</select> ";
                accion = accion + "<button class='boton chico' onclick='enviarTecnico(" + s.id + ")'>Enviar</button>";
            }

            filas = filas + "<tr>";
            filas = filas + "<td>" + s.id + "</td>";
            filas = filas + "<td>" + escapar(s.cliente) + "</td>";
            filas = filas + "<td>" + escapar(s.nombre) + "</td>";
            filas = filas + "<td>" + s.fecha + "</td>";
            filas = filas + "<td>" + escapar(tecnico) + "</td>";
            filas = filas + "<td><b>" + s.estado + "</b></td>";
            filas = filas + "<td>" + accion + "</td>";
            filas = filas + "</tr>";
        }
    }

    document.getElementById("tablaServicios").innerHTML = filas;
}


function enviarTecnico(id) {
    var elegido = document.getElementById("tec" + id).value;

    llamarApi({ accion: "asignar_tecnico", id: id, tecnico: elegido }, function (r) {
        if (!r.ok) {
            alert(r.error);
            return;
        }
        mostrarTodo();
    });
}


function mostrarProductos(lista) {
    var filas = "";

    for (var i = lista.length - 1; i >= 0; i--) {
        var s = lista[i];

        if (s.tipo == "Producto") {

            var accion = "Ya entregado";
            if (s.estado == "Pendiente") {
                accion = "<button class='boton chico' onclick='entregarProducto(" + s.id + ")'>Marcar entregado</button>";
            }

            filas = filas + "<tr>";
            filas = filas + "<td>" + s.id + "</td>";
            filas = filas + "<td>" + escapar(s.cliente) + "</td>";
            filas = filas + "<td>" + escapar(s.nombre) + "</td>";
            filas = filas + "<td>" + s.cantidad + "</td>";
            filas = filas + "<td>S/ " + s.total + "</td>";
            filas = filas + "<td>" + s.fecha + "</td>";
            filas = filas + "<td><b>" + s.estado + "</b></td>";
            filas = filas + "<td>" + accion + "</td>";
            filas = filas + "</tr>";
        }
    }

    document.getElementById("tablaProductos").innerHTML = filas;
}


function entregarProducto(id) {
    llamarApi({ accion: "entregar_producto", id: id }, function (r) {
        if (!r.ok) {
            alert(r.error);
            return;
        }
        mostrarTodo();
    });
}


function mostrarClientes(usuarios) {
    var filas = "";

    for (var i = 0; i < usuarios.length; i++) {
        filas = filas + "<tr>";
        filas = filas + "<td>" + escapar(usuarios[i].nombre) + "</td>";
        filas = filas + "<td>" + escapar(usuarios[i].correo) + "</td>";
        filas = filas + "<td>" + escapar(usuarios[i].telefono) + "</td>";
        filas = filas + "</tr>";
    }

    document.getElementById("tablaClientes").innerHTML = filas;
}

function mostrarTodo() {
    llamarApi({ accion: "listar_solicitudes" }, function (r1) {
        if (!r1.ok) {
            alert(r1.error);
            return;
        }
        llamarApi({ accion: "listar_clientes" }, function (r2) {
            if (!r2.ok) {
                alert(r2.error);
                return;
            }
            mostrarDashboard(r1.solicitudes, r2.clientes);
            mostrarServicios(r1.solicitudes);
            mostrarProductos(r1.solicitudes);
            mostrarClientes(r2.clientes);
        });
    });
}

protegerPagina("administrador", function () {
    mostrarTodo();
});
