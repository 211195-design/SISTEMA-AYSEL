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
    VALUES (?, ?, ?, ?, CONVERT_TZ(NOW(),'+00:00','-05:00'), ?, ?, ?, 'Completado')
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

export const getReporteTurno = async (idUsuario: number, fecha: string) => {
  const [rows]: any = await pool.query(`
    SELECT
      COUNT(*)                                          AS TotalVentas,
      COALESCE(SUM(v.Total), 0)                        AS MontoTotal,
      COALESCE(SUM(v.Descuento), 0)                    AS TotalDescuentos,
      COALESCE(SUM(CASE WHEN v.Estado='Anulado' THEN 1 ELSE 0 END), 0) AS Anuladas,
      f.NombreFormaPago,
      COALESCE(SUM(CASE WHEN v.Estado='Completado' THEN v.Total ELSE 0 END), 0) AS MontoFormaPago
    FROM ventas v
    INNER JOIN formaspago f ON v.IdFormaPago = f.IdFormaPago
    WHERE v.IdUsuario = ? AND DATE(v.FechaVenta) = ? AND v.Estado = 'Completado'
    GROUP BY f.NombreFormaPago
  `, [idUsuario, fecha]);

  const [resumen]: any = await pool.query(`
    SELECT
      COUNT(*)                                                           AS TotalVentas,
      COALESCE(SUM(CASE WHEN Estado='Completado' THEN Total ELSE 0 END), 0) AS MontoTotal,
      COALESCE(SUM(CASE WHEN Estado='Completado' THEN Descuento ELSE 0 END), 0) AS TotalDescuentos,
      COALESCE(SUM(CASE WHEN Estado='Anulado'    THEN 1 ELSE 0 END), 0) AS Anuladas
    FROM ventas
    WHERE IdUsuario = ? AND DATE(FechaVenta) = ?
  `, [idUsuario, fecha]);

  const [detalle]: any = await pool.query(`
    SELECT
      v.NumeroBoleta, v.FechaVenta, v.Total, v.Estado,
      CONCAT(c.Nombres,' ',c.Apellidos) AS Cliente,
      f.NombreFormaPago
    FROM ventas v
    INNER JOIN clientes   c ON v.IdCliente  = c.IdCliente
    INNER JOIN formaspago f ON v.IdFormaPago = f.IdFormaPago
    WHERE v.IdUsuario = ? AND DATE(v.FechaVenta) = ?
    ORDER BY v.FechaVenta DESC
  `, [idUsuario, fecha]);

  return { resumen: resumen[0], porFormaPago: rows, detalle };
};

export const getReporteGeneral = async (desde: string, hasta: string) => {
  const [resumen]: any = await pool.query(`
    SELECT
      COUNT(*)                                                               AS TotalVentas,
      COALESCE(SUM(CASE WHEN Estado='Completado' THEN Total     ELSE 0 END), 0) AS MontoTotal,
      COALESCE(SUM(CASE WHEN Estado='Completado' THEN Descuento ELSE 0 END), 0) AS TotalDescuentos,
      COALESCE(SUM(CASE WHEN Estado='Anulado'    THEN 1         ELSE 0 END), 0) AS Anuladas
    FROM ventas
    WHERE DATE(FechaVenta) BETWEEN ? AND ?
  `, [desde, hasta]);

  const [porVendedor]: any = await pool.query(`
    SELECT
      CONCAT(u.Nombres,' ',u.Apellidos)                                     AS Vendedor,
      COUNT(*)                                                               AS TotalVentas,
      COALESCE(SUM(CASE WHEN v.Estado='Completado' THEN v.Total ELSE 0 END), 0) AS MontoTotal
    FROM ventas v
    INNER JOIN usuarios u ON v.IdUsuario = u.IdUsuario
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    GROUP BY v.IdUsuario, Vendedor
    ORDER BY MontoTotal DESC
  `, [desde, hasta]);

  const [porFormaPago]: any = await pool.query(`
    SELECT
      f.NombreFormaPago,
      COUNT(*)                                                               AS TotalVentas,
      COALESCE(SUM(CASE WHEN v.Estado='Completado' THEN v.Total ELSE 0 END), 0) AS MontoTotal
    FROM ventas v
    INNER JOIN formaspago f ON v.IdFormaPago = f.IdFormaPago
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    GROUP BY f.IdFormaPago, f.NombreFormaPago
    ORDER BY MontoTotal DESC
  `, [desde, hasta]);

  const [porDia]: any = await pool.query(`
    SELECT
      DATE(FechaVenta)                                                       AS Fecha,
      COUNT(*)                                                               AS TotalVentas,
      COALESCE(SUM(CASE WHEN Estado='Completado' THEN Total ELSE 0 END), 0) AS MontoTotal
    FROM ventas
    WHERE DATE(FechaVenta) BETWEEN ? AND ?
    GROUP BY DATE(FechaVenta)
    ORDER BY Fecha ASC
  `, [desde, hasta]);

  return { resumen: resumen[0], porVendedor, porFormaPago, porDia };
};


