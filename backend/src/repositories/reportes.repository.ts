import pool from '../config/database';

export const getReporteVentas = async (desde: string, hasta: string) => {
  const [rows]: any = await pool.query(`
    SELECT
      v.IdVenta, v.NumeroBoleta, v.FechaVenta,
      v.SubTotal, v.Descuento, v.Total, v.Estado,
      CONCAT(c.Nombres, ' ', c.Apellidos) AS Cliente,
      c.DNI, f.NombreFormaPago,
      CONCAT(u.Nombres, ' ', u.Apellidos) AS Vendedor,
      COUNT(dv.IdDetalleVenta) AS TotalItems
    FROM ventas v
    INNER JOIN clientes     c  ON v.IdCliente   = c.IdCliente
    INNER JOIN formaspago   f  ON v.IdFormaPago  = f.IdFormaPago
    INNER JOIN usuarios     u  ON v.IdUsuario    = u.IdUsuario
    INNER JOIN detalleventa dv ON v.IdVenta      = dv.IdVenta
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    AND v.Estado = 'Completado'
    GROUP BY v.IdVenta
    ORDER BY v.FechaVenta DESC
  `, [desde, hasta]);
  return rows;
};

export const getReporteInventario = async () => {
  const [rows]: any = await pool.query(`
    SELECT
      p.Codigo, p.NombreProducto, c.NombreCategoria,
      p.PrecioCompra, p.PrecioVenta,
      p.StockMinimo, COALESCE(SUM(i.StockActual), 0) AS StockActual,
      COALESCE(SUM(i.StockActual), 0) * p.PrecioVenta AS ValorTotal,
      CASE
        WHEN COALESCE(SUM(i.StockActual), 0) = 0 THEN 'Sin stock'
        WHEN COALESCE(SUM(i.StockActual), 0) <= p.StockMinimo THEN 'Stock bajo'
        ELSE 'OK'
      END AS EstadoStock
    FROM productos p
    INNER JOIN categorias c ON p.IdCategoria = c.IdCategoria
    LEFT  JOIN inventario i ON p.IdProducto  = i.IdProducto
    WHERE p.Estado = 1
    GROUP BY p.IdProducto
    ORDER BY StockActual ASC
  `);
  return rows;
};

export const getReporteProductosVendidos = async (desde: string, hasta: string) => {
  const [rows]: any = await pool.query(`
    SELECT
      p.Codigo, p.NombreProducto, c.NombreCategoria,
      p.PrecioCompra, p.PrecioVenta,
      SUM(dv.Cantidad)  AS UnidadesVendidas,
      SUM(dv.SubTotal)  AS TotalIngresos,
      SUM(dv.Cantidad * p.PrecioCompra) AS TotalCosto,
      SUM(dv.SubTotal) - SUM(dv.Cantidad * p.PrecioCompra) AS Ganancia
    FROM detalleventa dv
    INNER JOIN ventas     v  ON dv.IdVenta      = v.IdVenta
    INNER JOIN inventario i  ON dv.IdInventario = i.IdInventario
    INNER JOIN productos  p  ON i.IdProducto    = p.IdProducto
    INNER JOIN categorias c  ON p.IdCategoria   = c.IdCategoria
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    AND v.Estado = 'Completado'
    GROUP BY p.IdProducto
    ORDER BY TotalIngresos DESC
  `, [desde, hasta]);
  return rows;
};

export const getReporteClientes = async (desde: string, hasta: string) => {
  const [rows]: any = await pool.query(`
    SELECT
      c.DNI,
      CONCAT(c.Nombres, ' ', c.Apellidos) AS Cliente,
      c.Telefono,
      COUNT(v.IdVenta)  AS TotalCompras,
      SUM(v.Total)      AS TotalGastado,
      MAX(v.FechaVenta) AS UltimaCompra
    FROM clientes c
    INNER JOIN ventas v ON c.IdCliente = v.IdCliente
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    AND v.Estado = 'Completado'
    GROUP BY c.IdCliente
    ORDER BY TotalGastado DESC
  `, [desde, hasta]);
  return rows;
};

export const getReporteFormasPago = async (desde: string, hasta: string) => {
  const [rows]: any = await pool.query(`
    SELECT
      f.NombreFormaPago,
      COUNT(v.IdVenta) AS TotalVentas,
      SUM(v.Total)     AS TotalIngresos,
      ROUND(COUNT(v.IdVenta) * 100.0 / SUM(COUNT(v.IdVenta)) OVER(), 1) AS Porcentaje
    FROM ventas v
    INNER JOIN formaspago f ON v.IdFormaPago = f.IdFormaPago
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    AND v.Estado = 'Completado'
    GROUP BY f.IdFormaPago
    ORDER BY TotalIngresos DESC
  `, [desde, hasta]);
  return rows;
};

