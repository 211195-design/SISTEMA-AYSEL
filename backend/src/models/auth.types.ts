export interface UsuarioAuth {
  IdUsuario : number;
  IdRol     : number;
  NombreRol : string;
  Nombres   : string;
  Apellidos : string;
  Correo    : string;
  Usuario   : string;
  Clave     : string;
  Estado    : number;
}

export interface ILoginRequest {
  NombreUsuario : string;
  Contrasena    : string;
}

export interface ILoginResponse {
  token   : string;
  usuario : {
    IdUsuario : number;
    Usuario   : string;
    Nombres   : string;
    Correo    : string;
    NombreRol : string;
  };
}
