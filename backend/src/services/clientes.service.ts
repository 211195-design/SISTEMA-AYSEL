import * as repo from '../repositories/clientes.repository';

export const listarClientes = async () => repo.getAllClientes();

export const obtenerCliente = async (id: number) => {
  const c = await repo.getClienteById(id);
  if (!c) throw new Error('Cliente no encontrado');
  return c;
};

export const historialCliente = async (id: number) => {
  const c = await repo.getClienteById(id);
  if (!c) throw new Error('Cliente no encontrado');
  const historial = await repo.getHistorialCliente(id);
  return { cliente: c, historial };
};

export const crearCliente = async (data: any) => {
  if (!data.Nombres || !data.Apellidos || !data.DNI)
    throw new Error('Nombres, Apellidos y DNI son requeridos');
  const existe = await repo.buscarPorDNI(data.DNI);
  if (existe) throw new Error(`Ya existe un cliente con DNI ${data.DNI}`);
  const id = await repo.createCliente(data);
  return repo.getClienteById(id);
};

export const editarCliente = async (id: number, data: any) => {
  if (!data.Nombres || !data.Apellidos || !data.DNI)
    throw new Error('Nombres, Apellidos y DNI son requeridos');
  await repo.updateCliente(id, data);
  return repo.getClienteById(id);
};

export const cambiarEstado = async (id: number, estado: number) => {
  await repo.toggleEstadoCliente(id, estado);
  return repo.getClienteById(id);
};

export const buscarDNI = async (dni: string) => {
  const c = await repo.buscarPorDNI(dni);
  if (!c) throw new Error('Cliente no encontrado');
  return c;
};

export const crearClienteRapido = async (data: any) => {
  if (!data.DNI || !data.Nombres)
    throw new Error('DNI y Nombres son requeridos');
  const existe = await repo.getClienteByDNI(data.DNI);
  if (existe) return existe;
  const id = await repo.createClienteRapido(data);
  return repo.getClienteById(id);
};

export const buscarPorDNI = async (dni: string) =>
  repo.getClienteByDNI(dni);
