import db from '../config/database';
import { UsuarioAuth } from '../models/auth.types';

export const findUsuarioByNombre = async (
  nombreUsuario: string
): Promise<UsuarioAuth | null> => {
  const [rows] = await db.execute<any[]>(
    `SELECT u.IdUsuario, u.IdRol, u.Nombres, u.Apellidos,
            u.Correo, u.Usuario, u.Clave, u.Estado,
            r.NombreRol
     FROM Usuarios u
     INNER JOIN Roles r ON u.IdRol = r.IdRol
     WHERE u.Usuario = ? OR u.Correo = ?`,
    [nombreUsuario, nombreUsuario]  // ← mismo valor, dos veces
  );

  if (rows.length === 0) return null;

  return rows[0] as UsuarioAuth;
};
