import * as repo from '../repositories/usuarios.repository';
import bcrypt from 'bcrypt';

export const listarUsuarios = async () => repo.getAllUsuarios();

export const obtenerUsuario = async (id: number) => {
  const u = await repo.getUsuarioById(id);
  if (!u) throw new Error('Usuario no encontrado');
  return u;
};

export const crearUsuario = async (data: any) => {
  if (!data.Nombres || !data.Apellidos || !data.Usuario || !data.Correo || !data.Clave || !data.IdRol)
    throw new Error('Todos los campos obligatorios son requeridos');

  const existeUsuario = await repo.getUsuarioByUsuario(data.Usuario);
  if (existeUsuario) throw new Error(`El usuario "${data.Usuario}" ya está en uso`);

  const existeCorreo = await repo.getUsuarioByCorreo(data.Correo);
  if (existeCorreo) throw new Error(`El correo "${data.Correo}" ya está registrado`);

  const hash = await bcrypt.hash(data.Clave, 10);
  const id   = await repo.createUsuario({ ...data, Clave: hash });
  return repo.getUsuarioById(id);
};

export const editarUsuario = async (id: number, data: any, idSolicitante: number) => {
  if (!data.Nombres || !data.Apellidos || !data.Usuario || !data.Correo || !data.IdRol)
    throw new Error('Todos los campos obligatorios son requeridos');

  // Verificar duplicados excluyendo al propio usuario
  const existeUsuario = await repo.getUsuarioByUsuario(data.Usuario);
  if (existeUsuario && existeUsuario.IdUsuario !== id)
    throw new Error(`El usuario "${data.Usuario}" ya está en uso`);

  const existeCorreo = await repo.getUsuarioByCorreo(data.Correo);
  if (existeCorreo && existeCorreo.IdUsuario !== id)
    throw new Error(`El correo "${data.Correo}" ya está registrado`);

  await repo.updateUsuario(id, data);
  return repo.getUsuarioById(id);
};

export const cambiarClave = async (id: number, claveActual: string, claveNueva: string) => {
  const [rows]: any = await import('../config/database').then(m =>
    m.default.query(`SELECT Clave FROM usuarios WHERE IdUsuario = ?`, [id])
  );
  const usuario = rows[0];
  if (!usuario) throw new Error('Usuario no encontrado');

  const valida = await bcrypt.compare(claveActual, usuario.Clave);
  if (!valida) throw new Error('La contraseña actual es incorrecta');

  if (claveNueva.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres');

  const hash = await bcrypt.hash(claveNueva, 10);
  await repo.updateClave(id, hash);
};

export const resetClave = async (id: number, claveNueva: string) => {
  if (claveNueva.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
  const hash = await bcrypt.hash(claveNueva, 10);
  await repo.updateClave(id, hash);
};

export const cambiarEstado = async (id: number, estado: number, idSolicitante: number) => {
  if (id === idSolicitante) throw new Error('No puedes desactivar tu propia cuenta');
  await repo.toggleEstadoUsuario(id, estado);
  return repo.getUsuarioById(id);
};

export const listarRoles = async () => repo.getAllRoles();
