'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import {
  ArrowRight, Tag, Calendar, Percent, Users,
  MessageCircle, X, Send, Bot, ChevronDown,
  Sparkles, Clock,
} from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Promocion {
  IdPromocion:     number;
  NombrePromocion: string;
  Descuento:       string;
  FechaInicio:     string;
  FechaFin:        string;
  Estado:          number;
  TotalClientes:   number;
  EstadoVigencia:  'Activa' | 'Próxima' | 'Vencida' | 'Inactiva';
}

interface Mensaje {
  de:    'bot' | 'user';
  texto: string;
  hora:  string;
}

// ─── Base de conocimiento ─────────────────────────────────────────────────────
const FAQ: { palabras: string[]; respuesta: string }[] = [
  {
    palabras: ['hola', 'buenas', 'buenos', 'hey', 'saludos', 'inicio'],
    respuesta: '¡Bienvenido/a al asistente de **Tienda Aysel** \n\nEstoy aquí para guiarte paso a paso en el uso del sistema. ¿Sobre qué módulo deseas información?\n\n Inventario  •   Ventas  •   Promociones\n Clientes  •   Reportes  •   Cuentas',
  },
  {
    palabras: ['inventario', 'producto', 'productos', 'stock', 'agregar producto', 'categoria'],
    respuesta: ' **Módulo de Inventario**\n\nPermite gestionar todos los productos de la tienda.\n\n**Pasos para agregar un producto:**\n1. Ir al panel → sección **Inventario**\n2. Clic en **"+ Nuevo producto"**\n3. Completar: nombre, categoría, precio y stock inicial\n4. Guardar\n\n**Otras acciones disponibles:**\n•  Editar precio o descripción\n•  Actualizar stock manualmente\n•  Desactivar productos sin eliminarlos',
  },
  {
    palabras: ['venta', 'ventas', 'vender', 'cobrar', 'boleta', 'carrito', 'pagar'],
    respuesta: ' **Módulo de Ventas**\n\nRegistra cada transacción y genera boletas automáticamente.\n\n**Pasos para registrar una venta:**\n1. Panel → **Ventas** → **"+ Nueva venta"**\n2. Buscar y agregar productos al carrito\n3. Seleccionar cliente (opcional)\n4. Aplicar promoción si corresponde\n5. Elegir método de pago\n6. Confirmar → boleta generada \n\n La boleta incluye los datos de pago configurados en **Cuentas**.',
  },
  {
    palabras: ['promocion', 'promoción', 'descuento', 'descuentos', 'oferta', 'ofertas'],
    respuesta: ' **Módulo de Promociones**\n\nCrea descuentos personalizados por cliente y período.\n\n**Pasos para crear una promoción:**\n1. Panel → **Promociones** → **"+ Nueva promoción"**\n2. Definir: nombre, porcentaje de descuento\n3. Establecer fecha de inicio y fin\n4. Asignar los clientes beneficiados\n5. Activar la promoción\n\n Las promociones **Activas** se muestran automáticamente en esta página pública.',
  },
  {
    palabras: ['cliente', 'clientes', 'registrar cliente', 'nuevo cliente', 'dni', 'telefono'],
    respuesta: ' **Módulo de Clientes**\n\nGestiona tu cartera de clientes y su historial.\n\n**Pasos para registrar un cliente:**\n1. Panel → **Clientes** → **"+ Nuevo cliente"**\n2. Ingresar: nombre completo, DNI, teléfono y correo\n3. Guardar\n\n**Desde el perfil del cliente puedes:**\n•  Ver historial de compras\n•  Asignar promociones especiales\n•  Acceder a sus datos de contacto',
  },
  {
    palabras: ['reporte', 'reportes', 'estadistica', 'estadísticas', 'grafica', 'gráfica', 'dashboard', 'resumen'],
    respuesta: ' **Módulo de Reportes**\n\nVisualiza el rendimiento de tu negocio en tiempo real.\n\n**El dashboard muestra:**\n•  Ventas del día, semana y mes\n•  Productos más vendidos\n•  Ingresos totales\n•  Clientes más frecuentes\n\n**Filtros disponibles:**\n• Por rango de fechas personalizado\n• Por categoría de producto\n• Por vendedor',
  },
  {
    palabras: ['usuario', 'usuarios', 'contraseña', 'password', 'acceso', 'login', 'ingresar', 'rol', 'administrador', 'vendedor'],
    respuesta: ' **Acceso y Roles del Sistema**\n\n**Cómo ingresar:**\n1. Clic en **"Ingresar"** (botón dorado superior)\n2. Escribir usuario y contraseña\n3. El sistema redirige según tu rol\n\n**Roles disponibles:**\n\n| Rol | Acceso |\n|-----|--------|\n| Administrador | Acceso total al sistema |\n| Vendedor | Solo ventas e inventario |\n\n Si olvidaste tu contraseña, contacta al administrador.',
  },
  {
    palabras: ['cuenta', 'cuentas', 'yape', 'plin', 'whatsapp', 'pago', 'pagos', 'bcp', 'bbva', 'banco'],
    respuesta: ' **Módulo de Cuentas de Pago**\n\nConfigura los métodos de pago que aparecen en las boletas.\n\n**Pasos para agregar una cuenta:**\n1. Panel → **Cuentas** → **"+ Nueva cuenta"**\n2. Seleccionar tipo: Yape, Plin, WhatsApp, BCP, BBVA, etc.\n3. Ingresar titular y número\n4. Activar la cuenta \n\n Solo las cuentas **Activas** aparecen en las boletas generadas.',
  },
  {
    palabras: ['como', 'cómo', 'funciona', 'sistema', 'ayuda', 'explicar', 'explicame', 'modulos', 'módulos', 'que hace'],
    respuesta: ' **Sistema de Gestión Tienda Aysel**\n\nPlataforma integral para administrar tu negocio.\n\n**Módulos disponibles:**\n\n **Inventario** → Productos, categorías y stock\n **Ventas** → Registro de ventas y boletas\n **Clientes** → Cartera y perfiles de clientes\n **Promociones** → Descuentos por cliente y fecha\n **Reportes** → Estadísticas y análisis\n **Cuentas** → Métodos de pago configurables\n **Usuarios** → Roles y accesos\n\nPregúntame sobre cualquier módulo para ver el paso a paso.',
  },
  {
    palabras: ['gracias', 'perfecto', 'listo', 'ok', 'entendi', 'entendí', 'genial', 'excelente'],
    respuesta: '¡Con gusto!  Si tienes alguna otra consulta sobre el sistema, aquí estaré.\n\nRecuerda que puedes acceder al panel completo haciendo clic en **"Ingresar"** arriba. ¡Éxito con tu tienda! ',
  },
];

