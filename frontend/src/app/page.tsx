'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowRight, Tag, Calendar, Percent, Users } from 'lucide-react';

// ─── Mismo tipo que el panel admin ────────────────────────────────────────────
interface Promocion {
  IdPromocion:    number;
  NombrePromocion: string;
  Descuento:      string;
  FechaInicio:    string;
  FechaFin:       string;
  Estado:         number;
  TotalClientes:  number;
  EstadoVigencia: 'Activa' | 'Próxima' | 'Vencida' | 'Inactiva';
}

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

const badgeStyle = (estado: string) => {
  if (estado === 'Activa')   return { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.45)',    color: '#4ade80' };
  if (estado === 'Próxima')  return { bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.45)',   color: '#60a5fa' };
  if (estado === 'Inactiva') return { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.45)',  color: '#f87171' };
  return                            { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)',  color: 'rgba(255,255,255,0.3)' };
};

const borderAccent = (estado: string) => {
  if (estado === 'Activa')   return 'rgba(34,197,94,0.6)';
  if (estado === 'Próxima')  return 'rgba(96,165,250,0.6)';
  if (estado === 'Inactiva') return 'rgba(248,113,113,0.4)';
  return 'rgba(255,255,255,0.1)';
};

export default function Home() {
  const [promos,   setPromos]   = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // ✅ Mismo endpoint que el panel admin
    fetch('http://localhost:3001/api/promociones')
      .then(r => r.json())
      .then(r => setPromos(r.data ?? r))
      .catch(() => setPromos([]))
      .finally(() => setCargando(false));
  }, []);

  // ── Contadores ──
  const activas  = promos.filter(p => p.EstadoVigencia === 'Activa').length;
  const proximas = promos.filter(p => p.EstadoVigencia === 'Próxima').length;
  const vencidas = promos.filter(p => p.EstadoVigencia === 'Vencida').length;

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #06000f 0%, #0d0020 45%, #080015 100%)' }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b"
        style={{ background: 'rgba(6,0,15,0.80)', borderColor: 'rgba(201,168,76,0.2)' }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image src="/aysel.jpeg" alt="Aysel" fill sizes="36px" className="object-contain rounded-full" />
            </div>
            <span className="text-lg font-bold tracking-widest uppercase"
              style={{ color: '#c9a84c', textShadow: '0 0 15px rgba(201,168,76,0.4)' }}>
              Sistema de Inventariado AYSEL
            </span>
          </div>
          <Link href="/login"
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm tracking-widest uppercase"
            style={{ background: 'linear-gradient(135deg, #b8860b, #c9a84c, #f0d080)', color: '#06000f', boxShadow: '0 3px 15px rgba(201,168,76,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 5px 25px rgba(201,168,76,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 3px 15px rgba(201,168,76,0.4)')}>
            Ingresar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="relative w-20 h-20"
            style={{ filter: 'drop-shadow(0 0 22px rgba(201,168,76,0.55))' }}>
            <Image src="/aysel.jpeg" alt="Sistema de Inventariado AYSEL" fill sizes="80px" className="object-contain rounded-full" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-3">
          <span style={{ background: 'linear-gradient(to right, #c9a84c, #f0d080, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Promociones Exclusivas
          </span>
        </h1>
        <p className="text-sm max-w-lg mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Descuentos especiales para clientes de{' '}
          <strong style={{ color: '#c9a84c' }}>Sistema de Inventariado AYSEL</strong>
        </p>
        <Link href="/login"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm tracking-widest uppercase"
          style={{ background: 'linear-gradient(135deg, #b8860b, #c9a84c, #f0d080)', color: '#06000f', boxShadow: '0 4px 22px rgba(201,168,76,0.45)' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(201,168,76,0.7)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 22px rgba(201,168,76,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          Ir al Sistema <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── Contadores ── */}
      {!cargando && promos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total',    value: promos.length, color: '#c9a84c'              },
              { label: 'Activas',  value: activas,       color: '#4ade80'              },
              { label: 'Próximas', value: proximas,      color: '#60a5fa'              },
              { label: 'Vencidas', value: vencidas,      color: 'rgba(255,255,255,0.3)'},
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border p-4 text-center"
                style={{ background: 'rgba(201,168,76,0.04)', borderColor: 'rgba(201,168,76,0.15)' }}>
                <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs tracking-widest uppercase mt-1"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Cards ── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">

        <div className="flex items-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold"
            style={{ background: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.35)', color: '#c9a84c' }}>
            <Tag className="w-4 h-4" />
            {cargando ? 'Cargando...' : `${promos.length} promociones disponibles`}
          </div>
        </div>

        {/* Skeleton */}
        {cargando && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border p-6 animate-pulse h-56"
                style={{ background: 'rgba(201,168,76,0.03)', borderColor: 'rgba(201,168,76,0.1)' }} />
            ))}
          </div>
        )}

        {/* Sin datos */}
        {!cargando && promos.length === 0 && (
          <div className="text-center py-24" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <Tag className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-sm tracking-wide">Sin promociones disponibles por el momento</p>
          </div>
        )}

        {/* Grid */}
        {!cargando && promos.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {promos.map(p => {
              const bs = badgeStyle(p.EstadoVigencia);
              return (
                <div key={p.IdPromocion}
                  className="relative rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 overflow-hidden"
                  style={{
                    background:      'rgba(201,168,76,0.04)',
                    borderColor:     'rgba(201,168,76,0.15)',
                    borderLeftWidth: '4px',
                    borderLeftColor: borderAccent(p.EstadoVigencia),
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background  = 'rgba(201,168,76,0.08)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow   = '0 6px 35px rgba(201,168,76,0.13)';
                    (e.currentTarget as HTMLDivElement).style.transform   = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background  = 'rgba(201,168,76,0.04)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow   = 'none';
                    (e.currentTarget as HTMLDivElement).style.transform   = 'translateY(0)';
                  }}
                >
                  {/* Brillo decorativo */}
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
                    style={{ background: 'rgba(201,168,76,0.05)', filter: 'blur(25px)' }} />

                  {/* ── Nombre + Badge estado ── */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-white leading-snug">
                      {p.NombrePromocion}
                    </h3>
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border"
                      style={{ background: bs.bg, borderColor: bs.border, color: bs.color }}>
                      {p.EstadoVigencia}
                    </span>
                  </div>

                  {/* ── % Descuento ── */}
                  <div className="flex items-end gap-2 py-1">
                    <Percent className="w-5 h-5 mb-1" style={{ color: '#c9a84c' }} />
                    <span className="text-5xl font-black leading-none"
                      style={{ background: 'linear-gradient(to right, #c9a84c, #f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {Number(p.Descuento).toFixed(0)}
                    </span>
                    <span className="text-lg font-bold mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      % descuento
                    </span>
                  </div>

                  {/* ── Fechas ── */}
                  <div className="flex items-center gap-2 text-xs"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: '#c9a84c' }} />
                    <span>
                      <span className="font-medium text-white">{fmtFecha(p.FechaInicio)}</span>
                      <span className="mx-1.5">→</span>
                      <span className="font-medium text-white">{fmtFecha(p.FechaFin)}</span>
                    </span>
                  </div>

                  {/* ── Clientes asignados ── */}
                  <div className="flex items-center gap-2 text-xs pt-3 border-t"
                    style={{ borderColor: 'rgba(201,168,76,0.12)', color: 'rgba(255,255,255,0.35)' }}>
                    <Users className="w-3.5 h-3.5 shrink-0" style={{ color: '#c9a84c' }} />
                    <span>
                      <span className="font-semibold text-white">{p.TotalClientes}</span>
                      {' '}cliente{p.TotalClientes !== 1 ? 's' : ''} asignado{p.TotalClientes !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="text-center pb-10 text-xs tracking-widest uppercase"
        style={{ color: 'rgba(201,168,76,0.25)' }}>
        Aysel Detalles &copy; {new Date().getFullYear()}
      </footer>

      {/* ── Fondo decorativo ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'rgba(120,60,200,0.07)', filter: 'blur(90px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'rgba(201,168,76,0.05)', filter: 'blur(80px)' }} />
      </div>
    </main>
  );
}
