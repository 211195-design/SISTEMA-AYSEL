'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { BarChart2, TrendingUp, Calendar, Users, Download, Package, CreditCard, XCircle } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ResumenDia    { TotalBoletas: number; TotalIngresos: number; TotalDescuentos: number; PromedioVenta: number; }
interface VentaDia      { NumeroBoleta: string; Hora: string; Cliente: string; DNI: string; NombreFormaPago: string; Total: number; Vendedor: string; }
interface ResumenTurno  { VentasMañana: number; IngresosMañana: number; VentasTarde: number; IngresosTarde: number; }
interface FilaTurno     { Fecha: string; Turno: string; Vendedor: string; TotalVentas: number; TotalIngresos: number; }
interface FilaVendedor  { Vendedor: string; Rol: string; TotalVentas: number; TotalIngresos: number; PromedioVenta: number; UltimaVenta: string; }
interface FilaCliente   { Cliente: string; DNI: string; TotalCompras: number; TotalGastado: number; UltimaCompra: string; }
interface FilaFormaPago { NombreFormaPago: string; TotalVentas: number; TotalIngresos: number; Porcentaje: number; }
interface FilaInventario{ Codigo: string; NombreProducto: string; NombreCategoria: string; StockActual: number; StockMinimo: number; EstadoStock: string; PrecioVenta: number; }

type Tab = 'dia' | 'turnos' | 'vendedor' | 'clientes' | 'formaspago' | 'inventario';

