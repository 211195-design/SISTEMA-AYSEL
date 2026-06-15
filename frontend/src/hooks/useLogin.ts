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
      // Guardar token en cookie (accesible por el middleware)
      document.cookie = `token=${response.token}; path=/; max-age=${60 * 60 * 8}`;
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