export const getReporteGanancias = async (desde: string, hasta: string) => {
  const [rows]: any = await pool.query(`
    SELECT
      p.Codigo, p.NombreProducto, c.NombreCategoria,
      p.PrecioCompra, p.PrecioVenta,
      p.PrecioVenta - p.PrecioCompra AS MargenUnitario,
      ROUND((p.PrecioVenta - p.PrecioCompra) / p.PrecioCompra * 100, 1) AS MargenPorcentaje,
      SUM(dv.Cantidad) AS Unidades,
      SUM(dv.SubTotal) - SUM(dv.Cantidad * p.PrecioCompra) AS GananciaTotal
    FROM detalleventa dv
    INNER JOIN ventas     v ON dv.IdVenta      = v.IdVenta
    INNER JOIN inventario i ON dv.IdInventario = i.IdInventario
    INNER JOIN productos  p ON i.IdProducto    = p.IdProducto
    INNER JOIN categorias c ON p.IdCategoria   = c.IdCategoria
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    AND v.Estado = 'Completado'
    GROUP BY p.IdProducto
    ORDER BY GananciaTotal DESC
  `, [desde, hasta]);
  return rows;
};

export const getResumenGeneral = async (desde: string, hasta: string) => {
  const [[ventas]]: any = await pool.query(`
    SELECT
      COUNT(*) AS TotalVentas,
      COALESCE(SUM(Total), 0) AS TotalIngresos,
      COALESCE(SUM(Descuento), 0) AS TotalDescuentos,
      COALESCE(AVG(Total), 0) AS PromedioVenta
    FROM ventas
    WHERE DATE(FechaVenta) BETWEEN ? AND ?
    AND Estado = 'Completado'
  `, [desde, hasta]);

  const [[productos]]: any = await pool.query(`
    SELECT COUNT(DISTINCT i.IdProducto) AS TotalProductos,
    COALESCE(SUM(i.StockActual * p.PrecioVenta), 0) AS ValorInventario
    FROM inventario i INNER JOIN productos p ON i.IdProducto = p.IdProducto
    WHERE p.Estado = 1
  `);

  const [[clientes]]: any = await pool.query(`
    SELECT COUNT(DISTINCT IdCliente) AS ClientesAtendidos
    FROM ventas
    WHERE DATE(FechaVenta) BETWEEN ? AND ?
    AND Estado = 'Completado'
  `, [desde, hasta]);

  const [[ganancia]]: any = await pool.query(`
    SELECT COALESCE(SUM(dv.SubTotal) - SUM(dv.Cantidad * p.PrecioCompra), 0) AS GananciaTotal
    FROM detalleventa dv
    INNER JOIN ventas     v ON dv.IdVenta      = v.IdVenta
    INNER JOIN inventario i ON dv.IdInventario = i.IdInventario
    INNER JOIN productos  p ON i.IdProducto    = p.IdProducto
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    AND v.Estado = 'Completado'
  `, [desde, hasta]);

  return { ...ventas, ...productos, ...clientes, ...ganancia };
};

export const getReporteAnuladas = async (desde: string, hasta: string) => {
  const [rows]: any = await pool.query(`
    SELECT
      v.IdVenta, v.NumeroBoleta, v.FechaVenta,
      v.SubTotal, v.Descuento, v.Total, v.Estado,
      CONCAT(c.Nombres, ' ', c.Apellidos) AS Cliente,
      c.DNI, f.NombreFormaPago,
      CONCAT(u.Nombres, ' ', u.Apellidos) AS Vendedor,
      COUNT(dv.IdDetalleVenta) AS TotalItems
    FROM ventas v
    INNER JOIN clientes     c  ON v.IdCliente   = c.IdCliente
    INNER JOIN formaspago   f  ON v.IdFormaPago  = f.IdFormaPago
    INNER JOIN usuarios     u  ON v.IdUsuario    = u.IdUsuario
    INNER JOIN detalleventa dv ON v.IdVenta      = dv.IdVenta
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    AND v.Estado = 'Anulado'
    GROUP BY v.IdVenta
    ORDER BY v.FechaVenta DESC
  `, [desde, hasta]);
  return rows;
};

// ─── NUEVAS FUNCIONES ────────────────────────────────────────────────────────

