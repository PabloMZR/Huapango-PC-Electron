const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// Ruta correcta en producción (NO en asar)
const configPath = path.join(app.getPath("userData"), "config.json");

// RFuta donde Electron empaqueta archivos externos (solo para copiar)
const configSourcePath = path.join(process.resourcesPath, "config.json");

function inicializarConfiguracion() {
    try {
        if (!fs.existsSync(configPath)) {
            console.warn("⚠️ Archivo de configuración no encontrado, copiando desde recursos...");
            fs.copyFileSync(configSourcePath, configPath);
        }
        console.log("Configuración lista en:", configPath);
    } catch (error) {
        console.error("Error al copiar config.json:", error);
    }
}

function guardarConfiguracion(nuevaConfig) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(nuevaConfig, null, 2), "utf8");
        console.log("Configuración guardada correctamente en:", configPath);
        return { success: true };
    } catch (error) {
        console.error("Error al guardar la configuración:", error);
        return { success: false, error: error.message };
    }
}

function cargarConfiguracion() {
    try {
        if (!fs.existsSync(configPath)) {
            console.warn("⚠️ Archivo de configuración no encontrado, inicializando...");
            inicializarConfiguracion();
        }

        const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        console.log("Configuración cargada correctamente desde:", configPath);
        return config;
    } catch (error) {
        console.error("Error al cargar la configuración:", error);
        return null;
    }
}

module.exports = { guardarConfiguracion, cargarConfiguracion, inicializarConfiguracion, configPath };


