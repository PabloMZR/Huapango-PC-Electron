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

function backend(consultar) {
    const mockDb = {
        queryDatabase: async (sql, params) => consultar(sql, params),
        withTransaction: async (tablas, fn) => fn(consultar)
    };
    const mockImagenes = {
        conFotos: async (datos, fn) => fn(datos),
        limpiarFotos: async () => { }
    };
    const model = loadCommonJS("Modelos/parejaModel.js", {
        "../db": mockDb,
        "./imagenesModel": mockImagenes
    });
    const controller = loadCommonJS("Controladores/parejaController.js", {
        "../Modelos/parejaModel": model
    });
    return { model, controller };
}

const datosParejaValidos = {
    nParejaID: 10,
    cNombreMasculino: "Carlos",
    cApellidoMasculino: "Santana",
    cEmailMasculino: "carlos@test.com",
    nTelefonoMasculino: "4421234567",
    dNacimientoMasculino: "1995-04-12",
    oFotoMasculino: null,
    cNombreFemenino: "Maria",
    cApellidoFemenino: "Lopez",
    cEmailFemenino: "maria@test.com",
    nTelefonoFemenino: "4427654321",
    dNacimientoFemenino: "1996-05-15",
    oFotoFemenino: null
};

test("actualizarPareja rechaza invocaciones sin ID o con ID inválido", async () => {
    const { model, controller } = backend(async () => assert.fail("No debe consultar SQL"));

    await assert.rejects(async () => model.actualizarParejaCompleta(null), { code: "INVALID_ID" });
    await assert.rejects(async () => model.actualizarParejaCompleta({}), { code: "INVALID_ID" });
    await assert.rejects(async () => model.actualizarParejaCompleta({ nParejaID: "   " }), { code: "INVALID_ID" });
    await assert.rejects(async () => model.actualizarParejaCompleta({ nParejaID: -5 }), { code: "INVALID_ID" });

    const resControlador = await controller.handleActualizarPareja(null, {});
    assert.equal(resControlador.success, false);
    assert.equal(resControlador.code, "INVALID_ID");
    assert.match(resControlador.error, /Ingresa un ID de pareja entero y positivo/);
});

test("actualizarPareja devuelve no encontrada si la pareja no existe en la base de datos", async () => {
    const { model, controller } = backend(async (sql, params) => {
        assert.match(sql, /SELECT nParejaID/i);
        return []; // No encontrada
    });

    const datosInexistente = { ...datosParejaValidos, nParejaID: 999 };

    const resultadoModel = await model.actualizarParejaCompleta(datosInexistente);
    assert.equal(resultadoModel.success, false);
    assert.equal(resultadoModel.code, "NOT_FOUND");
    assert.equal(resultadoModel.affectedRows, 0);

    const resultadoCtrl = await controller.handleActualizarPareja(null, datosInexistente);
    assert.equal(resultadoCtrl.success, false);
    assert.equal(resultadoCtrl.code, "NOT_FOUND");
    assert.match(resultadoCtrl.error, /No se encontró ninguna pareja con ese ID para actualizar/);
});

test("actualizarPareja rechaza datos incompletos y actualiza correctamente con datos válidos", async () => {
    const queries = [];
    const { model, controller } = backend(async (sql, params) => {
        queries.push({ sql, params });
        if (/SELECT/i.test(sql)) {
            return [{ nParejaID: 10, oFoto: null, IFotoM: null }];
        }
        return { affectedRows: 1, changedRows: 1 };
    });

    // Rechaza campos vacíos antes de ejecutar SQL
    const datosIncompletos = {
        ...datosParejaValidos,
        cNombreFemenino: "   ",
        cApellidoFemenino: ""
    };

    await assert.rejects(
        async () => model.actualizarParejaCompleta(datosIncompletos),
        { code: "INVALID_DATA" }
    );
    const resInvalido = await controller.handleActualizarPareja(null, datosIncompletos);
    assert.equal(resInvalido.success, false);
    assert.equal(resInvalido.code, "INVALID_DATA");

    // Ejecuta correctamente cuando ambos participantes están completos
    const res = await controller.handleActualizarPareja(null, datosParejaValidos);
    assert.equal(res.success, true);
    assert.equal(res.code, "UPDATED");
    assert.match(res.message, /actualizada exitosamente/);

    assert.equal(queries.length, 2);
    const updateQuery = queries[1];
    assert.match(updateQuery.sql, /UPDATE T_Participantes/);
    assert.match(updateQuery.sql, /WHERE nParejaID = \?/);
    assert.equal(updateQuery.params[12], 10); // ID en WHERE
});

test("actualizarPareja propaga errores de base de datos adecuadamente", async () => {
    const { model, controller } = backend(async (sql) => {
        if (/SELECT/i.test(sql)) return [{ nParejaID: 10, oFoto: null, IFotoM: null }];
        const err = new Error("Conexión perdida con MySQL");
        err.code = "ECONNRESET";
        throw err;
    });

    await assert.rejects(
        async () => model.actualizarParejaCompleta(datosParejaValidos),
        /Conexión perdida con MySQL/
    );

    const res = await controller.handleActualizarPareja(null, datosParejaValidos);
    assert.equal(res.success, false);
    assert.equal(res.code, "ECONNRESET");
    assert.match(res.error, /Conexión perdida con MySQL/);
});
