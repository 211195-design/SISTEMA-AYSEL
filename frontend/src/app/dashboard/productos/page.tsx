'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { Package, Plus, Pencil, ToggleLeft, ToggleRight, X } from 'lucide-react';

interface Producto {
  IdProducto: number; Codigo: string; NombreProducto: string;
  Descripcion: string; PrecioCompra: string; PrecioVenta: string;
  StockMinimo: number; Estado: number; IdCategoria: number; NombreCategoria: string;
}
interface Categoria { IdCategoria: number; NombreCategoria: string; }
interface Talla    { IdTalla: number;  NombreTalla: string; }
interface Color    { IdColor: number;  NombreColor: string; }

const FORM_VACIO = {
  Codigo: '', NombreProducto: '', Descripcion: '',
  PrecioCompra: '', PrecioVenta: '', StockMinimo: '1',
  IdCategoria: '', IdTalla: '', IdColor: '', StockInicial: '0',
};

export default function ProductosPage() {
  const [productos, setProductos]   = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tallas, setTallas]         = useState<Talla[]>([]);
  const [colores, setColores]       = useState<Color[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [busqueda, setBusqueda]     = useState('');
  const [modal, setModal]           = useState<'crear' | 'editar' | null>(null);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);
  const [form, setForm]             = useState(FORM_VACIO);
  const [guardando, setGuardando]   = useState(false);
  const [msgModal, setMsgModal]     = useState<string | null>(null);

  const cargar = () => {
    setCargando(true);
    Promise.all([
      apiFetch<{ ok: boolean; data: Producto[]  }>('/productos'),
      apiFetch<{ ok: boolean; data: Categoria[] }>('/productos/categorias'),
      apiFetch<{ ok: boolean; data: Talla[]     }>('/productos/tallas'),
      apiFetch<{ ok: boolean; data: Color[]     }>('/productos/colores'),
    ])
      .then(([p, c, t, col]) => {
        setProductos(p.data);
        setCategorias(c.data);
        setTallas(t.data);
        setColores(col.data);
      })
      .catch(e => setError(e.message))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const filtrado = productos.filter(p =>
    p.NombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.Codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.NombreCategoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = async () => {
    const r = await apiFetch<{ ok: boolean; data: string }>('/productos/next-codigo');
    setForm({ ...FORM_VACIO, Codigo: r.data });
    setMsgModal(null);
    setModal('crear');
  };

  const abrirEditar = (p: Producto) => {
    setSeleccionado(p);
    setForm({
      Codigo: p.Codigo, NombreProducto: p.NombreProducto,
      Descripcion: p.Descripcion, PrecioCompra: p.PrecioCompra,
      PrecioVenta: p.PrecioVenta, StockMinimo: String(p.StockMinimo),
      IdCategoria: String(p.IdCategoria), IdTalla: '', IdColor: '', StockInicial: '0',
    });
    setMsgModal(null);
    setModal('editar');
  };

  const cerrar = () => { setModal(null); setSeleccionado(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const guardar = async () => {
    setGuardando(true); setMsgModal(null);
    try {
      const body = {
        ...form,
        PrecioCompra: Number(form.PrecioCompra),
        PrecioVenta:  Number(form.PrecioVenta),
        StockMinimo:  Number(form.StockMinimo),
        IdCategoria:  Number(form.IdCategoria),
        IdTalla:      form.IdTalla  ? Number(form.IdTalla)  : undefined,
        IdColor:      form.IdColor  ? Number(form.IdColor)  : undefined,
        StockInicial: Number(form.StockInicial),
      };
      if (modal === 'crear') {
        await apiFetch('/productos', { method: 'POST', body: JSON.stringify(body) });
      } else if (modal === 'editar' && seleccionado) {
        await apiFetch(`/productos/${seleccionado.IdProducto}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      setMsgModal('✅ Guardado correctamente');
      cargar();
      setTimeout(cerrar, 1000);
    } catch (e: any) {
      setMsgModal(`❌ ${e.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (p: Producto) => {
    try {
      await apiFetch(`/productos/${p.IdProducto}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: p.Estado === 1 ? 0 : 1 }),
      });
      cargar();
    } catch (e: any) { alert(e.message); }
  };

  const activos   = productos.filter(p => p.Estado === 1).length;
  const inactivos = productos.filter(p => p.Estado === 0).length;

  if (cargando) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Cargando productos...</div>
  );
  if (error) return (
    <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm"> {error}</div>
  );

  return (
    <div className="space-y-6">

      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión del catálogo de productos</p>
        </div>
        <button onClick={abrirCrear}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-purple-50 w-fit mb-3"><Package size={22} className="text-purple-500" /></div>
          <p className="text-xs text-gray-400">Total productos</p>
          <p className="text-2xl font-bold text-gray-800">{productos.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-green-50 w-fit mb-3"><Package size={22} className="text-green-500" /></div>
          <p className="text-xs text-gray-400">Activos</p>
          <p className="text-2xl font-bold text-gray-800">{activos}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="p-2.5 rounded-xl bg-gray-100 w-fit mb-3"><Package size={22} className="text-gray-400" /></div>
          <p className="text-xs text-gray-400">Inactivos</p>
          <p className="text-2xl font-bold text-gray-800">{inactivos}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="mb-4">
          <input type="text" placeholder="Buscar por nombre, código o categoría..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-3 pr-4">Código</th>
                <th className="pb-3 pr-4">Producto</th>
                <th className="pb-3 pr-4">Categoría</th>
                <th className="pb-3 pr-4">P. Compra</th>
                <th className="pb-3 pr-4">P. Venta</th>
                <th className="pb-3 pr-4">Stock mín.</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrado.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No se encontraron productos</td></tr>
              ) : filtrado.map(p => (
                <tr key={p.IdProducto} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-500">{p.Codigo}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-800">{p.NombreProducto}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[180px]">{p.Descripcion}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{p.NombreCategoria}</td>
                  <td className="py-3 pr-4 text-gray-700">S/ {Number(p.PrecioCompra).toFixed(2)}</td>
                  <td className="py-3 pr-4 font-medium text-gray-800">S/ {Number(p.PrecioVenta).toFixed(2)}</td>
                  <td className="py-3 pr-4 text-gray-500">{p.StockMinimo}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.Estado === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>{p.Estado === 1 ? 'Activo' : 'Inactivo'}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => abrirEditar(p)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500" title="Editar">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => toggleEstado(p)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.Estado === 1 ? 'hover:bg-red-50 text-red-400' : 'hover:bg-green-50 text-green-500'
                        }`} title={p.Estado === 1 ? 'Desactivar' : 'Activar'}>
                        {p.Estado === 1 ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear / editar */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-gray-800">
                {modal === 'crear' ? 'Nuevo Producto' : 'Editar Producto'}
              </h2>
              <button type = "button" onClick={cerrar} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">

              {/* Código + Categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Código</label>
                  <input name="Codigo" value={form.Codigo} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="P009" />
                  <p className="text-xs text-gray-400 mt-0.5">Se genera automáticamente</p>
                </div>
                <div>
                  <label htmlFor="IdCategoria" className="text-xs text-gray-500 mb-1 block">Categoría *</label>
                  <select id = "IdCategoria" name="IdCategoria" value={form.IdCategoria} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => (
                      <option key={c.IdCategoria} value={c.IdCategoria}>{c.NombreCategoria}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label htmlFor="NombreProducto" className="text-xs text-gray-500 mb-1 block">Nombre del producto *</label>
                <input id = "NombreProducto" name="NombreProducto" value={form.NombreProducto} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="Nombre del producto" />
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="Descripcion" className="text-xs text-gray-500 mb-1 block">Descripción</label>
                <textarea id = "Descripcion" name="Descripcion" value={form.Descripcion} onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                  placeholder="Descripción opcional" />
              </div>

              {/* Precios + Stock mínimo */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Precio compra</label>
                  <input name="PrecioCompra" type="number" min="0" step="0.01"
                    value={form.PrecioCompra} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Precio venta *</label>
                  <input name="PrecioVenta" type="number" min="0" step="0.01"
                    value={form.PrecioVenta} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Stock mínimo</label>
                  <input name="StockMinimo" type="number" min="0"
                    value={form.StockMinimo} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="1" />
                </div>
              </div>

              {/* Talla + Color (solo al crear) */}
              {modal === 'crear' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="IdTalla" className="text-xs text-gray-500 mb-1 block">Talla</label>
                    <select id = "IdTalla" name="IdTalla" value={form.IdTalla} onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                      <option value="">Sin talla</option>
                      {tallas.map(t => (
                        <option key={t.IdTalla} value={t.IdTalla}>{t.NombreTalla}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="IdColor" className="text-xs text-gray-500 mb-1 block">Color</label>
                    <select id = "IdColor" name="IdColor" value={form.IdColor} onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300">
                      <option value="">Sin color</option>
                      {colores.map(c => (
                        <option key={c.IdColor} value={c.IdColor}>{c.NombreColor}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Stock inicial (solo al crear) */}
              {modal === 'crear' && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Stock inicial</label>
                  <input name="StockInicial" type="number" min="0"
                    value={form.StockInicial} onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                    placeholder="0" />
                  <p className="text-xs text-gray-400 mt-0.5">Cantidad disponible al registrar el producto</p>
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
    </div>
  );
}