'use client';
import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api-client';
import { ShoppingCart, Plus, Eye, XCircle, X, Trash2, Search, FileText, Send } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Venta {
  IdVenta: number; NumeroBoleta: string; FechaVenta: string;
  SubTotal: string; Descuento: string; Total: string; Estado: string;
  Cliente: string; DNI: string; NombreFormaPago: string; Vendedor: string;
}
interface DetalleItem {
  IdDetalleVenta: number; NombreProducto: string; Codigo: string;
  NombreTalla: string; NombreColor: string;
  Cantidad: number; PrecioUnitario: string; Descuento: string; SubTotal: string;
}
interface VentaDetalle extends Venta { detalle: DetalleItem[]; Telefono?: string; }
interface Cliente { IdCliente: number; DNI: string; Nombres: string; Apellidos: string; Telefono: string; TotalCompras?: number; }
interface FormaPago { IdFormaPago: number; NombreFormaPago: string; }
interface ItemInventario {
  IdInventario: number; StockActual: number; Codigo: string;
  NombreProducto: string; PrecioVenta: string; NombreCategoria?: string;
  NombreTalla: string; NombreColor: string;
}
interface LineaVenta {
  IdInventario: number; NombreProducto: string; Codigo: string;
  NombreTalla: string; NombreColor: string;
  Cantidad: number; PrecioUnitario: number; StockActual: number;
}

type TipoCliente = 'simple' | 'registrado' | 'nuevo';
type TipoComprobante = 'BOLETA' | 'FACTURA';

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const fechaLocal = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

const BASE_URL = 'http://localhost:3001';

