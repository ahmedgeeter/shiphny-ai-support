import React, { useState } from 'react'
import { Search, CheckCircle2, AlertCircle, Phone, Package, Truck, Home } from 'lucide-react'
import { Translations, Language } from '../translations'
import { C } from '../utils/constants'
import { motion, AnimatePresence } from 'framer-motion'

export function TrackingPage({ t, lang, initialNumber }: { t: Translations; lang: Language; initialNumber?: string }) {
  const [trackingNumber, setTrackingNumber] = useState(initialNumber || '')
  const [isSearching, setIsSearching] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const isRtl = lang === 'ar'

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return
    setNotFound(false)
    setShowResult(false)
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      if (trackingNumber.toUpperCase().startsWith('SH-')) setShowResult(true)
      else setNotFound(true)
    }, 1500)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: isRtl ? 20 : -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="pt-24 sm:pt-32 pb-24 min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-red-500/10 mb-6 border border-gray-100">
            <Search className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight" style={{ color: C.secondary }}>{t.tracking.title}</h1>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">{t.tracking.subtitle}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-white p-6 sm:p-10 mb-8"
        >
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 mb-2">
            <div className="relative flex-1">
              <Search className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                placeholder={t.tracking.placeholder}
                className={`w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500/50 text-base font-medium transition-all ${isRtl ? 'pr-12 text-right' : 'pl-12 text-left'}`} />
            </div>
            <button type="submit" disabled={isSearching || !trackingNumber.trim()}
              className="flex-shrink-0 px-8 py-4 text-white rounded-2xl font-bold disabled:opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 active:scale-95 flex items-center justify-center gap-2"
              style={{ backgroundColor: C.primary }}>
              {isSearching
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>{t.tracking.searching}</span></>
                : <span>{t.tracking.button}</span>}
            </button>
          </form>

          {/* Not found */}
          <AnimatePresence>
            {notFound && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{lang === 'ar' ? 'رقم الشحنة غير صحيح. تأكد أن الرقم يبدأ بـ SH-' : 'Tracking number not found. Make sure it starts with SH-'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {showResult && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20 }}
                className="mt-10 pt-10 border-t border-gray-100"
              >
                <motion.div variants={itemVariants} className="flex items-center gap-5 mb-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-100/50 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20 bg-gradient-to-br from-emerald-400 to-emerald-600">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-lg sm:text-xl text-emerald-950 mb-1">{t.tracking.delivered}</p>
                    <p className="text-emerald-700 text-sm font-medium">{t.tracking.deliveredDesc}</p>
                  </div>
                  <div className={`hidden sm:block ${isRtl ? 'text-right pr-6 border-r border-emerald-200/50' : 'text-left pl-6 border-l border-emerald-200/50'}`}>
                    <p className="text-xs text-emerald-600/70 mb-1 font-semibold uppercase tracking-wider">{t.tracking.trackingNumber}</p>
                    <p className="font-mono font-bold text-base text-emerald-900 bg-white/50 px-3 py-1 rounded-lg border border-emerald-100">{trackingNumber.toUpperCase()}</p>
                  </div>
                </motion.div>

                <div className="relative pl-2 sm:pl-4 pr-2 sm:pr-4">
                  <div className={`absolute ${isRtl ? 'right-[27px] sm:right-[35px]' : 'left-[27px] sm:left-[35px]'} top-4 bottom-4 w-0.5 bg-gray-100`} />
                  
                  {t.tracking.steps.map((step, idx) => {
                    const icons = [CheckCircle2, Truck, Package, Home]
                    const Icon = icons[idx] || CheckCircle2
                    const isLast = idx === t.tracking.steps.length - 1
                    
                    return (
                      <motion.div variants={itemVariants} key={idx} className={`relative flex gap-5 sm:gap-6 ${!isLast ? 'mb-8' : ''}`}>
                        <div className="relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center bg-white shadow-md border-2 border-white"
                          style={{ backgroundColor: isLast ? C.success : 'white' }}>
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isLast ? 'text-white' : 'text-gray-400'}`} />
                          {!isLast && <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-200" />}
                        </div>
                        <div className={`flex-1 pt-2 pb-3 ${!isLast ? 'border-b border-gray-50' : ''}`}>
                          <p className={`font-bold text-base ${isLast ? 'text-emerald-600' : 'text-gray-900'}`}>{step.status}</p>
                          <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            {step.date}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm mb-3 font-medium">{t.tracking.helpText}</p>
          <a href="tel:19282" className="inline-flex items-center gap-2 text-xl font-extrabold hover:opacity-80 transition-opacity" style={{ color: C.primary }}>
            <Phone className="w-5 h-5" />19282
          </a>
        </motion.div>
      </div>
    </div>
  )
}
