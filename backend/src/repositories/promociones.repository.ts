import pool from '../config/database';

export const getAllPromociones = async () => {
  const [rows]: any = await pool.query(`
    SELECT
      p.IdPromocion, p.NombrePromocion, p.Descuento,
      p.FechaInicio, p.FechaFin, p.Estado,
      COUNT(cp.IdCliente) AS TotalClientes,
      CASE
        WHEN p.Estado = 0 THEN 'Inactiva'
        WHEN p.FechaInicio > CURDATE() THEN 'Próxima'
        WHEN p.FechaFin < CURDATE() THEN 'Vencida'
        ELSE 'Activa'
      END AS EstadoVigencia
    FROM promociones p
    LEFT JOIN clientespromociones cp ON p.IdPromocion = cp.IdPromocion
    GROUP BY p.IdPromocion
    ORDER BY p.FechaInicio DESC
  `);
  return rows;
};

export const getPromocionById = async (id: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      p.IdPromocion, p.NombrePromocion, p.Descuento,
      p.FechaInicio, p.FechaFin, p.Estado,
      CASE
        WHEN p.Estado = 0 THEN 'Inactiva'
        WHEN p.FechaInicio > CURDATE() THEN 'Próxima'
        WHEN p.FechaFin < CURDATE() THEN 'Vencida'
        ELSE 'Activa'
      END AS EstadoVigencia
    FROM promociones p
    WHERE p.IdPromocion = ?
  `, [id]);
  return rows[0] ?? null;
};

export const getClientesDePromocion = async (idPromocion: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      c.IdCliente, c.DNI, c.Nombres, c.Apellidos, c.Telefono
    FROM clientespromociones cp
    INNER JOIN clientes c ON cp.IdCliente = c.IdCliente
    WHERE cp.IdPromocion = ?
    ORDER BY c.Nombres ASC
  `, [idPromocion]);
  return rows;
};

export const getPromocionesActivasDeCliente = async (idCliente: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      p.IdPromocion, p.NombrePromocion, p.Descuento
    FROM clientespromociones cp
    INNER JOIN promociones p ON cp.IdPromocion = p.IdPromocion
    WHERE cp.IdCliente = ?
      AND p.Estado = 1
      AND p.FechaInicio <= CURDATE()
      AND p.FechaFin    >= CURDATE()
    ORDER BY p.Descuento DESC
  `, [idCliente]);
  return rows;
};

export const createPromocion = async (data: {
  NombrePromocion: string; Descuento: number;
  FechaInicio: string; FechaFin: string;
}) => {
  const [result]: any = await pool.query(`
    INSERT INTO promociones (NombrePromocion, Descuento, FechaInicio, FechaFin, Estado)
    VALUES (?, ?, ?, ?, 1)
  `, [data.NombrePromocion, data.Descuento, data.FechaInicio, data.FechaFin]);
  return result.insertId;
};

export const updatePromocion = async (id: number, data: {
  NombrePromocion: string; Descuento: number;
  FechaInicio: string; FechaFin: string;
}) => {
  const [result]: any = await pool.query(`
    UPDATE promociones
    SET NombrePromocion=?, Descuento=?, FechaInicio=?, FechaFin=?
    WHERE IdPromocion=?
  `, [data.NombrePromocion, data.Descuento, data.FechaInicio, data.FechaFin, id]);
  return result.affectedRows > 0;
};

export const toggleEstadoPromocion = async (id: number, estado: number) => {
  const [result]: any = await pool.query(
    `UPDATE promociones SET Estado=? WHERE IdPromocion=?`, [estado, id]
  );
  return result.affectedRows > 0;
};

export const asignarCliente = async (idPromocion: number, idCliente: number) => {
  await pool.query(`
    INSERT IGNORE INTO clientespromociones (IdCliente, IdPromocion)
    VALUES (?, ?)
  `, [idCliente, idPromocion]);
};

export const quitarCliente = async (idPromocion: number, idCliente: number) => {
  await pool.query(`
    DELETE FROM clientespromociones
    WHERE IdPromocion=? AND IdCliente=?
  `, [idPromocion, idCliente]);
};

export const deletePromocion = async (id: number) => {
  await pool.query(`DELETE FROM clientespromociones WHERE IdPromocion=?`, [id]);
  await pool.query(`DELETE FROM promociones WHERE IdPromocion=?`, [id]);
};