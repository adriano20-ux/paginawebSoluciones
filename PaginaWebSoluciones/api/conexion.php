<?php
$servidor = "localhost";
$baseDatos = "soluciones_torres";
$usuarioBD = "root";
$claveBD = "";  

function conectar() {
    global $servidor, $baseDatos, $usuarioBD, $claveBD;
    try {
        return new PDO(
            "mysql:host=$servidor;dbname=$baseDatos;charset=utf8mb4",
            $usuarioBD,
            $claveBD,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
    } catch (PDOException $e) {
        http_response_code(500);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(["ok" => false, "error" => "No se pudo conectar a la base de datos. ¿Está encendido MySQL en XAMPP y existe soluciones_torres?"]);
        exit;
    }
}
