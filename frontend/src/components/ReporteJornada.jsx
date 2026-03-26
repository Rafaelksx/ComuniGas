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

            {/* Tabla de Registros Compactada */}
            <table className="w-full text-left border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100 border-b-2 border-black text-[10px] uppercase">
                        <th className="py-1.5 px-1 border-r border-gray-300 w-6 text-center">N°</th>
                        <th className="py-1.5 px-1.5 border-r border-gray-300 leading-tight">Vecino / Casa</th>
                        <th className="py-1.5 px-1.5 border-r border-gray-300 leading-tight text-center">Cilindros</th>
                        <th className="py-1.5 px-1.5 border-r border-gray-300 leading-tight text-center">Pago</th>
                        <th className="py-1.5 px-1.5 border-r border-gray-300 leading-tight text-center">Total (Bs)</th>
                        <th className="py-1.5 px-1.5 text-center w-20 leading-tight">Firma / Checks</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                    {pedidos.map((pedido, index) => {
                        // Concatenar descripción de cilindros con su marca (ej. 1x 10kg Tigasco)
                        const descCilindros = pedido.detalles.map(d => `${d.cantidad}x ${d.lote?.capacidad} ${d.lote?.marca}`).join(', ');
                        
                        // Limpiar sufijo de email ficticio
                        const emailLimpio = pedido.user?.email?.replace('@comunigas.local', '') || 'N/A';

                        // Estado pago legible
                        let pagoTexto = "PENDIENTE";
                        if(pedido.estado_pago === 'verificado') pagoTexto = "PAGADO";
                        else if(pedido.estado_pago === 'por_verificar') pagoTexto = "XR VERIFICAR";
                        else if(pedido.estado_pago === 'rechazado') pagoTexto = "RECHAZADO";

                        return (
                            <tr key={pedido.id} className="print-avoid-break">
                                <td className="py-1.5 px-1 border-r border-gray-300 text-center font-bold text-gray-500">{index + 1}</td>
                                <td className="py-1.5 px-1.5 border-r border-gray-300">
                                    <p className="font-bold text-sm leading-none mb-0.5">{pedido.user?.name}</p>
                                    <p className="text-[10px] text-gray-600 leading-none mb-0.5">Casa: {pedido.user?.identificador_vivienda || 'N/A'}</p>
                                    <p className="text-[10px] text-gray-500 leading-none">CI/Tel: <span className="font-mono">{emailLimpio}</span></p>
                                </td>
                                <td className="py-1.5 px-1.5 border-r border-gray-300 font-medium text-[11px] text-center">
                                    {descCilindros}
                                </td>
                                <td className="py-1.5 px-1.5 border-r border-gray-300 text-center">
                                    <p className={`font-bold text-[10px] ${pedido.estado_pago === 'verificado' ? 'text-black' : 'text-gray-500'}`}>
                                        {pagoTexto}
                                    </p>
                                    {pedido.pagos && pedido.pagos[0] && (
                                        <p className="text-[9px] font-mono mt-0.5 leading-none tracking-tighter text-gray-700">Ref: {pedido.pagos[0].referencia}</p>
                                    )}
                                </td>
                                <td className="py-1.5 px-1.5 border-r border-gray-300 font-bold text-center text-[11px] whitespace-nowrap">
                                    {pedido.total_ves} Bs
                                </td>
                                <td className="py-1 flex flex-col items-center justify-center gap-1.5 min-w-[5rem]">
                                    <div className="w-3.5 h-3.5 border border-black"></div>
                                    <hr className="w-12 border-t border-gray-400 mt-1" />
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
