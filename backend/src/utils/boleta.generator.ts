import PDFDocument from 'pdfkit';

interface ItemBoleta {
  NombreProducto: string;
  NombreTalla?: string;
  NombreColor?: string;
  Cantidad: number;
  PrecioUnitario: string | number;
  SubTotal: string | number;
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
}

const TIENDA = {
  nombre:    'TIENDA AYSEL',
  ruc:       '12345678901',
  direccion: 'Jr. Ejemplo 123 - Cusco',
  whatsapp:  '999999999',
  yape:      '999999999',
};

const fmt = (v: string | number) =>
  `S/ ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

export const generarBoletaPDF = (datos: DatosBoleta): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: [226, 800], margin: 10 });
    const chunks: Buffer[] = [];

    doc.on('data',  chunk => chunks.push(chunk));
    doc.on('end',   ()    => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const ancho = 206;
    const cx    = ancho / 2 + 10;
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

    // Línea
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

    // Línea
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

    // Línea
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

    // Monto en letras (simple)
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

    // ── Cuentas bancarias ────────────────────────────────────────────────────
    doc.fontSize(7).font('Helvetica-Bold').text('CUENTAS BANCARIAS', 10, y);
    y += 11;
    doc.fontSize(7).font('Helvetica').text(`Yape: ${TIENDA.yape}`, 10, y);
    y += 11;
    y += 4;

    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 6;

    // ── Pie ──────────────────────────────────────────────────────────────────
    doc.fontSize(7).font('Helvetica')
       .text(`WhatsApp: ${TIENDA.whatsapp}`, 10, y, { width: ancho, align: 'center' });
    y += 11;

    doc.moveTo(10, y).lineTo(216, y).strokeColor('#cccccc').stroke();
    y += 6;

    doc.fontSize(6.5).font('Helvetica')
       .text(`${datos.Vendedor}`, 10, y)
       .text(new Date().toLocaleString('es-PE'), 130, y);

    // Ajustar tamaño al contenido
    doc.page.height = y + 20;
    doc.end();
  });
};