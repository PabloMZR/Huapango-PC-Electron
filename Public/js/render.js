import { validarDatosPareja, validarDatosCategoria, validarDatosModificarPareja, validarEvaluacion } from "./validaciones.js";
import { validarIDPareja, validarDatosEstilo, validarIDCategoria, validarIDEstilo, validarDatosUsuario, validarDatosEliminarUsuario, validarDatosParejaResultados  } from "./validaciones.js";
import { mostrarResultados } from "./domHelpers.js";

// Detectar si la ventana es emergente (por query string)
const params = new URLSearchParams(window.location.search);
const esEmergente = params.get("emergente") === "1";

if (esEmergente) {
    // Oculta la barra de navegación solo en la ventana emergente
    document.addEventListener("DOMContentLoaded", () => {
        const menu = document.querySelector('.menu');
        if (menu) menu.style.display = "none";
    });
}

// Escuchar el evento DOMContentLoaded para inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
    // Configurar los botones del menú
    configurarMenu();

    // Asociar eventos a las secciones del menú
    // document.getElementById("btnIndex").addEventListener("click", () => cargarVista("MenuPrincipal"));
    // document.getElementById("btnRegistros").addEventListener("click", () => cargarVista("Registros", inicializarRegistros));
    // document.getElementById("btnParejas").addEventListener("click", () => cargarVista("RegistroCategoriasEstilos", inicializarParejas));
    // document.getElementById("btnResultados").addEventListener("click", () => cargarVista("Resultados", inicializarResultados));
    // document.getElementById("btnBusquedaParejas").addEventListener("click", () => cargarVista("BusquedaParejas", inicializarBusquedaParejas));
    // document.getElementById("btnModificarParejas").addEventListener("click", () => cargarVista("ModificarParejas", inicializarModificarParejas));
    // document.getElementById("btnAdministrador").addEventListener("click", () => cargarVista("Administrador", incializaAdministrador));
    // document.getElementById("btnRegreso").addEventListener("click", () => cargarVista("MenuPrincipal"));

    // Cargar la vista inicial
    // cargarVista("MenuPrincipal");
    // Navegación directa entre vistas
    // document.getElementById("btnIndex")?.addEventListener("click", () => {
    //     window.location.href = "../Vistas/MenuPrincipal.html";
    // });
    // document.getElementById("btnRegistros")?.addEventListener("click", () => {
    //     window.location.href = "../Vistas/Registros.html";
    // });
    // // document.getElementById("btnParejas")?.addEventListener("click", () => { //Si se requiere su uso o cargarlo aparte se puede descomentar y la logica ya esta aplicada en este archivo
    // //     window.location.href = "../Vistas/RegistroCategoriasEstilos.html";
    // // });
    // document.getElementById("btnResultados")?.addEventListener("click", () => {
    //     window.location.href = "../Vistas/Resultados.html";
    // });
    // document.getElementById("btnBusquedaParejas")?.addEventListener("click", () => {
    //     window.location.href = "../Vistas/BusquedaParejas.html";
    // });
    // document.getElementById("btnModificarParejas")?.addEventListener("click", () => {
    //     window.location.href = "../Vistas/ModificarParejas.html";
    // });
    // document.getElementById("btnAdministrador")?.addEventListener("click", () => {
    //     window.location.href = "../Vistas/Administrador.html";
    // });
    // document.getElementById("btnRegreso")?.addEventListener("click", () => {
    //     window.location.href = "../Vistas/MenuPrincipal.html";
    // });

        document.getElementById("btnIndex")?.addEventListener("click", () => {
        window.location.href = "../Vistas/MenuPrincipal.html";
    });
    document.getElementById("btnRegistros")?.addEventListener("click", () => {
        window.location.href = "../Vistas/Registros.html";
    });
    document.getElementById("btnResultados")?.addEventListener("click", () => {
        window.location.href = "../Vistas/Resultados.html";
    });
    document.getElementById("btnBusquedaParejas")?.addEventListener("click", () => {
        window.location.href = "../Vistas/BusquedaParejas.html";
    });
    document.getElementById("btnModificarParejas")?.addEventListener("click", () => {
        window.location.href = "../Vistas/ModificarParejas.html";
    });
    document.getElementById("btnAdministrador")?.addEventListener("click", () => {
        window.location.href = "../Vistas/Administrador.html";
    });
    document.getElementById("btnRegreso")?.addEventListener("click", () => {
        window.location.href = "../Vistas/MenuPrincipal.html";
    });

        // Detectar la vista actual y ejecutar la inicialización correspondiente
    const ruta = window.location.pathname;
    if (ruta.endsWith("Registros.html")) {
        inicializarRegistros();
    } else if (ruta.endsWith("RegistroCategoriasEstilos.html")) {
        inicializarParejas();
    } else if (ruta.endsWith("Resultados.html")) {
        inicializarResultados();
    } else if (ruta.endsWith("BusquedaParejas.html")) {
        inicializarBusquedaParejas();
    } else if (ruta.endsWith("ModificarParejas.html")) {
        inicializarModificarParejas();
    } else if (ruta.endsWith("Administrador.html")) {
        inicializaAdministrador();
    }
});

// Función para configurar el menú según el rol del usuario
async function configurarMenu() {
    try {
        const userRole = await window.api.getUserRole(); // Obtener el rol del usuario desde el proceso principal
        console.log(`Rol recibido: ${userRole}`);

        // Configurar visibilidad de botones según el rol
        const btnAdministrador = document.getElementById("btnAdministrador");
        const btnResultados = document.getElementById("btnResultados");
        const btnRegistros = document.getElementById("btnRegistros");
        const btnBusquedaParejas = document.getElementById("btnBusquedaParejas");
        // const btnParejas = document.getElementById("btnParejas");
        const btnModificarParejas = document.getElementById("btnModificarParejas");

        if (btnAdministrador && btnResultados && btnRegistros && btnBusquedaParejas) {
            if (userRole === "admin") {
                btnAdministrador.style.display = "block";
                btnResultados.style.display = "block";
                btnRegistros.style.display = "block";
                btnBusquedaParejas.style.display = "block";
            } else if (userRole === "user") {
                btnAdministrador.style.display = "none";
                btnResultados.style.display = "none";
                btnRegistros.style.display = "block";
                btnBusquedaParejas.style.display = "block";
            } else if (userRole === "juez") {
                btnAdministrador.style.display = "none";
                btnResultados.style.display = "block";
                btnRegistros.style.display = "none";
                btnBusquedaParejas.style.display = "none";
                // btnParejas.style.display = "none";
                btnModificarParejas.style.display = "none";
            }
        } else {
            console.warn("Los botones no se encontraron en el DOM.");
        }
    } catch (err) {
        console.error("Error al configurar el menú:", err);
    }
}



