'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Zap, Shield, Clock, TrendingUp } from 'lucide-react';

export default function Home() {
  const modules = [
    {
      icon: '📊',
      title: 'Dashboard Analytics',
      description: 'Visualiza KPIs y métricas en tiempo real',
      details: 'Control total de tu negocio',
    },
    {
      icon: '👥',
      title: 'Gestión de Clientes',
      description: 'Base de datos centralizada y gestión integral',
      details: 'Seguimiento completo de relaciones',
    },
    {
      icon: '📦',
      title: 'Inventario Inteligente',
      description: 'Control de stock automático y alertas',
      details: 'Nunca te faltes productos',
    },
    {
      icon: '🛍️',
      title: 'Catálogo de Productos',
      description: 'Gestiona precios, categorías y variantes',
      details: 'Organización profesional',
    },
    {
      icon: '💳',
      title: 'Sistema de Ventas',
      description: 'Procesa ventas y genera facturas',
      details: 'Transacciones seguras',
    },
    {
      icon: '📈',
      title: 'Reportes Avanzados',
      description: 'Análisis detallados y exportación de datos',
      details: 'Datos para tomar decisiones',
    },
    {
      icon: '⚙️',
      title: 'Configuración',
      description: 'Personaliza el sistema a tu medida',
      details: 'Adaptable a tu negocio',
    },
    {
      icon: '👨‍💼',
      title: 'Gestión de Usuarios',
      description: 'Control de acceso y permisos',
      details: 'Seguridad y roles definidos',
    },
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Automatización',
      description: 'Procesos automáticos que ahorran tiempo y reducen errores',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Seguridad Empresarial',
      description: 'Autenticación segura y cifrado de datos sensibles',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Escalabilidad',
      description: 'Crece con tu negocio sin limitaciones técnicas',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Disponibilidad 24/7',
      description: 'Acceso desde cualquier lugar, en cualquier momento',
    },
  ];

  const stats = [
    { value: '8+', label: 'Módulos Completos' },
    { value: '100%', label: 'Personalizable' },
    { value: 'Real-time', label: 'Actualizaciones Vivas' },
    { value: '∞', label: 'Escalable' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Navbar Premium */}
      <nav className="backdrop-blur-lg bg-slate-950/40 border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-magenta-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">A</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-magenta-400 to-pink-400 bg-clip-text text-transparent">
              SISTEMA AYSEL
            </h1>
          </div>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-magenta-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-magenta-700 transition-all transform hover:scale-105 shadow-lg shadow-magenta-500/30"
          >
            Acceder
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <div className="text-center mb-20">
          <div className="inline-block mb-6 px-4 py-2.5 bg-purple-500/20 border border-purple-500/40 rounded-full backdrop-blur">
            <p className="text-purple-300 font-semibold text-sm">✨ Solución Empresarial Integrada</p>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-magenta-400 to-pink-400 bg-clip-text text-transparent">
              Transformar
            </span>
            <br />
            <span className="text-white">tu Negocio</span>
          </h1>

          <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Plataforma integral de gestión empresarial que centraliza tus operaciones, automatiza procesos 
            y proporciona inteligencia de negocio en tiempo real para tomar decisiones estratégicas.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/login"
              className="group px-8 py-3.5 bg-gradient-to-r from-purple-600 to-magenta-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-magenta-700 transition-all transform hover:scale-105 shadow-lg shadow-magenta-500/40 flex items-center gap-2"
            >
              Inicia Sesión
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-3.5 border border-purple-500/50 rounded-lg font-semibold text-white hover:bg-purple-500/10 transition-all backdrop-blur">
              Conocer Más
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-28 py-12 border-y border-purple-500/20">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center group">
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-magenta-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-slate-400 group-hover:text-purple-300 transition-colors">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="mb-32">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Módulos Integrados
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Acceso completo a todas las herramientas que necesitas para administrar tu negocio
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((module, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-magenta-900/20 border border-purple-500/30 hover:border-magenta-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-magenta-500/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-transparent to-magenta-600/0 group-hover:from-purple-600/5 group-hover:to-magenta-600/5 transition-all"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{module.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{module.title}</h3>
                  <p className="text-sm text-slate-400 mb-3">{module.description}</p>
                  <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {module.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-32">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Beneficios Principales
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Descubre qué te ofrece nuestro sistema
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-8 rounded-xl bg-gradient-to-br from-purple-900/40 to-magenta-900/30 border border-purple-500/30 hover:border-magenta-500/50 transition-all group"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-magenta-600 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      {benefit.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-slate-300 text-sm">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-600/30 to-magenta-600/30 border border-magenta-500/40 p-12 text-center backdrop-blur-sm">
          <h3 className="text-3xl font-bold text-white mb-4">¿Listo para gestionar tu negocio?</h3>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto">
            Accede ahora al sistema y comienza a optimizar todas tus operaciones comerciales
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-600 to-magenta-600 rounded-lg font-bold text-white hover:from-purple-700 hover:to-magenta-700 transition-all transform hover:scale-105 shadow-lg shadow-magenta-500/40"
          >
            Ir al Sistema
          </Link>
        </div>
      </section>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl"></div>
      </div>
    </main>
  );
}
