'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { CreditCard, Plus, Pencil, Trash2, X, Power, Smartphone, Landmark, MessageCircle } from 'lucide-react';

interface Cuenta {
  IdCuenta: number;
  TipoCuenta: string;
  Titular: string;
  NumeroCuenta: string;
  CCI?: string;
  Estado: number;
  FechaRegistro: string;
}

const TIPOS = ['Yape', 'Plin', 'WhatsApp', 'BCP', 'BBVA', 'Interbank', 'Scotiabank', 'Otro'];

const esDigital  = (tipo: string) => tipo === 'Yape' || tipo === 'Plin';
const esWhatsapp = (tipo: string) => tipo === 'WhatsApp';

// Arma el link de WhatsApp con código de país Perú (+51)
const waLink = (numero: string) => {
  const digitos = numero.replace(/\D/g, '');
  const conCodigo = digitos.startsWith('51') ? digitos : `51${digitos}`;
  return `https://wa.me/${conCodigo}`;
};

const qrUrl = (data: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(data)}`;

export default function CuentasPage() {
  const [cuentas, setCuentas]     = useState<Cuenta[]>([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]   = useState<Cuenta | null>(null);
  const [form, setForm]           = useState({ TipoCuenta: 'Yape', Titular: '', NumeroCuenta: '', CCI: '' });
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg]             = useState<string | null>(null);

  const cargarCuentas = () => {
    setCargando(true);
    apiFetch<{ ok: boolean; data: Cuenta[] }>('/cuentas')
      .then(r => setCuentas(r.data))
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarCuentas(); }, []);

  const abrirNueva = () => {
    setEditando(null);
    setForm({ TipoCuenta: 'Yape', Titular: '', NumeroCuenta: '', CCI: '' });
    setMsg(null);
    setModalAbierto(true);
  };

  const abrirEditar = (c: Cuenta) => {
    setEditando(c);
    setForm({
      TipoCuenta: c.TipoCuenta,
      Titular: c.Titular,
      NumeroCuenta: c.NumeroCuenta,
      CCI: c.CCI ?? '',
    });
    setMsg(null);
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!form.Titular.trim() || !form.NumeroCuenta.trim()) {
      setMsg('❌ Completa titular y número de cuenta');
      return;
    }
    setGuardando(true); setMsg(null);
    try {
      if (editando) {
        await apiFetch(`/cuentas/${editando.IdCuenta}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/cuentas', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      cargarCuentas();
      setModalAbierto(false);
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (c: Cuenta) => {
    try {
      await apiFetch(`/cuentas/${c.IdCuenta}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ Estado: c.Estado ? 0 : 1 }),
      });
      cargarCuentas();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const eliminarCuenta = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta cuenta?')) return;
    try {
      await apiFetch(`/cuentas/${id}`, { method: 'DELETE' });
      cargarCuentas();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const activas = cuentas.filter(c => c.Estado === 1).length;

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Cargando cuentas...</div>
  );
  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">⚠️ {error}</div>
  );

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cuentas de pago</h1>
          <p className="text-sm text-gray-400 mt-0.5">Yape, Plin, WhatsApp y cuentas bancarias que aparecen en tus boletas</p>
        </div>
        <button onClick={abrirNueva}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Nueva cuenta
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-purple-50 w-fit mb-3"><CreditCard size={22} className="text-purple-500" /></div>
          <p className="text-xs text-gray-400">Total cuentas</p>
          <p className="text-2xl font-bold text-gray-800">{cuentas.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-green-50 w-fit mb-3"><Power size={22} className="text-green-500" /></div>
          <p className="text-xs text-gray-400">Activas (visibles en boleta)</p>
          <p className="text-2xl font-bold text-gray-800">{activas}</p>
        </div>
      </div>

      {/* Grid de cuentas */}
      {cuentas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-400">
          Aún no has agregado ninguna cuenta de pago
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cuentas.map(c => (
            <div key={c.IdCuenta}
              className={`bg-white rounded-2xl shadow-sm p-5 border-2 transition-colors ${
                c.Estado ? 'border-transparent' : 'border-gray-100 opacity-60'
              }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-50">
                  {esWhatsapp(c.TipoCuenta)
                    ? <MessageCircle size={20} className="text-green-500" />
                    : esDigital(c.TipoCuenta)
                      ? <Smartphone size={20} className="text-purple-500" />
                      : <Landmark size={20} className="text-purple-500" />}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  c.Estado ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {c.Estado ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <p className="text-base font-bold text-gray-800">{c.TipoCuenta}</p>
              <p className="text-sm text-gray-500 mt-1">{c.Titular}</p>
              <p className="text-lg font-mono font-semibold text-purple-600 mt-2">{c.NumeroCuenta}</p>
              {c.CCI && (
                <p className="text-xs text-gray-400 mt-1">CCI: {c.CCI}</p>
              )}

              {/* QR de WhatsApp */}
              {esWhatsapp(c.TipoCuenta) && (
                <div className="mt-3 flex flex-col items-center bg-green-50 rounded-xl p-3">
                  <img src={qrUrl(waLink(c.NumeroCuenta))} alt="QR WhatsApp"
                    width={110} height={110} className="rounded-lg bg-white p-1" />
                  <a href={waLink(c.NumeroCuenta)} target="_blank" rel="noreferrer"
                    className="text-xs text-green-600 font-medium mt-2 hover:underline">
                    Abrir chat de WhatsApp
                  </a>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <button onClick={() => abrirEditar(c)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                  <Pencil size={13} /> Editar
                </button>
                <button onClick={() => cambiarEstado(c)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-xl transition-colors ${
                    c.Estado
                      ? 'border border-orange-200 text-orange-500 hover:bg-orange-50'
                      : 'border border-green-200 text-green-600 hover:bg-green-50'
                  }`}>
                  <Power size={13} /> {c.Estado ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => eliminarCuenta(c.IdCuenta)}
                  className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50" title="Eliminar" aria-label="Eliminar cuenta">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nueva/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                {editando ? 'Editar cuenta' : 'Nueva cuenta de pago'}
              </h2>
              <button type="button" onClick={() => setModalAbierto(false)} aria-label="Cerrar modal"
                className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="tipoCuenta" className="text-xs text-gray-500 mb-1 block">Tipo de cuenta *</label>
                <select id="tipoCuenta" value={form.TipoCuenta}
                  onChange={e => setForm(f => ({ ...f, TipoCuenta: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="titular" className="text-xs text-gray-500 mb-1 block">
                  {esWhatsapp(form.TipoCuenta) ? 'Nombre de la tienda / atención *' : 'Titular *'}
                </label>
                <input id="titular" type="text" value={form.Titular}
                  onChange={e => setForm(f => ({ ...f, Titular: e.target.value }))}
                  placeholder="Nombre completo del titular"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>

              <div>
                <label htmlFor="numeroCuenta" className="text-xs text-gray-500 mb-1 block">
                  {esWhatsapp(form.TipoCuenta)
                    ? 'Número de WhatsApp *'
                    : esDigital(form.TipoCuenta) ? 'Número de celular *' : 'Número de cuenta *'}
                </label>
                <input id="numeroCuenta" type="text" value={form.NumeroCuenta}
                  onChange={e => setForm(f => ({ ...f, NumeroCuenta: e.target.value }))}
                  placeholder={esDigital(form.TipoCuenta) || esWhatsapp(form.TipoCuenta) ? '999 999 999' : '191-1234567-0-12'}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>

              {/* Vista previa del QR mientras escribes el número de WhatsApp */}
              {esWhatsapp(form.TipoCuenta) && form.NumeroCuenta.replace(/\D/g, '').length >= 9 && (
                <div className="flex flex-col items-center bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-green-600 font-medium mb-2">Vista previa del QR</p>
                  <img src={qrUrl(waLink(form.NumeroCuenta))} alt="Vista previa QR WhatsApp"
                    width={110} height={110} className="rounded-lg bg-white p-1" />
                </div>
              )}

              {!esDigital(form.TipoCuenta) && !esWhatsapp(form.TipoCuenta) && (
                <div>
                  <label htmlFor="cci" className="text-xs text-gray-500 mb-1 block">CCI (opcional)</label>
                  <input id="cci" type="text" value={form.CCI}
                    onChange={e => setForm(f => ({ ...f, CCI: e.target.value }))}
                    placeholder="002-191-001234567012-34"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              )}

              {msg && <p className="text-sm text-center">{msg}</p>}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => setModalAbierto(false)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium">
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Agregar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}