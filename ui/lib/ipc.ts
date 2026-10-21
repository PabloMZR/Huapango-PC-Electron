/**
 * Helper seguro para comunicación IPC con Electron.
 * Si la app corre dentro de Electron, invoca window.api; si corre en navegador web estándar,
 * utiliza simulación en memoria para no romper la interfaz.
 */

declare global {
  interface Window {
    api?: {
      guardarEventoCompleto?: (payload: any) => Promise<any>;
      obtenerEventos?: () => Promise<any[]>;
      obtenerEventoDetalle?: (nEventoID: number) => Promise<any>;
      registrarParticipanteModular?: (datos: any) => Promise<any>;
      actualizarParticipanteModular?: (nParticipanteID: number, datos: any) => Promise<any>;
      eliminarParticipanteModular?: (nParticipanteID: number) => Promise<any>;
      buscarParticipantePorIDoFolio?: (termino: string) => Promise<any[]>;
      obtenerParticipantesPorCategoria?: (nCategoriaID: number) => Promise<any[]>;
      obtenerTodosLosParticipantes?: () => Promise<any[]>;
      generarSiguienteFolio?: (nCategoriaID: number) => Promise<string>;
      guardarEvaluacionDinamica?: (datos: any) => Promise<any>;
      obtenerResultadosCategoria?: (nCategoriaID: number) => Promise<any>;
      getUserRole?: () => Promise<string>;
      getUsuarioID?: () => Promise<number | null>;
      obtenerConfiguracion?: () => Promise<any>;
      guardarConfiguracion?: (config: any) => Promise<any>;
      obtenerUsuarios?: () => Promise<any[]>;
      crearUsuario?: (datos: any) => Promise<any>;
      eliminarUsuario?: (cNombreUsuario: string, tipoPermitido?: string) => Promise<any>;
      guardarImagen?: (origen: string, destino: string) => Promise<any>;
      guardarImagenBuffer?: (buffer: any, destino: string) => Promise<any>;
      generarPDFParejas?: () => Promise<any>;
      generarPDFResultados?: () => Promise<any>;
      generarPDFCategorias?: () => Promise<any>;
      cerrarSesionActual?: () => Promise<any>;
    };
  }
}

export const isElectron = typeof window !== 'undefined' && Boolean(window.api);

export async function apiGuardarEvento(payload: any) {
  if (isElectron && window.api?.guardarEventoCompleto) {
    return await window.api.guardarEventoCompleto(payload);
  }
  console.log('[Web/Mock] Evento simulado guardado:', payload);
  return { success: true, nEventoID: 1 };
}

export async function apiObtenerEventos(): Promise<any[]> {
  if (isElectron && window.api?.obtenerEventos) {
    return await window.api.obtenerEventos();
  }
  return [];
}

export async function apiObtenerEventoDetalle(nEventoID: number) {
  if (isElectron && window.api?.obtenerEventoDetalle) {
    return await window.api.obtenerEventoDetalle(nEventoID);
  }
  return null;
}

export async function apiRegistrarParticipante(datos: {
  nCategoriaID: number;
  cNombreRepresentativo: string;
  cIdentificador?: string;
  jMetadatos?: any;
  cFotoUrl?: string | null;
}) {
  if (isElectron && window.api?.registrarParticipanteModular) {
    return await window.api.registrarParticipanteModular(datos);
  }
  console.log('[Web/Mock] Participante simulado:', datos);
  return {
    success: true,
    nParticipanteID: Date.now(),
    cIdentificador: datos.cIdentificador || `FOLIO-C${datos.nCategoriaID}-${Math.floor(Math.random() * 900 + 100)}`,
    cNombreRepresentativo: datos.cNombreRepresentativo,
    cFotoUrl: datos.cFotoUrl
  };
}

export async function apiActualizarParticipante(nParticipanteID: number, datos: any) {
  if (isElectron && window.api?.actualizarParticipanteModular) {
    return await window.api.actualizarParticipanteModular(nParticipanteID, datos);
  }
  console.log('[Web/Mock] Actualizar participante:', nParticipanteID, datos);
  return { success: true };
}

export async function apiEliminarParticipante(nParticipanteID: number) {
  if (isElectron && window.api?.eliminarParticipanteModular) {
    return await window.api.eliminarParticipanteModular(nParticipanteID);
  }
  console.log('[Web/Mock] Eliminar participante:', nParticipanteID);
  return { success: true };
}

