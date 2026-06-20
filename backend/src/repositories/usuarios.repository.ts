import pool from '../config/database';

export const getAllUsuarios = async () => {
  const [rows]: any = await pool.query(`
    SELECT
      u.IdUsuario, u.Nombres, u.Apellidos, u.Correo,
      u.Usuario, u.Telefono, u.Estado,
      r.IdRol, r.NombreRol
    FROM usuarios u
    INNER JOIN roles r ON u.IdRol = r.IdRol
    ORDER BY u.Nombres ASC
  `);
  return rows;
};

export const getUsuarioById = async (id: number) => {
  const [rows]: any = await pool.query(`
    SELECT
      u.IdUsuario, u.Nombres, u.Apellidos, u.Correo,
      u.Usuario, u.Telefono, u.Estado,
      r.IdRol, r.NombreRol
    FROM usuarios u
    INNER JOIN roles r ON u.IdRol = r.IdRol
    WHERE u.IdUsuario = ?
  `, [id]);
  return rows[0] ?? null;
};

export const getUsuarioByUsuario = async (usuario: string) => {
  const [rows]: any = await pool.query(
    `SELECT IdUsuario FROM usuarios WHERE Usuario = ?`, [usuario]
  );
  return rows[0] ?? null;
};

export const getUsuarioByCorreo = async (correo: string) => {
  const [rows]: any = await pool.query(
    `SELECT IdUsuario FROM usuarios WHERE Correo = ?`, [correo]
  );
  return rows[0] ?? null;
};

export const createUsuario = async (data: {
  IdRol: number; Nombres: string; Apellidos: string;
  Correo: string; Usuario: string; Clave: string; Telefono: string;
}) => {
  const [result]: any = await pool.query(`
    INSERT INTO usuarios (IdRol, Nombres, Apellidos, Correo, Usuario, Clave, Telefono, Estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [data.IdRol, data.Nombres, data.Apellidos, data.Correo,
      data.Usuario, data.Clave, data.Telefono]);
  return result.insertId;
};

export const updateUsuario = async (id: number, data: {
  IdRol: number; Nombres: string; Apellidos: string;
  Correo: string; Usuario: string; Telefono: string;
}) => {
  const [result]: any = await pool.query(`
    UPDATE usuarios
    SET IdRol=?, Nombres=?, Apellidos=?, Correo=?, Usuario=?, Telefono=?
    WHERE IdUsuario=?
  `, [data.IdRol, data.Nombres, data.Apellidos,
      data.Correo, data.Usuario, data.Telefono, id]);
  return result.affectedRows > 0;
};

export const updateClave = async (id: number, clave: string) => {
  const [result]: any = await pool.query(
    `UPDATE usuarios SET Clave=? WHERE IdUsuario=?`, [clave, id]
  );
  return result.affectedRows > 0;
};

export const toggleEstadoUsuario = async (id: number, estado: number) => {
  const [result]: any = await pool.query(
    `UPDATE usuarios SET Estado=? WHERE IdUsuario=?`, [estado, id]
  );
  return result.affectedRows > 0;
};

export const getAllRoles = async () => {
  const [rows]: any = await pool.query(
    `SELECT IdRol, NombreRol FROM roles ORDER BY NombreRol ASC`
  );
  return rows;
};
