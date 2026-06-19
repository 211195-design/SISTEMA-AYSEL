import * as repo from '../repositories/productos.repository';

export const listarProductos = async () => repo.getAllProductos();

export const obtenerProducto = async (id: number) => {
  const p = await repo.getProductoById(id);
  if (!p) throw new Error('Producto no encontrado');
  return p;
};

export const crearProducto = async (data: any) => {
  if (!data.NombreProducto || !data.PrecioVenta || !data.IdCategoria)
    throw new Error('NombreProducto, PrecioVenta e IdCategoria son requeridos');
  const id = await repo.createProducto(data);
  return repo.getProductoById(id);
};

export const editarProducto = async (id: number, data: any) => {
  if (!data.NombreProducto || !data.PrecioVenta || !data.IdCategoria)
    throw new Error('NombreProducto, PrecioVenta e IdCategoria son requeridos');
  await repo.updateProducto(id, data);
  return repo.getProductoById(id);
};

export const cambiarEstado = async (id: number, estado: number) => {
  await repo.toggleEstado(id, estado);
  return repo.getProductoById(id);
};

export const listarCategorias = async () => repo.getAllCategorias();