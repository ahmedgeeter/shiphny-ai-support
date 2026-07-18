import React, { useState } from 'react'
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, Loader2 } from 'lucide-react'
import { Translations, Language } from '../translations'
import { C } from '../utils/constants'
import { motion } from 'framer-motion'

interface ContactPageProps {
  t: Translations
  lang: Language
  onToast: (v: { message: string; type: 'success' | 'error' }) => void
}

export function ContactPage({ t, lang, onToast }: ContactPageProps) {
  const isRtl = lang === 'ar'
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.message) {
      onToast({ message: lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', type: 'error' })
      return
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1200))
    setSubmitting(false)
    setForm({ name: '', email: '', phone: '', message: '' })
    onToast({ message: lang === 'ar' ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' : 'Your message sent successfully! We\'ll contact you soon.', type: 'success' })
  }

  const contactItems = [
    { icon: Phone, label: t.contact.hotline, value: '19282', href: 'tel:19282', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: MessageCircle, label: 'WhatsApp', value: '01001928200', href: 'https://wa.me/201001928200', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Mail, label: t.contact.hotline === 'الخط الساخن' ? 'البريد الإلكتروني' : 'Email', value: 'support@shiphny.com', href: 'mailto:support@shiphny.com', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: MapPin, label: t.contact.address, value: lang === 'ar' ? '١٢٣ شارع التحرير، القاهرة' : '123 Tahrir St, Cairo', href: '#', color: 'text-red-500', bg: 'bg-red-50' },
    { icon: Clock, label: t.contact.workHours, value: '24/7', href: '#', color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="pt-24 sm:pt-32 pb-24 min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight" style={{ color: C.secondary }}>{t.contact.title}</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">{t.contact.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: isRtl ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
              <h3 className="font-extrabold text-2xl mb-8" style={{ color: C.secondary }}>{t.contact.infoTitle}</h3>
              <div className="space-y-6">
                {contactItems.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                      className="flex items-center gap-4 group">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${item.bg}`}>
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-0.5">{item.label}</p>
                        <p className="font-bold text-lg group-hover:text-red-500 transition-colors" style={{ color: C.secondary }}>{item.value}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
            
            {/* Map styling */}
            <div className="rounded-[2rem] overflow-hidden border border-gray-100 bg-gray-100 h-64 flex items-center justify-center relative shadow-inner">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
              <div className="relative text-center bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-white">
                <MapPin className="w-8 h-8 mx-auto mb-2 animate-bounce" style={{ color: C.primary }} />
                <p className="font-bold text-gray-800">{lang === 'ar' ? 'المقر الرئيسي' : 'Headquarters'}</p>
                <p className="text-sm text-gray-500">{lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</p>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: isRtl ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3 bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-8 sm:p-12 border border-gray-100"
          >
            <h3 className="font-extrabold text-3xl mb-8" style={{ color: C.secondary }}>{t.contact.formTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.contact.form.name} *</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder={t.contact.form.name} required
                    className={`w-full px-5 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl font-medium focus:outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all ${isRtl ? 'text-right' : 'text-left'}`} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.contact.form.phone} *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder={t.contact.form.phone} required
                    className={`w-full px-5 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl font-medium focus:outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all ${isRtl ? 'text-right' : 'text-left'}`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.contact.form.email}</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder={t.contact.form.email}
                  className={`w-full px-5 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl font-medium focus:outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.contact.form.message} *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder={t.contact.form.message} rows={5} required
                  className={`w-full px-5 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl font-medium focus:outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all resize-none ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-5 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.98] transition-all disabled:opacity-70 text-lg"
                style={{ backgroundColor: C.primary }}>
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                {submitting ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t.contact.form.submit}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
