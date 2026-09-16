# Actualización de dependencias — 15 de septiembre de 2026

## Cambios

| Dependencia | Antes | Versión instalada |
| --- | --- | --- |
| mysql2 | 3.14.0 | 3.24.4 |
| electron | 34.2.0 | 44.4.0 |
| electron-builder | 24.13.3 | 26.15.3 |
| electron-reload | 2.0.0-alpha.1 | Retirada: no se utilizaba en el código |

Se actualizaron `package.json` y `package-lock.json` con npm, sin usar
`npm audit fix --force` ni sobrescribir dependencias internas mediante `overrides`.
La actualización de electron-builder incorpora `tar` 7.5.22 y
`builder-util-runtime` 9.7.0. Retirar electron-reload elimina la cadena antigua
de chokidar/picomatch que seguía reportando una alerta.

La auditoría completa de npm pasó de **12 paquetes señalados (11 high y 1 critical)**
a **0 vulnerabilidades reportadas** en esta fecha. La cuenta incluye dependencias
indirectas; no equivale al número de fallos independientes. El resultado depende
del catálogo de avisos de npm y no sustituye una revisión del código de la app.

## Requisitos del equipo de desarrollo

- Node.js 22.12.0 o posterior; se verificó con Node.js 24.18.0 y npm 11.16.0.
- Windows de 64 bits para esta versión de Electron. El paquete se comprobó para x64.
- MySQL con el esquema del proyecto para ejecutar los flujos reales.
- Acceso a Internet al instalar dependencias y descargar Electron/herramientas de build.

Desde el directorio del proyecto:

```powershell
npm.cmd ci
npm.cmd exec --no -- install-electron
npm.cmd test
npm.cmd audit
npm.cmd start
```

Electron 42 y posteriores descargan el ejecutable al utilizar el paquete si aún
no está disponible, en lugar de hacerlo con un script postinstall. El comando
`install-electron` permite descargarlo por adelantado. La aplicación empaquetada
ya incluye Electron: el usuario final no necesita Node.js ni npm.

Para generar un instalador local sin publicar:

```powershell
npm.cmd run build -- --win --x64 --publish never
```

## Verificación realizada

- Las 30 pruebas automatizadas existentes pasaron después de actualizar.
- MySQL local: autenticación, consultas preparadas con número/texto/NULL,
  cinco consultas concurrentes y reutilización del pool después de un error SQL.
- Consulta real `buscarParejaParaEvaluacion`, incluidos JOIN y parámetro.
  Las comprobaciones fueron de solo lectura, sin insertar ni modificar registros.
- Auditoría completa, incluidas herramientas de desarrollo: 0 vulnerabilidades.
- electron-builder generó el instalador NSIS x64 y el archivo blockmap con éxito.
  Se usó el ejecutable Electron descargado y una carpeta temporal de salida fuera
  del repositorio. No se publicó ni se instaló el artefacto de prueba.

## Validación pendiente

La prueba gráfica automatizada con perfil aislado no finalizó: Electron registró
un fallo del proceso GPU (`exit_code=-1073741515`) y el proceso de prueba se detuvo
por tiempo de espera. No se desactivó el sandbox de Chromium. El empaquetado y las
pruebas de lógica no permiten confirmar que la interfaz funciona correctamente.

Antes de distribuir, ejecutar en una sesión normal de Windows:

1. `npm.cmd start`: comprobar configuración/inicio de sesión.
2. Consultar un participante, abrir las ventanas habituales y generar un PDF.
3. Probar instalación y primer arranque en un Windows limpio de 64 bits.

Estos parches no demuestran que esté resuelto el bloqueo original de la interfaz.
El cifrado de credenciales y la autorización de operaciones siguen siendo tareas
independientes de la auditoría de dependencias.

## Fuentes

- [mysql2 3.24.4](https://github.com/sidorares/node-mysql2/releases/tag/v3.24.4)
- [Aviso de autenticación mysql2](https://github.com/advisories/GHSA-3f6p-5ww8-9rcr)
- [Aviso de compresión mysql2](https://github.com/advisories/GHSA-rgwj-5xj2-c3m3)
- [Cambios incompatibles de Electron](https://www.electronjs.org/docs/latest/breaking-changes)
