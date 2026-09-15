// La sesión dura únicamente mientras la aplicación permanece abierta.
let sesion = null;

function guardarSesion(userID, userRole) {
    sesion = { userID, userRole };
}

function obtenerSesion() {
    return sesion ? { ...sesion } : null;
}

function cerrarSesion() {
    sesion = null;
}

module.exports = { guardarSesion, obtenerSesion, cerrarSesion };
