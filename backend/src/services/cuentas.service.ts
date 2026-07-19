import * as repo from '../repositories/cuentas.repository';

export const listarCuentas = async () => repo.getAllCuentas();
export const listarCuentasActivas = async () => repo.getCuentasActivas();

export const obtenerCuenta = async (id: number) => {
  const cuenta = await repo.getCuentaById(id);
  if (!cuenta) throw new Error('Cuenta no encontrada');
  return cuenta;
};

export const crearCuenta = async (body: any) => {
  const { TipoCuenta, Titular, NumeroCuenta, CCI } = body;
  if (!TipoCuenta || !Titular || !NumeroCuenta)
    throw new Error('Tipo, titular y número de cuenta son requeridos');
  return repo.createCuenta({ TipoCuenta, Titular, NumeroCuenta, CCI });
};

export const actualizarCuenta = async (id: number, body: any) => {
  const { TipoCuenta, Titular, NumeroCuenta, CCI } = body;
  if (!TipoCuenta || !Titular || !NumeroCuenta)
    throw new Error('Tipo, titular y número de cuenta son requeridos');
  await repo.updateCuenta(id, { TipoCuenta, Titular, NumeroCuenta, CCI });
  return repo.getCuentaById(id);
};

export const cambiarEstadoCuenta = async (id: number, estado: boolean) => {
  await repo.toggleEstadoCuenta(id, estado);
  return repo.getCuentaById(id);
};

export const eliminarCuenta = async (id: number) => {
  const cuenta = await repo.getCuentaById(id);
  if (!cuenta) throw new Error('Cuenta no encontrada');
  await repo.deleteCuenta(id);
};