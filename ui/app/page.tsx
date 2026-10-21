'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Code2, Database, GitBranch, GripVertical, Layers3, Plus, Save, Settings2, ShieldCheck, Trophy, Users, X, Zap, CalendarDays } from 'lucide-react'
import { EventDetail, EventsList } from './event-views'
import { apiGuardarEvento, apiObtenerEventoDetalle } from '../lib/ipc'

type Phase = { id: string; name: string; type: string; categories: number; judges: number }
type Category = { id: string; name: string; phase: string; participant: string; criteria: number; nCategoriaID?: number }
type Criterion = { id: string; name: string; weight: number; scale: string; nCriterioID?: number }

const steps = [
  { id: 'general', label: 'Configuración general', icon: Settings2 },
  { id: 'structure', label: 'Estructura', icon: GitBranch },
  { id: 'judging', label: 'Reglas y jueceo', icon: Users },
  { id: 'rubrics', label: 'Rúbricas', icon: Layers3 },
  { id: 'review', label: 'Revisión', icon: ShieldCheck },
]

const initialPhases: Phase[] = [
  { id: 'fase-1', name: 'Clasificatoria', type: 'Ronda', categories: 2, judges: 3 },
  { id: 'fase-2', name: 'Final', type: 'Eliminatoria', categories: 1, judges: 5 },
]

const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Danza libre', phase: 'Clasificatoria', participant: 'Pareja', criteria: 4 },
  { id: 'cat-2', name: 'Danza tradicional', phase: 'Clasificatoria', participant: 'Pareja', criteria: 5 },
  { id: 'cat-3', name: 'Gran final', phase: 'Final', participant: 'Pareja', criteria: 6 },
]

const initialCriteria: Criterion[] = [
  { id: 'ritmo', name: 'Ritmo y sincronía', weight: 30, scale: '0–10' },
  { id: 'tecnica', name: 'Técnica y ejecución', weight: 25, scale: '0–10' },
  { id: 'creatividad', name: 'Creatividad', weight: 25, scale: '0–10' },
  { id: 'presencia', name: 'Presencia escénica', weight: 20, scale: '0–10' },
]

