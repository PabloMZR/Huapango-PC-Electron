const { queryDatabase } = require("../db");

/**
 * Guarda o actualiza la evaluación de un juez para un participante de forma atómica y desglosada por criterio.
 */
async function guardarEvaluacionDinamica(datos) {
    const { nCategoriaID, nParticipanteID, nJuezID, calificaciones = [], cObservaciones = "" } = datos;

    if (!nCategoriaID || !nParticipanteID || !nJuezID) {
        throw new Error("Datos insuficientes para registrar la evaluación (se requiere Categoría, Participante y Juez).");
    }

    try {
        // 1. Obtener criterios de la categoría para calcular el puntaje ponderado con precisión
        const criteriosSql = `SELECT nCriterioID, nPesoPorcentaje FROM t_criterios_calificacion WHERE nCategoriaID = ?`;
        const criterios = await queryDatabase(criteriosSql, [nCategoriaID]);
        const pesosMap = new Map(criterios.map(c => [c.nCriterioID, parseFloat(c.nPesoPorcentaje) || 0]));

        let puntajeTotalCalculado = 0;
        for (const calif of calificaciones) {
            const peso = pesosMap.get(calif.nCriterioID) || 0;
            const puntaje = parseFloat(calif.nPuntajeOtorgado) || 0;
            puntajeTotalCalculado += (puntaje * (peso / 100));
        }
        puntajeTotalCalculado = Math.round(puntajeTotalCalculado * 100) / 100;

        // 2. Insertar o actualizar la cabecera en t_evaluaciones
        const sqlCabecera = `
            INSERT INTO t_evaluaciones 
            (nCategoriaID, nParticipanteID, nJuezID, nPuntajeTotalCalculado, cObservaciones, dFechaEvaluacion)
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                nPuntajeTotalCalculado = VALUES(nPuntajeTotalCalculado),
                cObservaciones = VALUES(cObservaciones),
                dFechaEvaluacion = NOW()
        `;
        const resCabecera = await queryDatabase(sqlCabecera, [
            nCategoriaID,
            nParticipanteID,
            nJuezID,
            puntajeTotalCalculado,
            cObservaciones
        ]);

        // Determinar ID de evaluación
        let nEvaluacionID = resCabecera.insertId;
        if (!nEvaluacionID) {
            const findSql = `SELECT nEvaluacionID FROM t_evaluaciones WHERE nCategoriaID = ? AND nParticipanteID = ? AND nJuezID = ?`;
            const found = await queryDatabase(findSql, [nCategoriaID, nParticipanteID, nJuezID]);
            nEvaluacionID = found[0]?.nEvaluacionID;
        }

        // 3. Guardar el desglose de cada criterio en t_evaluacion_detalles
        for (const calif of calificaciones) {
            const sqlDetalle = `
                INSERT INTO t_evaluacion_detalles 
                (nEvaluacionID, nCriterioID, nPuntajeOtorgado, cNotaCriterio)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    nPuntajeOtorgado = VALUES(nPuntajeOtorgado),
                    cNotaCriterio = VALUES(cNotaCriterio)
            `;
            await queryDatabase(sqlDetalle, [
                nEvaluacionID,
                calif.nCriterioID,
                parseFloat(calif.nPuntajeOtorgado) || 0,
                calif.cNotaCriterio || null
            ]);
        }

        // 4. Actualizar estado del participante a 'evaluado'
        await queryDatabase(`UPDATE t_participantes SET cEstado = 'evaluado' WHERE nParticipanteID = ?`, [nParticipanteID]);

        return {
            success: true,
            nEvaluacionID,
            nPuntajeTotalCalculado
        };
    } catch (err) {
        console.error("Error al registrar evaluación dinámica:", err);
        throw new Error("Error al registrar la evaluación: " + err.message);
    }
}

/**
 * Consulta el leaderboard / resultados finales de una categoría calculando los promedios ponderados entre todos los jueces.
 */
async function obtenerResultadosCategoria(nCategoriaID) {
    try {
        const sql = `
            SELECT 
                p.nParticipanteID,
                p.cIdentificador,
                p.cNombreRepresentativo,
                p.jMetadatos,
                COUNT(e.nEvaluacionID) AS juecesQueCalificaron,
                ROUND(AVG(e.nPuntajeTotalCalculado), 2) AS puntajeFinalPromedio
            FROM t_participantes p
            INNER JOIN t_evaluaciones e ON p.nParticipanteID = e.nParticipanteID
            WHERE p.nCategoriaID = ?
            GROUP BY p.nParticipanteID
            ORDER BY puntajeFinalPromedio DESC
        `;
        const participantes = await queryDatabase(sql, [nCategoriaID]);

        // Criterios de la categoría para el desglose
        const sqlCriterios = `SELECT nCriterioID, cNombre, nPesoPorcentaje FROM t_criterios_calificacion WHERE nCategoriaID = ? ORDER BY nOrden ASC`;
        const criterios = await queryDatabase(sqlCriterios, [nCategoriaID]);

        // Desglose por participante y criterio
        for (const part of participantes) {
            if (typeof part.jMetadatos === "string") {
                try { part.jMetadatos = JSON.parse(part.jMetadatos); } catch (_) {}
            }

            const sqlDesglose = `
                SELECT 
                    d.nCriterioID,
                    ROUND(AVG(d.nPuntajeOtorgado), 2) AS promedioCriterio
                FROM t_evaluaciones e
                INNER JOIN t_evaluacion_detalles d ON e.nEvaluacionID = d.nEvaluacionID
                WHERE e.nParticipanteID = ? AND e.nCategoriaID = ?
                GROUP BY d.nCriterioID
            `;
            const desgloses = await queryDatabase(sqlDesglose, [part.nParticipanteID, nCategoriaID]);
            const desgloseMap = new Map(desgloses.map(d => [d.nCriterioID, d.promedioCriterio]));

            part.criteriosDesglose = criterios.map(c => ({
                nCriterioID: c.nCriterioID,
                cNombre: c.cNombre,
                peso: c.nPesoPorcentaje,
                promedio: desgloseMap.get(c.nCriterioID) ?? 0.00
            }));
        }

        return {
            criterios,
            participantes
        };
    } catch (err) {
        console.error("Error al obtener resultados de la categoría:", err);
        throw new Error("Error al obtener resultados: " + err.message);
    }
}

module.exports = {
    guardarEvaluacionDinamica,
    obtenerResultadosCategoria
};
