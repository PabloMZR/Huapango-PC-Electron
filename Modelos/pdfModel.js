const PDFDocument = require("pdfkit");
const fs = require("fs");
const { pipeline } = require("node:stream/promises");
const { queryDatabase } = require("../db");

// Esperar tanto al documento como al archivo; cualquier error cierra ambos flujos.
async function escribirPDF(filePath, dibujar) {
    if (typeof filePath !== "string" || !filePath.trim()) {
        throw new Error("La ruta del archivo es inválida.");
    }
    const doc = new PDFDocument();
    let destino;
    try { destino = fs.createWriteStream(filePath); }
    catch (error) { doc.destroy(); throw error; }
    const terminado = pipeline(doc, destino);
    try {
        dibujar(doc);
        doc.end();
    } catch (error) {
        doc.destroy(error);
    }
    await terminado;
}

async function generarPDFParejas(filePath) {
    let resultados;
    try {
        resultados = await queryDatabase(`
            SELECT p.*, c.cNombre AS cCategoriaNombre, e.cNombre AS cEventoNombre
            FROM t_participantes p
            LEFT JOIN t_categorias c ON p.nCategoriaID = c.nCategoriaID
            LEFT JOIN t_eventos e ON c.nEventoID = e.nEventoID
            ORDER BY p.nCategoriaID ASC, p.nParticipanteID ASC
        `);
    } catch {
        resultados = await queryDatabase("SELECT * FROM T_Participantes");
    }

    if (!Array.isArray(resultados) || resultados.length === 0) {
        console.warn("No se encontraron parejas registradas.");
        throw new Error("No se encontraron parejas registradas.");
    }

    if (!filePath || typeof filePath !== "string") {
        throw new Error("La ruta del archivo es inválida.");
    }

    // Crear el documento PDF
    await escribirPDF(filePath, doc => {
        doc.fontSize(18).text("Participantes y Parejas Registradas", { align: "center" });
        doc.moveDown();

        resultados.forEach((p, i) => {
            const folio = p.cIdentificador || p.cFolio || `#${i + 1}`;
            const nombreP1 = p.cNombreRepresentativo || p.cNombrePrincipal || (p.cNombre ? `${p.cNombre} ${p.cApellido || ''}` : "N/A");
            const nombreP2 = p.cNombreSecundario || (p.cNombreM ? `${p.cNombreM} ${p.cApellidoM || ''}` : null);
            const categoria = p.cCategoriaNombre || "General";

            doc.fontSize(14).text(`Registro ${folio} - ${categoria}`, { underline: true });
            doc.fontSize(12)
                .text(`Participante / Representante: ${nombreP1}`)
                .text(nombreP2 ? `Acompañante / Pareja: ${nombreP2}` : "")
                .text(`Estado / Club: ${p.cRepresentacion || p.cEstadoOrigen || "N/A"}`)
                .text(`Teléfono: ${p.cTelefono || p.nTelefono || "N/A"}`)
                .text(`Email: ${p.cEmail || "N/A"}`)
                .moveDown();
        });
    });
    return { success: true, ruta: filePath };
}

async function generarPDFResultados(filePath) {
    let resultados;
    try {
        resultados = await queryDatabase(`
            SELECT 
                e.nEvaluacionID, 
                e.nPuntajeTotalCalculado AS nPuntaje, 
                e.cObservaciones AS cComentario, 
                e.dFechaEvaluacion,
                p.cIdentificador AS nParejaID,
                p.cNombreRepresentativo,
                u.cNombreUsuario AS juez,
                c.cNombre AS cCategoriaNombre
            FROM t_evaluaciones AS e
            LEFT JOIN t_participantes AS p ON e.nParticipanteID = p.nParticipanteID
            LEFT JOIN t_usuarios AS u ON e.nJuezID = u.nUsuarioID
            LEFT JOIN t_categorias AS c ON e.nCategoriaID = c.nCategoriaID
            ORDER BY e.dFechaEvaluacion DESC
        `);
    } catch {
        resultados = await queryDatabase(`
            SELECT e.nEvaluacionID, e.nParejaID, u.cNombreUsuario AS juez, e.nPuntaje, e.cComentario, e.dFechaEvaluacion
            FROM t_evaluaciones AS e
            JOIN t_usuarios AS u ON e.nJuezID = u.nUsuarioID
            ORDER BY e.dFechaEvaluacion DESC
        `);
    }

    if (!Array.isArray(resultados) || resultados.length === 0) {
        throw new Error("No se encontraron evaluaciones registradas.");
    }

    if (!filePath || typeof filePath !== "string") {
        throw new Error("La ruta del archivo es inválida.");
    }
    await escribirPDF(filePath, doc => {
        doc.fontSize(18).text("Resultados Oficiales de Evaluaciones", { align: "center" });
        doc.moveDown();

        resultados.forEach((r) => {
            const identificador = r.nParejaID || `ID-${r.nEvaluacionID}`;
            const comp = r.cNombreRepresentativo ? ` (${r.cNombreRepresentativo})` : '';
            doc.fontSize(14).text(`Evaluación #${r.nEvaluacionID} - Folio ${identificador}${comp}`, { underline: true });
            doc.fontSize(12)
                .text(`Categoría: ${r.cCategoriaNombre || 'General'}`)
                .text(`Juez evaluador: ${r.juez || 'N/A'}`)
                .text(`Calificación otorgada: ${r.nPuntaje || 0} pts`)
                .text(`Observaciones: ${r.cComentario || "Sin observaciones"}`)
                .text(`Fecha: ${new Date(r.dFechaEvaluacion).toLocaleString()}`)
                .moveDown();
        });
    });
    return { success: true, ruta: filePath };
}

