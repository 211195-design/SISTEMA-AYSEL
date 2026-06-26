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
<<<<<<< HEAD
=======
};

export const getNextCodigo = async () => {
  const [rows]: any = await pool.query(
    `SELECT Codigo FROM productos WHERE Codigo IS NOT NULL ORDER BY IdProducto DESC LIMIT 1`
  );
  if (rows.length === 0) return 'P001';
  const last = rows[0].Codigo ?? 'P000';
  const num  = parseInt(last.replace(/[^0-9]/g, ''), 10);
  if (isNaN(num)) return 'P001';
  return `P${String(num + 1).padStart(3, '0')}`;
};

export const createProductoConInventario = async (data: {
  IdCategoria: number; Codigo: string; NombreProducto: string;
  Descripcion: string; PrecioCompra: number; PrecioVenta: number;
  StockMinimo: number; IdTalla?: number; IdColor?: number; StockInicial: number;
}) => {
  const [result]: any = await pool.query(`
    INSERT INTO productos (IdCategoria, Codigo, NombreProducto, Descripcion, PrecioCompra, PrecioVenta, StockMinimo, Estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [data.IdCategoria, data.Codigo, data.NombreProducto, data.Descripcion,
      data.PrecioCompra, data.PrecioVenta, data.StockMinimo]);

  const IdProducto = result.insertId;

  await pool.query(`
    INSERT INTO inventario (IdProducto, IdTalla, IdColor, StockActual)
    VALUES (?, ?, ?, ?)
  `, [IdProducto, data.IdTalla ?? null, data.IdColor ?? null, data.StockInicial]);

  return IdProducto;
};

export const getTallas = async () => {
  const [rows]: any = await pool.query(
    `SELECT IdTalla, NombreTalla FROM tallas ORDER BY NombreTalla ASC`
  );
  return rows;
};

export const getColores = async () => {
  const [rows]: any = await pool.query(
    `SELECT IdColor, NombreColor FROM colores ORDER BY NombreColor ASC`
  );
  return rows;
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
};