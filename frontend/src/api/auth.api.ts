import { ILoginRequest, ILoginResponse } from '@/types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginApi(data: ILoginRequest): Promise<ILoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      NombreUsuario: data.correo,
      Contrasena: data.contrasena,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.mensaje || 'Error al iniciar sesión');
  }

  const json = await response.json();
  return json.data; // ← único cambio
}
