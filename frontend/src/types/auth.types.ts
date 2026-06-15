// src/types/auth.types.ts

export interface ILoginRequest {
  correo: string;
  contrasena: string;
}

export interface IUsuarioAuth {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export interface ILoginResponse {
  token: string;
  usuario: IUsuarioAuth;
}
