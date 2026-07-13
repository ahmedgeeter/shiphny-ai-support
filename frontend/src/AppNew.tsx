import React, { useState, useEffect } from 'react'
import { 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  Clock, 
  Shield, 
  Headphones,
  Search,
  Menu,
  X,
  ChevronLeft,
  Star,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import { ChatWidget } from './components/ChatWidget'

// Navigation tabs
type Page = 'home' | 'tracking' | 'services' | 'about' | 'contact' | 'support'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000)
    
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/health')
      setApiStatus(response.ok ? 'online' : 'offline')
    } catch {
      setApiStatus('offline')
    }
  }

  const navItems = [
    { id: 'home', label: 'الرئيسية', labelEn: 'Home' },
    { id: 'tracking', label: 'تتبع الشحنة', labelEn: 'Track' },
    { id: 'services', label: 'خدماتنا', labelEn: 'Services' },
    { id: 'about', label: 'عن الشركة', labelEn: 'About' },
    { id: 'contact', label: 'اتصل بنا', labelEn: 'Contact' },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className={`font-bold text-lg lg:text-xl transition-colors ${
                  scrolled ? 'text-slate-900' : 'text-white'
                }`}>
                  FastShip
                </h1>
                <p className={`text-xs transition-colors ${
                  scrolled ? 'text-slate-500' : 'text-white/80'
                }`}>
                  فاست شيب مصر
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as Page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : scrolled
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-white/90 hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage('support')}
                className="mr-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Headphones className="w-4 h-4" />
                <span>المساعدة</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/20'
              }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 shadow-xl">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as Page)
                    setIsMenuOpen(false)
                  }}
                  className={`w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setCurrentPage('support')
                  setIsMenuOpen(false)
                }}
                className="w-full text-right px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Headphones className="w-4 h-4" />
                <span>المساعدة والدعم</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === 'tracking' && <TrackingPage />}
        {currentPage === 'services' && <ServicesPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'support' && <SupportPage apiStatus={apiStatus} />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Chat Button */}
      {currentPage !== 'support' && (
        <button
          onClick={() => setCurrentPage('support')}
          className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-110 transition-all flex items-center justify-center group"
        >
          <Headphones className="w-6 h-6 group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white"></span>
        </button>
      )}
    </div>
  )
}

// Home Page Component
function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span>نخدم 27 محافظة في جميع أنحاء مصر</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                توصيل سريع
                <span className="block text-amber-400">وآمن وموثوق</span>
              </h1>
              
              <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto lg:mr-0">
                نقدم حلول شحن متكاملة للشركات والأفراد مع تتبع فوري ودعم عملاء على مدار الساعة
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => onNavigate('tracking')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  <span>تتبع شحنتك</span>
                </button>
                <button
                  onClick={() => onNavigate('services')}
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>استعرض خدماتنا</span>
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold text-white">1M+</div>
                  <div className="text-sm text-slate-400">شحنة تم توصيلها</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50K+</div>
                  <div className="text-sm text-slate-400">عميل سعيد</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">27</div>
                  <div className="text-sm text-slate-400">محافظة</div>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">تم التوصيل بنجاح</p>
                      <p className="text-slate-400 text-sm">القاهرة، مصر الجديدة</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"></div>
                  </div>
                  <p className="text-slate-300 text-sm mt-2 text-center">تم التسليم: اليوم ٣:٤٥ م</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">لماذا تختار فاست شيب؟</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">نحن نقدم خدمات شحن متكاملة مع أعلى معايير الجودة والموثوقية</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Clock, title: 'توصيل سريع', desc: 'توصيل خلال 24-48 ساعة في جميع المحافظات' },
              { icon: Shield, title: 'ضمان الأمان', desc: 'تأمين كامل على جميع الشحنات حتى 50,000 جنيه' },
              { icon: MapPin, title: 'تغطية شاملة', desc: 'نخدم 27 محافظة في جميع أنحاء الجمهورية' },
              { icon: Headphones, title: 'دعم 24/7', desc: 'فريق دعم عملاء متاح على مدار الساعة' },
            ].map((feature, idx) => (
              <div key={idx} className="group p-6 bg-slate-50 rounded-2xl hover:bg-blue-50 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">ابدأ معنا اليوم</h2>
          <p className="text-blue-100 mb-8">انضم إلى 50,000+ عميل سعيد واستفد من خدماتنا المتميزة</p>
          <button
            onClick={() => onNavigate('contact')}
            className="px-8 py-4 bg-white text-blue-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            تواصل معنا للبدء
          </button>
        </div>
      </section>
    </div>
  )
}

// Tracking Page
function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 2000)
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">تتبع شحنتك</h1>
          <p className="text-slate-600">أدخل رقم التتبع الخاص بك لمعرفة حالة الشحنة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleTrack} className="flex gap-4">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="مثال: FS-12345678"
              className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <button
              type="submit"
              disabled={isSearching || !trackingNumber.trim()}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري البحث...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>تتبع</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Result */}
          {trackingNumber && !isSearching && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-emerald-900">تم التوصيل بنجاح</p>
                  <p className="text-sm text-emerald-700">تم التسليم اليوم ٣:٤٥ م</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { status: 'تم إنشاء الشحنة', date: '١٠ أبريل ٢٠٢٦', done: true },
                  { status: 'تم استلام الشحنة', date: '١٠ أبريل ٢٠٢٦', done: true },
                  { status: 'في الطريق للتوصيل', date: '١٠ أبريل ٢٠٢٦', done: true },
                  { status: 'تم التوصيل', date: '١٠ أبريل ٢٠٢٦', done: true },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${step.done ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    <div className="flex-1">
                      <p className={`text-sm ${step.done ? 'text-slate-900' : 'text-slate-500'}`}>{step.status}</p>
                    </div>
                    <p className="text-xs text-slate-500">{step.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Services Page
function ServicesPage() {
  const services = [
    {
      icon: Package,
      title: 'شحن سريع',
      desc: 'توصيل خلال 24 ساعة داخل القاهرة الكبرى و48 ساعة للمحافظات',
      price: 'يبدأ من 35 جنيه',
      features: ['تتبع فوري', 'تأمين شامل', 'إشعارات SMS'],
    },
    {
      icon: Truck,
      title: 'شحن مجمد',
      desc: 'حلول شحن مخصصة للمنتجات المجمدة والطازجة مع سيارات مبردة',
      price: 'يبدأ من 75 جنيه',
      features: ['سيارات مبردة', 'درجة حرارة محكمة', 'توصيل سريع'],
    },
    {
      icon: Shield,
      title: 'شحن آمن',
      desc: 'خدمة شحن مؤمنة للمنتجات القيمة مع تعويض كامل',
      price: 'يبدأ من 50 جنيه',
      features: ['تأمين حتى 50,000', 'تغليف مخصص', 'توقيع استلام'],
    },
    {
      icon: TrendingUp,
      title: 'حلول الشركات',
      desc: 'عقود شهرية وسنوية للشركات مع مميزات حصرية',
      price: 'عروض خاصة',
      features: ['خصومات تصل 40%', 'فواتير شهرية', 'مدير حساب مخصص'],
    },
  ]

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">خدماتنا</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">حلول شحن متكاملة تناسب جميع احتياجاتك</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <service.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
              <p className="text-slate-600 mb-4">{service.desc}</p>
              <p className="text-2xl font-bold text-amber-600 mb-6">{service.price}</p>
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
                احجز الآن
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// About Page
function AboutPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">عن فاست شيب</h1>
          <p className="text-slate-600">قصة نجاح بدأت منذ 2019</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <p className="text-slate-700 leading-relaxed mb-6">
            فاست شيب مصر هي شركة توصيل رائدة تأسست في عام 2019 بهدف تقديم خدمات شحن سريعة وموثوقة للشركات والأفراد في جميع أنحاء الجمهورية. بدأنا كشركة صغيرة في القاهرة والآن نخدم 27 محافظة.
          </p>
          <p className="text-slate-700 leading-relaxed">
            نؤمن بأن سرعة التوصيل وأمان الشحنات هي أساس نجاح أي عمل تجاري، ولذلك نستثمر باستمرار في تطوير بنيتنا التحتية وفريقنا لنقدم أفضل خدمة ممكنة لعملائنا.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { number: '2019', label: 'سنة التأسيس' },
            { number: '500+', label: 'موظف' },
            { number: '200+', label: 'سيارة توصيل' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Contact Page
function ContactPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">اتصل بنا</h1>
          <p className="text-slate-600">فريقنا جاهز لمساعدتك على مدار الساعة</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="font-bold text-lg mb-6">معلومات التواصل</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">الخط الساخن</p>
                  <p className="font-bold text-slate-900">19282</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">العنوان</p>
                  <p className="font-bold text-slate-900">القاهرة، مصر</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">مواعيد العمل</p>
                  <p className="font-bold text-slate-900">24 ساعة / 7 أيام</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="font-bold text-lg mb-6">أرسل رسالة</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="الاسم"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="الرسالة"
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
              >
                إرسال
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// Support Page with Chat
function SupportPage({ apiStatus }: { apiStatus: 'checking' | 'online' | 'offline' }) {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">الدعم والمساعدة</h1>
          <p className="text-slate-600">تحدث مع سارة، مساعدتك الذكية للدعم الفني</p>
        </div>

        <ChatWidget apiStatus={apiStatus} />
      </div>
    </div>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">FastShip</h3>
                <p className="text-xs">فاست شيب مصر</p>
              </div>
            </div>
            <p className="text-sm">خدمة توصيل سريعة وموثوقة لجميع أنحاء الجمهورية</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">تتبع الشحنة</a></li>
              <li><a href="#" className="hover:text-white transition-colors">خدماتنا</a></li>
              <li><a href="#" className="hover:text-white transition-colors">الأسعار</a></li>
              <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li>الخط الساخن: 19282</li>
              <li>البريد: support@fastship.com</li>
              <li>القاهرة، مصر</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">تابعنا</h4>
            <div className="flex gap-4">
              {['فيسبوك', 'تويتر', 'إنستغرام', 'لينكدإن'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors text-xs">
                  {social[0]}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-sm">
          <p>© 2026 فاست شيب مصر. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
