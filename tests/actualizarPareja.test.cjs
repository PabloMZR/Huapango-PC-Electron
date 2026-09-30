const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const vm = require("node:vm");
const fs = require("node:fs");

function loadCommonJS(relativePath, mocks = {}) {
    const file = path.resolve(__dirname, "..", relativePath);
    const code = fs.readFileSync(file, "utf8");
    const module = { exports: {} };
    const wrapped = `(function (exports, require, module, __filename, __dirname) { ${code}\n})`;
    const fn = vm.runInThisContext(wrapped, { filename: file });
    fn(module.exports, (id) => {
        if (mocks[id]) return mocks[id];
        try {
            return require(id);
        } catch {
            const resolved = path.resolve(path.dirname(file), id);
            return require(resolved);
        }
    }, module, file, path.dirname(file));
    return module.exports;
}

function backend(queryDatabase) {
    const model = loadCommonJS("Modelos/parejaModel.js", { "../db": { queryDatabase } });
    const controller = loadCommonJS("Controladores/parejaController.js", { "../Modelos/parejaModel": model });
    return { model, controller };
}

test("actualizarPareja rechaza invocaciones sin datos o sin ID", async () => {
    const { model, controller } = backend(async () => assert.fail("No debe consultar SQL"));
    
    await assert.rejects(async () => model.actualizarParejaCompleta(null), /No se proporcionaron datos/);
    await assert.rejects(async () => model.actualizarParejaCompleta({}), /ID de la pareja es obligatorio/);
    await assert.rejects(async () => model.actualizarParejaCompleta({ nParejaID: "   " }), /ID de la pareja es obligatorio/);

    const resControlador = await controller.handleActualizarPareja(null, {});
    assert.equal(resControlador.success, false);
    assert.match(resControlador.message, /ID de la pareja es obligatorio/);
});

test("actualizarPareja devuelve no encontrada si la pareja no existe en la base de datos", async () => {
    const { model, controller } = backend(async (sql, params) => {
        assert.match(sql, /SELECT nParejaID FROM T_Participantes/i);
        return []; // No encontrada
    });

    const resultadoModel = await model.actualizarParejaCompleta({ nParejaID: 999 });
    assert.equal(resultadoModel, 0);

    const resultadoCtrl = await controller.handleActualizarPareja(null, { nParejaID: 999 });
    assert.equal(resultadoCtrl.success, false);
    assert.match(resultadoCtrl.message, /No se encontró ninguna pareja/);
});

test("actualizarPareja sanitiza campos vacíos a null y ejecuta un UPDATE con COALESCE", async () => {
    const queries = [];
    const { model, controller } = backend(async (sql, params) => {
        queries.push({ sql, params });
        if (/SELECT/i.test(sql)) {
            return [{ nParejaID: 10 }];
        }
        return { affectedRows: 1 };
    });

    const datos = {
        nParejaID: 10,
        cNombreMasculino: "Carlos",
        cApellidoMasculino: "Santana",
        cEmailMasculino: "carlos@test.com",
        nTelefonoMasculino: "4421234567",
        dNacimientoMasculino: "1995-04-12",
        oFotoMasculino: null,
        // Participante femenino con campos vacíos o undefined
        cNombreFemenino: "   ",
        cApellidoFemenino: "",
        cEmailFemenino: undefined,
        nTelefonoFemenino: "",
        dNacimientoFemenino: ""
    };

    const res = await controller.handleActualizarPareja(null, datos);
    assert.equal(res.success, true);
    assert.match(res.message, /actualizada exitosamente/);

    assert.equal(queries.length, 2);
    const updateQuery = queries[1];
    assert.match(updateQuery.sql, /UPDATE T_Participantes/);
    assert.match(updateQuery.sql, /cNombre = COALESCE\(\?, cNombre\)/);
    assert.match(updateQuery.sql, /dNacimiento = COALESCE\(\?, dNacimiento\)/);
    assert.match(updateQuery.sql, /WHERE nParejaID = \?/);

    // Verificar que NINGÚN parámetro sea undefined ni string vacío ""
    assert.equal(updateQuery.params.includes(undefined), false);
    assert.equal(updateQuery.params.includes(""), false);
    assert.equal(updateQuery.params.includes("   "), false);

    // Campos masculinos enviados
    assert.equal(updateQuery.params[0], "Carlos");
    assert.equal(updateQuery.params[1], "Santana");
    assert.equal(updateQuery.params[2], "carlos@test.com");
    assert.equal(updateQuery.params[3], "4421234567");
    assert.equal(updateQuery.params[4], "1995-04-12");

    // Campos femeninos vacíos normalizados a null para no sobrescribir ni dar error en fecha MySQL
    assert.equal(updateQuery.params[7], null); // cNombreM
    assert.equal(updateQuery.params[8], null); // cApellidoM
    assert.equal(updateQuery.params[9], null); // cEmailM
    assert.equal(updateQuery.params[10], null); // nTelefonoM
    assert.equal(updateQuery.params[11], null); // dNacimientoM
    assert.equal(updateQuery.params[14], 10); // WHERE nParejaID
});

test("actualizarPareja propaga errores de base de datos adecuadamente", async () => {
    const { model, controller } = backend(async (sql) => {
        if (/SELECT/i.test(sql)) return [{ nParejaID: 10 }];
        throw new Error("Conexión perdida con MySQL");
    });

    await assert.rejects(
        async () => model.actualizarParejaCompleta({ nParejaID: 10, cNombreMasculino: "Test" }),
        /Error al actualizar pareja: Conexión perdida con MySQL/
    );

    const res = await controller.handleActualizarPareja(null, { nParejaID: 10, cNombreMasculino: "Test" });
    assert.equal(res.success, false);
    assert.match(res.error, /Conexión perdida con MySQL/);
    assert.match(res.message, /Conexión perdida con MySQL/);
});
