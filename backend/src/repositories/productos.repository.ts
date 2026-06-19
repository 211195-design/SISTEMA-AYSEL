import pool from '../config/database';

export const getAllProductos = async () => {
  const [rows]: any = await pool.query(`
    SELECT
      p.IdProducto, p.Codigo, p.NombreProducto, p.Descripcion,
      p.PrecioCompra, p.PrecioVenta, p.StockMinimo, p.Estado,
      c.IdCategoria, c.NombreCategoria
    FROM productos p
    INNER JOIN categorias c ON p.IdCategoria = c.IdCategoria
    ORDER BY p.NombreProducto ASC
  `);
  return rows;
};

export const getProductoById = async (id: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      p.IdProducto, p.Codigo, p.NombreProducto, p.Descripcion,
      p.PrecioCompra, p.PrecioVenta, p.StockMinimo, p.Estado,
      c.IdCategoria, c.NombreCategoria
    FROM productos p
    INNER JOIN categorias c ON p.IdCategoria = c.IdCategoria
    WHERE p.IdProducto = ?
  `, [id]);
  return rows[0] ?? null;
};

export const createProducto = async (data: {
  IdCategoria: number; Codigo: string; NombreProducto: string;
  Descripcion: string; PrecioCompra: number; PrecioVenta: number;
  StockMinimo: number;
}) => {
  const [result]: any = await pool.query(`
    INSERT INTO productos (IdCategoria, Codigo, NombreProducto, Descripcion, PrecioCompra, PrecioVenta, StockMinimo, Estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [data.IdCategoria, data.Codigo, data.NombreProducto, data.Descripcion,
      data.PrecioCompra, data.PrecioVenta, data.StockMinimo]);
  return result.insertId;
};

export const updateProducto = async (id: number, data: {
  IdCategoria: number; Codigo: string; NombreProducto: string;
  Descripcion: string; PrecioCompra: number; PrecioVenta: number;
  StockMinimo: number;
}) => {
  const [result]: any = await pool.query(`
    UPDATE productos
    SET IdCategoria=?, Codigo=?, NombreProducto=?, Descripcion=?,
        PrecioCompra=?, PrecioVenta=?, StockMinimo=?
    WHERE IdProducto=?
  `, [data.IdCategoria, data.Codigo, data.NombreProducto, data.Descripcion,
      data.PrecioCompra, data.PrecioVenta, data.StockMinimo, id]);
  return result.affectedRows > 0;
};

export const toggleEstado = async (id: number, estado: number) => {
  const [result]: any = await pool.query(
    `UPDATE productos SET Estado=? WHERE IdProducto=?`,
    [estado, id]
  );
  return result.affectedRows > 0;
};

export const getAllCategorias = async () => {
  const [rows]: any = await pool.query(
    `SELECT IdCategoria, NombreCategoria FROM categorias ORDER BY NombreCategoria ASC`
  );
  return rows;
};