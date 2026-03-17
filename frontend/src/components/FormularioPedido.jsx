'use client';

import { useEffect, useState } from 'react';
import axiosClient from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function FormularioPedido() {
    const router = useRouter();
    const [jornadaActiva, setJornadaActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loteId, setLoteId] = useState('');
    const [referencia, setReferencia] = useState('');

    useEffect(() => {
        const fetchJornadas = async () => {
            try {
                const response = await axiosClient.get('/jornadas');
                const activa = response.data.find(j => j.estado !== 'finalizada');
                setJornadaActiva(activa);
            } catch (error) {
                console.error('Error cargando jornada', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJornadas();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loteSeleccionado = jornadaActiva.lotes.find(l => l.id.toString() === loteId);
        const montoBs = loteSeleccionado.precio_usd * jornadaActiva.tasa_bcv_dia;

        try {
            await axiosClient.post('/pedidos', {
                jornada_id: jornadaActiva.id,
                lote_id: loteId,
                referencia_pago: referencia,
                monto_bs: montoBs
            });
            alert('¡Pedido registrado! El coordinador verificará su pago pronto.');
            router.push('/dashboard/pedidos');
        } catch (error) {
            alert('Error al registrar el pedido. Revise la referencia.');
            console.error(error);
        }
    };

    if (loading) return <div>Cargando formulario...</div>;
    if (!jornadaActiva) return <div className="p-4 bg-yellow-50 text-yellow-800 rounded">No hay operativos abiertos actualmente.</div>;

    const loteSeleccionado = jornadaActiva.lotes.find(l => l.id.toString() === loteId);
    const aPagarBs = loteSeleccionado ? (loteSeleccionado.precio_usd * jornadaActiva.tasa_bcv_dia).toFixed(2) : 0;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Solicitar Gas</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800 font-semibold mb-1">Tasa BCV del operativo: {jornadaActiva.tasa_bcv_dia} Bs</p>
                    <p className="text-xs text-blue-600">Por favor, realice su pago móvil antes de llenar este formulario.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seleccione la Bombona</label>
                    <select required value={loteId} onChange={(e) => setLoteId(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3">
                        <option value="">-- Seleccione una opción --</option>
                        {jornadaActiva.lotes?.map(lote => (
                            <option key={lote.id} value={lote.id}>
                                {lote.capacidad} - {lote.marca} (${lote.precio_usd})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referencia de Pago Móvil (Últimos 6 dígitos)</label>
                    <input type="text" required maxLength="6" value={referencia} onChange={(e) => setReferencia(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3" placeholder="Ej: 123456" />
                </div>

                {loteSeleccionado && (
                    <div className="bg-gray-50 p-4 rounded-lg text-center border">
                        <p className="text-gray-500 text-sm">Monto a verificar:</p>
                        <p className="text-3xl font-bold text-green-600">{aPagarBs} Bs</p>
                    </div>
                )}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                    Reportar Pago
                </button>
            </form>
        </div>
    );
}