<?php

require_once "conexion.php";

session_set_cookie_params(["httponly" => true, "samesite" => "Lax"]);
session_start();

header("Content-Type: application/json; charset=utf-8");

$TECNICOS = ["Carlos Ramos", "Luis Paredes", "María Quispe"];

function responder($datos, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function error($mensaje, $codigo = 400) {
    responder(["ok" => false, "error" => $mensaje], $codigo);
}

function exigirRol($rol) {
    if (!isset($_SESSION["rol"]) || $_SESSION["rol"] != $rol) {
        error("No tienes permiso para hacer esto.", 403);
    }
}

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    error("Método no permitido.", 405);
}

$entrada = json_decode(file_get_contents("php://input"), true);
if (!is_array($entrada)) {
    error("Datos inválidos.");
}

$accion = isset($entrada["accion"]) ? $entrada["accion"] : "";
$bd = conectar();

$consultaSolicitudes =
    "SELECT s.id, u.correo, u.nombre AS cliente, u.telefono, s.tipo, s.nombre, s.descripcion,
            s.cantidad, s.total, s.estado, s.tecnico,
            MONTH(s.fecha) AS mes, DATE_FORMAT(s.fecha, '%d/%m') AS fecha
     FROM solicitudes s
     INNER JOIN usuarios u ON u.id = s.usuario_id";

function arreglarNumeros($filas) {
    for ($i = 0; $i < count($filas); $i++) {
        $filas[$i]["id"] = (int)$filas[$i]["id"];
        $filas[$i]["cantidad"] = (int)$filas[$i]["cantidad"];
        $filas[$i]["mes"] = (int)$filas[$i]["mes"];
        $filas[$i]["total"] = (float)$filas[$i]["total"];
    }
    return $filas;
}

