import pool from '../config/database';

export const getAllVentas = async (desde?: string, hasta?: string) => {
  let where = '';
  const params: any[] = [];
  if (desde && hasta) {
    where = 'WHERE DATE(v.FechaVenta) BETWEEN ? AND ?';
    params.push(desde, hasta);
  }
  const [rows]: any = await pool.query(`
    SELECT
      v.IdVenta, v.NumeroBoleta, v.FechaVenta,
      v.SubTotal, v.Descuento, v.Total, v.Estado,
      CONCAT(c.Nombres, ' ', c.Apellidos) AS Cliente,
      c.DNI,
      f.NombreFormaPago,
      CONCAT(u.Nombres, ' ', u.Apellidos) AS Vendedor
    FROM ventas v
    INNER JOIN clientes   c ON v.IdCliente   = c.IdCliente
    INNER JOIN formaspago f ON v.IdFormaPago  = f.IdFormaPago
    INNER JOIN usuarios   u ON v.IdUsuario    = u.IdUsuario
    ${where}
    ORDER BY v.FechaVenta DESC
  `, params);
  return rows;
};

export const getVentaById = async (id: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      v.IdVenta, v.NumeroBoleta, v.FechaVenta,
      v.SubTotal, v.Descuento, v.Total, v.Estado,
      CONCAT(c.Nombres, ' ', c.Apellidos) AS Cliente,
      c.DNI, c.Telefono,
      f.NombreFormaPago,
      CONCAT(u.Nombres, ' ', u.Apellidos) AS Vendedor
    FROM ventas v
    INNER JOIN clientes   c ON v.IdCliente   = c.IdCliente
    INNER JOIN formaspago f ON v.IdFormaPago  = f.IdFormaPago
    INNER JOIN usuarios   u ON v.IdUsuario    = u.IdUsuario
    WHERE v.IdVenta = ?
  `, [id]);
  return rows[0] ?? null;
};

export const getDetalleVenta = async (idVenta: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      dv.IdDetalleVenta, dv.Cantidad, dv.PrecioUnitario,
      dv.Descuento, dv.SubTotal,
      p.NombreProducto, p.Codigo,
      t.NombreTalla, col.NombreColor
    FROM detalleventa dv
    INNER JOIN inventario i ON dv.IdInventario = i.IdInventario
    INNER JOIN productos  p ON i.IdProducto    = p.IdProducto
    LEFT  JOIN tallas     t ON i.IdTalla       = t.IdTalla
    LEFT  JOIN colores  col ON i.IdColor       = col.IdColor
    WHERE dv.IdVenta = ?
  `, [idVenta]);
  return rows;
};

export const getNextNumeroBoleta = async () => {
  const [rows]: any = await pool.query(
    `SELECT NumeroBoleta FROM ventas ORDER BY IdVenta DESC LIMIT 1`
  );
  if (rows.length === 0) return 'B001';
  const last = rows[0].NumeroBoleta ?? 'B000';
  const num = parseInt(last.replace(/\D/g, '')) + 1;
  return `B${String(num).padStart(3, '0')}`;
};

export const createVenta = async (data: {
  NumeroBoleta: string; IdCliente: number; IdUsuario: number;
  IdFormaPago: number; SubTotal: number; Descuento: number; Total: number;
}) => {
  const [result]: any = await pool.query(`
    INSERT INTO ventas (NumeroBoleta, IdCliente, IdUsuario, IdFormaPago, FechaVenta, SubTotal, Descuento, Total, Estado)
    VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, 'Completado')
  `, [data.NumeroBoleta, data.IdCliente, data.IdUsuario, data.IdFormaPago,
      data.SubTotal, data.Descuento, data.Total]);
  return result.insertId;
};

export const createDetalleVenta = async (items: {
  IdVenta: number; IdInventario: number; Cantidad: number;
  PrecioUnitario: number; Descuento: number; SubTotal: number;
}[]) => {
  for (const item of items) {
    await pool.query(`
      INSERT INTO detalleventa (IdVenta, IdInventario, Cantidad, PrecioUnitario, Descuento, SubTotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [item.IdVenta, item.IdInventario, item.Cantidad,
        item.PrecioUnitario, item.Descuento, item.SubTotal]);

    await pool.query(`
      UPDATE inventario SET StockActual = StockActual - ?
      WHERE IdInventario = ?
    `, [item.Cantidad, item.IdInventario]);
  }
};

export const anularVenta = async (id: number) => {
  // Restaurar stock
  const [detalle]: any = await pool.query(
    `SELECT IdInventario, Cantidad FROM detalleventa WHERE IdVenta = ?`, [id]
  );
  for (const item of detalle) {
    await pool.query(
      `UPDATE inventario SET StockActual = StockActual + ? WHERE IdInventario = ?`,
      [item.Cantidad, item.IdInventario]
    );
  }
  await pool.query(
    `UPDATE ventas SET Estado = 'Anulado' WHERE IdVenta = ?`, [id]
  );
};

export const getFormaspago = async () => {
  const [rows]: any = await pool.query(`SELECT * FROM formaspago ORDER BY NombreFormaPago`);
  return rows;
};

export const getClientesActivos = async () => {
  const [rows]: any = await pool.query(`
    SELECT IdCliente, DNI, Nombres, Apellidos, Telefono
    FROM clientes WHERE Estado = 1 ORDER BY Nombres ASC
  `);
  return rows;
};