// â”€â”€â”€ DASHBOARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const getDashboard = async (idUsuario: number) => {
  // Fechas en hora Lima (UTC-5)
  const _limaMs        = Date.now() - (5 * 60 * 60 * 1000);
  const hoy            = new Date(_limaMs).toISOString().split('T')[0];
  const ayer           = new Date(_limaMs - 86400000).toISOString().split('T')[0];

  // Lunes de esta semana (Lima)
  const _ahoraLima     = new Date(_limaMs);
  const _diaSemana     = _ahoraLima.getUTCDay() === 0 ? 6 : _ahoraLima.getUTCDay() - 1;
  const lunesEsta      = new Date(_limaMs - _diaSemana * 86400000).toISOString().split('T')[0];
  const lunesAnterior  = new Date(new Date(lunesEsta).getTime() - 7 * 86400000).toISOString().split('T')[0];
  const domingoAnterior = new Date(new Date(lunesEsta).getTime() - 86400000).toISOString().split('T')[0];

  // 1. MÃ©tricas del dÃ­a
  const [metricasHoy]: any = await pool.query(`
    SELECT
      COUNT(CASE WHEN Estado='Completado' THEN 1 END)          AS TotalVentas,
      COALESCE(SUM(CASE WHEN Estado='Completado' THEN Total END), 0) AS MontoTotal,
      COUNT(CASE WHEN Estado='Anulado' THEN 1 END)             AS Anuladas
    FROM ventas
    WHERE DATE(FechaVenta) = ?
  `, [hoy]);

  // 2. MÃ©tricas de ayer
  const [metricasAyer]: any = await pool.query(`
    SELECT
      COUNT(CASE WHEN Estado='Completado' THEN 1 END)          AS TotalVentas,
      COALESCE(SUM(CASE WHEN Estado='Completado' THEN Total END), 0) AS MontoTotal
    FROM ventas
    WHERE DATE(FechaVenta) = ?
  `, [ayer]);

  // 3. Ventas por hora (hoy)
  const [porHora]: any = await pool.query(`
    SELECT
      HOUR(FechaVenta)                                          AS Hora,
      COUNT(*)                                                  AS Cantidad,
      COALESCE(SUM(CASE WHEN Estado='Completado' THEN Total END), 0) AS Monto
    FROM ventas
    WHERE DATE(FechaVenta) = ? AND Estado = 'Completado'
    GROUP BY HOUR(FechaVenta)
    ORDER BY Hora ASC
  `, [hoy]);

  // 4. Forma de pago mÃ¡s usada hoy
  const [formasPago]: any = await pool.query(`
    SELECT
      f.NombreFormaPago,
      COUNT(*)                                                  AS Cantidad,
      COALESCE(SUM(v.Total), 0)                                AS Monto
    FROM ventas v
    INNER JOIN formaspago f ON v.IdFormaPago = f.IdFormaPago
    WHERE DATE(v.FechaVenta) = ? AND v.Estado = 'Completado'
    GROUP BY f.IdFormaPago, f.NombreFormaPago
    ORDER BY Monto DESC
  `, [hoy]);

  // 5. Productos mÃ¡s vendidos hoy
  const [topProductos]: any = await pool.query(`
    SELECT
      p.NombreProducto,
      SUM(dv.Cantidad)       AS TotalUnidades,
      SUM(dv.SubTotal)       AS TotalMonto
    FROM detalleventa dv
    INNER JOIN ventas     v ON dv.IdVenta     = v.IdVenta
    INNER JOIN inventario i ON dv.IdInventario = i.IdInventario
    INNER JOIN productos  p ON i.IdProducto   = p.IdProducto
    WHERE DATE(v.FechaVenta) = ? AND v.Estado = 'Completado'
    GROUP BY p.IdProducto, p.NombreProducto
    ORDER BY TotalUnidades DESC
    LIMIT 5
  `, [hoy]);

  // 6. Clientes con mÃ¡s compras hoy
  const [topClientes]: any = await pool.query(`
    SELECT
      CONCAT(c.Nombres, ' ', c.Apellidos) AS Cliente,
      COUNT(v.IdVenta)                    AS TotalCompras,
      SUM(v.Total)                        AS TotalGastado
    FROM ventas v
    INNER JOIN clientes c ON v.IdCliente = c.IdCliente
    WHERE DATE(v.FechaVenta) = ? AND v.Estado = 'Completado'
    GROUP BY v.IdCliente
    ORDER BY TotalGastado DESC
    LIMIT 5
  `, [hoy]);

  // 7. Stock bajo (alertas)
  const [stockBajo]: any = await pool.query(`
    SELECT
      p.NombreProducto,
      t.NombreTalla,
      col.NombreColor,
      i.StockActual,
      p.StockMinimo
    FROM inventario i
    INNER JOIN productos p   ON i.IdProducto = p.IdProducto
    LEFT  JOIN tallas    t   ON i.IdTalla    = t.IdTalla
    LEFT  JOIN colores   col ON i.IdColor    = col.IdColor
    WHERE i.StockActual <= p.StockMinimo AND p.Estado = 1
    ORDER BY i.StockActual ASC
    LIMIT 10
  `);


  // 8. Mi turno (vendedor actual)
  const [miTurno]: any = await pool.query(`
    SELECT
      COUNT(CASE WHEN Estado='Completado' THEN 1 END)          AS MisVentas,
      COALESCE(SUM(CASE WHEN Estado='Completado' THEN Total END), 0) AS MiMonto
    FROM ventas
    WHERE IdUsuario = ? AND DATE(FechaVenta) = ?
  `, [idUsuario, hoy]);

  const [ultimaVenta]: any = await pool.query(`
    SELECT
      v.NumeroBoleta, v.FechaVenta, v.Total,
      CONCAT(c.Nombres, ' ', c.Apellidos) AS Cliente
    FROM ventas v
    INNER JOIN clientes c ON v.IdCliente = c.IdCliente
    WHERE v.IdUsuario = ? AND v.Estado = 'Completado'
    ORDER BY v.FechaVenta DESC
    LIMIT 1
  `, [idUsuario]);

  // 9. Esta semana vs semana anterior
  const [estaSemana]: any = await pool.query(`
    SELECT COALESCE(SUM(CASE WHEN Estado='Completado' THEN Total END), 0) AS Monto,
           COUNT(CASE WHEN Estado='Completado' THEN 1 END) AS Ventas
    FROM ventas WHERE DATE(FechaVenta) BETWEEN ? AND ?
  `, [lunesEsta, hoy]);

  const [semanaAnterior]: any = await pool.query(`
    SELECT COALESCE(SUM(CASE WHEN Estado='Completado' THEN Total END), 0) AS Monto,
           COUNT(CASE WHEN Estado='Completado' THEN 1 END) AS Ventas
    FROM ventas WHERE DATE(FechaVenta) BETWEEN ? AND ?
  `, [lunesAnterior, domingoAnterior]);

  return {
    hoy: metricasHoy[0],
    ayer: metricasAyer[0],
    porHora,
    formasPago,
    topProductos,
    topClientes,
    stockBajo,
    miTurno: { ...miTurno[0], ultimaVenta: ultimaVenta[0] ?? null },
    semanas: { esta: estaSemana[0], anterior: semanaAnterior[0] },
  };
};