// Reporte 1: Ventas del día con detalle de boletas
export const getReporteVentasDia = async (fecha: string) => {
  const [ventas]: any = await pool.query(`
    SELECT
      v.IdVenta, v.NumeroBoleta,
      DATE_FORMAT(v.FechaVenta, '%H:%i') AS Hora,
      v.SubTotal, v.Descuento, v.Total,
      CONCAT(c.Nombres, ' ', c.Apellidos) AS Cliente,
      c.DNI,
      f.NombreFormaPago,
      CONCAT(u.Nombres, ' ', u.Apellidos) AS Vendedor
    FROM ventas v
    INNER JOIN clientes   c ON v.IdCliente   = c.IdCliente
    INNER JOIN formaspago f ON v.IdFormaPago = f.IdFormaPago
    INNER JOIN usuarios   u ON v.IdUsuario   = u.IdUsuario
    WHERE DATE(v.FechaVenta) = ?
    AND v.Estado = 'Completado'
    ORDER BY v.FechaVenta ASC
  `, [fecha]);

  const [[resumen]]: any = await pool.query(`
    SELECT
      COUNT(*)                       AS TotalBoletas,
      COALESCE(SUM(Total), 0)        AS TotalIngresos,
      COALESCE(SUM(Descuento), 0)    AS TotalDescuentos,
      COALESCE(AVG(Total), 0)        AS PromedioVenta
    FROM ventas
    WHERE DATE(FechaVenta) = ?
    AND Estado = 'Completado'
  `, [fecha]);

  return { resumen, ventas };
};

// Reporte 2: Ventas por vendedor
export const getReporteVendedor = async (desde: string, hasta: string) => {
  const [rows]: any = await pool.query(`
    SELECT
      u.IdUsuario,
      CONCAT(u.Nombres, ' ', u.Apellidos) AS Vendedor,
      u.Rol,
      COUNT(v.IdVenta)            AS TotalVentas,
      COALESCE(SUM(v.Total), 0)   AS TotalIngresos,
      COALESCE(AVG(v.Total), 0)   AS PromedioVenta,
      COALESCE(SUM(v.Descuento), 0) AS TotalDescuentos,
      MAX(DATE(v.FechaVenta))     AS UltimaVenta
    FROM usuarios u
    LEFT JOIN ventas v ON u.IdUsuario = v.IdUsuario
      AND DATE(v.FechaVenta) BETWEEN ? AND ?
      AND v.Estado = 'Completado'
    WHERE u.Estado = 1
    GROUP BY u.IdUsuario
    ORDER BY TotalIngresos DESC
  `, [desde, hasta]);
  return rows;
};

// Reporte 3: Ventas por turno (Mañana 08:00-13:59 / Tarde 14:00-21:59)
export const getReporteTurnos = async (desde: string, hasta: string) => {
  const [porDia]: any = await pool.query(`
    SELECT
      DATE(v.FechaVenta) AS Fecha,
      CASE
        WHEN TIME(v.FechaVenta) BETWEEN '08:00:00' AND '13:59:59' THEN 'Mañana'
        WHEN TIME(v.FechaVenta) BETWEEN '14:00:00' AND '21:59:59' THEN 'Tarde'
        ELSE 'Fuera de turno'
      END AS Turno,
      CONCAT(u.Nombres, ' ', u.Apellidos) AS Vendedor,
      COUNT(v.IdVenta)          AS TotalVentas,
      COALESCE(SUM(v.Total), 0) AS TotalIngresos
    FROM ventas v
    INNER JOIN usuarios u ON v.IdUsuario = u.IdUsuario
    WHERE DATE(v.FechaVenta) BETWEEN ? AND ?
    AND v.Estado = 'Completado'
    GROUP BY Fecha, Turno, v.IdUsuario
    ORDER BY Fecha DESC, Turno ASC
  `, [desde, hasta]);

  const [[resumen]]: any = await pool.query(`
    SELECT
      COALESCE(SUM(CASE WHEN TIME(FechaVenta) BETWEEN '08:00:00' AND '13:59:59' THEN Total ELSE 0 END), 0) AS IngresosMañana,
      COALESCE(SUM(CASE WHEN TIME(FechaVenta) BETWEEN '14:00:00' AND '21:59:59' THEN Total ELSE 0 END), 0) AS IngresosTarde,
      COUNT(CASE WHEN TIME(FechaVenta) BETWEEN '08:00:00' AND '13:59:59' THEN 1 END) AS VentasMañana,
      COUNT(CASE WHEN TIME(FechaVenta) BETWEEN '14:00:00' AND '21:59:59' THEN 1 END) AS VentasTarde
    FROM ventas
    WHERE DATE(FechaVenta) BETWEEN ? AND ?
    AND Estado = 'Completado'
  `, [desde, hasta]);

  return { resumen, detalle: porDia };
};
