import * as repo from '../repositories/reportes.repository';
import ExcelJS from 'exceljs';

const hoy = () => new Date().toISOString().split('T')[0];
const hace30 = () => {
  const d = new Date(); d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
};

export const getDatos = async (tipo: string, desde?: string, hasta?: string) => {
  const d = desde || hace30();
  const h = hasta || hoy();
  switch (tipo) {
    case 'ventas':       return repo.getReporteVentas(d, h);
    case 'inventario':   return repo.getReporteInventario();
    case 'productos':    return repo.getReporteProductosVendidos(d, h);
    case 'clientes':     return repo.getReporteClientes(d, h);
    case 'formaspago':   return repo.getReporteFormasPago(d, h);
    case 'ganancias':    return repo.getReporteGanancias(d, h);
    case 'resumen':      return repo.getResumenGeneral(d, h);
    case 'anuladas':     return repo.getReporteAnuladas(d, h);
    case 'dia':          return repo.getReporteVentasDia(d);
    case 'vendedor':     return repo.getReporteVendedor(d, h);
    case 'turnos':       return repo.getReporteTurnos(d, h);
    default: throw new Error('Tipo de reporte no válido');
  }
};

const flattenData = (tipo: string, data: any): any[] => {
  if (tipo === 'resumen') return [data];
  if (tipo === 'dia')     return Array.isArray(data.ventas) ? data.ventas : [];
  if (tipo === 'turnos')  return Array.isArray(data.detalle) ? data.detalle : [];
  return Array.isArray(data) ? data : [data];
};

export const exportarExcel = async (tipo: string, desde?: string, hasta?: string) => {
  const rawData = await getDatos(tipo, desde, hasta);
  const data    = flattenData(tipo, rawData);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Reporte');

  if (!data || data.length === 0) {
    ws.addRow(['Sin datos para el período seleccionado']);
    return wb.xlsx.writeBuffer();
  }

  const cols = Object.keys(data[0]);

  // Título
  ws.mergeCells(1, 1, 1, cols.length);
  const titleRow = ws.getRow(1);
  titleRow.getCell(1).value = `TIENDA AYSEL – ${tipo.toUpperCase()}`;
  titleRow.getCell(1).font  = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
  titleRow.getCell(1).alignment = { horizontal: 'center' };

  // Período
  ws.mergeCells(2, 1, 2, cols.length);
  ws.getRow(2).getCell(1).value = `Período: ${desde || hace30()} al ${hasta || hoy()}`;
  ws.getRow(2).getCell(1).alignment = { horizontal: 'center' };

  ws.addRow([]);

  // Encabezado
  const header = ws.addRow(cols);
  header.eachCell(cell => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
    cell.font   = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.border = { bottom: { style: 'thin' } };
    cell.alignment = { horizontal: 'center' };
  });

  // Datos
  data.forEach((row, idx) => {
    const r = ws.addRow(cols.map(c => row[c]));
    if (idx % 2 === 0) {
      r.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F0FF' } };
      });
    }
  });

  ws.columns.forEach(col => { col.width = 22; });
  return wb.xlsx.writeBuffer();
};
