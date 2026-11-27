// Control de zoom para personas con discapacidad visual.
// Acerca o aleja toda la página y se puede minimizar. Recuerda la elección entre páginas.
(function () {
    var MIN = 50, MAX = 200, PASO = 10;
    var CLAVE_ZOOM = 'torresZoom', CLAVE_MIN = 'torresZoomMin';

    function leer(clave, defecto) {
        try { var v = localStorage.getItem(clave); return v === null ? defecto : v; }
        catch (e) { return defecto; }
    }
    function guardar(clave, valor) {
        try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
    }

    var zoom = parseInt(leer(CLAVE_ZOOM, '100'), 10);
    if (isNaN(zoom) || zoom < MIN || zoom > MAX) zoom = 100;
    var minimizado = leer(CLAVE_MIN, '0') === '1';

    var caja = document.createElement('div');
    caja.id = 'controlZoom';
    caja.setAttribute('role', 'group');
    caja.setAttribute('aria-label', 'Control de zoom y accesibilidad');
    caja.innerHTML =
        '<button type="button" class="zoom-menos" aria-label="Alejar">&minus;</button>' +
        '<span class="zoom-valor" aria-live="polite"></span>' +
        '<button type="button" class="zoom-mas" aria-label="Acercar">+</button>' +
        '<button type="button" class="zoom-minimizar" aria-label="Minimizar control de zoom">&mdash;</button>';

    var bMenos = caja.querySelector('.zoom-menos');
    var bMas = caja.querySelector('.zoom-mas');
    var valor = caja.querySelector('.zoom-valor');
    var bMin = caja.querySelector('.zoom-minimizar');

    function aplicar() {
        document.documentElement.style.zoom = zoom / 100;
        caja.style.zoom = 100 / zoom;            // el control mantiene siempre su tamaño
        valor.textContent = zoom + '%';
        bMenos.disabled = zoom <= MIN;
        bMas.disabled = zoom >= MAX;
        caja.classList.toggle('minimizado', minimizado);
        bMin.innerHTML = minimizado ? '&#128269;' : '&mdash;';
        bMin.setAttribute('aria-label', minimizado ? 'Mostrar control de zoom' : 'Minimizar control de zoom');
        guardar(CLAVE_ZOOM, zoom);
        guardar(CLAVE_MIN, minimizado ? '1' : '0');
    }

    bMenos.addEventListener('click', function () { zoom = Math.max(MIN, zoom - PASO); aplicar(); });
    bMas.addEventListener('click', function () { zoom = Math.min(MAX, zoom + PASO); aplicar(); });
    bMin.addEventListener('click', function () { minimizado = !minimizado; aplicar(); });

    function iniciar() { document.body.appendChild(caja); aplicar(); }
    if (document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
})();
