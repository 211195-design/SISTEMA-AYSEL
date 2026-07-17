'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Package, AlertTriangle, CheckCircle, Pencil, X, Plus } from 'lucide-react';

interface ItemInventario {
  IdInventario:    number;
  StockActual:     number;
  IdProducto:      number;
  IdTalla:         number | null;
  IdColor:         number | null;
  Codigo:          string;
  NombreProducto:  string;
  PrecioVenta:     string;
  StockMinimo:     number;
  Estado:          number;
  NombreCategoria: string;
  NombreTalla:     string | null;
  NombreColor:     string | null;
}
interface Producto {
  IdProducto:      number;
  Codigo:          string;
  NombreProducto:  string;
  NombreCategoria: string;
  PrecioVenta:     string;
  StockMinimo:     number;
  IdCategoria:     number;
  Estado:          number;
}
interface Talla { IdTalla: number; NombreTalla: string; }
interface Color { IdColor: number; NombreColor: string; }

const FORM_EDITAR_VACIO  = { stockActual: '', stockMinimo: '', precioVenta: '', idTalla: '', idColor: '' };
const FORM_AGREGAR_VACIO = {
  idProducto: '', stockActual: '', stockMinimo: '',
  precioVenta: '', idTalla: '', idColor: '',
  // Solo lectura — se autocompletan
  _codigo: '', _categoria: '', _nombre: '',
};

