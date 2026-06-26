// app/login/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, LoginFormValues } from '@/validations/auth.validations';
import { useLogin } from '@/hooks/useLogin';
import { Eye, EyeOff, Loader2 } from 'lucide-react'; // O usa íconos de tu librería preferida

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: '',
      contrasena: '',
    },
    mode: 'onBlur', // Valida en blur para mejor UX
  });

  // Verificar si la sesión expiró
  useEffect(() => {
    const expired = searchParams.get('session') === 'expired';
    if (expired) {
      setSessionExpired(true);
      // Limpiar después de 5 segundos
      const timer = setTimeout(() => setSessionExpired(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  async function onSubmit(data: LoginFormValues) {
    clearErrors(); // Limpiar errores previos
    
    try {
      const response = await login(data);

      if (response) {
        // Redirigir al dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      // Manejar errores específicos
      if (err instanceof Error) {
        setError('root', {
          message: err.message || 'Error al iniciar sesión. Intente nuevamente.',
        });
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        {/* Logo o icono */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenido
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Mensaje de sesión expirada */}
        {sessionExpired && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 animate-fadeIn">
            <p className="text-sm text-yellow-700 text-center">
              ⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Correo electrónico o usuario */}
          <div>
            <label
              htmlFor="correo"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico o usuario <span className="text-red-500">*</span>
            </label>

            <input
              id="correo"
              type="email"
              autoComplete="username"
              {...register('correo')}
              placeholder="ejemplo@correo.com"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                errors.correo
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              disabled={isLoading}
            />

            {errors.correo && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                {errors.correo.message}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="contrasena"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña <span className="text-red-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => router.push('/auth/forgot-password')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="relative">
              <input
                id="contrasena"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('contrasena')}
                placeholder="••••••••"
                className={`w-full rounded-lg border px-4 py-2.5 pr-12 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-1 ${
                  errors.contrasena
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {errors.contrasena && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                {errors.contrasena.message}
              </p>
            )}
          </div>

          {/* Error del servidor */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 animate-shake">
              <p className="text-center text-sm text-red-600 flex items-center justify-center gap-2">
                <span className="text-red-500">✕</span>
                {error}
              </p>
            </div>
          )}

          {/* Error root del formulario */}
          {errors.root && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 animate-shake">
              <p className="text-center text-sm text-red-600 flex items-center justify-center gap-2">
                <span className="text-red-500">✕</span>
                {errors.root.message}
              </p>
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>

          {/* Separador y enlace a registro */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/auth/register')}
            className="w-full rounded-lg border-2 border-gray-300 bg-transparent py-2.5 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
          >
            Crear cuenta nueva
          </button>
        </form>

        {/* Versión del sistema (opcional) */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Sistema de Gestión v1.0.0
          </p>
        </div>
      </section>
    </main>
  );
}