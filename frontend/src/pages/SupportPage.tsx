import React from 'react'
import { Headphones, Phone, MessageCircle } from 'lucide-react'
import { ChatWidget } from '../components/ChatWidget'
import { Translations } from '../translations'
import { C } from '../utils/constants'
import { motion } from 'framer-motion'

interface SupportPageProps {
  t: Translations
  apiStatus: 'checking' | 'online' | 'offline'
}

export function SupportPage({ t, apiStatus }: SupportPageProps) {
  return (
    <div className="pt-24 sm:pt-32 pb-24 min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/20" style={{ backgroundColor: C.primaryLight }}>
            <Headphones className="w-10 h-10" style={{ color: C.primary }} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight" style={{ color: C.secondary }}>{t.support.title}</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">{t.support.subtitle}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-6 sm:p-10 border border-gray-100"
        >
          <ChatWidget apiStatus={apiStatus} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 grid sm:grid-cols-2 gap-6"
        >
          <a href="tel:19282" className="group flex items-center gap-5 bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-blue-50 group-hover:scale-110 transition-transform duration-300">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{t.tracking.hotline}</p>
              <p className="font-extrabold text-2xl" style={{ color: C.secondary }}>19282</p>
            </div>
          </a>
          <a href="https://wa.me/201001928200" target="_blank" rel="noreferrer" className="group flex items-center gap-5 bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-green-50 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">WhatsApp</p>
              <p className="font-extrabold text-2xl" style={{ color: C.secondary }}>01001928200</p>
            </div>
          </a>
        </motion.div>
      </div>
    </div>
  )
}