export default function InventarioPage() {
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [tallas,     setTallas]     = useState<Talla[]>([]);
  const [colores,    setColores]    = useState<Color[]>([]);
  const [productos,  setProductos]  = useState<Producto[]>([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [busqueda,   setBusqueda]   = useState('');

  // Modal editar
  const [editando,  setEditando]  = useState<ItemInventario | null>(null);
  const [formEdit,  setFormEdit]  = useState(FORM_EDITAR_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [msgEdit,   setMsgEdit]   = useState<string | null>(null);

  // Modal agregar
  const [modalAgregar, setModalAgregar] = useState(false);
  const [formAdd,      setFormAdd]      = useState(FORM_AGREGAR_VACIO);
  const [agregando,    setAgregando]    = useState(false);
  const [msgAdd,       setMsgAdd]       = useState<string | null>(null);
  const [busqProd,     setBusqProd]     = useState('');
  const [dropOpen,     setDropOpen]     = useState(false);

  // ── Carga ──────────────────────────────────────────────────────────────────
  const cargarInventario = () => {
    setCargando(true);
    Promise.all([
      apiFetch<{ ok: boolean; data: ItemInventario[] }>('/inventario'),
      apiFetch<{ ok: boolean; data: Talla[]          }>('/productos/tallas'),
      apiFetch<{ ok: boolean; data: Color[]          }>('/productos/colores'),
      apiFetch<{ ok: boolean; data: Producto[]       }>('/productos'),
    ])
      .then(([inv, t, c, p]) => {
        setInventario(inv.data);
        setTallas(t.data);
        setColores(c.data);
        setProductos(p.data);
      })
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarInventario(); }, []);

  // ── Filtro tabla ───────────────────────────────────────────────────────────
  const filtrado = inventario.filter(i =>
    i.NombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.Codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.NombreCategoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── Productos filtrados en buscador ────────────────────────────────────────
  const productosFiltrados = productos.filter(p =>
    p.NombreProducto.toLowerCase().includes(busqProd.toLowerCase()) ||
    p.Codigo.toLowerCase().includes(busqProd.toLowerCase())
  );

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const totalProductos = inventario.length;
  const stockBajo      = inventario.filter(i => i.StockActual <= i.StockMinimo).length;
  const valorTotal     = inventario.reduce((acc, i) => acc + i.StockActual * Number(i.PrecioVenta), 0);

  const estadoStock = (item: ItemInventario) => {
    if (item.StockActual === 0)               return { label: 'Sin stock',  color: 'bg-red-100 text-red-600' };
    if (item.StockActual <= item.StockMinimo) return { label: 'Stock bajo', color: 'bg-yellow-100 text-yellow-700' };
    return                                           { label: 'OK',         color: 'bg-green-100 text-green-600' };
  };

  // ── Seleccionar producto en modal agregar → autocompleta campos ────────────
  const seleccionarProducto = (p: Producto) => {
    // Buscar en inventario si ya tiene talla/color asignados
    const enInv = inventario.find(i => i.IdProducto === p.IdProducto);
    setFormAdd({
      idProducto:  String(p.IdProducto),
      stockActual: '',                                          // ← usuario ingresa
      stockMinimo: String(p.StockMinimo),                      // ← autocompletado
      precioVenta: String(Number(p.PrecioVenta).toFixed(2)),   // ← autocompletado
      idTalla:     enInv?.IdTalla  ? String(enInv.IdTalla)  : '',
      idColor:     enInv?.IdColor  ? String(enInv.IdColor)  : '',
      _codigo:     p.Codigo,
      _categoria:  p.NombreCategoria,
      _nombre:     p.NombreProducto,
    });
    setBusqProd(p.NombreProducto);
    setDropOpen(false);
  };

  const limpiarProducto = () => {
    setFormAdd(FORM_AGREGAR_VACIO);
    setBusqProd('');
    setDropOpen(false);
  };

  // ── Modal editar ───────────────────────────────────────────────────────────
  const abrirEditar = (item: ItemInventario) => {
    setEditando(item);
    setFormEdit({
      stockActual: String(item.StockActual),
      stockMinimo: String(item.StockMinimo),
      precioVenta: String(Number(item.PrecioVenta).toFixed(2)),
      idTalla:     item.IdTalla ? String(item.IdTalla) : '',
      idColor:     item.IdColor ? String(item.IdColor) : '',
    });
    setMsgEdit(null);
  };
  const cerrarEditar = () => { setEditando(null); setFormEdit(FORM_EDITAR_VACIO); };

  const guardar = async () => {
    if (!editando) return;
    setGuardando(true);
    try {
      await apiFetch(`/inventario/${editando.IdInventario}/completo`, {
        method: 'PUT',
        body: JSON.stringify({
          stockActual: Number(formEdit.stockActual),
          stockMinimo: Number(formEdit.stockMinimo),
          precioVenta: Number(formEdit.precioVenta),
          idTalla:     formEdit.idTalla ? Number(formEdit.idTalla) : null,
          idColor:     formEdit.idColor ? Number(formEdit.idColor) : null,
        }),
      });
      setMsgEdit('✅ Actualizado correctamente');
      cargarInventario();
      setTimeout(() => { cerrarEditar(); setMsgEdit(null); }, 1200);
    } catch (e: any) {
      setMsgEdit(`❌ ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // ── Modal agregar ──────────────────────────────────────────────────────────
  const abrirAgregar = () => {
    setFormAdd(FORM_AGREGAR_VACIO);
    setBusqProd('');
    setDropOpen(false);
    setMsgAdd(null);
    setModalAgregar(true);
  };
  const cerrarAgregar = () => { setModalAgregar(false); limpiarProducto(); };

  const agregar = async () => {
    if (!formAdd.idProducto)  { setMsgAdd('❌ Selecciona un producto'); return; }
    if (!formAdd.stockActual) { setMsgAdd('❌ Ingresa el stock actual'); return; }
    if (!formAdd.precioVenta) { setMsgAdd('❌ Ingresa el precio de venta'); return; }
    setAgregando(true);
    try {
      await apiFetch('/inventario', {
        method: 'POST',
        body: JSON.stringify({
          idProducto:  Number(formAdd.idProducto),
          stockActual: Number(formAdd.stockActual),
          stockMinimo: Number(formAdd.stockMinimo),
          precioVenta: Number(formAdd.precioVenta),
          idTalla:     formAdd.idTalla ? Number(formAdd.idTalla) : null,
          idColor:     formAdd.idColor ? Number(formAdd.idColor) : null,
        }),
      });
      setMsgAdd('✅ Producto agregado al inventario');
      cargarInventario();
      setTimeout(() => { cerrarAgregar(); setMsgAdd(null); }, 1200);
    } catch (e: any) {
      setMsgAdd(`❌ ${e.message}`);
    } finally {
      setAgregando(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Cargando inventario...</div>
  );
  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">⚠️ {error}</div>
  );

  return (
    <div className="space-y-6">

      {/* ── Título ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
          <p className="text-sm text-gray-400 mt-0.5">Control de stock por producto</p>
        </div>
        <button type="button" onClick={abrirAgregar}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-sm">
          <Plus size={16} /> Agregar al inventario
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-purple-50 w-fit mb-3"><Package size={22} className="text-purple-500" /></div>
          <p className="text-xs text-gray-400">Total productos</p>
          <p className="text-2xl font-bold text-gray-800">{totalProductos}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-yellow-50 w-fit mb-3"><AlertTriangle size={22} className="text-yellow-500" /></div>
          <p className="text-xs text-gray-400">Stock bajo / sin stock</p>
          <p className="text-2xl font-bold text-gray-800">{stockBajo}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-green-50 w-fit mb-3"><CheckCircle size={22} className="text-green-500" /></div>
          <p className="text-xs text-gray-400">Valor total inventario</p>
          <p className="text-2xl font-bold text-gray-800">
            S/ {valorTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="mb-4">
          <input type="text" placeholder="Buscar por producto, código o categoría..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 pr-4">Código</th>
                <th className="pb-3 pr-4">Producto</th>
                <th className="pb-3 pr-4">Categoría</th>
                <th className="pb-3 pr-4">Talla</th>
                <th className="pb-3 pr-4">Color</th>
                <th className="pb-3 pr-4">Precio</th>
                <th className="pb-3 pr-4">Stock mín.</th>
                <th className="pb-3 pr-4">Stock actual</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrado.length === 0 ? (
                <tr><td colSpan={10} className="py-8 text-center text-gray-400">No se encontraron resultados</td></tr>
              ) : filtrado.map(item => {
                const estado = estadoStock(item);
                return (
                  <tr key={item.IdInventario} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-gray-500">{item.Codigo}</td>
                    <td className="py-3 pr-4 font-medium text-gray-800">{item.NombreProducto}</td>
                    <td className="py-3 pr-4 text-gray-500">{item.NombreCategoria}</td>
                    <td className="py-3 pr-4 text-gray-500">{item.NombreTalla ?? '—'}</td>
                    <td className="py-3 pr-4 text-gray-500">{item.NombreColor ?? '—'}</td>
                    <td className="py-3 pr-4 text-gray-700">S/ {Number(item.PrecioVenta).toFixed(2)}</td>
                    <td className="py-3 pr-4 text-gray-500">{item.StockMinimo}</td>
                    <td className="py-3 pr-4 font-bold text-gray-800">{item.StockActual}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estado.color}`}>
                        {estado.label}
                      </span>
                    </td>
                    <td className="py-3">
                      <button type="button" onClick={() => abrirEditar(item)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors">
                        <Pencil size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL — AGREGAR AL INVENTARIO
      ══════════════════════════════════════════════════════════════ */}
      {modalAgregar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-50"><Plus size={16} className="text-purple-600" /></div>
                <h2 className="text-base font-bold text-gray-800">Agregar al Inventario</h2>
              </div>
              <button type="button" onClick={cerrarAgregar} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* ── PASO 1: Buscar y seleccionar producto ── */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  1 · Seleccionar producto
                </p>

                {!formAdd.idProducto ? (
                  <div className="relative">
                    <input type="text"
                      placeholder="Buscar por nombre o código..."
                      value={busqProd}
                      onChange={e => { setBusqProd(e.target.value); setDropOpen(true); }}
                      onFocus={() => setDropOpen(true)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />

                    {dropOpen && busqProd && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                        {productosFiltrados.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-gray-400">Sin resultados</p>
                        ) : productosFiltrados.slice(0, 10).map(p => (
                          <button key={p.IdProducto} type="button"
                            onClick={() => seleccionarProducto(p)}
                            className="w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{p.NombreProducto}</p>
                                <p className="text-xs text-gray-400">{p.NombreCategoria}</p>
                              </div>
                              <span className="text-xs font-mono text-purple-500 shrink-0">{p.Codigo}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Producto seleccionado — chip con info */
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-purple-800">{formAdd._nombre}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-xs text-purple-500 font-mono">{formAdd._codigo}</span>
                          <span className="text-xs text-purple-400">·</span>
                          <span className="text-xs text-purple-600 font-medium">{formAdd._categoria}</span>
                        </div>
                      </div>
                      <button type="button" onClick={limpiarProducto}
                        className="text-purple-400 hover:text-purple-600 shrink-0 mt-0.5">
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── PASO 2: Datos de inventario (se muestran solo si hay producto) ── */}
              {formAdd.idProducto && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      2 · Datos del inventario
                    </p>

                    <div className="space-y-4">

                      {/* Campos de solo lectura — autocompletados */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Categoría</label>
                          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-500 cursor-not-allowed">
                            {formAdd._categoria || '—'}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Código</label>
                          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-mono cursor-not-allowed">
                            {formAdd._codigo || '—'}
                          </div>
                        </div>
                      </div>

                      {/* Precio venta — autocompletado pero editable */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Precio venta (S/) *
                            <span className="ml-1 text-purple-400 font-normal">autocompletado</span>
                          </label>
                          <input type="number" min="0" step="0.01"
                            value={formAdd.precioVenta}
                            onChange={e => setFormAdd(f => ({ ...f, precioVenta: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-purple-50/40" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            Stock mínimo *
                            <span className="ml-1 text-purple-400 font-normal">autocompletado</span>
                          </label>
                          <input type="number" min="0"
                            value={formAdd.stockMinimo}
                            onChange={e => setFormAdd(f => ({ ...f, stockMinimo: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-purple-50/40" />
                        </div>
                      </div>

                      {/* Stock actual — único campo obligatorio manual */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Stock actual *
                          <span className="ml-1 text-gray-400 font-normal">(ingresar manualmente)</span>
                        </label>
                        <input type="number" min="0" autoFocus
                          value={formAdd.stockActual}
                          onChange={e => setFormAdd(f => ({ ...f, stockActual: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                          placeholder="Ej: 20" />
                      </div>

                      {/* Talla + Color — autocompletados si existen, editables */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Talla</label>
                          <select value={formAdd.idTalla}
                            onChange={e => setFormAdd(f => ({ ...f, idTalla: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                            <option value="">Sin talla</option>
                            {tallas.map(t => (
                              <option key={t.IdTalla} value={t.IdTalla}>{t.NombreTalla}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Color</label>
                          <select value={formAdd.idColor}
                            onChange={e => setFormAdd(f => ({ ...f, idColor: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                            <option value="">Sin color</option>
                            {colores.map(c => (
                              <option key={c.IdColor} value={c.IdColor}>{c.NombreColor}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {msgAdd && (
                <p className={`text-sm text-center font-medium ${msgAdd.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                  {msgAdd}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 p-6 pt-0">
              <button type="button" onClick={cerrarAgregar}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="button" onClick={agregar} disabled={agregando || !formAdd.idProducto}
                className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-40 font-medium flex items-center justify-center gap-2">
                {agregando ? 'Agregando...' : <><Plus size={15} /> Agregar</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL — EDITAR INVENTARIO
      ══════════════════════════════════════════════════════════════ */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Editar Inventario</h2>
              <button type="button" onClick={cerrarEditar} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">

              {/* Info del producto — solo lectura */}
              <div className="bg-purple-50 rounded-xl px-4 py-3 space-y-1">
                <p className="text-xs text-purple-400">Producto</p>
                <p className="text-sm font-bold text-purple-800">{editando.NombreProducto}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono text-purple-500">{editando.Codigo}</span>
                  <span className="text-xs text-purple-400">·</span>
                  <span className="text-xs text-purple-600">{editando.NombreCategoria}</span>
                </div>
              </div>

              {/* Precio + Stock mínimo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Precio venta (S/) *</label>
                  <input type="number" min="0" step="0.01"
                    value={formEdit.precioVenta}
                    onChange={e => setFormEdit(f => ({ ...f, precioVenta: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Stock mínimo *</label>
                  <input type="number" min="0"
                    value={formEdit.stockMinimo}
                    onChange={e => setFormEdit(f => ({ ...f, stockMinimo: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              </div>

              {/* Stock actual */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Stock actual *</label>
                <input type="number" min="0"
                  value={formEdit.stockActual}
                  onChange={e => setFormEdit(f => ({ ...f, stockActual: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>

              {/* Talla + Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Talla</label>
                  <select value={formEdit.idTalla}
                    onChange={e => setFormEdit(f => ({ ...f, idTalla: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                    <option value="">Sin talla</option>
                    {tallas.map(t => <option key={t.IdTalla} value={t.IdTalla}>{t.NombreTalla}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Color</label>
                  <select value={formEdit.idColor}
                    onChange={e => setFormEdit(f => ({ ...f, idColor: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                    <option value="">Sin color</option>
                    {colores.map(c => <option key={c.IdColor} value={c.IdColor}>{c.NombreColor}</option>)}
                  </select>
                </div>
              </div>

              {msgEdit && (
                <p className={`text-sm text-center font-medium ${msgEdit.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                  {msgEdit}
                </p>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button type="button" onClick={cerrarEditar}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="button" onClick={guardar} disabled={guardando}
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
