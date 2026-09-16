# Registro de parejas: avisos y borrador temporal

## Comportamiento

- Los errores y éxitos del registro, categoría, estilo y PDF se muestran dentro
  de la pantalla. No se utilizan `alert()` ni `confirm()` en este módulo.
- Un campo obligatorio vacío se señala y recibe el foco. Los otros campos y
  las fotos seleccionadas permanecen en el formulario.
- El menú espera a conservar el borrador antes de cambiar de módulo. Si falla,
  permanece en registro y muestra un mensaje; no descarta el formulario.
- Al volver a Registro se recuperan campos, selecciones y fotos. El borrador
  también conserva si la pareja, categoría y estilo ya se guardaron en MySQL.
- Mientras se guarda se bloquean operaciones duplicadas y cambios de módulo.
- Después de guardar la pareja, sus campos quedan bloqueados para evitar
  reinsertarla accidentalmente. Categoría y estilo utilizan el ID confirmado.
- **Nueva pareja** abre una confirmación dentro de la página. Aceptarla vacía
  el formulario y descarta el borrador, sin borrar registros de MySQL.

## Alcance del borrador

Se conserva en memoria del proceso principal, aislado por ventana. Las fotos
se transfieren como bytes por IPC y se reconstruyen al regresar a la vista.
Solo la página local de Registro, en el frame principal, puede acceder a estos
canales. No se almacenan borradores en archivos ni en la base de datos.

**No es un respaldo:** cerrar la ventana/aplicación, reiniciarla, cambiar de
conexión cerrando la ventana o una caída del proceso puede perder el borrador.
La protección está destinada a navegar entre módulos de la misma ventana.
Los datos que se perdieron antes de esta corrección no se recuperan por instalarla.
La conservación temporal de fotos no cambia su mecanismo previo de registro
en MySQL: este cambio no implementa un almacén definitivo de imágenes.

## Comprobación manual

Reiniciar completamente la aplicación con `npm.cmd start`, ya que se agregaron
canales IPC en main y preload. Usar datos ficticios y una base de prueba:

1. Completar una pareja, seleccionar una foto y dejar un correo vacío.
2. Pulsar Guardar: debe aparecer el aviso en la página y poder escribirse el correo.
3. Antes de guardar, ir a Búsqueda y regresar a Registro: comprobar campos y foto.
4. Corregir el correo y guardar: comprobar el ID y los formularios de categoría/estilo.
5. Navegar y regresar: la pareja debe seguir marcada como guardada, sin duplicarse.
6. Pulsar Nueva pareja y cancelar: conservar el formulario. Aceptar después y
   verificar que queda listo para otra pareja.

Las pruebas automatizadas de `tests/registroParejas.test.cjs` cubren estos estados,
errores de IPC y aislamiento entre ventanas usando dobles de DOM y MySQL.
La interacción nativa de Windows se confirma con la comprobación manual.
