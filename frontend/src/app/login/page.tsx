// frontend/src/app/login/page.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, LoginFormValues } from '@/validations/auth.validations';
import { useLogin } from '@/hooks/useLogin';
import { Mail, Lock, User, Shield, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'vendedor' | 'administrador'>('vendedor');

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
  });

  async function onSubmit(data: LoginFormValues) {
    clearErrors();
    
    try {
      const response = await login({
        ...data,
        role: selectedRole,
      });

      if (response) {
        router.push('/dashboard');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError('root', {
          message: err.message || 'Error al iniciar sesión. Intente nuevamente.',
        });
      }
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo con tu imagen aysel.jpeg */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden bg-white p-2 border-2 border-blue-100">
              <Image
                src="/aysel.jpeg"
                alt="Tienda Aysel"
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            Tienda <span className="text-blue-600">Aysel</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium flex items-center justify-center gap-1">
            <span className="inline-block w-1 h-1 bg-blue-500 rounded-full"></span>
            Sistema de Facturación e Inventario
            <span className="inline-block w-1 h-1 bg-blue-500 rounded-full"></span>
          </p>
        </div>

        {/* Selector de roles */}
        <div className="bg-white rounded-2xl shadow-lg p-1.5 mb-6 border border-gray-100">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setSelectedRole('vendedor')}
              className={`py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'vendedor'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              VENDEDOR
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('administrador')}
              className={`py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'administrador'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-transparent text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              ADMINISTRADOR
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Correo electrónico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  autoComplete="username"
                  {...register('correo')}
                  placeholder="correo@ejemplo.com"
                  className={`w-full rounded-xl border pl-11 pr-4 py-3 text-sm outline-none transition ${
                    errors.correo
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.correo && (
                <p className="mt-1.5 text-xs text-red-500">{errors.correo.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('contrasena')}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border pl-11 pr-12 py-3 text-sm outline-none transition ${
                    errors.contrasena
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.contrasena && (
                <p className="mt-1.5 text-xs text-red-500">{errors.contrasena.message}</p>
              )}
            </div>

            {/* Error del servidor */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-center text-sm text-red-600">{error}</p>
              </div>
            )}
            {errors.root && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-center text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {/* Botón INICIAR SESIÓN */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Cargando...
                </span>
              ) : (
                'INICIAR SESIÓN'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Sistema de Facturación e Inventario
          </p>
        </div>
      </div>
    </main>
  );
}