// Función para cargar vistas dinámicamente
// function cargarVista(archivo, callback) {
//     const ruta = `../Vistas/${archivo}.html`;
//     console.log(`Intentando cargar: ${ruta}`);
//     fetch(ruta)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`No se pudo cargar el archivo HTML: ${response.statusText}`);
//             }
//             return response.text();
//         })
//         .then(html => {
//             const content = document.getElementById("content");
//             if (content) {
//                 content.innerHTML = html;
//                 if (callback) callback(); // Ejecutar lógica adicional después de cargar la vista
//             } else {
//                 console.error("No se encontró el contenedor con ID 'content'.");
//             }
//         })
//         .catch(error => {
//             console.error("Error al cargar la vista:", error);
//         });
// }

// Inicializar la lógica para la sección de Registros
function inicializarRegistros() {

        const btnGenerarPDF = document.getElementById("btnGenerarPDF");
    if (btnGenerarPDF) {
        btnGenerarPDF.addEventListener("click", async () => {
            try {
                const response = await window.api.generarPDFParejas();
                if (response.success) {
                    alert(`PDF generado con éxito. Ruta: ${response.ruta}`);
                } else {
                    alert(`Error al generar el PDF: ${response.error}`);
                }
            } catch (err) {
                alert("Error interno al generar el PDF.");
            }
        });
    }


    const btnSave = document.getElementById("BTNSave");
    const btnRegistrarCategoria = document.getElementById("btnRegistrarCategoria");
    const btnRegistrarEstilo = document.getElementById("btnRegistrarEstilo");
    const contentCategoria = document.getElementById("contentCategoria");
    const contentEstilo = document.getElementById("contentEstilo");
    const btnGenerarPDFCategorias = document.getElementById("btnGenerarPDFCategorias");
    const btnGenerarPDFEstilos = document.getElementById("btnGenerarPDFEstilos");
    if (btnSave) {
        btnSave.addEventListener("click", async () => {
            try {
                // Capturar datos del formulario
        const datos = {
                    nParejaID: document.getElementById("nParejaID").value.trim(),
                    // Masculino
                    oFotoMasculino: document.getElementById("fotoMasculino").files[0]?.name || "",
                    dNacimientoMasculino: document.getElementById("fechaNacimientoMasculino").value,
                    sexoMasculino: document.getElementById("sexoMasculino").value,
                    nTelefonoMasculino: document.getElementById("telefonoMasculino").value,
                    cNombreMasculino: document.getElementById("nombreMasculino").value,
                    cApellidoMasculino: document.getElementById("apellidoMasculino").value,
                    cEmailMasculino: document.getElementById("emailMasculino").value,
                    // Femenino
                    oFotoFemenino: document.getElementById("fotoFemenino").files[0]?.name || "",
                    dNacimientoFemenino: document.getElementById("fechaNacimientoFemenino").value,
                    sexoFemenino: document.getElementById("sexoFemenino").value,
                    nTelefonoFemenino: document.getElementById("telefonoFemenino").value,
                    cNombreFemenino: document.getElementById("nombreFemenino").value,
                    cApellidoFemenino: document.getElementById("apellidoFemenino").value,
                    cEmailFemenino: document.getElementById("emailFemenino").value,
                };

                // Validar campos obligatorios
            console.log("Datos capturados:", datos);

            console.log("Datos antes de validación:", datos);
            validarDatosPareja(datos);

            //  Validar los datos con `validaciones.js`
            validarDatosPareja(datos);

            console.log("Validaciones completadas correctamente.");

            //  Enviar datos al proceso principal
            const response = await window.api.registrarPareja(datos);

            console.log("Respuesta del backend:", response)

                if (response.success) {
                    alert("Registro exitoso, ID: " + response.id);
                        //  Guardar el ID en sessionStorage con el nombre correcto
    sessionStorage.setItem("nParejaID", response.id);

    //  Mostrar formularios de categorías y estilos solo si existen en el HTML
    if (contentCategoria) {
        contentCategoria.style.display = "block";
    } else {
        console.warn("Advertencia: No se encontró el elemento con ID 'contentCategoria'. Verifica el HTML.");
    }

    if (contentEstilo) {
        contentEstilo.style.display = "block";
    } else {
        console.warn("Advertencia: No se encontró el elemento con ID 'contentEstilo'. Verifica el HTML.");
    }
                } else {
                    alert("Error al registrar pareja: " + response.error);
                }
            } catch (err) {
                console.error("Error al registrar pareja:", err);
                alert("Error: " + err.message);
            }
        });
    } else {
        console.error("No se encontró el botón con la ID 'BTNSave'.");
    }
            //  Registrar Categoría con el ID de la pareja
    if (btnRegistrarCategoria) {
        btnRegistrarCategoria.addEventListener("click", async () => {
            try {
                const nParejaID = sessionStorage.getItem("nParejaID");

                if (!nParejaID) {
                    alert("Error: No se encontró el ID de la pareja. Registra una primero.");
                    return;
                }

                const datosCategoria = {
                    nIDCategoria: document.getElementById("nIDCategoria").value.trim(),
                    cCategoriaNombre: document.getElementById("categoriaRegistro").options[document.getElementById("categoriaRegistro").selectedIndex].text,
                    nParejaID: nParejaID
                };

                console.log("Registrando categoría:", datosCategoria);
                validarDatosCategoria(datosCategoria);

                const response = await window.api.registrarCategoria(datosCategoria);
                console.log("Respuesta del backend:", response);

                alert(response.success ? "Categoría registrada exitosamente." : `Error: ${response.error}`);
            } catch (err) {
                console.error("Error al registrar categoría:", err);
                alert(`Error: ${err.message}`);
            }
        });
    } else {
        console.error("No se encontró el botón 'btnRegistrarCategoria'.");
    }

    //  Registrar Estilo con el ID de la pareja
    if (btnRegistrarEstilo) {
        btnRegistrarEstilo.addEventListener("click", async () => {
            try {
                const nParejaID = sessionStorage.getItem("nParejaID");

                if (!nParejaID) {
                    alert("Error: No se encontró el ID de la pareja. Registra una primero.");
                    return;
                }

                const estiloSelect = document.getElementById("estiloRegistro");
                const nEstiloID = document.getElementById("nEstiloID").value.trim();
                const cEstiloNombre = estiloSelect.options[estiloSelect.selectedIndex].text;

                const datosEstilo = { nEstiloID, cEstiloNombre, nParejaID };

                console.log("Registrando estilo:", datosEstilo);
                validarDatosEstilo(datosEstilo);

                const response = await window.api.registrarEstilo(datosEstilo);
                console.log("Respuesta del backend:", response);

                alert(response.success ? "Estilo registrado exitosamente." : `Error: ${response.error}`);
            } catch (err) {
                console.error("Error al registrar estilo:", err);
                alert(`Error: ${err.message}`);
            }
        });
    } else {
        console.error("No se encontró el botón 'btnRegistrarEstilo'.");
    }
        if (btnGenerarPDFCategorias) {
        btnGenerarPDFCategorias.addEventListener("click", async () => {
            try {
                const response = await window.api.generarPDFCategorias();
                console.log("Generando PDF de Categorías...", response);

                alert(response.success ? `PDF de categorías generado con éxito. Ruta: ${response.ruta}` : `Error al generar el PDF: ${response.error}`);
            } catch (err) {
                console.error("Error interno al generar el PDF de categorías:", err);
                alert("Error interno al generar el PDF de categorías.");
            }
        });
    }

    if (btnGenerarPDFEstilos) {
        btnGenerarPDFEstilos.addEventListener("click", async () => {
            try {
                const response = await window.api.generarPDFEstilos();
                console.log("Generando PDF de Estilos...", response);

                alert(response.success ? `PDF de estilos generado con éxito. Ruta: ${response.ruta}` : `Error al generar el PDF: ${response.error}`);
            } catch (err) {
                console.error("Error interno al generar el PDF de estilos:", err);
                alert("Error interno al generar el PDF de estilos.");
            }
        });
    }
}

