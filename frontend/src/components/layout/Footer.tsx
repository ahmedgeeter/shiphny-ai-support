import React from 'react'
import { Globe, Phone, MessageCircle, Mail, Clock, MapPin, Search, PlusCircle, Link, Hash } from 'lucide-react'
import { ShiphnyLogo } from '../common/ShiphnyLogo'
import { Page, C } from '../../utils/constants'
import { Translations, Language } from '../../translations'

interface FooterProps {
  t: Translations
  lang: Language
  onNavigate: (p: Page) => void
}

export function Footer({ t, lang, onNavigate }: FooterProps) {
  const isRtl = lang === 'ar'
  const socialLinks = [
    { icon: Globe, href: '#', label: 'Facebook' },
    { icon: Hash, href: '#', label: 'Instagram' },
    { icon: Link, href: '#', label: 'Twitter' },
    { icon: PlusCircle, href: '#', label: 'LinkedIn' },
  ]

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: C.secondary }}>
      {/* Background glowing effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg shadow-red-500/10" style={{ backgroundColor: C.primary }}>
                <ShiphnyLogo size={45} />
              </div>
              <div>
                <h3 className="font-extrabold text-2xl text-white tracking-tight">{t.brand.name}</h3>
                <p className="text-sm text-gray-400 font-medium">{t.brand.subtitle}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 pr-4">{t.footer.description}</p>
            <div className="flex gap-3">
              {socialLinks.map((s, i) => {
                const Icon = s.icon
                return (
                  <a key={i} href={s.href} aria-label={s.label}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-red-500 hover:-translate-y-1 transition-all duration-300 text-gray-400 hover:text-white shadow-lg">
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-6 text-base tracking-wide">{t.footer.quickLinks}</h4>
            <ul className="space-y-4">
              {[
                { id: 'home', label: t.nav.home },
                { id: 'tracking', label: t.nav.tracking },
                { id: 'services', label: t.nav.services },
                { id: 'about', label: t.nav.about },
                { id: 'contact', label: t.nav.contact },
              ].map(item => (
                <li key={item.id}>
                  <button onClick={() => onNavigate(item.id as Page)}
                    className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/0 group-hover:bg-red-500 transition-colors" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-white mb-6 text-base tracking-wide">{t.footer.ourServices}</h4>
            <ul className="space-y-4">
              {t.services.items.map((s, i) => (
                <li key={i}>
                  <button onClick={() => onNavigate('services')}
                    className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/0 group-hover:bg-red-500 transition-colors" />
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-6 text-base tracking-wide">{t.footer.contactUs}</h4>
            <ul className="space-y-5">
              <li>
                <a href="tel:19282" className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors duration-200 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <Phone className="w-4 h-4 flex-shrink-0 group-hover:text-red-400" />
                  </div>
                  <div className="mt-1">
                    <span className="block text-sm font-bold">19282</span>
                  </div>
                </a>
              </li>
              <li>
                <a href="https://wa.me/201001928200" target="_blank" rel="noreferrer" className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors duration-200 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <MessageCircle className="w-4 h-4 flex-shrink-0 group-hover:text-green-400" />
                  </div>
                  <div className="mt-1">
                    <span className="block text-sm font-bold">01001928200</span>
                  </div>
                </a>
              </li>
              <li>
                <a href="mailto:support@shiphny.com" className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors duration-200 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Mail className="w-4 h-4 flex-shrink-0 group-hover:text-blue-400" />
                  </div>
                  <div className="mt-1">
                    <span className="block text-sm font-medium">support@shiphny.com</span>
                  </div>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                </div>
                <div className="mt-1">
                  <span className="block text-sm">{lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm font-medium">{t.footer.copyright}</p>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <p className="text-gray-400 text-sm font-medium">
              {lang === 'ar' ? 'مرخصة وموثقة من الهيئة العامة للبريد المصري' : 'Licensed by Egypt Post Authority'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
