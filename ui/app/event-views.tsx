'use client'

import { useEffect, useMemo, useState } from 'react'
import { 
  ArrowLeft, BarChart3, CheckCircle2, Database, 
  ExternalLink, FileDown, FileText, PlayCircle, Plus, 
  Radio, Settings2, ShieldCheck, Trophy, UserCheck, 
  UserPlus, Users, X, AlertCircle, Award, Search, 
  Edit, Trash2, Camera, Upload, LogOut, Key, Check,
  ChevronRight, Image as ImageIcon
} from 'lucide-react'
import { 
  apiGuardarEvaluacion, apiObtenerEventos, 
  apiObtenerParticipantes, apiObtenerResultados, 
  apiRegistrarParticipante, apiActualizarParticipante,
  apiEliminarParticipante, apiBuscarParticipante,
  apiObtenerTodosLosParticipantes, apiGenerarSiguienteFolio,
  apiObtenerUsuarios, apiCrearUsuario, apiEliminarUsuario,
  apiGuardarImagenBuffer, apiGenerarPDF,
  apiObtenerConfiguracion, apiGuardarConfiguracion,
  apiCerrarSesion, apiGetUserRole, isElectron 
} from '../lib/ipc'

export type Phase = { id: string; name: string; type: string; categories: number; judges: number }
export type Category = { id: string; name: string; phase: string; participant: string; criteria: number; nCategoriaID?: number }
export type Criterion = { id: string; name: string; weight: number; scale: string; nCriterioID?: number }
export type EventData = { eventName: string; phases: Phase[]; categories: Category[]; criteria: Criterion[]; published: boolean; nEventoID?: number }

const shell = 'min-h-screen bg-[#090d14] text-slate-100 selection:bg-violet-500/30'
const card = 'rounded-2xl border border-white/8 bg-[#0d131d]'

