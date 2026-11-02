import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplet, ShoppingBag, Cpu, ChevronLeft, ChevronRight,
  Shield, CheckCircle, ArrowRight, Activity, Users,
  Layers, BellRing, Sparkles, MapPin, Gauge
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { HardwareArchDiagram } from '../components/common/HardwareArchDiagram';
import { useLanguage } from '../context/LanguageContext';
import { useTelemetry } from '../context/TelemetryContext';

// High-quality relevant rural infrastructure slides
const SLIDES = [
  {
    id: 1,
    title: 'Rural Elevated Storage Reservoirs (ESR)',
    subtitle: 'Continuous ultrasonic level telemetry preventing dry overflows and water shortages.',
    category: 'Water Infrastructure',
    badge: 'IoT Ultrasonic Level',
    imgUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1200&q=80',
    color: 'from-sky-900/90 to-slate-900/95'
  },
  {
    id: 2,
    title: 'High-Efficiency Village Pumping Stations',
    subtitle: 'Non-invasive CT sensors monitor motor current, detect dry runs, and optimize daily operating runtimes.',
    category: 'Pumping Telemetry',
    badge: 'CT Current Sensors',
    imgUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    color: 'from-blue-900/90 to-slate-900/95'
  },
  {
    id: 3,
    title: 'Equitable Village Water Distribution Pipeline',
    subtitle: 'Flanged Hall-effect digital flow meters guarantee water access reaches tail-end hamlets and lanes.',
    category: 'Distribution Network',
    badge: 'Flow Telemetry',
    imgUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    color: 'from-cyan-950/90 to-slate-900/95'
  },
  {
    id: 4,
    title: 'Transparent Fair Price Shop (PDS) Godown',
    subtitle: 'Digital inventory controls, barcode verification, and automatic stock depletion prevent leakage.',
    category: 'Food Security',
    badge: 'Atomic Stock Engine',
    imgUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    color: 'from-emerald-950/90 to-slate-900/95'
  },
  {
    id: 5,
    title: 'Empowering Gram Panchayat Governance',
    subtitle: 'Gram Sabhas and Sarpanches access unified real-time audit trails on desktop and mobile.',
    category: 'Digital Governance',
    badge: 'Gram Sabha Transparency',
    imgUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    color: 'from-slate-950/90 to-slate-900/95'
  },
  {
    id: 6,
    title: 'Community-Driven Water & Ration Security',
    subtitle: 'Citizen complaint redressal and automated notifications keep rural households informed 24/7.',
    category: 'Citizen Engagement',
    badge: 'Citizen Grievance Redressal',
    imgUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    color: 'from-indigo-950/90 to-slate-900/95'
  }
];

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const { isConnected, mode } = useTelemetry();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Automatic slideshow transition with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headlines & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Integrated Digital Public Infrastructure for Rural India</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {t('hero.headline')}
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
                  {t('hero.sub')}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/app/water"
                    className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-lg shadow-sky-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Droplet className="w-4 h-4 fill-white" />
                    <span>{t('hero.explore_water')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/app/pds"
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('hero.explore_pds')}</span>
                  </Link>

                  <Link
                    to="/app/simulation"
                    className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-800 dark:text-slate-100 text-sm font-semibold flex items-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/60"
                  >
                    <Cpu className="w-4 h-4 text-indigo-500" />
                    <span>{t('hero.live_sim')}</span>
                  </Link>
                </div>

                {/* Sub-feature points */}
                <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Ultrasonic Water Leveling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Dry-Run Pump Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Atomic Ration Quota Guard</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual with Real-Time Telemetry Overlays */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group">
                  <img
                    src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80"
                    alt="Rural Water Tank Infrastructure"
                    className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>

                  {/* Real-time telemetry floating pill #1: Water Level */}
                  <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-800/80 shadow-md flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">ESR-1 Main Reservoir</div>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>72.4% Full</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(18,100 L)</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time floating pill #2: Pump Active */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 text-white shadow-lg">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 font-bold text-sky-400">
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        Pump Station #1 Active
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/40">
                        13.8 A • 145 L/min
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full w-[72%] transition-all duration-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IMAGE SLIDESHOW (Automatic, Hover-Pause, Manual Controls) */}
        <section
          className="py-12 bg-slate-100/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Field Photography & Telemetry Gallery
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  Rural Infrastructure in Action
                </h2>
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Stage */}
            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
              {SLIDES.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={slide.imgUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${slide.color}`}></div>

                    <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end text-white">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase mb-2 w-max">
                        {slide.badge}
                      </div>
                      <h3 className="text-xl sm:text-3xl font-extrabold max-w-2xl leading-tight">
                        {slide.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-200 max-w-xl mt-2 leading-relaxed">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Dots Pagination */}
              <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide ? 'w-6 bg-sky-400' : 'w-2 bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TWO PRIMARY MODULE CARDS */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Integrated Dual Capabilities
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Two Core Pillars of Rural Service Delivery
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Module 1: Water Monitoring & Digital O&M */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-100 dark:border-sky-950 p-7 shadow-lg shadow-sky-500/5 hover:border-sky-300 dark:hover:border-sky-800 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-5">
                    <Droplet className="w-6 h-6 fill-sky-600/30" />
                  </div>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 tracking-wider uppercase">
                    Module 1
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 mb-3">
                    Smart Water Monitoring & Digital O&M
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Real-time IoT telemetry from overhead reservoirs, ground sumps, and booster pumps. Automatic dry-run detection, ultrasonic water leveling, and work order assignment for rural operators.
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-sky-500" />
                      <span>Live tank capacity and fluid percentage tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-sky-500" />
                      <span>Current sensing (amperes) with dry-run alert detection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-sky-500" />
                      <span>Digital maintenance task assignment & technician logs</span>
                    </li>
                  </ul>
                </div>

                <Link
                  to="/app/water"
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>Launch Water Monitoring</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Module 2: Public Distribution System (PDS) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-950 p-7 shadow-lg shadow-emerald-500/5 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                    <ShoppingBag className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                    Module 2
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 mb-3">
                    Transparent Public Distribution (PDS)
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    Complete end-to-end fair price shop distribution. Antyodaya (AAY) and BPL entitlement tracking, atomic transaction commits preventing negative stock, and physical stock reconciliation.
                  </p>

                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Instant ration card eligibility & remaining quota lookup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Automated stock decrement & printable receipt slip</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Physical vs expected stock reconciliation mismatch alerts</span>
                    </li>
                  </ul>
                </div>

                <Link
                  to="/app/pds"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <span>Launch PDS Distribution</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SYSTEM ARCHITECTURE FLOW */}
        <section className="py-12 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HardwareArchDiagram />
          </div>
        </section>

        {/* DEMONSTRATION IMPACT STATISTICS */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-3xl sm:text-4xl font-black text-sky-600 font-mono">4</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{t('hero.stat.villages')}</div>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-3xl sm:text-4xl font-black text-indigo-600 font-mono">12+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{t('hero.stat.assets')}</div>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono">1,840</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{t('hero.stat.beneficiaries')}</div>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-3xl sm:text-4xl font-black text-purple-600 font-mono">4,920</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{t('hero.stat.transactions')}</div>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 lg:col-span-1">
                <div className="text-3xl sm:text-4xl font-black text-teal-600 font-mono">98.5%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{t('hero.stat.resolved')}</div>
              </div>
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-3 italic">
              *Real-time demonstration test metrics seeded from local Gram Panchayat database.
            </p>
          </div>
        </section>

        {/* SAMPLE TESTIMONIALS */}
        <section className="py-16 bg-slate-100/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Gram Panchayat Stakeholders
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                Voices from the Field
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed">
                  "Before this digital system, we learned of tank overflows only after water wasted onto village lanes. Now ultrasonic telemetry alerts our phone in real time."
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">S</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Sunita Patil</div>
                    <div className="text-[10px] text-sky-600">Sarpanch, Shivajinagar</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed">
                  "The CT sensor warned me when our submersible pump ran at 4A due to borewell air suction. It saved the 10HP motor from burnout."
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">G</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Ganesh Shinde</div>
                    <div className="text-[10px] text-blue-600">Water Works Operator</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed">
                  "The atomic verification prevents arguments at the ration shop counter. Beneficiaries see remaining quota and receive printed receipts immediately."
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">V</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Vilas Jadhav</div>
                    <div className="text-[10px] text-emerald-600">PDS Fair Price In-Charge</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed">
                  "I verified our family's grain entitlement in Marathi on my mobile phone. Everything distributed matched what we received at the shop."
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">A</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Anandrao Kadam</div>
                    <div className="text-[10px] text-teal-600">Citizen & Beneficiary</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
