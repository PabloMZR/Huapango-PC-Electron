# Primer arranque y recuperación de configuración

## Uso

1. Ejecutar `npm.cmd start` desde el proyecto.
2. Si no hay una conexión válida, completar servidor, puerto, usuario de MySQL,
   contraseña y nombre de la base de datos ya creada.
3. Pulsar **Comprobar y guardar**. Una contraseña incorrecta o un servidor
   inaccesible muestran un mensaje y permiten reintentar sin cambiar lo guardado.
4. Pulsar **Continuar al inicio de sesión** después de una comprobación exitosa.
5. Al volver a abrir, una configuración válida conduce directamente al login.

La comprobación abre y cierra una conexión; no crea ni modifica tablas. Acceder
a la base no garantiza que tenga todas las tablas del esquema requerido por la app.

## Archivos y compatibilidad

- Se mantiene `app.getPath('userData')/config.json`, que en esta instalación suele
  corresponder a `%APPDATA%/huapango-app/config.json`.
- Si falta, se genera con campos vacíos, servidor `127.0.0.1` y puerto `3306`.
- Desarrollo y paquete instalado usan la misma inicialización. No se copia la
  configuración del repositorio ni una plantilla con credenciales.
- Una configuración previa válida no se modifica al arrancar. El formato antiguo
  sin `port` sigue funcionando con `3306`.
- Un JSON dañado o datos incompatibles permiten volver al formulario. Al guardar
  una conexión comprobada se conserva el archivo anterior como `config.json.backup-*`.
- La escritura utiliza un archivo temporal y un reemplazo, evitando truncar la
  configuración anterior si la escritura falla. No es una garantía frente a todos
  los escenarios de corte de energía; los respaldos operativos siguen pendientes.
- El archivo local `config.json` y sus variantes quedan excluidos del empaquetado.

Las credenciales locales mantienen el formato JSON previo; aún no se cifra la
contraseña en disco. El archivo y sus copias deben tratarse como sensibles. La
integración con el almacén de credenciales de Windows queda pendiente antes de
distribuir el producto. La contraseña guardada no se devuelve al formulario ni
se registra en los mensajes de este flujo.

## Sesión y conexión

- `db.js` no realiza I/O ni crea un pool al importarse. El arranque valida la
  configuración y prueba MySQL antes de crear el pool.
- Las conexiones de prueba tienen un tiempo de conexión de 5 segundos. Esto no
  introduce un límite al tiempo de ejecución de las consultas SQL posteriores.
- Guardar no reinicia la aplicación ni cierra el formulario antes de recibir la
  respuesta. Continuar comprueba otra vez la conexión y abre el login.
- Cerrar la última ventana termina la aplicación; no provoca un relanzamiento.
- `sesionModel.js` conserva ID y rol solo en memoria. El login no escribe sobre
  las credenciales MySQL. Al cambiar de conexión se cierra la sesión anterior.
- Obtener/guardar configuración y continuar se aceptan solo desde la vista local
  de configuración. Esto no sustituye la futura autorización por roles del servidor.

## Verificación

`npm.cmd test` verifica configuración ausente, datos previos, JSON dañado,
fallo de escritura, validación de campos, conexión rechazada, liberación de
conexiones, sesión, navegación y comportamiento del formulario. Usa archivos
temporales reales y dobles de MySQL/Electron; no necesita una base instalada.

Pendiente en la PC del desarrollador: probar el formulario con su MySQL real,
login con su esquema y el instalador final en un Windows limpio. Las pruebas
automatizadas no validan el foco nativo de Windows ni el problema original de
congelamiento de consultas. Las actualizaciones de seguridad de las dependencias
son una tarea separada y no se han aplicado en este cambio.
