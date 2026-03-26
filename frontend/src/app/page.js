import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">

      {/* Navbar Minimalista */}
      <nav className="w-full absolute top-0 p-6 flex justify-between items-center max-w-7xl mx-auto z-50">
        <div className="flex items-center gap-2 text-indigo-700 font-black text-2xl tracking-tighter">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          ComuniGas
        </div>
        <div className="gap-4 hidden sm:flex">
          <Link href="/login" className="text-gray-600 font-semibold hover:text-indigo-600 transition px-4 py-2">Ingresar</Link>
          <Link href="/registro" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition">Registrar mi casa</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto w-full pt-28 pb-16 z-10">

        <div className="bg-blue-100 text-blue-800 px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-8 flex items-center justify-center gap-2 shadow-sm border border-blue-200">
          <svg className="w-5 h-5 text-blue-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Plataforma Virtual
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
          El gas comunal de tu sector, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">organizado y transparente.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Olvida las listas de papel, el desorden y las esperas. Pide tus cilindros de gas, reporta el pago móvil y
          visualiza cuando llegará el camión a tu urbanización en estricto tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4 justify-center">
          <Link href="/registro" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            Inscríbete Hoy Mismo
          </Link>
          <Link href="/login" className="flex items-center justify-center gap-2 bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-all">
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            Ya tengo una cuenta
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-3 gap-8 mt-24 text-left p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl">
          <div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-blue-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Pagos Precisos</h3>
            <p className="text-gray-600 text-sm">Calcula automáticamente tu transferencia en Bolívares usando la tasa vigente del BCV durante la apertura.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-green-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Inventario Automatizado</h3>
            <p className="text-gray-600 text-sm">Los coordinadores totalizan la masa exacta de cilindros requeridos agrupados por marca y tamaño antes del operativo.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-yellow-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Transparencia Total</h3>
            <p className="text-gray-600 text-sm">Tus pagos son previsualizados a través de un Modal en la nube para ser aprobados o rechazados por auditoría gubernamental.</p>
          </div>
        </div>

      </main>

      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 -z-10 opacity-30 pointer-events-none mt-[-100px] mr-[-100px]">
        <svg width="400" height="400" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="200" r="200" fill="url(#paint0_radial)" /><defs><radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(200 200) rotate(90) scale(200)"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#818CF8" stopOpacity="0" /></radialGradient></defs></svg>
      </div>
      <div className="absolute bottom-0 left-0 -z-10 opacity-20 pointer-events-none mb-[-100px] ml-[-100px]">
        <svg width="300" height="300" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="150" cy="150" r="150" fill="url(#paint0_radial2)" /><defs><radialGradient id="paint0_radial2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 150) rotate(90) scale(150)"><stop stopColor="#3b82f6" /><stop offset="1" stopColor="#60a5fa" stopOpacity="0" /></radialGradient></defs></svg>
      </div>

    </div>
  );
}
