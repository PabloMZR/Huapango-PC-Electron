const { queryDatabase } = require("../db");
const { guardarSesion } = require("../Modelos/sesionModel");

async function handleLogin(event, credentials, createMainWindow) {
    const { username, password } = credentials;

    try {
        const sql = "SELECT nUsuarioID, cNombreUsuario, rol FROM t_usuarios WHERE cNombreUsuario = ? AND cContrasena = ?";
        const result = await queryDatabase(sql, [username, password]);

        if (result.length > 0) {
            console.log("Login exitoso:", result[0]);

            const userRole = result[0].rol; // El rol de la sesión ser "admin", "user" o "juez"
            guardarSesion(result[0].nUsuarioID, userRole);

            global.userRole = userRole; // Almacena el rol en una variable global
            // global.userID = result[0].nUsuarioID; // <-- Se guarda el ID aquí

            console.log("Enviando evento set-role con rol:", userRole);

            // Cierra la ventana de login y abre la ventana principal
            createMainWindow();
            if (global.loginWindow && !global.loginWindow.isDestroyed()) {
                global.loginWindow.close();
            }

            // Enviar el rol al renderizador
            global.mainWindow.webContents.once("did-finish-load", () => {
                global.mainWindow.webContents.send("set-role", userRole);
            });

            return { success: true };
        } else {
            console.warn("Usuario o contraseña incorrectos.");
            return { success: false, message: "Usuario o contraseña incorrectos" };
        }
    } catch (err) {
        console.error("Error al validar el login:", err);
        return { success: false, error: "Error interno al validar el login" };
    }
}

module.exports = { handleLogin, guardarSesion};