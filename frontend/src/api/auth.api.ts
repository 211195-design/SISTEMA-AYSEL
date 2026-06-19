import { apiFetch } from '@/lib/api-client';
import { ILoginRequest, ILoginResponse } from '@/types/auth.types';

export async function loginApi(data: ILoginRequest): Promise<ILoginResponse> {
  const json = await apiFetch<{ ok: boolean; data: ILoginResponse }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      NombreUsuario: data.correo,
      Contrasena: data.contrasena,
    }),
  });
  return json.data;
}