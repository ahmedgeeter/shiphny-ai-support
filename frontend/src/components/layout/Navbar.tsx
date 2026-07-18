import React, { useState, useEffect, useRef } from 'react'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import { ShiphnyLogo } from '../common/ShiphnyLogo'
import { Page, C } from '../../utils/constants'
import { Translations, Language } from '../../translations'
import { motion, AnimatePresence } from 'framer-motion'

interface NavbarProps {
  currentPage: Page
  setCurrentPage: (p: Page) => void
  lang: Language
  toggleLang: () => void
  t: Translations
  onOpenAuth: () => void
  isAuthenticated?: boolean
  isAdmin?: boolean
  onLogout?: () => void
}

export function Navbar({ currentPage, setCurrentPage, lang, toggleLang, t, onOpenAuth, isAuthenticated, isAdmin, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [navSolid, setNavSolid] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollY = useRef(0)
  const isRtl = lang === 'ar'

  useEffect(() => {
    setNavVisible(true)
    setNavSolid(currentPage !== 'home')
    lastScrollY.current = window.scrollY
    setIsMenuOpen(false)
  }, [currentPage])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      if (currentPage === 'home') {
        setNavSolid(y > 60)
      } else {
        setNavSolid(true)
      }

      if (y < 80) {
        setNavVisible(true)
      } else if (y < lastScrollY.current - 5) {
        setNavVisible(true) // scrolling up
      } else if (y > lastScrollY.current + 5) {
        setNavVisible(false) // scrolling down
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage])

  const navTextWhite = !navSolid

  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'tracking', label: t.nav.tracking },
    { id: 'services', label: t.nav.services },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${navVisible ? 'translate-y-0' : '-translate-y-full'} ${navSolid ? 'bg-white/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-gray-100/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24 transition-all duration-300">
          
          {/* Logo */}
          <button onClick={() => setCurrentPage('home')} className="flex items-center gap-3 group">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${navSolid ? 'shadow-lg shadow-red-500/20' : ''}`} style={{ backgroundColor: C.primary }}>
              <ShiphnyLogo size={40} />
            </div>
            <div className={`text-left ${isRtl ? 'text-right' : 'text-left'}`}>
              <h1 className={`font-extrabold text-xl lg:text-2xl tracking-tight transition-colors duration-300 ${navTextWhite ? 'text-white' : 'text-gray-900'}`}>
                {t.brand.name}
              </h1>
              <p className={`text-xs font-medium tracking-wide transition-colors duration-300 ${navTextWhite ? 'text-white/80' : 'text-gray-500'}`}>
                {t.brand.subtitle}
              </p>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = currentPage === item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={() => setCurrentPage(item.id as Page)}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden group ${isActive ? (navTextWhite ? 'text-white' : `text-[${C.primary}]`) : (navTextWhite ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-gray-900')}`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-red-500/10 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {!isActive && (
                    <div className={`absolute inset-0 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl ${navTextWhite ? 'bg-white/10' : 'bg-gray-100'}`} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right controls */}
          <div className="hidden lg:flex items-center gap-3">
            <button onClick={toggleLang}
              className={`px-3 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 flex items-center gap-2 ${navTextWhite ? 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm' : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200'}`}>
              <Globe className="w-4 h-4" />
              {t.nav.langSwitcher}
            </button>
            <button onClick={() => setCurrentPage('support')}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl border-2 transition-all duration-300 ${navTextWhite ? 'border-white/30 text-white hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}>
              {t.nav.support}
            </button>
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <button onClick={() => setCurrentPage('admin')}
                    className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${navTextWhite ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'}`}>
                    {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                  </button>
                ) : (
                  <button onClick={() => setCurrentPage('dashboard')}
                    className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${navTextWhite ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'}`}>
                    {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                  </button>
                )}
                <button onClick={onLogout}
                  className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${navTextWhite ? 'text-white hover:bg-white/20' : 'text-red-600 hover:bg-red-50'}`}>
                  {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </>
            ) : (
              <button onClick={onOpenAuth}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${navTextWhite ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'}`}>
                {t.nav.login}
              </button>
            )}
            <button onClick={() => setCurrentPage('tracking')}
              className="relative px-6 py-2.5 text-sm font-bold text-white rounded-xl overflow-hidden group shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300"
              style={{ backgroundColor: C.primary }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                {t.nav.trackButton}
              </span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2.5 rounded-xl transition-all duration-300 ${navTextWhite ? 'text-white hover:bg-white/10' : 'text-gray-700 bg-gray-50 border border-gray-100'}`}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              <button onClick={() => { toggleLang(); setIsMenuOpen(false) }}
                className="w-full px-4 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                <Globe className="w-4 h-4" />
                {lang === 'ar' ? 'English' : 'عربي'}
              </button>
              
              <div className="grid gap-1 mt-2">
                {navItems.map(item => {
                  const isActive = currentPage === item.id;
                  return (
                    <button key={item.id} onClick={() => { setCurrentPage(item.id as Page); setIsMenuOpen(false) }}
                      className={`w-full px-4 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${isRtl ? 'text-right' : 'text-left'} ${isActive ? 'text-red-600 bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      {item.label}
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    </button>
                  )
                })}
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                {isAuthenticated ? (
                  <>
                    {isAdmin ? (
                      <button onClick={() => { setCurrentPage('admin'); setIsMenuOpen(false) }}
                        className={`w-full px-4 py-3 text-gray-700 rounded-xl text-sm font-bold bg-gray-50 border border-gray-100 transition-all active:scale-95`}
                      >
                        {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
                      </button>
                    ) : (
                      <button onClick={() => { setCurrentPage('dashboard'); setIsMenuOpen(false) }}
                        className={`w-full px-4 py-3 text-gray-700 rounded-xl text-sm font-bold bg-gray-50 border border-gray-100 transition-all active:scale-95`}
                      >
                        {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                      </button>
                    )}
                    <button onClick={() => { if(onLogout) onLogout(); setIsMenuOpen(false) }}
                      className={`w-full px-4 py-3 text-red-600 rounded-xl text-sm font-bold bg-red-50 border border-red-100 transition-all active:scale-95`}
                    >
                      {lang === 'ar' ? 'خروج' : 'Logout'}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { onOpenAuth(); setIsMenuOpen(false) }}
                      className={`w-full px-4 py-3 text-gray-700 rounded-xl text-sm font-bold bg-gray-50 border border-gray-100 transition-all active:scale-95`}
                    >
                      {t.nav.login}
                    </button>
                    <button onClick={() => { setCurrentPage('support'); setIsMenuOpen(false) }}
                      className={`w-full px-4 py-3 text-gray-700 rounded-xl text-sm font-bold bg-gray-50 border border-gray-100 transition-all active:scale-95`}
                    >
                      {t.nav.support}
                    </button>
                  </>
                )}
                <button onClick={() => { setCurrentPage('tracking'); setIsMenuOpen(false) }}
                  className={`w-full px-4 py-3 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md`}
                  style={{ backgroundColor: C.primary }}>
                  {t.nav.trackButton}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
