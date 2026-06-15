import bcrypt from 'bcrypt';
import { findUsuarioByNombre } from '../repositories/auth.repository';
import { ILoginRequest, ILoginResponse } from '../models/auth.types';
import { generateToken } from '../utils/jwt';

export const loginService = async (
  credentials: ILoginRequest
): Promise<ILoginResponse> => {
  const usuario = await findUsuarioByNombre(credentials.NombreUsuario);

  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }

  const passwordValida = await bcrypt.compare(
    credentials.Contrasena,
    usuario.Clave
  );

  if (!passwordValida) {
    throw new Error('Credenciales inválidas');
  }

  if (usuario.Estado === 0) {
    throw new Error('Usuario inactivo');
  }

  const token = generateToken({
    IdUsuario: usuario.IdUsuario,
    IdRol: usuario.IdRol,
    Nombres: usuario.Nombres,   // ← nuevo
    Correo: usuario.Correo,     // ← nuevo
  });

  return {
    token,
    usuario: {
      IdUsuario: usuario.IdUsuario,
      Usuario: usuario.Usuario,
      NombreRol: usuario.NombreRol,
      Nombres: usuario.Nombres,  // ← nuevo
      Correo: usuario.Correo,    // ← nuevo
    },
  };
};
