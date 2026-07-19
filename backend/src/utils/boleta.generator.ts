import PDFDocument from 'pdfkit';

interface ItemBoleta {
  NombreProducto: string;
  NombreTalla?: string;
  NombreColor?: string;
  Cantidad: number;
  PrecioUnitario: string | number;
  SubTotal: string | number;
}

interface CuentaPago {
  TipoCuenta: string;
  Titular: string;
  NumeroCuenta: string;
  CCI?: string;
}

interface DatosBoleta {
  NumeroBoleta: string;
  TipoComprobante: 'BOLETA' | 'FACTURA';
  FechaVenta: string;
  Cliente: string;
  DNI?: string;
  RUC?: string;
  Telefono?: string;
  NombreFormaPago: string;
  Vendedor: string;
  SubTotal: string | number;
  Descuento: string | number;
  Total: string | number;
  detalle: ItemBoleta[];
  cuentas?: CuentaPago[];
}

const TIENDA = {
  nombre:    'TIENDA AYSEL',
  ruc:       '12345678901',
  direccion: 'Jr. Ejemplo 123 - Cusco',
  whatsapp:  '999999999',
};

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

// Arma el link wa.me con código de país Perú
const waLink = (numero: string) => {
  const digitos = numero.replace(/\D/g, '');
  const conCodigo = digitos.startsWith('51') ? digitos : `51${digitos}`;
  return `https://wa.me/${conCodigo}`;
};

