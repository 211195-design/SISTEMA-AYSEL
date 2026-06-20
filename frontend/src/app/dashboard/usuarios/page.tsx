'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { UserCog, Plus, Pencil, ToggleLeft, ToggleRight, X, KeyRound, ShieldCheck } from 'lucide-react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Usuario {
  IdUsuario: number; Nombres: string; Apellidos: string;
  Correo: string; Usuario: string; Telefono: string;
  Estado: number; IdRol: number; NombreRol: string;
}
interface Rol { IdRol: number; NombreRol: string; }

const FORM_VACIO = {
  Nombres: '', Apellidos: '', Correo: '', Usuario: '',
  Telefono: '', IdRol: '', Clave: '',
};

// ─── Componente principal ─────────────────────────────────────────────────────
export default function UsuariosPage() {
  const [usuarios, setUsuarios]     = useState<Usuario[]>([]);
  const [roles, setRoles]           = useState<Rol[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [modal, setModal]           = useState<'crear' | 'editar' | 'clave' | 'reset' | null>(null);
  const [seleccionado, setSeleccionado] = useState<Usuario | null>(null);
  const [form, setForm]             = useState(FORM_VACIO);
  const [guardando, setGuardando]   = useState(false);
  const [msgModal, setMsgModal]     = useState<string | null>(null);

  // Cambio de clave
  const [claveActual, setClaveActual]   = useState('');
  const [claveNueva, setClaveNueva]     = useState('');
  const [claveConfirm, setClaveConfirm] = useState('');

  // Reset clave (admin)
  const [claveReset, setClaveReset]     = useState('');

  const cargar = () => {
    setCargando(true);
    Promise.all([
      apiFetch<{ ok: boolean; data: Usuario[] }>('/usuarios'),
      apiFetch<{ ok: boolean; data: Rol[] }>('/usuarios/roles'),
    ])
      .then(([u, r]) => { setUsuarios(u.data); setRoles(r.data); })
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  // ── Modales ──
  const abrirCrear = () => {
    setForm(FORM_VACIO); setMsgModal(null); setModal('crear');
  };

  const abrirEditar = (u: Usuario) => {
    setSeleccionado(u);
    setForm({ Nombres: u.Nombres, Apellidos: u.Apellidos, Correo: u.Correo,
              Usuario: u.Usuario, Telefono: u.Telefono, IdRol: String(u.IdRol), Clave: '' });
    setMsgModal(null); setModal('editar');
  };

  const abrirClave = () => {
    setClaveActual(''); setClaveNueva(''); setClaveConfirm('');
    setMsgModal(null); setModal('clave');
  };

  const abrirReset = (u: Usuario) => {
    setSeleccionado(u); setClaveReset('');
    setMsgModal(null); setModal('reset');
  };

  const cerrar = () => { setModal(null); setSeleccionado(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── Guardar crear / editar ──
  const guardar = async () => {
    setGuardando(true); setMsgModal(null);
    try {
      const body = { ...form, IdRol: Number(form.IdRol) };
      if (modal === 'crear') {
        await apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(body) });
      } else if (modal === 'editar' && seleccionado) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { Clave, ...bodyEditar } = body;
        await apiFetch(`/usuarios/${seleccionado.IdUsuario}`, { method: 'PUT', body: JSON.stringify(bodyEditar) });
      }
      setMsgModal(' Guardado correctamente');
      cargar();
      setTimeout(cerrar, 1000);
    } catch (e: any) {
      setMsgModal(` ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // ── Cambiar clave propia ──
  const guardarClave = async () => {
    if (claveNueva !== claveConfirm) {
      setMsgModal(' Las contraseñas nuevas no coinciden'); return;
    }
    if (claveNueva.length < 6) {
      setMsgModal(' La contraseña debe tener al menos 6 caracteres'); return;
    }
    setGuardando(true); setMsgModal(null);
    try {
      await apiFetch('/usuarios/cambiar-clave', {
        method: 'PATCH',
        body: JSON.stringify({ claveActual, claveNueva }),
      });
      setMsgModal(' Contraseña actualizada correctamente');
      setTimeout(cerrar, 1200);
    } catch (e: any) {
      setMsgModal(` ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // ── Reset clave (admin) ──
  const guardarReset = async () => {
    if (claveReset.length < 6) {
      setMsgModal('❌ La contraseña debe tener al menos 6 caracteres'); return;
    }
    setGuardando(true); setMsgModal(null);
    try {
      await apiFetch(`/usuarios/${seleccionado?.IdUsuario}/reset-clave`, {
        method: 'PATCH',
        body: JSON.stringify({ claveNueva: claveReset }),
      });
      setMsgModal(' Contraseña restablecida correctamente');
      setTimeout(cerrar, 1200);
    } catch (e: any) {
      setMsgModal(` ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // ── Toggle estado ──
  const toggleEstado = async (u: Usuario) => {
    try {
      await apiFetch(`/usuarios/${u.IdUsuario}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: u.Estado === 1 ? 0 : 1 }),
      });
      cargar();
    } catch (e: any) { alert(e.message); }
  };

  // Stats
  const activos   = usuarios.filter(u => u.Estado === 1).length;
  const inactivos = usuarios.filter(u => u.Estado === 0).length;

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Cargando usuarios...</div>
  );
  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm"> {error}</div>
  );

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión de cuentas y accesos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={abrirClave}
            className="flex items-center gap-2 border border-purple-200 text-purple-600 hover:bg-purple-50 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <KeyRound size={15} /> Mi contraseña
          </button>
          <button onClick={abrirCrear}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={16} /> Nuevo usuario
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-purple-50 w-fit mb-3">
            <UserCog size={22} className="text-purple-500" />
          </div>
          <p className="text-xs text-gray-400">Total usuarios</p>
          <p className="text-2xl font-bold text-gray-800">{usuarios.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-green-50 w-fit mb-3">
            <ShieldCheck size={22} className="text-green-500" />
          </div>
          <p className="text-xs text-gray-400">Activos / Inactivos</p>
          <p className="text-2xl font-bold text-gray-800">
            {activos} <span className="text-gray-300 font-normal">/</span>{' '}
            <span className="text-gray-400 text-lg">{inactivos}</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-blue-50 w-fit mb-3">
            <ShieldCheck size={22} className="text-blue-500" />
          </div>
          <p className="text-xs text-gray-400">Roles disponibles</p>
          <p className="text-2xl font-bold text-gray-800">{roles.length}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 pr-4">Usuario</th>
                <th className="pb-3 pr-4">Nombre completo</th>
                <th className="pb-3 pr-4">Correo</th>
                <th className="pb-3 pr-4">Teléfono</th>
                <th className="pb-3 pr-4">Rol</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No hay usuarios registrados</td></tr>
              ) : usuarios.map(u => (
                <tr key={u.IdUsuario} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs font-medium text-purple-600">@{u.Usuario}</td>
                  <td className="py-3 pr-4 font-medium text-gray-800">{u.Nombres} {u.Apellidos}</td>
                  <td className="py-3 pr-4 text-gray-500">{u.Correo}</td>
                  <td className="py-3 pr-4 text-gray-500">{u.Telefono ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      {u.NombreRol}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.Estado === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {u.Estado === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => abrirEditar(u)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors" title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => abrirReset(u)}
                        className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-500 transition-colors" title="Resetear contraseña">
                        <KeyRound size={15} />
                      </button>
                      <button onClick={() => toggleEstado(u)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.Estado === 1 ? 'hover:bg-red-50 text-red-400' : 'hover:bg-green-50 text-green-500'
                        }`} title={u.Estado === 1 ? 'Desactivar' : 'Activar'}>
                        {u.Estado === 1 ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal crear / editar ── */}
      {(modal === 'crear' || modal === 'editar') && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                {modal === 'crear' ? 'Nuevo Usuario' : 'Editar Usuario'}
              </h2>
              <button type = "button" onClick={cerrar} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nombres *</label>
                  <input name="Nombres" value={form.Nombres} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Ana" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Apellidos *</label>
                  <input name="Apellidos" value={form.Apellidos} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="García" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Usuario *</label>
                  <input name="Usuario" value={form.Usuario} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="ana.garcia" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
                  <input name="Telefono" value={form.Telefono} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="987000000" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Correo *</label>
                <input name="Correo" type="email" value={form.Correo} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="ana@aysel.com" />
              </div>

              <div>
                <label htmlFor="IdRol" className="text-xs text-gray-500 mb-1 block">Rol *</label>
                <select id = "IdRol" name="IdRol" value={form.IdRol} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                  <option value="">Seleccionar rol...</option>
                  {roles.map(r => (
                    <option key={r.IdRol} value={r.IdRol}>{r.NombreRol}</option>
                  ))}
                </select>
              </div>

              {modal === 'crear' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Contraseña *</label>
                  <input name="Clave" type="password" value={form.Clave} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="Mínimo 6 caracteres" />
                </div>
              )}

              {msgModal && <p className="text-sm text-center">{msgModal}</p>}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={cerrar}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal cambiar mi contraseña ── */}
      {modal === 'clave' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Cambiar mi contraseña</h2>
              <button type="button" onClick={cerrar} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="claveActual" className="text-xs text-gray-500 mb-1 block">Contraseña actual</label>
                <input id="claveActual" type="password" value={claveActual} onChange={e => setClaveActual(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nueva contraseña</label>
                <input type="password" value={claveNueva} onChange={e => setClaveNueva(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Confirmar nueva contraseña</label>
                <input type="password" value={claveConfirm} onChange={e => setClaveConfirm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Repite la contraseña" />
              </div>
              {msgModal && <p className="text-sm text-center">{msgModal}</p>}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={cerrar}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardarClave} disabled={guardando}
                className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-medium">
                {guardando ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal reset contraseña (admin) ── */}
      {modal === 'reset' && seleccionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-800">Restablecer contraseña</h2>
                <p className="text-xs text-gray-400">@{seleccionado.Usuario}</p>
              </div>
              <button type="button" onClick={cerrar} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700">
                Esta acción reemplazará la contraseña actual del usuario.
              </div>
              <div>
                <label htmlFor="claveReset" className="text-xs text-gray-500 mb-1 block">Nueva contraseña *</label>
                <input id="claveReset" type="password" value={claveReset} onChange={e => setClaveReset(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Mínimo 6 caracteres" />
              </div>
              {msgModal && <p className="text-sm text-center">{msgModal}</p>}
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={cerrar}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={guardarReset} disabled={guardando}
                className="flex-1 px-4 py-2 text-sm bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 disabled:opacity-50 font-medium">
                {guardando ? 'Guardando...' : 'Restablecer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