export default function Page() {
  const [step, setStep] = useState(0)
  const [showPayload, setShowPayload] = useState(false)
  const [eventName, setEventName] = useState('Festival Nacional de Danza 2026')
  const [eventType, setEventType] = useState('Competencia artística')
  const [format, setFormat] = useState('Presencial')
  const [phases, setPhases] = useState(initialPhases)
  const [categories, setCategories] = useState(initialCategories)
  const [criteria, setCriteria] = useState(initialCriteria)
  const [view, setView] = useState<'builder' | 'events' | 'detail'>('events')
  const [published, setPublished] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const totalWeight = useMemo(() => criteria.reduce((sum, criterion) => sum + criterion.weight, 0), [criteria])
  const payload = { event: { id: 'evt_danza_2026', name: eventName, type: eventType, format }, phases, categories, judging: { judgesPerPhase: { 'fase-1': 3, 'fase-2': 5 }, roles: ['Juez principal', 'Juez técnico', 'Juez de ejecución'], rules: ['Calificación individual por juez', 'Promedio recortado en la final'] }, rubrics: [{ categoryId: 'cat-1', criteria }], ipc: { channel: 'event-builder:state', version: 1 } }

  function addPhase() { setPhases([...phases, { id: `fase-${phases.length + 1}`, name: 'Nueva fase', type: 'Ronda', categories: 0, judges: 3 }]) }
  function addCategory() { setCategories([...categories, { id: `cat-${categories.length + 1}`, name: 'Nueva categoría', phase: 'Clasificatoria', participant: 'Individual', criteria: 0 }]) }
  function addCriterion() { setCriteria([...criteria, { id: `criterio-${criteria.length + 1}`, name: 'Nuevo criterio', weight: 0, scale: '0–10' }]) }
  function removePhase(id: string) { setPhases(phases.filter(phase => phase.id !== id)) }
  function removeCategory(id: string) { setCategories(categories.filter(category => category.id !== id)) }
  function removeCriterion(id: string) { setCriteria(criteria.filter(criterion => criterion.id !== id)) }
  
  async function publishEvent() {
    setPublished(true);
    try {
      await apiGuardarEvento(payload);
    } catch (e) {
      console.error("Error al persistir evento en MySQL:", e);
    }
    setView('detail');
  }

  async function handleOpenEvent(ev?: any) {
    if (ev?.nEventoID) {
      setEventName(ev.cNombre);
      try {
        const detalle = await apiObtenerEventoDetalle(ev.nEventoID);
        if (detalle?.categorias && detalle.categorias.length > 0) {
          const cats: Category[] = detalle.categorias.map((c: any) => ({
            id: String(c.nCategoriaID),
            name: c.cNombre,
            phase: c.cFase || 'Principal',
            participant: c.cModalidad || 'Pareja',
            criteria: c.criterios?.length || 4,
            nCategoriaID: c.nCategoriaID
          }));
          setCategories(cats);

          if (detalle.categorias[0].criterios && detalle.categorias[0].criterios.length > 0) {
            const crits: Criterion[] = detalle.categorias[0].criterios.map((cr: any) => ({
              id: String(cr.nCriterioID),
              name: cr.cNombre,
              weight: Number(cr.nPesoPorcentaje) || 25,
              scale: '0–10',
              nCriterioID: cr.nCriterioID
            }));
            setCriteria(crits);
          }
        }
      } catch (err) {
        console.error("Error al cargar detalle del evento:", err);
      }
    }
    setView('detail');
  }

  function loadDemo() { setEventName('Festival de Huapango y Gastronomía'); setEventType('Evento híbrido cultural'); setFormat('Híbrido'); setPhases([{ id: 'fase-1', name: 'Clasificatoria regional', type: 'Ronda', categories: 2, judges: 3 }, { id: 'fase-2', name: 'Gran final', type: 'Eliminatoria', categories: 1, judges: 5 }]); setCategories([{ id: 'cat-1', name: 'Huapango tradicional', phase: 'Clasificatoria regional', participant: 'Trío', criteria: 4 }, { id: 'cat-2', name: 'Cocina huasteca', phase: 'Clasificatoria regional', participant: 'Equipo', criteria: 3 }, { id: 'cat-3', name: 'Gran final de parejas', phase: 'Gran final', participant: 'Pareja', criteria: 4 }]); setCriteria([{ id: 'ritmo', name: 'Ritmo y sincronía', weight: 30, scale: '0–10' }, { id: 'tecnica', name: 'Técnica y ejecución', weight: 25, scale: '0–10' }, { id: 'creatividad', name: 'Creatividad y propuesta', weight: 25, scale: '0–10' }, { id: 'presencia', name: 'Presencia escénica', weight: 20, scale: '0–10' }]); setPublished(true); setView('detail') }

  if (view === 'events') return <EventsList onCreate={() => { setView('builder'); setStep(0) }} onOpen={handleOpenEvent} published={published} eventName={eventName} />
  if (view === 'detail') return <EventDetail eventName={eventName} phases={phases} categories={categories} criteria={criteria} onBack={() => setView('events')} onEdit={() => setView('builder')} published={published} />

  return <div className="min-h-screen bg-[#090d14] text-slate-100 selection:bg-violet-500/30">
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0b1018]/95 backdrop-blur-xl"><div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-8"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20"><Trophy className="size-5 text-white" /></div><div><div className="flex items-center gap-2"><span className="text-[15px] font-semibold tracking-tight">Módulo Universal</span><span className="rounded-md border border-violet-400/20 bg-violet-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-300">Pro</span></div><p className="hidden text-[11px] text-slate-500 sm:block">Constructor modular de eventos</p></div></div><div className="hidden items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 lg:flex"><span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /><span className="text-[11px] text-slate-400">ESCRITORIO</span><span className="text-xs font-medium text-slate-200">Sincronizado por IPC</span></div><div className="flex items-center gap-2"><button onClick={() => setView('events')} className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 md:flex"><CalendarDays className="size-3.5" /> Todos los eventos</button><button onClick={() => { setView('builder'); setStep(0) }} className="hidden items-center gap-2 rounded-lg bg-violet-500/15 px-3 py-2 text-xs font-medium text-violet-200 hover:bg-violet-500/25 md:flex"><Plus className="size-3.5" /> Nuevo evento</button></div><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-xs font-medium">Mtro. Roberto Morales</p><p className="text-[10px] text-slate-500">Organizador</p></div><div className="grid size-9 place-items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-xs font-bold text-emerald-300">RM</div></div></div></header>

    <main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9"><div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300"><Zap className="size-3.5" /> Constructor de eventos</div><h1 className="text-3xl font-semibold tracking-tight text-white">Construye tu evento desde cero</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Define la estructura, las reglas y las rúbricas exactas. Sin presets: cada evento se modela para tu operación.</p></div><div className="flex items-center gap-2 text-[11px] text-slate-500"><span className="size-2 rounded-full bg-emerald-400" /> Guardado automáticamente {isMounted && <button onClick={loadDemo} className="ml-2 rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-violet-200 hover:bg-violet-400/20">Cargar demo</button>}<button className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5"><Save className="size-4" /></button></div></div>

      <div className="mb-8 flex overflow-x-auto rounded-2xl border border-white/8 bg-[#0d131d] p-2"><div className="flex min-w-max items-center gap-1">{steps.map((item, index) => { const Icon = item.icon; return <button key={item.id} onClick={() => setStep(index)} className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium transition ${step === index ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/15' : index < step ? 'text-emerald-300 hover:bg-white/5' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}><span className={`grid size-6 place-items-center rounded-full text-[10px] ${index < step ? 'bg-emerald-400/15' : step === index ? 'bg-white/15' : 'bg-white/5'}`}>{index < step ? <Check className="size-3.5" /> : index + 1}</span><Icon className="hidden size-3.5 sm:block" />{item.label}</button> })}</div></div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"> <section className="rounded-2xl border border-white/8 bg-[#0d131d] p-5 sm:p-7">{step === 0 && <General eventName={eventName} setEventName={setEventName} eventType={eventType} setEventType={setEventType} format={format} setFormat={setFormat} />}{step === 1 && <Structure phases={phases} setPhases={setPhases} categories={categories} setCategories={setCategories} addPhase={addPhase} addCategory={addCategory} removePhase={removePhase} removeCategory={removeCategory} />}{step === 2 && <Judging categories={categories} />}{step === 3 && <Rubrics criteria={criteria} setCriteria={setCriteria} addCriterion={addCriterion} removeCriterion={removeCriterion} />}{step === 4 && <Review payload={payload} />}
        <div className="mt-8 flex justify-between border-t border-white/8 pt-5"><button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 disabled:opacity-30"><ArrowLeft className="size-3.5" /> Atrás</button>{step < steps.length - 1 ? <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-400">Continuar <ArrowRight className="size-3.5" /></button> : <button onClick={publishEvent} className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"><Check className="size-3.5" /> Publicar y recibir registros</button>}</div>
      </section><aside className="flex flex-col gap-5"><div className="rounded-2xl border border-violet-400/20 bg-gradient-to-br from-[#1a1831] to-[#101522] p-6"><p className="text-[10px] font-medium uppercase tracking-widest text-violet-300">Estado del evento</p><p className="mt-3 text-2xl font-semibold text-white">{Math.round(((step + 1) / steps.length) * 100)}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><p className="mt-3 text-xs text-slate-500">{steps[step].label}</p></div><div className="rounded-2xl border border-white/8 bg-[#0d131d] p-5"><div className="mb-4 flex items-center gap-3"><div className="grid size-9 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300"><Code2 className="size-4" /></div><div><h3 className="text-sm font-semibold">Contrato IPC</h3><p className="text-[11px] text-slate-500">Node → Renderizador</p></div></div><div className="flex flex-col gap-3 text-xs"><div className="flex justify-between"><span className="text-slate-500">Canal</span><span className="font-mono text-emerald-300">event-builder:state</span></div><div className="flex justify-between"><span className="text-slate-500">Fases</span><span className="text-slate-200">{phases.length}</span></div><div className="flex justify-between"><span className="text-slate-500">Categorías</span><span className="text-slate-200">{categories.length}</span></div><div className="flex justify-between"><span className="text-slate-500">Criterios</span><span className="text-slate-200">{criteria.length}</span></div></div></div><div className="rounded-2xl border border-white/8 bg-[#0d131d] p-5"><div className="flex items-center gap-3"><Database className="size-4 text-violet-300" /><div><p className="text-xs font-medium text-slate-200">Modelo relacional listo</p><p className="mt-1 text-[11px] text-slate-500">Evento → Fases → Categorías → Rúbricas → Jueces</p></div></div></div></aside></div></main>

    {showPayload && <div className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111823] p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-medium uppercase tracking-widest text-emerald-300">Payload IPC estructurado</p><h2 className="mt-1 text-lg font-semibold">Evento listo para registros</h2></div><button onClick={() => setShowPayload(false)} className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"><X className="size-4" /></button></div><pre className="max-h-[55vh] overflow-auto rounded-xl border border-white/8 bg-[#090d14] p-4 text-[11px] leading-6 text-emerald-300">{JSON.stringify(payload, null, 2)}</pre><button onClick={() => setShowPayload(false)} className="mt-4 w-full rounded-lg bg-violet-500 py-2.5 text-sm font-medium text-white hover:bg-violet-400">Cerrar vista previa</button></div></div>}
  </div>
}

function General({ eventName, setEventName, eventType, setEventType, format, setFormat }: any) { return <div><SectionTitle eyebrow="Paso 1 de 5" title="Configuración general" description="Comienza con la identidad y el formato operativo de tu evento." /><div className="grid gap-5 md:grid-cols-2"><Field label="Nombre del evento" value={eventName} onChange={setEventName} /><Field label="Tipo de evento" value={eventType} onChange={setEventType} /><SelectField label="Formato" value={format} onChange={setFormat} options={['Presencial', 'Híbrido', 'Remoto']} /><SelectField label="Zona horaria" value="America/Mexico_City" onChange={() => { }} options={['America/Mexico_City', 'America/Bogota', 'Europe/Madrid']} /></div><div className="mt-6 rounded-xl border border-violet-400/15 bg-violet-400/5 p-4 text-xs leading-5 text-slate-400"><strong className="text-violet-200">Diseño modular:</strong> no se aplicará ninguna plantilla. Las fases, categorías y reglas se crearán en los siguientes pasos.</div></div> }
function Structure({ phases, setPhases, categories, setCategories, addPhase, addCategory, removePhase, removeCategory }: any) { const [draggedPhase, setDraggedPhase] = useState<string | null>(null); function reorderPhase(targetId: string) { if (!draggedPhase || draggedPhase === targetId) return; const from = phases.findIndex((phase: Phase) => phase.id === draggedPhase); const to = phases.findIndex((phase: Phase) => phase.id === targetId); if (from < 0 || to < 0) return; const next = [...phases]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); setPhases(next); setDraggedPhase(null) } return <div><SectionTitle eyebrow="Paso 2 de 5" title="Diseña la estructura" description="Crea las fases y asigna categorías sin estar limitado a un tipo de evento." /><div className="mb-7 flex items-center justify-between"><h3 className="text-sm font-semibold">Fases del evento</h3><button onClick={addPhase} className="flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-medium text-violet-300"><Plus className="size-3.5" /> Nueva fase</button></div><div className="flex flex-col gap-3">{phases.map((phase: Phase, i: number) => <div key={phase.id} draggable onDragStart={() => setDraggedPhase(phase.id)} onDragOver={e => e.preventDefault()} onDrop={() => reorderPhase(phase.id)} onDragEnd={() => setDraggedPhase(null)} className={`flex flex-col gap-4 rounded-xl border bg-[#101721] p-4 transition sm:flex-row sm:items-center ${draggedPhase === phase.id ? 'border-violet-400/50 opacity-60' : 'border-white/8'}`}><button type="button" draggable aria-label={`Reordenar fase ${i + 1}`} title="Arrastra para reordenar" className="grid size-9 shrink-0 cursor-grab place-items-center rounded-lg bg-white/[0.04] text-slate-500 hover:bg-violet-400/10 hover:text-violet-300 active:cursor-grabbing" onDragStart={() => setDraggedPhase(phase.id)}><GripVertical className="size-4" /></button><button type="button" onClick={() => removePhase(phase.id)} aria-label={`Quitar fase ${phase.name}`} className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-red-400/10 hover:text-red-300"><X className="size-4" /></button><div className="grid size-9 place-items-center rounded-lg bg-violet-400/10 text-sm font-semibold text-violet-300">{i + 1}</div><div className="grid flex-1 gap-3 sm:grid-cols-3"><input value={phase.name} onChange={e => setPhases(phases.map((p: Phase) => p.id === phase.id ? { ...p, name: e.target.value } : p))} className="rounded-lg border border-white/8 bg-[#090d14] px-3 py-2 text-sm outline-none focus:border-violet-500/60" /><span className="rounded-lg border border-white/8 px-3 py-2 text-xs text-slate-400">{phase.type} · {phase.judges} jueces</span><span className="rounded-lg border border-white/8 px-3 py-2 text-xs text-slate-400">{phase.categories} categorías</span></div></div>)}</div><div className="my-8 flex items-center justify-between"><h3 className="text-sm font-semibold">Categorías</h3><button onClick={addCategory} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300"><Plus className="size-3.5" /> Nueva categoría</button></div><div className="overflow-hidden rounded-xl border border-white/8"><div className="grid grid-cols-[1fr_130px_110px_70px] gap-3 bg-white/[0.03] px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500"><span>Nombre</span><span>Fase</span><span>Participación</span><span>Rúbrica</span></div>{categories.map((category: Category) => <div key={category.id} className="grid grid-cols-[1fr_130px_110px_70px] items-center gap-3 border-t border-white/8 px-4 py-3 text-xs"><input value={category.name} onChange={e => setCategories(categories.map((c: Category) => c.id === category.id ? { ...c, name: e.target.value } : c))} className="bg-transparent text-slate-200 outline-none" /><span className="text-slate-400">{category.phase}</span><span className="text-slate-400">{category.participant}</span><span className="text-violet-300">{category.criteria} criterios</span></div>)}</div></div> }
function Judging({ categories }: { categories: Category[] }) { return <div><SectionTitle eyebrow="Paso 3 de 5" title="Reglas y jueceo" description="Define quién califica y agrega reglas solo a las categorías que las necesiten." /><div className="grid gap-5 md:grid-cols-2"><div className="rounded-xl border border-white/8 bg-[#101721] p-5"><h3 className="mb-4 text-sm font-semibold">Jueces por fase</h3>{[['Clasificatoria', '3 jueces'], ['Final', '5 jueces']].map(([name, count]) => <div className="mb-3 flex items-center justify-between rounded-lg border border-white/8 px-3 py-3 text-xs" key={name}><span>{name}</span><select defaultValue={count[0]} className="bg-transparent text-violet-300 outline-none"><option>3</option><option>5</option><option>7</option></select></div>)}</div><div className="rounded-xl border border-white/8 bg-[#101721] p-5"><h3 className="mb-4 text-sm font-semibold">Roles disponibles</h3>{['Juez principal', 'Juez técnico', 'Juez de ejecución'].map(role => <label className="mb-3 flex items-center gap-3 text-xs text-slate-300" key={role}><input type="checkbox" defaultChecked className="accent-violet-500" />{role}</label>)}</div></div><div className="mt-5 rounded-xl border border-white/8 bg-[#101721] p-5"><h3 className="mb-1 text-sm font-semibold">Reglas por categoría</h3><p className="mb-4 text-xs text-slate-500">Las categorías quedan precargadas; agrega una regla únicamente cuando aplique.</p><div className="flex flex-col gap-3">{categories.map(category => <div key={category.id} className="rounded-lg border border-white/8 p-3"><p className="mb-2 text-xs font-medium text-violet-200">{category.name}</p><textarea placeholder="Sin reglas específicas" className="min-h-16 w-full resize-y rounded-lg border border-white/8 bg-[#090d14] px-3 py-2 text-xs leading-5 text-slate-300 outline-none focus:border-violet-500/60" /></div>)}</div></div></div> }
function Rubrics({ criteria, setCriteria, addCriterion, removeCriterion }: any) { return <div><SectionTitle eyebrow="Paso 4 de 5" title="Construye las rúbricas" description="Agrega los criterios que se usarán para evaluar cada categoría." /><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Criterios de evaluación</h3><p className="mt-1 text-xs text-slate-500">La escala de calificación será de 0 a 10.</p></div><button onClick={addCriterion} className="flex items-center gap-1.5 rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-medium text-violet-300"><Plus className="size-3.5" /> Añadir criterio</button></div><div className="flex flex-col gap-3">{criteria.map((criterion: Criterion) => <div key={criterion.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-[#101721] p-4"><input value={criterion.name} onChange={e => setCriteria(criteria.map((c: Criterion) => c.id === criterion.id ? { ...c, name: e.target.value } : c))} className="min-w-0 flex-1 rounded-lg border border-white/8 bg-[#090d14] px-3 py-2 text-sm outline-none" /><span className="rounded-lg border border-white/8 px-3 py-2 text-xs text-slate-400">Escala {criterion.scale}</span><button type="button" onClick={() => removeCriterion(criterion.id)} aria-label={`Quitar ${criterion.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-400/10 hover:text-red-300"><X className="size-4" /></button></div>)}</div></div> }
function Review({ payload }: { payload: any }) { return <div><SectionTitle eyebrow="Paso 5 de 5" title="Revisa y publica" description="Confirma la estructura antes de habilitar los registros de participantes." /><div className="grid gap-4 sm:grid-cols-3">{[['Evento', payload.event.name], ['Fases', `${payload.phases.length} configuradas`], ['Categorías', `${payload.categories.length} configuradas`]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/8 bg-[#101721] p-4"><p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p><p className="mt-2 text-sm font-medium text-slate-200">{value}</p></div>)}</div><div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5"><div className="flex items-center gap-3"><ShieldCheck className="size-5 text-emerald-300" /><div><h3 className="text-sm font-semibold text-emerald-200">Todo listo para recibir registros</h3><p className="mt-1 text-xs text-slate-400">El proceso principal enviará la configuración completa al renderizador mediante IPC.</p></div></div></div></div> }
function SectionTitle({ eyebrow, title, description }: any) { return <div className="mb-7"><p className="text-[10px] font-medium uppercase tracking-widest text-violet-300">{eyebrow}</p><h2 className="mt-2 text-xl font-semibold text-white">{title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div> }
function Field({ label, value, onChange }: any) { return <label className="flex flex-col gap-2 text-xs text-slate-400">{label}<input value={value} onChange={e => onChange(e.target.value)} className="rounded-lg border border-white/8 bg-[#090d14] px-3 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/60" /></label> }
function SelectField({ label, value, onChange, options }: any) { return <label className="flex flex-col gap-2 text-xs text-slate-400">{label}<select value={value} onChange={e => onChange(e.target.value)} className="rounded-lg border border-white/8 bg-[#090d14] px-3 py-3 text-sm text-slate-200 outline-none focus:border-violet-500/60">{options.map((option: string) => <option key={option}>{option}</option>)}</select></label> }
