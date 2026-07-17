import pool from '../config/database';

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
export const getCategorias = async () => {
  const [rows]: any = await pool.query(
    `SELECT IdCategoria, NombreCategoria, Descripcion FROM categorias ORDER BY NombreCategoria ASC`
  );
  return rows;
};

export const createCategoria = async (data: { NombreCategoria: string; Descripcion: string }) => {
  const [result]: any = await pool.query(
    `INSERT INTO categorias (NombreCategoria, Descripcion) VALUES (?, ?)`,
    [data.NombreCategoria, data.Descripcion]
  );
  return result.insertId;
};

export const updateCategoria = async (id: number, data: { NombreCategoria: string; Descripcion: string }) => {
  const [result]: any = await pool.query(
    `UPDATE categorias SET NombreCategoria=?, Descripcion=? WHERE IdCategoria=?`,
    [data.NombreCategoria, data.Descripcion, id]
  );
  return result.affectedRows > 0;
};

export const deleteCategoria = async (id: number) => {
  const [uso]: any = await pool.query(
    `SELECT COUNT(*) AS total FROM productos WHERE IdCategoria = ?`, [id]
  );
  if (uso[0].total > 0)
    throw new Error(`No se puede eliminar: tiene ${uso[0].total} producto(s) asociado(s)`);
  const [result]: any = await pool.query(
    `DELETE FROM categorias WHERE IdCategoria=?`, [id]
  );
  return result.affectedRows > 0;
};
// ─── TALLAS ───────────────────────────────────────────────────────────────────
export const getTallas = async () => {
  const [rows]: any = await pool.query(
    `SELECT IdTalla, NombreTalla FROM tallas ORDER BY NombreTalla ASC`
  );
  return rows;
};

export const createTalla = async (nombre: string) => {
  const [result]: any = await pool.query(
    `INSERT INTO tallas (NombreTalla) VALUES (?)`, [nombre]
  );
  return result.insertId;
};

export const updateTalla = async (id: number, nombre: string) => {
  const [result]: any = await pool.query(
    `UPDATE tallas SET NombreTalla=? WHERE IdTalla=?`, [nombre, id]
  );
  return result.affectedRows > 0;
};

export const deleteTalla = async (id: number) => {
  const [uso]: any = await pool.query(
    `SELECT COUNT(*) AS total FROM inventario WHERE IdTalla = ?`, [id]
  );
  if (uso[0].total > 0)
    throw new Error(`No se puede eliminar: tiene ${uso[0].total} producto(s) en inventario`);
  const [result]: any = await pool.query(
    `DELETE FROM tallas WHERE IdTalla=?`, [id]
  );
  return result.affectedRows > 0;
};

// ─── COLORES ──────────────────────────────────────────────────────────────────
export const getColores = async () => {
  const [rows]: any = await pool.query(
    `SELECT IdColor, NombreColor FROM colores ORDER BY NombreColor ASC`
  );
  return rows;
};

export const createColor = async (nombre: string) => {
  const [result]: any = await pool.query(
    `INSERT INTO colores (NombreColor) VALUES (?)`, [nombre]
  );
  return result.insertId;
};

export const updateColor = async (id: number, nombre: string) => {
  const [result]: any = await pool.query(
    `UPDATE colores SET NombreColor=? WHERE IdColor=?`, [nombre, id]
  );
  return result.affectedRows > 0;
};

export const deleteColor = async (id: number) => {
  const [uso]: any = await pool.query(
    `SELECT COUNT(*) AS total FROM inventario WHERE IdColor = ?`, [id]
  );
  if (uso[0].total > 0)
    throw new Error(`No se puede eliminar: tiene ${uso[0].total} producto(s) en inventario`);
  const [result]: any = await pool.query(
    `DELETE FROM colores WHERE IdColor=?`, [id]
  );
  return result.affectedRows > 0;
};

// ─── FORMAS DE PAGO ───────────────────────────────────────────────────────────
export const getFormasPago = async () => {
  const [rows]: any = await pool.query(
    `SELECT IdFormaPago, NombreFormaPago FROM formaspago ORDER BY NombreFormaPago ASC`
  );
  return rows;
};

export const createFormaPago = async (nombre: string) => {
  const [result]: any = await pool.query(
    `INSERT INTO formaspago (NombreFormaPago) VALUES (?)`, [nombre]
  );
  return result.insertId;
};

export const updateFormaPago = async (id: number, nombre: string) => {
  const [result]: any = await pool.query(
    `UPDATE formaspago SET NombreFormaPago=? WHERE IdFormaPago=?`, [nombre, id]
  );
  return result.affectedRows > 0;
};

export const deleteFormaPago = async (id: number) => {
  const [uso]: any = await pool.query(
    `SELECT COUNT(*) AS total FROM ventas WHERE IdFormaPago = ?`, [id]
  );
  if (uso[0].total > 0)
    throw new Error(`No se puede eliminar: tiene ${uso[0].total} venta(s) asociada(s)`);
  const [result]: any = await pool.query(
    `DELETE FROM formaspago WHERE IdFormaPago=?`, [id]
  );
  return result.affectedRows > 0;
};

// ─── ROLES ────────────────────────────────────────────────────────────────────
export const getRoles = async () => {
  const [rows]: any = await pool.query(
    `SELECT IdRol, NombreRol FROM roles ORDER BY NombreRol ASC`
  );
  return rows;
};

export const createRol = async (nombre: string) => {
  const [result]: any = await pool.query(
    `INSERT INTO roles (NombreRol) VALUES (?)`, [nombre]
  );
  return result.insertId;
};

export const updateRol = async (id: number, nombre: string) => {
  const [result]: any = await pool.query(
    `UPDATE roles SET NombreRol=? WHERE IdRol=?`, [nombre, id]
  );
  return result.affectedRows > 0;
};

export const deleteRol = async (id: number) => {
  const [uso]: any = await pool.query(
    `SELECT COUNT(*) AS total FROM usuarios WHERE IdRol = ?`, [id]
  );
  if (uso[0].total > 0)
    throw new Error(`No se puede eliminar: tiene ${uso[0].total} usuario(s) con este rol`);
  const [result]: any = await pool.query(
    `DELETE FROM roles WHERE IdRol=?`, [id]
  );
  return result.affectedRows > 0;
};