import * as repo from '../repositories/reportes.repository';
import ExcelJS from 'exceljs';

const hoy = () => new Date().toISOString().split('T')[0];
const ayer = () => {
  const d = new Date(); d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
};

export const getDatos = async (tipo: string, desde?: string, hasta?: string) => {
  const d = desde || ayer();
  const h = hasta || hoy();
  switch (tipo) {
    case 'ventas':           return repo.getReporteVentas(d, h);
    case 'inventario':       return repo.getReporteInventario();
    case 'productos':        return repo.getReporteProductosVendidos(d, h);
    case 'clientes':         return repo.getReporteClientes(d, h);
    case 'formaspago':       return repo.getReporteFormasPago(d, h);
    case 'ganancias':        return repo.getReporteGanancias(d, h);
    case 'resumen':          return repo.getResumenGeneral(d, h);
    case 'anuladas':         return repo.getReporteAnuladas(d, h);
    default: throw new Error('Tipo de reporte no válido');
  }
};

export const exportarExcel = async (tipo: string, desde?: string, hasta?: string) => {
  const data: any[] = await getDatos(tipo, desde, hasta) as any[];
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Reporte');

  if (!data || (Array.isArray(data) && data.length === 0)) {
    ws.addRow(['Sin datos para el período seleccionado']);
    return wb.xlsx.writeBuffer();
  }

  const rows = Array.isArray(data) ? data : [data];
  const cols = Object.keys(rows[0]);

  // Encabezado con estilo
  ws.addRow(['TIENDA AYSEL — ' + tipo.toUpperCase()]);
  ws.addRow([`Período: ${desde || ayer()} al ${hasta || hoy()}`]);
  ws.addRow([]);

  const header = ws.addRow(cols);
  header.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
    cell.font   = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.border = { bottom: { style: 'thin' } };
  });

  rows.forEach(row => {
    ws.addRow(cols.map(c => row[c]));
  });

  ws.columns.forEach(col => { col.width = 20; });
  return wb.xlsx.writeBuffer();
};