// ─── Componente principal ─────────────────────────────────────────────────────
export default function VentasPage() {
  const [ventas, setVentas]           = useState<Venta[]>([]);
  const [cargando, setCargando]       = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [desde, setDesde]             = useState('');
  const [hasta, setHasta]             = useState('');
  const [detalle, setDetalle]         = useState<VentaDetalle | null>(null);
  const [modalNueva, setModalNueva]   = useState(false);

  // Nueva venta
  const [clientes, setClientes]       = useState<Cliente[]>([]);
  const [formasPago, setFormasPago]   = useState<FormaPago[]>([]);
  const [inventario, setInventario]   = useState<ItemInventario[]>([]);
  const [idFormaPago, setIdFormaPago] = useState('');
  const [pctDescuento, setPctDescuento] = useState('0');
  const [lineas, setLineas]           = useState<LineaVenta[]>([]);
  const [guardando, setGuardando]     = useState(false);
  const [msgNueva, setMsgNueva]       = useState<string | null>(null);

  // Tipo cliente
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('registrado');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busqCliente, setBusqCliente] = useState('');
  const [mostrarClientes, setMostrarClientes] = useState(false);

  // Cliente nuevo
  const [clienteNuevo, setClienteNuevo] = useState({ DNI: '', Nombres: '', Apellidos: '', Telefono: '' });

  // Tipo comprobante
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('BOLETA');
  const [rucFactura, setRucFactura]   = useState('');

  // Búsqueda producto
  const [busqProd, setBusqProd]       = useState('');

  // Modal boleta
  const [boletaUrl, setBoletaUrl]     = useState<string | null>(null);
  const [boletaVenta, setBoletaVenta] = useState<VentaDetalle | null>(null);
  const iframeRef                     = useRef<HTMLIFrameElement>(null);

  const cargarVentas = () => {
    setCargando(true);
    const params = desde && hasta ? `?desde=${desde}&hasta=${hasta}` : '';
    apiFetch<{ ok: boolean; data: Venta[] }>(`/ventas${params}`)
      .then(r => setVentas(r.data))
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarVentas(); }, []);

  const abrirDetalle = async (id: number) => {
    const r = await apiFetch<{ ok: boolean; data: VentaDetalle }>(`/ventas/${id}`);
    setDetalle(r.data);
  };

  const anularVenta = async (id: number) => {
    if (!confirm('¿Seguro que deseas anular esta venta?')) return;
    try {
      await apiFetch(`/ventas/${id}/anular`, { method: 'PATCH' });
      cargarVentas();
      if (detalle?.IdVenta === id) setDetalle(null);
    } catch (e: any) { alert(e.message); }
  };

  const abrirNueva = async () => {
    const [c, f, inv] = await Promise.all([
      apiFetch<{ ok: boolean; data: Cliente[] }>('/ventas/clientes'),
      apiFetch<{ ok: boolean; data: FormaPago[] }>('/ventas/formaspago'),
      apiFetch<{ ok: boolean; data: ItemInventario[] }>('/inventario'),
    ]);
    setClientes(c.data);
    setFormasPago(f.data);
    setInventario(inv.data.filter(i => i.StockActual > 0));
    setIdFormaPago('');
    setPctDescuento('0');
    setLineas([]);
    setBusqProd('');
    setBusqCliente('');
    setClienteSeleccionado(null);
    setMostrarClientes(false);
    setTipoCliente('registrado');
    setClienteNuevo({ DNI: '', Nombres: '', Apellidos: '', Telefono: '' });
    setTipoComprobante('BOLETA');
    setRucFactura('');
    setMsgNueva(null);
    setModalNueva(true);
  };

  // ── Clientes frecuentes ──
  const clientesFrecuentes = [...clientes]
    .sort((a, b) => (b.TotalCompras ?? 0) - (a.TotalCompras ?? 0))
    .slice(0, 5);

  const clientesFiltrados = busqCliente.trim()
    ? clientes.filter(c =>
        `${c.Nombres} ${c.Apellidos}`.toLowerCase().includes(busqCliente.toLowerCase()) ||
        c.DNI.includes(busqCliente))
    : clientesFrecuentes;

  const seleccionarCliente = (c: Cliente) => {
    setClienteSeleccionado(c);
    setBusqCliente('');
    setMostrarClientes(false);
  };

  // ── Productos ──
  const prodFiltrados = inventario.filter(i =>
    i.NombreProducto.toLowerCase().includes(busqProd.toLowerCase()) ||
    i.Codigo.toLowerCase().includes(busqProd.toLowerCase())
  );

  const agregarLinea = (item: ItemInventario) => {
    setLineas(prev => {
      const existe = prev.find(l => l.IdInventario === item.IdInventario);
      if (existe) {
        return prev.map(l => l.IdInventario === item.IdInventario
          ? { ...l, Cantidad: Math.min(l.Cantidad + 1, item.StockActual) } : l);
      }
      return [...prev, {
        IdInventario:   item.IdInventario,
        NombreProducto: item.NombreProducto,
        Codigo:         item.Codigo,
        NombreTalla:    item.NombreTalla,
        NombreColor:    item.NombreColor,
        Cantidad:       1,
        PrecioUnitario: Number(item.PrecioVenta),
        StockActual:    item.StockActual,
      }];
    });
    setBusqProd('');
  };

  const cambiarCantidad = (idx: number, val: number) =>
    setLineas(prev => prev.map((l, i) =>
      i === idx ? { ...l, Cantidad: Math.max(1, Math.min(val, l.StockActual)) } : l));

  const quitarLinea = (idx: number) =>
    setLineas(prev => prev.filter((_, i) => i !== idx));

  const subTotal   = lineas.reduce((acc, l) => acc + l.PrecioUnitario * l.Cantidad, 0);
  const montoDesc  = subTotal * (Number(pctDescuento) / 100);
  const totalFinal = subTotal - montoDesc;

  // ── Guardar venta ──
  const guardarVenta = async () => {
    if (tipoCliente === 'registrado' && !clienteSeleccionado) {
      setMsgNueva(' Selecciona un cliente'); return;
    }
    if (tipoCliente === 'nuevo' && !clienteNuevo.Nombres.trim()) {
      setMsgNueva(' Ingresa el nombre del cliente'); return;
    }
    if (!idFormaPago || lineas.length === 0) {
      setMsgNueva(' Completa forma de pago y al menos un producto'); return;
    }
    if (tipoComprobante === 'FACTURA' && !rucFactura.trim()) {
      setMsgNueva(' Ingresa el RUC para la factura'); return;
    }

    setGuardando(true); setMsgNueva(null);
    try {
      const body: any = {
        IdFormaPago:     Number(idFormaPago),
        Descuento:       montoDesc,
        TipoCliente:     tipoCliente,
        TipoComprobante: tipoComprobante,
        items: lineas.map(l => ({
          IdInventario:   l.IdInventario,
          Cantidad:       l.Cantidad,
          PrecioUnitario: l.PrecioUnitario,
        })),
      };

      if (tipoCliente === 'registrado') body.IdCliente = clienteSeleccionado!.IdCliente;
      if (tipoCliente === 'nuevo')      body.ClienteNuevo = clienteNuevo;

      const r = await apiFetch<{ ok: boolean; data: { IdVenta: number } }>('/ventas', {
        method: 'POST', body: JSON.stringify(body),
      });

      const idVenta  = r.data.IdVenta;
      const ventaDet = await apiFetch<{ ok: boolean; data: VentaDetalle }>(`/ventas/${idVenta}`);

      setModalNueva(false);
      cargarVentas();

      // Abrir boleta automáticamente
      const url = `${BASE_URL}/api/ventas/${idVenta}/boleta?tipo=${tipoComprobante}${tipoComprobante === 'FACTURA' ? `&ruc=${rucFactura}` : ''}`;
      setBoletaUrl(url);
      setBoletaVenta(ventaDet.data);

    } catch (e: any) {
      setMsgNueva(` ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // ── WhatsApp ──
  const enviarWhatsApp = (venta: VentaDetalle, url: string) => {
    const telefono = venta.Telefono?.replace(/\D/g, '') ?? '';
    if (!telefono) { alert('Este cliente no tiene teléfono registrado'); return; }
    const msg = encodeURIComponent(
      `Hola ${venta.Cliente} \n` +
      `Aquí está tu comprobante de compra:\n` +
      ` *${venta.NumeroBoleta}*\n` +
      ` Total: S/ ${Number(venta.Total).toFixed(2)}\n` +
      ` Fecha: ${fechaLocal(venta.FechaVenta)}\n\n` +
      `¡Gracias por tu compra en Tienda Aysel! `
    );
    window.open(`https://wa.me/51${telefono}?text=${msg}`, '_blank');
  };

  const descargarBoleta = (idVenta: number, tipo: string, ruc?: string) => {
    const url = `${BASE_URL}/api/ventas/${idVenta}/boleta?tipo=${tipo}${ruc ? `&ruc=${ruc}` : ''}`;
    window.open(url, '_blank');
  };

  // Stats
  const totalVentas  = ventas.length;
  const completadas  = ventas.filter(v => v.Estado === 'Completado').length;
  const ingresoTotal = ventas.filter(v => v.Estado === 'Completado')
    .reduce((acc, v) => acc + Number(v.Total), 0);

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Cargando ventas...</div>
  );
  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm"> {error}</div>
  );

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ventas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Registro y gestión de ventas</p>
        </div>
        <button onClick={abrirNueva}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Nueva venta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-purple-50 w-fit mb-3"><ShoppingCart size={22} className="text-purple-500" /></div>
          <p className="text-xs text-gray-400">Total ventas</p>
          <p className="text-2xl font-bold text-gray-800">{totalVentas}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-green-50 w-fit mb-3"><ShoppingCart size={22} className="text-green-500" /></div>
          <p className="text-xs text-gray-400">Completadas</p>
          <p className="text-2xl font-bold text-gray-800">{completadas}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-pink-50 w-fit mb-3"><ShoppingCart size={22} className="text-pink-500" /></div>
          <p className="text-xs text-gray-400">Ingresos totales</p>
          <p className="text-2xl font-bold text-gray-800">{fmt(ingresoTotal)}</p>
        </div>
      </div>

      {/* Filtro + Tabla */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={cargarVentas}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700">Filtrar</button>
            <button onClick={() => { setDesde(''); setHasta(''); setTimeout(cargarVentas, 0); }}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50">Limpiar</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 pr-4">Boleta</th>
                <th className="pb-3 pr-4">Fecha</th>
                <th className="pb-3 pr-4">Cliente</th>
                <th className="pb-3 pr-4">Forma pago</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ventas.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Sin ventas</td></tr>
              ) : ventas.map(v => (
                <tr key={v.IdVenta} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs font-medium text-purple-600">{v.NumeroBoleta}</td>
                  <td className="py-3 pr-4 text-gray-500">{fechaLocal(v.FechaVenta)}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-800">{v.Cliente}</p>
                    <p className="text-xs text-gray-400">{v.DNI}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{v.NombreFormaPago}</td>
                  <td className="py-3 pr-4 font-bold text-gray-800">{fmt(v.Total)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.Estado === 'Completado' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}>{v.Estado}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button onClick={() => abrirDetalle(v.IdVenta)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500" title="Ver detalle">
                        <Eye size={15} />
                      </button>
                      <button onClick={() => descargarBoleta(v.IdVenta, 'BOLETA')}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Ver boleta">
                        <FileText size={15} />
                      </button>
                      {v.Estado === 'Completado' && (
                        <button onClick={() => anularVenta(v.IdVenta)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Anular">
                          <XCircle size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal detalle ── */}
      {detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800">Boleta {detalle.NumeroBoleta}</h2>
                <p className="text-xs text-gray-400">{fechaLocal(detalle.FechaVenta)}</p>
              </div>
              <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">Cliente</p><p className="font-medium text-gray-800">{detalle.Cliente}</p></div>
                <div><p className="text-xs text-gray-400">DNI</p><p className="font-medium text-gray-800">{detalle.DNI}</p></div>
                <div><p className="text-xs text-gray-400">Forma de pago</p><p className="font-medium text-gray-800">{detalle.NombreFormaPago}</p></div>
                <div><p className="text-xs text-gray-400">Vendedor</p><p className="font-medium text-gray-800">{detalle.Vendedor}</p></div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Productos</p>
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
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(detalle.SubTotal)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Descuento</span><span>- {fmt(detalle.Descuento)}</span></div>
                <div className="flex justify-between font-bold text-gray-800 text-base"><span>Total</span><span>{fmt(detalle.Total)}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setDetalle(null)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cerrar</button>
                <button onClick={() => descargarBoleta(detalle.IdVenta, 'BOLETA')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                  <FileText size={14} /> Boleta
                </button>
                <button onClick={() => enviarWhatsApp(detalle, '')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600">
                  <Send size={14} /> WhatsApp
                </button>
                {detalle.Estado === 'Completado' && (
                  <button onClick={() => anularVenta(detalle.IdVenta)}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">Anular</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal boleta post-venta ── */}
      {boletaUrl && boletaVenta && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-800"> Venta registrada</h2>
                <p className="text-xs text-gray-400">{boletaVenta.NumeroBoleta} · {fmt(boletaVenta.Total)}</p>
              </div>
              <button onClick={() => { setBoletaUrl(null); setBoletaVenta(null); }}
                className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {/* Vista previa PDF */}
            <div className="flex-1 overflow-hidden p-4">
              <iframe
                ref={iframeRef}
                src={boletaUrl}
                className="w-full h-full rounded-xl border border-gray-200"
                style={{ minHeight: '400px' }}
                title="Boleta"
              />
            </div>

            <div className="flex gap-2 p-4 shrink-0 border-t border-gray-100">
              <button onClick={() => window.open(boletaUrl, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium">
                <FileText size={15} /> Descargar PDF
              </button>
              <button onClick={() => enviarWhatsApp(boletaVenta, boletaUrl)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium">
                <Send size={15} /> Enviar WhatsApp
              </button>
              <button onClick={() => { setBoletaUrl(null); setBoletaVenta(null); }}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal nueva venta ── */}
      {modalNueva && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-bold text-gray-800">Nueva Venta</h2>
              <button onClick={() => setModalNueva(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">

              {/* Tipo comprobante */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block font-medium">Tipo de comprobante</label>
                <div className="flex gap-2">
                  {(['BOLETA', 'FACTURA'] as TipoComprobante[]).map(t => (
                    <button key={t} onClick={() => setTipoComprobante(t)}
                      className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${
                        tipoComprobante === t
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}>
                      {t === 'BOLETA' ? ' Boleta' : ' Factura'}
                    </button>
                  ))}
                </div>
                {tipoComprobante === 'FACTURA' && (
                  <input value={rucFactura} onChange={e => setRucFactura(e.target.value)}
                    placeholder="RUC del cliente (11 dígitos)"
                    className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                )}
              </div>

              {/* Tipo cliente */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block font-medium">Tipo de cliente</label>
                <div className="flex gap-2">
                  {([
                    { key: 'simple',      label: ' Venta rápida' },
                    { key: 'registrado',  label: ' Registrado'   },
                    { key: 'nuevo',       label: ' Nuevo cliente' },
                  ] as { key: TipoCliente; label: string }[]).map(t => (
                    <button key={t.key} onClick={() => setTipoCliente(t.key)}
                      className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-colors ${
                        tipoCliente === t.key
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simple — sin datos */}
              {tipoCliente === 'simple' && (
                <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-700">
                   Venta rápida sin datos del cliente. Se registrará como "Cliente General".
                </div>
              )}

              {/* Registrado */}
              {tipoCliente === 'registrado' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Buscar cliente *</label>
                  {clienteSeleccionado ? (
                    <div className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{clienteSeleccionado.Nombres} {clienteSeleccionado.Apellidos}</p>
                        <p className="text-xs text-gray-400">DNI: {clienteSeleccionado.DNI} · Tel: {clienteSeleccionado.Telefono}</p>
                      </div>
                      <button onClick={() => setClienteSeleccionado(null)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Buscar por nombre o DNI..."
                          value={busqCliente}
                          onChange={e => { setBusqCliente(e.target.value); setMostrarClientes(true); }}
                          onFocus={() => setMostrarClientes(true)}
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                      </div>
                      {mostrarClientes && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {!busqCliente.trim() && (
                            <p className="text-xs text-gray-400 px-4 pt-2 pb-1">⭐ Clientes frecuentes</p>
                          )}
                          {clientesFiltrados.length === 0 ? (
                            <p className="text-sm text-gray-400 px-4 py-3">No se encontraron clientes</p>
                          ) : clientesFiltrados.map(c => (
                            <button key={c.IdCliente} onClick={() => seleccionarCliente(c)}
                              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-50 text-left transition-colors border-b border-gray-50 last:border-0">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{c.Nombres} {c.Apellidos}</p>
                                <p className="text-xs text-gray-400">DNI: {c.DNI}</p>
                              </div>
                              {c.TotalCompras ? (
                                <span className="text-xs text-purple-500 font-medium">{c.TotalCompras} compras</span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Nuevo cliente */}
              {tipoCliente === 'nuevo' && (
                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium">Datos del nuevo cliente</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">DNI</label>
                      <input value={clienteNuevo.DNI}
                        onChange={e => setClienteNuevo(p => ({ ...p, DNI: e.target.value }))}
                        maxLength={8} placeholder="12345678"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
                      <input value={clienteNuevo.Telefono}
                        onChange={e => setClienteNuevo(p => ({ ...p, Telefono: e.target.value }))}
                        placeholder="987000000"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Nombres *</label>
                      <input value={clienteNuevo.Nombres}
                        onChange={e => setClienteNuevo(p => ({ ...p, Nombres: e.target.value }))}
                        placeholder="Ana"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Apellidos</label>
                      <input value={clienteNuevo.Apellidos}
                        onChange={e => setClienteNuevo(p => ({ ...p, Apellidos: e.target.value }))}
                        placeholder="García"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Forma de pago */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Forma de pago *</label>
                <select value={idFormaPago} onChange={e => setIdFormaPago(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                  <option value="">Seleccionar...</option>
                  {formasPago.map(f => (
                    <option key={f.IdFormaPago} value={f.IdFormaPago}>{f.NombreFormaPago}</option>
                  ))}
                </select>
              </div>

              {/* Buscador productos */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Agregar producto</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Buscar por nombre o código..."
                    value={busqProd} onChange={e => setBusqProd(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                {busqProd && prodFiltrados.length > 0 && (
                  <div className="border border-gray-200 rounded-xl mt-1 max-h-44 overflow-y-auto shadow-sm">
                    {prodFiltrados.map(item => (
                      <button key={item.IdInventario} onClick={() => agregarLinea(item)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-50 text-left transition-colors border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{item.NombreProducto}</p>
                          <p className="text-xs text-gray-400">
                            {item.NombreCategoria && <span>{item.NombreCategoria} · </span>}
                            {item.NombreTalla    && <span>T: {item.NombreTalla} · </span>}
                            {item.NombreColor    && <span>C: {item.NombreColor} · </span>}
                            Stock: {item.StockActual}
                          </p>
                        </div>
                        <span className="text-purple-600 font-bold text-sm shrink-0 ml-2">{fmt(item.PrecioVenta)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Líneas */}
              {lineas.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Productos seleccionados</p>
                  <div className="space-y-2">
                    {lineas.map((l, i) => (
                      <div key={l.IdInventario} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{l.NombreProducto}</p>
                          <p className="text-xs text-gray-400">
                            {l.NombreTalla && `T: ${l.NombreTalla} · `}
                            {l.NombreColor && `C: ${l.NombreColor} · `}
                            {fmt(l.PrecioUnitario)}
                          </p>
                        </div>
                        <input type="number" min={1} max={l.StockActual}
                          value={l.Cantidad} onChange={e => cambiarCantidad(i, Number(e.target.value))}
                          className="w-16 px-2 py-1 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
                        <span className="text-sm font-bold text-gray-800 w-20 text-right">
                          {fmt(l.PrecioUnitario * l.Cantidad)}
                        </span>
                        <button onClick={() => quitarLinea(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totales */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-800">{fmt(subTotal)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-gray-500 shrink-0">Descuento (%)</span>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" max="100" value={pctDescuento}
                      onChange={e => setPctDescuento(e.target.value)}
                      className="w-20 px-2 py-1 text-sm text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    <span className="text-gray-400 text-xs">= {fmt(montoDesc)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center font-bold text-gray-800 text-base border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span className="text-purple-600">{fmt(totalFinal)}</span>
                </div>
              </div>

              {msgNueva && <p className="text-sm text-center">{msgNueva}</p>}
            </div>

            <div className="flex gap-3 p-6 pt-0 shrink-0">
              <button onClick={() => setModalNueva(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={guardarVenta} disabled={guardando}
                className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium">
                {guardando ? 'Registrando...' : 'Registrar venta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}