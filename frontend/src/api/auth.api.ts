import { ILoginRequest, ILoginResponse } from '@/types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginApi(data: ILoginRequest): Promise<ILoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      NombreUsuario: data.correo,   // ← mapeo aquí
      Contrasena: data.contrasena,  // ← mapeo aquí
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.mensaje || 'Error al iniciar sesión');  // ← backend usa "mensaje" no "message"
  }

  return response.json();
}
