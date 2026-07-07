'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import { getUserFromToken } from '@/lib/auth';
import {
  ShoppingCart, Search, Trash2, Plus, Minus,
  User, UserPlus, X, CheckCircle, Tag, FileText, MessageCircle
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Producto {
  IdInventario: number; Codigo: string; NombreProducto: string;
  PrecioVenta: string; StockActual: number; NombreCategoria: string;
  NombreTalla: string; NombreColor: string;
}
interface Cliente {
  IdCliente: number; DNI: string; Nombres: string;
  Apellidos: string; Telefono: string; TotalCompras?: number;
}
interface Promo {
  IdPromocion: number; NombrePromocion: string; Descuento: string;
}
interface FormaPago { IdFormaPago: number; NombreFormaPago: string; }
interface LineaCarrito {
  IdInventario: number; NombreProducto: string; Codigo: string;
  NombreTalla: string; NombreColor: string;
  Cantidad: number; PrecioUnitario: number; StockActual: number;
}

type TipoCliente = 'simple' | 'registrado' | 'nuevo';
type TipoComprobante = 'Boleta' | 'Factura';

const BASE_URL = 'http://localhost:3001';

const fmt = (v: number) =>
  `S/ ${v.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const HOY = new Date().toLocaleDateString('es-PE', {
  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
});

// ─── Componente ───────────────────────────────────────────────────────────────
export default function PosPage() {
  const [productos, setProductos]     = useState<Producto[]>([]);
  const [categorias, setCategorias]   = useState<string[]>([]);
  const [formasPago, setFormasPago]   = useState<FormaPago[]>([]);
  const [cargando, setCargando]       = useState(true);

  // Carrito
  const [carrito, setCarrito]         = useState<LineaCarrito[]>([]);

  // Búsqueda
  const [busq, setBusq]               = useState('');
  const [catFiltro, setCatFiltro]     = useState('Todas las categorías');

  // Cliente
  const [tipoCliente, setTipoCliente] = useState<TipoCliente>('simple');
  const [clienteSel, setClienteSel]   = useState<Cliente | null>(null);
  const [busqCliente, setBusqCliente] = useState('');
  const [clientes, setClientes]       = useState<Cliente[]>([]);
  const [mostrarDrop, setMostrarDrop] = useState(false);
  const [promos, setPromos]           = useState<Promo[]>([]);
  const [promoSel, setPromoSel]       = useState<Promo | null>(null);

  // Nuevo cliente
  const [nuevoForm, setNuevoForm]     = useState({ DNI: '', Nombres: '', Apellidos: '', Telefono: '' });

  // Pago
  const [comprobante, setComprobante] = useState<TipoComprobante>('Boleta');
  const [idFormaPago, setIdFormaPago] = useState('');
  const [descManual, setDescManual]   = useState('0');

  // Resultado
  const [procesando, setProcesando]   = useState(false);
  const [ventaOk, setVentaOk]         = useState<{
    idVenta: number; boleta: string; total: number; telefono?: string;
  } | null>(null);
  const [errorVenta, setErrorVenta]   = useState<string | null>(null);

  // Hora en tiempo real
  const [hora, setHora] = useState('');
  useEffect(() => {
    const tick = () => setHora(new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    Promise.all([
      apiFetch<{ ok: boolean; data: Producto[] }>('/inventario'),
      apiFetch<{ ok: boolean; data: FormaPago[] }>('/ventas/formaspago'),
      apiFetch<{ ok: boolean; data: Cliente[] }>('/ventas/clientes'),
    ]).then(([inv, fp, cli]) => {
      const activos = inv.data.filter(i => i.StockActual > 0);
      setProductos(activos);
      const cats = ['Todas las categorías', ...Array.from(new Set(activos.map(p => p.NombreCategoria).filter(Boolean)))];
      setCategorias(cats);
      setFormasPago(fp.data);
      if (fp.data.length > 0) setIdFormaPago(String(fp.data[0].IdFormaPago));
      setClientes(cli.data);
    }).finally(() => setCargando(false));
  }, []);

  // Cargar promos cuando se selecciona cliente registrado
  useEffect(() => {
    if (!clienteSel) { setPromos([]); setPromoSel(null); return; }
    apiFetch<{ ok: boolean; data: Promo[] }>(`/promociones/cliente/${clienteSel.IdCliente}`)
      .then(r => {
        setPromos(r.data);
        setPromoSel(r.data.length > 0 ? r.data[0] : null);
      })
      .catch(() => { setPromos([]); setPromoSel(null); });
  }, [clienteSel]);

  // ── Productos filtrados ──
  const prodFiltrados = productos.filter(p => {
    const matchBusq = !busq ||
      p.NombreProducto.toLowerCase().includes(busq.toLowerCase()) ||
      p.Codigo.toLowerCase().includes(busq.toLowerCase());
    const matchCat = catFiltro === 'Todas las categorías' || p.NombreCategoria === catFiltro;
    return matchBusq && matchCat;
  });

  // ── Clientes filtrados ──
  const clientesFiltrados = busqCliente.trim()
    ? clientes.filter(c =>
        `${c.Nombres} ${c.Apellidos}`.toLowerCase().includes(busqCliente.toLowerCase()) ||
        c.DNI.includes(busqCliente)
      )
    : [...clientes].sort((a, b) => (b.TotalCompras ?? 0) - (a.TotalCompras ?? 0)).slice(0, 6);

  // ── Carrito ──
  const agregarProducto = (p: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(l => l.IdInventario === p.IdInventario);
      if (existe) {
        return prev.map(l => l.IdInventario === p.IdInventario
          ? { ...l, Cantidad: Math.min(l.Cantidad + 1, p.StockActual) } : l);
      }
      return [...prev, {
        IdInventario: p.IdInventario, NombreProducto: p.NombreProducto,
        Codigo: p.Codigo, NombreTalla: p.NombreTalla, NombreColor: p.NombreColor,
        Cantidad: 1, PrecioUnitario: Number(p.PrecioVenta), StockActual: p.StockActual,
      }];
    });
  };

  const cambiarCantidad = (idx: number, delta: number) =>
    setCarrito(prev => prev.map((l, i) => i === idx
      ? { ...l, Cantidad: Math.max(1, Math.min(l.Cantidad + delta, l.StockActual)) } : l
    ));

  const quitarLinea = (idx: number) =>
    setCarrito(prev => prev.filter((_, i) => i !== idx));

  const limpiarCarrito = () => {
    setCarrito([]); setClienteSel(null); setTipoCliente('simple');
    setPromoSel(null); setDescManual('0'); setErrorVenta(null);
    setBusq(''); setBusqCliente('');
  };

  // ── Cálculos ──
  const subTotal   = carrito.reduce((acc, l) => acc + l.PrecioUnitario * l.Cantidad, 0);
  const pctPromo   = promoSel ? Number(promoSel.Descuento) : 0;
  const pctManual  = Number(descManual) || 0;
  const pctTotal   = Math.min(pctPromo + pctManual, 100);
  const montoDesc  = subTotal * (pctTotal / 100);
  const totalFinal = subTotal - montoDesc;

  // ── Registrar venta ──
  const registrarVenta = async () => {
    if (carrito.length === 0) { setErrorVenta('Agrega al menos un producto'); return; }
    if (!idFormaPago) { setErrorVenta('Selecciona forma de pago'); return; }

    setProcesando(true); setErrorVenta(null);
    try {
      let idCliente: number;
      let telefonoCliente: string | undefined;

      if (tipoCliente === 'simple') {
        // Cliente genérico — busca o crea "Cliente General"
        const r = await apiFetch<{ ok: boolean; data: Cliente }>('/clientes/rapido', {
          method: 'POST',
          body: JSON.stringify({ DNI: '00000000', Nombres: 'Cliente', Apellidos: 'General' }),
        });
        idCliente = r.data.IdCliente;
        telefonoCliente = undefined;

      } else if (tipoCliente === 'registrado') {
        if (!clienteSel) { setErrorVenta('Selecciona un cliente'); setProcesando(false); return; }
        idCliente = clienteSel.IdCliente;
        telefonoCliente = clienteSel.Telefono;

      } else {
        // Nuevo cliente
        if (!nuevoForm.DNI || !nuevoForm.Nombres) {
          setErrorVenta('DNI y Nombre son requeridos'); setProcesando(false); return;
        }
        const r = await apiFetch<{ ok: boolean; data: Cliente }>('/clientes/rapido', {
          method: 'POST', body: JSON.stringify(nuevoForm),
        });
        idCliente = r.data.IdCliente;
        telefonoCliente = nuevoForm.Telefono || undefined;
      }

      const user = getUserFromToken();
      const r = await apiFetch<{ ok: boolean; data: any }>('/ventas', {
        method: 'POST',
        body: JSON.stringify({
          IdCliente:   idCliente,
          IdFormaPago: Number(idFormaPago),
          Descuento:   montoDesc,
          Comprobante: comprobante,
          items: carrito.map(l => ({
            IdInventario:   l.IdInventario,
            Cantidad:       l.Cantidad,
            PrecioUnitario: l.PrecioUnitario,
          })),
        }),
      });

      setVentaOk({
        idVenta: r.data.IdVenta,
        boleta: r.data.NumeroBoleta ?? 'OK',
        total: totalFinal,
        telefono: r.data.Telefono ?? telefonoCliente,
      });
      limpiarCarrito();
    } catch (e: any) {
      setErrorVenta(e.message);
    } finally {
      setProcesando(false);
    }
  };

  // ── PDF y WhatsApp ──
  const urlBoleta = (idVenta: number) =>
    `${BASE_URL}/api/ventas/${idVenta}/boleta?tipo=${comprobante.toLowerCase()}`;

  const enviarWhatsapp = (telefono: string | undefined, boleta: string, idVenta: number) => {
    if (!telefono) {
      alert('Este cliente no tiene número de teléfono registrado.');
      return;
    }
    const tel = telefono.replace(/\D/g, '');
    const telConCodigo = tel.startsWith('51') ? tel : `51${tel}`;
    const mensaje = encodeURIComponent(
      `Hola, aquí está tu comprobante ${boleta} de Tienda Aysel. Puedes verlo/descargarlo aquí: ${urlBoleta(idVenta)}`
    );
    window.open(`https://wa.me/${telConCodigo}?text=${mensaje}`, '_blank');
  };

  if (cargando) return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Cargando productos...
    </div>
  );

  return (
    <div className="flex h-full">

      {/* ── Panel izquierdo: productos ── */}
      <div className="flex-1 flex flex-col p-5 overflow-hidden">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
          <p className="text-sm text-gray-400 capitalize">{HOY} · {hora}</p>
        </div>

        {/* Buscador + filtro categoría */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre, código..."
              value={busq} onChange={e => setBusq(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
          </div>
          <label htmlFor="catFiltro" className="sr-only">Categoría</label>
          <select id = "catFiltro" value={catFiltro} onChange={e => setCatFiltro(e.target.value)}
            className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white">
            {categorias.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto">
          {prodFiltrados.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              No hay productos disponibles
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {prodFiltrados.map(p => (
                <button key={p.IdInventario} onClick={() => agregarProducto(p)}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md hover:ring-2 hover:ring-purple-300 transition-all text-left group">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                    <Tag size={20} className="text-purple-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight mb-0.5 line-clamp-2">
                    {p.NombreProducto}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">{p.Codigo}</p>
                  <p className="text-purple-600 font-bold text-base">{fmt(Number(p.PrecioVenta))}</p>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.StockActual <= 3
                        ? 'bg-red-100 text-red-500'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      Stock: {p.StockActual}
                    </span>
                  </div>
                  {(p.NombreTalla || p.NombreColor) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {p.NombreTalla && `T: ${p.NombreTalla}`}
                      {p.NombreTalla && p.NombreColor && ' · '}
                      {p.NombreColor && `C: ${p.NombreColor}`}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Panel derecho: carrito ── */}
      <div className="w-96 bg-white shadow-lg flex flex-col border-l border-gray-100">

        {/* Header carrito */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <span className="font-bold text-base">Carrito de Compra</span>
            </div>
            {carrito.length > 0 && (
              <button onClick={limpiarCarrito} aria-label="Limpiar carrito"
                className="text-purple-200 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
          <p className="text-purple-200 text-xs mt-1">
            {carrito.length === 0
              ? '0 productos en el carrito'
              : `${carrito.reduce((a, l) => a + l.Cantidad, 0)} producto(s)`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Tipo de cliente */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Tipo de Cliente</p>
            <div className="flex gap-2">
              {(['simple', 'registrado', 'nuevo'] as TipoCliente[]).map(t => (
                <button key={t} onClick={() => { setTipoCliente(t); setClienteSel(null); setPromoSel(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    tipoCliente === t
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'text-gray-500 border-gray-200 hover:border-purple-300'
                  }`}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Cliente simple */}
          {tipoCliente === 'simple' && (
            <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-blue-600">
              <User size={15} />
              <span>Boleta simple sin datos del cliente</span>
            </div>
          )}

          {/* Cliente registrado */}
          {tipoCliente === 'registrado' && (
            <div>
              {clienteSel ? (
                <div className="bg-purple-50 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {clienteSel.Nombres} {clienteSel.Apellidos}
                      </p>
                      <p className="text-xs text-gray-400">DNI: {clienteSel.DNI}</p>
                    </div>
                    <button onClick={() => { setClienteSel(null); setPromoSel(null); }} aria-label="Cambiar cliente"
                      className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                  </div>
                  {promos.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-purple-100">
                      <p className="text-xs text-purple-600 font-medium mb-1">🎉 Promociones activas</p>
                      {promos.map(pr => (
                        <button key={pr.IdPromocion}
                          onClick={() => setPromoSel(promoSel?.IdPromocion === pr.IdPromocion ? null : pr)}
                          className={`w-full text-left text-xs px-3 py-1.5 rounded-lg mb-1 transition-colors ${
                            promoSel?.IdPromocion === pr.IdPromocion
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-purple-100'
                          }`}>
                          {pr.NombrePromocion} — {Number(pr.Descuento).toFixed(0)}% off
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Buscar cliente por nombre o DNI..."
                      value={busqCliente}
                      onChange={e => { setBusqCliente(e.target.value); setMostrarDrop(true); }}
                      onFocus={() => setMostrarDrop(true)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                  </div>
                  {mostrarDrop && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {!busqCliente && (
                        <p className="text-xs text-gray-400 px-4 pt-2">⭐ Clientes frecuentes</p>
                      )}
                      {clientesFiltrados.map(c => (
                        <button key={c.IdCliente}
                          onClick={() => { setClienteSel(c); setMostrarDrop(false); setBusqCliente(''); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-purple-50 text-left transition-colors border-b border-gray-50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{c.Nombres} {c.Apellidos}</p>
                            <p className="text-xs text-gray-400">DNI: {c.DNI}</p>
                          </div>
                          {c.TotalCompras ? (
                            <span className="text-xs text-purple-500">{c.TotalCompras} compras</span>
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
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="DNI *" value={nuevoForm.DNI}
                  onChange={e => setNuevoForm(f => ({ ...f, DNI: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                <input placeholder="Teléfono" value={nuevoForm.Telefono}
                  onChange={e => setNuevoForm(f => ({ ...f, Telefono: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <input placeholder="Nombres *" value={nuevoForm.Nombres}
                onChange={e => setNuevoForm(f => ({ ...f, Nombres: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
              <input placeholder="Apellidos" value={nuevoForm.Apellidos}
                onChange={e => setNuevoForm(f => ({ ...f, Apellidos: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          )}

          {/* Comprobante + forma de pago */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="comprobante" className="text-xs text-gray-400 mb-1 block">Comprobante</label>
              <select id="comprobante" value={comprobante} onChange={e => setComprobante(e.target.value as TipoComprobante)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                <option>Boleta</option>
                <option>Factura</option>
              </select>
            </div>
            <div>
              <label htmlFor="formaPago" className="text-xs text-gray-400 mb-1 block">Pago</label>
              <select id="formaPago" value={idFormaPago} onChange={e => setIdFormaPago(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                {formasPago.map(f => (
                  <option key={f.IdFormaPago} value={f.IdFormaPago}>{f.NombreFormaPago}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Líneas del carrito */}
          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-300">
              <ShoppingCart size={40} />
              <p className="text-sm mt-2">Selecciona productos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {carrito.map((l, i) => (
                <div key={l.IdInventario} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{l.NombreProducto}</p>
                      <p className="text-xs text-gray-400">
                        {l.NombreTalla && `T:${l.NombreTalla} `}
                        {l.NombreColor && `C:${l.NombreColor}`}
                      </p>
                    </div>
                    <button type="button" onClick={() => quitarLinea(i)} aria-label="Quitar línea" className="text-red-400 hover:text-red-600 shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => cambiarCantidad(i, -1)} aria-label="Disminuir cantidad"
                        className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-purple-100 flex items-center justify-center transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{l.Cantidad}</span>
                      <button type="button" onClick={() => cambiarCantidad(i, +1)} aria-label="Aumentar cantidad"
                        className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-purple-100 flex items-center justify-center transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {fmt(l.PrecioUnitario * l.Cantidad)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Descuento manual adicional */}
          {carrito.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="descManual" className="text-xs text-gray-400 shrink-0">Descuento adicional (%)</label>
              <input id="descManual"  type="number" min="0" max="100" value={descManual}
                onChange={e => setDescManual(e.target.value)}
                className="w-20 px-2 py-1.5 text-sm text-center border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
          )}
        </div>

        {/* Footer: totales + botón */}
        {carrito.length > 0 && (
          <div className="p-4 border-t border-gray-100 shrink-0 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>{fmt(subTotal)}</span>
            </div>
            {pctTotal > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Descuento ({pctTotal.toFixed(0)}%)</span>
                <span>- {fmt(montoDesc)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-800 text-lg border-t border-gray-100 pt-2">
              <span>Total</span>
              <span className="text-purple-600">{fmt(totalFinal)}</span>
            </div>

            {errorVenta && (
              <p className="text-xs text-red-500 text-center">{errorVenta}</p>
            )}

            <button type="button" onClick={registrarVenta} disabled={procesando}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm">
              {procesando ? 'Procesando...' : `Cobrar ${fmt(totalFinal)}`}
            </button>
          </div>
        )}
      </div>

      {/* ── Modal éxito ── */}
      {ventaOk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">¡Venta registrada!</h2>
            <p className="text-gray-500 text-sm mb-2">Comprobante: <strong>{ventaOk.boleta}</strong></p>
            <p className="text-3xl font-bold text-purple-600 mb-6">{fmt(ventaOk.total)}</p>

            <div className="flex gap-3 mb-3">
              <a href={urlBoleta(ventaOk.idVenta)} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">
                <FileText size={16} /> Ver PDF
              </a>
              <button type="button"
                onClick={() => enviarWhatsapp(ventaOk.telefono, ventaOk.boleta, ventaOk.idVenta)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium">
                <MessageCircle size={16} /> WhatsApp
              </button>
            </div>

            <button type="button" onClick={() => setVentaOk(null)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors">
              Nueva venta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}