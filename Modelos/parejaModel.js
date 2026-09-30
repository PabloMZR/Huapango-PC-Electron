const { queryDatabase } = require("../db");


function vacioANull(valor) {
    if (valor === undefined || valor === null) return null;
    if (typeof valor === "string" && valor.trim() === "") return null;
    return valor;
}
// Función para registrar una pareja
// async function registrarPareja(datos) {
//     const sql = `
//         INSERT INTO T_Participantes 
//         (nParejaID, oFoto, dNacimiento, ISexo, nTelefono, cNombre, cApellido, cEmail, cNombreM, cApellidoM, dNacimientoM, nTelefonoM, cEmailM) 
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
//     try {
//         const result = await queryDatabase(sql, [
//             datos.nParejaID,
//             datos.oFoto,
//             datos.dNacimiento,
//             datos.ISexo,
//             datos.nTelefono,
//             datos.cNombre,
//             datos.cApellido,
//             datos.cEmail,
//             datos.cNombreM,
//             datos.cApellidoM,
//             datos.dNacimientoM,
//             datos.nTelefonoM,
//             datos.cEmailM,
//         ]);
//         return result.insertId; // Devuelve el ID del registro insertado
//     } catch (err) {
//         throw new Error("Error al registrar pareja: " + err.message);
//     }
// }