// Inicializar la lógica para la sección de Parejas
function inicializarParejas() {

    const btnRegistrarCategoria = document.getElementById("btnRegistrarCategoria");
    const btnBuscarPareja = document.getElementById("btnBuscarPareja");
    const btnBuscarCategoria = document.getElementById("btnBuscarCategoria");
    const btnBuscarEstilo = document.getElementById("btnBuscarEstilo");
    const btnModificarParejas = document.getElementById("btnModificarParejas");
    const btnRegistrarEstilo = document.getElementById("btnRegistrarEstilo");

            const btnGenerarPDFCategorias = document.getElementById("btnGenerarPDFCategorias");
    if (btnGenerarPDFCategorias) {
        btnGenerarPDFCategorias.addEventListener("click", async () => {
            try {
                const response = await window.api.generarPDFCategorias();
                if (response.success) {
                    alert(`PDF de categorías generado con éxito. Ruta: ${response.ruta}`);
                } else {
                    alert(`Error al generar el PDF: ${response.error}`);
                }
            } catch (err) {
                alert("Error interno al generar el PDF de categorías.");
            }
        });
    }

    const btnGenerarPDFEstilos = document.getElementById("btnGenerarPDFEstilos");
    if (btnGenerarPDFEstilos) {
        btnGenerarPDFEstilos.addEventListener("click", async () => {
            try {
                const response = await window.api.generarPDFEstilos();
                if (response.success) {
                    alert(`PDF de estilos generado con éxito. Ruta: ${response.ruta}`);
                } else {
                    alert(`Error al generar el PDF: ${response.error}`);
                }
            } catch (err) {
                alert("Error interno al generar el PDF de estilos.");
            }
        });
    }

    if (btnRegistrarCategoria) {
        btnRegistrarCategoria.addEventListener("click", registrarCategoria);
    } else {
        console.error("No se encontró el botón con la ID 'btnRegistrarCategoria'.");
    }

    if (btnRegistrarEstilo) {
        btnRegistrarEstilo.addEventListener("click", registrarEstilo);
    }
    else {
        console.error("No se encontró el botón con la ID 'btnRegistrarEstilo'.");
    }

    // if (btnBuscarPareja) {
    //     btnBuscarPareja.addEventListener("click", () => {
    //         cargarVista("BusquedaParejas", inicializarBusquedaParejas);
    //     });
    // } else {
    //     console.error("No se encontró el botón con la ID 'btnBuscarPareja'.");
    // }

    // if (btnEliminarPareja) {
    //     e.preventDefault(); // Evitar que el formulario recargue la página
    //     btnEliminarPareja.addEventListener("click", () => {
    //     });
    // } else {
    //     console.error("No se encontró el botón con la ID 'btnEliminarPareja'.");
    // }

    if (btnModificarParejas) {
        btnModificarParejas.addEventListener("click", () => {
            cargarVista("ModificarParejas", inicializarModificarParejas);
        });
    } else {
        console.error("No se encontró el botón con la ID 'btnModificarParejas'.");
    }
}

