import React, { useState, useEffect, useRef } from 'react'
import {
  Package, MapPin, Phone, Clock, Shield,
  Search, Menu, X, CheckCircle2, ArrowRight, Zap,
  Globe, Building2, HeartHandshake,
  Star, TrendingUp, Mail, MessageCircle,
  ChevronDown, AlertCircle, Send, Loader2, Headphones, Truck
} from 'lucide-react'
import { ChatWidget } from './components/ChatWidget'
import { PersistentChat } from './components/PersistentChat'
import { translations, Language, Translations } from './translations'

type Page = 'home' | 'tracking' | 'services' | 'about' | 'contact' | 'support'

const C = {
  primary: '#E0442E',
  primaryDark: '#C73A28',
  primaryLight: '#FEF2F0',
  secondary: '#2D3E50',
  accent: '#F59E0B',
  success: '#10B981',
}

/* ── Brand Logo SVG (matches favicon) ── */
function ShiphnyLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="196" width="90" height="7" rx="3.5" fill="#fff" opacity="0.6"/>
      <rect x="130" y="196" width="106" height="7" rx="3.5" fill="#fff" opacity="0.6"/>
      <rect x="20" y="118" width="150" height="78" rx="10" fill="#2D3E50"/>
      <path d="M170 138 L170 196 L230 196 L230 158 L210 138 Z" fill="#E0442E"/>
      <path d="M178 146 L178 168 L220 168 L220 160 L205 146 Z" fill="#B8D4E8" opacity="0.9"/>
      <rect x="225" y="128" width="7" height="18" rx="3.5" fill="#2D3E50"/>
      <rect x="2" y="145" width="40" height="6" rx="3" fill="#2D3E50" opacity="0.5"/>
      <rect x="2" y="160" width="28" height="6" rx="3" fill="#2D3E50" opacity="0.4"/>
      <rect x="2" y="175" width="18" height="6" rx="3" fill="#2D3E50" opacity="0.3"/>
      <circle cx="80" cy="200" r="20" fill="#2D3E50"/>
      <circle cx="80" cy="200" r="10" fill="#F5F5F5"/>
      <circle cx="80" cy="200" r="4" fill="#2D3E50"/>
      <circle cx="190" cy="200" r="20" fill="#2D3E50"/>
      <circle cx="190" cy="200" r="10" fill="#F5F5F5"/>
      <circle cx="190" cy="200" r="4" fill="#2D3E50"/>
      <rect x="68" y="66" width="84" height="68" rx="8" fill="#E0442E"/>
      <rect x="68" y="108" width="84" height="26" fill="#C73A28"/>
      <rect x="104" y="66" width="14" height="68" fill="#fff" opacity="0.25"/>
      <rect x="68" y="94" width="84" height="12" fill="#fff" opacity="0.25"/>
      <ellipse cx="91" cy="56" rx="19" ry="13" fill="#E0442E" transform="rotate(-30 91 56)"/>
      <ellipse cx="131" cy="56" rx="19" ry="13" fill="#E0442E" transform="rotate(30 131 56)"/>
      <circle cx="111" cy="66" r="9" fill="#E0442E"/>
      <path d="M105 40 L117 40 L117 62 L111 56 L105 62 Z" fill="#fff" opacity="0.9"/>
    </svg>
  )
}

/* ── Toast Notification ── */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-medium transition-all animate-fade-in ${
      type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
    }`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}

/* ── Validation helpers ── */
const VALIDATORS = {
  name: (v: string) => {
    if (!v.trim()) return { ar: 'الاسم مطلوب', en: 'Name is required' }
    if (v.trim().length < 3) return { ar: 'الاسم يجب أن يكون 3 أحرف على الأقل', en: 'Name must be at least 3 characters' }
    if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(v.trim())) return { ar: 'الاسم يجب أن يحتوي على حروف فقط', en: 'Name must contain letters only' }
    return null
  },
  phone: (v: string) => {
    const digits = v.replace(/\D/g, '')
    if (!digits) return { ar: 'رقم الهاتف مطلوب', en: 'Phone is required' }
    if (digits.length < 10) return { ar: 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل', en: 'Phone must be at least 10 digits' }
    if (digits.length > 13) return { ar: 'رقم الهاتف يجب أن لا يتجاوز 13 رقم', en: 'Phone must not exceed 13 digits' }
    if (!/^(01|002|0020|\+20)/.test(digits.startsWith('0') ? '0' + digits : digits) && digits.length === 11) {}
    return null
  },
  pickup: (v: string) => {
    if (!v.trim()) return { ar: 'عنوان الاستلام مطلوب', en: 'Pickup address is required' }
    if (v.trim().length < 10) return { ar: 'يرجى كتابة عنوان تفصيلي (الشارع، المنطقة، المحافظة)', en: 'Please enter a detailed address (street, area, city)' }
    return null
  },
  delivery: (v: string) => {
    if (!v.trim()) return { ar: 'عنوان التوصيل مطلوب', en: 'Delivery address is required' }
    if (v.trim().length < 10) return { ar: 'يرجى كتابة عنوان تفصيلي (الشارع، المنطقة، المحافظة)', en: 'Please enter a detailed address (street, area, city)' }
    return null
  },
  weight: (v: string) => {
    if (!v) return null // optional
    const n = parseFloat(v)
    if (isNaN(n) || n <= 0) return { ar: 'الوزن يجب أن يكون رقماً موجباً', en: 'Weight must be a positive number' }
    if (n > 1000) return { ar: 'الوزن لا يمكن أن يتجاوز 1000 كجم', en: 'Weight cannot exceed 1000 kg' }
    return null
  },
}

type FormFields = { name: string; phone: string; pickup: string; delivery: string; weight: string; notes: string }
type FieldErrors = Partial<Record<keyof FormFields, string>>

/* ── Field (module-level so React never remounts inputs) ── */
function BookingField({
  id, label, tip, type = 'text', rows,
  value, onChange, onBlur, error,
  isRtl, touched, lang,
}: {
  id: keyof FormFields; label: string; tip?: string; type?: string; rows?: number
  value: string; onChange: (v: string) => void; onBlur: () => void; error?: string
  isRtl: boolean; touched: Partial<Record<keyof FormFields, boolean>>; lang: Language
}) {
  const base = `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-all ${isRtl ? 'text-right' : 'text-left'} ${
    error ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300' : 'border-gray-200 bg-gray-50 focus:ring-2 focus:ring-red-300 focus:border-red-400'
  }`
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
          placeholder={tip} rows={rows} className={`${base} resize-none`} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
          placeholder={tip} className={base} />
      )}
      {error && (
        <p className={`mt-1 text-xs text-red-500 flex items-center gap-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
      {!error && tip && touched[id] && value && (
        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />{lang === 'ar' ? 'صحيح ✓' : 'Valid ✓'}
        </p>
      )}
    </div>
  )
}

