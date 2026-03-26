'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axios';

const BANCOS_VENEZUELA = [
    'Banco de Venezuela (BDV)',
    'Banesco',
    'Banco Mercantil',
    'BBVA Provincial',
    'Banco Bicentenario',
    'Banco del Tesoro',
    'Banco Exterior',
    'Banco Nacional de Crédito (BNC)',
    'Banplus',
    'Bancamiga',
    'Sofitasa',
    'Banco Agrícola de Venezuela',
    'Mi Banco',
    'Bancrecer',
    'Banfanb',
    'Vetasol',
    '100% Banco',
];

export default function FormularioPedido() {
    const router = useRouter();
    const [jornada, setJornada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // carrito: { [loteId]: cantidad }
    const [carrito, setCarrito] = useState({});
    const [comprobante, setComprobante] = useState(null);
    const [comprobantePreview, setComprobantePreview] = useState(null);
    const [formData, setFormData] = useState({
        referencia_pago: '',
        banco_origen: '',
        telefono_pago: '',
        monto_bs_vecino: '',
    });

    useEffect(() => {
        const fetchJornada = async () => {
            try {
                const res = await axiosClient.get('/jornadas');
                const jornadaActiva = res.data.find(j => j.estado === 'abierta');
                if (jornadaActiva) {
                    setJornada(jornadaActiva);
                } else {
                    setError('No hay ninguna jornada de gas abierta en este momento.');
                }
            } catch {
                setError('Error al cargar la información de la jornada.');
            } finally {
                setLoading(false);
            }
        };
        fetchJornada();
    }, []);

    // Calcular totales del carrito
    const calcularTotales = () => {
        if (!jornada) return { totalVes: 0, items: [] };
        let totalVes = 0;
        const items = [];
        Object.entries(carrito).forEach(([loteId, cantidad]) => {
            if (cantidad <= 0) return;
            const lote = jornada.lotes.find(l => l.id.toString() === loteId);
            if (!lote) return;
            const subtotalVes = parseFloat((lote.precio_usd * jornada.tasa_bcv_dia * cantidad).toFixed(2));
            totalVes += subtotalVes;
            items.push({ lote, cantidad, subtotalVes });
        });
        return { totalVes: totalVes.toFixed(2), items };
    };

    const setCantidad = (loteId, delta) => {
        setCarrito(prev => {
            const actual = prev[loteId] || 0;
            const nueva = Math.max(0, actual + delta);
            if (nueva === 0) {
                const { [loteId]: _, ...resto } = prev;
                return resto;
            }
            return { ...prev, [loteId]: nueva };
        });
    };

    const { totalVes, items: itemsCarrito } = calcularTotales();
    const carritoVacio = itemsCarrito.length === 0;

    // Sincronizar el monto con el total calculado cuando cambia el carrito
    useEffect(() => {
        setFormData(prev => ({ ...prev, monto_bs_vecino: totalVes }));
    }, [totalVes]);

    const handleComprobanteChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setComprobante(file);
        setComprobantePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (carritoVacio) return;
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('jornada_id', jornada.id);
            data.append('referencia_pago', formData.referencia_pago);
            data.append('banco_origen', formData.banco_origen);
            data.append('telefono_pago', formData.telefono_pago);
            data.append('monto_bs_vecino', formData.monto_bs_vecino);
            // Enviar cada item del carrito
            itemsCarrito.forEach((item, idx) => {
                data.append(`items[${idx}][lote_id]`, item.lote.id);
                data.append(`items[${idx}][cantidad]`, item.cantidad);
            });
            if (comprobante) data.append('comprobante', comprobante);

            await axiosClient.post('/pedidos', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            router.push('/dashboard/pedidos');
        } catch (err) {
            const errorDetalle = err.response?.data?.error || '';
            const msg = err.response?.data?.message || 'Error al registrar el pedido.';
            alert(`${msg}\n\n${errorDetalle}`);
            console.error('Error del servidor:', err.response?.data);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-16">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Buscando jornada activa...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold mb-2">Operativo Cerrado</h2>
            <p>{error}</p>
        </div>
    );

    const tieneDatosPago = jornada?.pago_movil_banco || jornada?.pago_movil_telefono;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Solicitar Gas 🛒</h1>
                <p className="text-gray-500 mt-1">
                    Operativo activo — Tasa BCV: <strong>{jornada.tasa_bcv_dia} Bs/$</strong>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMNA PRINCIPAL */}
                <div className="lg:col-span-2 space-y-6">

                    {/* PASO 1: Catálogo de cilindros */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-7 h-7 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center">1</span>
                            Selecciona tus cilindros
                        </h2>
                        <div className="space-y-3">
                            {jornada.lotes.map(lote => {
                                const loteId = lote.id.toString();
                                const cantidad = carrito[loteId] || 0;
                                const precioBs = (lote.precio_usd * jornada.tasa_bcv_dia).toFixed(2);
                                const enCarrito = cantidad > 0;
                                return (
                                    <div key={lote.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${enCarrito ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800">{lote.capacidad} — {lote.marca}</p>
                                            <p className="text-sm text-gray-500">${lote.precio_usd} USD &nbsp;·&nbsp; <span className="text-blue-600 font-semibold">{precioBs} Bs/unidad</span></p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCantidad(loteId, -1)}
                                                disabled={cantidad === 0}
                                                className="w-9 h-9 rounded-full border-2 border-gray-300 text-gray-600 font-bold text-lg hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
                                            >−</button>
                                            <span className={`w-6 text-center font-bold text-lg ${enCarrito ? 'text-blue-700' : 'text-gray-400'}`}>
                                                {cantidad}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setCantidad(loteId, 1)}
                                                className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center"
                                            >+</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* PASO 2: Formulario de pago (solo si hay items) */}
                    {!carritoVacio && (
                        <form id="form-pedido" onSubmit={handleSubmit}>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="w-7 h-7 bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center">2</span>
                                    Datos de tu pago
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Banco desde el que pagaste</label>
                                        <select required value={formData.banco_origen}
                                            onChange={e => setFormData({ ...formData, banco_origen: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800">
                                            <option value="">Selecciona tu banco...</option>
                                            {BANCOS_VENEZUELA.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono desde el que pagaste</label>
                                        <input type="tel" required placeholder="Ej: 04141234567"
                                            value={formData.telefono_pago}
                                            onChange={e => setFormData({ ...formData, telefono_pago: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto que pagaste (Bs)</label>
                                        <input type="number" step="0.01" required
                                            value={formData.monto_bs_vecino}
                                            onChange={e => setFormData({ ...formData, monto_bs_vecino: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Últimos 6 dígitos de la referencia</label>
                                        <input type="text" required maxLength={10} placeholder="Ej: 123456"
                                            value={formData.referencia_pago}
                                            onChange={e => setFormData({ ...formData, referencia_pago: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg tracking-widest" />
                                    </div>
                                </div>

                                {/* Comprobante */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Comprobante de pago (opcional)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition">
                                        {comprobantePreview ? (
                                            <img src={comprobantePreview} alt="Preview" className="h-full w-full object-contain rounded-xl p-1" />
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-3xl">📎</p>
                                                <p className="text-sm text-gray-500 mt-1">Haz clic para subir imagen</p>
                                                <p className="text-xs text-gray-400">PNG, JPG — máx. 5MB</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleComprobanteChange} />
                                    </label>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* COLUMNA LATERAL */}
                <div className="space-y-4">

                    {/* Resumen del carrito */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-4">
                        <h3 className="font-semibold text-gray-800 mb-4">Tu pedido</h3>

                        {carritoVacio ? (
                            <p className="text-sm text-gray-400 italic text-center py-6">Agrega cilindros para ver el resumen</p>
                        ) : (
                            <div className="space-y-2 mb-4">
                                {itemsCarrito.map(({ lote, cantidad, subtotalVes }) => (
                                    <div key={lote.id} className="flex justify-between items-start text-sm">
                                        <div>
                                            <p className="font-medium text-gray-800">{lote.capacidad}</p>
                                            <p className="text-gray-500">{cantidad} × {(lote.precio_usd * jornada.tasa_bcv_dia).toFixed(2)} Bs</p>
                                        </div>
                                        <span className="font-semibold text-gray-800">{subtotalVes} Bs</span>
                                    </div>
                                ))}
                                <div className="border-t pt-3 mt-2 flex justify-between font-bold text-base">
                                    <span>Total</span>
                                    <span className="text-blue-600 text-lg">{totalVes} Bs</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            form="form-pedido"
                            disabled={carritoVacio || submitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition"
                        >
                            {submitting ? 'Enviando...' : '✅ Reportar Pago'}
                        </button>
                    </div>

                    {/* Datos de pago del coordinador */}
                    {tieneDatosPago && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
                            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <span>📲</span> Realiza tu pago aquí
                            </h3>
                            <div className="space-y-2 text-sm">
                                {jornada.pago_movil_banco && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Banco</span>
                                        <span className="font-bold text-blue-900">{jornada.pago_movil_banco}</span>
                                    </div>
                                )}
                                {jornada.pago_movil_telefono && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Teléfono</span>
                                        <span className="font-bold text-blue-900 font-mono">{jornada.pago_movil_telefono}</span>
                                    </div>
                                )}
                                {jornada.pago_movil_cedula && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Cédula</span>
                                        <span className="font-bold text-blue-900">{jornada.pago_movil_cedula}</span>
                                    </div>
                                )}
                                {jornada.pago_movil_nombre && (
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">A nombre de</span>
                                        <span className="font-bold text-blue-900">{jornada.pago_movil_nombre}</span>
                                    </div>
                                )}
                                {!carritoVacio && (
                                    <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                                        <span className="text-blue-600 font-semibold">Monto exacto</span>
                                        <span className="font-bold text-blue-700 text-base">{totalVes} Bs</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}