// Función para registrar una categoría
async function registrarCategoria() {
    try {
        const datos = {
            nIDCategoria: document.getElementById("nIDCategoria").value.trim(),
            cCategoriaNombre: document.getElementById("categoriaRegistro").options[document.getElementById("categoriaRegistro").selectedIndex].text,
            nParejaID: document.getElementById("nParejaID").value.trim()
        };

        validarDatosCategoria(datos); // Usamos la validación externa en `validaciones.js`

        console.log("Enviando datos al backend:", datos);

        const response = await window.api.registrarCategoria(datos);
        alert(response.success ? "Categoría registrada exitosamente." : "Error: " + response.error);
    } catch (err) {
        console.error("Error al registrar categoría:", err);
        alert("" + err.message);
    }
}


// Función para registrar un estilo
async function registrarEstilo() {
    try {
        const nEstiloInput = document.getElementById("nEstiloID");
        if (!nEstiloInput) {
            console.error("Error: No se encontró el elemento con ID 'nEstiloID'.");
            alert("Error: No se encontró el campo para ingresar el ID del estilo.");
            return;
        }

        const estiloSelect = document.getElementById("estiloRegistro");
        const nEstiloID = nEstiloInput.value.trim(); // ID del estilo ingresado manualmente
        const cEstiloNombre = estiloSelect.options[estiloSelect.selectedIndex].text;
        const nParejaID = document.getElementById("nParejaIDEstilo").value.trim();

        validarDatosEstilo({ nEstiloID, cEstiloNombre, nParejaID });

        console.log("Enviando datos al backend:", { nEstiloID, cEstiloNombre, nParejaID });

        const response = await window.api.registrarEstilo({ nEstiloID, cEstiloNombre, nParejaID });

        alert(response.success ? "Estilo registrado exitosamente." : "Error: " + response.error);
    } catch (err) {
        console.error("Error al registrar estilo:", err);
        alert("" + err.message);
    }
}



function inicializarBusquedaParejas() {
    console.log("Inicializando lógica de búsqueda de parejas...");
    const btnBuscar = document.getElementById("btnBuscarPareja");
    if (btnBuscar) {
        btnBuscar.addEventListener("click", (e) => {
            e.preventDefault(); // Evitar que el formulario recargue la página
            buscarPareja();
        });
    } else {
        console.error("No se encontró el botón con la ID 'btnBuscarPareja'.");
    }

    // Botón de búsqueda de categoría
    const btnBuscarCategoria = document.getElementById("btnBuscarCategoria");
    if (btnBuscarCategoria) {
        btnBuscarCategoria.addEventListener("click", (e) => {
            e.preventDefault();
            buscarCategoria();
        });
        console.log("Evento registrado en btnBuscarCategoria.");
    } else {
        console.error("No se encontró el botón con la ID 'btnBuscarCategoria'.");
    }

    // Botón de búsqueda de estilo
    const btnBuscarEstilo = document.getElementById("btnBuscarEstilo");
    if (btnBuscarEstilo) {
        btnBuscarEstilo.addEventListener("click", (e) => {
            e.preventDefault();
            buscarEstilo();
        });
        console.log("Evento registrado en btnBuscarEstilo.");
    } else {
        console.error("No se encontró el botón con la ID 'btnBuscarEstilo'.");
    }
}

function inicializarModificarParejas() { 
    console.log("Inicializando lógica de modificación de parejas...");
    
    const btnGuardar = document.getElementById("BTNUpdate");
    // const btnGuardarFem = document.getElementById("BTNUpdateFemenino");

    // console.log("Elemento BTNUpdateFemenino:", document.getElementById("BTNUpdateFemenino"));

    if (btnGuardar) {
        console.log("Botón masculino encontrado, registrando evento...");
        btnGuardar.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("Evento click en BTNUpdate (Masculino)");
            modificarPareja();
        });
    } else {
        console.error("No se encontró el botón con la ID 'BTNUpdate'.");
    }

    // if (btnGuardarFem) {
    //     console.log("Botón femenino encontrado, registrando evento...");
    //     btnGuardarFem.addEventListener("click", (e) => {
    //         e.preventDefault(); // Evitar que el formulario recargue la página
    //         console.log("Evento click en BTNUpdateFemenino (Femenino) DETECTADO!");
    //         modificarPareja();
    //     });
    // } else {
    //         console.error("No se encontró el botón con la ID 'BTNUpdateFemenino'.");
    //     }
    }


function inicializarResultados() {
    console.log("Inicializando sistema de evaluación de parejas...");

    //  Vincular evento del botón de búsqueda en evaluación
    const btnBuscarPareja = document.getElementById("buscar-pareja");
    if (btnBuscarPareja) {
        btnBuscarPareja.addEventListener("click", buscarParejaParaEvaluacion);
    } else {
        console.error("No se encontró el botón con la ID 'buscar-pareja'.");
    }

    //  Vincular evento del botón de guardar evaluación
    const btnGuardarEvaluacion = document.getElementById("guardar-evaluacion");
    if (btnGuardarEvaluacion) {
        btnGuardarEvaluacion.addEventListener("click", guardarEvaluacion);
    } else {
        console.error("No se encontró el botón con la ID 'guardar-evaluacion'.");
    }

        const btnGenerarPDFResultados = document.getElementById("btnGenerarPDFResultados");
if (btnGenerarPDFResultados) {
    btnGenerarPDFResultados.addEventListener("click", async () => {
        try {
            console.log("Botón de Generar PDF de Resultados presionado.");
            const response = await window.api.generarPDFResultados();
            if (response.success) {
                alert(`PDF generado con éxito. Ruta: ${response.ruta}`);
            } else {
                alert(`Error al generar el PDF: ${response.error}`);
            }
        } catch (err) {
            alert("Error interno al generar el PDF.");
        }
    });
}

    //  Asegurar que la sección de evaluación reciba los datos correctamente
    async function mostrarDatosPareja(id) {
        try {
            const response = await window.api.buscarParejaPorID(id);

            if (response.success && response.data.length > 0) {
                console.log("Resultados obtenidos:", response.data);

                const parejaData = response.data[0];

                // Asignar los valores a los elementos HTML
                actualizarElemento("pareja-id-info", parejaData.nParejaID);
                actualizarElemento("participante1", parejaData.participante1);
                actualizarElemento("participante2", parejaData.participante2);
                actualizarElemento("categoria", parejaData.categoriaNombre);
                actualizarElemento("estilo", parejaData.estiloNombre);
            } else {
                alert(`No se encontró información para el ID "${id}".`);
            }
        } catch (err) {
            console.error("Error al obtener datos de la pareja:", err);
            alert(`Error: ${err.message}`);
        }
    }

    //  Función para actualizar los elementos evitando errores
    function actualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor || "--";
        } else {
            console.error(`No se encontró el elemento con ID '${id}'`);
        }
    }

    //  Seleccionar todos los inputs de tipo range y contenedores de valores
    const aspectos = document.querySelectorAll(".rango-aspecto");

    function actualizarTotal() {
        let total = 0;

        aspectos.forEach((input) => {
            const id = input.id.replace("aspecto", "valor-aspecto");
            const valor = parseInt(input.value, 10);
            total += valor;

            // Actualizar el número junto al slider
            actualizarElemento(id, valor);
        });

        // Actualizar el puntaje total
        actualizarElemento("puntaje-total", total);
    }

    //  Vincular eventos de actualización de sliders
    aspectos.forEach((input) => {
        input.addEventListener("input", actualizarTotal);
    });

    //  Inicializar valores al cargar
    actualizarTotal();
}



