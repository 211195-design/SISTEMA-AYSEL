// src/lib/auth.ts

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getUserFromToken(): { nombre: string; correo: string } | null {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      nombre: payload.Nombres ?? payload.nombre ?? 'Usuario', // ← mayúscula primero
      correo: payload.Correo  ?? payload.correo  ?? '',       // ← mayúscula primero
    };
  } catch {
    return null;
  }
}

export function logout(): void {
  document.cookie = 'token=; path=/; max-age=0';
}
