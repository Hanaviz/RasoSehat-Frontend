import React from 'react';

export default function HeroSidebar() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-green-600 to-green-800 animated-gradient">
      {/* Decorative animated shapes + small CSS for animations (kept inside component for simplicity) */}
      <style>{`
        .animated-gradient { background-size: 200% 200%; animation: gradientShift 10s ease-in-out infinite; }
        @keyframes gradientShift { 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }
        .logo-float { animation: float 4.5s ease-in-out infinite; transform-origin: center; }
        @keyframes float { 0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)} }
        .bg-shape { position: absolute; filter: blur(34px); opacity: 0.14; pointer-events: none; transform: translate3d(0,0,0); }
        @media (min-width: 1024px) {
          .shape-1 { right: -8%; top: -6%; width: 320px; height: 320px; animation: float 8s ease-in-out infinite; }
          .shape-2 { left: -6%; bottom: -10%; width: 220px; height: 220px; animation: float 10s ease-in-out infinite; }
        }
        @media (max-width: 1023px) {
          .shape-1, .shape-2 { display: none; }
        }
      `}</style>

      <div className="bg-shape shape-1" style={{background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0) 40%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.06), rgba(0,0,0,0) 40%)'}} />
      <div className="bg-shape shape-2" style={{background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), rgba(255,255,255,0) 35%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.04), rgba(0,0,0,0) 40%)'}} />

      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M50 10 Q70 30 50 50 Q30 30 50 10\" fill=\"%23ffffff\" opacity=\"0.05\"/%3E%3C/svg%3E')",
          backgroundSize: '150px 150px'
        }}
      ></div>
      
      <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
              {/* Use the app logo from public/ as the avatar so it contrasts with the green background */}
              <img
                src="/logo-RasoSehat.png"
                alt="RasoSehat"
                className="w-full h-full object-contain transform scale-125 transition-transform duration-300 ease-out logo-float"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">RasoSehat</h2>
              <p className="text-sm text-green-100">Hidup Sehat, Hidup Bahagia</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Solusi Cerdas Atasi Mencari Makanan Sehat Melalui Platform Digital Panduan Lokasi
            </h1>
            <p className="text-lg text-green-50 leading-relaxed">
              Temukan restoran dan penjual makanan sehat terdekat dengan mudah. 
              Bergabunglah dengan komunitas pencinta hidup sehat di sekitar Universitas Andalas.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs font-semibold">
                  {i}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-semibold">500+ Pengguna Aktif</p>
              <p className="text-green-100">Bergabung dengan komunitas kami</p>
            </div>
          </div>
        </div>

        <div className="text-sm text-green-100">
          © 2025 RasoSehat. Semua hak dilindungi
        </div>
      </div>
    </div>
  );
}