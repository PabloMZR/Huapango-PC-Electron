const { queryDatabase } = require("../db");

/**
 * Genera automáticamente el identificador / folio único para un nuevo participante al momento de su creación.
 */
async function generarSiguienteFolio(nCategoriaID) {
    try {
        const sql = `
            SELECT COUNT(*) AS total, MAX(nParticipanteID) AS maxId 
            FROM t_participantes 
            WHERE nCategoriaID = ?
        `;
        const res = await queryDatabase(sql, [nCategoriaID]);
        const consecutivo = (res[0]?.total || 0) + 1;
        const base = String(consecutivo).padStart(3, "0");
        return `FOLIO-C${nCategoriaID}-${base}`;
    } catch (err) {
        return `FOLIO-${Date.now().toString().slice(-6)}`;
    }
}

/**
 * Registra un participante, pareja o equipo con soporte completo de metadatos y fotografías.
 */
async function registrarParticipanteModular(datos) {
    try {
        const { nCategoriaID, cNombreRepresentativo, jMetadatos = {}, cFotoUrl = null } = datos;

        if (!nCategoriaID) {
            throw new Error("Se requiere el ID de la categoría para registrar el participante.");
        }
        if (!cNombreRepresentativo || cNombreRepresentativo.trim() === "") {
            throw new Error("El nombre representativo del participante es obligatorio.");
        }

        let identificador = datos.cIdentificador?.trim();
        if (!identificador) {
            identificador = await generarSiguienteFolio(nCategoriaID);
        }

        const metadatosString = typeof jMetadatos === "object" ? JSON.stringify(jMetadatos) : jMetadatos;

        const sql = `
            INSERT INTO t_participantes (nCategoriaID, cIdentificador, cNombreRepresentativo, jMetadatos, cFotoUrl, cEstado)
            VALUES (?, ?, ?, ?, ?, 'registrado')
        `;

        const result = await queryDatabase(sql, [
            nCategoriaID,
            identificador,
            cNombreRepresentativo.trim(),
            metadatosString,
            cFotoUrl
        ]);

        return {
            success: true,
            nParticipanteID: result.insertId,
            cIdentificador: identificador,
            cNombreRepresentativo: cNombreRepresentativo.trim(),
            cFotoUrl
        };
    } catch (err) {
        console.error("Error al registrar participante modular:", err);
        throw new Error("Error al registrar participante: " + err.message);
    }
}

/**
 * Actualiza los datos completos de un participante, incluyendo su fotografía y metadatos.
 */
async function actualizarParticipanteModular(nParticipanteID, datos) {
    try {
        const { nCategoriaID, cNombreRepresentativo, jMetadatos, cFotoUrl, cEstado } = datos;
        const metadatosString = typeof jMetadatos === "object" ? JSON.stringify(jMetadatos) : jMetadatos;

        const sql = `
            UPDATE t_participantes 
            SET nCategoriaID = COALESCE(?, nCategoriaID),
                cNombreRepresentativo = COALESCE(?, cNombreRepresentativo),
                jMetadatos = COALESCE(?, jMetadatos),
                cFotoUrl = COALESCE(?, cFotoUrl),
                cEstado = COALESCE(?, cEstado)
            WHERE nParticipanteID = ?
        `;

        const result = await queryDatabase(sql, [
            nCategoriaID || null,
            cNombreRepresentativo || null,
            metadatosString || null,
            cFotoUrl || null,
            cEstado || null,
            nParticipanteID
        ]);

        return { success: true, affectedRows: result.affectedRows };
    } catch (err) {
        console.error("Error al actualizar participante modular:", err);
        throw new Error("Error al actualizar participante: " + err.message);
    }
}

/**
 * Busca un participante por su ID numérico o por su Folio identificador (ej: FOLIO-101).
 */
