import React, { useState, useEffect } from 'react'
import { translations, Language } from './translations'
import { Page, API_BASE } from './utils/constants'
import { Toast } from './components/common/Toast'
import { BookingModal } from './components/common/BookingModal'
import { PersistentChat } from './components/ChatWidget'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'

import { HomePage } from './pages/HomePage'
import { TrackingPage } from './pages/TrackingPage'
import { ServicesPage } from './pages/ServicesPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { SupportPage } from './pages/SupportPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { AuthPanel } from './components/auth/AuthPanel'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [lang, setLang] = useState<Language>('ar')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [bookingService, setBookingService] = useState<string | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'))
  const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem('role') === 'admin')

  const t = translations[lang as keyof typeof translations]
  const isRtl = lang === 'ar'

  useEffect(() => {
    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [currentPage])

  useEffect(() => {
    const titles: Record<Page, string> = {
      home: 'شحني - Shiphny Express | الشحن السريع في مصر',
      tracking: 'تتبع الشحنة | شحني',
      services: 'الخدمات | شحني',
      about: 'عن الشركة | شحني',
      contact: 'تواصل معنا | شحني',
      support: 'الدعم الفني | شحني',
      dashboard: 'لوحة التحكم | شحني',
      admin: 'لوحة الإدارة | شحني',
    }
    document.title = titles[currentPage]
  }, [currentPage])

  const checkApiStatus = async () => {
    try {
      const r = await fetch(`${API_BASE}/api/health`)
      setApiStatus(r.ok ? 'online' : 'offline')
    } catch { setApiStatus('offline') }
  }

  const toggleLang = () => setLang((prev: Language) => prev === 'ar' ? 'en' : 'ar')

  return (
    <div className="min-h-screen bg-white selection:bg-red-500/30 selection:text-red-900" dir={isRtl ? 'rtl' : 'ltr'}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {bookingService && (
        <BookingModal 
          service={bookingService} 
          lang={lang} 
          onClose={() => setBookingService(null)} 
        />
      )}

      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        lang={lang}
        toggleLang={toggleLang}
        t={t}
        onOpenAuth={() => setIsAuthOpen(true)}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setIsAuthenticated(false);
          setIsAdmin(false);
          setCurrentPage('home');
        }}
      />

      <main className="min-h-[calc(100vh-100px)]">
        {currentPage === 'home'     && <HomePage     t={t} lang={lang} isAuthenticated={isAuthenticated} onNavigate={setCurrentPage} trackingNumber={trackingNumber} setTrackingNumber={setTrackingNumber} onBook={setBookingService} onOpenAuth={() => setIsAuthOpen(true)} />}
        {currentPage === 'tracking' && <TrackingPage t={t} lang={lang} initialNumber={trackingNumber} />}
        {currentPage === 'services' && <ServicesPage t={t} lang={lang} isAuthenticated={isAuthenticated} onOpenAuth={() => setIsAuthOpen(true)} onNavigate={setCurrentPage} />}
        {currentPage === 'about'    && <AboutPage    t={t} lang={lang} />}
        {currentPage === 'contact'  && <ContactPage  t={t} lang={lang} onToast={setToast} />}
        {currentPage === 'support'  && <SupportPage  t={t} apiStatus={apiStatus} />}
        {currentPage === 'dashboard' && <DashboardPage t={t} lang={lang} />}
        {currentPage === 'admin' && <AdminDashboard t={t} lang={lang} />}
      </main>

      <AuthPanel 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        t={t} 
        lang={lang} 
        onToast={setToast} 
        onLoginSuccess={(role) => {
          setIsAuthenticated(true);
          if (role === 'admin') {
            setIsAdmin(true);
            localStorage.setItem('role', 'admin');
            setCurrentPage('admin');
          } else {
            setIsAdmin(false);
            localStorage.setItem('role', 'customer');
            setCurrentPage('dashboard');
          }
        }}
      />

      <Footer t={t} lang={lang} onNavigate={setCurrentPage} />
      
      <PersistentChat apiStatus={apiStatus} lang={lang} />
    </div>
  )
}