function inicializaAdministrador() {
    console.log("Inicializando lógica de administrador...");

    const btnCrearUsuario = document.getElementById("btnCrearUsuario");
    if (btnCrearUsuario) {
        btnCrearUsuario.addEventListener("click", (e) => {
            e.preventDefault(); 

            //  Detectar el tipo de cuenta seleccionado
            const tipoCuenta = document.querySelector('input[name="tipoCuenta"]:checked').value;
            console.log(`Creando cuenta con rol: ${tipoCuenta}`);

            crearUsuario(tipoCuenta); // Pasar el tipo de cuenta al backend
        });
    } else {
        console.error("No se encontró el botón con la ID 'btnCrearUsuario'.");
    }

const btnEliminarUsuario = document.getElementById("btnEliminarUsuario");
if (btnEliminarUsuario) {
    btnEliminarUsuario.addEventListener("click", (e) => {
        e.preventDefault(); 

        const cNombreUsuario = document.getElementById("usuarioEliminar")?.value.trim();

        console.log("Valor de usuarioEliminar:", cNombreUsuario); //  Verificación

        if (!cNombreUsuario || cNombreUsuario.length < 3) {
            alert("Debes ingresar un nombre de usuario válido (mínimo 3 caracteres).");
            return;
        }

        try {
            console.log(`Usuario validado, eliminando: ${cNombreUsuario}`);
            eliminarUsuario(cNombreUsuario);
        } catch (error) {
            alert(error.message);
        }
    });
} else {
    console.error("No se encontró el botón con la ID 'btnEliminarUsuario'.");
}







    const btnEliminarPareja = document.getElementById("btnEliminarPareja");
    if (btnEliminarPareja) {
        btnEliminarPareja.addEventListener("click", (e) => {
            e.preventDefault(); 
            eliminarPareja();
        });
    } else {
        console.error("No se encontró el botón con la ID 'btnEliminarPareja'.");
    }

    const btnGenerarPDFRegistros = document.getElementById("btnGenerarPDFRegistros");
    if (btnGenerarPDFRegistros) {
        btnGenerarPDFRegistros.addEventListener("click", async () => {
            try {
                console.log("Botón de Generar PDF de Registros Generales presionado.");
                const response = await window.api.generarPDFRegistrosGenerales();
                if (response.success) {
                    alert(`PDF de registros generales generado con éxito. Ruta: ${response.ruta}`);
                } else {
                    alert(`Error al generar el PDF: ${response.error}`);
                }
            } catch (err) {
                alert("Error interno al generar el PDF de registros generales.");
            }
        });
    }
}



async function guardarEvaluacion() {
    try {
        document.getElementById("pareja-id-info")?.innerText // LOG QUE LUEGO SE VA A BORRAR
        const nJuezID = await window.api.getUsuarioID(); // ID del juez desde la sesión
        const nParejaID = document.getElementById("pareja-id-info").innerText.trim(); //REVISAR EL MALDITO id

        if (!nJuezID || !nParejaID) {
            alert("Error: No se ha identificado al juez o la pareja.");
            return;
        }

        const aspecto1 = document.getElementById("aspecto1").value;
        const aspecto2 = document.getElementById("aspecto2").value;
        const aspecto3 = document.getElementById("aspecto3").value;
        const aspecto4 = document.getElementById("aspecto4").value;
        const aspecto5 = document.getElementById("aspecto5").value;
        const aspecto6 = document.getElementById("aspecto6").value;
        const cComentario = document.getElementById("observaciones").value.trim();
        // Calcular el puntaje total
        const nPuntaje = parseInt(aspecto1) + parseInt(aspecto2) + parseInt(aspecto3) + parseInt(aspecto4) + parseInt(aspecto5) + parseInt(aspecto6);

        const datos = { nJuezID, nParejaID, nPuntaje, cComentario };

        console.log("nJuezID:", nJuezID, "nParejaID:", nParejaID);
        console.log("Datos de evaluación capturados:", datos);

        //  Validar antes de enviar
        const resultadoValidacion = validarEvaluacion(datos);
        if (!resultadoValidacion.success) {
            alert(resultadoValidacion.error);
            return;
        }

        console.log("Enviando evaluación al backend:", datos);
        const response = await window.api.registrarEvaluacion(datos);

        alert(response.success ? "Evaluación guardada exitosamente." : "Error: " + response.error);
    } catch (err) {
        console.error("Error al guardar evaluación:", err);
        alert("" + err.message);
    }
}


