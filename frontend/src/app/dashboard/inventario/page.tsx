'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Package, AlertTriangle, CheckCircle, Pencil, X } from 'lucide-react';

interface ItemInventario {
  IdInventario: number;
  StockActual: number;
  IdProducto: number;
  Codigo: string;
  NombreProducto: string;
  PrecioVenta: string;
  StockMinimo: number;
  Estado: number;
  NombreCategoria: string;
  NombreTalla: string;
  NombreColor: string;
}

export default function InventarioPage() {
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [busqueda, setBusqueda]     = useState('');
  const [editando, setEditando]     = useState<ItemInventario | null>(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [guardando, setGuardando]   = useState(false);
  const [mensaje, setMensaje]       = useState<string | null>(null);

  const cargarInventario = () => {
    setCargando(true);
    apiFetch<{ ok: boolean; data: ItemInventario[] }>('/inventario')
      .then(r => setInventario(r.data))
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarInventario(); }, []);

  const filtrado = inventario.filter(i =>
    i.NombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.Codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.NombreCategoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirEditar = (item: ItemInventario) => {
    setEditando(item);
    setNuevoStock(String(item.StockActual));
    setMensaje(null);
  };

  const cerrarEditar = () => {
    setEditando(null);
    setNuevoStock('');
  };

  const guardarStock = async () => {
    if (!editando) return;
    setGuardando(true);
    try {
      await apiFetch(`/inventario/${editando.IdInventario}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ stockActual: Number(nuevoStock) }),
      });
      setMensaje('✅ Stock actualizado correctamente');
      cargarInventario();
      setTimeout(() => { cerrarEditar(); setMensaje(null); }, 1200);
    } catch (e: any) {
      setMensaje(`❌ ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // Stats rápidas
  const totalProductos  = inventario.length;
  const stockBajo       = inventario.filter(i => i.StockActual <= i.StockMinimo).length;
  const valorTotal      = inventario.reduce((acc, i) => acc + i.StockActual * Number(i.PrecioVenta), 0);

  const estadoStock = (item: ItemInventario) => {
    if (item.StockActual === 0)                  return { label: 'Sin stock',   color: 'bg-red-100 text-red-600' };
    if (item.StockActual <= item.StockMinimo)     return { label: 'Stock bajo',  color: 'bg-yellow-100 text-yellow-700' };
    return                                               { label: 'OK',          color: 'bg-green-100 text-green-600' };
  };

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Cargando inventario...
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">⚠️ {error}</div>
  );

  return (
    <div className="space-y-6">

      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        <p className="text-sm text-gray-400 mt-0.5">Control de stock por producto</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-purple-50 w-fit mb-3">
            <Package size={22} className="text-purple-500" />
          </div>
          <p className="text-xs text-gray-400">Total productos</p>
          <p className="text-2xl font-bold text-gray-800">{totalProductos}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-yellow-50 w-fit mb-3">
            <AlertTriangle size={22} className="text-yellow-500" />
          </div>
          <p className="text-xs text-gray-400">Stock bajo / sin stock</p>
          <p className="text-2xl font-bold text-gray-800">{stockBajo}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-green-50 w-fit mb-3">
            <CheckCircle size={22} className="text-green-500" />
          </div>
          <p className="text-xs text-gray-400">Valor total inventario</p>
          <p className="text-2xl font-bold text-gray-800">
            S/ {valorTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm p-5">

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por producto, código o categoría..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
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
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400">
                    No se encontraron resultados
                  </td>
                </tr>
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
                      <button
                        onClick={() => abrirEditar(item)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors"
                        title="Editar stock"
                      >
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

      {/* Modal editar stock */}
      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800">Actualizar Stock</h2>
              <button onClick={cerrarEditar} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-1">Producto</p>
            <p className="text-sm font-medium text-gray-800 mb-4">{editando.NombreProducto}</p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Stock mínimo</p>
                <p className="font-bold text-gray-700">{editando.StockMinimo}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Stock actual</p>
                <p className="font-bold text-gray-700">{editando.StockActual}</p>
              </div>
            </div>

            <label className="text-xs text-gray-500 mb-1 block">Nuevo stock</label>
            <input
              type="number"
              min="0"
              value={nuevoStock}
              onChange={e => setNuevoStock(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 mb-4"
            />

            {mensaje && (
              <p className="text-sm mb-3 text-center">{mensaje}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={cerrarEditar}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarStock}
                disabled={guardando}
                className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}