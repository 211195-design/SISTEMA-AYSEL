'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, LoginFormValues } from '@/validations/auth.validations';
import { useLogin } from '@/hooks/useLogin';
import { getUserFromToken } from '@/lib/auth';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

// ── Partículas: solo se generan en el cliente ────────────────────────────────
function Particles() {
  const [particles, setParticles] = useState<Array<{
    left: string; top: string; width: string; height: string;
    color: string; shadow: string; dur: string; delay: string;
  }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        left:   `${Math.random() * 90}%`,
        top:    `${Math.random() * 100}%`,
        width:  `${Math.random() * 2.5 + 1}px`,
        height: `${Math.random() * 2.5 + 1}px`,
        color:  i % 2 === 0 ? 'rgba(200,150,255,0.85)' : 'rgba(201,168,76,0.85)',
        shadow: i % 2 === 0 ? '0 0 7px rgba(200,150,255,1)' : '0 0 7px rgba(201,168,76,1)',
        dur:    `${(Math.random() * 3 + 2).toFixed(2)}s`,
        delay:  `${(Math.random() * 3).toFixed(2)}s`,
      }))
    );
  }, []);

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.left, top: p.top,
            width: p.width, height: p.height,
            background: p.color,
            boxShadow: p.shadow,
            animation: `twinkle ${p.dur} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </>
  );
}

// ── Canvas flores moradas animadas ───────────────────────────────────────────
function FlowerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    let animId: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Flores fijas en lado izquierdo
    type Flower = {
      x: number; y: number; baseY: number;
      size: number; phase: number; speed: number;
      petals: number; color1: string; color2: string;
    };

    const flowers: Flower[] = [
      { x: 0.08, y: 0.75, baseY: 0.75, size: 55, phase: 0,    speed: 0.012, petals: 6, color1: '#7b2fff', color2: '#b06aff' },
      { x: 0.14, y: 0.55, baseY: 0.55, size: 45, phase: 1.2,  speed: 0.009, petals: 5, color1: '#9b3fff', color2: '#c88aff' },
      { x: 0.05, y: 0.40, baseY: 0.40, size: 38, phase: 2.1,  speed: 0.011, petals: 6, color1: '#6a1fff', color2: '#a055ff' },
      { x: 0.18, y: 0.82, baseY: 0.82, size: 50, phase: 0.7,  speed: 0.008, petals: 5, color1: '#8833ff', color2: '#bb77ff' },
      { x: 0.10, y: 0.25, baseY: 0.25, size: 35, phase: 1.8,  speed: 0.013, petals: 6, color1: '#5511ee', color2: '#9944ff' },
      { x: 0.22, y: 0.65, baseY: 0.65, size: 42, phase: 3.0,  speed: 0.010, petals: 5, color1: '#7722ff', color2: '#aa66ff' },
      // flores doradas (imagen 2 referencia)
      { x: 0.12, y: 0.88, baseY: 0.88, size: 48, phase: 0.4,  speed: 0.007, petals: 6, color1: '#c9a84c', color2: '#f0d080' },
      { x: 0.20, y: 0.45, baseY: 0.45, size: 36, phase: 2.5,  speed: 0.014, petals: 5, color1: '#b8860b', color2: '#daa520' },
    ];

    let t = 0;

    function drawFlower(f: Flower, offsetY: number) {
      const cx = f.x * canvas.width;
      const cy = f.baseY * canvas.height + offsetY;
      const s  = f.size;

      ctx.save();

      // Tallo
      ctx.beginPath();
      ctx.moveTo(cx, cy + s * 0.8);
      ctx.quadraticCurveTo(cx + s * 0.2, cy + s * 1.4, cx, cy + s * 2.0);
      ctx.strokeStyle = 'rgba(60,180,80,0.6)';
      ctx.lineWidth   = 2;
      ctx.stroke();

      // Hojitas
      ctx.beginPath();
      ctx.ellipse(cx + s * 0.3, cy + s * 1.3, s * 0.25, s * 0.12, 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(60,180,80,0.45)';
      ctx.fill();

      // Pétalos
      for (let p = 0; p < f.petals; p++) {
        const angle = (p / f.petals) * Math.PI * 2;
        const px    = cx + Math.cos(angle) * s * 0.55;
        const py    = cy + Math.sin(angle) * s * 0.55;
        const grad  = ctx.createRadialGradient(px, py, 0, px, py, s * 0.5);
        grad.addColorStop(0, f.color2 + 'cc');
        grad.addColorStop(1, f.color1 + '44');
        ctx.beginPath();
        ctx.ellipse(px, py, s * 0.28, s * 0.45, angle, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Centro con glow
      const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.28);
      cGrad.addColorStop(0, '#ffffff88');
      cGrad.addColorStop(0.4, f.color2 + 'dd');
      cGrad.addColorStop(1, f.color1 + '66');
      ctx.beginPath();
      ctx.arc(cx, cy, s * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = cGrad;
      ctx.shadowColor = f.color2;
      ctx.shadowBlur  = 18;
      ctx.fill();
      ctx.shadowBlur  = 0;

      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.016;
      flowers.forEach(f => {
        const offsetY = Math.sin(t * f.speed * 60 + f.phase) * 10;
        drawFlower(f, offsetY);
      });
      animId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}

// ── Página ───────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormValues) {
    const response = await login(data);
    if (response) {
      const user = getUserFromToken();
      const rol  = user?.rol?.toLowerCase() ?? '';
      if (rol === 'vendedor' || rol === 'cajero') {
        router.push('/pos');
      } else {
        router.push('/dashboard');
      }
    }
  }

  return (
    <main
      className="min-h-screen flex items-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #06000f 0%, #0d0020 45%, #080015 100%)' }}
    >
      {/* Orbes de luz */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-[-5%] left-[5%] w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(120,40,220,0.18) 0%, transparent 70%)', filter: 'blur(55px)' }} />
        <div className="absolute bottom-[-5%] left-[15%] w-[380px] h-[380px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute top-[35%] right-[5%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(100,30,200,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Canvas flores animadas */}
      <FlowerCanvas />

      {/* Imagen flores doradas (image.png) lado izquierdo */}
      <div
        className="absolute left-0 bottom-0 w-[42%] h-[90%] pointer-events-none"
        style={{
          backgroundImage: "url('/image.png')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left bottom',
          zIndex: 3,
          opacity: 0.75,
          animation: 'floatImg 10s ease-in-out infinite',
          filter: 'drop-shadow(0 0 25px rgba(201,168,76,0.35))',
        }}
      />

      {/* Overlay degradado izq→der */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(6,0,15,0.05) 0%, rgba(6,0,15,0.25) 38%, rgba(6,0,15,0.88) 58%, rgba(6,0,15,1) 100%)',
          zIndex: 4,
        }}
      />

      {/* Partículas */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        <Particles />
      </div>

      {/* ══ CARD — derecha ══ */}
      <div className="relative ml-auto mr-10 w-full" style={{ maxWidth: '390px', zIndex: 10 }}>

        {/* Borde dorado */}
        <div className="absolute inset-0 rounded-3xl"
          style={{
            padding: '1.5px',
            background: 'linear-gradient(160deg, #c9a84c, #f0d080, #c9a84c, #8a6a1f)',
            borderRadius: '1.5rem',
          }}>
          <div className="w-full h-full rounded-3xl"
            style={{ background: 'linear-gradient(160deg, rgba(14,8,35,0.97), rgba(8,5,25,0.98))' }} />
        </div>

        {/* Brillo línea superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.9), transparent)', zIndex: 11 }} />

        {/* Contenido */}
        <div className="relative px-8 py-10" style={{ zIndex: 12 }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-36 h-36 mb-4">
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, #c9a84c, #f0d080, #c9a84c, #8a6a1f, #c9a84c)',
                  padding: '2.5px',
                  animation: 'spin 8s linear infinite',
                }}>
                <div className="w-full h-full rounded-full" style={{ background: '#0e0820' }} />
              </div>
              <div className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 30px rgba(201,168,76,0.5), 0 0 60px rgba(201,168,76,0.2)' }} />
              <Image
                src="/aysel.jpeg"
                alt="Aysel Detalles"
                fill sizes="144px"
                className="object-contain rounded-full"
                style={{ padding: '4px' }}
                priority
              />
            </div>
            <h1 className="text-lg font-bold tracking-[0.22em] uppercase"
              style={{ color: '#c9a84c', textShadow: '0 0 18px rgba(201,168,76,0.55)' }}>
              Sistema de Ventas
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, #c9a84c)' }} />
              <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(201,168,76,0.55)' }}>Acceso</span>
              <div className="h-px w-10" style={{ background: 'linear-gradient(to left, transparent, #c9a84c)' }} />
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2"
                style={{ color: '#c9a84c' }}>Usuario</label>
              <input
                {...register('correo')}
                className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all duration-300 text-white placeholder-gray-600"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.25)' }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(201,168,76,0.85)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(201,168,76,0.22)'; }}
                onBlur={e  => { e.currentTarget.style.border = '1px solid rgba(201,168,76,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
                placeholder="usuario@tienda.com"
              />
              {errors.correo && <p className="text-xs text-red-400 mt-1">{errors.correo.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-semibold tracking-[0.25em] uppercase mb-2"
                style={{ color: '#c9a84c' }}>Contrasena</label>
              <input
                {...register('contrasena')}
                type="password"
                className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all duration-300 text-white placeholder-gray-600"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.25)' }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(201,168,76,0.85)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(201,168,76,0.22)'; }}
                onBlur={e  => { e.currentTarget.style.border = '1px solid rgba(201,168,76,0.25)'; e.currentTarget.style.boxShadow = 'none'; }}
                placeholder="••••••••"
              />
              {errors.contrasena && <p className="text-xs text-red-400 mt-1">{errors.contrasena.message}</p>}
            </div>

            {error && (
              <div className="text-sm rounded-xl px-4 py-3 text-red-300"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 mt-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #b8860b, #c9a84c, #f0d080, #c9a84c)', color: '#06000f', boxShadow: '0 4px 22px rgba(201,168,76,0.45)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(201,168,76,0.7)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 22px rgba(201,168,76,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {isLoading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-[10px] tracking-widest uppercase mt-8"
            style={{ color: 'rgba(201,168,76,0.28)' }}>
            Aysel Detalles &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(2); }
        }
        @keyframes floatImg {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-14px) scale(1.02); }
        }
      `}</style>
    </main>
  );
}