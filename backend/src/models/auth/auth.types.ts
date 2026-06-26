export interface IUsuario {
  IdUsuario: number;
  NombreUsuario: string;
  Contrasena: string;
  IdRol: number;
  NombreRol?: string;
  Activo: boolean;
}

export interface ILoginRequest {
  NombreUsuario: string;
  Contrasena: string;
}

export interface ILoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    rol: string;
  };
}
