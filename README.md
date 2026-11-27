# Soluciones Integrales Torres

**Implementación de una plataforma web para la gestión y control de los servicios en la empresa Soluciones Torres**

## Módulos y características

### Página de inicio
- Barra de navegación fija que se colapsa en pantallas pequeñas.
- Carrusel de tres diapositivas, secciones "Nosotros" y "¿Qué hacemos?".
- Registro de cuenta e inicio de sesión.

### Cliente
- Solicitar servicios (con descripción del problema) y productos (con cantidad).
- Seguimiento del estado: `Pendiente` → `Asignado` → `En proceso` → `Terminado` (los productos pasan a `Entregado`).

### Trabajador (técnico)
- Ver los servicios solicitados por los clientes.
- Marcar cada servicio como **En proceso** o **Terminado**.

### Administrador
- Dashboard con indicadores: clientes, solicitudes, pendientes, en proceso, terminados, productos por entregar, ventas del mes y ventas totales.
- Gráficos con **Google Charts**: servicios del mes por estado y ventas por mes.
- Asignar técnico a cada servicio y ver el listado de clientes.

### Accesibilidad y diversidad humana
- Diseño responsivo con Bootstrap (computadora, tableta y celular).
- Control de zoom (50 % – 200 %) para personas con discapacidad visual; se puede minimizar y recuerda la elección entre páginas.

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Frontend | HTML5, CSS3, JavaScript |
| Estilos | [Bootstrap 5.3](https://getbootstrap.com/) y [Bootstrap Icons](https://icons.getbootstrap.com/) |
| Gráficos | [Google Charts](https://developers.google.com/chart) |
| Backend | PHP (API JSON con PDO) |
| Base de datos | MySQL |
| Entorno local | XAMPP |
| Editor | Visual Studio Code |

---

## Estructura del proyecto

```
SolucionesITorres/
├── index.html            # Inicio, registro e inicio de sesión
├── cliente.html          # Panel del cliente
├── trabajador.html       # Panel del trabajador
├── administrador.html    # Panel del administrador (indicadores y gráficos)
├── api/
│   ├── api.php           # API: todas las acciones del sistema
│   └── conexion.php      # Conexión a MySQL (PDO)
├── sql/
│   └── soluciones_torres.sql   # Base de datos con datos de ejemplo
├── js/
│   ├── datos.js          # Función común para llamar a la API
│   ├── index.js
│   ├── cliente.js
│   ├── trabajador.js
│   ├── administrador.js  # Dashboard y gráficos
│   └── zoom.js           # Control de zoom
├── css/
│   ├── estilos.css       # Estilos de los paneles
│   ├── inicio.css        # Estilos de la página de inicio
│   └── zoom.css
└── img/
    └── hero-tecnologia.svg
```


---

## Autores

| Integrante |
|------------|
| TORRES VILLALOBOS, Adriano Antonio
| HILARIO AZNARAN, Axel Teodoro
| MACEDO TAMARIZ, Carlos
| MEZA ROBLES, Marcos Alberto Elías 

