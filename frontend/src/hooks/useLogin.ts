// src/hooks/useLogin.ts

import { useState } from 'react';
import { loginApi } from '@/api/auth.api';
import { ILoginRequest } from '@/types/auth.types';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(data: ILoginRequest) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginApi(data);
      console.log('✅ Respuesta del backend:', response);

      // Guardar cookie
      document.cookie = `token=${response.token}; path=/; max-age=${60 * 60 * 8}`;

      // Pequeña pausa para que el navegador registre la cookie antes de redirigir
      await new Promise((resolve) => setTimeout(resolve, 100));

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error };
}
