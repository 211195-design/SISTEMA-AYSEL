import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'aysel_secret_2026';

export interface JwtPayload {
  IdUsuario: number;
  IdRol    : number;
  Nombres  : string;  // ← nuevo
  Correo   : string;  // ← nuevo
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};
