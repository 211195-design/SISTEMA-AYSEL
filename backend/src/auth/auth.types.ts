export interface LoginDTO {
  usuario: string;
  clave   : string;
}

export interface UsuarioAuth {
  IdUsuario : number;
  Nombres   : string;
  Apellidos : string;
  Usuario   : string;
  Clave     : string;
  Estado    : boolean;
  NombreRol : string;
}

export interface RespuestaLogin {
  token  : string;
  usuario: {
    id       : number;
    nombres  : string;
    apellidos: string;
    rol      : string;
  };
}
