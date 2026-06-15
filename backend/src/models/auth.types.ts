// src/models/auth.types.ts

export interface ILoginRequest {
  NombreUsuario: string;
  Contrasena   : string;
}

export interface UsuarioAuth {
  IdUsuario : number;
  IdRol     : number;
  Nombres   : string;
  Apellidos : string;
  Correo    : string;
  Usuario   : string;
  Clave     : string;
  Estado    : number;
  NombreRol : string;
}

export interface ILoginResponse {
  token  : string;
  usuario: {
    IdUsuario : number;
    Usuario   : string;
    NombreRol : string;
    Nombres   : string;
    Correo    : string;
  };
}
