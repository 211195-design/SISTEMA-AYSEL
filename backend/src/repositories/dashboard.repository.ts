<<<<<<< HEAD
import pool from '../config/database';
=======
﻿import pool from '../config/database';
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de

// 1. Ventas de hoy
export const getVentasHoy = async () => {
  const [rows]: any = await pool.query(`
    SELECT 
      COUNT(*) AS cantidad,
      COALESCE(SUM(Total), 0) AS ingresos
    FROM ventas
<<<<<<< HEAD
    WHERE DATE(FechaVenta) = CURDATE()
=======
    WHERE DATE(CONVERT_TZ(FechaVenta,'+00:00','-05:00')) = CURDATE()
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
      AND Estado = 'Completado'
  `);
  return rows[0];
};

// 2. Ingresos totales
export const getIngresosTotales = async () => {
  const [rows]: any = await pool.query(`
    SELECT 
      COUNT(*) AS totalVentas,
      COALESCE(SUM(Total), 0) AS ingresosTotales
    FROM ventas
    WHERE Estado = 'Completado'
  `);
  return rows[0];
};

// 3. Inventario
export const getResumenInventario = async () => {
  const [rows]: any = await pool.query(`
    SELECT 
      COUNT(DISTINCT i.IdProducto) AS totalProductos,
      COALESCE(SUM(i.StockActual * p.PrecioVenta), 0) AS valorTotal
    FROM inventario i
    INNER JOIN productos p ON i.IdProducto = p.IdProducto
    WHERE p.Estado = 1
  `);
  return rows[0];
};

// 4. Total clientes activos
export const getTotalClientes = async () => {
  const [rows]: any = await pool.query(`
    SELECT COUNT(*) AS totalClientes
    FROM clientes
    WHERE Estado = 1
  `);
  return rows[0];
};

<<<<<<< HEAD
// 5. Tendencia semanal (últimos 7 días)
export const getTendenciaSemanal = async () => {
  const [rows]: any = await pool.query(`
    SELECT 
      DATE(FechaVenta) AS fecha,
      COUNT(*) AS cantidadVentas,
      COALESCE(SUM(Total), 0) AS ingresos
    FROM ventas
    WHERE FechaVenta >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      AND Estado = 'Completado'
    GROUP BY DATE(FechaVenta)
=======
// 5. Tendencia semanal (ultimos 7 dias)
export const getTendenciaSemanal = async () => {
  const [rows]: any = await pool.query(`
    SELECT 
      DATE(CONVERT_TZ(FechaVenta,'+00:00','-05:00')) AS fecha,
      COUNT(*) AS cantidadVentas,
      COALESCE(SUM(Total), 0) AS ingresos
    FROM ventas
    WHERE DATE(CONVERT_TZ(FechaVenta,'+00:00','-05:00')) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      AND Estado = 'Completado'
    GROUP BY DATE(CONVERT_TZ(FechaVenta,'+00:00','-05:00'))
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
    ORDER BY fecha ASC
  `);
  return rows;
};

<<<<<<< HEAD
// 6. Ventas por categoría
=======
// 6. Ventas por categoria
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
export const getVentasPorCategoria = async () => {
  const [rows]: any = await pool.query(`
    SELECT 
      c.NombreCategoria AS categoria,
      COALESCE(SUM(dv.SubTotal), 0) AS total
    FROM detalleventa dv
    INNER JOIN inventario i ON dv.IdInventario = i.IdInventario
    INNER JOIN productos p ON i.IdProducto = p.IdProducto
    INNER JOIN categorias c ON p.IdCategoria = c.IdCategoria
    INNER JOIN ventas v ON dv.IdVenta = v.IdVenta
    WHERE v.Estado = 'Completado'
    GROUP BY c.IdCategoria, c.NombreCategoria
    ORDER BY total DESC
  `);
  return rows;
};

<<<<<<< HEAD
// 7. Top 5 productos más rentables
=======
// 7. Top 5 productos mas rentables
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
export const getTopProductos = async () => {
  const [rows]: any = await pool.query(`
    SELECT 
      p.NombreProducto,
      SUM(dv.Cantidad) AS unidadesVendidas,
      COALESCE(SUM(dv.SubTotal), 0) AS totalIngresos
    FROM detalleventa dv
    INNER JOIN inventario i ON dv.IdInventario = i.IdInventario
    INNER JOIN productos p ON i.IdProducto = p.IdProducto
    INNER JOIN ventas v ON dv.IdVenta = v.IdVenta
    WHERE v.Estado = 'Completado'
    GROUP BY p.IdProducto, p.NombreProducto
    ORDER BY totalIngresos DESC
    LIMIT 5
  `);
  return rows;
};

<<<<<<< HEAD
// 8. Métodos de pago
=======
// 8. Metodos de pago
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
export const getMetodosPago = async () => {
  const [rows]: any = await pool.query(`
    SELECT 
      f.NombreFormaPago AS metodo,
      COUNT(*) AS cantidad
    FROM ventas v
    INNER JOIN formaspago f ON v.IdFormaPago = f.IdFormaPago
    WHERE v.Estado = 'Completado'
    GROUP BY f.IdFormaPago, f.NombreFormaPago
    ORDER BY cantidad DESC
  `);
  return rows;
};

// 9. Alertas de inventario (stock bajo)
export const getAlertasInventario = async () => {
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
