import * as repo from '../repositories/configuracion.repository';

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
export const listarCategorias  = async () => repo.getCategorias();

export const crearCategoria = async (data: any) => {
  if (!data.NombreCategoria?.trim()) throw new Error('El nombre de la categoría es requerido');
  const id = await repo.createCategoria({ NombreCategoria: data.NombreCategoria.trim(), Descripcion: data.Descripcion?.trim() ?? '' });
  return { IdCategoria: id, ...data };
};

export const editarCategoria = async (id: number, data: any) => {
  if (!data.NombreCategoria?.trim()) throw new Error('El nombre de la categoría es requerido');
  await repo.updateCategoria(id, { NombreCategoria: data.NombreCategoria.trim(), Descripcion: data.Descripcion?.trim() ?? '' });
};

export const eliminarCategoria = async (id: number) => {
  const ok = await repo.deleteCategoria(id);
  if (!ok) throw new Error('No se pudo eliminar. Puede estar en uso por algún producto');
};

// ─── TALLAS ───────────────────────────────────────────────────────────────────
export const listarTallas  = async () => repo.getTallas();

export const crearTalla = async (nombre: string) => {
  if (!nombre?.trim()) throw new Error('El nombre de la talla es requerido');
  return repo.createTalla(nombre.trim());
};

export const editarTalla = async (id: number, nombre: string) => {
  if (!nombre?.trim()) throw new Error('El nombre de la talla es requerido');
  await repo.updateTalla(id, nombre.trim());
};

export const eliminarTalla = async (id: number) => {
  const ok = await repo.deleteTalla(id);
  if (!ok) throw new Error('No se pudo eliminar. Puede estar en uso en el inventario');
};

// ─── COLORES ──────────────────────────────────────────────────────────────────
export const listarColores  = async () => repo.getColores();

export const crearColor = async (nombre: string) => {
  if (!nombre?.trim()) throw new Error('El nombre del color es requerido');
  return repo.createColor(nombre.trim());
};

export const editarColor = async (id: number, nombre: string) => {
  if (!nombre?.trim()) throw new Error('El nombre del color es requerido');
  await repo.updateColor(id, nombre.trim());
};

export const eliminarColor = async (id: number) => {
  const ok = await repo.deleteColor(id);
  if (!ok) throw new Error('No se pudo eliminar. Puede estar en uso en el inventario');
};

// ─── FORMAS DE PAGO ───────────────────────────────────────────────────────────
export const listarFormasPago  = async () => repo.getFormasPago();

export const crearFormaPago = async (nombre: string) => {
  if (!nombre?.trim()) throw new Error('El nombre de la forma de pago es requerido');
  return repo.createFormaPago(nombre.trim());
};

export const editarFormaPago = async (id: number, nombre: string) => {
  if (!nombre?.trim()) throw new Error('El nombre de la forma de pago es requerido');
  await repo.updateFormaPago(id, nombre.trim());
};

export const eliminarFormaPago = async (id: number) => {
  const ok = await repo.deleteFormaPago(id);
  if (!ok) throw new Error('No se pudo eliminar. Puede estar en uso en ventas');
};

// ─── ROLES ────────────────────────────────────────────────────────────────────
export const listarRoles  = async () => repo.getRoles();

export const crearRol = async (nombre: string) => {
  if (!nombre?.trim()) throw new Error('El nombre del rol es requerido');
  return repo.createRol(nombre.trim());
};

export const editarRol = async (id: number, nombre: string) => {
  if (!nombre?.trim()) throw new Error('El nombre del rol es requerido');
  await repo.updateRol(id, nombre.trim());
};

export const eliminarRol = async (id: number) => {
  const ok = await repo.deleteRol(id);
  if (!ok) throw new Error('No se pudo eliminar. Puede estar asignado a usuarios');
};
