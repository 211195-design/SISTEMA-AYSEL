import { Request, Response } from 'express';
import { loginService } from '../services/auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { NombreUsuario, Contrasena } = req.body;

    if (!NombreUsuario || !Contrasena) {
      res.status(400).json({
        ok: false,
        mensaje: 'NombreUsuario y Contrasena son requeridos',
      });
      return;
    }

    const resultado = await loginService({ NombreUsuario, Contrasena });

    res.status(200).json({
      ok: true,
      mensaje: 'Login exitoso',
      data: resultado,
    });
  } catch (error: any) {
    res.status(401).json({
      ok: false,
      mensaje: error.message || 'Error al iniciar sesión',
    });
  }
};
