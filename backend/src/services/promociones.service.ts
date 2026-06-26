import * as repo from '../repositories/promociones.repository';

export const listarPromociones = async () => repo.getAllPromociones();

export const obtenerPromocion = async (id: number) => {
  const p = await repo.getPromocionById(id);
  if (!p) throw new Error('Promoción no encontrada');
  const clientes = await repo.getClientesDePromocion(id);
  return { ...p, clientes };
};

export const crearPromocion = async (data: any) => {
  if (!data.NombrePromocion?.trim()) throw new Error('El nombre es requerido');
  if (!data.Descuento || data.Descuento <= 0 || data.Descuento > 100)
    throw new Error('El descuento debe estar entre 1 y 100');
  if (!data.FechaInicio || !data.FechaFin)
    throw new Error('Las fechas son requeridas');
  if (data.FechaInicio > data.FechaFin)
    throw new Error('La fecha de inicio no puede ser mayor a la fecha fin');

  const id = await repo.createPromocion(data);
  return repo.getPromocionById(id);
};

export const editarPromocion = async (id: number, data: any) => {
  if (!data.NombrePromocion?.trim()) throw new Error('El nombre es requerido');
  if (!data.Descuento || data.Descuento <= 0 || data.Descuento > 100)
    throw new Error('El descuento debe estar entre 1 y 100');
  if (data.FechaInicio > data.FechaFin)
    throw new Error('La fecha de inicio no puede ser mayor a la fecha fin');
  await repo.updatePromocion(id, data);
  return repo.getPromocionById(id);
};

export const cambiarEstado = async (id: number, estado: number) => {
  await repo.toggleEstadoPromocion(id, estado);
  return repo.getPromocionById(id);
};

export const asignarCliente = async (idPromocion: number, idCliente: number) => {
  const p = await repo.getPromocionById(idPromocion);
  if (!p) throw new Error('Promoción no encontrada');
  await repo.asignarCliente(idPromocion, idCliente);
};

export const quitarCliente = async (idPromocion: number, idCliente: number) => {
  await repo.quitarCliente(idPromocion, idCliente);
};

export const eliminarPromocion = async (id: number) => {
  await repo.deletePromocion(id);
};

export const promocionesDeCliente = async (idCliente: number) =>
  repo.getPromocionesActivasDeCliente(idCliente);