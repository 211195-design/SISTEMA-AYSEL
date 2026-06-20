import pool from '../config/database';

export const getAllClientes = async () => {
  const [rows]: any = await pool.query(`
    SELECT
      c.IdCliente, c.DNI, c.Nombres, c.Apellidos,
      c.Telefono, c.Direccion, c.FechaRegistro, c.Estado,
      COUNT(v.IdVenta) AS TotalCompras,
      COALESCE(SUM(v.Total), 0) AS TotalGastado
    FROM clientes c
    LEFT JOIN ventas v ON c.IdCliente = v.IdCliente AND v.Estado = 'Completado'
    GROUP BY c.IdCliente
    ORDER BY c.Nombres ASC
  `);
  return rows;
};

export const getClienteById = async (id: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      c.IdCliente, c.DNI, c.Nombres, c.Apellidos,
      c.Telefono, c.Direccion, c.FechaRegistro, c.Estado,
      COUNT(v.IdVenta) AS TotalCompras,
      COALESCE(SUM(v.Total), 0) AS TotalGastado
    FROM clientes c
    LEFT JOIN ventas v ON c.IdCliente = v.IdCliente AND v.Estado = 'Completado'
    WHERE c.IdCliente = ?
    GROUP BY c.IdCliente
  `, [id]);
  return rows[0] ?? null;
};

export const getHistorialCliente = async (id: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      v.IdVenta, v.NumeroBoleta, v.FechaVenta,
      v.SubTotal, v.Descuento, v.Total, v.Estado,
      f.NombreFormaPago,
      COUNT(dv.IdDetalleVenta) AS TotalItems
    FROM ventas v
    INNER JOIN formaspago f   ON v.IdFormaPago = f.IdFormaPago
    INNER JOIN detalleventa dv ON v.IdVenta    = dv.IdVenta
    WHERE v.IdCliente = ?
    GROUP BY v.IdVenta
    ORDER BY v.FechaVenta DESC
  `, [id]);
  return rows;
};

export const createCliente = async (data: {
  DNI: string; Nombres: string; Apellidos: string;
  Telefono: string; Direccion: string;
}) => {
  const [result]: any = await pool.query(`
    INSERT INTO clientes (DNI, Nombres, Apellidos, Telefono, Direccion, FechaRegistro, Estado)
    VALUES (?, ?, ?, ?, ?, NOW(), 1)
  `, [data.DNI, data.Nombres, data.Apellidos, data.Telefono, data.Direccion]);
  return result.insertId;
};

export const updateCliente = async (id: number, data: {
  DNI: string; Nombres: string; Apellidos: string;
  Telefono: string; Direccion: string;
}) => {
  const [result]: any = await pool.query(`
    UPDATE clientes
    SET DNI=?, Nombres=?, Apellidos=?, Telefono=?, Direccion=?
    WHERE IdCliente=?
  `, [data.DNI, data.Nombres, data.Apellidos, data.Telefono, data.Direccion, id]);
  return result.affectedRows > 0;
};

export const toggleEstadoCliente = async (id: number, estado: number) => {
  const [result]: any = await pool.query(
    `UPDATE clientes SET Estado=? WHERE IdCliente=?`,
    [estado, id]
  );
  return result.affectedRows > 0;
};

export const buscarPorDNI = async (dni: string) => {
  const [rows]: any = await pool.query(
    `SELECT IdCliente, DNI, Nombres, Apellidos, Telefono, Estado FROM clientes WHERE DNI = ?`,
    [dni]
  );
  return rows[0] ?? null;
};