switch ($accion) {

    case "registrar":
        $nombre = trim($entrada["nombre"] ?? "");
        $telefono = trim($entrada["telefono"] ?? "");
        $correo = strtolower(trim($entrada["correo"] ?? ""));
        $clave = $entrada["clave"] ?? "";

        if ($nombre == "" || $telefono == "" || $correo == "" || $clave == "") {
            error("Completa todos los datos.");
        }
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            error("El correo no es válido.");
        }

        $existe = $bd->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $existe->execute([$correo]);
        if ($existe->fetch()) {
            error("Ese correo ya tiene una cuenta.");
        }

        $guardar = $bd->prepare("INSERT INTO usuarios (nombre, telefono, correo, clave, rol) VALUES (?, ?, ?, ?, 'cliente')");
        $guardar->execute([$nombre, $telefono, $correo, password_hash($clave, PASSWORD_DEFAULT)]);
        responder(["ok" => true]);
        break;

    case "login":
        $correo = strtolower(trim($entrada["correo"] ?? ""));
        $clave = $entrada["clave"] ?? "";

        $buscar = $bd->prepare("SELECT id, nombre, telefono, correo, clave, rol FROM usuarios WHERE correo = ?");
        $buscar->execute([$correo]);
        $u = $buscar->fetch();

        if (!$u || !password_verify($clave, $u["clave"])) {
            error("Correo o contraseña incorrectos.", 401);
        }

        session_regenerate_id(true);
        $_SESSION["id"] = (int)$u["id"];
        $_SESSION["rol"] = $u["rol"];
        responder(["ok" => true, "rol" => $u["rol"]]);
        break;

    case "sesion":
        if (!isset($_SESSION["id"])) {
            responder(["ok" => true, "rol" => null]);
        }
        $buscar = $bd->prepare("SELECT nombre, telefono, correo, rol FROM usuarios WHERE id = ?");
        $buscar->execute([$_SESSION["id"]]);
        $u = $buscar->fetch();
        if (!$u) {
            responder(["ok" => true, "rol" => null]);
        }
        responder(["ok" => true, "rol" => $u["rol"], "nombre" => $u["nombre"], "correo" => $u["correo"], "telefono" => $u["telefono"]]);
        break;

    case "logout":
        $_SESSION = [];
        session_destroy();
        responder(["ok" => true]);
        break;

    // ---------- Cliente ----------
    case "mis_solicitudes":
        exigirRol("cliente");
        $q = $bd->prepare($consultaSolicitudes . " WHERE s.usuario_id = ? ORDER BY s.id DESC");
        $q->execute([$_SESSION["id"]]);
        responder(["ok" => true, "solicitudes" => arreglarNumeros($q->fetchAll())]);
        break;

    case "solicitar_servicio":
        exigirRol("cliente");
        $servicio = $entrada["servicio"] ?? "";
        $descripcion = trim($entrada["descripcion"] ?? "");

        $precio = $bd->prepare("SELECT precio FROM servicios WHERE nombre = ?");
        $precio->execute([$servicio]);
        $fila = $precio->fetch();
        if (!$fila || $descripcion == "") {
            error("Elige un servicio y escribe una descripción.");
        }

        $q = $bd->prepare("INSERT INTO solicitudes (usuario_id, tipo, nombre, descripcion, cantidad, total) VALUES (?, 'Servicio', ?, ?, 1, ?)");
        $q->execute([$_SESSION["id"], $servicio, $descripcion, $fila["precio"]]);
        responder(["ok" => true]);
        break;

    case "solicitar_producto":
        exigirRol("cliente");
        $producto = $entrada["producto"] ?? "";
        $cantidad = (int)($entrada["cantidad"] ?? 0);

        $precio = $bd->prepare("SELECT precio FROM productos WHERE nombre = ?");
        $precio->execute([$producto]);
        $fila = $precio->fetch();
        if (!$fila || $cantidad < 1 || $cantidad > 50) {
            error("Elige un producto y una cantidad entre 1 y 50.");
        }

        $q = $bd->prepare("INSERT INTO solicitudes (usuario_id, tipo, nombre, descripcion, cantidad, total) VALUES (?, 'Producto', ?, '-', ?, ?)");
        $q->execute([$_SESSION["id"], $producto, $cantidad, $fila["precio"] * $cantidad]);
        responder(["ok" => true]);
        break;

    // ---------- Trabajador y administrador ----------
    case "listar_solicitudes":
        if (!isset($_SESSION["rol"]) || ($_SESSION["rol"] != "trabajador" && $_SESSION["rol"] != "administrador")) {
            error("No tienes permiso para hacer esto.", 403);
        }
        $q = $bd->query($consultaSolicitudes . " ORDER BY s.id DESC");
        responder(["ok" => true, "solicitudes" => arreglarNumeros($q->fetchAll())]);
        break;

    case "cambiar_estado":
        exigirRol("trabajador");
        $id = (int)($entrada["id"] ?? 0);
        $estado = $entrada["estado"] ?? "";
        if ($estado != "En proceso" && $estado != "Terminado") {
            error("Estado no válido.");
        }
        // Solo servicios ya asignados y que aún no terminaron
        $q = $bd->prepare("UPDATE solicitudes SET estado = ? WHERE id = ? AND tipo = 'Servicio' AND tecnico <> '' AND estado <> 'Terminado'");
        $q->execute([$estado, $id]);
        responder(["ok" => true]);
        break;

    // ---------- Administrador ----------
    case "listar_clientes":
        exigirRol("administrador");
        $q = $bd->query("SELECT nombre, correo, telefono FROM usuarios WHERE rol = 'cliente' ORDER BY id");
        responder(["ok" => true, "clientes" => $q->fetchAll()]);
        break;

    case "asignar_tecnico":
        exigirRol("administrador");
        $id = (int)($entrada["id"] ?? 0);
        $tecnico = $entrada["tecnico"] ?? "";
        if (!in_array($tecnico, $TECNICOS, true)) {
            error("Técnico no válido.");
        }
        $q = $bd->prepare("UPDATE solicitudes
                           SET tecnico = ?, estado = IF(estado = 'Pendiente', 'Asignado', estado)
                           WHERE id = ? AND tipo = 'Servicio' AND estado <> 'Terminado'");
        $q->execute([$tecnico, $id]);
        responder(["ok" => true]);
        break;

    case "entregar_producto":
        exigirRol("administrador");
        $id = (int)($entrada["id"] ?? 0);
        $q = $bd->prepare("UPDATE solicitudes SET estado = 'Entregado' WHERE id = ? AND tipo = 'Producto'");
        $q->execute([$id]);
        responder(["ok" => true]);
        break;

    default:
        error("Acción desconocida.");
}
