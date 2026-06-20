'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { FileText, Download, TrendingUp, Package, Users, CreditCard, DollarSign, BarChart2, XCircle} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


// ─── Tipos ───────────────────────────────────────────────────────────────────
interface Resumen {
  TotalVentas: number; TotalIngresos: string; TotalDescuentos: string;
  PromedioVenta: string; TotalProductos: number; ValorInventario: string;
  ClientesAtendidos: number; GananciaTotal: string;
}
interface VentaReporte {
  NumeroBoleta: string; FechaVenta: string; Cliente: string; DNI: string;
  NombreFormaPago: string; SubTotal: string; Descuento: string; Total: string;
  Vendedor: string; TotalItems: number;
}
interface InventarioReporte {
  Codigo: string; NombreProducto: string; NombreCategoria: string;
  PrecioCompra: string; PrecioVenta: string; StockMinimo: number;
  StockActual: string; ValorTotal: string; EstadoStock: string;
}
interface ProductoReporte {
  Codigo: string; NombreProducto: string; NombreCategoria: string;
  UnidadesVendidas: string; TotalIngresos: string; TotalCosto: string; Ganancia: string;
}
interface ClienteReporte {
  DNI: string; Cliente: string; Telefono: string;
  TotalCompras: number; TotalGastado: string; UltimaCompra: string;
}
interface FormaPagoReporte {
  NombreFormaPago: string; TotalVentas: number; TotalIngresos: string; Porcentaje: string;
}
interface GananciaReporte {
  Codigo: string; NombreProducto: string; NombreCategoria: string;
  PrecioCompra: string; PrecioVenta: string; MargenUnitario: string;
  MargenPorcentaje: string; Unidades: string; GananciaTotal: string;
}

interface AnuladasReporte {
  NumeroBoleta: string; FechaVenta: string; Cliente: string; DNI: string;
  NombreFormaPago: string; SubTotal: string; Descuento: string; Total: string;
  Vendedor: string; TotalItems: number;
}

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const fechaLocal = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

const hoy = () => new Date().toISOString().split('T')[0];
const hace30 = () => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; };

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'resumen',    label: 'Resumen',    icon: BarChart2 },
  { key: 'ventas',     label: 'Ventas',     icon: TrendingUp },
  { key: 'inventario', label: 'Inventario', icon: Package },
  { key: 'productos',  label: 'Productos',  icon: FileText },
  { key: 'clientes',   label: 'Clientes',   icon: Users },
  { key: 'formaspago', label: 'Formas Pago',icon: CreditCard },
  { key: 'ganancias',  label: 'Ganancias',  icon: DollarSign },
  { key: 'anuladas', label: 'Boletas Anuladas', icon: XCircle },
];


