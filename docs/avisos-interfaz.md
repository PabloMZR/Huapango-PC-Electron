# Avisos y confirmaciones dentro de la aplicación

Los flujos de administración, modificación de parejas, categorías/estilos,
evaluación y PDF usan `Public/js/avisos.js`. Los mensajes aparecen en una banda
inferior que se puede ocultar, sin abrir `window.alert()` ni quitar el foco al
campo activo. Las búsquedas y el registro conservan sus avisos propios.

Las eliminaciones esperan una confirmación con un `<dialog>` HTML. Cancelar,
Escape o cerrar la vista no autorizan el borrado. El foco inicial está en
Cancelar. Solo Eliminar permite enviar la solicitud correspondiente.

Mientras una acción está pendiente se deshabilitan temporalmente los campos y
botones de esa vista, incluida su navegación. Al finalizar se restauran sus
estados anteriores. Esto evita dobles clics concurrentes y cambios al registro
que se está confirmando; no sustituye las restricciones de la base de datos.
Los errores no limpian los campos. Las altas/bajas exitosas conservan el
comportamiento de limpieza de sus campos.

## Comprobación manual en Electron

Reiniciar con `npm.cmd start` y usar datos de prueba:

1. Administración: crear un usuario dejando contraseña vacía. Corregir el
   campo después del aviso y comprobar que recibe teclado sin cambiar de vista.
2. Eliminar usuario/pareja: probar Cancelar y Escape. El registro debe seguir
   existiendo y el campo debe conservar su valor. Confirmar Eliminar solamente
   con registros desechables; comprobar también el resultado en una búsqueda.
3. Modificar pareja: enviar sin ID. Corregir y seguir escribiendo sin perder los
   datos existentes.
4. Evaluación: buscar una pareja, escribir un comentario de más de 255 caracteres,
   intentar guardar, corregir y reintentar. Verificar que los puntajes permanecen.
5. Generar PDF: comprobar éxito y cancelación del selector de archivo; después
   continuar escribiendo en la misma vista.
6. Repetir con doble clic y con la ventana reducida: debe haber una sola acción
   pendiente y la banda de aviso debe poder ocultarse.

`npm.cmd test` incluye regresiones de cancelación, confirmación, doble clic,
fallos IPC y conservación de campos. Usan un DOM simulado y no sustituyen la
comprobación del teclado real en Electron. No eliminan datos de MySQL.

Este cambio no añade persistencia de borradores a otros módulos ni conserva
datos al cerrar la aplicación. Tampoco cambia los selectores nativos de archivos
o los diálogos del proceso principal para errores de arranque.
