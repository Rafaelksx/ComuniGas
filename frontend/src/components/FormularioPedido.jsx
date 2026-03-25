'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosClient from '@/lib/axios';

export default function FormularioPedido() {
    const router = useRouter();
    const [jornada, setJornada] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        lote_id: '',
        referencia_pago: '',
    });

    // Cargar la jornada activa para saber los precios y la tasa
    useEffect(() => {
        const fetchJornada = async () => {
            try {
                // Pedimos todas las jornadas y buscamos la que esté abierta
                const res = await axiosClient.get('/jornadas');
                const jornadaActiva = res.data.find(j => j.estado === 'abierta');

                if (jornadaActiva) {
                    setJornada(jornadaActiva);
                } else {
                    setError('No hay ninguna jornada de gas abierta en este momento.');
                }
            } catch (err) {
                setError('Error al cargar la información de la jornada.');
            } finally {
                setLoading(false);
            }
        };
        fetchJornada();
    }, []);

    // Calcular el monto en Bs en tiempo real según el lote seleccionado
    const getMontoBs = () => {
        if (!formData.lote_id || !jornada) return 0;
        const lote = jornada.lotes.find(l => l.id.toString() === formData.lote_id);
        if (!lote) return 0;
        return (lote.precio_usd * jornada.tasa_bcv_dia).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                jornada_id: jornada.id,
                lote_id: formData.lote_id,
                referencia_pago: formData.referencia_pago,
                monto_bs: getMontoBs()
            };

            await axiosClient.post('/pedidos', payload);
            alert('¡Tu pedido ha sido registrado con éxito! Está en espera de verificación.');

            // Redirigir a la lista de "Mis Pedidos"
            router.push('/dashboard/pedidos');

        } catch (error) {
            alert(error.response?.data?.message || 'Error al registrar el pedido.');
        }
    };

    if (loading) return <div className="p-8">Buscando jornadas activas...</div>;

    if (error) return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 shadow-sm text-center">
            <h2 className="text-xl font-bold mb-2">Operativo Cerrado</h2>
            <p>{error}</p>
        </div>
    );

    const montoPagar = getMontoBs();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Solicitar Bombona</h1>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <p><strong>Operativo Activo:</strong> {new Date(jornada.fecha_apertura).toLocaleDateString()}</p>
                <p><strong>Tasa BCV de hoy:</strong> {jornada.tasa_bcv_dia} Bs</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona el tipo de cilindro</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jornada.lotes.map(lote => (
                            <label
                                key={lote.id}
                                className={`border rounded-lg p-4 cursor-pointer transition flex justify-between items-center
                                    ${formData.lote_id === lote.id.toString() ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <div>
                                    <input
                                        type="radio"
                                        name="lote_id"
                                        value={lote.id}
                                        className="sr-only"
                                        onChange={(e) => setFormData({ ...formData, lote_id: e.target.value })}
                                        required
                                    />
                                    <span className="block font-bold text-gray-800">{lote.capacidad} - {lote.marca}</span>
                                    <span className="block text-sm text-gray-500">Ref: ${lote.precio_usd}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-blue-600">
                                        {(lote.precio_usd * jornada.tasa_bcv_dia).toFixed(2)} Bs
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {formData.lote_id && (
                    <div className="pt-4 border-t">
                        <h3 className="font-semibold text-gray-800 mb-4">Datos del Pago Móvil</h3>

                        <div className="bg-gray-50 p-4 rounded-lg border mb-4 text-sm text-gray-600">
                            <p>Realiza un pago móvil por exactamente <strong>{montoPagar} Bs</strong> a los datos indicados por tu Consejo Comunal.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Referencia (Últimos 6 dígitos)</label>
                            <input
                                type="text" required
                                placeholder="Ej: 123456"
                                value={formData.referencia_pago}
                                onChange={(e) => setFormData({ ...formData, referencia_pago: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={!formData.lote_id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition w-full md:w-auto"
                    >
                        Reportar Pago y Pedir Gas
                    </button>
                </div>
            </form>
        </div>
    );
}