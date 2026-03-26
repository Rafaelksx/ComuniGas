export default function ReporteJornada({ jornada, pedidos }) {
    if (!jornada || !pedidos) return null;

    // Calcular totales globales del reporte
    const totalCilindros = pedidos.reduce((acc, p) => acc + p.detalles.reduce((sum, d) => sum + d.cantidad, 0), 0);
    const montoTotalBs = pedidos.reduce((acc, p) => acc + Number(p.total_ves), 0);
    const montoTotalUsd = pedidos.reduce((acc, p) => acc + Number(p.total_usd), 0);

    return (
        <div id="reporte-print-area" className="hidden print:block w-full bg-white text-black p-2 font-sans">
            {/* Header del Reporte */}
            <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">Reporte de Jornada de Gas</h1>
                    <h2 className="text-lg font-semibold text-gray-800">Comunidad: {jornada.comunidad?.nombre || "ComuniGas"}</h2>
                    <p className="text-sm mt-1">Fecha de Operativo: {new Date(jornada.fecha_apertura).toLocaleDateString()}</p>
                    <p className="text-sm">Estatus: <span className="uppercase font-bold">{jornada.estado.replace('_', ' ')}</span></p>
                </div>
                <div className="text-right text-sm border border-gray-300 p-3 rounded-md bg-gray-50">
                    <p><span className="font-bold">Total Vecinos:</span> {pedidos.length}</p>
                    <p><span className="font-bold">Total Cilindros:</span> {totalCilindros}</p>
                    <p><span className="font-bold">Total Recaudado:</span> {montoTotalBs.toFixed(2)} Bs (${montoTotalUsd.toFixed(2)})</p>
                </div>
            </div>

            {/* Tabla de Registros */}
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-100 border-b-2 border-black text-xs uppercase">
                        <th className="py-3 px-2 border-r border-gray-300 w-8 text-center">N°</th>
                        <th className="py-3 px-2 border-r border-gray-300">Vecino / Casa</th>
                        <th className="py-3 px-2 border-r border-gray-300">Cilindros</th>
                        <th className="py-3 px-2 border-r border-gray-300">Pago</th>
                        <th className="py-3 px-2 border-r border-gray-300">Total (Bs)</th>
                        <th className="py-3 px-2 text-center w-24">Firma / Checks</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                    {pedidos.map((pedido, index) => {
                        // Concatenar descripción de cilindros
                        const descCilindros = pedido.detalles.map(d => `${d.cantidad}x ${d.lote?.capacidad}`).join(', ');
                        
                        // Estado pago legible
                        let pagoTexto = "PENDIENTE";
                        if(pedido.estado_pago === 'verificado') pagoTexto = "PAGADO";
                        else if(pedido.estado_pago === 'por_verificar') pagoTexto = "POR VERIFICAR";
                        else if(pedido.estado_pago === 'rechazado') pagoTexto = "RECHAZADO";

                        return (
                            <tr key={pedido.id} className="print-avoid-break">
                                <td className="py-3 px-2 border-r border-gray-300 text-center font-bold text-gray-500">{index + 1}</td>
                                <td className="py-3 px-2 border-r border-gray-300">
                                    <p className="font-bold text-base">{pedido.user?.name}</p>
                                    <p className="text-xs text-gray-600">Casa: {pedido.user?.identificador_vivienda || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">CI/Tel: {pedido.user?.email}</p>
                                </td>
                                <td className="py-3 px-2 border-r border-gray-300 font-medium">
                                    {descCilindros}
                                </td>
                                <td className="py-3 px-2 border-r border-gray-300">
                                    <p className={`font-bold text-xs ${pedido.estado_pago === 'verificado' ? 'text-black' : 'text-gray-500'}`}>
                                        {pagoTexto}
                                    </p>
                                    {pedido.pagos && pedido.pagos[0] && (
                                        <p className="text-xs font-mono mt-0.5">Ref: {pedido.pagos[0].referencia}</p>
                                    )}
                                </td>
                                <td className="py-3 px-2 border-r border-gray-300 font-bold">
                                    {pedido.total_ves} Bs
                                </td>
                                <td className="py-3 px-2 flex flex-col items-center justify-center gap-2 h-full min-h-[4rem]">
                                    <div className="w-4 h-4 border border-black"></div>
                                    <hr className="w-16 border-t border-gray-400 mt-2" />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Pie de Firma Global */}
            <div className="mt-16 pt-8 flex justify-between items-center px-12 print-avoid-break">
                <div className="text-center">
                    <hr className="w-48 border-t-2 border-black mb-2 mx-auto" />
                    <p className="font-bold text-sm">Firma del Coordinador</p>
                    <p className="text-xs text-gray-500 mt-1">Responsable de Recepción</p>
                </div>
                <div className="text-center">
                    <hr className="w-48 border-t-2 border-black mb-2 mx-auto" />
                    <p className="font-bold text-sm">Sello del Consejo Comunal</p>
                    <p className="text-xs text-gray-500 mt-1">Comité de Energía e Hidrocarburos</p>
                </div>
            </div>
            
            <div className="text-center mt-8 text-xs text-gray-400">
                Documento generado automáticamente por ComuniGas System.
            </div>
        </div>
    );
}
