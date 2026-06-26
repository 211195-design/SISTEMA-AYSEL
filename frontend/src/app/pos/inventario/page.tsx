'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Package, AlertTriangle, Search } from 'lucide-react';

interface Item {
  IdInventario: number; Codigo: string; NombreProducto: string;
  NombreCategoria: string; NombreTalla: string; NombreColor: string;
  StockActual: number; StockMinimo: number; PrecioVenta: string;
}

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export default function PosInventarioPage() {
  const [items, setItems]     = useState<Item[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busq, setBusq]       = useState('');
  const [filtro, setFiltro]   = useState<'todos' | 'alerta'>('todos');

  useEffect(() => {
    apiFetch<{ ok: boolean; data: Item[] }>('/inventario')
      .then(r => setItems(r.data))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = items.filter(i => {
    const matchBusq = !busq ||
      i.NombreProducto.toLowerCase().includes(busq.toLowerCase()) ||
      i.Codigo.toLowerCase().includes(busq.toLowerCase());
    const matchFiltro = filtro === 'todos' || i.StockActual <= i.StockMinimo;
    return matchBusq && matchFiltro;
  });

  const enAlerta = items.filter(i => i.StockActual <= i.StockMinimo).length;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        <p className="text-sm text-gray-400 mt-0.5">Consulta de stock disponible</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400">Total productos</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{items.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400">Stock total</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {items.reduce((a, i) => a + i.StockActual, 0)}
          </p>
        </div>
        <div className={`rounded-2xl p-4 shadow-sm ${enAlerta > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <p className="text-xs text-gray-400">En alerta</p>
          <p className={`text-2xl font-bold mt-1 ${enAlerta > 0 ? 'text-red-500' : 'text-gray-800'}`}>
            {enAlerta}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar producto o código..."
            value={busq} onChange={e => setBusq(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
        </div>
        <div className="flex gap-2">
          {(['todos', 'alerta'] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                filtro === f
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'text-gray-500 border-gray-200 hover:border-purple-300'
              }`}>
              {f === 'todos' ? 'Todos' : ` Alerta (${enAlerta})`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {cargando ? (
        <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Producto</th>
                <th className="px-5 py-3">Talla / Color</th>
                <th className="px-5 py-3">Precio</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">Sin resultados</td></tr>
              ) : filtrados.map(i => {
                const alerta = i.StockActual <= i.StockMinimo;
                return (
                  <tr key={i.IdInventario} className={`hover:bg-gray-50 transition-colors ${alerta ? 'bg-red-50/40' : ''}`}>
                    <td className="px-5 py-3 font-mono text-xs font-bold text-purple-600">{i.Codigo}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{i.NombreProducto}</p>
                      <p className="text-xs text-gray-400">{i.NombreCategoria}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {i.NombreTalla && <span className="mr-2">T: {i.NombreTalla}</span>}
                      {i.NombreColor && <span>C: {i.NombreColor}</span>}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-800">{fmt(i.PrecioVenta)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-bold text-base ${alerta ? 'text-red-500' : 'text-gray-800'}`}>
                        {i.StockActual}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/ mín {i.StockMinimo}</span>
                    </td>
                    <td className="px-5 py-3">
                      {alerta ? (
                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                          <AlertTriangle size={12} /> Stock bajo
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">✓ Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
