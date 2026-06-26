'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { FileText, Eye, X } from 'lucide-react';

interface Venta {
  IdVenta: number; NumeroBoleta: string; FechaVenta: string;
  SubTotal: string; Descuento: string; Total: string; Estado: string;
  Cliente: string; DNI: string; NombreFormaPago: string; Vendedor: string;
}
interface DetalleItem {
  IdDetalleVenta: number; NombreProducto: string; Codigo: string;
  NombreTalla: string; NombreColor: string;
  Cantidad: number; PrecioUnitario: string; SubTotal: string;
}
interface VentaDetalle extends Venta { detalle: DetalleItem[]; }

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const fechaLocal = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ComprobantesPage() {
  const [ventas, setVentas]   = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [detalle, setDetalle] = useState<VentaDetalle | null>(null);
  const [busq, setBusq]       = useState('');

  useEffect(() => {
    apiFetch<{ ok: boolean; data: Venta[] }>('/ventas')
      .then(r => setVentas(r.data))
      .finally(() => setCargando(false));
  }, []);

  const abrirDetalle = async (id: number) => {
    const r = await apiFetch<{ ok: boolean; data: VentaDetalle }>(`/ventas/${id}`);
    setDetalle(r.data);
  };

  const filtradas = ventas.filter(v =>
    v.NumeroBoleta.toLowerCase().includes(busq.toLowerCase()) ||
    v.Cliente.toLowerCase().includes(busq.toLowerCase()) ||
    v.DNI.includes(busq)
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Comprobantes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Historial de ventas realizadas</p>
      </div>

      <div className="relative w-full sm:w-80">
        <input type="text" placeholder="Buscar por boleta, cliente o DNI..."
          value={busq} onChange={e => setBusq(e.target.value)}
          className="w-full pl-4 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
      </div>

      {cargando ? (
        <div className="text-center text-gray-400 py-12 text-sm">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="px-5 py-3">Boleta</th>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtradas.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">Sin resultados</td></tr>
              ) : filtradas.map(v => (
                <tr key={v.IdVenta} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-purple-600">{v.NumeroBoleta}</td>
                  <td className="px-5 py-3 text-gray-500">{fechaLocal(v.FechaVenta)}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{v.Cliente}</p>
                    <p className="text-xs text-gray-400">{v.DNI}</p>
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-800">{fmt(v.Total)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.Estado === 'Completado' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}>{v.Estado}</span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => abrirDetalle(v.IdVenta)} aria-label="Ver detalle"
                      className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800">{detalle.NumeroBoleta}</h2>
                <p className="text-xs text-gray-400">{fechaLocal(detalle.FechaVenta)}</p>
              </div>
              <button  onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar detalle">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">Cliente</p><p className="font-medium">{detalle.Cliente}</p></div>
                <div><p className="text-xs text-gray-400">DNI</p><p className="font-medium">{detalle.DNI}</p></div>
                <div><p className="text-xs text-gray-400">Forma de pago</p><p className="font-medium">{detalle.NombreFormaPago}</p></div>
                <div><p className="text-xs text-gray-400">Vendedor</p><p className="font-medium">{detalle.Vendedor}</p></div>
              </div>
              <div className="space-y-2">
                {detalle.detalle.map(d => (
                  <div key={d.IdDetalleVenta} className="flex justify-between text-sm bg-gray-50 rounded-xl px-4 py-2">
                    <div>
                      <p className="font-medium text-gray-800">{d.NombreProducto}</p>
                      <p className="text-xs text-gray-400">{d.NombreTalla} · {d.NombreColor} · x{d.Cantidad}</p>
                    </div>
                    <p className="font-bold text-gray-800">{fmt(d.SubTotal)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(detalle.SubTotal)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Descuento</span><span>- {fmt(detalle.Descuento)}</span></div>
                <div className="flex justify-between font-bold text-gray-800 text-base"><span>Total</span><span>{fmt(detalle.Total)}</span></div>
              </div>
              <button onClick={() => setDetalle(null)} aria-label="Cerrar detalle"
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
