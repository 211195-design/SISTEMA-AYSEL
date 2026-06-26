'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import {
  Tag, Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight,
  Users, Calendar, Percent, UserPlus, UserMinus, Search
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Promocion {
  IdPromocion: number; NombrePromocion: string; Descuento: string;
  FechaInicio: string; FechaFin: string; Estado: number;
  TotalClientes: number; EstadoVigencia: 'Activa' | 'Próxima' | 'Vencida' | 'Inactiva';
}
interface PromocionDetalle extends Promocion {
  clientes: ClientePromo[];
}
interface ClientePromo {
  IdCliente: number; DNI: string; Nombres: string; Apellidos: string; Telefono: string;
}
interface Cliente {
  IdCliente: number; DNI: string; Nombres: string; Apellidos: string;
}

const FORM_VACIO = {
  NombrePromocion: '', Descuento: '', FechaInicio: '', FechaFin: '',
};

const VIGENCIA_COLOR: Record<string, string> = {
  'Activa':   'bg-green-100 text-green-600',
  'Próxima':  'bg-blue-100 text-blue-600',
  'Vencida':  'bg-gray-100 text-gray-400',
  'Inactiva': 'bg-red-100 text-red-400',
};

const fechaLocal = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PromocionesPage() {
  const [promociones, setPromociones]   = useState<Promocion[]>([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // Modal crear/editar
  const [modal, setModal]               = useState<'crear' | 'editar' | null>(null);
  const [seleccionado, setSeleccionado] = useState<Promocion | null>(null);
  const [form, setForm]                 = useState(FORM_VACIO);
  const [guardando, setGuardando]       = useState(false);
  const [msgModal, setMsgModal]         = useState<string | null>(null);

  // Modal detalle + clientes
  const [detalle, setDetalle]           = useState<PromocionDetalle | null>(null);
  const [cargandoDet, setCargandoDet]   = useState(false);

  // Asignar cliente
  const [todosClientes, setTodosClientes] = useState<Cliente[]>([]);
  const [busqCliente, setBusqCliente]   = useState('');
  const [asignando, setAsignando]       = useState(false);

  const cargar = () => {
    setCargando(true);
    apiFetch<{ ok: boolean; data: Promocion[] }>('/promociones')
      .then(r => setPromociones(r.data))
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  // ── Stats ──
  const activas  = promociones.filter(p => p.EstadoVigencia === 'Activa').length;
  const proximas = promociones.filter(p => p.EstadoVigencia === 'Próxima').length;
  const vencidas = promociones.filter(p => p.EstadoVigencia === 'Vencida').length;

  // ── Modales crear/editar ──
  const abrirCrear = () => {
    setForm(FORM_VACIO); setMsgModal(null); setModal('crear');
  };

  const abrirEditar = (p: Promocion) => {
    setSeleccionado(p);
    setForm({
      NombrePromocion: p.NombrePromocion,
      Descuento:       String(p.Descuento),
      FechaInicio:     p.FechaInicio.split('T')[0],
      FechaFin:        p.FechaFin.split('T')[0],
    });
    setMsgModal(null);
    setModal('editar');
  };

  const cerrar = () => { setModal(null); setSeleccionado(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const guardar = async () => {
    setGuardando(true); setMsgModal(null);
    try {
      const body = { ...form, Descuento: Number(form.Descuento) };
      if (modal === 'crear') {
        await apiFetch('/promociones', { method: 'POST', body: JSON.stringify(body) });
      } else if (modal === 'editar' && seleccionado) {
        await apiFetch(`/promociones/${seleccionado.IdPromocion}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      setMsgModal('✅ Guardado correctamente');
      cargar();
      setTimeout(cerrar, 1000);
    } catch (e: any) {
      setMsgModal(`❌ ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // ── Toggle estado ──
  const toggleEstado = async (p: Promocion) => {
    try {
      await apiFetch(`/promociones/${p.IdPromocion}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: p.Estado === 1 ? 0 : 1 }),
      });
      cargar();
    } catch (e: any) { alert(e.message); }
  };

  // ── Eliminar ──
  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta promoción? También se quitarán los clientes asignados.')) return;
    try {
      await apiFetch(`/promociones/${id}`, { method: 'DELETE' });
      cargar();
    } catch (e: any) { alert(e.message); }
  };

  // ── Modal detalle clientes ──
  const abrirDetalle = async (p: Promocion) => {
    setCargandoDet(true);
    setDetalle(null);
    setBusqCliente('');
    try {
      const [det, cli] = await Promise.all([
        apiFetch<{ ok: boolean; data: PromocionDetalle }>(`/promociones/${p.IdPromocion}`),
        apiFetch<{ ok: boolean; data: Cliente[] }>('/ventas/clientes'),
      ]);
      setDetalle(det.data);
      setTodosClientes(cli.data);
    } finally {
      setCargandoDet(false);
    }
  };

  const asignarCliente = async (idCliente: number) => {
    if (!detalle) return;
    setAsignando(true);
    try {
      await apiFetch(`/promociones/${detalle.IdPromocion}/clientes`, {
        method: 'POST',
        body: JSON.stringify({ IdCliente: idCliente }),
      });
      await abrirDetalle(detalle);
      cargar();
      setBusqCliente('');
    } catch (e: any) { alert(e.message); }
    finally { setAsignando(false); }
  };

  const quitarCliente = async (idCliente: number) => {
    if (!detalle) return;
    try {
      await apiFetch(`/promociones/${detalle.IdPromocion}/clientes/${idCliente}`, {
        method: 'DELETE',
      });
      await abrirDetalle(detalle);
      cargar();
    } catch (e: any) { alert(e.message); }
  };

  // Clientes disponibles para asignar (que no están ya en la promo)
  const clientesAsignados = new Set(detalle?.clientes.map(c => c.IdCliente) ?? []);
  const clientesDisponibles = todosClientes.filter(c =>
    !clientesAsignados.has(c.IdCliente) &&
    (`${c.Nombres} ${c.Apellidos}`.toLowerCase().includes(busqCliente.toLowerCase()) ||
     c.DNI.includes(busqCliente))
  );

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Cargando promociones...</div>
  );
  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">⚠️ {error}</div>
  );

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Promociones</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión de descuentos y eventos especiales</p>
        </div>
        <button type="button" onClick={abrirCrear} aria-label="Nueva promoción"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Nueva promoción
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-purple-50 w-fit mb-3"><Tag size={20} className="text-purple-500" /></div>
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-800">{promociones.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-green-50 w-fit mb-3"><Tag size={20} className="text-green-500" /></div>
          <p className="text-xs text-gray-400">Activas</p>
          <p className="text-2xl font-bold text-gray-800">{activas}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-blue-50 w-fit mb-3"><Tag size={20} className="text-blue-500" /></div>
          <p className="text-xs text-gray-400">Próximas</p>
          <p className="text-2xl font-bold text-gray-800">{proximas}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-gray-100 w-fit mb-3"><Tag size={20} className="text-gray-400" /></div>
          <p className="text-xs text-gray-400">Vencidas</p>
          <p className="text-2xl font-bold text-gray-800">{vencidas}</p>
        </div>
      </div>

      {/* Tarjetas de promociones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promociones.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400 text-sm bg-white rounded-2xl shadow-sm">
            No hay promociones. Crea la primera.
          </div>
        ) : promociones.map(p => (
          <div key={p.IdPromocion}
            className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${
              p.EstadoVigencia === 'Activa'   ? 'border-green-400' :
              p.EstadoVigencia === 'Próxima'  ? 'border-blue-400'  :
              p.EstadoVigencia === 'Vencida'  ? 'border-gray-200'  :
              'border-red-300'
            }`}>

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{p.NombrePromocion}</h3>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${VIGENCIA_COLOR[p.EstadoVigencia]}`}>
                  {p.EstadoVigencia}
                </span>
              </div>
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <button type="button" onClick={() => abrirEditar(p)} aria-label="Editar"
                  className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors">
                  <Pencil size={14} />
                </button>
                <button
                    type="button"
                    onClick={() => toggleEstado(p)}
                    aria-label={p.Estado === 1 ? 'Desactivar' : 'Activar'}
                    title={p.Estado === 1 ? 'Desactivar' : 'Activar'}
                    className={`p-1.5 rounded-lg transition-colors ${
                        p.Estado === 1
                        ? 'hover:bg-red-50 text-red-400'
                        : 'hover:bg-green-50 text-green-500'
                    }`}
                    >
                    {p.Estado === 1
                        ? <ToggleRight size={14} />
                        : <ToggleLeft size={14} />
                    }
                </button>
                <button type="button" onClick={() => eliminar(p.IdPromocion)} aria-label="Eliminar"
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Descuento */}
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-purple-50 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <Percent size={16} className="text-purple-500" />
                <span className="text-xl font-bold text-purple-600">{Number(p.Descuento).toFixed(0)}%</span>
                <span className="text-xs text-gray-400">descuento</span>
              </div>
            </div>

            {/* Fechas */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
              <Calendar size={13} />
              <span>{fechaLocal(p.FechaInicio)}</span>
              <span>→</span>
              <span>{fechaLocal(p.FechaFin)}</span>
            </div>

            {/* Clientes */}
            <button type="button" onClick={() => abrirDetalle(p)} aria-label="Ver detalles"
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-purple-50 rounded-xl px-3 py-2 transition-colors">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={14} />
                <span>{p.TotalClientes} cliente{p.TotalClientes !== 1 ? 's' : ''} asignado{p.TotalClientes !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-xs text-purple-500 font-medium">Gestionar →</span>
            </button>
          </div>
        ))}
      </div>

      {/* ── Modal crear / editar ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                {modal === 'crear' ? 'Nueva Promoción' : 'Editar Promoción'}
              </h2>
              <button type ="button" onClick={cerrar} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre de la promoción *</label>
                <input name="NombrePromocion" value={form.NombrePromocion} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Ej: Día de la Madre, Black Friday..." />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Descuento (%) *</label>
                <div className="relative">
                  <input name="Descuento" type="number" min="1" max="100"
                    value={form.Descuento} onChange={handleChange}
                    className="w-full px-3 py-2 pr-8 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="10" />
                  <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fecha inicio *</label>
                  <input type="date" name="FechaInicio" value={form.FechaInicio} onChange={handleChange} aria-label="Fecha inicio"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fecha fin *</label>
                  <input type="date" name="FechaFin" value={form.FechaFin} onChange={handleChange} aria-label="Fecha fin"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              </div>

              {form.Descuento && form.FechaInicio && form.FechaFin && (
                <div className="bg-purple-50 rounded-xl p-3 text-sm text-purple-700">
                  📅 Vigente del <strong>{fechaLocal(form.FechaInicio)}</strong> al <strong>{fechaLocal(form.FechaFin)}</strong> con <strong>{form.Descuento}%</strong> de descuento
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

      {/* ── Modal detalle / gestión de clientes ── */}
      {(detalle || cargandoDet) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">

            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {detalle ? detalle.NombrePromocion : 'Cargando...'}
                </h2>
                {detalle && (
                  <p className="text-xs text-gray-400">
                    {Number(detalle.Descuento).toFixed(0)}% descuento ·{' '}
                    {fechaLocal(detalle.FechaInicio)} → {fechaLocal(detalle.FechaFin)}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setDetalle(null)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            {cargandoDet ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Cargando...</div>
            ) : detalle && (
              <div className="flex flex-col flex-1 overflow-hidden p-6 gap-4">

                {/* Buscar y asignar cliente */}
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Asignar cliente a esta promoción</p>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Buscar por nombre o DNI..."
                      value={busqCliente} onChange={e => setBusqCliente(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>

                  {busqCliente && clientesDisponibles.length > 0 && (
                    <div className="border border-gray-200 rounded-xl mt-1 max-h-36 overflow-y-auto shadow-sm">
                      {clientesDisponibles.map(c => (
                        <button key={c.IdCliente}
                          onClick={() => asignarCliente(c.IdCliente)}
                          disabled={asignando}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-50 text-left transition-colors border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{c.Nombres} {c.Apellidos}</p>
                            <p className="text-xs text-gray-400">DNI: {c.DNI}</p>
                          </div>
                          <UserPlus size={14} className="text-purple-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                  {busqCliente && clientesDisponibles.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1 px-2">No hay clientes disponibles</p>
                  )}
                </div>

                {/* Clientes asignados */}
                <div className="flex-1 overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    Clientes asignados ({detalle.clientes.length})
                  </p>
                  {detalle.clientes.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No hay clientes asignados. Busca uno arriba.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {detalle.clientes.map(c => (
                        <div key={c.IdCliente}
                          className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{c.Nombres} {c.Apellidos}</p>
                            <p className="text-xs text-gray-400">DNI: {c.DNI} · {c.Telefono}</p>
                          </div>
                          <button type="button" onClick={() => quitarCliente(c.IdCliente)} aria-label="Quitar"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                            <UserMinus size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button type="button" onClick={() => setDetalle(null)} aria-label="Cerrar"
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 shrink-0">
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}