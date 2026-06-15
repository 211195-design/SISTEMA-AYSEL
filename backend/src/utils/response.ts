import { Response } from 'express';

export const success = (
  res: Response,
  data: unknown,
  mensaje = 'OK',
  codigo = 200
): void => {
  res.status(codigo).json({ ok: true, mensaje, data });
};

export const error = (
  res: Response,
  mensaje = 'Error interno',
  codigo = 500
): void => {
  res.status(codigo).json({ ok: false, mensaje });
};
