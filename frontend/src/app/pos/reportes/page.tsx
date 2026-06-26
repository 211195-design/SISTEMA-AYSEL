'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { getUserFromToken } from '@/lib/auth';
import { BarChart2, TrendingUp, Calendar, Users } from 'lucide-react';

interface ResumenTurno {
  TotalVentas: number; MontoTotal: number;
  TotalDescuentos: number; Anuladas: number;
}
interface FilaFormaPago {
  NombreFormaPago: string; TotalVentas: number; MontoFormaPago: number;
}
interface FilaVentaTurno {
  NumeroBoleta: string; FechaVenta: string; Total: number;
  Estado: string; Cliente: string; NombreFormaPago: string;
}
interface ResumenGeneral {
  TotalVentas: number; MontoTotal: number;
  TotalDescuentos: number; Anuladas: number;
}
interface FilaVendedor {
  Vendedor: string; TotalVentas: number; MontoTotal: number;
}
interface FilaDia {
  Fecha: string; TotalVentas: number; MontoTotal: number;
}

const fmt = (v: number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const hoy = () => new Date().toISOString().split('T')[0];

export default function ReportesPage() {
  const [tab, setTab]   = useState<'turno' | 'general'>('turno');
  const user            = getUserFromToken();

  // Turno
  const [fechaTurno, setFechaTurno]   = useState(hoy());
  const [turno, setTurno]             = useState<{
    resumen: ResumenTurno; porFormaPago: FilaFormaPago[]; detalle: FilaVentaTurno[];
  } | null>(null);
  const [cargandoT, setCargandoT]     = useState(false);

  // General
  const [desde, setDesde]             = useState(hoy());
  const [hasta, setHasta]             = useState(hoy());
  const [general, setGeneral]         = useState<{
    resumen: ResumenGeneral; porVendedor: FilaVendedor[];
    porFormaPago: FilaFormaPago[]; porDia: FilaDia[];
  } | null>(null);
  const [cargandoG, setCargandoG]     = useState(false);

  const cargarTurno = async () => {
    if (!user) return;
    setCargandoT(true);
    const r = await apiFetch<{ ok: boolean; data: any }>(
      `/ventas/reporte/turno?idUsuario=${user.id}&fecha=${fechaTurno}`
    );
    setTurno(r.data);
    setCargandoT(false);
  };

  const cargarGeneral = async () => {
    setCargandoG(true);
    const r = await apiFetch<{ ok: boolean; data: any }>(
      `/ventas/reporte/general?desde=${desde}&hasta=${hasta}`
    );
    setGeneral(r.data);
    setCargandoG(false);
  };

  useEffect(() => { cargarTurno(); }, [fechaTurno]);
  useEffect(() => { cargarGeneral(); }, [desde, hasta]);

  const fechaLocal = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Resumen de ventas por turno y general</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {(['turno', 'general'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
              tab === t ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'turno' ? ' Mi Turno' : ' General'}
          </button>
        ))}
      </div>

      {/* ── TURNO ── */}
      {tab === 'turno' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label htmlFor="fechaTurno" className="text-sm text-gray-500">Fecha</label> 
            <input id = "fechaTurno" type="date" value={fechaTurno}
              onChange={e => setFechaTurno(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
            <span className="text-sm text-gray-400">
              Vendedor: <strong className="text-gray-700">{user?.nombre}</strong>
            </span>
          </div>

          {cargandoT ? (
            <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
          ) : turno ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Ventas',      value: turno.resumen.TotalVentas,    icon: BarChart2,  color: 'purple' },
                  { label: 'Ingresado',   value: fmt(turno.resumen.MontoTotal), icon: TrendingUp, color: 'green'  },
                  { label: 'Descuentos',  value: fmt(turno.resumen.TotalDescuentos), icon: Calendar, color: 'blue' },
                  { label: 'Anuladas',    value: turno.resumen.Anuladas,       icon: Users,      color: 'red'    },
                ].map(k => {
                  const Icon = k.icon;
                  const colors: Record<string, string> = {
                    purple: 'bg-purple-50 text-purple-600',
                    green:  'bg-green-50 text-green-600',
                    blue:   'bg-blue-50 text-blue-600',
                    red:    'bg-red-50 text-red-500',
                  };
                  return (
                    <div key={k.label} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[k.color]}`}>
                        <Icon size={18} />
                      </div>
                      <p className="text-xs text-gray-400">{k.label}</p>
                      <p className="text-xl font-bold text-gray-800 mt-0.5">{k.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Por forma de pago */}
              {turno.porFormaPago.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700">Por forma de pago</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-gray-50">
                        <th className="px-5 py-2 text-left">Forma de pago</th>
                        <th className="px-5 py-2 text-right">Ventas</th>
                        <th className="px-5 py-2 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {turno.porFormaPago.map(f => (
                        <tr key={f.NombreFormaPago}>
                          <td className="px-5 py-3 font-medium text-gray-800">{f.NombreFormaPago}</td>
                          <td className="px-5 py-3 text-right text-gray-500">{f.TotalVentas}</td>
                          <td className="px-5 py-3 text-right font-bold text-gray-800">{fmt(f.MontoFormaPago)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Detalle ventas */}
              {turno.detalle.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700">Detalle de ventas</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-gray-50">
                        <th className="px-5 py-2 text-left">Boleta</th>
                        <th className="px-5 py-2 text-left">Cliente</th>
                        <th className="px-5 py-2 text-left">Pago</th>
                        <th className="px-5 py-2 text-right">Total</th>
                        <th className="px-5 py-2 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {turno.detalle.map((v, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-5 py-3 font-mono text-xs font-bold text-purple-600">{v.NumeroBoleta}</td>
                          <td className="px-5 py-3 text-gray-700">{v.Cliente}</td>
                          <td className="px-5 py-3 text-gray-500 text-xs">{v.NombreFormaPago}</td>
                          <td className="px-5 py-3 text-right font-bold text-gray-800">{fmt(Number(v.Total))}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              v.Estado === 'Completado'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-500'
                            }`}>{v.Estado}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {turno.detalle.length === 0 && (
                <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm">
                  Sin ventas registradas para esta fecha
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ── GENERAL ── */}
      {tab === 'general' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor="desde" className="text-sm text-gray-500">Desde</label>
              <input type="date" id="desde" value={desde} onChange={e => setDesde(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="hasta" className="text-sm text-gray-500">Hasta</label>
              <input type="date" id="hasta" value={hasta} onChange={e => setHasta(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
            </div>
          </div>

          {cargandoG ? (
            <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
          ) : general ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total ventas',   value: general.resumen.TotalVentas },
                  { label: 'Ingresos',       value: fmt(general.resumen.MontoTotal) },
                  { label: 'Descuentos',     value: fmt(general.resumen.TotalDescuentos) },
                  { label: 'Anuladas',       value: general.resumen.Anuladas },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-gray-400">{k.label}</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{k.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Por vendedor */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700">Por vendedor</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-gray-50">
                        <th className="px-5 py-2 text-left">Vendedor</th>
                        <th className="px-5 py-2 text-right">Ventas</th>
                        <th className="px-5 py-2 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {general.porVendedor.map(v => (
                        <tr key={v.Vendedor}>
                          <td className="px-5 py-3 font-medium text-gray-800">{v.Vendedor}</td>
                          <td className="px-5 py-3 text-right text-gray-500">{v.TotalVentas}</td>
                          <td className="px-5 py-3 text-right font-bold text-gray-800">{fmt(v.MontoTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Por forma de pago */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700">Por forma de pago</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-gray-50">
                        <th className="px-5 py-2 text-left">Forma de pago</th>
                        <th className="px-5 py-2 text-right">Ventas</th>
                        <th className="px-5 py-2 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {general.porFormaPago.map(f => (
                        <tr key={f.NombreFormaPago}>
                          <td className="px-5 py-3 font-medium text-gray-800">{f.NombreFormaPago}</td>
                          <td className="px-5 py-3 text-right text-gray-500">{f.TotalVentas}</td>
                          <td className="px-5 py-3 text-right font-bold text-gray-800">{fmt(f.MontoFormaPago)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Por día */}
              {general.porDia.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700">Ventas por día</h3>
                  </div>
                  <div className="p-5 space-y-2">
                    {general.porDia.map(d => {
                      const maxMonto = Math.max(...general.porDia.map(x => x.MontoTotal));
                      const pct = maxMonto > 0 ? (d.MontoTotal / maxMonto) * 100 : 0;
                      return (
                        <div key={d.Fecha} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-20 shrink-0">
                            {fechaLocal(d.Fecha)}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 w-24 text-right shrink-0">
                            {fmt(d.MontoTotal)}
                          </span>
                          <span className="text-xs text-gray-400 w-12 text-right shrink-0">
                            {d.TotalVentas} vtas
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