async function buscarPareja() {
    try {
        console.log("Ejecutando buscarPareja...");
        
        // Capturar el ID de la pareja desde el formulario
        const id = document.querySelector("#nParejaID")?.value;

        // Validar el ID antes de enviarlo
        validarIDPareja(id);

        // Realizar la solicitud al backend
        const response = await window.api.buscarParejaPorID(id);

        // Mostrar los resultados en el contenedor correspondiente
        if (response.success) {
            console.log("Resultados obtenidos:", response.data);
            mostrarResultados(response.data, "resultadosBusquedaParejas");
        } else {
            alert(`${response.message}`);
        }
    } catch (err) {
        console.error("Error al buscar pareja:", err);
        alert(`Error: ${err.message}`);
    }
}

async function buscarParejaParaEvaluacion() {
    try {
        console.log("Ejecutando buscarParejaParaEvaluacion...");

        const id = parseInt(document.querySelector("#pareja-id")?.value.trim(), 10);
        validarIDPareja(id); // Validar el ID antes de buscar

        const response = await window.api.buscarTodasLasParejas();

        if (response.success && response.data.length > 0) {
            console.log("Resultados obtenidos:", response.data);

            const parejaData = response.data.find(p => Number(p.nParejaID) === id);
            const datosValidados = validarDatosParejaResultados(parejaData); // Usar validación externa

            console.log("Estructura de parejaData:", datosValidados);

            document.getElementById("pareja-id-info").textContent = datosValidados.nParejaID;
            document.getElementById("participante1").textContent = datosValidados.nombreParticipante1;
            document.getElementById("participante2").textContent = datosValidados.nombreParticipante2;
            document.getElementById("categoria").textContent = datosValidados.categoriaNombre;
            document.getElementById("estilo").textContent = datosValidados.estiloNombre;
        } else {
            alert(`No se encontró información para el ID "${id}".`);
        }
    } catch (err) {
        console.error("Error al buscar pareja para evaluación:", err);
        alert(`Error: ${err.message}`);
    }
}


async function buscarCategoria() {
    try {
        console.log(" Ejecutando buscarCategoria...");
        const nIDCategoria = document.querySelector("#nIDCategoria")?.value.trim();

        //  Validar ID antes de enviar la solicitud
        validarIDCategoria(nIDCategoria);

        const response = await window.api.buscarCategoriaPorID(nIDCategoria);

        if (response.success) {
            console.log("Categoría encontrada:", response.data);
            mostrarResultados(response.data, "resultadosBusquedaCategorias");
        } else {
            alert(`${response.message}`);
        }
    } catch (err) {
        console.error("Error al buscar categoría:", err);
        alert(`Error: ${err.message}`);
    }
}


async function buscarEstilo() {
    try {
        console.log(" Ejecutando buscarEstilo...");
        const nEstiloID = document.querySelector("#nEstiloID")?.value.trim();

        //  Validar ID antes de enviar la solicitud
        validarIDEstilo(nEstiloID);

        const response = await window.api.buscarEstiloPorID(nEstiloID);

        if (response.success) {
            console.log("Estilo encontrado:", response.data);
            mostrarResultados(response.data, "resultadosBusquedaEstilos");
        } else {
            alert(`${response.message}`);
        }
    } catch (err) {
        console.error("Error al buscar estilo:", err);
        alert(`Error: ${err.message}`);
    }
}

// Función para modificar una pareja
// async function modificarPareja() {
//     try {
//         console.log("Ejecutando modificarPareja...");

//         const inputFoto = document.getElementById("fotoMasculinoUpdate");
//         let oFoto = null;

//         if (inputFoto.files.length > 0) {
//             const file = inputFoto.files[0];

//             if (!file.path) {
//                 console.error("La imagen seleccionada no tiene una ruta válida.");
//                 alert("Debes seleccionar una imagen válida.");
//                 return;
//             }

//             const rutaDestino = `C:/Proyecto/uploads/${file.name}`;
//             const resultado = await window.api.guardarImagen(file.path, rutaDestino);

//             if (resultado.success) {
//                 oFoto = resultado.ruta;
//             } else {
//                 console.error("Error al guardar la imagen:", resultado.error);
//                 alert("No se pudo guardar la imagen correctamente.");
//                 oFoto = null;
//             }
//         }


//         // Capturar los datos del formulario
//         const datos = {
//             nParejaID: document.getElementById("nParejaID").value.trim(),
//             oFoto: oFoto ?? null, // Ahora `oFoto` se inicializa correctamente
//             dNacimiento: document.getElementById("fechaNacimientoMasculinoUpdate").value.trim(),
//             ISexo: "M",
//             nTelefono: document.getElementById("telefonoMasculinoUpdate").value.trim(),
//             cNombre: document.getElementById("nombreMasculinoUpdate").value.trim(),
//             cApellido: document.getElementById("apellidoMasculinoUpdate").value.trim(),
//             cEmail: document.getElementById("emailMasculinoUpdate").value.trim(),
//             cNombreM: document.getElementById("nombreFemeninoUpdate").value.trim(),
//             cApellidoM: document.getElementById("apellidoFemeninoUpdate").value.trim(),
//             dNacimientoM: document.getElementById("fechaNacimientoFemeninoUpdate").value.trim(),
//             nTelefonoM: document.getElementById("telefonoFemeninoUpdate").value.trim(),
//             cEmailM: document.getElementById("emailFemeninoUpdate").value.trim(),
//         };

//         console.log("Enviando solicitud de actualización con datos:", datos);
//         const response = await window.api.actualizarPareja(datos);

//         if (response.success) {
//             alert("Pareja actualizada exitosamente.");
//         } else {
//             alert("Error al actualizar pareja: " + response.message);
//         }
//     } catch (err) {
//         console.error("Error al actualizar pareja:", err);
//         alert("Error: " + err.message);
//     }
// }

