import * as repo from '../repositories/dashboard.repository';

export const getDashboardData = async () => {
  const [
    ventasHoy,
    ingresosTotales,
    inventario,
    clientes,
    tendenciaSemanal,
    ventasCategoria,
    topProductos,
    metodosPago,
    alertasInventario,
  ] = await Promise.all([
    repo.getVentasHoy(),
    repo.getIngresosTotales(),
    repo.getResumenInventario(),
    repo.getTotalClientes(),
    repo.getTendenciaSemanal(),
    repo.getVentasPorCategoria(),
    repo.getTopProductos(),
    repo.getMetodosPago(),
    repo.getAlertasInventario(),
  ]);

  return {
    ventasHoy,
    ingresosTotales,
    inventario,
    clientes,
    tendenciaSemanal,
    ventasCategoria,
    topProductos,
    metodosPago,
    alertasInventario,
  };
};