export async function apiBuscarParticipante(termino: string) {
  if (isElectron && window.api?.buscarParticipantePorIDoFolio) {
    return await window.api.buscarParticipantePorIDoFolio(termino);
  }
  return [];
}

export async function apiObtenerParticipantes(nCategoriaID: number) {
  if (isElectron && window.api?.obtenerParticipantesPorCategoria) {
    return await window.api.obtenerParticipantesPorCategoria(nCategoriaID);
  }
  return [];
}

export async function apiObtenerTodosLosParticipantes() {
  if (isElectron && window.api?.obtenerTodosLosParticipantes) {
    return await window.api.obtenerTodosLosParticipantes();
  }
  return [];
}

export async function apiGenerarSiguienteFolio(nCategoriaID: number) {
  if (isElectron && window.api?.generarSiguienteFolio) {
    return await window.api.generarSiguienteFolio(nCategoriaID);
  }
  return `FOL-C${nCategoriaID}-${Math.floor(Math.random() * 900 + 100)}`;
}

export async function apiGuardarEvaluacion(datos: {
  nCategoriaID: number;
  nParticipanteID: number;
  nJuezID: number;
  calificaciones: Array<{ nCriterioID: number; nPuntajeOtorgado: number; cNotaCriterio?: string }>;
  cObservaciones?: string;
}) {
  if (isElectron && window.api?.guardarEvaluacionDinamica) {
    return await window.api.guardarEvaluacionDinamica(datos);
  }
  console.log('[Web/Mock] Evaluación guardada:', datos);
  return { success: true };
}

export async function apiObtenerResultados(nCategoriaID: number) {
  if (isElectron && window.api?.obtenerResultadosCategoria) {
    return await window.api.obtenerResultadosCategoria(nCategoriaID);
  }
  return { criterios: [], participantes: [] };
}

export async function apiObtenerUsuarios() {
  if (isElectron && window.api?.obtenerUsuarios) {
    return await window.api.obtenerUsuarios();
  }
  return [];
}

export async function apiCrearUsuario(datos: { cNombreUsuario: string; cContrasena: string; rol: string }) {
  if (isElectron && window.api?.crearUsuario) {
    return await window.api.crearUsuario(datos);
  }
  return { success: true, id: Date.now() };
}

export async function apiEliminarUsuario(username: string) {
  if (isElectron && window.api?.eliminarUsuario) {
    return await window.api.eliminarUsuario(username);
  }
  return { success: true };
}

export async function apiGuardarImagenBuffer(buffer: ArrayBuffer | Uint8Array, destino: string) {
  if (isElectron && window.api?.guardarImagenBuffer) {
    return await window.api.guardarImagenBuffer(buffer, destino);
  }
  return { success: true, ruta: destino };
}

export async function apiGenerarPDF(tipo: 'parejas' | 'resultados' | 'categorias') {
  if (isElectron) {
    if (tipo === 'parejas' && window.api?.generarPDFParejas) return await window.api.generarPDFParejas();
    if (tipo === 'resultados' && window.api?.generarPDFResultados) return await window.api.generarPDFResultados();
    if (tipo === 'categorias' && window.api?.generarPDFCategorias) return await window.api.generarPDFCategorias();
  }
  alert(`Reporte PDF (${tipo}) generado.`);
  return { success: true };
}

export async function apiObtenerConfiguracion() {
  if (isElectron && window.api?.obtenerConfiguracion) {
    return await window.api.obtenerConfiguracion();
  }
  return { success: true, data: { host: 'localhost', port: 3306, user: 'root', database: 'huapango_db' } };
}

export async function apiGuardarConfiguracion(config: any) {
  if (isElectron && window.api?.guardarConfiguracion) {
    return await window.api.guardarConfiguracion(config);
  }
  return { success: true };
}

export async function apiCerrarSesion() {
  if (isElectron && window.api?.cerrarSesionActual) {
    return await window.api.cerrarSesionActual();
  }
  window.location.reload();
  return { success: true };
}

export async function apiGetUserRole(): Promise<string> {
  if (isElectron && window.api?.getUserRole) {
    return await window.api.getUserRole();
  }
  return 'admin';
}

export async function apiGetUsuarioID(): Promise<number | null> {
  if (isElectron && window.api?.getUsuarioID) {
    return await window.api.getUsuarioID();
  }
  return 1;
}