// Descarga el QR como buffer PNG (necesario porque PDFKit no acepta URLs directas)
const descargarQR = async (data: string): Promise<Buffer | null> => {
  try {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
};

export const generarBoletaPDF = async (datos: DatosBoleta): Promise<Buffer> => {
  // Separar cuenta WhatsApp del resto de cuentas de pago
  const cuentaWhatsapp = datos.cuentas?.find(c => c.TipoCuenta === 'WhatsApp');
  const cuentasPago    = (datos.cuentas ?? []).filter(c => c.TipoCuenta !== 'WhatsApp');

  const numeroWhatsapp = cuentaWhatsapp?.NumeroCuenta ?? TIENDA.whatsapp;
  const qrBuffer = await descargarQR(waLink(numeroWhatsapp));

  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: [226, 900], margin: 10 });
    const chunks: Buffer[] = [];

    doc.on('data',  chunk => chunks.push(chunk));
    doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const ancho = 206;
    let   y     = 10;

    // ── Encabezado ──────────────────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica-Bold')
       .text(TIENDA.nombre, 10, y, { width: ancho, align: 'center' });
    y += 16;

    doc.fontSize(7).font('Helvetica')
       .text(`RUC ${TIENDA.ruc}`, 10, y, { width: ancho, align: 'center' });
    y += 11;

    doc.text(TIENDA.direccion, 10, y, { width: ancho, align: 'center' });
    y += 14;

    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 6;

    // Tipo comprobante
    doc.fontSize(9).font('Helvetica-Bold')
       .text(datos.TipoComprobante === 'BOLETA' ? 'BOLETA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA',
             10, y, { width: ancho, align: 'center' });
    y += 13;

    doc.fontSize(8).font('Helvetica-Bold')
       .text(datos.NumeroBoleta, 10, y, { width: ancho, align: 'center' });
    y += 14;

    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 6;

    // ── Datos cliente ────────────────────────────────────────────────────────
    const fila = (label: string, valor: string) => {
      doc.fontSize(7).font('Helvetica-Bold').text(label, 10, y, { continued: true });
      doc.font('Helvetica').text(`  ${valor}`);
      y += 11;
    };

    if (datos.TipoComprobante === 'FACTURA' && datos.RUC) {
      fila('RUC       :', datos.RUC);
    } else {
      fila('DOCUMENTO :', datos.DNI ? `DNI ${datos.DNI}` : '—');
    }
    fila('CLIENTE   :', datos.Cliente);
    fila('F. EMISIÓN:', new Date(datos.FechaVenta).toLocaleDateString('es-PE'));
    fila('MONEDA    :', 'SOLES');
    y += 2;

    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 6;

    // ── Encabezado tabla ─────────────────────────────────────────────────────
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('DESCRIPCIÓN', 10, y);
    doc.text('P/U',  148, y);
    doc.text('TOTAL', 178, y);
    y += 10;

    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 5;

    // ── Items ────────────────────────────────────────────────────────────────
    doc.fontSize(7).font('Helvetica');
    for (const item of datos.detalle) {
      let desc = item.NombreProducto;
      const extras: string[] = [];
      if (item.NombreTalla) extras.push(`T: ${item.NombreTalla}`);
      if (item.NombreColor) extras.push(`C: ${item.NombreColor}`);
      if (extras.length)    desc += ` (${extras.join(', ')})`;
      desc += ` x${item.Cantidad}`;

      const descLines = doc.heightOfString(desc, { width: 130 }) / 12;
      const rowH      = Math.max(20, descLines * 12 + 6);

      doc.text(desc,                   10, y, { width: 130 });
      doc.text(fmt(item.PrecioUnitario), 138, y, { width: 38, align: 'right' });
      doc.text(fmt(item.SubTotal),       178, y, { width: 38, align: 'right' });
      y += rowH;
    }

    y += 2;
    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 6;

    // ── Totales ──────────────────────────────────────────────────────────────
    const filaTot = (label: string, valor: string, bold = false) => {
      doc.fontSize(7).font(bold ? 'Helvetica-Bold' : 'Helvetica');
      doc.text(label, 10, y, { width: 160, align: 'right' });
      doc.text(valor, 170, y, { width: 46,  align: 'right' });
      y += 11;
    };

    filaTot('SUBTOTAL', fmt(datos.SubTotal));
    if (Number(datos.Descuento) > 0) {
      filaTot('DESCUENTO', `- ${fmt(datos.Descuento)}`);
    }
    filaTot('TOTAL', fmt(datos.Total), true);
    y += 2;

    const totalNum = Number(datos.Total);
    const entero   = Math.floor(totalNum);
    const cents    = Math.round((totalNum - entero) * 100);
    const letras   = `SON ${entero} Y ${String(cents).padStart(2, '0')}/100 SOLES`;
    doc.fontSize(6.5).font('Helvetica-Bold')
       .text(letras, 10, y, { width: ancho, align: 'center' });
    y += 14;

    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 6;

    // ── Condición de pago ────────────────────────────────────────────────────
    fila('CONDICIÓN DE PAGO', datos.NombreFormaPago);
    y += 2;

    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 6;

    // ── Cuentas de pago (Yape, Plin, bancos — sin WhatsApp) ─────────────────
    if (cuentasPago.length > 0) {
      doc.fontSize(7).font('Helvetica-Bold').text('CUENTAS DE PAGO', 10, y);
      y += 11;

      for (const cta of cuentasPago) {
        doc.fontSize(7).font('Helvetica-Bold')
           .text(`${cta.TipoCuenta}: `, 10, y, { continued: true });
        doc.font('Helvetica').text(`${cta.Titular} — ${cta.NumeroCuenta}`);
        y += 10;

        if (cta.CCI) {
          doc.fontSize(6.5).font('Helvetica').fillColor('#666666')
             .text(`   CCI: ${cta.CCI}`, 10, y);
          doc.fillColor('#000000');
          y += 9;
        }
      }
      y += 4;

      doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
      y += 6;
    }

    // ── WhatsApp con QR ───────────────────────────────────────────────────────
    doc.fontSize(7).font('Helvetica-Bold')
       .text('ESCRÍBENOS POR WHATSAPP', 10, y, { width: ancho, align: 'center' });
    y += 12;

    if (qrBuffer) {
      const qrSize = 90;
      const qrX = 10 + (ancho - qrSize) / 2;
      doc.image(qrBuffer, qrX, y, { width: qrSize, height: qrSize });
      y += qrSize + 6;
    }

    doc.fontSize(7).font('Helvetica')
       .text(`WhatsApp: ${numeroWhatsapp}`, 10, y, { width: ancho, align: 'center' });
    y += 11;

    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 6;

    doc.fontSize(6.5).font('Helvetica')
       .text(`${datos.Vendedor}`, 10, y)
       .text(new Date().toLocaleString('es-PE'), 130, y);

    doc.page.height = y + 20;
    doc.end();
  });
};