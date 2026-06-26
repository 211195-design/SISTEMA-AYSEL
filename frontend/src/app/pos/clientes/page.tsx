'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Search, Eye, X, ShoppingBag } from 'lucide-react';

interface Cliente {
  IdCliente: number; DNI: string; Nombres: string;
  Apellidos: string; Telefono: string; Estado: number;
}
interface Venta {
  IdVenta: number; NumeroBoleta: string; FechaVenta: string;
  Total: string; Estado: string; NombreFormaPago: string;
}

const fechaLocal = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export default function PosClientesPage() {
  const [clientes, setClientes]   = useState<Cliente[]>([]);
  const [cargando, setCargando]   = useState(true);
  const [busq, setBusq]           = useState('');
  const [historial, setHistorial] = useState<{ cliente: Cliente; ventas: Venta[] } | null>(null);
  const [cargandoH, setCargandoH] = useState(false);

  useEffect(() => {
    apiFetch<{ ok: boolean; data: Cliente[] }>('/clientes')
      .then(r => setClientes(r.data))
      .finally(() => setCargando(false));
  }, []);

  const abrirHistorial = async (c: Cliente) => {
    setCargandoH(true);
    setHistorial({ cliente: c, ventas: [] });

    try {
      const r = await apiFetch<any>(`/clientes/${c.IdCliente}/historial`);

      let ventas: Venta[] = [];
      if (Array.isArray(r))               ventas = r;
      else if (Array.isArray(r?.data))    ventas = r.data;
      else if (Array.isArray(r?.ventas))  ventas = r.ventas;

      setHistorial({ cliente: c, ventas });
    } catch {
      setHistorial({ cliente: c, ventas: [] });
    } finally {
      setCargandoH(false);
    }
  };


  const filtrados = clientes.filter(c =>
    !busq ||
    `${c.Nombres} ${c.Apellidos}`.toLowerCase().includes(busq.toLowerCase()) ||
    c.DNI.includes(busq) ||
    c.Telefono?.includes(busq)
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Consulta y historial de compras</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400">Total clientes</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{clientes.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400">Activos</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {clientes.filter(c => c.Estado === 1).length}
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative w-full sm:w-96">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar por nombre, DNI o teléfono..."
          value={busq} onChange={e => setBusq(e.target.value)}
          className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
      </div>

      {/* Tabla */}
      {cargando ? (
        <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">DNI</th>
                <th className="px-5 py-3">Teléfono</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-400">Sin resultados</td></tr>
              ) : filtrados.map(c => (
                <tr key={c.IdCliente} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">
                    {c.Nombres} {c.Apellidos}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{c.DNI}</td>
                  <td className="px-5 py-3 text-gray-500">{c.Telefono || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.Estado === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {c.Estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button type = "button" onClick={() => abrirHistorial(c)} aria-label="Ver historial"
                      className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal historial */}
      {historial && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {historial.cliente.Nombres} {historial.cliente.Apellidos}
                </h2>
                <p className="text-xs text-gray-400">DNI: {historial.cliente.DNI}</p>
              </div>
              <button type = "button" onClick={() => setHistorial(null)} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cargandoH ? (
                <div className="text-center py-8 text-gray-400 text-sm">Cargando historial...</div>
              ) : historial.ventas.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-300">
                  <ShoppingBag size={36} />
                  <p className="text-sm mt-2">Sin compras registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Resumen */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Total compras</p>
                      <p className="text-xl font-bold text-purple-600">{historial.ventas.length}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-400">Monto total</p>
                      <p className="text-xl font-bold text-purple-600">
                        {fmt(historial.ventas
                          .filter(v => v.Estado === 'Completado')
                          .reduce((a, v) => a + Number(v.Total), 0))}
                      </p>
                    </div>
                  </div>
                  {/* Lista */}
                  {historial.ventas.map(v => (
                    <div key={v.IdVenta}
                      className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-purple-600">{v.NumeroBoleta}</p>
                        <p className="text-xs text-gray-400">
                          {fechaLocal(v.FechaVenta)} · {v.NombreFormaPago}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{fmt(v.Total)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          v.Estado === 'Completado'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-500'
                        }`}>{v.Estado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
