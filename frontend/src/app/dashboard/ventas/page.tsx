'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { ShoppingCart, Plus, Eye, XCircle, X, Trash2, Search, FileText, MessageCircle, CheckCircle2 } from 'lucide-react';

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
  NombreTalla: string; NombreColor: string; Estado?: number;
}
interface LineaVenta {
  IdInventario: number; NombreProducto: string; Codigo: string;
  NombreTalla: string; NombreColor: string;
  Cantidad: number; PrecioUnitario: number; StockActual: number;
}
interface ClienteNuevo {
  DNI: string; Nombres: string; Apellidos: string; Telefono: string;
}
interface VentaCreada {
  IdVenta: number; NumeroBoleta: string; Telefono?: string; Cliente?: string;
}

const BASE_URL = 'http://localhost:3001';

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const fechaLocal = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

type TipoCliente = 'registrado' | 'simple' | 'nuevo';
type TipoComprobante = 'BOLETA' | 'FACTURA';

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

  // Tipo de cliente
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('registrado');
  const [clienteNuevo, setClienteNuevo] = useState<ClienteNuevo>({
    DNI: '', Nombres: '', Apellidos: '', Telefono: '',
  });

  // Tipo de comprobante
  const [tipoComprobante, setTipoComprobante] = useState<TipoComprobante>('BOLETA');
  const [rucFactura, setRucFactura] = useState('');

  // Búsqueda cliente
  const [busqCliente, setBusqCliente] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarClientes, setMostrarClientes] = useState(false);

  // Búsqueda producto
  const [busqProd, setBusqProd]       = useState('');

  // Boleta generada (post-venta)
  const [ventaCreada, setVentaCreada] = useState<VentaCreada | null>(null);

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
    setMsgNueva(null);
    setTipoCliente('registrado');
    setClienteNuevo({ DNI: '', Nombres: '', Apellidos: '', Telefono: '' });
    setTipoComprobante('BOLETA');
    setRucFactura('');
    setVentaCreada(null);
    setModalNueva(true);
  };

  // ── Clientes frecuentes (top 5 por compras) ──
  const clientesFrecuentes = [...clientes]
    .sort((a, b) => (b.TotalCompras ?? 0) - (a.TotalCompras ?? 0))
    .slice(0, 5);

  const clientesFiltrados = busqCliente.trim()
    ? clientes.filter(c =>
        `${c.Nombres} ${c.Apellidos}`.toLowerCase().includes(busqCliente.toLowerCase()) ||
        c.DNI.includes(busqCliente)
      )
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
        IdInventario: item.IdInventario,
        NombreProducto: item.NombreProducto,
        Codigo: item.Codigo,
        NombreTalla: item.NombreTalla,
        NombreColor: item.NombreColor,
        Cantidad: 1,
        PrecioUnitario: Number(item.PrecioVenta),
        StockActual: item.StockActual,
      }];
    });
    setBusqProd('');
  };

  const cambiarCantidad = (idx: number, val: number) =>
    setLineas(prev => prev.map((l, i) =>
      i === idx ? { ...l, Cantidad: Math.max(1, Math.min(val, l.StockActual)) } : l
    ));

  const quitarLinea = (idx: number) =>
    setLineas(prev => prev.filter((_, i) => i !== idx));

  const subTotal     = lineas.reduce((acc, l) => acc + l.PrecioUnitario * l.Cantidad, 0);
  const montoDesc    = subTotal * (Number(pctDescuento) / 100);
  const totalFinal   = subTotal - montoDesc;

  const validarClienteOk = () => {
    if (tipoCliente === 'registrado') return !!clienteSeleccionado;
    if (tipoCliente === 'nuevo') return clienteNuevo.Nombres.trim().length > 0;
    return true; // simple
  };

  const guardarVenta = async () => {
    if (!validarClienteOk() || !idFormaPago || lineas.length === 0) {
      setMsgNueva('❌ Completa cliente, forma de pago y al menos un producto');
      return;
    }
    setGuardando(true); setMsgNueva(null);
    try {
      const body: any = {
        IdFormaPago: Number(idFormaPago),
        Descuento: montoDesc,
        TipoCliente: tipoCliente,
        TipoComprobante: tipoComprobante,
        items: lineas.map(l => ({
          IdInventario:   l.IdInventario,
          Cantidad:       l.Cantidad,
          PrecioUnitario: l.PrecioUnitario,
        })),
      };
      if (tipoCliente === 'registrado') body.IdCliente = clienteSeleccionado?.IdCliente;
      if (tipoCliente === 'nuevo') body.ClienteNuevo = clienteNuevo;

      const r = await apiFetch<{ ok: boolean; data: VentaDetalle }>('/ventas', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setMsgNueva('✅ Venta registrada correctamente');
      cargarVentas();
      setVentaCreada({
        IdVenta: r.data.IdVenta,
        NumeroBoleta: r.data.NumeroBoleta,
        Telefono: r.data.Telefono,
        Cliente: r.data.Cliente,
      });
    } catch (e: any) {
      setMsgNueva(`❌ ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const urlBoleta = (idVenta: number) => {
    const tipo = tipoComprobante.toLowerCase();
    const ruc = tipoComprobante === 'FACTURA' && rucFactura ? `&ruc=${rucFactura}` : '';
    return `${BASE_URL}/api/ventas/${idVenta}/boleta?tipo=${tipo}${ruc}`;
  };

  const enviarWhatsapp = (telefono: string | undefined, numeroBoleta: string, idVenta: number) => {
    if (!telefono) {
      alert('Este cliente no tiene número de teléfono registrado.');
      return;
    }
    const tel = telefono.replace(/\D/g, '');
    const telConCodigo = tel.startsWith('51') ? tel : `51${tel}`;
    const mensaje = encodeURIComponent(
      `Hola, aquí está tu comprobante ${numeroBoleta} de Tienda Aysel. Puedes verlo/descargarlo aquí: ${urlBoleta(idVenta)}`
    );
    window.open(`https://wa.me/${telConCodigo}?text=${mensaje}`, '_blank');
  };

  const totalVentas  = ventas.length;
  const completadas  = ventas.filter(v => v.Estado === 'Completado').length;
  const ingresoTotal = ventas.filter(v => v.Estado === 'Completado')
    .reduce((acc, v) => acc + Number(v.Total), 0);

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Cargando ventas...</div>
  );
  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">⚠️ {error}</div>
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
            <label htmlFor="Desde" className="text-xs text-gray-400 block mb-1">Desde</label>
            <input id="Desde" type="date" value={desde} onChange={e => setDesde(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
          </div>
          <div>
            <label htmlFor="Hasta" className="text-xs text-gray-400 block mb-1">Hasta</label>
            <input id="Hasta" type="date" value={hasta} onChange={e => setHasta(e.target.value)}
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
                      <a href={`${BASE_URL}/api/ventas/${v.IdVenta}/boleta`} target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500" title="Ver boleta">
                        <FileText size={15} />
                      </a>
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

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800">Boleta {detalle.NumeroBoleta}</h2>
                <p className="text-xs text-gray-400">{fechaLocal(detalle.FechaVenta)}</p>
              </div>
              <button type="button" onClick={() => setDetalle(null)} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
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
                <a href={`${BASE_URL}/api/ventas/${detalle.IdVenta}/boleta`} target="_blank" rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  <FileText size={15} /> Ver PDF
                </a>
                <button onClick={() => enviarWhatsapp(detalle.Telefono, detalle.NumeroBoleta, detalle.IdVenta)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium">
                  <MessageCircle size={15} /> WhatsApp
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDetalle(null)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">Cerrar</button>
                {detalle.Estado === 'Completado' && (
                  <button onClick={() => anularVenta(detalle.IdVenta)}
                    className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium">Anular venta</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva venta */}
      {modalNueva && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-base font-bold text-gray-800">
                {ventaCreada ? 'Venta registrada' : 'Nueva Venta'}
              </h2>
              <button type="button" onClick={() => setModalNueva(false)} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            {/* ── Pantalla de éxito post-venta ── */}
            {ventaCreada ? (
              <div className="p-8 flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-green-50">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">¡Venta registrada!</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Comprobante <span className="font-mono font-medium text-purple-600">{ventaCreada.NumeroBoleta}</span>
                    {ventaCreada.Cliente ? ` — ${ventaCreada.Cliente}` : ''}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
                  <a href={urlBoleta(ventaCreada.IdVenta)} target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                    <FileText size={16} /> Ver / descargar {tipoComprobante === 'FACTURA' ? 'factura' : 'boleta'}
                  </a>
                  <button
                    onClick={() => enviarWhatsapp(ventaCreada.Telefono, ventaCreada.NumeroBoleta, ventaCreada.IdVenta)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium">
                    <MessageCircle size={16} /> Enviar por WhatsApp
                  </button>
                </div>

                <button onClick={() => setModalNueva(false)}
                  className="mt-4 px-4 py-2 text-sm text-gray-400 hover:text-gray-600">
                  Cerrar
                </button>
              </div>
            ) : (
            <>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">

              {/* ── Tipo de cliente (tabs) ── */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tipo de venta *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['registrado', 'simple', 'nuevo'] as TipoCliente[]).map(tipo => (
                    <button key={tipo} type="button"
                      onClick={() => setTipoCliente(tipo)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                        tipoCliente === tipo
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}>
                      {tipo === 'registrado' ? 'Cliente registrado' : tipo === 'simple' ? 'Venta simple' : 'Cliente nuevo'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Cliente registrado: buscador ── */}
              {tipoCliente === 'registrado' && (
                <div>
                  <label htmlFor="Cliente" className="text-xs text-gray-500 mb-1 block">Cliente *</label>

                  {clienteSeleccionado ? (
                    <div className="flex items-center justify-between bg-purple-50 rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {clienteSeleccionado.Nombres} {clienteSeleccionado.Apellidos}
                        </p>
                        <p className="text-xs text-gray-400">DNI: {clienteSeleccionado.DNI}</p>
                      </div>
                      <button type="button" onClick={() => setClienteSeleccionado(null)} aria-label="Quitar cliente seleccionado" title="Quitar cliente"
                        className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar cliente por nombre o DNI..."
                            value={busqCliente}
                            onChange={e => { setBusqCliente(e.target.value); setMostrarClientes(true); }}
                            onFocus={() => setMostrarClientes(true)}
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                          />
                        </div>
                      </div>

                      {mostrarClientes && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                          {!busqCliente.trim() && (
                            <p className="text-xs text-gray-400 px-4 pt-2 pb-1">⭐ Clientes frecuentes</p>
                          )}
                          {clientesFiltrados.length === 0 ? (
                            <p className="text-sm text-gray-400 px-4 py-3">No se encontraron clientes</p>
                          ) : clientesFiltrados.map(c => (
                            <button key={c.IdCliente}
                              onClick={() => seleccionarCliente(c)}
                              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-50 text-left transition-colors">
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

              {/* ── Venta simple: mensaje informativo ── */}
              {tipoCliente === 'simple' && (
                <div className="bg-blue-50 text-blue-600 text-xs rounded-xl px-4 py-3">
                  Venta rápida sin registrar datos del cliente. Se asignará automáticamente a &quot;Cliente General&quot;.
                </div>
              )}

              {/* ── Cliente nuevo: formulario ── */}
              {tipoCliente === 'nuevo' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="dniNuevo" className="text-xs text-gray-500 mb-1 block">DNI</label>
                    <input id="dniNuevo" type="text" maxLength={8} value={clienteNuevo.DNI}
                      onChange={e => setClienteNuevo(prev => ({ ...prev, DNI: e.target.value.replace(/\D/g, '') }))}
                      placeholder="12345678"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="telNuevo" className="text-xs text-gray-500 mb-1 block">Teléfono</label>
                    <input id="telNuevo" type="text" value={clienteNuevo.Telefono}
                      onChange={e => setClienteNuevo(prev => ({ ...prev, Telefono: e.target.value }))}
                      placeholder="999999999"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="nombresNuevo" className="text-xs text-gray-500 mb-1 block">Nombres *</label>
                    <input id="nombresNuevo" type="text" value={clienteNuevo.Nombres}
                      onChange={e => setClienteNuevo(prev => ({ ...prev, Nombres: e.target.value }))}
                      placeholder="Ana María"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor="apellidosNuevo" className="text-xs text-gray-500 mb-1 block">Apellidos</label>
                    <input id="apellidosNuevo" type="text" value={clienteNuevo.Apellidos}
                      onChange={e => setClienteNuevo(prev => ({ ...prev, Apellidos: e.target.value }))}
                      placeholder="García López"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                </div>
              )}

              {/* Forma de pago */}
              <div>
                <label htmlFor="FormaPago" className="text-xs text-gray-500 mb-1 block">Forma de pago *</label>
                <select id="FormaPago" value={idFormaPago} onChange={e => setIdFormaPago(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                  <option value="">Seleccionar...</option>
                  {formasPago.map(f => (
                    <option key={f.IdFormaPago} value={f.IdFormaPago}>{f.NombreFormaPago}</option>
                  ))}
                </select>
              </div>

              {/* Tipo de comprobante */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Comprobante *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['BOLETA', 'FACTURA'] as TipoComprobante[]).map(tipo => (
                    <button key={tipo} type="button"
                      onClick={() => setTipoComprobante(tipo)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                        tipoComprobante === tipo
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}>
                      {tipo === 'BOLETA' ? 'Boleta' : 'Factura'}
                    </button>
                  ))}
                </div>
                {tipoComprobante === 'FACTURA' && (
                  <input type="text" value={rucFactura} onChange={e => setRucFactura(e.target.value.replace(/\D/g, ''))}
                    placeholder="RUC del cliente (11 dígitos)" maxLength={11}
                    className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                )}
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
                            {item.NombreTalla && <span>Talla: {item.NombreTalla} · </span>}
                            {item.NombreColor && <span>Color: {item.NombreColor} · </span>}
                            Stock: {item.StockActual}
                          </p>
                        </div>
                        <span className="text-purple-600 font-bold text-sm shrink-0 ml-2">{fmt(item.PrecioVenta)}</span>
                      </button>
                    ))}
                  </div>
                )}
                {busqProd && prodFiltrados.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1 px-2">No se encontraron productos con stock disponible</p>
                )}
              </div>

              {/* Líneas de venta */}
              {lineas.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Productos seleccionados</p>
                  <div className="space-y-2">
                    {lineas.map((l, i) => (
                      <div key={l.IdInventario} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{l.NombreProducto}</p>
                          <p className="text-xs text-gray-400">
                            {l.NombreTalla && `Talla: ${l.NombreTalla} · `}
                            {l.NombreColor && `Color: ${l.NombreColor} · `}
                            {fmt(l.PrecioUnitario)}
                          </p>
                        </div>
                        <input type="number" min={1} max={l.StockActual}
                          value={l.Cantidad} onChange={e => cambiarCantidad(i, Number(e.target.value))} aria-label="Cantidad"
                          className="w-16 px-2 py-1 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300" />
                        <span className="text-sm font-bold text-gray-800 w-20 text-right">
                          {fmt(l.PrecioUnitario * l.Cantidad)}
                        </span>
                        <button type="button" onClick={() => quitarLinea(i)} aria-label="Quitar producto" className="text-red-400 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descuento % y total */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-800">{fmt(subTotal)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <label htmlFor="pctDescuento" className="text-gray-500 shrink-0">Descuento (%)</label>
                  <div className="flex items-center gap-2">
                    <input id="pctDescuento" type="number" min="0" max="100" value={pctDescuento}
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
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}