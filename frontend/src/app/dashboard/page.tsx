// src/app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFromToken, logout } from '@/lib/auth';

interface Usuario {
  nombre: string;
  correo: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const data = getUserFromToken();
    if (!data) {
      router.push('/login');
      return;
    }
    setUsuario(data);
  }, [router]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (!usuario) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Panel de Control</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{usuario.correo}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido */}
      <section className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Bienvenida */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Bienvenido, {usuario.nombre} 👋
            </h2>
            <p className="text-gray-500 mt-1">
              Estás dentro del sistema. Todo funciona correctamente.
            </p>
          </div>

          {/* Cards de ejemplo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Productos', valor: '—', color: 'bg-blue-50 text-blue-600' },
              { label: 'Ventas', valor: '—', color: 'bg-green-50 text-green-600' },
              { label: 'Usuarios', valor: '—', color: 'bg-purple-50 text-purple-600' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-2xl shadow-sm p-6">
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className={`text-3xl font-bold mt-2 ${card.color}`}>
                  {card.valor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
