import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  ShoppingCart, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Car, 
  Bike, 
  Gift, 
  ArrowRight,
  Info,
  X,
  PhoneCall,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PromotionalBannerCarouselProps {
  onStartRedeeming?: () => void;
}

export const PromotionalBannerCarousel: React.FC<PromotionalBannerCarouselProps> = ({
  onStartRedeeming
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = 2;

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlay) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlay]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleActionClick = () => {
    if (onStartRedeeming) {
      onStartRedeeming();
    } else {
      const catalogEl = document.getElementById('catalog-products-grid') || document.querySelector('#catalog-filters');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <div 
        className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950 group select-none"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        {/* Slide Viewport */}
        <div className="relative min-h-[460px] sm:min-h-[400px] md:min-h-[380px] lg:min-h-[360px] flex items-stretch">
          <AnimatePresence mode="wait">
            {currentSlide === 0 ? (
              /* SLIDE 1: REDIMIR ES MUY FÁCIL */
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="w-full h-full relative flex flex-col lg:flex-row items-center justify-between p-6 sm:p-8 md:p-10 bg-gradient-to-br from-[#06122d] via-[#0b1e4a] to-[#122e6e] text-white overflow-hidden"
              >
                {/* Background Ambient Lights */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
                
                {/* Left Side: Instructions & Steps */}
                <div className="relative z-10 w-full lg:w-3/5 space-y-5">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[11px] font-bold tracking-wider uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Guía Rápida de Canje</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                      REDIMIR ES{' '}
                      <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                        MUY FÁCIL
                      </span>
                    </h2>
                    
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                      Con <strong className="text-white font-bold">SuperGIROS</strong>, acumulas puntos por cada servicio o venta y los conviertes en grandes premios.
                    </p>
                  </div>

                  {/* 3 Step Sequence */}
                  <div className="space-y-3 pt-1">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3.5 group/step">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-serif text-2xl font-black text-amber-400 w-5 text-right">
                          1
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-inner">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 leading-snug pt-1">
                        <strong className="text-white font-bold">Entra a nuestro “catálogo”</strong> y escoge la categoría que quieras redimir.
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3.5 group/step">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-serif text-2xl font-black text-amber-400 w-5 text-right">
                          2
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-inner">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 leading-snug pt-1">
                        <strong className="text-white font-bold">Selecciona el premio de tu preferencia</strong> y da clic en “Agregar al carrito”.
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3.5 group/step">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-serif text-2xl font-black text-amber-400 w-5 text-right">
                          3
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-inner">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 leading-snug pt-1">
                        <strong className="text-white font-bold">Ve al carrito</strong>, da clic en redimir y acepta tu canje o compra al instante.
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleActionClick}
                      className="px-6 py-3 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-b from-white via-slate-100 to-slate-200 hover:from-white hover:to-slate-300 text-slate-900 shadow-lg shadow-black/40 border-2 border-white flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <span>¡EMPIEZA A REDIMIR AHORA!</span>
                      <ArrowRight className="w-4 h-4 text-blue-900 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Right Side: Visual Showcase of Prizes & SuperSOAT */}
                <div className="relative z-10 w-full lg:w-2/5 mt-6 lg:mt-0 flex flex-col items-center justify-center">
                  {/* Floating Glass Billboard */}
                  <div className="relative w-full max-w-sm p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
                    {/* Brand header */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border border-blue-300 flex items-center justify-center text-[10px] font-black text-white">
                        SG
                      </div>
                      <span className="text-xs font-black tracking-wider text-white">
                        SuperGIROS<sup className="text-[9px]">®</sup>
                      </span>
                    </div>

                    {/* 3D SuperSOAT + Poliza badge */}
                    <div className="py-2">
                      <div className="text-3xl sm:text-4xl font-black tracking-wide italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        SuperSOAT
                      </div>
                      <div className="text-sm sm:text-base font-black italic tracking-wider text-orange-400 -mt-1 drop-shadow-sm">
                        +Póliza*
                      </div>
                    </div>

                    {/* Prize Icons Badge Grid */}
                    <div className="grid grid-cols-4 gap-2 w-full mt-3 pt-3 border-t border-white/10">
                      <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                        <Car className="w-5 h-5 text-rose-400" />
                        <span className="text-[9px] font-bold text-slate-300 mt-1">Carros</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                        <Bike className="w-5 h-5 text-blue-400" />
                        <span className="text-[9px] font-bold text-slate-300 mt-1">Motos</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                        <Gift className="w-5 h-5 text-amber-400" />
                        <span className="text-[9px] font-bold text-slate-300 mt-1">Premios</span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-700/60">
                        <Coins className="w-5 h-5 text-emerald-400" />
                        <span className="text-[9px] font-bold text-slate-300 mt-1">Puntos</span>
                      </div>
                    </div>

                    <div className="mt-3 text-[10px] text-slate-300 font-medium">
                      Acumula puntos y redime electrodomésticos, bonos y tecnología
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* SLIDE 2: SuperSOAT + Póliza */
              <motion.div
                key="slide-2"
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="w-full h-full relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 md:p-10 bg-gradient-to-br from-[#03102c] via-[#06245e] to-[#0284c7] text-white overflow-hidden"
              >
                {/* Diagonal Chevron Tech Background Overlay */}
                <div 
                  className="absolute inset-0 opacity-15 pointer-events-none" 
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(56, 189, 248, 0.4) 35px, rgba(56, 189, 248, 0.4) 70px)`
                  }}
                />

                {/* Left Side: Watermark & Title */}
                <div className="relative z-10 w-full md:w-3/5 space-y-4">
                  {/* SuperGIROS Branding Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-blue-300 flex items-center justify-center shadow-lg text-white font-black text-xs">
                      SG
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-black tracking-wider text-white">
                        SuperGIROS<sup className="text-[10px]">®</sup>
                      </div>
                      <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                        Campaña Oficial de Fidelización
                      </div>
                    </div>
                  </div>

                  {/* Huge 3D SuperSOAT Title */}
                  <div className="py-2">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight text-white leading-none">
                      <span className="block text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                        SuperSOAT
                      </span>
                      <span className="inline-block text-2xl sm:text-3xl md:text-4xl font-black italic text-orange-400 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] -mt-1 ml-1">
                        +Póliza*
                      </span>
                    </h1>
                  </div>

                  {/* Value Proposition */}
                  <div className="space-y-1 max-w-lg">
                    <p className="text-xs sm:text-sm font-bold text-blue-100">
                      Protege tu vehículo y gana Superpuntos en cada compra y emisión.
                    </p>
                    <p className="text-[11px] sm:text-xs text-blue-200/80">
                      Cobertura integral para motos y carros, asistencia médica inmediata y acumulación preferencial de puntos para canje en el catálogo.
                    </p>
                  </div>

                  {/* Action Pill Button */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-5 py-2.5 rounded-full font-bold text-xs bg-sky-500/25 hover:bg-sky-500/40 text-white border border-sky-300/40 flex items-center gap-2 backdrop-blur-xs transition-all shadow-md cursor-pointer hover:border-sky-300"
                    >
                      <Info className="w-4 h-4 text-sky-300" />
                      <span>Ver Más Detalles</span>
                      <ChevronRight className="w-3.5 h-3.5 text-sky-200" />
                    </button>

                    <button
                      onClick={handleActionClick}
                      className="px-4 py-2.5 rounded-full font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Ir al Catálogo</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Visual Shield & Security Highlights */}
                <div className="relative z-10 w-full md:w-2/5 mt-6 md:mt-0 flex flex-col items-center justify-center">
                  <div className="relative p-6 rounded-3xl bg-slate-900/60 border border-sky-400/30 backdrop-blur-md shadow-2xl text-center max-w-xs w-full space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center mx-auto text-sky-300 shadow-inner">
                      <ShieldCheck className="w-9 h-9 stroke-[1.8]" />
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase tracking-wider text-sky-300">
                        Cobertura Certificada
                      </div>
                      <h4 className="text-sm font-extrabold text-white">
                        SOAT + Póliza Todo Riesgo
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Emisión digital inmediata en puntos autorizados SuperGIROS a nivel nacional.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-3 text-[11px] text-amber-300 font-bold">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Acumula Puntos Dobles</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Anterior banner"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-lg z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Siguiente banner"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white border border-white/20 backdrop-blur-md flex items-center justify-center opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-lg z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Slide Indicators & Slide Counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-slate-950/40 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
          {[0, 1].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ir al banner ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-6 bg-amber-400 shadow-sm' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
          <span className="text-[10px] text-slate-400 font-bold pl-1">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>
      </div>

      {/* SuperSOAT Informational Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-slate-900 text-white rounded-3xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                    <span>SuperSOAT + Póliza</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-bold">Oficial</span>
                  </h3>
                  <p className="text-xs text-slate-300">Campaña de Beneficios SuperGIROS</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>¿Qué es SuperSOAT + Póliza?</span>
                </div>
                <p>
                  Es el seguro obligatorio para vehículos que además incluye una cobertura integral de póliza de asistencia jurídica, auxilio funerario y accidentes personales tanto para motocicletas como para vehículos particulares.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-slate-200">
                  Beneficios para el Aliado Comercial:
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Acumulación de Superpuntos:</strong> Suma puntos a tu billetera por cada SOAT emitido o gestionado a través de tu punto comercial.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Fidelización de Clientes:</strong> Atrae más usuarios a tu negocio ofreciendo entrega de SOAT al instante y con póliza adicional.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Canje en el Catálogo:</strong> Usa tus puntos para redimir productos exclusivos, electrodomésticos, bonos de compra y premios destacados.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-200 flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="text-xs">
                  ¿Quieres habilitar la emisión de SuperSOAT en tu punto? Contacta a tu asesor comercial SuperGIROS asignado.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  handleActionClick();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Explorar Premios del Catálogo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
