import pool from '../config/database';

export const getAllCuentas = async () => {
  const [rows]: any = await pool.query(
    `SELECT * FROM cuentaspago ORDER BY Estado DESC, TipoCuenta ASC`
  );
  return rows;
};

export const getCuentasActivas = async () => {
  const [rows]: any = await pool.query(
    `SELECT * FROM cuentaspago WHERE Estado = 1 ORDER BY TipoCuenta ASC`
  );
  return rows;
};

export const getCuentaById = async (id: number) => {
  const [rows]: any = await pool.query(
    `SELECT * FROM cuentaspago WHERE IdCuenta = ?`, [id]
  );
  return rows[0] ?? null;
};

export const createCuenta = async (data: {
  TipoCuenta: string; Titular: string; NumeroCuenta: string; CCI?: string;
}) => {
  const [result]: any = await pool.query(`
    INSERT INTO cuentaspago (TipoCuenta, Titular, NumeroCuenta, CCI, Estado)
    VALUES (?, ?, ?, ?, 1)
  `, [data.TipoCuenta, data.Titular, data.NumeroCuenta, data.CCI ?? null]);
  return result.insertId;
};

export const updateCuenta = async (id: number, data: {
  TipoCuenta: string; Titular: string; NumeroCuenta: string; CCI?: string;
}) => {
  await pool.query(`
    UPDATE cuentaspago
    SET TipoCuenta = ?, Titular = ?, NumeroCuenta = ?, CCI = ?
    WHERE IdCuenta = ?
  `, [data.TipoCuenta, data.Titular, data.NumeroCuenta, data.CCI ?? null, id]);
};

export const toggleEstadoCuenta = async (id: number, estado: boolean) => {
  await pool.query(
    `UPDATE cuentaspago SET Estado = ? WHERE IdCuenta = ?`,
    [estado ? 1 : 0, id]
  );
};

export const deleteCuenta = async (id: number) => {
  await pool.query(`DELETE FROM cuentaspago WHERE IdCuenta = ?`, [id]);
};