import * as repo from '../repositories/ventas.repository';

export const listarVentas = async (desde?: string, hasta?: string) =>
  repo.getAllVentas(desde, hasta);

export const obtenerVenta = async (id: number) => {
  const venta = await repo.getVentaById(id);
  if (!venta) throw new Error('Venta no encontrada');
  const detalle = await repo.getDetalleVenta(id);
  return { ...venta, detalle };
};

export const registrarVenta = async (body: any, idUsuario: number) => {
  const { IdCliente, IdFormaPago, items, Descuento = 0,
          TipoCliente, ClienteNuevo, TipoComprobante = 'BOLETA' } = body;

  if (!IdFormaPago || !items?.length)
    throw new Error('Forma de pago e items son requeridos');

  let idClienteFinal = IdCliente;

  if (TipoCliente === 'simple') {
    idClienteFinal = await repo.getOrCreateClienteSimple();
  } else if (TipoCliente === 'nuevo' && ClienteNuevo) {
    idClienteFinal = await repo.createClienteRapido(ClienteNuevo);
  } else if (!IdCliente) {
    throw new Error('Cliente requerido');
  }

  const SubTotal = items.reduce((acc: number, i: any) =>
    acc + i.PrecioUnitario * i.Cantidad, 0);
  const Total = SubTotal - Number(Descuento);
  const NumeroBoleta = await repo.getNextNumeroBoleta();

  const IdVenta = await repo.createVenta({
    NumeroBoleta, IdCliente: idClienteFinal, IdUsuario: idUsuario,
    IdFormaPago, SubTotal, Descuento: Number(Descuento), Total,
  });

  await repo.createDetalleVenta(items.map((i: any) => ({
    IdVenta,
    IdInventario:   i.IdInventario,
    Cantidad:       i.Cantidad,
    PrecioUnitario: i.PrecioUnitario,
    Descuento:      0,
    SubTotal:       i.PrecioUnitario * i.Cantidad,
  })));

  return repo.getVentaById(IdVenta);
};

export const anularVenta = async (id: number) => {
  const venta = await repo.getVentaById(id);
  if (!venta) throw new Error('Venta no encontrada');
  if (venta.Estado === 'Anulado') throw new Error('La venta ya está anulada');
  await repo.anularVenta(id);
};

export const getDashboard = async (idUsuario: number) =>
  repo.getDashboard(idUsuario);

export const getReporteTurno = async (idUsuario: number, fecha: string) =>
  repo.getReporteTurno(idUsuario, fecha);

export const getReporteGeneral = async (desde: string, hasta: string) =>
  repo.getReporteGeneral(desde, hasta);

export const listarFormaspago = async () => repo.getFormaspago();
export const listarClientes   = async () => repo.getClientesActivos();