const fmt = (v: number) => `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

//  FIX: todas las fechas calculadas en hora Lima (UTC-5)
const limaHoy  = () => new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().split('T')[0];
const limaHace7= () => new Date(Date.now() - 5 * 60 * 60 * 1000 - 7 * 86400000).toISOString().split('T')[0];

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'dia',        label: 'Ventas del Día',  icon: Calendar   },
  { key: 'turnos',     label: 'Por Turno',        icon: BarChart2  },
  { key: 'clientes',   label: 'Clientes',         icon: Users      },
  { key: 'formaspago', label: 'Formas de Pago',   icon: CreditCard },
  { key: 'inventario', label: 'Inventario',       icon: Package    },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600',
    green:  'bg-green-50  text-green-600',
    blue:   'bg-blue-50   text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red:    'bg-red-50    text-red-500',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-0.5">{value ?? '—'}</p>
    </div>
  );
}

// ─── Badge estado stock ───────────────────────────────────────────────────────
function BadgeStock({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    'OK':         'bg-green-100 text-green-700',
    'Stock bajo': 'bg-yellow-100 text-yellow-700',
    'Sin stock':  'bg-red-100 text-red-600',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[estado] ?? 'bg-gray-100 text-gray-500'}`}>
      {estado}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ReportesPage() {
  const [tab, setTab]     = useState<Tab>('dia');
  const [desde, setDesde] = useState(limaHace7());  //  Lima
  const [hasta, setHasta] = useState(limaHoy());    //  Lima
  const [fecha, setFecha] = useState(limaHoy());    //  Lima
  const [datos, setDatos] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const cargar = async (t: Tab = tab) => {
    setCargando(true);
    setDatos(null);
    try {
      const params = t === 'inventario'
        ? ''
        : t === 'dia'
          ? `?desde=${fecha}&hasta=${fecha}`
          : `?desde=${desde}&hasta=${hasta}`;
      const r = await apiFetch<{ ok: boolean; data: any }>(`/reportes/${t}${params}`);
      setDatos(r.data ?? r);
    } catch { setDatos(null); }
    finally  { setCargando(false); }
  };

  const exportar = () => {
    const params = tab === 'inventario'
      ? ''
      : tab === 'dia'
        ? `?desde=${fecha}&hasta=${fecha}`
        : `?desde=${desde}&hasta=${hasta}`;
    window.open(`http://localhost:3001/api/reportes/${tab}/excel${params}`, '_blank');
  };

  useEffect(() => { cargar(tab); }, [tab]);

  // ─── Vistas por tab ───────────────────────────────────────────────────────
  const renderDia = () => {
    const d = datos as { resumen: ResumenDia; ventas: VentaDia[] };
    if (!d) return null;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="Boletas"    value={d.resumen?.TotalBoletas}                      icon={BarChart2}  color="purple" />
          <KpiCard label="Ingresos"   value={fmt(d.resumen?.TotalIngresos   ?? 0)}         icon={TrendingUp} color="green"  />
          <KpiCard label="Descuentos" value={fmt(d.resumen?.TotalDescuentos ?? 0)}         icon={XCircle}    color="orange" />
          <KpiCard label="Promedio"   value={fmt(d.resumen?.PromedioVenta   ?? 0)}         icon={Calendar}   color="blue"   />
        </div>
        {d.ventas?.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700">Detalle de boletas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2 text-left">Boleta</th>
                    <th className="px-4 py-2 text-left">Hora</th>
                    <th className="px-4 py-2 text-left">Cliente</th>
                    <th className="px-4 py-2 text-left">Vendedor</th>
                    <th className="px-4 py-2 text-left">Pago</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.ventas.map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-purple-600">{v.NumeroBoleta}</td>
                      <td className="px-4 py-3 text-gray-500">{v.Hora}</td>
                      <td className="px-4 py-3 text-gray-700">{v.Cliente}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{v.Vendedor}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{v.NombreFormaPago}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">{fmt(Number(v.Total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-400 py-10 bg-white rounded-2xl shadow-sm">
            Sin ventas para esta fecha.
          </p>
        )}
      </div>
    );
  };

  const renderTurnos = () => {
    const d = datos as { resumen: ResumenTurno; detalle: FilaTurno[] };
    if (!d) return null;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard label="Ventas Mañana"   value={d.resumen?.VentasMañana}              icon={BarChart2}  color="yellow" />
          <KpiCard label="Ingresos Mañana" value={fmt(d.resumen?.IngresosMañana ?? 0)} icon={TrendingUp} color="yellow" />
          <KpiCard label="Ventas Tarde"    value={d.resumen?.VentasTarde}               icon={BarChart2}  color="purple" />
          <KpiCard label="Ingresos Tarde"  value={fmt(d.resumen?.IngresosTarde  ?? 0)} icon={TrendingUp} color="purple" />
        </div>
        {d.detalle?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-700">Detalle por día y turno</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Turno</th>
                    <th className="px-4 py-2 text-left">Vendedor</th>
                    <th className="px-4 py-2 text-right">Ventas</th>
                    <th className="px-4 py-2 text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.detalle.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{f.Fecha}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          f.Turno === 'Mañana'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {f.Turno}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{f.Vendedor}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{f.TotalVentas}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">{fmt(Number(f.TotalIngresos))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVendedor = () => {
    const rows = datos as FilaVendedor[];
    if (!rows?.length) return <p className="text-center text-gray-400 py-10 bg-white rounded-2xl shadow-sm">Sin datos.</p>;
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2 text-left">Vendedor</th>
                <th className="px-4 py-2 text-left">Rol</th>
                <th className="px-4 py-2 text-right">Ventas</th>
                <th className="px-4 py-2 text-right">Ingresos</th>
                <th className="px-4 py-2 text-right">Promedio</th>
                <th className="px-4 py-2 text-left">Última venta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((v, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{v.Vendedor}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{v.Rol}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{v.TotalVentas}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">{fmt(Number(v.TotalIngresos))}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(Number(v.PromedioVenta))}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{v.UltimaVenta ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderClientes = () => {
    const rows = datos as FilaCliente[];
    if (!rows?.length) return <p className="text-center text-gray-400 py-10 bg-white rounded-2xl shadow-sm">Sin datos.</p>;
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">DNI</th>
                <th className="px-4 py-2 text-right">Compras</th>
                <th className="px-4 py-2 text-right">Total gastado</th>
                <th className="px-4 py-2 text-left">Última compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.Cliente}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.DNI}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{c.TotalCompras}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-800">{fmt(Number(c.TotalGastado))}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.UltimaCompra?.split('T')[0] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFormaPago = () => {
    const rows = datos as FilaFormaPago[];
    if (!rows?.length) return <p className="text-center text-gray-400 py-10 bg-white rounded-2xl shadow-sm">Sin datos.</p>;
    const max = Math.max(...rows.map(r => r.TotalIngresos));
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {rows.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700">{f.NombreFormaPago}</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{fmt(Number(f.TotalIngresos))}</p>
              <div className="mt-3 bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{ width: `${max > 0 ? (f.TotalIngresos / max) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{f.TotalVentas} ventas · {f.Porcentaje}%</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInventario = () => {
    const rows = datos as FilaInventario[];
    if (!rows?.length) return <p className="text-center text-gray-400 py-10 bg-white rounded-2xl shadow-sm">Sin datos.</p>;
    const bajos = rows.filter(r => r.EstadoStock !== 'OK').length;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <KpiCard label="Total productos" value={rows.length}          icon={Package}   color="purple" />
          <KpiCard label="Con stock bajo"  value={bajos}                icon={XCircle}   color="red"    />
          <KpiCard label="En stock normal" value={rows.length - bajos}  icon={BarChart2} color="green"  />
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2 text-left">Código</th>
                  <th className="px-4 py-2 text-left">Producto</th>
                  <th className="px-4 py-2 text-left">Categoría</th>
                  <th className="px-4 py-2 text-right">Stock</th>
                  <th className="px-4 py-2 text-right">Mínimo</th>
                  <th className="px-4 py-2 text-right">Precio</th>
                  <th className="px-4 py-2 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.Codigo}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.NombreProducto}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.NombreCategoria}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{p.StockActual}</td>
                    <td className="px-4 py-3 text-right text-gray-400">{p.StockMinimo}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{fmt(Number(p.PrecioVenta))}</td>
                    <td className="px-4 py-3 text-center"><BadgeStock estado={p.EstadoStock} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderContenido = () => {
    if (cargando) return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-600 border-t-transparent" />
      </div>
    );
    if (!datos) return <p className="text-center text-gray-400 py-12">Sin datos para el período.</p>;
    switch (tab) {
      case 'dia':        return renderDia();
      case 'turnos':     return renderTurnos();
      case 'vendedor':   return renderVendedor();
      case 'clientes':   return renderClientes();
      case 'formaspago': return renderFormaPago();
      case 'inventario': return renderInventario();
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Análisis de ventas, turnos, clientes e inventario</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === t.key ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        {tab === 'dia' ? (
          <div className="flex items-center gap-2">
            <label htmlFor="fecha" className="text-sm text-gray-500">Fecha</label>
            <input type="date" id="fecha" value={fecha} onChange={e => setFecha(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
          </div>
        ) : tab !== 'inventario' ? (
          <>
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
          </>
        ) : (
          <span className="text-sm text-gray-400 italic">Stock actual — sin filtro de fechas</span>
        )}

        <button onClick={() => cargar(tab)} disabled={cargando}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50">
          {cargando ? 'Cargando...' : 'Buscar'}
        </button>
        <button onClick={exportar}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
          <Download size={14} /> Excel
        </button>
      </div>

      {renderContenido()}
    </div>
  );
}
