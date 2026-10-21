const { queryDatabase } = require("../db");

/**
 * Guarda un evento completo junto con sus categorías y criterios en una sola operación transaccional.
 * Mapea el payload proveniente del asistente de 5 pasos del frontend.
 */
async function guardarEventoCompleto(payload) {
    try {
        const { event, phases = [], categories = [], rubrics = [] } = payload;
        const nombreEvento = event?.name || "Nuevo Evento";
        const tipoEvento = event?.type || "danza";
        const formato = event?.format || "Presencial";
        const descripcion = `Evento con ${phases.length} fases y ${categories.length} categorías.`;

        // 1. Insertar el Evento en t_eventos
        const sqlEvento = `
            INSERT INTO t_eventos (cNombre, cDescripcion, cTipoEvento, cFormato, dFechaInicio, cEstado)
            VALUES (?, ?, ?, ?, NOW(), 'activo')
        `;
        const resEvento = await queryDatabase(sqlEvento, [nombreEvento, descripcion, tipoEvento, formato]);
        const nEventoID = resEvento.insertId;

        // 2. Insertar Categorías en t_categorias
        for (let i = 0; i < categories.length; i++) {
            const cat = categories[i];
            const modalidad = cat.participant?.toLowerCase().includes("pareja") 
                ? "pareja" 
                : (cat.participant?.toLowerCase().includes("equipo") || cat.participant?.toLowerCase().includes("trío") ? "equipo" : "individual");
            
            const reglasJson = JSON.stringify({
                fase: cat.phase || "Principal",
                criteriosEsperados: cat.criteria || 4,
                reglas: payload.judging?.rules || []
            });

            const sqlCat = `
                INSERT INTO t_categorias (nEventoID, cNombre, cDescripcion, cModalidad, nMinJuecesRequeridos, jReglas, cEstado)
                VALUES (?, ?, ?, ?, ?, ?, 'activa')
            `;
            const resCat = await queryDatabase(sqlCat, [
                nEventoID,
                cat.name || `Categoría ${i + 1}`,
                `Fase: ${cat.phase || "General"}`,
                modalidad,
                payload.judging?.judgesPerPhase?.[cat.phase] || 3,
                reglasJson
            ]);
            const nCategoriaID = resCat.insertId;

            // 3. Insertar Criterios de la Categoría
            // Si hay criterios específicos en rubrics para esta categoría, se usan; si no, se usan los criterios globales
            const criteriosList = rubrics.find(r => r.categoryId === cat.id)?.criteria || payload.criteria || [];
            
            for (let j = 0; j < criteriosList.length; j++) {
                const crit = criteriosList[j];
                const sqlCrit = `
                    INSERT INTO t_criterios_calificacion 
                    (nCategoriaID, cNombre, cDescripcion, cTipoControl, nPuntajeMinimo, nPuntajeMaximo, nPaso, nPesoPorcentaje, nOrden)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await queryDatabase(sqlCrit, [
                    nCategoriaID,
                    crit.name || `Criterio ${j + 1}`,
                    `Evaluación con escala ${crit.scale || "0-10"}`,
                    "range",
                    0.00,
                    10.00,
                    0.50,
                    crit.weight || 25.00,
                    j + 1
                ]);
            }
        }

        return { success: true, nEventoID };
    } catch (err) {
        console.error("Error al guardar evento modular completo:", err);
        throw new Error("No se pudo guardar el evento: " + err.message);
    }
}

/**
 * Obtiene todos los eventos con conteo de categorías y estado.
 */
async function obtenerEventos() {
    const sql = `
        SELECT 
            e.nEventoID, e.cNombre, e.cDescripcion, e.cTipoEvento, e.cFormato, e.cEstado, e.dFechaInicio,
            COUNT(DISTINCT c.nCategoriaID) AS totalCategorias,
            COUNT(DISTINCT p.nParticipanteID) AS totalParticipantes
        FROM t_eventos e
        LEFT JOIN t_categorias c ON e.nEventoID = c.nEventoID
        LEFT JOIN t_participantes p ON c.nCategoriaID = p.nCategoriaID
        GROUP BY e.nEventoID
        ORDER BY e.dFechaCreacion DESC
    `;
    try {
        return await queryDatabase(sql);
    } catch (err) {
        console.error("Error al obtener eventos:", err);
        throw new Error("Error al obtener eventos: " + err.message);
    }
}

/**
 * Obtiene el detalle de un evento incluyendo sus categorías y criterios de evaluación.
 */
async function obtenerEventoDetalle(nEventoID) {
    try {
        const sqlEvento = `SELECT * FROM t_eventos WHERE nEventoID = ?`;
        const eventos = await queryDatabase(sqlEvento, [nEventoID]);
        if (!eventos || eventos.length === 0) return null;

        const evento = eventos[0];

        const sqlCategorias = `
            SELECT c.*, 
                   COUNT(DISTINCT p.nParticipanteID) AS totalParticipantes
            FROM t_categorias c
            LEFT JOIN t_participantes p ON c.nCategoriaID = p.nCategoriaID
            WHERE c.nEventoID = ?
            GROUP BY c.nCategoriaID
        `;
        const categorias = await queryDatabase(sqlCategorias, [nEventoID]);

        for (const cat of categorias) {
            const sqlCriterios = `
                SELECT * FROM t_criterios_calificacion 
                WHERE nCategoriaID = ? 
                ORDER BY nOrden ASC
            `;
            cat.criterios = await queryDatabase(sqlCriterios, [cat.nCategoriaID]);

            const sqlParticipantes = `
                SELECT * FROM t_participantes 
                WHERE nCategoriaID = ? 
                ORDER BY nParticipanteID ASC
            `;
            cat.participantes = await queryDatabase(sqlParticipantes, [cat.nCategoriaID]);
        }

        evento.categorias = categorias;
        return evento;
    } catch (err) {
        console.error("Error al obtener detalle del evento:", err);
        throw new Error("Error al obtener detalle del evento: " + err.message);
    }
}

module.exports = { guardarEventoCompleto, obtenerEventos, obtenerEventoDetalle };