export default function ReportesPage() {
  const [tab, setTab]         = useState('resumen');
  const [desde, setDesde]     = useState(hace30());
  const [hasta, setHasta]     = useState(hoy());
  const [data, setData]       = useState<any>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  

  const cargar = async (t = tab) => {
    setCargando(true); setError(null);
    try {
      const params = t === 'inventario' ? '' : `?desde=${desde}&hasta=${hasta}`;
      const r = await apiFetch<{ ok: boolean; data: any }>(`/reportes/${t}${params}`);
      setData(r.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(tab); }, [tab]);

  const exportarExcel = () => {
    if (!data) return;
    const rows = Array.isArray(data) ? data : [data];
    const ws   = XLSX.utils.json_to_sheet(rows);
    const wb   = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    const buf  = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `reporte_${tab}.xlsx`);
  };

  const exportarPDF = () => {
    if (!data) return;

    const rows = Array.isArray(data) ? data : [data];

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text(`Reporte - ${tab}`, 14, 15);

    if (rows.length > 0) {
        autoTable(doc, {
        head: [Object.keys(rows[0])],
        body: rows.map((row) => Object.values(row)),
        startY: 25,
        styles: {
            fontSize: 9,
        },
        headStyles: {
            fillColor: [22, 163, 74], // verde
        },
        });
    }

    doc.save(`reporte_${tab}.pdf`);
    };

    const actualizar = async () => {
        await cargar();
        alert('Datos actualizados');
    };


  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
          <p className="text-sm text-gray-400 mt-0.5">Análisis y exportación de datos</p>
        </div>
        <button onClick={exportarExcel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Download size={16} /> Exportar Excel
        </button>
        <button
            type="button"
            title="Exportar reporte a PDF"
            aria-label="Exportar reporte a PDF"
            onClick={exportarPDF}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
            <FileText size={16} aria-hidden="true" />
            Exportar PDF
        </button>
        <button onClick={actualizar}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <TrendingUp size={16} /> Actualizar
        </button>
      </div>

      

      {/* Filtro fechas */}
      {tab !== 'inventario' && (
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label htmlFor="fechaDesde" className="text-xs text-gray-400 block mb-1">Desde</label>
            <input id = "fechaDesde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label htmlFor="fechaHasta" className="text-xs text-gray-400 block mb-1">Hasta</label>
            <input id = "fechaHasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <button onClick={() => cargar(tab)}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700">
            Aplicar filtro
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key}
              onClick={() => { setTab(t.key); setData(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm'
              }`}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      {cargando && (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Cargando reporte...
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">⚠️ {error}</div>
      )}

      {!cargando && !error && data && (
        <>
          {/* ── RESUMEN ── */}
          {tab === 'resumen' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Ventas',        valor: (data as Resumen).TotalVentas,          color: 'bg-purple-50 text-purple-600', raw: true },
                { label: 'Ingresos Totales',    valor: fmt((data as Resumen).TotalIngresos),   color: 'bg-green-50 text-green-600'  },
                { label: 'Ganancia Total',      valor: fmt((data as Resumen).GananciaTotal),   color: 'bg-pink-50 text-pink-600'    },
                { label: 'Promedio por Venta',  valor: fmt((data as Resumen).PromedioVenta),   color: 'bg-blue-50 text-blue-600'    },
                { label: 'Clientes Atendidos',  valor: (data as Resumen).ClientesAtendidos,    color: 'bg-orange-50 text-orange-600', raw: true },
                { label: 'Descuentos Dados',    valor: fmt((data as Resumen).TotalDescuentos), color: 'bg-red-50 text-red-500'      },
                { label: 'Productos en Stock',  valor: (data as Resumen).TotalProductos,       color: 'bg-cyan-50 text-cyan-600',   raw: true },
                { label: 'Valor Inventario',    valor: fmt((data as Resumen).ValorInventario), color: 'bg-yellow-50 text-yellow-600' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-2xl shadow-sm p-5">
                  <p className="text-xs text-gray-400 mb-1">{k.label}</p>
                  <p className={`text-2xl font-bold ${k.color}`}>{k.valor}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── VENTAS ── */}
          {tab === 'ventas' && (
            <TablaGenerica
              columnas={['Boleta','Fecha','Cliente','DNI','Forma Pago','Subtotal','Descuento','Total','Vendedor','Items']}
              filas={(data as VentaReporte[]).map(v => [
                v.NumeroBoleta, fechaLocal(v.FechaVenta), v.Cliente, v.DNI,
                v.NombreFormaPago, fmt(v.SubTotal), fmt(v.Descuento), fmt(v.Total),
                v.Vendedor, v.TotalItems,
              ])}
            />
          )}

          {/* ── INVENTARIO ── */}
            {tab === 'inventario' && (
            <div className="bg-white rounded-2xl shadow-sm p-5 overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    {['Código','Producto','Categoría','P.Compra','P.Venta','Stock Mín.','Stock Actual','Valor Total','Estado']
                        .map(c => <th key={c} className="pb-3 pr-4 whitespace-nowrap">{c}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {(data as InventarioReporte[]).map((i, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4 font-mono text-xs text-gray-500">{i.Codigo}</td>
                        <td className="py-3 pr-4 font-medium text-gray-800">{i.NombreProducto}</td>
                        <td className="py-3 pr-4 text-gray-500">{i.NombreCategoria}</td>
                        <td className="py-3 pr-4 text-gray-700">{fmt(i.PrecioCompra)}</td>
                        <td className="py-3 pr-4 text-gray-700">{fmt(i.PrecioVenta)}</td>
                        <td className="py-3 pr-4 text-gray-500">{i.StockMinimo}</td>
                        <td className="py-3 pr-4 font-bold text-gray-800">{i.StockActual}</td>
                        <td className="py-3 pr-4 text-gray-700">{fmt(i.ValorTotal)}</td>
                        <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            i.EstadoStock === 'OK'         ? 'bg-green-100 text-green-600'   :
                            i.EstadoStock === 'Stock bajo' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-600'
                        }`}>{i.EstadoStock}</span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}

          {/* ── PRODUCTOS VENDIDOS ── */}
          {tab === 'productos' && (
            <TablaGenerica
              columnas={['Código','Producto','Categoría','Unidades','Ingresos','Costo','Ganancia']}
              filas={(data as ProductoReporte[]).map(p => [
                p.Codigo, p.NombreProducto, p.NombreCategoria,
                p.UnidadesVendidas, fmt(p.TotalIngresos), fmt(p.TotalCosto), fmt(p.Ganancia),
              ])}
            />
          )}

          {/* ── CLIENTES ── */}
          {tab === 'clientes' && (
            <TablaGenerica
              columnas={['DNI','Cliente','Teléfono','Compras','Total Gastado','Última Compra']}
              filas={(data as ClienteReporte[]).map(c => [
                c.DNI, c.Cliente, c.Telefono,
                c.TotalCompras, fmt(c.TotalGastado), fechaLocal(c.UltimaCompra),
              ])}
            />
          )}

          {/* ── FORMAS DE PAGO ── */}
          {tab === 'formaspago' && (
            <TablaGenerica
              columnas={['Forma de Pago','Total Ventas','Total Ingresos','Porcentaje']}
              filas={(data as FormaPagoReporte[]).map(f => [
                f.NombreFormaPago, f.TotalVentas, fmt(f.TotalIngresos), `${f.Porcentaje}%`,
              ])}
            />
          )}

          {/* ── GANANCIAS ── */}
          {tab === 'ganancias' && (
            <TablaGenerica
              columnas={['Código','Producto','Categoría','P.Compra','P.Venta','Margen S/','Margen %','Unidades','Ganancia Total']}
              filas={(data as GananciaReporte[]).map(g => [
                g.Codigo, g.NombreProducto, g.NombreCategoria,
                fmt(g.PrecioCompra), fmt(g.PrecioVenta),
                fmt(g.MargenUnitario), `${g.MargenPorcentaje}%`,
                g.Unidades, fmt(g.GananciaTotal),
              ])}
            />
          )}

            {/* ── BOLETAS ANULADAS ── */}
            {tab === 'anuladas' && (
            <div className="space-y-4">
                {/* Resumen */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <p className="text-xs text-gray-400">Total anuladas</p>
                    <p className="text-2xl font-bold text-red-500">
                    {Array.isArray(data) ? data.length : 0}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <p className="text-xs text-gray-400">Monto perdido</p>
                    <p className="text-2xl font-bold text-red-500">
                    {fmt(Array.isArray(data)
                        ? (data as AnuladasReporte[]).reduce((acc, v) => acc + Number(v.Total), 0)
                        : 0)}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <p className="text-xs text-gray-400">Período</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">{desde} al {hasta}</p>
                </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-sm p-5 overflow-x-auto">
                {!Array.isArray(data) || data.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">
                    Sin boletas anuladas en el período seleccionado
                    </p>
                ) : (
                    <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                        {['Boleta','Fecha','Cliente','DNI','Forma Pago','Subtotal','Descuento','Total','Vendedor','Items']
                            .map(c => <th key={c} className="pb-3 pr-4 whitespace-nowrap">{c}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {(data as AnuladasReporte[]).map((v, i) => (
                        <tr key={i} className="hover:bg-red-50 transition-colors">
                            <td className="py-3 pr-4 font-mono text-xs font-medium text-red-400">{v.NumeroBoleta}</td>
                            <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{fechaLocal(v.FechaVenta)}</td>
                            <td className="py-3 pr-4 text-gray-700">{v.Cliente}</td>
                            <td className="py-3 pr-4 text-gray-500">{v.DNI}</td>
                            <td className="py-3 pr-4 text-gray-500">{v.NombreFormaPago}</td>
                            <td className="py-3 pr-4 text-gray-700">{fmt(v.SubTotal)}</td>
                            <td className="py-3 pr-4 text-gray-500">{fmt(v.Descuento)}</td>
                            <td className="py-3 pr-4 font-bold text-red-500">{fmt(v.Total)}</td>
                            <td className="py-3 pr-4 text-gray-500">{v.Vendedor}</td>
                            <td className="py-3 pr-4 text-gray-700">{v.TotalItems}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
                </div>
            </div>
            )}
        </>
      )}
    </div>
  );
}

// ─── Tabla Genérica ───────────────────────────────────────────────────────────
function TablaGenerica({ columnas, filas }: {
  columnas: string[];
  filas: (string | number | React.ReactNode)[][];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 overflow-x-auto">
      {filas.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">Sin datos para el período seleccionado</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
              {columnas.map(c => <th key={c} className="pb-3 pr-4 whitespace-nowrap">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filas.map((fila, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {fila.map((celda, j) => (
                  <td key={j} className="py-3 pr-4 text-gray-700 whitespace-nowrap">{celda}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}