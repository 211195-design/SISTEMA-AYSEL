import * as repo from '../repositories/clientes.repository';

export const listarClientes = async () =>
  repo.getAllClientes();

export const obtenerCliente = async (id: number) => {
  const cliente = await repo.getClienteById(id);

  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  return cliente;
};

export const historialCliente = async (id: number) => {
  const cliente = await repo.getClienteById(id);

  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  const historial = await repo.getHistorialCliente(id);

  return {
    cliente,
    historial
  };
};

export const crearCliente = async (data: any) => {

  const {
    Nombres,
    Apellidos,
    DNI,
    Telefono,
    Email
  } = data;

  if (!Nombres || !Apellidos || !DNI) {
    throw new Error(
      'Nombres, Apellidos y DNI son requeridos'
    );
  }

  if (!/^\d{8}$/.test(DNI)) {
    throw new Error(
      'El DNI debe contener 8 dígitos'
    );
  }

  if (
    Telefono &&
    !/^\d{9}$/.test(Telefono)
  ) {
    throw new Error(
      'El teléfono debe contener 9 dígitos'
    );
  }

  if (
    Email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)
  ) {
    throw new Error(
      'Correo electrónico inválido'
    );
  }

  const existe = await repo.buscarPorDNI(DNI);

  if (existe) {
    throw new Error(
      `Ya existe un cliente con DNI ${DNI}`
    );
  }

  const id = await repo.createCliente(data);

  return await repo.getClienteById(id);
};

export const editarCliente = async (
  id: number,
  data: any
) => {

  const {
    Nombres,
    Apellidos,
    DNI,
    Telefono,
    Email
  } = data;

  if (!Nombres || !Apellidos || !DNI) {
    throw new Error(
      'Nombres, Apellidos y DNI son requeridos'
    );
  }

  if (!/^\d{8}$/.test(DNI)) {
    throw new Error(
      'El DNI debe contener 8 dígitos'
    );
  }

  if (
    Telefono &&
    !/^\d{9}$/.test(Telefono)
  ) {
    throw new Error(
      'El teléfono debe contener 9 dígitos'
    );
  }

  if (
    Email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)
  ) {
    throw new Error(
      'Correo electrónico inválido'
    );
  }

  await repo.updateCliente(id, data);

  return await repo.getClienteById(id);
};

export const cambiarEstado = async (
  id: number,
  estado: number
) => {

  await repo.toggleEstadoCliente(
    id,
    estado
  );

  return await repo.getClienteById(id);
};

export const buscarDNI = async (
  dni: string
) => {

  const cliente =
    await repo.buscarPorDNI(dni);

  if (!cliente) {
    throw new Error(
      'Cliente no encontrado'
    );
  }

  return cliente;
};