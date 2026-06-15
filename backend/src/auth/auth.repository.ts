import db from '../../database/connection';
import { UsuarioAuth } from './auth.types';

export const buscarPorUsuario = (usuario: string): Promise<UsuarioAuth | undefined> =>
  new Promise((resolve, reject) => {
    db.query<any[]>(
      `SELECT 
         u.IdUsuario,
         u.Nombres,
         u.Apellidos,
         u.Usuario,
         u.Clave,
         u.Estado,
         r.NombreRol
       FROM Usuarios u
       INNER JOIN Roles r ON r.IdRol = u.IdRol
       WHERE u.Usuario = ? AND u.Estado = TRUE`,
      [usuario],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0]);
      }
    );
  });
