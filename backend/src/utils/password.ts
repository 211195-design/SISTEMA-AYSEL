import bcrypt from 'bcrypt';

export const hashear    = (clave: string): Promise<string> =>
  bcrypt.hash(clave, 10);

export const comparar   = (clave: string, hash: string): Promise<boolean> =>
  bcrypt.compare(clave, hash);