async function generarPDFCategorias(filePath) {
    let resultados;
    try {
        resultados = await queryDatabase("SELECT * FROM t_categorias");
    } catch {
        resultados = await queryDatabase("SELECT * FROM T_Categorias");
    }

    if (!Array.isArray(resultados) || resultados.length === 0) {
        throw new Error("No se encontraron categorías registradas.");
    }

    if (!filePath || typeof filePath !== "string") {
        throw new Error("La ruta del archivo es inválida.");
    }
    await escribirPDF(filePath, doc => {
        doc.fontSize(18).text("Categorías y Modalidades Registradas", { align: "center" });
        doc.moveDown();

        resultados.forEach((c, i) => {
            const id = c.nCategoriaID || c.nIDCategoria || (i + 1);
            const nombre = c.cNombre || c.cCategoriaNombre || "Sin nombre";
            const modalidad = c.cModalidad || "Individual";
            doc.fontSize(14).text(`Categoría #${i + 1}: ${nombre}`, { underline: true });
            doc.fontSize(12)
                .text(`ID Categoría: ${id}`)
                .text(`Modalidad: ${modalidad}`)
                .text(`Fase: ${c.cFase || 'Principal'}`)
                .moveDown();
        });
    });
    return { success: true, ruta: filePath };
}

async function generarPDFEstilos(filePath) {
    const resultados = await queryDatabase("SELECT * FROM T_Estilos");

    if (!Array.isArray(resultados) || resultados.length === 0) {
        throw new Error(" No se encontraron estilos registrados.");
    }

    if (!filePath || typeof filePath !== "string") {
        throw new Error("La ruta del archivo es inválida.");
    }
    await escribirPDF(filePath, doc => {
        doc.fontSize(18).text("Estilos Registrados", { align: "center" });
        doc.moveDown();

        resultados.forEach((e, i) => {
            doc.fontSize(14).text(`Estilo #${i + 1}`, { underline: true });
            doc.fontSize(12)
                .text(`ID Estilo: ${e.nEstiloID}`)
                .text(`Nombre: ${e.cEstiloNombre}`)
                .text(`ID Pareja: ${e.nParejaID}`)
                .moveDown();
        });
    });
    return { success: true, ruta: filePath };
}

async function generarPDFRegistrosGenerales(filePath) {
    const registros = await queryDatabase(`
        SELECT nDatos_nuevos, cAcción, dFecha_hora
        FROM t_registros_generales
        ORDER BY dFecha_hora DESC
    `);

    if (!Array.isArray(registros) || registros.length === 0) {
        throw new Error("No se encontraron registros generales.");
    }
    await escribirPDF(filePath, doc => {
        doc.fontSize(18).text("Registro General de Eventos", { align: "center" });
        doc.moveDown();

        registros.forEach((registro) => {
            doc.fontSize(14).text(`Evento #${registro.nDatos_nuevos}`, { underline: true });
            doc.fontSize(12)
                .text(`Acción: ${registro.cAcción}`)
                .text(`Fecha: ${new Date(registro.dFecha_hora).toLocaleString()}`)
                .moveDown();
        });
    });
    return filePath;
}

module.exports = { generarPDFParejas, generarPDFResultados, generarPDFCategorias, generarPDFEstilos, generarPDFRegistrosGenerales };
