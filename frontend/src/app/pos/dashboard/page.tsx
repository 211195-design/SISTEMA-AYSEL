'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DashboardData {
  hoy:          { TotalVentas: number; MontoTotal: number; Anuladas: number };
  ayer:         { TotalVentas: number; MontoTotal: number };
  porHora:      { Hora: number; Cantidad: number; Monto: number }[];
  formasPago:   { NombreFormaPago: string; Cantidad: number; Monto: number }[];
  topProductos: { NombreProducto: string; TotalUnidades: number; TotalMonto: number }[];
  topClientes:  { Cliente: string; TotalCompras: number; TotalGastado: number }[];
  stockBajo:    { NombreProducto: string; NombreTalla: string; NombreColor: string; StockActual: number; StockMinimo: number }[];
  miTurno:      { MisVentas: number; MiMonto: number; ultimaVenta: { NumeroBoleta: string; FechaVenta: string; Total: number; Cliente: string } | null };
  semanas:      { esta: { Monto: number; Ventas: number }; anterior: { Monto: number; Ventas: number } };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const pct = (a: number, b: number) => {
  if (b === 0) return null;
  const diff = ((a - b) / b) * 100;
  return diff;
};

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];

// ─── Componentes pequeños ─────────────────────────────────────────────────────
function KpiCard({
  titulo, valor, sub, color = 'indigo', icon,
}: {
  titulo: string; valor: string; sub?: string; color?: string; icon: string;
}) {
  const colores: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    green:  'bg-emerald-50 border-emerald-200 text-emerald-700',
    red:    'bg-rose-50 border-rose-200 text-rose-700',
    amber:  'bg-amber-50 border-amber-200 text-amber-700',
    cyan:   'bg-cyan-50 border-cyan-200 text-cyan-700',
  };
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${colores[color]}`}>
      <div className="flex items-center gap-2 text-sm font-medium opacity-80">
        <span>{icon}</span> {titulo}
      </div>
      <div className="text-2xl font-bold">{valor}</div>
      {sub && <div className="text-xs opacity-70">{sub}</div>}
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]     = useState('');

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const r = await apiFetch<{ ok: boolean; data: DashboardData }>('/ventas/dashboard');
      setData(r.data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar dashboard');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // Auto-refresh cada 2 minutos
  useEffect(() => {
    const interval = setInterval(cargar, 120_000);
    return () => clearInterval(interval);
  }, []);

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Cargando dashboard...
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-rose-500 text-sm">{error}</p>
      <button onClick={cargar} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
        Reintentar
      </button>
    </div>
  );

  if (!data) return null;

  const difHoy  = pct(data.hoy.MontoTotal, data.ayer.MontoTotal);
  const difSem  = pct(data.semanas.esta.Monto, data.semanas.anterior.Monto);

  // Rellenar horas 8-21 aunque no haya ventas
  const horasCompletas = Array.from({ length: 14 }, (_, i) => {
    const h = i + 8;
    const found = data.porHora.find(x => x.Hora === h);
    return { hora: `${String(h).padStart(2, '0')}:00`, Monto: found?.Monto ?? 0, Cantidad: found?.Cantidad ?? 0 };
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard POS</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={cargar} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 shadow-sm">
          Actualizar
        </button>
      </div>

      {/* ── KPIs del día ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon="" titulo="Ventas del día" color="indigo"
          valor={fmt(data.hoy.MontoTotal)}
          sub={difHoy !== null
            ? `${difHoy >= 0 ? '▲' : '▼'} ${Math.abs(difHoy).toFixed(1)}% vs ayer`
            : 'Sin datos de ayer'}
        />
        <KpiCard
          icon="" titulo="Boletas emitidas" color="cyan"
          valor={String(data.hoy.TotalVentas)}
          sub={`Ayer: ${data.ayer.TotalVentas}`}
        />
        <KpiCard
          icon="" titulo="Anuladas hoy" color="red"
          valor={String(data.hoy.Anuladas)}
        />
        <KpiCard
          icon="" titulo="Mi turno" color="green"
          valor={fmt(data.miTurno.MiMonto)}
          sub={`${data.miTurno.MisVentas} ventas registradas`}
        />
      </div>

      {/* ── Gráfico por hora + Formas de pago ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2">
          <SectionCard title="Ventas por hora" icon="">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={horasCompletas} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `S/${v}`} />
                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                <Bar dataKey="Monto" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        <SectionCard title="Formas de pago" icon="">
          {data.formasPago.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin ventas hoy</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                    <Pie
                        data={data.formasPago}
                        dataKey="Monto"
                        nameKey="NombreFormaPago"
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                    >
                        {data.formasPago.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => fmt(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1">
                {data.formasPago.map((f, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                      {f.NombreFormaPago}
                    </span>
                    <span className="font-medium">{fmt(f.Monto)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* ── Rankings ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <SectionCard title="Productos más vendidos hoy" icon="">
          {data.topProductos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin ventas hoy</p>
          ) : (
            <div className="space-y-3">
              {data.topProductos.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-300 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{p.NombreProducto}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${(p.TotalUnidades / data.topProductos[0].TotalUnidades) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-gray-700">{p.TotalUnidades} uds</p>
                    <p className="text-xs text-gray-400">{fmt(p.TotalMonto)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Clientes top hoy" icon="">
          {data.topClientes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin ventas hoy</p>
          ) : (
            <div className="space-y-3">
              {data.topClientes.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-300 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{c.Cliente}</p>
                    <p className="text-xs text-gray-400">{c.TotalCompras} compra{c.TotalCompras !== 1 ? 's' : ''}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 shrink-0">{fmt(c.TotalGastado)}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Alertas + Mi turno + Comparativa ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Stock bajo */}
        <SectionCard title=" Stock bajo" icon="">
          {data.stockBajo.length === 0 ? (
            <p className="text-sm text-emerald-500 text-center py-6"> Todo el stock está OK</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {data.stockBajo.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{s.NombreProducto}</p>
                    <p className="text-xs text-gray-400">{s.NombreTalla} · {s.NombreColor}</p>
                  </div>
                  <span className="text-xs font-bold text-rose-600 shrink-0 ml-2">
                    {s.StockActual}/{s.StockMinimo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Mi turno */}
        <SectionCard title="Mi turno" icon="">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{data.miTurno.MisVentas}</p>
                <p className="text-xs text-indigo-500 mt-1">Ventas</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-700">{fmt(data.miTurno.MiMonto)}</p>
                <p className="text-xs text-emerald-500 mt-1">Monto total</p>
              </div>
            </div>
            {data.miTurno.ultimaVenta ? (
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700">Última venta</p>
                <p> {data.miTurno.ultimaVenta.NumeroBoleta}</p>
                <p> {data.miTurno.ultimaVenta.Cliente}</p>
                <p> {fmt(data.miTurno.ultimaVenta.Total)}</p>
                <p> {new Date(data.miTurno.ultimaVenta.FechaVenta).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center">Sin ventas registradas aún</p>
            )}
          </div>
        </SectionCard>

        {/* Comparativa semanal */}
        <SectionCard title="Esta semana vs anterior" icon="">
          <div className="space-y-4">
            {[
              { label: 'Esta semana', data: data.semanas.esta, color: 'indigo' },
              { label: 'Semana anterior', data: data.semanas.anterior, color: 'gray' },
            ].map(({ label, data: d, color }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-xl font-bold text-${color}-700`}>{fmt(d.Monto)}</p>
                <p className="text-xs text-gray-400">{d.Ventas} ventas</p>
              </div>
            ))}
            {difSem !== null && (
              <div className={`text-sm font-semibold ${difSem >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {difSem >= 0 ? '▲' : '▼'} {Math.abs(difSem).toFixed(1)}% vs semana anterior
              </div>
            )}
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
