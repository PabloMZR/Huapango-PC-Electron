const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { dialog } = require('electron');
const { queryDatabase } = require("../db");

async function generarPDFParejas(filePath) {
    return new Promise(async (resolve, reject) => {
        try {
            // Consultar los datos de la base de datos
            const resultados = await queryDatabase("SELECT * FROM T_Participantes");
            console.log("Resultados de la consulta:", resultados);

            if (!Array.isArray(resultados) || resultados.length === 0) {
                console.warn("No se encontraron parejas registradas.");
                throw new Error("No se encontraron parejas registradas.");
            }

            if (!filePath || typeof filePath !== "string") {
                throw new Error("La ruta del archivo es inválida.");
            }

            // Crear el documento PDF
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream); // Guardar en la ubicación seleccionada

            // Encabezado del PDF
            doc.fontSize(18).text("Parejas Registradas", { align: "center" });
            doc.moveDown();

            // Iterar sobre los resultados y agregarlos al PDF
            resultados.forEach((p, i) => {
                doc.fontSize(14).text(`Pareja #${i + 1}`, { underline: true });
                doc.fontSize(12)
                    .text(`Participante Masculino: ${p.cNombre || "N/A"} ${p.cApellido || "N/A"}`)
                    .text(`Participante Femenino: ${p.cNombreM || "N/A"} ${p.cApellidoM || "N/A"}`)
                    .text(`Teléfono Masculino: ${p.nTelefono || "N/A"}`)
                    .text(`Teléfono Femenino: ${p.nTelefonoM || "N/A"}`)
                    .text(`Email Masculino: ${p.cEmail || "N/A"}`)
                    .text(`Email Femenino: ${p.cEmailM || "N/A"}`)
                    .moveDown();
            });

            doc.end(); // Termina la generación del PDF

            // Esperar a que el archivo se termine de escribir antes de devolver la ruta
            stream.on("finish", () => {
                console.log(`PDF guardado correctamente en: ${filePath}`);
                resolve({ success: true, ruta: filePath });
            });

            stream.on("error", (error) => {
                console.error("Error al escribir el PDF:", error);
                reject({ success: false, error: error.message });
            });

        } catch (error) {
            console.error("Error en la generación del PDF:", error);
            reject({ success: false, error: error.message });
        }
    });
}


async function generarPDFResultados(filePath) {
    return new Promise(async (resolve, reject) => {
        try {
            // Consulta los resultados de la tabla de evaluaciones
            const resultados = await queryDatabase(`
                SELECT e.nEvaluacionID, e.nParejaID, u.cNombreUsuario AS juez, e.nPuntaje, e.cComentario, e.dFechaEvaluacion
                FROM t_evaluaciones AS e
                JOIN t_usuarios AS u ON e.nJuezID = u.nUsuarioID
                ORDER BY e.dFechaEvaluacion DESC
            `);

            if (!Array.isArray(resultados) || resultados.length === 0) {
                throw new Error("No se encontraron evaluaciones registradas.");
            }

            if (!filePath || typeof filePath !== "string") {
                throw new Error("La ruta del archivo es inválida.");
            }

            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            doc.fontSize(18).text("Resultados de Evaluaciones", { align: "center" });
            doc.moveDown();

            resultados.forEach((r) => {
                doc.fontSize(14).text(`Evaluación #${r.nEvaluacionID}`, { underline: true });
                doc.fontSize(12)
                    .text(`Pareja ID: ${r.nParejaID}`)
                    .text(`Juez: ${r.juez}`)
                    .text(`Puntaje: ${r.nPuntaje}`)
                    .text(`Comentario: ${r.cComentario || "Sin comentario"}`)
                    .text(`Fecha: ${new Date(r.dFechaEvaluacion).toLocaleString()}`)
                    .moveDown();
            });

            doc.end();

            // Esperar a que el archivo se termine de escribir antes de devolver éxito
            stream.on("finish", () => {
                console.log(`PDF de resultados generado correctamente en: ${filePath}`);
                resolve({ success: true, ruta: filePath });
            });

            stream.on("error", (error) => {
                console.error("Error al escribir el PDF:", error);
                reject({ success: false, error: error.message });
            });

        } catch (error) {
            console.error("Error en la generación del PDF:", error);
            reject({ success: false, error: error.message });
        }
    });
}

