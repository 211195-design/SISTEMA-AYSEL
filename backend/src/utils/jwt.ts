import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'aysel_secret_2026';

export interface JwtPayload {
  IdUsuario : number;
  IdRol     : number;
  NombreRol : string;   // ← nuevo
  Nombres   : string;
  Correo    : string;   // ← nuevo
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, SECRET) as JwtPayload;
};