async function modificarPareja() {
    try {
        const nParejaID = document.getElementById("nParejaID").value.trim();
        if (!nParejaID) {
            alert("El ID de la pareja es obligatorio");
            return;
        }

        // --- Guardar imagen masculina si hay nueva ---
        let oFotoMasculino = document.getElementById("fotoMasculinoActual")?.value || null;
        const inputFotoMasculino = document.getElementById("fotoMasculinoUpdate");
        if (inputFotoMasculino.files.length > 0) {
            const file = inputFotoMasculino.files[0];
            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const rutaDestino = `uploads/${fileName}`;
            const arrayBuffer = await file.arrayBuffer();
            const resultado = await window.api.guardarImagenBuffer(arrayBuffer, rutaDestino);
            if (resultado.success) {
                oFotoMasculino = rutaDestino;
            } else {
                alert(`Error al guardar imagen masculina: ${resultado.error}`);
                return;
            }
        }

        // --- Guardar imagen femenina si hay nueva ---
        let oFotoFemenino = document.getElementById("fotoFemeninoActual")?.value || null;
        const inputFotoFemenino = document.getElementById("fotoFemeninoUpdate");
        if (inputFotoFemenino.files.length > 0) {
            const file = inputFotoFemenino.files[0];
            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const rutaDestino = `uploads/${fileName}`;
            const arrayBuffer = await file.arrayBuffer();
            const resultado = await window.api.guardarImagenBuffer(arrayBuffer, rutaDestino);
            if (resultado.success) {
                oFotoFemenino = rutaDestino;
            } else {
                alert(`Error al guardar imagen femenina: ${resultado.error}`);
                return;
            }
        }

        // --- Preparar datos para el update ---
        const datos = {
            nParejaID,
            // Masculino
            cNombreMasculino: document.getElementById("nombreMasculinoUpdate").value.trim(),
            cApellidoMasculino: document.getElementById("apellidoMasculinoUpdate").value.trim(),
            cEmailMasculino: document.getElementById("emailMasculinoUpdate").value.trim(),
            nTelefonoMasculino: document.getElementById("telefonoMasculinoUpdate").value.trim(),
            dNacimientoMasculino: document.getElementById("fechaNacimientoMasculinoUpdate").value.trim(),
            oFotoMasculino,
            // Femenino
            cNombreFemenino: document.getElementById("nombreFemeninoUpdate").value.trim(),
            cApellidoFemenino: document.getElementById("apellidoFemeninoUpdate").value.trim(),
            cEmailFemenino: document.getElementById("emailFemeninoUpdate").value.trim(),
            nTelefonoFemenino: document.getElementById("telefonoFemeninoUpdate").value.trim(),
            dNacimientoFemenino: document.getElementById("fechaNacimientoFemeninoUpdate").value.trim(),
            oFotoFemenino
        };

        console.log("Enviando solicitud de actualización con datos:", datos);
        const response = await window.api.actualizarParejaCompleta(datos);

        if (response.success) {
            alert("Pareja actualizada exitosamente.");
            // Recargar datos si es necesario
        } else {
            alert("Error al actualizar pareja: " + response.error);
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}




// Crear un usuario
async function crearUsuario() {
    try {
        console.log("Ejecutando crearUsuario...");

        // Capturar los datos del formulario
        const nUsuarioID = document.getElementById("nuevoID").value.trim(); // ID manual del usuario
        const cNombreUsuario = document.getElementById("nuevoUsuario").value.trim();
        const cContrasena = document.getElementById("nuevaContrasena").value.trim();
        const esAdmin = document.getElementById("esAdmin").checked; // Checkbox de administrador
        const esJuez = document.getElementById("juez")?.checked || false; // Checkbox de juez

        // Validar que el ID sea un número positivo
        if (!nUsuarioID || isNaN(nUsuarioID) || parseInt(nUsuarioID) <= 0) {
            alert("Debes ingresar un ID de usuario válido (número positivo).");
            return;
        }

        // Determinar el rol basado en los checkboxes
        let rol = "user"; // Valor por defecto
        if (esAdmin) rol = "admin";
        if (esJuez) rol = "juez"; // Si es juez, sobrescribe "admin"

        // Validar los datos
        validarDatosUsuario({ nUsuarioID, cNombreUsuario, cContrasena, rol });

        // Realizar la solicitud al backend
        const response = await window.api.crearUsuario({ nUsuarioID, cNombreUsuario, cContrasena, rol });

        if (response.success) {
            alert("Usuario creado con éxito, ID: " + response.id);
            document.getElementById("nuevoID").value = "";
            document.getElementById("nuevoUsuario").value = "";
            document.getElementById("nuevaContrasena").value = "";
            document.getElementById("esAdmin").checked = false;
            if (document.getElementById("juez")) document.getElementById("juez").checked = false;
        } else {
            alert("Error al crear usuario: " + response.error);
        }
    } catch (err) {
        console.error("Error al crear usuario:", err);
        alert(`${err.message}`);
    }
}

async function crearJuez() {
    try {
        console.log("Ejecutando crearJuez...");

        // Capturar los datos específicos del juez
        const nUsuarioID = document.getElementById("nuevoJuezID").value.trim(); // Se mantiene igual
        const cNombreUsuario = document.getElementById("nuevoJuezUsuario").value.trim();
        const cContrasena = document.getElementById("nuevoJuezContrasena").value.trim();
        const esJuez = document.getElementById("juez").checked; // Checkbox para jueces

        // Validar que el ID sea un número positivo
        if (!nUsuarioID || isNaN(nUsuarioID) || parseInt(nUsuarioID) <= 0) {
            alert("Debes ingresar un ID de usuario válido (número positivo).");
            return;
        }

        // Definir el rol correctamente
        let rol = "user"; // Por defecto es "user"
        if (esJuez) rol = "juez"; // Si se marca el checkbox de juez, asignar "juez"

        // Validar los datos
        validarDatosUsuario({ nUsuarioID, cNombreUsuario, cContrasena, rol });

        // Realizar la solicitud al backend
        const response = await window.api.crearUsuario({ nUsuarioID, cNombreUsuario, cContrasena, rol });

        if (response.success) {
            alert("Juez creado con éxito, ID: " + response.id);
            document.getElementById("nuevoID").value = "";
            document.getElementById("nuevoJuezUsuario").value = "";
            document.getElementById("nuevoJuezContrasena").value = "";
            document.getElementById("juez").checked = false;
        } else {
            alert("Error al crear juez: " + response.error);
        }
    } catch (err) {
        console.error("Error al crear juez:", err);
        alert(`${err.message}`);
    }
}

// document.getElementById("btnCrearUsuario").addEventListener("click", async () => {
//     try {
//         const cNombreUsuario = document.getElementById("nuevoUsuario").value;
//         const cContrasena = document.getElementById("nuevaContrasena").value;
//         const esAdmin = document.getElementById("esAdmin").checked;

//         if (!cNombreUsuario || !cContrasena) {
//             alert("Completa todos los campos.");
//             return;
//         }

//         const response = await window.api.crearUsuario({ cNombreUsuario, cContrasena, esAdmin });

//         if (response.success) {
//             alert("Usuario creado con éxito, ID: " + response.id);
//         } else {
//             alert("Error al crear usuario: " + response.error);
//         }
//     } catch (err) {
//         console.error("Error al crear usuario:", err);
//         alert("Error interno.");
//     }
// });

// Eliminar un usuario
async function eliminarUsuario() {
    try {
        console.log("Ejecutando eliminarUsuario...");

        const cNombreUsuario = document.getElementById("usuarioEliminar")?.value.trim();
        console.log(` Valor ingresado: '${cNombreUsuario}'`);

        if (!cNombreUsuario || cNombreUsuario.length < 3) {
            alert("Debes ingresar un nombre de usuario válido (mínimo 3 caracteres).");
            return;
        }

        validarDatosEliminarUsuario({ cNombreUsuario });

        //  Consultar el rol antes de eliminar
        console.log(`Consultando rol del usuario: '${cNombreUsuario}'`);
        const rolUsuarioAEliminar = await window.api.obtenerRolUsuario(cNombreUsuario);
        console.log(`Rol obtenido: '${rolUsuarioAEliminar}'`);

        if (!rolUsuarioAEliminar) {
            alert("Usuario no encontrado.");
            return;
        }

        //  Crear el mensaje de confirmación dinámico
        const confirmacion = confirm(`¿Estás seguro de que deseas eliminar a "${cNombreUsuario}" (${rolUsuarioAEliminar})?`);
        if (!confirmacion) return;

        //  Enviar solicitud de eliminación
        console.log(`Eliminando usuario: '${cNombreUsuario}'`);
        const response = await window.api.eliminarUsuario(cNombreUsuario);
        console.log(` Respuesta del backend:`, response);

        if (response.success) {
            alert(`${rolUsuarioAEliminar} eliminado con éxito.`);
            document.getElementById("usuarioEliminar").value = ""; 
        } else {
            alert(`${response.message}`);
        }
    } catch (err) {
        console.error("Error al eliminar usuario:", err.message);
        alert(`${err.message}`);
    }
}






// Eliminar una pareja
async function eliminarPareja() {
    try {
        console.log("Ejecutando eliminarPareja...");

        // Capturar el ID de la pareja desde el formulario
        const nParejaID = document.getElementById("nParejaID").value.trim();

                if (!nParejaID || nParejaID === "") {
            alert("Error: Debes ingresar un ID válido antes de eliminar.");
            return;
        }

        console.log("ID de pareja a eliminar:", nParejaID);

        // Validar el ID
        validarIDPareja(nParejaID);

        // Confirmar la eliminación
        const confirmacion = confirm("¿Estás seguro de que deseas eliminar esta pareja?");
        if (!confirmacion) return;

        // Realizar la solicitud al backend
        const response = await window.api.eliminarPareja(nParejaID);

        if (response.success) {
    alert("Pareja eliminada con éxito.");
    document.getElementById("nParejaID").value = "";
} else {
    // Muestra el mensaje si existe, si no, muestra el error
    alert(`${response.message || response.error || "Ocurrió un error inesperado."}`);
}
    } catch (err) {
        console.error("Error al eliminar pareja:", err);
        alert(`${err.message}`);
    }
}


// document.getElementById("btnGenerarPDF").addEventListener("click", async () => {
//     try {
//         const response = await window.api.generarPDFParejas();

//         if (response.success) {
//             alert(`PDF generado con éxito. Ruta: ${response.ruta}`);
//             console.log("PDF generado en:", response.ruta);
//         } else {
//             alert(`Error al generar el PDF: ${response.error}`);
//         }
//     } catch (err) {
//         console.error("Error al generar el PDF:", err);
//         alert("Error interno al generar el PDF.");
//     }
// });

document.getElementById("btnGuardarConfigBaseDatos")?.addEventListener("click", async () => {
    const nuevaConfig = {
        host: document.getElementById("HostBaseDatos").value,
        user: document.getElementById("UsuarioBaseDatos").value,
        password: document.getElementById("ContrasenaBaseDatos").value,
        database: document.getElementById("database").value
    };

    console.log("Enviando nueva configuración:", nuevaConfig);

    const response = await window.api.guardarConfiguracion(nuevaConfig);

    if (response.success) {
        alert("Configuración guardada correctamente. Reinicia la app para aplicar cambios.");
    } else {
        alert(`Error al guardar configuración: ${response.error}`);
    }
});


// ipcRenderer.on("generar-pdf", async () => {
//     try {
//         console.log("Generación de PDF solicitada desde el menú");

//         const response = await window.api.generarPDFParejas();

//         if (response.success) {
//             alert(`PDF generado con éxito. Ruta: ${response.ruta}`);
//             console.log("PDF generado en:", response.ruta);
//         } else {
//             alert(`Error al generar el PDF: ${response.error}`);
//             console.error("Error:", response.error);
//         }
//     } catch (err) {
//         console.error("Error al generar el PDF:", err);
//         alert("Error interno al generar el PDF.");
//     }
// });