const obtenerRespuesta = (input: string): string => {
  const texto = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const encontrado = FAQ.find(f =>
    f.palabras.some(p => texto.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
  );
  return encontrado?.respuesta ??
    ' No encontré información sobre eso. Puedes consultarme sobre:\n\n•  Inventario y productos\n•  Ventas y boletas\n•  Clientes\n•  Promociones y descuentos\n•  Reportes\n•  Cuentas de pago\n•  Acceso y usuarios';
};

const horaActual = () =>
  new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

// ─── Helpers visuales ─────────────────────────────────────────────────────────
const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

const badgeStyle = (estado: string) => {
  if (estado === 'Activa')   return { bg: 'rgba(34,197,94,0.15)',   border: 'rgba(34,197,94,0.45)',   color: '#4ade80' };
  if (estado === 'Próxima')  return { bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.45)',  color: '#60a5fa' };
  if (estado === 'Inactiva') return { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.45)', color: '#f87171' };
  return                            { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)' };
};

const borderAccent = (estado: string) => {
  if (estado === 'Activa')   return 'rgba(34,197,94,0.6)';
  if (estado === 'Próxima')  return 'rgba(96,165,250,0.6)';
  if (estado === 'Inactiva') return 'rgba(248,113,113,0.4)';
  return 'rgba(255,255,255,0.1)';
};

// ─── Renderiza texto con **negrita** ──────────────────────────────────────────
function TextoFormateado({ texto }: { texto: string }) {
  return (
    <>
      {texto.split('\n').map((linea, i) => {
        const partes = linea.split(/\*\*(.*?)\*\*/g);
        return (
          <span key={i}>
            {partes.map((p, j) =>
              j % 2 === 1
                ? <strong key={j} style={{ color: '#f0d080', fontWeight: 700 }}>{p}</strong>
                : <span key={j}>{p}</span>
            )}
            {i < texto.split('\n').length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

// ─── Burbuja de mensaje ───────────────────────────────────────────────────────
function Burbuja({ msg, nueva }: { msg: Mensaje; nueva?: boolean }) {
  const esBot = msg.de === 'bot';
  return (
    <div
      className={`flex gap-2.5 ${esBot ? 'justify-start' : 'justify-end'}`}
      style={{
        animation: nueva ? 'fadeSlideIn 0.25s ease-out' : undefined,
      }}>
      {/* Avatar bot */}
      {esBot && (
        <div className="shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #92650a, #c9a84c)' }}>
            <Bot size={14} className="text-black" />
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-1 ${esBot ? 'items-start' : 'items-end'} max-w-[82%]`}>
        {/* Nombre + hora */}
        <div className="flex items-center gap-1.5 px-1">
          {esBot && (
            <span className="text-[10px] font-semibold" style={{ color: '#c9a84c' }}>
              Asistente Aysel
            </span>
          )}
          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <Clock size={9} />
            {msg.hora}
          </span>
        </div>

        {/* Burbuja */}
        <div
          className="rounded-2xl px-4 py-2.5 text-xs leading-relaxed"
          style={esBot
            ? {
                background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.04))',
                border: '1px solid rgba(201,168,76,0.18)',
                color: 'rgba(255,255,255,0.82)',
                borderTopLeftRadius: '4px',
              }
            : {
                background: 'linear-gradient(135deg, #92650a, #c9a84c)',
                color: '#06000f',
                fontWeight: 600,
                borderTopRightRadius: '4px',
                boxShadow: '0 2px 12px rgba(201,168,76,0.25)',
              }
          }>
          <TextoFormateado texto={msg.texto} />
        </div>
      </div>

      {/* Avatar usuario */}
      {!esBot && (
        <div className="shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
            style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c' }}>
            Tú
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Chips de sugerencias ─────────────────────────────────────────────────────
const SUGERENCIAS = [
  { label: '¿Cómo funciona?', emoji: '' },
  { label: 'Ventas',          emoji: '' },
  { label: 'Inventario',      emoji: '' },
  { label: 'Promociones',     emoji: '' },
  { label: 'Clientes',        emoji: '' },
  { label: 'Cuentas de pago', emoji: '' },
  { label: 'Reportes',        emoji: '' },
];

// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [promos,   setPromos]   = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);

  const [chatAbierto,  setChatAbierto]  = useState(false);
  const [mensajes,     setMensajes]     = useState<Mensaje[]>([
    {
      de: 'bot',
      hora: horaActual(),
      texto: '¡Bienvenido/a al asistente de **Tienda Aysel** \n\nEstoy aquí para guiarte en el uso del sistema de gestión. ¿Sobre qué módulo deseas información?\n\n📦 Inventario  •  💰 Ventas  •  🎁 Promociones\n👥 Clientes  •  📊 Reportes  •  💳 Cuentas',
    },
  ]);
  const [input,        setInput]        = useState('');
  const [escribiendo,  setEscribiendo]  = useState(false);
  const [nuevosMsg,    setNuevosMsg]    = useState<Set<number>>(new Set());
  const [notif,        setNotif]        = useState(true); // badge de notificación
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/promociones')
      .then(r => r.json())
      .then(r => setPromos(r.data ?? r))
      .catch(() => setPromos([]))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, escribiendo]);

  useEffect(() => {
    if (chatAbierto) {
      setNotif(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [chatAbierto]);

  const enviarMensaje = (texto: string) => {
    if (!texto.trim() || escribiendo) return;
    const idx = mensajes.length;
    const userMsg: Mensaje = { de: 'user', texto: texto.trim(), hora: horaActual() };
    setMensajes(prev => [...prev, userMsg]);
    setNuevosMsg(prev => new Set(prev).add(idx));
    setInput('');
    setEscribiendo(true);

    setTimeout(() => {
      setEscribiendo(false);
      const botIdx = idx + 1;
      setMensajes(prev => [...prev, { de: 'bot', texto: obtenerRespuesta(texto), hora: horaActual() }]);
      setNuevosMsg(prev => new Set(prev).add(botIdx));
    }, 800);
  };

  const activas  = promos.filter(p => p.EstadoVigencia === 'Activa').length;
  const proximas = promos.filter(p => p.EstadoVigencia === 'Próxima').length;
  const vencidas = promos.filter(p => p.EstadoVigencia === 'Vencida').length;

  return (
    <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #06000f 0%, #0d0020 45%, #080015 100%)' }}>

      {/* Animación CSS global */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
        }
        .btn-chat-pulse { animation: pulse-gold 2.5s infinite; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b"
        style={{ background: 'rgba(6,0,15,0.85)', borderColor: 'rgba(201,168,76,0.2)' }}>
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
          <div className="relative w-20 h-20" style={{ filter: 'drop-shadow(0 0 22px rgba(201,168,76,0.55))' }}>
            <Image src="/aysel.jpeg" alt="Aysel" fill sizes="80px" className="object-contain rounded-full" />
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
              { label: 'Total',    value: promos.length, color: '#c9a84c' },
              { label: 'Activas',  value: activas,       color: '#4ade80' },
              { label: 'Próximas', value: proximas,      color: '#60a5fa' },
              { label: 'Vencidas', value: vencidas,      color: 'rgba(255,255,255,0.3)' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border p-4 text-center"
                style={{ background: 'rgba(201,168,76,0.04)', borderColor: 'rgba(201,168,76,0.15)' }}>
                <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
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

        {cargando && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border p-6 animate-pulse h-56"
                style={{ background: 'rgba(201,168,76,0.03)', borderColor: 'rgba(201,168,76,0.1)' }} />
            ))}
          </div>
        )}

        {!cargando && promos.length === 0 && (
          <div className="text-center py-24" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <Tag className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-sm tracking-wide">Sin promociones disponibles por el momento</p>
          </div>
        )}

        {!cargando && promos.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {promos.map(p => {
              const bs = badgeStyle(p.EstadoVigencia);
              return (
                <div key={p.IdPromocion}
                  className="relative rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-300 overflow-hidden"
                  style={{ background: 'rgba(201,168,76,0.04)', borderColor: 'rgba(201,168,76,0.15)', borderLeftWidth: '4px', borderLeftColor: borderAccent(p.EstadoVigencia) }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,168,76,0.08)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 35px rgba(201,168,76,0.13)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,168,76,0.04)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}>
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
                    style={{ background: 'rgba(201,168,76,0.05)', filter: 'blur(25px)' }} />
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-white leading-snug">{p.NombrePromocion}</h3>
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border"
                      style={{ background: bs.bg, borderColor: bs.border, color: bs.color }}>
                      {p.EstadoVigencia}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 py-1">
                    <Percent className="w-5 h-5 mb-1" style={{ color: '#c9a84c' }} />
                    <span className="text-5xl font-black leading-none"
                      style={{ background: 'linear-gradient(to right, #c9a84c, #f0d080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {Number(p.Descuento).toFixed(0)}
                    </span>
                    <span className="text-lg font-bold mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>% descuento</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: '#c9a84c' }} />
                    <span>
                      <span className="font-medium text-white">{fmtFecha(p.FechaInicio)}</span>
                      <span className="mx-1.5">→</span>
                      <span className="font-medium text-white">{fmtFecha(p.FechaFin)}</span>
                    </span>
                  </div>
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

      {/* ══════════════════════════════════════════════════════════════════════
          CHATBOT PROFESIONAL
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Ventana del chat */}
      {chatAbierto && (
        <div
          className="fixed bottom-24 right-5 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: '360px',
            height: '520px',
            background: '#07001a',
            border: '1px solid rgba(201,168,76,0.25)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.7), 0 0 50px rgba(201,168,76,0.07)',
            animation: 'fadeSlideIn 0.2s ease-out',
          }}>

          {/* ── Header ── */}
          <div className="shrink-0 px-4 py-3 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #7a4a00, #b8860b, #c9a84c)' }}>
            <div className="flex items-center gap-3">
              {/* Avatar con estado online */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <Bot size={18} className="text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-yellow-600"
                  style={{ background: '#4ade80' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-black leading-none">Asistente Aysel</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Sparkles size={9} className="text-black/50" />
                  <p className="text-[10px] text-black/55 font-medium">En línea · Responde al instante</p>
                </div>
              </div>
            </div>
            <button onClick={() => setChatAbierto(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/20"
              aria-label="Minimizar chat">
              <ChevronDown size={16} className="text-black/70" />
            </button>
          </div>

          {/* ── Área de mensajes ── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(201,168,76,0.15) transparent' }}>

            {/* Divider de fecha */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.1)' }} />
              <span className="text-[10px] px-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Hoy
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.1)' }} />
            </div>

            {mensajes.map((m, i) => (
              <Burbuja key={i} msg={m} nueva={nuevosMsg.has(i)} />
            ))}

            {/* Indicador escribiendo */}
            {escribiendo && (
              <div className="flex gap-2.5 justify-start" style={{ animation: 'fadeSlideIn 0.2s ease-out' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #92650a, #c9a84c)' }}>
                  <Bot size={14} className="text-black" />
                </div>
                <div className="rounded-2xl px-4 py-3 flex gap-1.5 items-center"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.15)', borderTopLeftRadius: '4px' }}>
                  {[0, 1, 2].map(j => (
                    <span key={j} className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: '#c9a84c', opacity: 0.7, animationDelay: `${j * 0.18}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Sugerencias rápidas ── */}
          <div className="shrink-0 px-3 pb-2">
            <p className="text-[10px] mb-1.5 px-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Sugerencias rápidas
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {SUGERENCIAS.map(s => (
                <button key={s.label}
                  onClick={() => enviarMensaje(s.label)}
                  disabled={escribiendo}
                  className="shrink-0 flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full border whitespace-nowrap transition-all hover:scale-105 disabled:opacity-40"
                  style={{ borderColor: 'rgba(201,168,76,0.25)', color: 'rgba(201,168,76,0.75)', background: 'rgba(201,168,76,0.05)' }}>
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Input ── */}
          <div className="shrink-0 px-3 pb-3">
            <div className="flex gap-2 items-center rounded-xl px-3 py-2.5 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enviarMensaje(input)}
                placeholder="Escribe tu consulta..."
                disabled={escribiendo}
                className="flex-1 bg-transparent text-xs outline-none disabled:opacity-50"
                style={{ color: 'rgba(255,255,255,0.85)' }}
              />
              <button
                onClick={() => enviarMensaje(input)}
                disabled={!input.trim() || escribiendo}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30 disabled:scale-100"
                style={{ background: 'linear-gradient(135deg, #92650a, #c9a84c)' }}>
                <Send size={13} className="text-black" />
              </button>
            </div>
            <p className="text-center text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Asistente automático · Sistema Aysel
            </p>
          </div>
        </div>
      )}

      {/* ── Botón flotante ── */}
      <button
        onClick={() => setChatAbierto(v => !v)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 ${!chatAbierto ? 'btn-chat-pulse' : ''}`}
        style={{
          background: chatAbierto
            ? 'rgba(10,0,30,0.9)'
            : 'linear-gradient(135deg, #7a4a00, #b8860b, #c9a84c)',
          border: '2px solid rgba(201,168,76,0.5)',
          boxShadow: '0 4px 25px rgba(201,168,76,0.35)',
        }}
        aria-label="Abrir asistente">

        {chatAbierto
          ? <X size={20} style={{ color: '#c9a84c' }} />
          : <MessageCircle size={22} className="text-black" />}

        {/* Badge de notificación */}
        {notif && !chatAbierto && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: '#ef4444' }}>
            1
          </span>
        )}
      </button>
    </main>
  );
}
