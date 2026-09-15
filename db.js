const mysql = require("mysql2/promise");
const { cargarConfiguracion, normalizarConfiguracion } = require("./Modelos/configModel");

// Importar este módulo no lee archivos ni intenta conectar con MySQL.
let pool = null;

function mensajeConexion(error) {
    const mensajes = {
        ER_ACCESS_DENIED_ERROR: "MySQL rechazó el usuario o la contraseña. Revisa las credenciales.",
        ER_DBACCESS_DENIED_ERROR: "El usuario no tiene permisos para acceder a esta base de datos.",
        ER_BAD_DB_ERROR: "La base de datos indicada no existe. Revisa el nombre e importa el esquema.",
        ECONNREFUSED: "No se pudo conectar con MySQL. Comprueba que el servicio esté iniciado y el puerto sea correcto.",
        ENOTFOUND: "No se encontró el servidor. Revisa su nombre o dirección IP.",
        EHOSTUNREACH: "El servidor no está accesible desde este equipo.",
        ETIMEDOUT: "MySQL no respondió a tiempo. Revisa el servidor, el puerto y la red."
    };
    return mensajes[error.code] || "No se pudo comprobar la conexión con MySQL. Revisa la configuración y el servicio.";
}

async function probarConexion(config) {
    const datos = normalizarConfiguracion(config);
    let connection;
    try {
        connection = await mysql.createConnection({ ...datos, connectTimeout: 5000 });
    } catch (error) {
        const fallo = new Error(mensajeConexion(error));
        fallo.code = error.code;
        throw fallo;
    } finally {
        // Es una conexión de prueba; no se conserva ni se ejecutan escrituras.
        if (connection) connection.destroy();
    }
    return datos;
}

async function inicializarBaseDatos() {
    const config = await probarConexion(cargarConfiguracion());
    const nuevoPool = mysql.createPool({ ...config, connectTimeout: 5000,
        waitForConnections: true, connectionLimit: 10, queueLimit: 0 });
    const anterior = pool;
    pool = nuevoPool;
    // Las operaciones ya iniciadas terminan en el pool anterior.
    if (anterior) anterior.end().catch(() => console.error("No se pudo cerrar el pool anterior de MySQL."));
}

async function queryDatabase(sql, params = []) {
    if (!Array.isArray(params) || params.includes(undefined)) {
        throw new Error("Los parámetros de la consulta contienen valores no definidos.");
    }
    if (!pool) throw new Error("Configura y comprueba la conexión con MySQL antes de consultar datos.");
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.execute(sql, params);
        return results;
    } finally {
        connection.release();
    }
}

module.exports = { queryDatabase, probarConexion, inicializarBaseDatos };
