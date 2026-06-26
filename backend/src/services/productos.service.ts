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
<<<<<<< HEAD
  const id = await repo.createProducto(data);
=======

  // Autoincremento de código
  const Codigo = data.Codigo?.trim() || await repo.getNextCodigo();

  const id = await repo.createProductoConInventario({
    ...data,
    Codigo,
    PrecioCompra:  Number(data.PrecioCompra  ?? 0),
    PrecioVenta:   Number(data.PrecioVenta),
    StockMinimo:   Number(data.StockMinimo   ?? 1),
    IdTalla:       data.IdTalla  ? Number(data.IdTalla)  : undefined,
    IdColor:       data.IdColor  ? Number(data.IdColor)  : undefined,
    StockInicial:  Number(data.StockInicial  ?? 0),
  });

>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
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

<<<<<<< HEAD
export const listarCategorias = async () => repo.getAllCategorias();
=======
export const listarCategorias = async () => repo.getAllCategorias();
export const listarTallas     = async () => repo.getTallas();
export const listarColores    = async () => repo.getColores();
export const siguienteCodigo  = async () => repo.getNextCodigo();
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
