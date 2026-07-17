import * as repo from '../repositories/inventario.repository';

export const listarInventario = async () => {
  return await repo.getInventarioCompleto();
};

export const obtenerItem = async (id: number) => {
  const item = await repo.getInventarioById(id);
  if (!item) throw new Error('Item de inventario no encontrado');
  return item;
};

export const actualizarStock = async (id: number, stockActual: number) => {
  if (stockActual < 0) throw new Error('El stock no puede ser negativo');
  const actualizado = await repo.updateStock(id, stockActual);
  if (!actualizado) throw new Error('No se pudo actualizar el stock');
  return await repo.getInventarioById(id);
};

export const obtenerAlertas = async () => {
  return await repo.getProductosSinStock();
};

export const actualizarInventarioCompleto = async (id: number, data: {
  stockActual: number; stockMinimo: number; precioVenta: number;
  idTalla: number | null; idColor: number | null;
}) => {
  return await repo.updateInventarioCompleto(id, data);
};
