'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Settings, Plus, Pencil, Trash2, X, Check, Tag, Ruler, Palette, CreditCard, ShieldCheck } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ItemSimple  { id: number; nombre: string; }
interface Categoria   { IdCategoria: number; NombreCategoria: string; Descripcion: string | null; }

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'categorias',  label: 'Categorías',     icon: Tag         },
  { key: 'tallas',      label: 'Tallas',          icon: Ruler       },
  { key: 'colores',     label: 'Colores',         icon: Palette     },
  { key: 'formaspago',  label: 'Formas de Pago',  icon: CreditCard  },
  { key: 'roles',       label: 'Roles',           icon: ShieldCheck },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  negro: '#111827', blanco: '#f9fafb', rojo: '#ef4444', azul: '#3b82f6',
  verde: '#22c55e', amarillo: '#eab308', rosado: '#ec4899',
  multicolor: 'linear-gradient(90deg,#ef4444,#eab308,#22c55e,#3b82f6)',
};

const colorDot = (nombre: string) => {
  const key = nombre.toLowerCase();
  const bg  = COLOR_MAP[key] ?? '#d1d5db';
  return (
    <span
      style={ bg.includes('gradient') ? { background: bg } : { backgroundColor: bg } }
      className="inline-block w-3 h-3 rounded-full border border-gray-200 mr-2 shrink-0"
    />
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ConfiguracionPage() {
  const [tab, setTab]           = useState('categorias');
  const [items, setItems]       = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Modal
  const [modal, setModal]       = useState<'crear' | 'editar' | null>(null);
  const [seleccionado, setSeleccionado] = useState<any | null>(null);
  const [guardando, setGuardando]       = useState(false);
  const [msgModal, setMsgModal]         = useState<string | null>(null);

  // Campos del form
  const [nombre, setNombre]       = useState('');
  const [descripcion, setDesc]    = useState('');

  // Confirmar eliminar
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // ── Carga ──
  const cargar = async (t = tab) => {
    setCargando(true); setError(null);
    try {
      const r = await apiFetch<{ ok: boolean; data: any[] }>(`/configuracion/${t}`);
      setItems(r.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(tab); }, [tab]);

  // ── Normalizar items a { id, nombre, descripcion? } ──
  const normalizar = (item: any): ItemSimple & { descripcion?: string } => {
    if (tab === 'categorias')  return { id: item.IdCategoria,  nombre: item.NombreCategoria, descripcion: item.Descripcion ?? '' };
    if (tab === 'tallas')      return { id: item.IdTalla,      nombre: item.NombreTalla };
    if (tab === 'colores')     return { id: item.IdColor,      nombre: item.NombreColor };
    if (tab === 'formaspago')  return { id: item.IdFormaPago,  nombre: item.NombreFormaPago };
    return                            { id: item.IdRol,        nombre: item.NombreRol };
  };

  // ── Abrir modales ──
  const abrirCrear = () => {
    setNombre(''); setDesc(''); setMsgModal(null); setModal('crear');
  };

  const abrirEditar = (item: any) => {
    const n = normalizar(item);
    setSeleccionado(item);
    setNombre(n.nombre);
    setDesc(n.descripcion ?? '');
    setMsgModal(null);
    setModal('editar');
  };

  const cerrar = () => { setModal(null); setSeleccionado(null); };

  // ── Guardar ──
  const guardar = async () => {
    if (!nombre.trim()) { setMsgModal('❌ El nombre es requerido'); return; }
    setGuardando(true); setMsgModal(null);
    try {
      const body = buildBody();
      if (modal === 'crear') {
        await apiFetch(`/configuracion/${tab}`, { method: 'POST', body: JSON.stringify(body) });
      } else if (modal === 'editar' && seleccionado) {
        const n = normalizar(seleccionado);
        await apiFetch(`/configuracion/${tab}/${n.id}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      setMsgModal('✅ Guardado correctamente');
      cargar(tab);
      setTimeout(cerrar, 900);
    } catch (e: any) {
      setMsgModal(`❌ ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const buildBody = () => {
    if (tab === 'categorias')  return { NombreCategoria: nombre.trim(), Descripcion: descripcion.trim() };
    if (tab === 'tallas')      return { NombreTalla: nombre.trim() };
    if (tab === 'colores')     return { NombreColor: nombre.trim() };
    if (tab === 'formaspago')  return { NombreFormaPago: nombre.trim() };
    return                            { NombreRol: nombre.trim() };
  };

  // ── Eliminar ──
  const eliminar = async (id: number) => {
    try {
      await apiFetch(`/configuracion/${tab}/${id}`, { method: 'DELETE' });
      setConfirmId(null);
      cargar(tab);
    } catch (e: any) {
      setConfirmId(null);
      setError(`${e.message}`);
      setTimeout(() => setError(null), 4000);
    }
  };

  // ── Labels ──
  const labelSingular: Record<string, string> = {
    categorias: 'categoría', tallas: 'talla', colores: 'color',
    formaspago: 'forma de pago', roles: 'rol',
  };

  const normalizados = items.map(normalizar);

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión de tablas del sistema</p>
        </div>
        <button onClick={abrirCrear}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Agregar {labelSingular[tab]}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key}
              onClick={() => { setTab(t.key); setItems([]); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm'
              }`}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      {cargando && (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Cargando...</div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">⚠️ {error}</div>
      )}

      {!cargando && !error && (
        <div className="bg-white rounded-2xl shadow-sm p-5">

          {/* Header tabla */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700 capitalize">
              {TABS.find(t => t.key === tab)?.label} —{' '}
              <span className="text-purple-600 font-bold">{normalizados.length}</span> registros
            </p>
          </div>

          {normalizados.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No hay {labelSingular[tab]}s registradas. Agrega la primera.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {normalizados.map((item, idx) => (
                <div key={`${item.id}-${idx}`}
                  className="flex items-center justify-between bg-gray-50 hover:bg-purple-50 rounded-xl px-4 py-3 transition-colors group">

                  <div className="flex items-center gap-2 min-w-0">
                    {/* Dot de color si es la tab de colores */}
                    {tab === 'colores' && colorDot(item.nombre)}

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.nombre}</p>
                      {tab === 'categorias' && item.descripcion && (
                        <p className="text-xs text-gray-400 truncate">{item.descripcion}</p>
                      )}
                      <p className="text-xs text-gray-300">ID: {item.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button onClick={() => abrirEditar(items[idx])}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white text-purple-500 transition-all"
                      title="Editar">
                      <Pencil size={14} />
                    </button>

                    {/* Confirmar eliminar inline */}
                    {confirmId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => eliminar(item.id)}
                          className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          title="Confirmar">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setConfirmId(null)}
                          className="p-1.5 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                          title="Cancelar">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmId(item.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white text-red-400 transition-all"
                        title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modal crear / editar ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800 capitalize">
                {modal === 'crear' ? `Nueva ${labelSingular[tab]}` : `Editar ${labelSingular[tab]}`}
              </h2>
              <button type = "button" onClick={cerrar} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
                <input
                  type="text" value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && guardar()}
                  autoFocus
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder={`Nombre de la ${labelSingular[tab]}`}
                />
              </div>

              {/* Descripción solo para categorías */}
              {tab === 'categorias' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
                  <input
                    type="text" value={descripcion}
                    onChange={e => setDesc(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Descripción opcional"
                  />
                </div>
              )}

              {/* Preview de color */}
              {tab === 'colores' && nombre && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {colorDot(nombre)}
                  <span>Vista previa del color</span>
                </div>
              )}

              {msgModal && <p className="text-sm text-center">{msgModal}</p>}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={cerrar}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
