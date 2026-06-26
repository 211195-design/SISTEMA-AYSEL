<<<<<<< HEAD
﻿export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Frontend Next.js 🚀</h1>
      <p className="mt-4 text-lg">Estructura lista para trabajar</p>
    </main>
  );
}
=======
﻿
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Zap, Shield, Clock, TrendingUp } from 'lucide-react';

export default function Home() {
  const modules = [
    { icon: '📊', title: 'Dashboard',         description: 'Ventas del día, semana y turno en tiempo real',  details: 'Métricas siempre actualizadas' },
    { icon: '🛍️', title: 'Punto de Venta',    description: 'Registra ventas rápidas con boleta automática',  details: 'Proceso ágil y sin errores'     },
    { icon: '📦', title: 'Inventario',         description: 'Control de stock con alertas de reposición',     details: 'Nunca te falten productos'      },
    { icon: '📋', title: 'Catálogo',           description: 'Precios, categorías y variantes de productos',   details: 'Organización profesional'       },
    { icon: '👥', title: 'Clientes',           description: 'Base de datos y seguimiento de compradores',     details: 'Fidelización efectiva'          },
    { icon: '📈', title: 'Reportes',           description: 'Análisis por turno, día y vendedor',             details: 'Decisiones basadas en datos'    },
    { icon: '👨‍💼', title: 'Usuarios y Roles',  description: 'Administrador, vendedor y cajero',              details: 'Acceso seguro por rol'          },
    { icon: '🖨️', title: 'Impresión Térmica',  description: 'Boletas en formato 80mm listas para imprimir',  details: 'Comprobantes profesionales'     },
  ];

  const benefits = [
    { icon: <Zap       className="w-6 h-6" />, title: 'Registro Rápido',       description: 'Registra una venta en segundos desde el POS con validación automática' },
    { icon: <Shield    className="w-6 h-6" />, title: 'Acceso por Roles',       description: 'JWT seguro — cada usuario ve solo lo que le corresponde'               },
    { icon: <TrendingUp className="w-6 h-6" />, title: 'Reportes por Turno',   description: 'Cierra el día con un reporte completo de cada vendedor'                 },
    { icon: <Clock     className="w-6 h-6" />, title: 'Zona Horaria Lima',      description: 'Todo calculado en hora local Peru (UTC-5) sin desincronías'            },
  ];

  const stats = [
    { value: '8+',      label: 'Módulos Activos'      },
    { value: 'POS',     label: 'Punto de Venta'        },
    { value: 'JWT',     label: 'Autenticación Segura'  },
    { value: 'UTC-5',   label: 'Hora Lima Exacta'      },
  ];

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #06000f 0%, #0d0020 45%, #080015 100%)' }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b"
        style={{ background: 'rgba(6,0,15,0.75)', borderColor: 'rgba(201,168,76,0.2)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/aysel.jpeg" alt="Aysel" fill sizes="40px" className="object-contain rounded-full" />
            </div>
            <span className="text-xl font-bold tracking-widest uppercase"
              style={{ color: '#c9a84c', textShadow: '0 0 15px rgba(201,168,76,0.4)' }}>
              Aysel Detalles
            </span>
          </div>
          <Link href="/login"
            className="px-5 py-2 rounded-lg font-semibold text-sm tracking-widest uppercase transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #b8860b, #c9a84c, #f0d080)', color: '#06000f', boxShadow: '0 3px 15px rgba(201,168,76,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 5px 25px rgba(201,168,76,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 3px 15px rgba(201,168,76,0.4)')}
          >
            Ingresar
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 py-28 text-center">

        {/* Badge */}
        <div className="inline-block mb-6 px-4 py-2 rounded-full border text-sm font-semibold"
          style={{ background: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.35)', color: '#c9a84c' }}>
          ✨ Sistema de Gestión — Tienda Aysel
        </div>

        {/* Logo grande */}
        <div className="flex justify-center mb-8">
          <div className="relative w-28 h-28"
            style={{ filter: 'drop-shadow(0 0 25px rgba(201,168,76,0.5))' }}>
            <Image src="/aysel.jpeg" alt="Aysel Detalles" fill sizes="112px" className="object-contain rounded-full" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span style={{
            background: 'linear-gradient(to right, #c9a84c, #f0d080, #c9a84c)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Gestiona tu tienda
          </span>
          <br />
          <span className="text-white">con elegancia</span>
        </h1>

        <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Plataforma integral para <strong style={{ color: '#c9a84c' }}>Aysel Detalles</strong> — 
          controla ventas, inventario, reportes y usuarios desde un solo lugar, 
          con datos en tiempo real y hora Lima exacta.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/login"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #b8860b, #c9a84c, #f0d080)', color: '#06000f', boxShadow: '0 4px 22px rgba(201,168,76,0.45)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(201,168,76,0.7)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 22px rgba(201,168,76,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Ir al Sistema
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-7xl mx-auto px-6 py-10 border-y"
        style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-bold mb-1"
                style={{ background: 'linear-gradient(to right, #c9a84c, #f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </p>
              <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Módulos ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-white text-center mb-3">Módulos del Sistema</h2>
        <p className="text-center mb-14 text-sm tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Todo lo que necesitas para operar Aysel Detalles
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m, i) => (
            <div key={i}
              className="group relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden cursor-default"
              style={{
                background: 'rgba(201,168,76,0.04)',
                borderColor: 'rgba(201,168,76,0.18)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.55)';
                (e.currentTarget as HTMLDivElement).style.background   = 'rgba(201,168,76,0.08)';
                (e.currentTarget as HTMLDivElement).style.boxShadow    = '0 4px 25px rgba(201,168,76,0.15)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.18)';
                (e.currentTarget as HTMLDivElement).style.background   = 'rgba(201,168,76,0.04)';
                (e.currentTarget as HTMLDivElement).style.boxShadow    = 'none';
              }}
            >
              <div className="text-4xl mb-4">{m.icon}</div>
              <h3 className="text-base font-bold text-white mb-1">{m.title}</h3>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{m.description}</p>
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#c9a84c' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {m.details}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Beneficios ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="text-4xl font-bold text-white text-center mb-3">¿Por qué este sistema?</h2>
        <p className="text-center mb-14 text-sm tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Diseñado específicamente para las necesidades de Aysel Detalles
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {benefits.map((b, i) => (
            <div key={i} className="flex gap-4 p-7 rounded-2xl border transition-all duration-300"
              style={{ background: 'rgba(201,168,76,0.04)', borderColor: 'rgba(201,168,76,0.18)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.5)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,168,76,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(201,168,76,0.18)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,168,76,0.04)'; }}
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #b8860b, #c9a84c)', color: '#06000f' }}>
                {b.icon}
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <div className="rounded-2xl p-12 text-center border"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.04))',
            borderColor: 'rgba(201,168,76,0.35)',
            boxShadow: '0 0 60px rgba(201,168,76,0.08)',
          }}>
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20"
              style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.6))' }}>
              <Image src="/aysel.jpeg" alt="Aysel" fill sizes="80px" className="object-contain rounded-full" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-3">¿Listo para empezar?</h3>
          <p className="mb-8 text-sm max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Ingresa al sistema y gestiona Aysel Detalles con total control y visibilidad
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #b8860b, #c9a84c, #f0d080)', color: '#06000f', boxShadow: '0 4px 22px rgba(201,168,76,0.45)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(201,168,76,0.7)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 22px rgba(201,168,76,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Ingresar al Sistema
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-6 text-xs tracking-widest uppercase" style={{ color: 'rgba(201,168,76,0.3)' }}>
            Aysel Detalles &copy; {new Date().getFullYear()}
          </p>
        </div>
      </section>

      {/* ── Fondo decorativo ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'rgba(120,60,200,0.08)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'rgba(201,168,76,0.06)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full"
          style={{ background: 'rgba(201,168,76,0.04)', filter: 'blur(60px)' }} />
      </div>
    </main>
  );
}

>>>>>>> d56977fed07c124c6a23093b46c6b3b12da548de
