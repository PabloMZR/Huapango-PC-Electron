# Búsqueda de parejas para evaluación

## Cambio

Antes, Resultados solicitaba todas las parejas con sus categorías y estilos y
buscaba el ID en JavaScript. Ahora solicita únicamente el ID seleccionado, con
un parámetro SQL (`WHERE p.nParejaID = ?`). Conserva los mismos nombres de campos
y los `LEFT JOIN`, incluyendo parejas sin categoría o estilo.

No se cambian tablas, el motor MySQL ni los canales existentes de búsqueda o
listado. No se necesita instalar una dependencia para ejecutar estas pruebas.

## Responsabilidades

- `Public/js/busquedaEvaluacion.js`: eventos y presentación de estados de la vista.
- `preload.js`: expone una operación concreta por IPC.
- `main.js`: registra el canal `buscar-pareja-para-evaluacion`.
- `Controladores/parejaController.js`: valida el ID y convierte resultados y fallos
  en respuestas `{ success, data }` o `{ success, code, message }`.
- `Modelos/parejaModel.js`: consulta parametrizada y proyección de campos.
- `db.js`: adquisición, ejecución y liberación de conexiones, sin cambios.

La vista evita solicitudes simultáneas de búsqueda, informa del estado sin
`alert()`, limpia la ficha previa y habilita Guardar Evaluación solamente cuando
la búsqueda tiene éxito. Editar el ID invalida la selección anterior.

Este es un primer ajuste del flujo MVC, no una auditoría completa. Siguen pendientes
la separación de sesión/configuración, el contrato de actualización de parejas y
las transacciones de varias consultas. La API para clientes por red será otra etapa.

## Verificación sin MySQL

Ejecutar `npm test` con Node.js 22 o posterior. Las pruebas usan el ejecutor incluido
en Node y sustituyen MySQL y Electron por dobles de prueba. Cubren el SQL emitido,
validación, resultado ausente, errores, conexiones IPC y estados de la vista.
La interfaz se prueba con elementos simulados; no se verifica el foco nativo de Windows.

## Verificación pendiente con la base instalada

1. Iniciar la aplicación y abrir Resultados. Guardar Evaluación debe estar deshabilitado.
2. Buscar un ID existente y comprobar nombres, categoría y estilo.
3. Buscar un ID sin categoría/estilo: deben aparecer los textos predeterminados.
4. Buscar un ID inexistente y uno inválido: debe mostrarse el mensaje y limpiarse la ficha.
5. Repetir clics mientras hay una búsqueda pendiente: debe enviarse una sola solicitud.
6. Provocar un error de consulta en un entorno de prueba y verificar que permite volver a buscar.
7. Confirmar que búsquedas generales y generación de PDF conservan su comportamiento.
8. Revisar `EXPLAIN` e índices de `nParejaID` en participantes, categorías y estilos
   antes de proponer una migración. No se crean índices sin conocer el esquema real.

El cambio reduce las filas transferidas, pero no demuestra que se haya corregido
el bloqueo reportado ni mide su rendimiento real. Sigue pendiente medir adquisición
de conexión, tiempo SQL, IPC y presentación. No se añade un timeout de consulta:
una promesa que no termine mantiene el estado de búsqueda hasta que responda o
se cierre la vista. Resolver esa espera requiere analizar y gestionar también la
operación y conexión subyacentes.
