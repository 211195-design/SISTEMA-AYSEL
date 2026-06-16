import { Request, Response } from 'express';
import { login }             from './auth.service';
import { success, error }    from '../../utils/response';

export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const datos = await login(req.body);
    success(res, datos, 'Inicio de sesión exitoso');
  } catch (err: any) {
    error(res, err.message, 401);
  }
};