async function generarPDFCategorias(filePath) {
    return new Promise(async (resolve, reject) => {
        try {
            const resultados = await queryDatabase("SELECT * FROM T_Categorias");

            if (!Array.isArray(resultados) || resultados.length === 0) {
                throw new Error(" No se encontraron categorías registradas.");
            }

            if (!filePath || typeof filePath !== "string") {
                throw new Error("La ruta del archivo es inválida.");
            }

            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            doc.fontSize(18).text("Categorías Registradas", { align: "center" });
            doc.moveDown();

            resultados.forEach((c, i) => {
                doc.fontSize(14).text(`Categoría #${i + 1}`, { underline: true });
                doc.fontSize(12)
                    .text(`ID Categoría: ${c.nIDCategoria}`)
                    .text(`Nombre: ${c.cCategoriaNombre}`)
                    .text(`ID Pareja: ${c.nParejaID}`)
                    .moveDown();
            });

            doc.end();

            // Esperar que el archivo se escriba completamente antes de devolver éxito
            stream.on("finish", () => {
                console.log(`PDF de categorías generado correctamente en: ${filePath}`);
                resolve({ success: true, ruta: filePath });
            });

            stream.on("error", (error) => {
                console.error("Error al escribir el PDF:", error);
                reject({ success: false, error: error.message });
            });

        } catch (error) {
            console.error("Error en la generación del PDF:", error);
            reject({ success: false, error: error.message });
        }
    });
}

async function generarPDFEstilos(filePath) {
    return new Promise(async (resolve, reject) => {
        try {
            const resultados = await queryDatabase("SELECT * FROM T_Estilos");

            if (!Array.isArray(resultados) || resultados.length === 0) {
                throw new Error(" No se encontraron estilos registrados.");
            }

            if (!filePath || typeof filePath !== "string") {
                throw new Error("La ruta del archivo es inválida.");
            }

            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

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

            doc.end();

            // Esperar que el archivo se escriba completamente antes de devolver éxito
            stream.on("finish", () => {
                console.log(`PDF de estilos generado correctamente en: ${filePath}`);
                resolve({ success: true, ruta: filePath });
            });

            stream.on("error", (error) => {
                console.error("Error al escribir el PDF:", error);
                reject({ success: false, error: error.message });
            });

        } catch (error) {
            console.error("Error en la generación del PDF:", error);
            reject({ success: false, error: error.message });
        }
    });
}

async function generarPDFRegistrosGenerales(filePath) {
    return new Promise(async (resolve, reject) => {
        try {
            const registros = await queryDatabase(`
                SELECT nDatos_nuevos, cAcción, dFecha_hora 
                FROM t_registros_generales 
                ORDER BY dFecha_hora DESC
            `);

            if (!Array.isArray(registros) || registros.length === 0) {
                throw new Error("No se encontraron registros generales.");
            }

            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath); // <-- usa filePath, no una ruta fija

            doc.pipe(stream);

            doc.fontSize(18).text("Registro General de Eventos", { align: "center" });
            doc.moveDown();

            registros.forEach((registro) => {
                doc.fontSize(14).text(`Evento #${registro.nDatos_nuevos}`, { underline: true });
                doc.fontSize(12)
                    .text(`Acción: ${registro.cAcción}`)
                    .text(`Fecha: ${new Date(registro.dFecha_hora).toLocaleString()}`)
                    .moveDown();
            });

            doc.end();

            stream.on("finish", () => {
                console.log("PDF de registros generales generado correctamente:", filePath);
                resolve(filePath);
            });

            stream.on("error", (error) => {
                console.error("Error al escribir el PDF:", error);
                reject(error);
            });

        } catch (error) {
            console.error("Error en la generación del PDF:", error);
            reject(error);
        }
    });
}


module.exports = { generarPDFParejas, generarPDFResultados, generarPDFCategorias, generarPDFEstilos, generarPDFRegistrosGenerales };