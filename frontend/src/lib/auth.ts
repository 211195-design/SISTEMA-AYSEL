// src/lib/auth.ts

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getUserFromToken(): {
  nombre: string;
  correo: string;
  rol: string;
  id: number;
} | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      nombre: payload.Nombres   ?? payload.nombre   ?? 'Usuario',
      correo: payload.Correo    ?? payload.correo    ?? '',
      rol:    payload.NombreRol ?? payload.rol       ?? 'Vendedor',
      id:     payload.IdUsuario ?? payload.id        ?? 0,
    };
  } catch {
    return null;
  }
}

export function logout() {
  document.cookie = 'token=; Max-Age=0; path=/';
}