/* ── Booking Modal ── */
function BookingModal({ service, lang, onClose }: { service: string; lang: Language; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormFields>({ name: '', phone: '', pickup: '', delivery: '', weight: '', notes: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [doneRef, setDoneRef] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const isRtl = lang === 'ar'

  const L = {
    ar: {
      title: 'حجز شحنة جديدة', step1: 'بيانات المرسل', step2: 'تفاصيل الشحنة',
      name: 'الاسم الكامل *', phone: 'رقم الهاتف *',
      pickup: 'عنوان الاستلام *', delivery: 'عنوان التوصيل *',
      weight: 'الوزن التقريبي (كجم)', notes: 'ملاحظات إضافية',
      phoneTip: 'مثال: 01012345678',
      pickupTip: 'مثال: ٢٥ شارع التحرير، وسط البلد، القاهرة',
      deliveryTip: 'مثال: ٥ شارع النصر، المعادي، القاهرة',
      next: 'التالي ←', back: '→ رجوع', confirm: 'تأكيد الحجز',
      successTitle: 'تم تسجيل حجزك بنجاح! 🎉',
      successBody: 'سيتواصل معك فريقنا خلال 30 دقيقة لتأكيد الحجز.',
      refLabel: 'رقم الحجز',
      aiTip: '💡 يمكنك سؤال سارة الذكاء الاصطناعي عن حجزك برقم المرجع أعلاه',
      close: 'إغلاق',
      service: 'الخدمة المختارة',
    },
    en: {
      title: 'New Shipment Booking', step1: 'Sender Details', step2: 'Shipment Details',
      name: 'Full Name *', phone: 'Phone Number *',
      pickup: 'Pickup Address *', delivery: 'Delivery Address *',
      weight: 'Estimated Weight (kg)', notes: 'Additional Notes',
      phoneTip: 'e.g. 01012345678',
      pickupTip: 'e.g. 25 Tahrir Street, Downtown, Cairo',
      deliveryTip: 'e.g. 5 Al-Nasr Street, Maadi, Cairo',
      next: 'Next →', back: '← Back', confirm: 'Confirm Booking',
      successTitle: 'Booking Confirmed! 🎉',
      successBody: 'Our team will contact you within 30 minutes to confirm your booking.',
      refLabel: 'Booking Reference',
      aiTip: '💡 You can ask Sara AI about your booking using the reference number above',
      close: 'Close',
      service: 'Selected Service',
    },
  }
  const l = L[lang]

  // Validate a single field
  const validateField = (field: keyof FormFields, value: string): string | undefined => {
    const v = VALIDATORS[field as keyof typeof VALIDATORS]
    if (!v) return undefined
    const err = v(value)
    return err ? err[lang] : undefined
  }

  // Validate all fields for a given step
  const validateStep = (s: number): boolean => {
    const fields: (keyof FormFields)[] = s === 1 ? ['name', 'phone'] : ['pickup', 'delivery', 'weight']
    const newErrors: FieldErrors = { ...errors }
    const newTouched: Partial<Record<keyof FormFields, boolean>> = { ...touched }
    let valid = true
    fields.forEach(f => {
      newTouched[f] = true
      const err = validateField(f, form[f])
      if (err) { newErrors[f] = err; valid = false }
      else delete newErrors[f]
    })
    setErrors(newErrors)
    setTouched(newTouched)
    return valid
  }

  const handleChange = (field: keyof FormFields, value: string) => {
    setForm(p => ({ ...p, [field]: value }))
    if (touched[field]) {
      const err = validateField(field, value)
      setErrors(p => ({ ...p, [field]: err }))
    }
  }

  const handleBlur = (field: keyof FormFields) => {
    setTouched(p => ({ ...p, [field]: true }))
    const err = validateField(field, form[field])
    setErrors(p => ({ ...p, [field]: err }))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep(1)) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(2)) return
    setSubmitting(true)
    setApiError(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name:      form.name.trim(),
          sender_phone:     form.phone.trim(),
          pickup_address:   form.pickup.trim(),
          delivery_address: form.delivery.trim(),
          service_type:     service,
          weight_kg:        form.weight ? parseFloat(form.weight) : null,
          notes:            form.notes.trim() || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.detail || (lang === 'ar' ? 'حدث خطأ في الحجز' : 'Booking failed'))
      }
      const data = await res.json()
      setDoneRef(data.reference)
    } catch (err: any) {
      setApiError(err.message || (lang === 'ar' ? 'تعذّر الاتصال بالسيرفر' : 'Could not connect to server'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{ backgroundColor: '#fff', borderRadius: '1.5rem', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', width: '100%', maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div style={{ backgroundColor: C.primary, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{l.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', margin: 0 }}>{l.service}: {service}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.5rem', padding: '0.375rem', cursor: 'pointer', color: '#fff', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {doneRef ? (
            /* ── Success state ── */
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle2 size={40} color={C.success} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: C.secondary, marginBottom: '0.5rem' }}>{l.successTitle}</h4>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{l.successBody}</p>
              <div style={{ backgroundColor: C.primaryLight, border: `1px solid ${C.primary}40`, borderRadius: '0.75rem', padding: '0.875rem 1.25rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>{l.refLabel}</p>
                <p style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.25rem', color: C.primary, margin: 0 }}>{doneRef}</p>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', backgroundColor: '#F9FAFB', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '1.25rem' }}>{l.aiTip}</p>
              <button onClick={onClose} style={{ padding: '0.75rem 2rem', backgroundColor: C.primary, color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                {l.close}
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <div style={{ padding: '1.5rem' }}>
              {/* Step progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[1, 2].map(n => (
                  <React.Fragment key={n}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                      backgroundColor: step >= n ? C.primary : '#E5E7EB',
                      color: step >= n ? '#fff' : '#6B7280',
                    }}>
                      {step > n ? <CheckCircle2 size={16} /> : n}
                    </div>
                    <div style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: step >= n ? C.primary : '#9CA3AF' }}>
                      {n === 1 ? l.step1 : l.step2}
                    </div>
                    {n < 2 && <div style={{ width: 24, height: 2, borderRadius: 1, backgroundColor: step > n ? C.primary : '#E5E7EB', flexShrink: 0 }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* API error banner */}
              {apiError && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: '#DC2626', fontSize: '0.8rem', margin: 0 }}>{apiError}</p>
                </div>
              )}

              <form onSubmit={step === 1 ? handleNext : handleSubmit} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {step === 1 && (
                    <>
                      <BookingField id="name" label={l.name} tip={lang === 'ar' ? 'مثال: أحمد محمد علي' : 'e.g. Ahmed Mohamed'}
                        value={form.name} onChange={v => handleChange('name', v)} onBlur={() => handleBlur('name')} error={errors.name}
                        isRtl={isRtl} touched={touched} lang={lang} />
                      <BookingField id="phone" label={l.phone} tip={l.phoneTip} type="tel"
                        value={form.phone} onChange={v => handleChange('phone', v)} onBlur={() => handleBlur('phone')} error={errors.phone}
                        isRtl={isRtl} touched={touched} lang={lang} />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <BookingField id="pickup" label={l.pickup} tip={l.pickupTip}
                        value={form.pickup} onChange={v => handleChange('pickup', v)} onBlur={() => handleBlur('pickup')} error={errors.pickup}
                        isRtl={isRtl} touched={touched} lang={lang} />
                      <BookingField id="delivery" label={l.delivery} tip={l.deliveryTip}
                        value={form.delivery} onChange={v => handleChange('delivery', v)} onBlur={() => handleBlur('delivery')} error={errors.delivery}
                        isRtl={isRtl} touched={touched} lang={lang} />
                      <BookingField id="weight" label={l.weight} tip={lang === 'ar' ? 'مثال: 2.5' : 'e.g. 2.5'} type="number"
                        value={form.weight} onChange={v => handleChange('weight', v)} onBlur={() => handleBlur('weight')} error={errors.weight}
                        isRtl={isRtl} touched={touched} lang={lang} />
                      <BookingField id="notes" label={l.notes} tip={lang === 'ar' ? 'أي تعليمات خاصة للمندوب...' : 'Any special instructions...'} rows={2}
                        value={form.notes} onChange={v => handleChange('notes', v)} onBlur={() => handleBlur('notes')} error={errors.notes}
                        isRtl={isRtl} touched={touched} lang={lang} />
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  {step === 2 && (
                    <button type="button" onClick={() => setStep(1)} style={{
                      flex: 1, padding: '0.8rem', border: '2px solid #E5E7EB', borderRadius: '0.75rem',
                      fontWeight: 600, color: '#374151', cursor: 'pointer', backgroundColor: '#fff', fontSize: '0.875rem'
                    }}>
                      {l.back}
                    </button>
                  )}
                  <button type="submit" disabled={submitting} style={{
                    flex: 2, padding: '0.8rem', backgroundColor: submitting ? '#ccc' : C.primary,
                    color: '#fff', border: 'none', borderRadius: '0.75rem', fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer', fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}>
                    {submitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                    {step === 1 ? l.next : (submitting ? (lang === 'ar' ? 'جاري الحجز...' : 'Booking...') : l.confirm)}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════ */
/*              MAIN APP                     */
/* ════════════════════════════════════════ */
export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [lang, setLang] = useState<Language>('ar')
  const [navVisible, setNavVisible] = useState(true)
  const [navSolid, setNavSolid] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [bookingService, setBookingService] = useState<string | null>(null)
  const lastScrollY = useRef(0)

  const t = translations[lang]
  const isRtl = lang === 'ar'

  useEffect(() => {
    checkApiStatus()
    const interval = setInterval(checkApiStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setNavVisible(true)
    setNavSolid(currentPage !== 'home')
    lastScrollY.current = 0
    setIsMenuOpen(false)
  }, [currentPage])

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      if (currentPage === 'home') setNavSolid(y > 60)
      else setNavSolid(true)
      if (y < 80) setNavVisible(true)
      else if (y < lastScrollY.current - 5) setNavVisible(true)
      else if (y > lastScrollY.current + 5) setNavVisible(false)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPage])

  // Update document title dynamically
  useEffect(() => {
    const titles: Record<Page, string> = {
      home: 'شحني - Shiphny Express | الشحن السريع في مصر',
      tracking: 'تتبع الشحنة | شحني',
      services: 'الخدمات | شحني',
      about: 'عن الشركة | شحني',
      contact: 'تواصل معنا | شحني',
      support: 'الدعم الفني | شحني',
    }
    document.title = titles[currentPage]
  }, [currentPage])

  const checkApiStatus = async () => {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/health`)
      setApiStatus(r.ok ? 'online' : 'offline')
    } catch { setApiStatus('offline') }
  }

  const toggleLang = () => setLang(prev => prev === 'ar' ? 'en' : 'ar')
  const navTextWhite = !navSolid

  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'tracking', label: t.nav.tracking },
    { id: 'services', label: t.nav.services },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ]

  return (
    <div className="min-h-screen bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {bookingService && <BookingModal service={bookingService} lang={lang} onClose={() => setBookingService(null)} />}

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navVisible ? 'translate-y-0' : '-translate-y-full'} ${navSolid ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: C.primary }}>
                <ShiphnyLogo size={40} />
              </div>
              <div>
                <h1 className={`font-bold text-xl lg:text-2xl leading-tight transition-colors ${navTextWhite ? 'text-white' : 'text-gray-900'}`}>
                  {t.brand.name}
                </h1>
                <p className={`text-xs transition-colors leading-tight ${navTextWhite ? 'text-white/70' : 'text-gray-500'}`}>
                  {t.brand.subtitle}
                </p>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setCurrentPage(item.id as Page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentPage === item.id ? 'text-white' : navTextWhite ? 'text-white/90 hover:bg-white/15' : 'text-gray-700 hover:bg-gray-100'}`}
                  style={currentPage === item.id ? { backgroundColor: C.primary } : {}}>
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right controls */}
            <div className="hidden lg:flex items-center gap-2">
              <button onClick={toggleLang}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${navTextWhite ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <Globe className="w-4 h-4" />
                {t.nav.langSwitcher}
              </button>
              <button onClick={() => setCurrentPage('support')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${navTextWhite ? 'border-white/60 text-white hover:bg-white/10' : 'hover:bg-red-50'}`}
                style={!navTextWhite ? { borderColor: C.primary, color: C.primary } : {}}>
                {t.nav.support}
              </button>
              <button onClick={() => setCurrentPage('tracking')}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: C.primary }}>
                {t.nav.trackButton}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${navTextWhite ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'}`}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-xl">
            <div className="px-4 py-3 space-y-1">
              <button onClick={() => { toggleLang(); setIsMenuOpen(false) }}
                className="w-full px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2 bg-gray-100 text-gray-700">
                <Globe className="w-4 h-4" />
                {lang === 'ar' ? 'English' : 'عربي'}
              </button>
              <div className="h-px bg-gray-100 my-1" />
              {navItems.map(item => (
                <button key={item.id} onClick={() => setCurrentPage(item.id as Page)}
                  className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${isRtl ? 'text-right' : 'text-left'} ${currentPage === item.id ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                  style={currentPage === item.id ? { backgroundColor: C.primary } : {}}>
                  {item.label}
                </button>
              ))}
              <button onClick={() => setCurrentPage('support')}
                className={`w-full px-4 py-3 mt-1 text-white rounded-lg text-sm font-semibold ${isRtl ? 'text-right' : 'text-left'}`}
                style={{ backgroundColor: C.primary }}>
                {t.nav.support}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── PAGES ── */}
      <main>
        {currentPage === 'home'     && <HomePage     t={t} lang={lang} onNavigate={setCurrentPage} trackingNumber={trackingNumber} setTrackingNumber={setTrackingNumber} onBook={setBookingService} />}
        {currentPage === 'tracking' && <TrackingPage t={t} lang={lang} initialNumber={trackingNumber} />}
        {currentPage === 'services' && <ServicesPage t={t} lang={lang} onBook={setBookingService} />}
        {currentPage === 'about'    && <AboutPage    t={t} lang={lang} />}
        {currentPage === 'contact'  && <ContactPage  t={t} lang={lang} onToast={setToast} />}
        {currentPage === 'support'  && <SupportPage  t={t} apiStatus={apiStatus} />}
      </main>

      <Footer t={t} lang={lang} onNavigate={setCurrentPage} />
      <PersistentChat apiStatus={apiStatus} lang={lang} />
    </div>
  )
}

/* ════════════════════════════════════════ */
/*              HOME PAGE                    */
/* ════════════════════════════════════════ */
function HomePage({ t, lang, onNavigate, trackingNumber, setTrackingNumber, onBook }: {
  t: Translations; lang: Language; onNavigate: (p: Page) => void
  trackingNumber: string; setTrackingNumber: (v: string) => void
  onBook: (s: string) => void
}) {
  const isRtl = lang === 'ar'
  const [activeTab, setActiveTab] = useState<'individual' | 'business'>('individual')

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-screen sm:min-h-[90vh] flex items-center" style={{ backgroundColor: C.secondary }}>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(ellipse at ${isRtl ? '80%' : '20%'} 50%, ${C.primary}25 0%, transparent 55%), radial-gradient(ellipse at ${isRtl ? '20%' : '80%'} 80%, #ffffff08 0%, transparent 50%)`
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className={`text-center ${isRtl ? 'lg:text-right' : 'lg:text-left'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5" style={{ backgroundColor: `${C.primary}22` }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: C.primary }} />
                <span className="text-xs sm:text-sm font-semibold" style={{ color: C.primary }}>{t.home.badge}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
                {t.home.title}
                <br />
                <span style={{ color: C.primary }}>{t.home.subtitle}</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                {t.home.description}
              </p>

              {/* Tabs */}
              <div className="flex gap-2 mb-5 justify-center lg:justify-start">
                {(['individual', 'business'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab ? 'text-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                    style={{ backgroundColor: activeTab === tab ? C.primary : 'transparent' }}>
                    {tab === 'individual' ? <Package className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    {t.home.tabs[tab]}
                  </button>
                ))}
              </div>

              {/* Tracking box */}
              <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-md mx-auto lg:mx-0">
                <div className="flex gap-2">
                  <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                    placeholder={t.home.trackingPlaceholder}
                    onKeyDown={e => e.key === 'Enter' && onNavigate('tracking')}
                    className={`flex-1 min-w-0 px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-sm sm:text-base text-gray-800 ${isRtl ? 'text-right' : 'text-left'}`} />
                  <button onClick={() => onNavigate('tracking')}
                    className="flex-shrink-0 px-4 sm:px-6 py-3 text-white rounded-xl font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all text-sm"
                    style={{ backgroundColor: C.primary }}>
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.home.trackingButton}</span>
                  </button>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
                {[
                  { v: t.home.stats.shipments.value, l: t.home.stats.shipments.label },
                  { v: t.home.stats.governorates.value, l: t.home.stats.governorates.label },
                  { v: t.home.stats.satisfaction.value, l: t.home.stats.satisfaction.label },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-extrabold text-white">{s.v}</div>
                    <div className="text-xs text-gray-400">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero right: Visual card */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-56 h-56 rounded-full opacity-20" style={{ backgroundColor: C.primary }} />
                <div className="absolute -bottom-4 -left-4 w-36 h-36 rounded-full opacity-15" style={{ backgroundColor: C.accent }} />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-800">
                  <img
                    src="https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=700&q=80"
                    alt="Delivery service"
                    className="w-full h-72 object-cover opacity-80"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
                    <div className="bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.primaryLight }}>
                        <Package className="w-4 h-4" style={{ color: C.primary }} />
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: C.secondary }}>{t.home.stats.shipments.value}</p>
                        <p className="text-xs text-gray-500">{t.home.stats.shipments.label}</p>
                      </div>
                    </div>
                    <div className="bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: C.secondary }}>{t.home.stats.satisfaction.value}</p>
                        <p className="text-xs text-gray-500">{t.home.stats.satisfaction.label}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 right-6 bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700">{t.home.coverageBadge}</span>
                </div>
                <div className="absolute -bottom-3 left-6 bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-700">{t.home.deliveryTimeBadge}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <ChevronDown className="w-6 h-6 text-white/50" />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.secondary }}>{t.features.title}</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">{t.features.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {t.features.items.map((f, i) => {
              const icons = [Zap, Shield, Globe, HeartHandshake]
              const colors = [C.primary, C.success, '#3B82F6', C.accent]
              const Icon = icons[i]
              return (
                <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4" style={{ backgroundColor: `${colors[i]}14` }}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: colors[i] }} />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base mb-1" style={{ color: C.secondary }}>{f.title}</h3>
                  <p className="text-gray-500 text-xs sm:text-sm hidden sm:block leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Services preview ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.secondary }}>{t.services.title}</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">{t.services.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {t.services.items.map((s, i) => {
              const icons = [Zap, Truck, Building2]
              const Icon = icons[i]
              const isPopular = i === 0
              return (
                <div key={i} className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 transition-all hover:shadow-xl ${isPopular ? 'border-red-300' : 'border-gray-100 hover:border-red-100'}`}
                  style={{ backgroundColor: isPopular ? C.primaryLight : 'white' }}>
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: C.primary }}>
                      {('popular' in s) ? (s as any).popular : ''}
                    </div>
                  )}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: C.primaryLight }}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: C.primary }} />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-2" style={{ color: C.secondary }}>{s.title}</h3>
                  <p className="text-gray-500 text-sm mb-3">{s.desc}</p>
                  <p className="text-xl sm:text-2xl font-bold mb-4" style={{ color: C.primary }}>{s.price}</p>
                  <ul className="space-y-1.5 mb-5">
                    {s.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: C.primary }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => onBook(s.title)}
                    className="w-full py-3 rounded-xl font-bold text-white hover:opacity-90 transition-all active:scale-95"
                    style={{ backgroundColor: C.primary }}>
                    {lang === 'ar' ? 'احجز الآن' : 'Book Now'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-12 sm:py-16" style={{ backgroundColor: C.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { v: t.home.stats.shipments.value, l: t.home.stats.shipments.label },
              { v: '50,000+', l: lang === 'ar' ? 'عميل سعيد' : 'Happy Customers' },
              { v: t.home.stats.governorates.value, l: t.home.stats.governorates.label },
              { v: t.home.stats.satisfaction.value, l: t.home.stats.satisfaction.label },
            ].map((s, i) => (
              <div key={i} className="text-white">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-1">{s.v}</div>
                <div className="text-red-100 text-sm sm:text-base">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.secondary }}>{t.howItWorks.title}</h2>
            <p className="text-gray-500 text-sm sm:text-base">{t.howItWorks.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {t.howItWorks.steps.map((s, i) => {
              const icons = [Package, Truck, CheckCircle2]
              const Icon = icons[i]
              return (
                <div key={i} className="relative text-center group">
                  {i < 2 && (
                    <div className="absolute top-10 hidden sm:block" style={{ [isRtl ? 'left' : 'right']: '-2rem' }}>
                      <ArrowRight className={`w-7 h-7 text-gray-300 ${isRtl ? 'rotate-180' : ''}`} />
                    </div>
                  )}
                  <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{ backgroundColor: C.primaryLight }}>
                    <Icon className="w-10 h-10" style={{ color: C.primary }} />
                  </div>
                  <div className="text-5xl font-extrabold mb-2 select-none" style={{ color: `${C.primary}18` }}>{s.step}</div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: C.secondary }}>{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.secondary }}>
              {lang === 'ar' ? 'ماذا يقول عملاؤنا؟' : 'What Our Customers Say'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(lang === 'ar' ? [
              { name: 'أحمد محمد', role: 'صاحب متجر إلكتروني', text: 'خدمة ممتازة ومتابعة رائعة. شحني بتوصل طلبات عملائي في الوقت المحدد دائماً.', stars: 5 },
              { name: 'سارة إبراهيم', role: 'عميلة مميزة', text: 'أفضل شركة شحن جربتها في مصر. الدعم الفني متاح 24 ساعة وبيحلوا المشاكل فوراً.', stars: 5 },
              { name: 'خالد عمر', role: 'مدير مشتريات', text: 'تعاملنا مع شحني للشحن بالجملة والنتيجة كانت مذهلة. خصومات ممتازة وخدمة احترافية.', stars: 5 },
            ] : [
              { name: 'Ahmed Mohamed', role: 'E-commerce Owner', text: 'Excellent service and great follow-up. Shiphny always delivers my customers\' orders on time.', stars: 5 },
              { name: 'Sara Ibrahim', role: 'Premium Customer', text: 'The best shipping company I\'ve tried in Egypt. Support is available 24 hours and solves problems instantly.', stars: 5 },
              { name: 'Khaled Omar', role: 'Procurement Manager', text: 'We dealt with Shiphny for bulk shipping and the result was amazing. Excellent discounts and professional service.', stars: 5 },
            ]).map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex mb-3">
                  {Array.from({ length: review.stars }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: C.primary }}>
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: C.secondary }}>{review.name}</p>
                    <p className="text-xs text-gray-400">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 sm:py-20" style={{ backgroundColor: C.secondary }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t.services.ctaTitle}</h2>
          <p className="text-gray-300 mb-8 text-sm sm:text-base">{t.services.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => onBook(lang === 'ar' ? 'الشحن السريع' : 'Express Shipping')}
              className="px-8 py-4 text-white rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg"
              style={{ backgroundColor: C.primary }}>{lang === 'ar' ? 'احجز شحنة الآن' : 'Book a Shipment'}</button>
            <button onClick={() => onNavigate('contact')}
              className="px-8 py-4 rounded-xl font-bold border-2 border-white/40 text-white hover:bg-white/10 transition-all">
              {t.services.ctaContact}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ════════════════════════════════════════ */
