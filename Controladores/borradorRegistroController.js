const path = require("node:path");
const { fileURLToPath } = require("node:url");

// Borradores en memoria por ventana. No se escriben fotos ni datos personales a disco.
const borradores = new WeakMap();
const vista = path.resolve(__dirname, "../Vistas/Registros.html");

function permitido(event) {
    try {
        return event.senderFrame === event.sender.mainFrame &&
            path.resolve(fileURLToPath(event.senderFrame.url)) === vista;
    } catch { return false; }
}

function obtenerBorradorRegistro(event) {
    if (!permitido(event)) return { success: false };
    return { success: true, data: borradores.get(event.sender) ?? null };
}

function guardarBorradorRegistro(event, datos) {
    if (!permitido(event) || !datos || datos.version !== 1 || !datos.campos || !datos.fotos) {
        return { success: false };
    }
    // IPC clona los datos de entrada y salida; no se comparten objetos con la vista.
    borradores.set(event.sender, datos);
    return { success: true };
}

function limpiarBorradorRegistro(event) {
    if (!permitido(event)) return { success: false };
    borradores.delete(event.sender);
    return { success: true };
}

module.exports = { obtenerBorradorRegistro, guardarBorradorRegistro, limpiarBorradorRegistro };
