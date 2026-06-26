'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserFromToken, logout } from '@/lib/auth';
import Link from 'next/link';
import { LayoutDashboard, ShoppingCart, FileText, Package, Users, LogOut,BarChart2 } from 'lucide-react';
import Image from 'next/image';



const navItems = [
  { label: 'Dashboard',      href: '/pos/dashboard',     icon: LayoutDashboard   },
  { label: 'Punto de Venta', href: '/pos',               icon: ShoppingCart },
  { label: 'Comprobantes',   href: '/pos/comprobantes',   icon: FileText },
  { label: 'Inventario',     href: '/pos/inventario',     icon: Package },
  { label: 'Clientes',       href: '/pos/clientes',       icon: Users },
  { label: 'Reportes',       href: '/pos/reportes',     icon: BarChart2   },
  
];

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ nombre: string; correo: string; rol: string; id: number } | null>(null);

  useEffect(() => {
    const u = getUserFromToken();
    if (!u) { router.replace('/login'); return; }
    setUser(u);
  }, []);

  const handleLogout = () => { logout(); router.replace('/login'); };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-sm flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <Image src="/aysel.jpeg" alt="Logo Tienda Aysel" width={56} height={56} className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">Tienda Aysel</p>
              <p className="text-xs text-gray-400 truncate">Panel Vendedor</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href;
            const Icon   = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}>
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Usuario + logout */}
        <div className="p-3 border-t border-gray-100">
          {user && (
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-medium text-gray-700 truncate">{user.nombre}</p>
              <p className="text-xs text-gray-400 truncate">{user.rol}</p>
            </div>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
