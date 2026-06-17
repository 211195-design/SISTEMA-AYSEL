'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, XAxis as BXAxis, YAxis as BYAxis,
  Tooltip as BTooltip, ResponsiveContainer as BResponsiveContainer
} from 'recharts';
import { ShoppingCart, DollarSign, Package, Users, AlertTriangle, CheckCircle } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DashboardData {
  ventasHoy:        { cantidad: number; ingresos: string };
  ingresosTotales:  { totalVentas: number; ingresosTotales: string };
  inventario:       { totalProductos: number; valorTotal: string };
  clientes:         { totalClientes: number };
  tendenciaSemanal: { fecha: string; cantidadVentas: number; ingresos: string }[];
  ventasCategoria:  { categoria: string; total: string }[];
  topProductos:     { NombreProducto: string; unidadesVendidas: string; totalIngresos: string }[];
  metodosPago:      { metodo: string; cantidad: number }[];
  alertasInventario:{ NombreProducto: string; StockMinimo: number; stockActual: number }[];
}

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const PIE_COLORS = ['#7C3AED', '#A78BFA', '#C4B5FD', '#DDD6FE'];

const DIAS: Record<string, string> = {
  Mon: 'Lun', Tue: 'Mar', Wed: 'Mié',
  Thu: 'Jue', Fri: 'Vie', Sat: 'Sáb', Sun: 'Dom',
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData]         = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Error al cargar'); return r.json(); })
      .then(j => setData(j.data))
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
  });

  if (cargando) return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Cargando dashboard...
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">⚠️ {error}</div>
  );

  if (!data) return null;

  // Preparar datos para gráficos
  const tendenciaChart = data.tendenciaSemanal.map(d => ({
    dia: DIAS[new Date(d.fecha).toLocaleDateString('en-US', { weekday: 'short' })] ?? '—',
    ventas: d.cantidadVentas,
    ingresos: Number(d.ingresos),
  }));

  const categoriaChart = data.ventasCategoria.map(c => ({
    name: c.categoria,
    value: Number(c.total),
  }));

  const pagoChart = data.metodosPago.map(m => ({
    metodo: m.metodo,
    cantidad: m.cantidad,
  }));

  // Calcular % crecimiento ficticio para badge (puedes hacerlo real después)
  const pctHoy = data.ventasHoy.cantidad > 0 ? '+2.3%' : '0%';

  return (
    <div className="space-y-6">

      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Ejecutivo</h1>
        <p className="text-sm text-gray-400 mt-0.5">Resumen general del negocio — {today}</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<ShoppingCart size={22} className="text-purple-500" />}
          bg="bg-purple-50"
          titulo="Ventas Hoy"
          valor={String(data.ventasHoy.cantidad)}
          sub={`${fmt(data.ventasHoy.ingresos)} en ingresos`}
          badge={pctHoy}
        />
        <KpiCard
          icon={<DollarSign size={22} className="text-pink-500" />}
          bg="bg-pink-50"
          titulo="Ingresos Totales"
          valor={fmt(data.ingresosTotales.ingresosTotales)}
          sub={`${data.ingresosTotales.totalVentas} ventas realizadas`}
        />
        <KpiCard
          icon={<Package size={22} className="text-cyan-500" />}
          bg="bg-cyan-50"
          titulo="Inventario"
          valor={String(data.inventario.totalProductos)}
          sub={`Valor: ${fmt(data.inventario.valorTotal)}`}
        />
        <KpiCard
          icon={<Users size={22} className="text-orange-500" />}
          bg="bg-orange-50"
          titulo="Clientes"
          valor={String(data.clientes.totalClientes)}
          sub="Base de clientes activa"
        />
      </div>

      {/* ── Gráficos fila 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Tendencia */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Tendencia de Ventas e Ingresos</h3>
          <p className="text-xs text-gray-400 mb-4">Semana actual</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={tendenciaChart}>
              <defs>
                <linearGradient id="gVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EC4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area yAxisId="left"  type="monotone" dataKey="ventas"   stroke="#7C3AED" fill="url(#gVentas)"   strokeWidth={2} name="Cantidad de Ventas" />
              <Area yAxisId="right" type="monotone" dataKey="ingresos" stroke="#EC4899" fill="url(#gIngresos)" strokeWidth={2} name="Ingresos (S/)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie categorías */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Ventas por Categoría</h3>
          {categoriaChart.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin datos.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoriaChart}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoriaChart.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="mt-2 space-y-1">
                {categoriaChart.map((c, i) => (
                  <li key={c.name} className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-600">{c.name}</span>
                    </span>
                    <span className="font-medium text-gray-800">{fmt(c.value)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* ── Fila 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top productos */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 5 Productos Más Rentables</h3>
          {data.topProductos.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin datos.</p>
          ) : (
            <ul className="space-y-3">
              {data.topProductos.map((p, i) => (
                <li key={p.NombreProducto} className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.NombreProducto}</p>
                    <p className="text-xs text-gray-400">{p.unidadesVendidas} unidades vendidas</p>
                  </div>
                  <span className="text-sm font-bold text-purple-600 shrink-0">
                    {fmt(p.totalIngresos)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Métodos de pago */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Métodos de Pago</h3>
          {pagoChart.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin datos.</p>
          ) : (
            <BResponsiveContainer width="100%" height={160}>
              <BarChart data={pagoChart} layout="vertical" margin={{ left: 10 }}>
                <BXAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <BYAxis type="category" dataKey="metodo" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <BTooltip />
                <Bar dataKey="cantidad" fill="#7C3AED" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </BResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Alertas inventario ── */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-500" />
          Alertas de Inventario
        </h3>
        {data.alertasInventario.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} />
            Todos los productos tienen stock suficiente
          </div>
        ) : (
          <ul className="space-y-2">
            {data.alertasInventario.map(a => (
              <li key={a.NombreProducto} className="flex justify-between text-sm bg-yellow-50 rounded-xl px-4 py-2">
                <span className="text-yellow-800">{a.NombreProducto}</span>
                <span className="text-yellow-600 font-medium">
                  Stock: {a.stockActual} / Mín: {a.StockMinimo}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon, bg, titulo, valor, sub, badge }: {
  icon: React.ReactNode;
  bg: string;
  titulo: string;
  valor: string;
  sub: string;
  badge?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${bg}`}>{icon}</div>
        {badge && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            ↑ {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-0.5">{titulo}</p>
      <p className="text-2xl font-bold text-gray-800">{valor}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
