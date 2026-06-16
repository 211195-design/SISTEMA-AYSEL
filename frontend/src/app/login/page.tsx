
// app/login/page.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, LoginFormValues } from '@/validations/auth.validations';
import { useLogin } from '@/hooks/useLogin';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormValues) {
    const response = await login(data);
    if (response) {
      router.push('/dashboard');
    }
  }

  return (
  <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-10">

      {/* Logo */}
      <div className="flex justify-center">
        <img
          src="/logo.png"
          alt="Logo Aysel"
          className="w-36 h-36 object-contain"
        />
      </div>

      {/* Título */}
      <div className="text-center mt-4">
        <h1 className="text-5xl font-bold text-gray-900">
          Tienda Aysel
        </h1>

        <p className="text-gray-600 text-xl mt-3">
          Sistema de Facturación e Inventario
        </p>
      </div>

      {/* Roles */}
      <div className="flex justify-center gap-20 mt-10 border-b">
        <button
          type="button"
          className="pb-3 border-b-4 border-blue-500 text-blue-600 font-medium text-xl"
        >
          🏪 VENDEDOR
        </button>

        <button
          type="button"
          className="pb-3 text-gray-500 font-medium text-xl"
        >
          👨‍💼 ADMINISTRADOR
        </button>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 mt-10"
      >
        <div>
          <input
            type="text"
            {...register('correo')}
            placeholder="Correo electrónico *"
            className="w-full border border-gray-300 rounded-md px-5 py-5 text-lg"
          />

          {errors.correo && (
            <p className="text-red-500 text-sm mt-1">
              {errors.correo.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register('contrasena')}
            placeholder="Contraseña *"
            className="w-full border border-gray-300 rounded-md px-5 py-5 text-lg"
          />

          {errors.contrasena && (
            <p className="text-red-500 text-sm mt-1">
              {errors.contrasena.message}
            </p>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-5 rounded-md text-white text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition"
        >
          {isLoading
            ? 'Ingresando...'
            : 'INICIAR SESIÓN'}
        </button>
      </form>
    </div>
  </main>
 );
}
