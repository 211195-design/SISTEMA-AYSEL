'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Eye, X, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

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
interface CuentaPago {
  IdCuenta: number; TipoCuenta: string; Titular: string;
  NumeroCuenta: string; CCI?: string; Estado: number;
}

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

const fechaLocal = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Convertir número a letras (para "SON X Y 00/100 SOLES") ─────────────────
const unidades = ['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE'];
const decenas  = ['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
const especiales: Record<number,string> = {11:'ONCE',12:'DOCE',13:'TRECE',14:'CATORCE',15:'QUINCE',16:'DIECISÉIS',17:'DIECISIETE',18:'DIECIOCHO',19:'DIECINUEVE'};

function centenas(n: number): string {
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const prefijos = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  return (c > 0 ? prefijos[c] + (resto > 0 ? ' ' : '') : '') + decenasLetras(resto);
}
function decenasLetras(n: number): string {
  if (n === 0) return '';
  if (n < 10) return unidades[n];
  if (especiales[n]) return especiales[n];
  const d = Math.floor(n / 10), u = n % 10;
  return decenas[d] + (u > 0 ? ' Y ' + unidades[u] : '');
}
function numeroALetras(total: number): string {
  const entero = Math.floor(total);
  const cents  = Math.round((total - entero) * 100);
  let letras = '';
  if (entero === 0) letras = 'CERO';
  else if (entero < 1000) letras = centenas(entero);
  else {
    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;
    letras = (miles === 1 ? 'MIL' : centenas(miles) + ' MIL') + (resto > 0 ? ' ' + centenas(resto) : '');
  }
  return `SON ${letras} Y ${String(cents).padStart(2,'0')}/100 SOLES`;
}

// ─── WhatsApp / QR helpers ─────────────────────────────────────────────────────
const waLink = (numero: string) => {
  const digitos = numero.replace(/\D/g, '');
  const conCodigo = digitos.startsWith('51') ? digitos : `51${digitos}`;
  return `https://wa.me/${conCodigo}`;
};

// Descarga la imagen del QR y la convierte a base64 (jsPDF no acepta URLs directas)
function cargarImagenComoBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ─── Generar PDF ──────────────────────────────────────────────────────────────
async function generarBoletaPDF(detalle: VentaDetalle, cuentas: CuentaPago[]) {
  // Separar cuenta WhatsApp del resto
  const cuentaWhatsapp = cuentas.find(c => c.TipoCuenta === 'WhatsApp');
  const cuentasPago    = cuentas.filter(c => c.TipoCuenta !== 'WhatsApp');
  const numeroWhatsapp = cuentaWhatsapp?.NumeroCuenta ?? '999999999';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(waLink(numeroWhatsapp))}`;
  const qrBase64 = await cargarImagenComoBase64(qrUrl);

  const anchoTicket   = 80;
  const alturaCuentas = cuentasPago.length > 0 ? cuentasPago.length * 9 + 10 : 10;
  const alturaQR      = qrBase64 ? 42 : 10;
  const altoTicket    = 170 + (detalle.detalle.length * 14) + alturaCuentas + alturaQR;

  const doc  = new jsPDF({ unit: 'mm', format: [anchoTicket, altoTicket] });
  const W    = anchoTicket;
  const marL = 5;
  const marR = W - 5;
  let   y    = 8;

  const lineaH = () => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(marL, y, marR, y);
    y += 5;
  };

  // ── 1. ENCABEZADO ─────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(80, 0, 120);
  doc.text('TIENDA AYSEL', W / 2, y, { align: 'center' }); y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 0, 120);
  doc.text('RUC 12345678901', W / 2, y, { align: 'center' }); y += 4;
  doc.text('Jr. Ejemplo 123 - Cusco', W / 2, y, { align: 'center' }); y += 6;

  lineaH();

  // ── 2. TÍTULO ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('BOLETA ELECTRÓNICA', W / 2, y, { align: 'center' }); y += 6;

  doc.setFontSize(10);
  doc.text(detalle.NumeroBoleta, W / 2, y, { align: 'center' }); y += 8;

  lineaH();

  // ── 3. DATOS CLIENTE ──────────────────────────────────────────────────────
  const fechaEmision = new Date(detalle.FechaVenta).toLocaleDateString('es-PE');
  const colVal = marL + 24;

  const fila = (label: string, valor: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text(label, marL, y);
    doc.setFont('helvetica', 'normal');
    doc.text(valor, colVal, y);
    y += 5;
  };

  fila('DOCUMENTO :', `DNI ${detalle.DNI}`);
  fila('CLIENTE   :', detalle.Cliente);
  fila('F. EMISIÓN:', fechaEmision);
  fila('MONEDA    :', 'SOLES');

  y += 1;
  lineaH();

  // ── 4. CABECERA TABLA ─────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('DESCRIPCIÓN', marL, y);
  doc.text('P/U',         52,   y);
  doc.text('TOTAL',       marR, y, { align: 'right' });
  y += 4;
  lineaH();

  // ── 5. PRODUCTOS ──────────────────────────────────────────────────────────
  detalle.detalle.forEach(d => {
    const talla = d.NombreTalla || 'S/C';
    const color = d.NombreColor || 'S/C';
    const desc  = `${d.NombreProducto} (T: ${talla}, C: ${color}) x${d.Cantidad}`;
    const pu    = `S/ ${Number(d.PrecioUnitario).toFixed(2)}`;
    const sub   = `S/ ${Number(d.SubTotal).toFixed(2)}`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);

    const lineas = doc.splitTextToSize(desc, 44);
    doc.text(lineas, marL, y);
    doc.text(pu,  52,   y);
    doc.text(sub, marR, y, { align: 'right' });
    y += (lineas.length * 4.5) + 3;
  });

  y += 1;
  lineaH();

  // ── 6. TOTALES ────────────────────────────────────────────────────────────
  const colLabel = 44;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('SUBTOTAL', colLabel, y);
  doc.text(`S/ ${Number(detalle.SubTotal).toFixed(2)}`, marR, y, { align: 'right' });
  y += 6;

  if (Number(detalle.Descuento) > 0) {
    doc.text('DESCUENTO', colLabel, y);
    doc.text(`- S/ ${Number(detalle.Descuento).toFixed(2)}`, marR, y, { align: 'right' });
    y += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL', colLabel, y);
  doc.text(`S/ ${Number(detalle.Total).toFixed(2)}`, marR, y, { align: 'right' });
  y += 8;

  // ── 7. MONTO EN LETRAS ────────────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 0, 120);
  const letras = doc.splitTextToSize(
    numeroALetras(Number(detalle.Total)), marR - marL
  );
  doc.text(letras, marL, y);
  y += (letras.length * 4.5) + 5;
  lineaH();

  // ── 8. CONDICIÓN DE PAGO ──────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('CONDICIÓN DE PAGO', marL, y); y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 0, 120);
  doc.text(detalle.NombreFormaPago, marL, y); y += 8;

  // ── 9. CUENTAS DE PAGO (Yape, Plin, bancos — sin WhatsApp) ────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('CUENTAS DE PAGO', marL, y); y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 0, 120);

  if (cuentasPago.length === 0) {
    doc.text('Sin cuentas registradas', marL, y); y += 4.5;
  } else {
    cuentasPago.forEach(cta => {
      doc.text(`${cta.TipoCuenta}: ${cta.Titular} — ${cta.NumeroCuenta}`, marL, y);
      y += 4.5;
      if (cta.CCI) {
        doc.setFontSize(6.5);
        doc.text(`   CCI: ${cta.CCI}`, marL, y);
        doc.setFontSize(7.5);
        y += 4.5;
      }
    });
  }
  y += 4;
  lineaH();

  // ── 10. WHATSAPP CON QR ───────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('ESCRÍBENOS POR WHATSAPP', W / 2, y, { align: 'center' }); y += 6;

  if (qrBase64) {
    const qrSize = 30;
    const qrX = (W - qrSize) / 2;
    doc.addImage(qrBase64, 'PNG', qrX, y, qrSize, qrSize);
    y += qrSize + 4;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 0, 120);
  doc.text(`WhatsApp: ${numeroWhatsapp}`, W / 2, y, { align: 'center' }); y += 9;

  lineaH();

  // ── 11. PIE ───────────────────────────────────────────────────────────────
  const fechaHora = new Date(detalle.FechaVenta).toLocaleString('es-PE');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text(detalle.Vendedor, marL, y); y += 4.5;
  doc.text(fechaHora, marL, y);

  window.open(URL.createObjectURL(doc.output('blob')), '_blank');
}


// ─── Componente principal ─────────────────────────────────────────────────────
export default function ComprobantesPage() {
  const [ventas, setVentas]     = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [detalle, setDetalle]   = useState<VentaDetalle | null>(null);
  const [busq, setBusq]         = useState('');
  const [cuentas, setCuentas]   = useState<CuentaPago[]>([]);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    apiFetch<{ ok: boolean; data: Venta[] }>('/ventas')
      .then(r => setVentas(r.data))
      .finally(() => setCargando(false));

    apiFetch<{ ok: boolean; data: CuentaPago[] }>('/cuentas/activas')
      .then(r => setCuentas(r.data))
      .catch(() => setCuentas([]));
  }, []);

  const abrirDetalle = async (id: number) => {
    const r = await apiFetch<{ ok: boolean; data: VentaDetalle }>(`/ventas/${id}`);
    setDetalle(r.data);
  };

  const handleImprimir = async () => {
    if (!detalle) return;
    setGenerando(true);
    try {
      await generarBoletaPDF(detalle, cuentas);
    } finally {
      setGenerando(false);
    }
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
          className="w-full pl-4 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
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
                      v.Estado === 'Completado'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-500'
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

      {/* ── Modal detalle ── */}
      {detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800">{detalle.NumeroBoleta}</h2>
                <p className="text-xs text-gray-400">{fechaLocal(detalle.FechaVenta)}</p>
              </div>
              <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">Cliente</p><p className="font-medium">{detalle.Cliente}</p></div>
                <div><p className="text-xs text-gray-400">DNI</p><p className="font-medium">{detalle.DNI}</p></div>
                <div><p className="text-xs text-gray-400">Forma de pago</p><p className="font-medium">{detalle.NombreFormaPago}</p></div>
                <div><p className="text-xs text-gray-400">Vendedor</p><p className="font-medium">{detalle.Vendedor}</p></div>
              </div>

              <div className="space-y-2">
                {detalle.detalle.map(d => (
                  <div key={d.IdDetalleVenta}
                    className="flex justify-between text-sm bg-gray-50 rounded-xl px-4 py-2">
                    <div>
                      <p className="font-medium text-gray-800">{d.NombreProducto}</p>
                      <p className="text-xs text-gray-400">
                        {d.NombreTalla} · {d.NombreColor} · x{d.Cantidad}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">{fmt(d.SubTotal)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>{fmt(detalle.SubTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Descuento</span><span>- {fmt(detalle.Descuento)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base">
                  <span>Total</span><span>{fmt(detalle.Total)}</span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setDetalle(null)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  Cerrar
                </button>
                <button onClick={handleImprimir} disabled={generando}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm
                             bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium disabled:opacity-50">
                  <Printer size={15} /> {generando ? 'Generando...' : 'Imprimir boleta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}