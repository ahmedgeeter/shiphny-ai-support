import React, { useState } from 'react'
import { Package, Search, ChevronDown, Zap, Shield, Globe, HeartHandshake, Truck, Building2, CheckCircle2, Star, Clock } from 'lucide-react'
import { Translations, Language } from '../translations'
import { Page, C } from '../utils/constants'
import { motion } from 'framer-motion'

interface HomePageProps {
  t: Translations
  lang: Language
  onNavigate: (p: Page) => void
  trackingNumber: string
  setTrackingNumber: (v: string) => void
  onBook: (s: string) => void
  onOpenAuth: () => void
  isAuthenticated: boolean
}

export function HomePage({ t, lang, onNavigate, trackingNumber, setTrackingNumber, onBook, onOpenAuth, isAuthenticated }: HomePageProps) {
  const isRtl = lang === 'ar'
  const [activeTab, setActiveTab] = useState<'individual' | 'business'>('individual')

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-screen sm:min-h-[95vh] flex items-center pt-20" style={{ backgroundColor: C.secondary }}>
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-500/20 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={`text-center ${isRtl ? 'lg:text-right' : 'lg:text-left'}`}
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-md bg-white/5 border border-white/10 shadow-xl">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs sm:text-sm font-bold text-red-100 tracking-wide">{t.home.badge}</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                {t.home.title}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
                  {t.home.subtitle}
                </span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-lg sm:text-xl text-gray-300 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                {t.home.description}
              </motion.p>

              {/* Tracking Input */}
              <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-xl p-2 sm:p-3 rounded-3xl shadow-2xl border border-white/10 max-w-md mx-auto lg:mx-0">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
                    <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                      placeholder={t.home.trackingPlaceholder}
                      onKeyDown={e => e.key === 'Enter' && onNavigate('tracking')}
                      className={`w-full bg-white/90 focus:bg-white px-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/30 text-gray-900 font-medium transition-all ${isRtl ? 'pr-12 text-right' : 'pl-12 text-left'}`} />
                  </div>
                  <button onClick={() => onNavigate('tracking')}
                    className="flex-shrink-0 px-6 sm:px-8 py-4 text-white rounded-2xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
                    style={{ backgroundColor: C.primary }}>
                    <span className="hidden sm:inline">{t.home.trackingButton}</span>
                    <Search className="w-5 h-5 sm:hidden" />
                  </button>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex gap-4 mt-6 justify-center lg:justify-start">
                <button onClick={onOpenAuth}
                  className="px-6 py-3 rounded-2xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm">
                  {lang === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'Sign In / Register'}
                </button>
              </motion.div>

              {/* Stats Row */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start">
                {[
                  { v: t.home.stats.shipments.value, l: t.home.stats.shipments.label },
                  { v: t.home.stats.governorates.value, l: t.home.stats.governorates.label },
                  { v: t.home.stats.satisfaction.value, l: t.home.stats.satisfaction.label },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-extrabold text-white mb-1 tracking-tight">{s.v}</div>
                    <div className="text-sm text-gray-400 font-medium">{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="hidden lg:block relative perspective-1000"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-red-500/10 border border-white/10 group transform transition-transform hover:scale-[1.02] duration-500">
                <img
                  src="/delivery_hero.png"
                  alt="Delivery Service"
                  className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent mix-blend-multiply" />
                
                {/* Floating Cards */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4"
                >
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-white text-lg">24H</p>
                    <p className="text-sm text-white/70">{t.home.deliveryTimeBadge}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 shadow-xl shadow-red-500/30 border border-white/20">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <p className="font-bold text-white text-lg">99.8%</p>
                    <p className="text-sm text-white/90">{t.home.stats.satisfaction.label}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
        >
          <ChevronDown className="w-5 h-5 text-white/70" />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: C.secondary }}>{t.features.title}</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">{t.features.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.items.map((f, i) => {
              const icons = [Zap, Shield, Globe, HeartHandshake]
              const colors = [C.primary, C.success, '#3B82F6', C.accent]
              const Icon = icons[i]
              return (
                <div key={i} className="group bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: `${colors[i]}15` }}>
                    <Icon className="w-6 h-6" style={{ color: colors[i] }} />
                  </div>
                  <h3 className="font-bold text-xl mb-3" style={{ color: C.secondary }}>{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Services preview ── */}
      <section className="py-24 bg-gray-50 relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: C.secondary }}>{t.services.title}</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">{t.services.subtitle}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {t.services.items.map((s, i) => {
              const icons = [Zap, Truck, Building2]
              const Icon = icons[i]
              const isPopular = i === 0
              return (
                <div key={i} className={`relative flex flex-col bg-white rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-2 ${isPopular ? 'shadow-2xl shadow-red-500/10 border-2 border-red-500 scale-105 z-10' : 'shadow-lg border border-gray-100 hover:shadow-xl'}`}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg" style={{ backgroundColor: C.primary }}>
                      {('popular' in s) ? (s as any).popular : 'Most Popular'}
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isPopular ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-700'}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="font-extrabold text-2xl mb-3" style={{ color: C.secondary }}>{s.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 flex-1">{s.desc}</p>
                  
                  <ul className="space-y-4 mb-8 flex-1 mt-6">
                    {s.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.primary }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button onClick={() => isAuthenticated ? onNavigate('dashboard') : onOpenAuth()}
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${isPopular ? 'text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}
                    style={isPopular ? { backgroundColor: C.primary } : {}}>
                    {isAuthenticated ? (lang === 'ar' ? 'اطلب الآن من لوحة التحكم' : 'Order from Dashboard') : (lang === 'ar' ? 'سجل لتبدأ الشحن' : 'Register to Start')}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
