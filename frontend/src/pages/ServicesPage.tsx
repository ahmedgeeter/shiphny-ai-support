import React from 'react'
import { Zap, Truck, Building2, CheckCircle2, Phone } from 'lucide-react'
import { Translations, Language } from '../translations'
import { C } from '../utils/constants'
import { motion } from 'framer-motion'

export function ServicesPage({ t, lang, isAuthenticated, onOpenAuth, onNavigate }: { t: Translations; lang: Language; isAuthenticated: boolean; onOpenAuth: () => void; onNavigate: (p: any) => void }) {
  const isRtl = lang === 'ar'
  const serviceData = [
    { icon: Zap, popular: true, color: C.primary, delay: 0.1 },
    { icon: Truck, popular: false, color: '#3B82F6', delay: 0.2 },
    { icon: Building2, popular: false, color: C.success, delay: 0.3 },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  const handleAction = () => {
    if (isAuthenticated) {
      onNavigate('dashboard')
    } else {
      onOpenAuth()
    }
  }

  return (
    <div className="pt-24 sm:pt-32 pb-24 min-h-screen bg-gray-50/50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 -translate-x-1/3" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white shadow-md border border-gray-100 mb-6 text-sm font-bold tracking-wide" style={{ color: C.primary }}>
            {lang === 'ar' ? 'خدمات مصممة لك' : 'Services Designed For You'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 tracking-tight" style={{ color: C.secondary }}>{t.services.title}</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">{t.services.subtitle}</p>
        </motion.div>

        {/* Service cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {t.services.items.map((s, i) => {
            const sd = serviceData[i]
            const Icon = sd.icon
            
            return (
              <motion.div variants={cardVariants} key={i}
                className={`relative flex flex-col rounded-[2.5rem] p-8 transition-all duration-300 bg-white group ${sd.popular ? 'shadow-2xl shadow-red-500/10 border-2 border-red-500 scale-105 z-10' : 'shadow-xl shadow-gray-200/50 border border-gray-100 hover:shadow-2xl hover:shadow-gray-300/50 hover:-translate-y-2'}`}
              >
                {sd.popular && ('popular' in s) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-white text-xs font-bold tracking-wider shadow-lg uppercase" style={{ backgroundColor: C.primary }}>
                    {(s as any).popular}
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-300`} style={{ backgroundColor: `${sd.color}15` }}>
                  <Icon className="w-8 h-8" style={{ color: sd.color }} />
                </div>
                
                <h3 className="font-extrabold text-2xl mb-3" style={{ color: C.secondary }}>{s.title}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed flex-1 font-medium">{s.desc}</p>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {s.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: sd.color }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <button onClick={handleAction}
                  className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg active:scale-[0.98] ${sd.popular ? 'text-white' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}
                  style={sd.popular ? { backgroundColor: C.primary, boxShadow: `0 10px 25px -5px ${C.primary}50` } : {}}>
                  {isAuthenticated ? (lang === 'ar' ? 'اطلب الآن من لوحة التحكم' : 'Order from Dashboard') : (lang === 'ar' ? 'سجل لتبدأ الشحن' : 'Register to Start')}
                </button>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Features grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="rounded-[3rem] p-10 sm:p-14 bg-white shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px]" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10 relative z-10" style={{ color: C.secondary }}>{t.services.featuresTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 relative z-10">
            {t.services.allFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-50/80 backdrop-blur-sm hover:bg-gray-100 rounded-2xl p-5 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm border border-gray-100">
                  <CheckCircle2 className="w-5 h-5" style={{ color: C.primary }} />
                </div>
                <span className="text-gray-800 text-sm font-bold">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pricing note */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 rounded-[3rem] p-10 sm:p-14 text-center relative overflow-hidden" style={{ backgroundColor: C.secondary }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent mix-blend-overlay" />
          <div className="relative z-10">
            <h3 className="text-white font-extrabold text-2xl sm:text-3xl mb-4 tracking-tight">
              {lang === 'ar' ? 'تحتاج عرض سعر مخصص للشركات؟' : 'Need a Custom Business Quote?'}
            </h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto font-medium">
              {lang === 'ar' ? 'تواصل مع فريق المبيعات للحصول على عقد مخصص بأفضل الأسعار' : 'Contact our sales team for a custom contract with the best rates'}
            </p>
            <a href="tel:19282" className="inline-flex items-center gap-3 px-10 py-5 bg-white rounded-2xl font-bold hover:bg-gray-50 hover:scale-105 transition-all shadow-xl shadow-black/20" style={{ color: C.primary }}>
              <Phone className="w-5 h-5" />
              <span className="text-lg">{lang === 'ar' ? 'اتصل بنا: 19282' : 'Call Us: 19282'}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
