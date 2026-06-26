import db from '../../database/connection';
import { RowDataPacket } from 'mysql2';
import { UsuarioAuth } from './auth.types';

interface UsuarioAuthRow extends UsuarioAuth, RowDataPacket {}

export const buscarPorUsuario = async (
  usuario: string
): Promise<UsuarioAuth | undefined> => {
  const sql = `
    SELECT 
      u.IdUsuario,
      u.Nombres,
      u.Apellidos,
      u.Usuario,
      u.Clave,
      u.Estado,
      r.NombreRol
    FROM Usuarios u
    INNER JOIN Roles r ON r.IdRol = u.IdRol
    WHERE u.Usuario = ? AND u.Estado = 1
    LIMIT 1
  `;

  const [rows] = await db.query<UsuarioAuthRow[]>(sql, [usuario.trim()]);

  return rows[0];
};