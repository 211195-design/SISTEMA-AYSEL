import * as repo from '../repositories/ventas.repository';
import * as inventarioRepo from '../repositories/inventario.repository';

export const listarVentas = async (desde?: string, hasta?: string) =>
  repo.getAllVentas(desde, hasta);

export const obtenerVenta = async (id: number) => {
  const venta = await repo.getVentaById(id);

  if (!venta) throw new Error('Venta no encontrada');

  const detalle = await repo.getDetalleVenta(id);

  return {
    ...venta,
    detalle
  };
};

export const registrarVenta = async (
  body: any,
  idUsuario: number
) => {

  const {
    IdCliente,
    IdFormaPago,
    items,
    Descuento = 0
  } = body;

  if (!IdCliente || !IdFormaPago || !items?.length) {
    throw new Error(
      'Cliente, forma de pago e items son requeridos'
    );
  }

  // VALIDAR STOCK
  for (const item of items) {

    const inventario =
      await inventarioRepo.getInventarioById(
        item.IdInventario
      );

    if (!inventario) {
      throw new Error(
        `Inventario ${item.IdInventario} no encontrado`
      );
    }

    if (item.Cantidad <= 0) {
      throw new Error(
        'La cantidad debe ser mayor que cero'
      );
    }

    if (inventario.StockActual < item.Cantidad) {
      throw new Error(
        `Stock insuficiente para ${inventario.NombreProducto}`
      );
    }
  }

  const SubTotal = items.reduce(
    (acc: number, item: any) =>
      acc + item.PrecioUnitario * item.Cantidad,
    0
  );

  const Total = SubTotal - Descuento;

  const NumeroBoleta =
    await repo.getNextNumeroBoleta();

  const IdVenta = await repo.createVenta({
    NumeroBoleta,
    IdCliente,
    IdUsuario: idUsuario,
    IdFormaPago,
    SubTotal,
    Descuento,
    Total
  });

  await repo.createDetalleVenta(
    items.map((item: any) => ({
      IdVenta,
      IdInventario: item.IdInventario,
      Cantidad: item.Cantidad,
      PrecioUnitario: item.PrecioUnitario,
      Descuento: 0,
      SubTotal:
        item.PrecioUnitario * item.Cantidad
    }))
  );

  // DESCONTAR STOCK
  for (const item of items) {

    const inventario =
      await inventarioRepo.getInventarioById(
        item.IdInventario
      );

    const nuevoStock =
      inventario.StockActual - item.Cantidad;

    await inventarioRepo.updateStock(
      item.IdInventario,
      nuevoStock
    );
  }

  return await repo.getVentaById(IdVenta);
};

export const anularVenta = async (id: number) => {

  const venta = await repo.getVentaById(id);

  if (!venta) {
    throw new Error('Venta no encontrada');
  }

  if (venta.Estado === 'Anulado') {
    throw new Error(
      'La venta ya está anulada'
    );
  }

  await repo.anularVenta(id);
};

export const listarFormaspago = async () =>
  repo.getFormaspago();

export const listarClientes = async () =>
  repo.getClientesActivos();