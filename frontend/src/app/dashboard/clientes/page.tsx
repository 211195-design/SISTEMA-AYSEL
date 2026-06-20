'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Users, Plus, Pencil, ToggleLeft, ToggleRight, X, History, Search } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Cliente {
  IdCliente: number; DNI: string; Nombres: string; Apellidos: string;
  Telefono: string; Direccion: string; FechaRegistro: string;
  Estado: number; TotalCompras: number; TotalGastado: string;
}
interface VentaHistorial {
  IdVenta: number; NumeroBoleta: string; FechaVenta: string;
  SubTotal: string; Descuento: string; Total: string;
  Estado: string; NombreFormaPago: string; TotalItems: number;
}
interface Historial {
  cliente: Cliente;
  historial: VentaHistorial[];
}

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const fechaLocal = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

const FORM_VACIO = { DNI: '', Nombres: '', Apellidos: '', Telefono: '', Direccion: '' };

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ClientesPage() {
  const [clientes, setClientes]     = useState<Cliente[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [busqueda, setBusqueda]     = useState('');
  const [modal, setModal]           = useState<'crear' | 'editar' | null>(null);
  const [seleccionado, setSeleccionado] = useState<Cliente | null>(null);
  const [form, setForm]             = useState(FORM_VACIO);
  const [guardando, setGuardando]   = useState(false);
  const [msgModal, setMsgModal]     = useState<string | null>(null);
  const [historial, setHistorial]   = useState<Historial | null>(null);
  const [cargandoHist, setCargandoHist] = useState(false);

  // Búsqueda por DNI rápida
  const [busqDNI, setBusqDNI]       = useState('');
  const [resultDNI, setResultDNI]   = useState<Cliente | null>(null);
  const [errorDNI, setErrorDNI]     = useState<string | null>(null);

  const cargar = () => {
    setCargando(true);
    apiFetch<{ ok: boolean; data: Cliente[] }>('/clientes')
      .then(r => setClientes(r.data))
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const filtrado = clientes.filter(c =>
    `${c.Nombres} ${c.Apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.DNI.includes(busqueda) ||
    c.Telefono.includes(busqueda)
  );

  // ── Modal crear / editar ──
  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setMsgModal(null);
    setModal('crear');
  };

  const abrirEditar = (c: Cliente) => {
    setSeleccionado(c);
    setForm({ DNI: c.DNI, Nombres: c.Nombres, Apellidos: c.Apellidos, Telefono: c.Telefono, Direccion: c.Direccion ?? '' });
    setMsgModal(null);
    setModal('editar');
  };

  const cerrar = () => { setModal(null); setSeleccionado(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const guardar = async () => {
    setGuardando(true); setMsgModal(null);
    try {
      if (modal === 'crear') {
        await apiFetch('/clientes', { method: 'POST', body: JSON.stringify(form) });
      } else if (modal === 'editar' && seleccionado) {
        await apiFetch(`/clientes/${seleccionado.IdCliente}`, { method: 'PUT', body: JSON.stringify(form) });
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

  const toggleEstado = async (c: Cliente) => {
    try {
      await apiFetch(`/clientes/${c.IdCliente}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: c.Estado === 1 ? 0 : 1 }),
      });
      cargar();
    } catch (e: any) { alert(e.message); }
  };

  // ── Historial ──
  const abrirHistorial = async (c: Cliente) => {
    setCargandoHist(true);
    setHistorial(null);
    try {
      const r = await apiFetch<{ ok: boolean; data: Historial }>(`/clientes/${c.IdCliente}/historial`);
      setHistorial(r.data);
    } finally {
      setCargandoHist(false);
    }
  };

  // ── Búsqueda por DNI ──
  const buscarPorDNI = async () => {
    if (!busqDNI.trim()) return;
    setErrorDNI(null); setResultDNI(null);
    try {
      const r = await apiFetch<{ ok: boolean; data: Cliente }>(`/clientes/dni/${busqDNI.trim()}`);
      setResultDNI(r.data);
    } catch {
      setErrorDNI('No se encontró ningún cliente con ese DNI');
    }
  };

  // Stats
  const activos   = clientes.filter(c => c.Estado === 1).length;
  const inactivos = clientes.filter(c => c.Estado === 0).length;
  const topCliente = [...clientes].sort((a, b) => Number(b.TotalGastado) - Number(a.TotalGastado))[0];

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Cargando clientes...</div>
  );
  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">⚠️ {error}</div>
  );

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión de clientes registrados</p>
        </div>
        <button onClick={abrirCrear}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-purple-50 w-fit mb-3">
            <Users size={22} className="text-purple-500" />
          </div>
          <p className="text-xs text-gray-400">Total clientes</p>
          <p className="text-2xl font-bold text-gray-800">{clientes.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-green-50 w-fit mb-3">
            <Users size={22} className="text-green-500" />
          </div>
          <p className="text-xs text-gray-400">Activos / Inactivos</p>
          <p className="text-2xl font-bold text-gray-800">{activos} <span className="text-gray-300 font-normal">/</span> <span className="text-gray-400 text-lg">{inactivos}</span></p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-pink-50 w-fit mb-3">
            <Users size={22} className="text-pink-500" />
          </div>
          <p className="text-xs text-gray-400">Mejor cliente</p>
          {topCliente ? (
            <>
              <p className="text-base font-bold text-gray-800">{topCliente.Nombres} {topCliente.Apellidos}</p>
              <p className="text-xs text-pink-500 font-medium">{fmt(topCliente.TotalGastado)}</p>
            </>
          ) : <p className="text-sm text-gray-400">—</p>}
        </div>
      </div>

      {/* Búsqueda por DNI */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Búsqueda rápida por DNI</p>
        <div className="flex gap-2">
          <input
            type="text" placeholder="Ingresa el DNI..." value={busqDNI}
            onChange={e => setBusqDNI(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscarPorDNI()}
            className="w-48 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button onClick={buscarPorDNI}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700">
            <Search size={14} /> Buscar
          </button>
          {(resultDNI || errorDNI) && (
            <button type = "button" onClick={() => { setResultDNI(null); setErrorDNI(null); setBusqDNI(''); }} title="Limpiar búsqueda" aria-label="Limpiar búsqueda"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50">
              <X size={14} />
            </button>
          )}
        </div>
        {errorDNI && <p className="text-sm text-red-500 mt-2">{errorDNI}</p>}
        {resultDNI && (
          <div className="mt-3 flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-bold text-gray-800">{resultDNI.Nombres} {resultDNI.Apellidos}</p>
              <p className="text-xs text-gray-500">DNI: {resultDNI.DNI} · Tel: {resultDNI.Telefono}</p>
            </div>
            <div className="flex gap-2">
              <button type = "button" onClick={() => abrirEditar(resultDNI)} title="Editar cliente" aria-label="Editar cliente"
                className="p-1.5 rounded-lg hover:bg-white text-purple-500 transition-colors">
                <Pencil size={15} />
              </button>
              <button type = "button" onClick={() => abrirHistorial(resultDNI)} title="Ver historial" aria-label="Ver historial"
                className="p-1.5 rounded-lg hover:bg-white text-blue-500 transition-colors">
                <History size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="mb-4">
          <input type="text" placeholder="Buscar por nombre, DNI o teléfono..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 pr-4">DNI</th>
                <th className="pb-3 pr-4">Nombre</th>
                <th className="pb-3 pr-4">Teléfono</th>
                <th className="pb-3 pr-4">Dirección</th>
                <th className="pb-3 pr-4">Compras</th>
                <th className="pb-3 pr-4">Total gastado</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrado.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No se encontraron clientes</td></tr>
              ) : filtrado.map(c => (
                <tr key={c.IdCliente} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-500">{c.DNI}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-800">{c.Nombres} {c.Apellidos}</p>
                    <p className="text-xs text-gray-400">{fechaLocal(c.FechaRegistro)}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{c.Telefono}</td>
                  <td className="py-3 pr-4 text-gray-500 max-w-[160px] truncate">{c.Direccion ?? '—'}</td>
                  <td className="py-3 pr-4 text-center font-medium text-gray-700">{c.TotalCompras}</td>
                  <td className="py-3 pr-4 font-medium text-gray-800">{fmt(c.TotalGastado)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.Estado === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {c.Estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => abrirEditar(c)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors" title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => abrirHistorial(c)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="Historial">
                        <History size={15} />
                      </button>
                      <button type="button" onClick={() => toggleEstado(c)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          c.Estado === 1 ? 'hover:bg-red-50 text-red-400' : 'hover:bg-green-50 text-green-500'
                        }`} title={c.Estado === 1 ? 'Desactivar' : 'Activar'}>
                        {c.Estado === 1 ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal crear / editar ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                {modal === 'crear' ? 'Nuevo Cliente' : 'Editar Cliente'}
              </h2>
              <button type = "button" onClick={cerrar} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar modal"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">DNI *</label>
                  <input name="DNI" value={form.DNI} onChange={handleChange} maxLength={8}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="12345678" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
                  <input name="Telefono" value={form.Telefono} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="987000000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nombres *</label>
                  <input name="Nombres" value={form.Nombres} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Ana" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Apellidos *</label>
                  <input name="Apellidos" value={form.Apellidos} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="García" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Dirección</label>
                <input name="Direccion" value={form.Direccion} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Av. Lima 101" />
              </div>

              {msgModal && <p className="text-sm text-center">{msgModal}</p>}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button type = "button" onClick={cerrar}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                aria-label="Cancelar">
                Cancelar
              </button>
              <button type = "button" onClick={guardar} disabled={guardando}
                className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium"
                aria-label="Guardar">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal historial ── */}
      {(historial || cargandoHist) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {historial ? `${historial.cliente.Nombres} ${historial.cliente.Apellidos}` : 'Cargando...'}
                </h2>
                {historial && (
                  <p className="text-xs text-gray-400">
                    DNI: {historial.cliente.DNI} · {historial.cliente.TotalCompras} compras · {fmt(historial.cliente.TotalGastado)} gastado
                  </p>
                )}
              </div>
              <button type = "button" onClick={() => setHistorial(null)} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {cargandoHist && (
                <p className="text-center text-gray-400 text-sm py-8">Cargando historial...</p>
              )}
              {historial && historial.historial.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">Este cliente no tiene compras registradas</p>
              )}
              {historial && historial.historial.length > 0 && (
                <div className="space-y-3">
                  {historial.historial.map(v => (
                    <div key={v.IdVenta} className={`rounded-xl border px-4 py-3 ${
                      v.Estado === 'Completado' ? 'border-gray-100 bg-gray-50' : 'border-red-100 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-purple-600">{v.NumeroBoleta}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          v.Estado === 'Completado' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                        }`}>{v.Estado}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">{fechaLocal(v.FechaVenta)} · {v.NombreFormaPago} · {v.TotalItems} item(s)</p>
                        </div>
                        <p className="font-bold text-gray-800">{fmt(v.Total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 pt-0 shrink-0">
              <button type = "button" onClick={() => setHistorial(null)}
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                aria-label="Cerrar modal">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
