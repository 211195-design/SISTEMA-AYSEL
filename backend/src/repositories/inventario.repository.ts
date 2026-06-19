import pool from '../config/database';

export const getInventarioCompleto = async () => {
  const [rows]: any = await pool.query(`
    SELECT
      i.IdInventario,
      i.StockActual,
      p.IdProducto,
      p.Codigo,
      p.NombreProducto,
      p.PrecioVenta,
      p.StockMinimo,
      p.Estado,
      c.NombreCategoria,
      t.NombreTalla,
      col.NombreColor
    FROM inventario i
    INNER JOIN productos p   ON i.IdProducto = p.IdProducto
    INNER JOIN categorias c  ON p.IdCategoria = c.IdCategoria
    LEFT  JOIN tallas t      ON i.IdTalla = t.IdTalla
    LEFT  JOIN colores col   ON i.IdColor = col.IdColor
    ORDER BY p.NombreProducto ASC
  `);
  return rows;
};

export const getInventarioById = async (id: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      i.IdInventario,
      i.IdProducto,
      i.IdTalla,
      i.IdColor,
      i.StockActual,
      p.NombreProducto,
      p.StockMinimo
    FROM inventario i
    INNER JOIN productos p ON i.IdProducto = p.IdProducto
    WHERE i.IdInventario = ?
  `, [id]);
  return rows[0] ?? null;
};

export const updateStock = async (id: number, stockActual: number) => {
  const [result]: any = await pool.query(
    `UPDATE inventario SET StockActual = ? WHERE IdInventario = ?`,
    [stockActual, id]
  );
  return result.affectedRows > 0;
};

export const getProductosSinStock = async () => {
  const [rows]: any = await pool.query(`
    SELECT
      p.NombreProducto,
      p.StockMinimo,
      COALESCE(SUM(i.StockActual), 0) AS stockActual
    FROM productos p
    LEFT JOIN inventario i ON p.IdProducto = i.IdProducto
    WHERE p.Estado = 1
    GROUP BY p.IdProducto, p.NombreProducto, p.StockMinimo
    HAVING stockActual <= p.StockMinimo
    ORDER BY stockActual ASC
  `);
  return rows;
};