export function EventsList({ 
  onCreate, 
  onOpen, 
  published, 
  eventName = 'L Concurso Nacional de Huapango 2026' 
}: { 
  onCreate: () => void; 
  onOpen: (evento?: any) => void; 
  published: boolean; 
  eventName?: string 
}) {
  const [eventosDB, setEventosDB] = useState<any[]>([])
  const [userRole, setUserRole] = useState<string>('admin')
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [showDbModal, setShowDbModal] = useState(false)

  useEffect(() => {
    apiObtenerEventos().then(res => {
      if (res && res.length > 0) setEventosDB(res)
    })
    apiGetUserRole().then(r => setUserRole(r || 'admin'))
  }, [])

  return (
    <div className={shell}>
      <AppHeader 
        userRole={userRole} 
        onOpenUsers={() => setShowUsersModal(true)} 
        onOpenDb={() => setShowDbModal(true)} 
      />
      <main className="mx-auto max-w-[1500px] px-5 py-9 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300">
              <Trophy className="size-3.5" /> Centro Unificado de Competencias
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Eventos & Concursos Activos</h1>
            <p className="mt-2 text-sm text-slate-500">
              Selecciona un evento para gestionar inscripciones, jueceo dinámico y generar actas oficiales en PDF.
            </p>
          </div>
          {userRole === 'admin' && (
            <button onClick={onCreate} className="flex items-center justify-center gap-2 rounded-lg bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-400">
              <Plus className="size-4" /> Crear nuevo evento
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Eventos configurados" value={String(eventosDB.length || (published ? 1 : 0))} />
          <Stat label="Rol en Sesión" value={userRole === 'admin' ? 'Administrador' : 'Juez Calificador'} />
          <Stat label="Base de Datos" value={isElectron ? 'MySQL huapango_db' : 'Web Demo'} />
        </div>

        <section className={`${card} mt-6 overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <h2 className="text-sm font-semibold">Eventos disponibles</h2>
            <span className="text-xs text-slate-500">{eventosDB.length ? `${eventosDB.length} registrados` : (published ? '1 evento' : 'Sin eventos')}</span>
          </div>

          {eventosDB.length > 0 ? (
            <div className="divide-y divide-white/5">
              {eventosDB.map((ev: any) => (
                <button key={ev.nEventoID} onClick={() => onOpen(ev)} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.03] transition">
                  <div className="flex items-center gap-4">
                    <div className="grid size-12 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                      <Trophy className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{ev.cNombre}</h3>
                        <span className="rounded-md border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-300">
                          {ev.cTipoEvento || 'Competencia'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{ev.cDescripcion || 'Evento modular multirúbrica'} · Formato {ev.cFormato || 'Presencial'}</p>
                      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                          <CheckCircle2 className="size-3.5" /> {ev.cEstado || 'Activo'}
                        </span>
                        <span>{ev.totalCategorias || 3} Categorías</span>
                        <span>{ev.totalParticipantes || 0} Participantes registrados</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-violet-300">
                    <span>Abrir panel</span>
                    <ChevronRight className="size-4" />
                  </div>
                </button>
              ))}
            </div>
          ) : published ? (
            <button onClick={() => onOpen()} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.03]">
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Trophy className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{eventName}</h3>
                  <p className="mt-1 text-xs text-slate-500">Evento configurado en memoria · Listo para jueceo</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <CheckCircle2 className="size-3.5" /> Publicado
                    </span>
                    <span>Listo para registro</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="size-4 text-slate-500" />
            </button>
          ) : (
            <div className="p-12 text-center text-sm text-slate-500">
              No hay eventos en la base de datos. Utiliza el botón "Crear nuevo evento" para modelar uno nuevo.
            </div>
          )}
        </section>
      </main>

      {showUsersModal && <UsersModal onClose={() => setShowUsersModal(false)} />}
      {showDbModal && <DbConfigModal onClose={() => setShowDbModal(false)} />}
    </div>
  )
}

export function EventDetail({ 
  eventName, 
  phases, 
  categories, 
  criteria, 
  onBack, 
  onEdit, 
  published,
  nEventoID 
}: EventData & { onBack: () => void; onEdit: () => void }) {
  const [mode, setMode] = useState<'dashboard' | 'register' | 'search' | 'judge' | 'results'>('dashboard')
  const [closed, setClosed] = useState(false)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const [userRole, setUserRole] = useState<string>('admin')
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [showDbModal, setShowDbModal] = useState(false)

  useEffect(() => {
    apiGetUserRole().then(role => {
      setUserRole(role || 'admin')
      if (role === 'juez') {
        setMode('judge')
      }
    })
  }, [])

  const selectedCategory = categories[activeCategoryIndex] || categories[0]
  const currentCategoryDbId = selectedCategory?.nCategoriaID || (activeCategoryIndex + 1)

  return (
    <div className={shell}>
      <AppHeader 
        userRole={userRole} 
        onOpenUsers={() => setShowUsersModal(true)} 
        onOpenDb={() => setShowDbModal(true)} 
      />
      <main className="mx-auto max-w-[1500px] px-5 py-9 lg:px-8">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-xs text-slate-500 hover:text-white transition">
          <ArrowLeft className="size-3.5" /> Regresar a todos los eventos
        </button>

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">Centro de control activo</span>
              <span className="rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">En Ejecución</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">{eventName}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Administración de participantes, jueceo con criterios dinámicos y reportes oficiales.
            </p>
          </div>
          {userRole === 'admin' && (
            <div className="flex flex-wrap gap-2">
              <button onClick={onEdit} className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5">
                <Settings2 className="size-4" /> Editar estructura
              </button>
              <button onClick={() => setClosed(!closed)} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold ${closed ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400 text-slate-950'}`}>
                <ShieldCheck className="size-4" /> {closed ? 'Fase cerrada' : 'Cerrar fase'}
              </button>
            </div>
          )}
        </div>

        {/* Selector de categoría activa */}
        <div className="mt-6 flex items-center gap-3 overflow-x-auto rounded-xl border border-white/8 bg-[#0d131d] p-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-2">Categoría en turno:</span>
          {categories.map((cat, idx) => (
            <button
              key={cat.id || idx}
              onClick={() => setActiveCategoryIndex(idx)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${activeCategoryIndex === idx ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              {cat.name} ({cat.participant})
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Stat label="Estado de competencia" value={closed ? 'Fase Finalizada' : 'En vivo'} />
          <Stat label="Fases del evento" value={String(phases.length)} />
          <Stat label="Categoría seleccionada" value={selectedCategory?.name || 'General'} />
          <Stat label="Criterios de evaluación" value={String(criteria.length)} />
        </div>

        {/* Barra de navegación de módulos */}
        <nav className="mt-6 flex flex-wrap gap-2 rounded-xl border border-white/8 bg-[#0d131d] p-2">
          {userRole === 'admin' && (
            <NavButton active={mode === 'dashboard'} onClick={() => setMode('dashboard')} icon={<BarChart3 className="size-4" />} label="Command Center" />
          )}
          {userRole === 'admin' && (
            <NavButton active={mode === 'register'} onClick={() => setMode('register')} icon={<UserPlus className="size-4" />} label="Inscribir Participante" />
          )}
          <NavButton active={mode === 'search'} onClick={() => setMode('search')} icon={<Search className="size-4" />} label="Directorio & Búsqueda" />
          <NavButton active={mode === 'judge'} onClick={() => setMode('judge')} icon={<UserCheck className="size-4" />} label="Panel de Calificación" />
          <NavButton active={mode === 'results'} onClick={() => setMode('results')} icon={<Trophy className="size-4" />} label="Resultados & Leaderboard" />
        </nav>

        {mode === 'dashboard' && <Dashboard phases={phases} categories={categories} onJudge={() => setMode('judge')} onRegister={() => setMode('register')} />}
        {mode === 'register' && <RegistrationView nCategoriaID={currentCategoryDbId} categoryName={selectedCategory?.name} />}
        {mode === 'search' && <SearchAndManageView nCategoriaID={currentCategoryDbId} />}
        {mode === 'judge' && <JudgeView nCategoriaID={currentCategoryDbId} criteria={criteria} />}
        {mode === 'results' && <ResultsView nCategoriaID={currentCategoryDbId} closed={closed} onClose={() => setClosed(true)} />}
      </main>

      {showUsersModal && <UsersModal onClose={() => setShowUsersModal(false)} />}
      {showDbModal && <DbConfigModal onClose={() => setShowDbModal(false)} />}
    </div>
  )
}

function Dashboard({ phases, categories, onJudge, onRegister }: { phases: Phase[]; categories: Category[]; onJudge: () => void; onRegister: () => void }) {
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
      <section className={`${card} p-5`}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Estado de categorías</h2>
            <p className="mt-1 text-xs text-slate-500">Estructura operativa y modalidades registradas</p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-300">
            <Radio className="size-3.5" /> En tiempo real
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {categories.map((category, index) => (
            <div key={category.id || index} className="rounded-xl border border-white/8 bg-[#101721] p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{category.name}</p>
                <p className="mt-1 text-xs text-slate-400">Fase: {category.phase} · Modalidad: {category.participant}</p>
              </div>
              <span className="rounded-md bg-violet-400/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
                {category.criteria || 4} Criterios
              </span>
            </div>
          ))}
        </div>
      </section>

      <aside className="flex flex-col gap-5">
        <section className={`${card} p-5`}>
          <h2 className="text-sm font-semibold mb-4">Acciones Principales</h2>
          <button onClick={onRegister} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-3 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition">
            <UserPlus className="size-4" /> Inscribir Participante / Pareja
          </button>
          <button onClick={onJudge} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 py-3 text-xs font-semibold text-white hover:bg-violet-400 transition">
            <PlayCircle className="size-4" /> Abrir Panel de Evaluación
          </button>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-emerald-300">Generación Automática de Folios</h2>
          <p className="mt-2 text-xs text-slate-400 leading-5">
            Cada competidor recibe un identificador único en MySQL (ej: FOLIO-C1-001) para garantizar trazabilidad durante la evaluación y reportes.
          </p>
        </section>
      </aside>
    </div>
  )
}

/**
 * Formulario de Inscripción de Participantes con subida de Fotos y Folio automático
 */
function RegistrationView({ nCategoriaID, categoryName }: { nCategoriaID: number; categoryName: string }) {
  const [modalidad, setModalidad] = useState<'Pareja' | 'Individual' | 'Equipo'>('Pareja')
  const [nombrePrincipal, setNombrePrincipal] = useState('')
  const [nombreSecundario, setNombreSecundario] = useState('')
  const [representacion, setRepresentacion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [notas, setNotas] = useState('')
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoBuffer, setFotoBuffer] = useState<ArrayBuffer | null>(null)
  const [folioPreview, setFolioPreview] = useState<string>('')
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    apiGenerarSiguienteFolio(nCategoriaID).then(f => setFolioPreview(f))
  }, [nCategoriaID])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setFotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    const bufferReader = new FileReader()
    bufferReader.onload = () => {
      setFotoBuffer(bufferReader.result as ArrayBuffer)
    }
    bufferReader.readAsArrayBuffer(file)
  }

  async function handleRegistrar(e: React.FormEvent) {
    e.preventDefault()
    if (!nombrePrincipal.trim()) return

    setCargando(true)
    setAviso(null)
    try {
      let fotoUrl = null
      if (fotoBuffer) {
        const destFileName = `uploads/participante_${Date.now()}.jpg`
        await apiGuardarImagenBuffer(fotoBuffer, destFileName)
        fotoUrl = destFileName
      }

      const nombreCompleto = modalidad === 'Pareja' && nombreSecundario.trim()
        ? `${nombrePrincipal.trim()} & ${nombreSecundario.trim()}`
        : nombrePrincipal.trim()

      const resp = await apiRegistrarParticipante({
        nCategoriaID,
        cNombreRepresentativo: nombreCompleto,
        cIdentificador: folioPreview,
        cFotoUrl: fotoUrl,
        jMetadatos: {
          modalidad,
          participantePrincipal: nombrePrincipal.trim(),
          participanteSecundario: nombreSecundario.trim(),
          representacion: representacion.trim(),
          telefono: telefono.trim(),
          email: email.trim(),
          notas: notas.trim()
        }
      })

      if (resp.success) {
        setAviso(`¡Registro exitoso! Folio asignado: ${resp.cIdentificador}`)
        setNombrePrincipal('')
        setNombreSecundario('')
        setRepresentacion('')
        setTelefono('')
        setEmail('')
        setNotas('')
        setFotoPreview(null)
        setFotoBuffer(null)
        apiGenerarSiguienteFolio(nCategoriaID).then(f => setFolioPreview(f))
      } else {
        setAviso('Error al guardar: ' + resp.error)
      }
    } catch (err: any) {
      setAviso('Error: ' + err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mt-6 max-w-3xl mx-auto">
      <section className={`${card} p-7`}>
        <div className="mb-6 border-b border-white/8 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-300">Inscripción en base de datos</p>
            <h2 className="text-xl font-semibold text-white">Inscribir Nuevo Participante</h2>
            <p className="mt-1 text-xs text-slate-500">Categoría destino: {categoryName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-500 block">Folio sugerido</span>
            <span className="font-mono text-sm font-bold text-violet-300">{folioPreview || 'Generando...'}</span>
          </div>
        </div>

        {aviso && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs text-emerald-300">
            <CheckCircle2 className="size-5 shrink-0" />
            <span>{aviso}</span>
          </div>
        )}

        <form onSubmit={handleRegistrar} className="flex flex-col gap-5 text-xs">
          {/* Selector de Modalidad */}
          <div>
            <label className="mb-2 block font-medium text-slate-300">Modalidad de Inscripción</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Pareja', 'Individual', 'Equipo'] as const).map(mod => (
                <button
                  type="button"
                  key={mod}
                  onClick={() => setModalidad(mod)}
                  className={`rounded-xl border p-3 text-xs font-semibold transition ${modalidad === mod ? 'border-violet-500 bg-violet-500/20 text-white' : 'border-white/8 bg-[#101721] text-slate-400 hover:bg-white/5'}`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-slate-300">
                {modalidad === 'Pareja' ? 'Participante 1 (Masculino) *' : 'Nombre Completo del Participante *'}
              </label>
              <input
                type="text"
                required
                placeholder="Nombre y Apellidos"
                value={nombrePrincipal}
                onChange={e => setNombrePrincipal(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101721] p-3 text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>

            {modalidad === 'Pareja' && (
              <div>
                <label className="mb-1 block font-medium text-slate-300">Participante 2 (Femenino) *</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre y Apellidos"
                  value={nombreSecundario}
                  onChange={e => setNombreSecundario(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#101721] p-3 text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block font-medium text-slate-300">Estado / Club / Academia</label>
              <input
                type="text"
                placeholder="Ej: Querétaro - Club Huapangueros"
                value={representacion}
                onChange={e => setRepresentacion(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101721] p-3 text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-300">Teléfono de Contacto</label>
              <input
                type="tel"
                placeholder="10 dígitos"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101721] p-3 text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-slate-300">Correo Electrónico (opcional)</label>
              <input
                type="email"
                placeholder="contacto@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101721] p-3 text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-slate-300">Notas / Estilo / Observaciones</label>
              <input
                type="text"
                placeholder="Ej: Huapango Hidalguense"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#101721] p-3 text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Subida de Fotografía */}
          <div>
            <label className="mb-2 block font-medium text-slate-300">Fotografía Oficial del Participante / Pareja</label>
            <div className="flex items-center gap-5">
              <div className="grid size-24 place-items-center overflow-hidden rounded-xl border border-white/10 bg-[#101721]">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="size-8 text-slate-600" />
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#101721] px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/5 transition">
                <Upload className="size-4" />
                <span>Seleccionar imagen...</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50"
          >
            <UserPlus className="size-4" /> {cargando ? 'Registrando en base de datos...' : 'Completar Registro y Guardar'}
          </button>
        </form>
      </section>
    </div>
  )
}

/**
 * Directorio Completo, Búsqueda en vivo y Modificación de Participantes
 */
function SearchAndManageView({ nCategoriaID }: { nCategoriaID: number }) {
  const [participantes, setParticipantes] = useState<any[]>([])
  const [filtro, setFiltro] = useState('')
  const [participanteEditando, setParticipanteEditando] = useState<any | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  async function cargarLista() {
    const list = await apiObtenerParticipantes(nCategoriaID)
    setParticipantes(list)
  }

  useEffect(() => {
    cargarLista()
  }, [nCategoriaID])

  const listaFiltrada = useMemo(() => {
    if (!filtro.trim()) return participantes
    const term = filtro.toLowerCase()
    return participantes.filter(p => 
      p.cNombreRepresentativo?.toLowerCase().includes(term) ||
      p.cIdentificador?.toLowerCase().includes(term) ||
      p.jMetadatos?.representacion?.toLowerCase().includes(term) ||
      p.jMetadatos?.participantePrincipal?.toLowerCase().includes(term)
    )
  }, [participantes, filtro])

  async function handleGuardarEdicion(e: React.FormEvent) {
    e.preventDefault()
    if (!participanteEditando) return
    try {
      await apiActualizarParticipante(participanteEditando.nParticipanteID, {
        cNombreRepresentativo: participanteEditando.cNombreRepresentativo,
        jMetadatos: participanteEditando.jMetadatos
      })
      setAviso('Participante actualizado correctamente en la base de datos.')
      setParticipanteEditando(null)
      await cargarLista()
    } catch (err: any) {
      setAviso('Error al actualizar: ' + err.message)
    }
  }

  async function handleEliminar(id: number) {
    try {
      await apiEliminarParticipante(id)
      setAviso('Participante eliminado del sistema.')
      setConfirmDeleteId(null)
      await cargarLista()
    } catch (err: any) {
      setAviso('Error al eliminar: ' + err.message)
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Barra de Búsqueda */}
      <section className={`${card} p-5 flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 size-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por Folio, Nombre o Representación..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#101721] py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargarLista} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/5">
            Refrescar Lista
          </button>
        </div>
      </section>

      {aviso && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{aviso}</span>
        </div>
      )}

      {/* Grid de Participantes */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listaFiltrada.map((part: any) => (
          <div key={part.nParticipanteID} className={`${card} p-5 flex flex-col justify-between gap-4 border-white/8 hover:border-violet-500/30 transition`}>
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center overflow-hidden rounded-xl border border-white/10 bg-[#101721]">
                    {part.cFotoUrl ? (
                      <img src={part.cFotoUrl} alt="Foto" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="size-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-violet-300 block">{part.cIdentificador}</span>
                    <h3 className="text-sm font-semibold text-white">{part.cNombreRepresentativo}</h3>
                  </div>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${part.cEstado === 'evaluado' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
                  {part.cEstado || 'registrado'}
                </span>
              </div>

              {part.jMetadatos && (
                <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                  {part.jMetadatos.representacion && <p>Origen: {part.jMetadatos.representacion}</p>}
                  {part.jMetadatos.telefono && <p>Tel: {part.jMetadatos.telefono}</p>}
                  {part.jMetadatos.email && <p>Email: {part.jMetadatos.email}</p>}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <span className="text-[10px] text-slate-500">
                {part.totalEvaluacionesRecibidas || 0} Evaluaciones
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setParticipanteEditando({ ...part })}
                  className="rounded-lg p-2 text-slate-400 hover:bg-violet-400/10 hover:text-violet-300 transition"
                  title="Modificar datos"
                >
                  <Edit className="size-4" />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(part.nParticipanteID)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-400/10 hover:text-rose-400 transition"
                  title="Eliminar participante"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {listaFiltrada.length === 0 && (
        <div className="p-12 text-center text-sm text-slate-500 border border-white/8 rounded-2xl bg-[#0d131d]">
          No se encontraron participantes que coincidan con la búsqueda.
        </div>
      )}

      {/* Modal de Edición */}
      {participanteEditando && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111823] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Modificar Participante</h3>
              <button onClick={() => setParticipanteEditando(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="mb-1 block font-medium text-slate-300">Nombre Representativo / Pareja</label>
                <input
                  type="text"
                  required
                  value={participanteEditando.cNombreRepresentativo || ''}
                  onChange={e => setParticipanteEditando({ ...participanteEditando, cNombreRepresentativo: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Estado / Club / Academia</label>
                <input
                  type="text"
                  value={participanteEditando.jMetadatos?.representacion || ''}
                  onChange={e => setParticipanteEditando({
                    ...participanteEditando,
                    jMetadatos: { ...participanteEditando.jMetadatos, representacion: e.target.value }
                  })}
                  className="w-full rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-300">Teléfono</label>
                <input
                  type="tel"
                  value={participanteEditando.jMetadatos?.telefono || ''}
                  onChange={e => setParticipanteEditando({
                    ...participanteEditando,
                    jMetadatos: { ...participanteEditando.jMetadatos, telefono: e.target.value }
                  })}
                  className="w-full rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setParticipanteEditando(null)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-slate-400 hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-violet-500 px-5 py-2 font-semibold text-white hover:bg-violet-400"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Eliminación */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111823] p-6 text-center">
            <AlertCircle className="mx-auto size-10 text-rose-400 mb-3" />
            <h3 className="text-base font-semibold text-white">¿Eliminar participante?</h3>
            <p className="mt-2 text-xs text-slate-400 leading-5">
              Esta acción eliminará al participante y sus evaluaciones de la base de datos de manera irreversible.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-400 hover:bg-white/5">
                Cancelar
              </button>
              <button onClick={() => handleEliminar(confirmDeleteId)} className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Panel de Juez Dinámico con Sliders ponderados y Selección en Vivo
 */
function JudgeView({ nCategoriaID, criteria }: { nCategoriaID: number; criteria: Criterion[] }) {
  const [participantes, setParticipantes] = useState<any[]>([])
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comentarios, setComentarios] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    apiObtenerParticipantes(nCategoriaID).then(list => {
      setParticipantes(list)
      if (list.length > 0 && !selectedPartId) setSelectedPartId(list[0].nParticipanteID)
    })
  }, [nCategoriaID])

  useEffect(() => {
    const initial: Record<string, number> = {}
    criteria.forEach((c, idx) => {
      const key = String(c.nCriterioID || c.id || idx)
      initial[key] = 8.0
    })
    setScores(initial)
  }, [criteria])

  const totalCalculado = useMemo(() => {
    return criteria.reduce((sum, crit, idx) => {
      const key = String(crit.nCriterioID || crit.id || idx)
      const val = scores[key] ?? 0
      const peso = crit.weight || (100 / (criteria.length || 1))
      return sum + (val * (peso / 100))
    }, 0)
  }, [criteria, scores])

  const participanteActivo = participantes.find(p => p.nParticipanteID === selectedPartId)

  async function handleSubmit() {
    if (!selectedPartId) return
    setEnviando(true)
    setAviso(null)

    try {
      const calificaciones = criteria.map((c, idx) => {
        const key = String(c.nCriterioID || c.id || idx)
        return {
          nCriterioID: c.nCriterioID || (idx + 1),
          nPuntajeOtorgado: scores[key] ?? 0
        }
      })

      const resp = await apiGuardarEvaluacion({
        nCategoriaID,
        nParticipanteID: selectedPartId,
        nJuezID: 2,
        calificaciones,
        cObservaciones: comentarios
      })

      if (resp.success) {
        setAviso(`¡Calificación de ${participanteActivo?.cNombreRepresentativo} registrada exitosamente!`)
        setComentarios('')
      } else {
        setAviso('Error: ' + resp.error)
      }
    } catch (err: any) {
      setAviso('Error: ' + err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className={`${card} mt-6 p-5 sm:p-7`}>
      <div className="flex flex-col justify-between gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-violet-300">Panel Oficial de Juez · Calificación en Vivo</p>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              {participanteActivo ? participanteActivo.cNombreRepresentativo : 'Selecciona un participante'}
            </h2>
            {participanteActivo && (
              <span className="rounded bg-violet-400/15 px-2.5 py-0.5 font-mono text-xs font-bold text-violet-300">
                {participanteActivo.cIdentificador}
              </span>
            )}
          </div>
        </div>

        {/* Selector de participante en turno */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">En turno:</label>
          <select
            value={selectedPartId || ''}
            onChange={e => setSelectedPartId(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-[#101721] px-3 py-2 text-xs font-medium text-white focus:border-violet-500 focus:outline-none"
          >
            {participantes.map((p: any) => (
              <option key={p.nParticipanteID} value={p.nParticipanteID}>
                {p.cIdentificador} - {p.cNombreRepresentativo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {aviso && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{aviso}</span>
        </div>
      )}

      {/* Sliders dinámicos */}
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {criteria.map((criterion, idx) => {
          const key = String(criterion.nCriterioID || criterion.id || idx)
          const val = scores[key] ?? 8.0
          return (
            <label key={key} className="rounded-xl border border-white/8 bg-[#101721] p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{criterion.name}</span>
                <span className="rounded-md bg-violet-400/10 px-2 py-1 text-sm font-semibold text-violet-300">{val.toFixed(1)}</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={val}
                  onChange={e => setScores({ ...scores, [key]: Number(e.target.value) })}
                  className="w-full accent-violet-500"
                />
                <span className="text-[10px] text-slate-500 font-semibold">{criterion.weight}%</span>
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                <span>0 · Deficiente</span>
                <span>10 · Excepcional</span>
              </div>
            </label>
          )
        })}
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium text-slate-300">Observaciones del Juez (opcional)</label>
        <textarea
          rows={2}
          placeholder="Escribe comentarios técnicos de la ejecución..."
          value={comentarios}
          onChange={e => setComentarios(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#101721] p-3 text-xs text-white placeholder-slate-600 focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-violet-400/20 bg-violet-400/5 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs text-slate-400">Puntuación ponderada total</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {totalCalculado.toFixed(2)} <span className="text-sm font-normal text-slate-500">/ 10.00 pts</span>
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={enviando || !selectedPartId}
          className="rounded-lg bg-emerald-500 px-6 py-3 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition"
        >
          {enviando ? 'Guardando en BD...' : 'Emitir Calificación Oficial'}
        </button>
      </div>
    </section>
  )
}

/**
 * Tabla de Resultados / Leaderboard con Podio y Reportes en PDF
 */
function ResultsView({ nCategoriaID, closed, onClose }: { nCategoriaID: number; closed: boolean; onClose: () => void }) {
  const [data, setData] = useState<{ criterios: any[]; participantes: any[] }>({ criterios: [], participantes: [] })

  async function cargarResultados() {
    const res = await apiObtenerResultados(nCategoriaID)
    setData(res)
  }

  useEffect(() => {
    cargarResultados()
  }, [nCategoriaID])

  return (
    <section className={`${card} mt-6 p-5 sm:p-7`}>
      <div className="flex flex-col justify-between gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-widest text-amber-300">Cierre y Tabulación</p>
          <h2 className="text-xl font-semibold text-white">Leaderboard & Podio Oficial</h2>
          <p className="mt-1 text-xs text-slate-500">Promedios ponderados calculados en tiempo real desde MySQL.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => apiGenerarPDF('parejas')} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5">
            <FileDown className="size-3.5" /> PDF Participantes
          </button>
          <button onClick={() => apiGenerarPDF('resultados')} className="flex items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-medium text-violet-300 hover:bg-violet-400/20">
            <FileDown className="size-3.5" /> PDF Resultados
          </button>
          {!closed && (
            <button onClick={onClose} className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300">
              Cerrar fase
            </button>
          )}
        </div>
      </div>

      {data.participantes && data.participantes.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3">
          {data.participantes.map((part: any, index: number) => {
            return (
              <div
                key={part.nParticipanteID}
                className={`flex flex-col justify-between gap-4 rounded-xl border p-5 sm:flex-row sm:items-center ${
                  index === 0
                    ? 'border-amber-400/40 bg-gradient-to-r from-amber-400/15 to-transparent'
                    : index === 1
                    ? 'border-slate-300/30 bg-gradient-to-r from-slate-400/10 to-transparent'
                    : index === 2
                    ? 'border-amber-700/30 bg-gradient-to-r from-amber-900/15 to-transparent'
                    : 'border-white/8 bg-[#101721]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`grid size-10 place-items-center rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-violet-300">{part.cIdentificador}</span>
                      <p className="text-sm font-semibold text-white">{part.cNombreRepresentativo}</p>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {part.juecesQueCalificaron || 1} jueces han calificado · Promedio ponderado
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {part.criteriosDesglose && (
                    <div className="hidden gap-3 text-right md:flex">
                      {part.criteriosDesglose.map((crit: any) => (
                        <div key={crit.nCriterioID} className="text-[10px]">
                          <span className="block text-slate-500">{crit.cNombre.slice(0, 8)}:</span>
                          <span className="font-semibold text-slate-300">{crit.promedio}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="text-2xl font-bold text-white">
                    {part.puntajeFinalPromedio || '0.00'}
                    <small className="ml-1 text-xs font-normal text-slate-500">/ 10</small>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-white/8 bg-[#101721] p-10 text-center text-sm text-slate-500">
          Aún no se han registrado calificaciones para los participantes de esta categoría.
        </div>
      )}
    </section>
  )
}

/**
 * Header Unificado de la Aplicación
 */
function AppHeader({ 
  userRole, 
  onOpenUsers, 
  onOpenDb 
}: { 
  userRole: string; 
  onOpenUsers: () => void; 
  onOpenDb: () => void 
}) {
  return (
    <header className="border-b border-white/8 bg-[#0b1018]/95 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3.5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
            <Trophy className="size-5 text-white" />
          </div>
          <div>
            <div className="text-[15px] font-semibold text-white flex items-center gap-2">
              Módulo Universal
              <span className="rounded-md bg-violet-400/10 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-violet-300 font-bold border border-violet-400/20">Pro</span>
            </div>
            <p className="hidden text-[11px] text-slate-500 sm:block">Plataforma Modular de Competencias</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userRole === 'admin' && (
            <>
              <button onClick={onOpenUsers} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition">
                <Users className="size-3.5" />
                <span className="hidden sm:inline">Usuarios / Jueces</span>
              </button>
              <button onClick={onOpenDb} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition">
                <Database className="size-3.5" />
                <span className="hidden sm:inline">Base de Datos</span>
              </button>
            </>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-1.5">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="text-xs font-medium text-slate-300 capitalize">{userRole}</span>
          </div>

          <button onClick={() => apiCerrarSesion()} className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition" title="Cerrar Sesión">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

/**
 * Modal de Administración de Jueces y Usuarios
 */
function UsersModal({ onClose }: { onClose: () => void }) {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('juez')
  const [aviso, setAviso] = useState<string | null>(null)

  async function cargarUsuarios() {
    const list = await apiObtenerUsuarios()
    setUsuarios(list)
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !password.trim()) return
    const res = await apiCrearUsuario({ cNombreUsuario: nombre.trim(), cContrasena: password.trim(), rol })
    if (res.success) {
      setAviso(`Usuario '${nombre.trim()}' creado exitosamente.`)
      setNombre('')
      setPassword('')
      await cargarUsuarios()
    } else {
      setAviso('Error: ' + res.error)
    }
  }

  async function handleEliminar(cNombreUsuario: string) {
    if (!confirm(`¿Eliminar al usuario '${cNombreUsuario}'?`)) return
    await apiEliminarUsuario(cNombreUsuario)
    await cargarUsuarios()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111823] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-white/8 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Gestión de Cuentas (Jueces & Admins)</h3>
            <p className="text-xs text-slate-500">Crea o elimina credenciales de acceso para el sistema.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5">
            <X className="size-4" />
          </button>
        </div>

        {aviso && (
          <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-300">
            {aviso}
          </div>
        )}

        <form onSubmit={handleCrear} className="grid gap-3 sm:grid-cols-3 text-xs mb-6">
          <input
            type="text"
            required
            placeholder="Usuario"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:outline-none focus:border-violet-500"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:outline-none focus:border-violet-500"
          />
          <div className="flex gap-2">
            <select
              value={rol}
              onChange={e => setRol(e.target.value)}
              className="rounded-lg border border-white/10 bg-[#090d14] px-2 py-2 text-white text-xs focus:outline-none"
            >
              <option value="juez">Juez</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="rounded-lg bg-violet-500 px-3 py-2 font-semibold text-white hover:bg-violet-400 flex-1">
              Crear
            </button>
          </div>
        </form>

        <div className="max-h-60 overflow-y-auto divide-y divide-white/5 rounded-xl border border-white/8 bg-[#090d14]">
          {usuarios.map(u => (
            <div key={u.nUsuarioID} className="flex items-center justify-between p-3 text-xs">
              <div>
                <span className="font-medium text-white">{u.cNombreUsuario}</span>
                <span className="ml-2 rounded bg-violet-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300 capitalize">{u.rol}</span>
              </div>
              {u.cNombreUsuario !== 'admin' && (
                <button onClick={() => handleEliminar(u.cNombreUsuario)} className="text-slate-500 hover:text-rose-400 p-1">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Modal de Configuración de MySQL
 */
function DbConfigModal({ onClose }: { onClose: () => void }) {
  const [config, setConfig] = useState({ host: 'localhost', port: 3306, user: 'root', password: '', database: 'huapango_db' })
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    apiObtenerConfiguracion().then(res => {
      if (res?.data) setConfig({ ...config, ...res.data })
    })
  }, [])

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault()
    const res = await apiGuardarConfiguracion(config)
    if (res?.success) {
      setAviso('Conexión guardada exitosamente.')
    } else {
      setAviso('Error: ' + res?.error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111823] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-white/8 pb-4">
          <h3 className="text-base font-semibold text-white">Configuración MySQL</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5">
            <X className="size-4" />
          </button>
        </div>

        {aviso && (
          <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-300">
            {aviso}
          </div>
        )}

        <form onSubmit={handleGuardar} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Host</label>
            <input
              type="text"
              value={config.host}
              onChange={e => setConfig({ ...config, host: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Puerto</label>
            <input
              type="number"
              value={config.port}
              onChange={e => setConfig({ ...config, port: Number(e.target.value) })}
              className="w-full rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Usuario</label>
            <input
              type="text"
              value={config.user}
              onChange={e => setConfig({ ...config, user: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Contraseña</label>
            <input
              type="password"
              value={config.password}
              onChange={e => setConfig({ ...config, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Base de Datos</label>
            <input
              type="text"
              value={config.database}
              onChange={e => setConfig({ ...config, database: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[#090d14] p-2.5 text-white focus:outline-none"
            />
          </div>

          <button type="submit" className="mt-3 rounded-lg bg-emerald-500 py-2.5 font-semibold text-slate-950 hover:bg-emerald-400">
            Probar y Guardar Conexión
          </button>
        </form>
      </div>
    </div>
  )
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition ${active ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
      {icon}
      {label}
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${card} p-5`}>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}