async function buscarParticipantePorIDoFolio(termino) {
    try {
        const sql = `
            SELECT p.*, c.cNombre AS cCategoriaNombre, c.cModalidad, e.cNombre AS cEventoNombre
            FROM t_participantes p
            INNER JOIN t_categorias c ON p.nCategoriaID = c.nCategoriaID
            INNER JOIN t_eventos e ON c.nEventoID = e.nEventoID
            WHERE p.nParticipanteID = ? OR p.cIdentificador = ? OR p.cNombreRepresentativo LIKE ?
            LIMIT 10
        `;
        const paramId = !isNaN(Number(termino)) ? Number(termino) : -1;
        const paramTexto = String(termino).trim();
        const paramLike = `%${paramTexto}%`;

        const resultados = await queryDatabase(sql, [paramId, paramTexto, paramLike]);
        return resultados.map(r => {
            if (typeof r.jMetadatos === "string") {
                try { r.jMetadatos = JSON.parse(r.jMetadatos); } catch (_) {}
            }
            return r;
        });
    } catch (err) {
        console.error("Error al buscar participante:", err);
        throw new Error("Error en la búsqueda de participante: " + err.message);
    }
}

/**
 * Consulta todos los participantes de una categoría dada.
 */
async function obtenerParticipantesPorCategoria(nCategoriaID) {
    const sql = `
        SELECT 
            p.*, 
            COUNT(e.nEvaluacionID) AS totalEvaluacionesRecibidas,
            ROUND(AVG(e.nPuntajeTotalCalculado), 2) AS promedioActual
        FROM t_participantes p
        LEFT JOIN t_evaluaciones e ON p.nParticipanteID = e.nParticipanteID
        WHERE p.nCategoriaID = ?
        GROUP BY p.nParticipanteID
        ORDER BY p.nParticipanteID ASC
    `;
    try {
        const registros = await queryDatabase(sql, [nCategoriaID]);
        return registros.map(r => {
            if (typeof r.jMetadatos === "string") {
                try { r.jMetadatos = JSON.parse(r.jMetadatos); } catch (_) {}
            }
            return r;
        });
    } catch (err) {
        console.error("Error al obtener participantes de la categoría:", err);
        throw new Error("Error al obtener participantes: " + err.message);
    }
}

/**
 * Consulta todos los participantes registrados en el sistema.
 */
async function obtenerTodosLosParticipantes() {
    const sql = `
        SELECT p.*, c.cNombre AS cCategoriaNombre, e.cNombre AS cEventoNombre
        FROM t_participantes p
        LEFT JOIN t_categorias c ON p.nCategoriaID = c.nCategoriaID
        LEFT JOIN t_eventos e ON c.nEventoID = e.nEventoID
        ORDER BY p.dFechaRegistro DESC
    `;
    try {
        const registros = await queryDatabase(sql);
        return registros.map(r => {
            if (typeof r.jMetadatos === "string") {
                try { r.jMetadatos = JSON.parse(r.jMetadatos); } catch (_) {}
            }
            return r;
        });
    } catch (err) {
        console.error("Error al obtener todos los participantes:", err);
        throw new Error("Error al obtener todos los participantes: " + err.message);
    }
}

/**
 * Elimina un participante y sus calificaciones asociadas.
 */
async function eliminarParticipanteModular(nParticipanteID) {
    try {
        const sql = `DELETE FROM t_participantes WHERE nParticipanteID = ?`;
        const result = await queryDatabase(sql, [nParticipanteID]);
        return { success: true, affectedRows: result.affectedRows };
    } catch (err) {
        console.error("Error al eliminar participante modular:", err);
        throw new Error("Error al eliminar participante: " + err.message);
    }
}

module.exports = {
    generarSiguienteFolio,
    registrarParticipanteModular,
    actualizarParticipanteModular,
    buscarParticipantePorIDoFolio,
    obtenerParticipantesPorCategoria,
    obtenerTodosLosParticipantes,
    eliminarParticipanteModular
};
