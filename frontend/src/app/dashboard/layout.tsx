<<<<<<< HEAD
'use client';
=======
﻿'use client';
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserFromToken, logout } from '@/lib/auth';
import Link from 'next/link';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
<<<<<<< HEAD
  BarChart2, Users, UserCog, LogOut
} from 'lucide-react';

import { Bolt } from "lucide-react";
=======
  BarChart2, Users, UserCog, LogOut, Tag
} from 'lucide-react';



import { Bolt } from "lucide-react";
import Image from 'next/image';

>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de

const menuItems = [
  {
    label: "Configuración",
    href: "/dashboard/configuracion",
    icon: Bolt,
  },
];
const navItems = [
  { label: 'Dashboard',  href: '/dashboard',            icon: LayoutDashboard },
  { label: 'Productos',  href: '/dashboard/productos',  icon: Package },
  { label: 'Inventario', href: '/dashboard/inventario', icon: Warehouse },
  { label: 'Ventas',     href: '/dashboard/ventas',     icon: ShoppingCart },
  { label: 'Reportes',   href: '/dashboard/reportes',   icon: BarChart2 },
  { label: 'Clientes',   href: '/dashboard/clientes',   icon: Users },
  { label: 'Usuarios',   href: '/dashboard/usuarios',   icon: UserCog },
  { label:  'Configuración', href: '/dashboard/configuracion', icon: Bolt },
<<<<<<< HEAD
=======
  { label: 'Promociones', href: '/dashboard/promociones', icon: Tag  },
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<{ nombre: string; correo: string } | null>(null);

  useEffect(() => {
    const data = getUserFromToken();
    if (!data) { router.push('/login'); return; }
    setUsuario(data);
  }, [router]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (!usuario) return null;

  const initials = usuario.nombre?.charAt(0).toUpperCase() ?? 'A';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

<<<<<<< HEAD
      {/* ── Sidebar ── */}
=======
      {/* â”€â”€ Sidebar â”€â”€ */}
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
      <aside className="w-56 bg-white flex flex-col shadow-md shrink-0">

        {/* Logo */}
        <div className="flex flex-col items-center py-6 border-b border-gray-100">
<<<<<<< HEAD
          <div className="w-14 h-14 rounded-full border-2 border-purple-200 flex items-center justify-center bg-purple-50 mb-2">
            <span className="text-purple-600 font-bold text-lg">A</span>
=======
          <div className="w-14 h-14 rounded-full border-2 border-yellow-400 flex items-center justify-center bg-yellow-50 mb-2 overflow-hidden">
            <Image src="/aysel.jpeg" alt="Logo Tienda Aysel" width={56} height={56} className="object-cover" />
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
          </div>
          <p className="text-sm font-bold text-gray-800">Tienda Aysel</p>
          <p className="text-xs text-gray-400">Panel Administrador</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${active
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={17} />
<<<<<<< HEAD
            Cerrar sesión
=======
            Cerrar sesion
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
          </button>
        </div>
      </aside>

<<<<<<< HEAD
      {/* ── Main ── */}
=======
      {/* â”€â”€ Main â”€â”€ */}
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between shrink-0">
          <p className="text-sm font-semibold text-gray-700">
<<<<<<< HEAD
            Tienda Aysel — <span className="text-gray-400 font-normal">Administrador</span>
=======
            Tienda Aysel â€” <span className="text-gray-400 font-normal">Administrador</span>
>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
          </p>
          <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======




>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