// Función para registrar una pareja (dos participantes)
async function registrarPareja(datos) {
    try {
        const sql = `
            INSERT INTO T_Participantes 
            (nParejaID, oFoto, dNacimiento, ISexo, nTelefono, cNombre, cApellido, cEmail, 
            cNombreM, cApellidoM, dNacimientoM, nTelefonoM, cEmailM, ISexoM, IFotoM)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await queryDatabase(sql, [
            datos.nParejaID,
            datos.oFotoMasculino || null,
            datos.dNacimientoMasculino,
            datos.sexoMasculino,
            datos.nTelefonoMasculino,
            datos.cNombreMasculino,
            datos.cApellidoMasculino,
            datos.cEmailMasculino,
            datos.cNombreFemenino,
            datos.cApellidoFemenino,
            datos.dNacimientoFemenino,
            datos.nTelefonoFemenino,
            datos.cEmailFemenino,
            datos.sexoFemenino,
            datos.oFotoFemenino || null
        ]);
        return datos.nParejaID;
    } catch (err) {
        throw new Error("Error al registrar pareja: " + err.message);
    }
}



// Función para buscar pareja por ID
async function buscarParejaPorID(id) {
    const sql = "SELECT * FROM T_Participantes WHERE nParejaID = ?";
    try {
        const result = await queryDatabase(sql, [id]);
        return result; // Devuelve los resultados de la consulta
    } catch (err) {
        throw new Error("Error al buscar pareja: " + err.message);
    }
}

// Proyección usada por la ficha de evaluación: filtrar antes de enviar datos por IPC.
async function buscarParejaParaEvaluacion(id) {
    const sql = `
        SELECT
            p.nParejaID,
            CONCAT(p.cNombre, ' ', p.cApellido) AS nombreParticipante1,
            CONCAT(p.cNombreM, ' ', p.cApellidoM) AS nombreParticipante2,
            c.cCategoriaNombre AS categoriaNombre,
            e.cEstiloNombre AS estiloNombre
        FROM T_Participantes AS p
        LEFT JOIN T_Categorias AS c ON p.nParejaID = c.nParejaID
        LEFT JOIN T_Estilos AS e ON p.nParejaID = e.nParejaID
        WHERE p.nParejaID = ?
    `;
    return queryDatabase(sql, [id]);
}

// Función para buscar todas las parejas
async function buscarTodasLasParejas() {
    const sql = `
        SELECT 
            p.nParejaID, 
            CONCAT(p.cNombre, ' ', p.cApellido) AS nombreParticipante1, 
            CONCAT(p.cNombreM, ' ', p.cApellidoM) AS nombreParticipante2,
            c.cCategoriaNombre AS categoriaNombre, 
            e.cEstiloNombre AS estiloNombre
        FROM T_Participantes AS p
        LEFT JOIN T_Categorias AS c ON p.nParejaID = c.nParejaID
        LEFT JOIN T_Estilos AS e ON p.nParejaID = e.nParejaID
    `;
    try {
        const result = await queryDatabase(sql);
        return result; // Devuelve todas las parejas con los datos correctos
    } catch (err) {
        throw new Error("Error al buscar todas las parejas: " + err.message);
    }
}




// Función para actualizar una pareja completa (ambos participantes o campos específicos)
async function actualizarParejaCompleta(datos) {
    if (!datos || typeof datos !== "object") {
        throw new Error("No se proporcionaron datos para actualizar.");
    }

    const nParejaID = vacioANull(datos.nParejaID);
    if (!nParejaID) {
        throw new Error("El ID de la pareja es obligatorio.");
    }

    // Verificar si la pareja existe
    const existente = await queryDatabase("SELECT nParejaID FROM T_Participantes WHERE nParejaID = ?", [nParejaID]);
    if (!existente || existente.length === 0) {
        return 0; // Pareja no encontrada
    }

    // Normalizar y sanitizar datos para evitar valores undefined o '' que rompen MySQL
    const cNombre = vacioANull(datos.cNombreMasculino ?? datos.cNombre);
    const cApellido = vacioANull(datos.cApellidoMasculino ?? datos.cApellido);
    const cEmail = vacioANull(datos.cEmailMasculino ?? datos.cEmail);
    const nTelefono = vacioANull(datos.nTelefonoMasculino ?? datos.nTelefono);
    const dNacimiento = vacioANull(datos.dNacimientoMasculino ?? datos.dNacimiento);
    const oFoto = vacioANull(datos.oFotoMasculino ?? datos.oFoto);
    const ISexo = vacioANull(datos.sexoMasculino ?? datos.ISexo);

    const cNombreM = vacioANull(datos.cNombreFemenino ?? datos.cNombreM);
    const cApellidoM = vacioANull(datos.cApellidoFemenino ?? datos.cApellidoM);
    const cEmailM = vacioANull(datos.cEmailFemenino ?? datos.cEmailM);
    const nTelefonoM = vacioANull(datos.nTelefonoFemenino ?? datos.nTelefonoM);
    const dNacimientoM = vacioANull(datos.dNacimientoFemenino ?? datos.dNacimientoM);
    const oFotoM = vacioANull(datos.oFotoFemenino ?? datos.IFotoM ?? datos.oFotoM);
    const ISexoM = vacioANull(datos.sexoFemenino ?? datos.ISexoM);

    const sql = `
        UPDATE T_Participantes
        SET 
            cNombre = COALESCE(?, cNombre),
            cApellido = COALESCE(?, cApellido),
            cEmail = COALESCE(?, cEmail),
            nTelefono = COALESCE(?, nTelefono),
            dNacimiento = COALESCE(?, dNacimiento),
            oFoto = COALESCE(?, oFoto),
            ISexo = COALESCE(?, ISexo),
            cNombreM = COALESCE(?, cNombreM),
            cApellidoM = COALESCE(?, cApellidoM),
            cEmailM = COALESCE(?, cEmailM),
            nTelefonoM = COALESCE(?, nTelefonoM),
            dNacimientoM = COALESCE(?, dNacimientoM),
            IFotoM = COALESCE(?, IFotoM),
            ISexoM = COALESCE(?, ISexoM)
        WHERE nParejaID = ?
    `;

    const params = [
        cNombre,
        cApellido,
        cEmail,
        nTelefono,
        dNacimiento,
        oFoto,
        ISexo,
        cNombreM,
        cApellidoM,
        cEmailM,
        nTelefonoM,
        dNacimientoM,
        oFotoM,
        ISexoM,
        nParejaID
    ];

    try {
        const result = await queryDatabase(sql, params);
        // Si no hubo cambios porque los valores eran idénticos, pero la fila existe, devolver 1
        return (result && typeof result.affectedRows === "number" && result.affectedRows > 0)
            ? result.affectedRows
            : 1;
    } catch (err) {
        throw new Error("Error al actualizar pareja: " + err.message);
    }
}

// Función para eliminar una pareja por ID
async function eliminarPareja(id) {
    try {
        // Eliminar primero las referencias en tablas relacionadas
        await queryDatabase("DELETE FROM T_Categoria WHERE nParejaID = ?", [id]);
        await queryDatabase("DELETE FROM T_Estilos WHERE nParejaID = ?", [id]);

        // Luego eliminar la pareja de la tabla principal
        const result = await queryDatabase("DELETE FROM T_Participantes WHERE nParejaID = ?", [id]);
        return result.affectedRows; // Devuelve el número de filas afectadas
    } catch (err) {
        throw new Error("Error al eliminar pareja: " + err.message);
    }
}

module.exports = {
    registrarPareja,
    buscarParejaPorID,
    buscarParejaParaEvaluacion,
    buscarTodasLasParejas,
    eliminarPareja,
    actualizarParejaCompleta,
    actualizarPareja: actualizarParejaCompleta
};