/*            TRACKING PAGE                  */
/* ════════════════════════════════════════ */
function TrackingPage({ t, lang, initialNumber }: { t: Translations; lang: Language; initialNumber?: string }) {
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

  return (
    <div className="pt-20 sm:pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.secondary }}>{t.tracking.title}</h1>
          <p className="text-gray-500 text-sm sm:text-base">{t.tracking.subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleTrack} className="flex gap-3 mb-6">
            <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
              placeholder={t.tracking.placeholder}
              className={`flex-1 min-w-0 px-4 sm:px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-sm sm:text-base ${isRtl ? 'text-right' : 'text-left'}`} />
            <button type="submit" disabled={isSearching || !trackingNumber.trim()}
              className="flex-shrink-0 px-5 sm:px-7 py-3.5 text-white rounded-xl font-semibold disabled:opacity-50 transition-all hover:opacity-90 flex items-center gap-2 text-sm"
              style={{ backgroundColor: C.primary }}>
              {isSearching
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>{t.tracking.searching}</span></>
                : <><Search className="w-4 h-4" /><span>{t.tracking.button}</span></>}
            </button>
          </form>

          {/* Not found */}
          {notFound && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{lang === 'ar' ? 'رقم الشحنة غير صحيح. تأكد أن الرقم يبدأ بـ SH-' : 'Tracking number not found. Make sure it starts with SH-'}</span>
            </div>
          )}

          {/* Result */}
          {showResult && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.success }}>
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base sm:text-lg" style={{ color: C.secondary }}>{t.tracking.delivered}</p>
                  <p className="text-gray-500 text-sm">{t.tracking.deliveredDesc}</p>
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <p className="text-xs text-gray-400 mb-0.5">{t.tracking.trackingNumber}</p>
                  <p className="font-mono font-bold text-sm" style={{ color: C.secondary }}>{trackingNumber.toUpperCase()}</p>
                </div>
              </div>

              <div className="relative">
                <div className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-0 bottom-0 w-px bg-gray-200`} />
                {t.tracking.steps.map((step, idx) => (
                  <div key={idx} className={`relative flex gap-3 sm:gap-4 ${idx < t.tracking.steps.length - 1 ? 'mb-5' : ''}`}>
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm"
                      style={{ backgroundColor: C.success }}>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 pt-1.5 pb-2">
                      <p className={`font-semibold text-sm ${idx === t.tracking.steps.length - 1 ? 'text-base' : ''}`} style={{ color: C.secondary }}>{step.status}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-3">{t.tracking.helpText}</p>
          <a href="tel:19282" className="inline-flex items-center gap-2 text-lg font-bold" style={{ color: C.primary }}>
            <Phone className="w-5 h-5" />19282
          </a>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════ */
/*            SERVICES PAGE                  */
/* ════════════════════════════════════════ */
function ServicesPage({ t, lang, onBook }: { t: Translations; lang: Language; onBook: (s: string) => void }) {
  const serviceData = [
    { icon: Zap, popular: true, color: C.primary },
    { icon: Truck, popular: false, color: '#3B82F6' },
    { icon: Building2, popular: false, color: C.success },
  ]

  return (
    <div className="pt-20 sm:pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.secondary }}>{t.services.title}</h1>
          <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">{t.services.subtitle}</p>
        </div>

        {/* Service cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {t.services.items.map((s, i) => {
            const sd = serviceData[i]
            const Icon = sd.icon
            return (
              <div key={i}
                className={`relative rounded-3xl p-6 sm:p-8 border-2 hover:shadow-2xl transition-all ${sd.popular ? 'border-red-200' : 'border-gray-100 hover:border-red-100'}`}
                style={{ backgroundColor: sd.popular ? C.primaryLight : 'white' }}>
                {sd.popular && ('popular' in s) && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: C.primary }}>
                    {(s as any).popular}
                  </div>
                )}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `${sd.color}15` }}>
                  <Icon className="w-7 h-7" style={{ color: sd.color }} />
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ color: C.secondary }}>{s.title}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{s.desc}</p>
                <p className="text-2xl font-extrabold mb-4" style={{ color: C.primary }}>{s.price}</p>
                <ul className="space-y-2 mb-6">
                  {s.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: sd.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onBook(s.title)}
                  className="w-full py-3.5 rounded-xl font-bold text-white hover:opacity-90 active:scale-95 transition-all"
                  style={{ backgroundColor: C.primary }}>
                  {lang === 'ar' ? 'احجز الآن' : 'Book Now'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Features grid */}
        <div className="rounded-3xl p-6 sm:p-10 bg-gray-50 border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8" style={{ color: C.secondary }}>{t.services.featuresTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {t.services.allFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.primaryLight }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: C.primary }} />
                </div>
                <span className="text-gray-700 text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing note */}
        <div className="mt-10 rounded-3xl p-6 sm:p-8 text-center" style={{ backgroundColor: C.secondary }}>
          <h3 className="text-white font-bold text-lg sm:text-xl mb-2">
            {lang === 'ar' ? 'تحتاج عرض سعر مخصص للشركات؟' : 'Need a Custom Business Quote?'}
          </h3>
          <p className="text-gray-300 text-sm mb-5">
            {lang === 'ar' ? 'تواصل مع فريق المبيعات للحصول على عقد مخصص بأفضل الأسعار' : 'Contact our sales team for a custom contract with the best rates'}
          </p>
          <a href="tel:19282" className="inline-flex items-center gap-2 px-8 py-3 bg-white rounded-xl font-bold hover:bg-gray-50 transition-all" style={{ color: C.primary }}>
            <Phone className="w-5 h-5" />
            {lang === 'ar' ? 'اتصل بنا: 19282' : 'Call Us: 19282'}
          </a>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════ */
/*             ABOUT PAGE                    */
/* ════════════════════════════════════════ */
function AboutPage({ t, lang }: { t: Translations; lang: Language }) {
  const values = lang === 'ar'
    ? [{ icon: Zap, title: 'السرعة', desc: 'نلتزم بأسرع أوقات التوصيل في السوق المصري' },
       { icon: Shield, title: 'الأمان', desc: 'تأمين شامل على جميع الشحنات بدون استثناء' },
       { icon: HeartHandshake, title: 'الموثوقية', desc: 'نبني علاقات طويلة مع عملائنا على أساس الثقة' },
       { icon: TrendingUp, title: 'الابتكار', desc: 'نستخدم أحدث التقنيات لتحسين تجربة الشحن' }]
    : [{ icon: Zap, title: 'Speed', desc: 'We commit to the fastest delivery times in the Egyptian market' },
       { icon: Shield, title: 'Security', desc: 'Comprehensive insurance on all shipments without exception' },
       { icon: HeartHandshake, title: 'Reliability', desc: 'We build long-term relationships with our customers based on trust' },
       { icon: TrendingUp, title: 'Innovation', desc: 'We use the latest technologies to improve the shipping experience' }]

  const team = lang === 'ar'
    ? [{ name: 'محمد عبدالله', role: 'الرئيس التنفيذي', initials: 'م.ع' },
       { name: 'ريم أحمد', role: 'مديرة العمليات', initials: 'ر.أ' },
       { name: 'كريم حسن', role: 'مدير التكنولوجيا', initials: 'ك.ح' },
       { name: 'نورة محمد', role: 'مديرة خدمة العملاء', initials: 'ن.م' }]
    : [{ name: 'Mohamed Abdullah', role: 'CEO', initials: 'MA' },
       { name: 'Reem Ahmed', role: 'COO', initials: 'RA' },
       { name: 'Karim Hassan', role: 'CTO', initials: 'KH' },
       { name: 'Noura Mohamed', role: 'Customer Success', initials: 'NM' }]

  return (
    <div className="pt-20 sm:pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.secondary }}>{t.about.title}</h1>
          <p className="text-gray-500 text-sm sm:text-base">{t.about.subtitle}</p>
        </div>

        {/* Story */}
        <div className="bg-gray-50 rounded-3xl p-6 sm:p-10 mb-12">
          <div className="max-w-3xl mx-auto space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
            <p>{t.about.p1}</p>
            <p>{t.about.p2}</p>
            <p>{t.about.p3}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {t.about.stats.map((s, i) => (
            <div key={i} className="text-center p-5 sm:p-6 rounded-2xl border border-red-100" style={{ backgroundColor: C.primaryLight }}>
              <div className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: C.primary }}>{s.number}</div>
              <div className="text-gray-500 text-xs sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8" style={{ color: C.secondary }}>
            {lang === 'ar' ? 'قيمنا' : 'Our Values'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: C.primaryLight }}>
                    <Icon className="w-6 h-6" style={{ color: C.primary }} />
                  </div>
                  <h3 className="font-bold mb-1.5 text-sm" style={{ color: C.secondary }}>{v.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-8" style={{ color: C.secondary }}>
            {lang === 'ar' ? 'فريق القيادة' : 'Leadership Team'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {team.map((member, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100 hover:shadow-lg transition-all">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-base" style={{ backgroundColor: C.primary }}>
                  {member.initials}
                </div>
                <h4 className="font-bold text-sm mb-0.5" style={{ color: C.secondary }}>{member.name}</h4>
                <p className="text-gray-400 text-xs">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════ */
/*            CONTACT PAGE                   */
/* ════════════════════════════════════════ */
function ContactPage({ t, lang, onToast }: {
  t: Translations; lang: Language
  onToast: (v: { message: string; type: 'success' | 'error' }) => void
}) {
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
    { icon: Phone, label: t.contact.hotline, value: '19282', href: 'tel:19282', extra: '' },
    { icon: MessageCircle, label: 'WhatsApp', value: '01001928200', href: 'https://wa.me/201001928200', extra: '' },
    { icon: Mail, label: t.contact.hotline === 'الخط الساخن' ? 'البريد الإلكتروني' : 'Email', value: 'support@shiphny.com', href: 'mailto:support@shiphny.com', extra: '' },
    { icon: MapPin, label: t.contact.address, value: lang === 'ar' ? '١٢٣ شارع التحرير، القاهرة' : '123 Tahrir St, Cairo, Egypt', href: '#', extra: '' },
    { icon: Clock, label: t.contact.workHours, value: '24/7', href: '#', extra: '' },
  ]

  return (
    <div className="pt-20 sm:pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.secondary }}>{t.contact.title}</h1>
          <p className="text-gray-500 text-sm sm:text-base">{t.contact.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 border border-gray-100">
              <h3 className="font-bold text-base sm:text-lg mb-5" style={{ color: C.secondary }}>{t.contact.infoTitle}</h3>
              <div className="space-y-4">
                {contactItems.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                      className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.primaryLight }}>
                        <Icon className="w-5 h-5" style={{ color: C.primary }} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <p className="font-semibold text-sm group-hover:underline" style={{ color: C.secondary }}>{item.value}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 h-40 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-1" style={{ color: C.primary }} />
                <p className="text-xs text-gray-500">{lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-5 sm:p-8 border border-gray-100">
            <h3 className="font-bold text-base sm:text-lg mb-6" style={{ color: C.secondary }}>{t.contact.formTitle}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t.contact.form.name} *</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder={t.contact.form.name} required
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${isRtl ? 'text-right' : 'text-left'}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t.contact.form.phone} *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder={t.contact.form.phone} required
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${isRtl ? 'text-right' : 'text-left'}`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t.contact.form.email}</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder={t.contact.form.email}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t.contact.form.message} *</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder={t.contact.form.message} rows={5} required
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none ${isRtl ? 'text-right' : 'text-left'}`} />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60"
                style={{ backgroundColor: C.primary }}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {submitting ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : t.contact.form.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════ */
/*            SUPPORT PAGE                   */
/* ════════════════════════════════════════ */
function SupportPage({ t, apiStatus }: { t: Translations; apiStatus: 'checking' | 'online' | 'offline' }) {
  return (
    <div className="pt-20 sm:pt-24 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.primaryLight }}>
            <Headphones className="w-8 h-8" style={{ color: C.primary }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: C.secondary }}>{t.support.title}</h1>
          <p className="text-gray-500 text-sm sm:text-base">{t.support.subtitle}</p>
        </div>
        <ChatWidget apiStatus={apiStatus} />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <a href="tel:19282" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.primaryLight }}>
              <Phone className="w-5 h-5" style={{ color: C.primary }} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t.tracking.hotline}</p>
              <p className="font-bold text-sm" style={{ color: C.secondary }}>19282</p>
            </div>
          </a>
          <a href="https://wa.me/201001928200" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">WhatsApp</p>
              <p className="font-bold text-sm" style={{ color: C.secondary }}>01001928200</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════ */
/*               FOOTER                      */
/* ════════════════════════════════════════ */
function Footer({ t, lang, onNavigate }: { t: Translations; lang: Language; onNavigate: (p: Page) => void }) {
  const isRtl = lang === 'ar'
  const socialLinks = [
    { icon: Globe, href: '#', label: 'Facebook' },
    { icon: Globe, href: '#', label: 'Instagram' },
    { icon: Globe, href: '#', label: 'Twitter' },
    { icon: Globe, href: '#', label: 'LinkedIn' },
  ]

  return (
    <footer style={{ backgroundColor: C.secondary }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: C.primary }}>
                <ShiphnyLogo size={40} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white leading-tight">{t.brand.name}</h3>
                <p className="text-xs text-gray-400 leading-tight">{t.brand.subtitle}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">{t.footer.description}</p>
            <div className="flex gap-2">
              {socialLinks.map((s, i) => {
                const Icon = s.icon
                return (
                  <a key={i} href={s.href} aria-label={s.label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-gray-300 hover:text-white">
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">{t.footer.quickLinks}</h4>
            <ul className="space-y-2.5">
              {[
                { id: 'home', label: t.nav.home },
                { id: 'tracking', label: t.nav.tracking },
                { id: 'services', label: t.nav.services },
                { id: 'about', label: t.nav.about },
                { id: 'contact', label: t.nav.contact },
              ].map(item => (
                <li key={item.id}>
                  <button onClick={() => onNavigate(item.id as Page)}
                    className="text-gray-400 hover:text-white text-sm transition-colors hover:underline">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">{t.footer.ourServices}</h4>
            <ul className="space-y-2.5">
              {t.services.items.map((s, i) => (
                <li key={i}>
                  <button onClick={() => onNavigate('services')}
                    className="text-gray-400 hover:text-white text-sm transition-colors hover:underline">
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm">{t.footer.contactUs}</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:19282" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0" /><span>19282</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/201001928200" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" /><span>01001928200</span>
                </a>
              </li>
              <li>
                <a href="mailto:support@shiphny.com" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0" /><span>support@shiphny.com</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4 flex-shrink-0" /><span>24/7</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" /><span>{lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">{t.footer.copyright}</p>
          <p className="text-gray-500 text-xs">
            {lang === 'ar' ? 'مرخصة من الهيئة العامة للبريد المصري' : 'Licensed by Egypt Post Authority'}
          </p>
        </div>
      </div>
    </footer>
  )
}
