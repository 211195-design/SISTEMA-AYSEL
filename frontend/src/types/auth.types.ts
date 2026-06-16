export interface ILoginRequest {
  correo: string;
  contrasena: string;
}

export interface IUsuarioAuth {
  IdUsuario: number;
  Usuario: string;
  Nombres: string;
  Correo: string;
  NombreRol: string;
}

export interface ILoginResponse {
  token: string;
  usuario: IUsuarioAuth;
}
