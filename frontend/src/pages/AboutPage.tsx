import React from 'react'
import { Zap, Shield, HeartHandshake, TrendingUp } from 'lucide-react'
import { Translations, Language } from '../translations'
import { C } from '../utils/constants'
import { motion } from 'framer-motion'

export function AboutPage({ t, lang }: { t: Translations; lang: Language }) {
  const isRtl = lang === 'ar'
  
  const values = lang === 'ar'
    ? [{ icon: Zap, title: 'السرعة', desc: 'نلتزم بأسرع أوقات التوصيل في السوق المصري بفضل أسطولنا الذكي' },
       { icon: Shield, title: 'الأمان', desc: 'تأمين شامل على جميع الشحنات بدون استثناء لضمان راحة بالك' },
       { icon: HeartHandshake, title: 'الموثوقية', desc: 'نبني علاقات طويلة مع عملائنا على أساس الثقة والشفافية التامة' },
       { icon: TrendingUp, title: 'الابتكار', desc: 'نستخدم أحدث تقنيات الذكاء الاصطناعي لتحسين تجربة الشحن' }]
    : [{ icon: Zap, title: 'Speed', desc: 'We commit to the fastest delivery times in the Egyptian market thanks to our smart fleet' },
       { icon: Shield, title: 'Security', desc: 'Comprehensive insurance on all shipments without exception for your peace of mind' },
       { icon: HeartHandshake, title: 'Reliability', desc: 'We build long-term relationships with our customers based on absolute trust and transparency' },
       { icon: TrendingUp, title: 'Innovation', desc: 'We use the latest AI technologies to optimize the shipping experience' }]

  const team = lang === 'ar'
    ? [{ name: 'محمد عبدالله', role: 'الرئيس التنفيذي', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop' },
       { name: 'ريم أحمد', role: 'مديرة العمليات', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop' },
       { name: 'كريم حسن', role: 'مدير التكنولوجيا', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop' },
       { name: 'نورة محمد', role: 'مديرة خدمة العملاء', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop' }]
    : [{ name: 'Mohamed Abdullah', role: 'CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop' },
       { name: 'Reem Ahmed', role: 'COO', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop' },
       { name: 'Karim Hassan', role: 'CTO', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop' },
       { name: 'Noura Mohamed', role: 'Customer Success', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop' }]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="pt-24 sm:pt-32 pb-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight relative z-10" style={{ color: C.secondary }}>
            {t.about.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed relative z-10">
            {t.about.subtitle}
          </motion.p>
        </div>

        {/* Story Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="bg-gray-50 rounded-[3rem] p-8 sm:p-14 lg:p-20 mb-24 border border-gray-100 shadow-xl shadow-gray-200/50"
        >
          <div className="max-w-4xl mx-auto space-y-6 text-gray-600 leading-loose text-base sm:text-lg font-medium">
            <p className="first-letter:text-5xl first-letter:font-extrabold first-letter:text-red-500 first-letter:float-right first-letter:ml-3 first-letter:mt-1">{t.about.p1}</p>
            <p>{t.about.p2}</p>
            <p>{t.about.p3}</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-24"
        >
          {t.about.stats.map((s, i) => (
            <motion.div variants={itemVariants} key={i} className="text-center p-8 rounded-[2rem] bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-shadow group relative overflow-hidden">
              <div className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-br from-red-500 to-red-700">{s.number}</div>
                <div className="text-gray-600 font-bold tracking-wide uppercase text-xs sm:text-sm">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Values Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: C.secondary }}>
              {lang === 'ar' ? 'القيم التي نؤمن بها' : 'Values We Believe In'}
            </h2>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div variants={itemVariants} key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center group">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: C.primaryLight }}>
                    <Icon className="w-8 h-8" style={{ color: C.primary }} />
                  </div>
                  <h3 className="font-extrabold text-xl mb-3" style={{ color: C.secondary }}>{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-medium">{v.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Team Section */}
        <div>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: C.secondary }}>
              {lang === 'ar' ? 'فريق القيادة' : 'Leadership Team'}
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
              {lang === 'ar' ? 'نخبة من الخبراء في مجال اللوجستيات والتكنولوجيا يعملون معاً لتقديم أفضل خدمة' : 'A select group of experts in logistics and technology working together to provide the best service'}
            </p>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {team.map((member, i) => (
              <motion.div variants={itemVariants} key={i} className="group text-center">
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:shadow-red-500/20 transition-shadow">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h4 className="font-extrabold text-xl mb-1" style={{ color: C.secondary }}>{member.name}</h4>
                <p className="text-red-500 font-bold text-sm tracking-wide">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
