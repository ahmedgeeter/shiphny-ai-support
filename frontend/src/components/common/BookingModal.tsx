import React, { useState } from 'react'
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Language } from '../../translations'
import { C, API_BASE } from '../../utils/constants'
import { VALIDATORS } from '../../utils/validators'
import { motion, AnimatePresence } from 'framer-motion'

interface FormFields {
  name: string
  phone: string
  email: string
  pickup: string
  delivery: string
  weight: string
  notes: string
}

type FieldErrors = Partial<Record<keyof FormFields, string>>

interface BookingModalProps {
  service: string
  lang: Language
  onClose: () => void
}

export function BookingModal({ service, lang, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormFields>({ name: '', phone: '', email: '', pickup: '', delivery: '', weight: '', notes: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormFields, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [doneRef, setDoneRef] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const isRtl = lang === 'ar'

  const L = {
    ar: {
      title: 'حجز شحنة جديدة', step1: 'بيانات المرسل', step2: 'تفاصيل الشحنة',
      name: 'الاسم الكامل *', phone: 'رقم الهاتف *', email: 'البريد الإلكتروني',
      pickup: 'عنوان الاستلام *', delivery: 'عنوان التوصيل *',
      weight: 'الوزن التقريبي (كجم)', notes: 'ملاحظات إضافية',
      phoneTip: 'مثال: 01012345678', emailTip: 'مثال: ahmed@gmail.com',
      pickupTip: 'مثال: ٢٥ شارع التحرير، وسط البلد، القاهرة',
      deliveryTip: 'مثال: ٥ شارع النصر، المعادي، القاهرة',
      next: 'التالي ←', back: '→ رجوع', confirm: 'تأكيد الحجز',
      successTitle: 'تم تسجيل حجزك بنجاح! 🎉',
      successBody: 'سيتواصل معك فريقنا خلال 30 دقيقة لتأكيد الحجز.',
      refLabel: 'رقم الحجز',
      aiTip: '💡 يمكنك سؤال سارة الذكاء الاصطناعي عن حجزك برقم المرجع أعلاه',
      close: 'إغلاق', service: 'الخدمة المختارة',
    },
    en: {
      title: 'New Shipment Booking', step1: 'Sender Details', step2: 'Shipment Details',
      name: 'Full Name *', phone: 'Phone Number *', email: 'Email Address',
      pickup: 'Pickup Address *', delivery: 'Delivery Address *',
      weight: 'Estimated Weight (kg)', notes: 'Additional Notes',
      phoneTip: 'e.g. 01012345678', emailTip: 'e.g. ahmed@gmail.com',
      pickupTip: 'e.g. 25 Tahrir Street, Downtown, Cairo',
      deliveryTip: 'e.g. 5 Al-Nasr Street, Maadi, Cairo',
      next: 'Next →', back: '← Back', confirm: 'Confirm Booking',
      successTitle: 'Booking Confirmed! 🎉',
      successBody: 'Our team will contact you within 30 minutes to confirm your booking.',
      refLabel: 'Booking Reference',
      aiTip: '💡 You can ask Sara AI about your booking using the reference number above',
      close: 'Close', service: 'Selected Service',
    },
  }
  const l = L[lang]

  const validateField = (field: keyof FormFields, value: string): string | undefined => {
    const v = VALIDATORS[field as keyof typeof VALIDATORS]
    if (!v) return undefined
    const err = v(value)
    return err ? err[lang] : undefined
  }

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
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name:      form.name.trim(),
          sender_phone:     form.phone.trim(),
          sender_email:     form.email.trim() || null,
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
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-white/20"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between shrink-0" style={{ backgroundColor: C.primary }}>
            <div>
              <h3 className="text-white font-extrabold text-xl mb-0.5">{l.title}</h3>
              <p className="text-white/80 text-sm font-medium">{l.service}: {service}</p>
            </div>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-2 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6 sm:p-8">
            {doneRef ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 bg-emerald-50 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h4 className="font-extrabold text-2xl mb-2" style={{ color: C.secondary }}>{l.successTitle}</h4>
                <p className="text-gray-500 mb-8">{l.successBody}</p>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-6">
                  <p className="text-sm text-gray-600 mb-2 font-medium">{l.refLabel}</p>
                  <p className="font-mono font-extrabold text-3xl tracking-wider" style={{ color: C.primary }}>{doneRef}</p>
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100 font-medium">
                  {l.aiTip}
                </p>
                <button onClick={onClose} className="w-full py-4 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all" style={{ backgroundColor: C.primary }}>
                  {l.close}
                </button>
              </motion.div>
            ) : (
              <div>
                {/* Stepper */}
                <div className="flex items-center gap-3 mb-8">
                  {[1, 2].map(n => (
                    <React.Fragment key={n}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${step >= n ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                        {step > n ? <CheckCircle2 className="w-5 h-5" /> : n}
                      </div>
                      <div className={`text-sm font-bold ${step >= n ? 'text-red-500' : 'text-gray-400'}`}>
                        {n === 1 ? l.step1 : l.step2}
                      </div>
                      {n < 2 && <div className={`flex-1 h-1.5 rounded-full ${step > n ? 'bg-red-500' : 'bg-gray-100'}`} />}
                    </React.Fragment>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={step === 1 ? handleNext : handleSubmit}>
                  <div className="space-y-4">
                    {step === 1 && (
                      <motion.div initial={{ opacity: 0, x: isRtl ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                        <BookingField id="name" label={l.name} tip={lang === 'ar' ? 'مثال: أحمد محمد علي' : 'e.g. Ahmed Mohamed'}
                          value={form.name} onChange={(v: string) => handleChange('name', v)} onBlur={() => handleBlur('name')} error={errors.name}
                          isRtl={isRtl} touched={touched} lang={lang} />
                        <BookingField id="phone" label={l.phone} tip={l.phoneTip} type="tel"
                          value={form.phone} onChange={(v: string) => handleChange('phone', v)} onBlur={() => handleBlur('phone')} error={errors.phone}
                          isRtl={isRtl} touched={touched} lang={lang} />
                        <BookingField id="email" label={l.email} tip={l.emailTip} type="email" optional
                          value={form.email} onChange={(v: string) => handleChange('email', v)} onBlur={() => handleBlur('email')} error={errors.email}
                          isRtl={isRtl} touched={touched} lang={lang} />
                      </motion.div>
                    )}
                    {step === 2 && (
                      <motion.div initial={{ opacity: 0, x: isRtl ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                        <BookingField id="pickup" label={l.pickup} tip={l.pickupTip}
                          value={form.pickup} onChange={(v: string) => handleChange('pickup', v)} onBlur={() => handleBlur('pickup')} error={errors.pickup}
                          isRtl={isRtl} touched={touched} lang={lang} />
                        <BookingField id="delivery" label={l.delivery} tip={l.deliveryTip}
                          value={form.delivery} onChange={(v: string) => handleChange('delivery', v)} onBlur={() => handleBlur('delivery')} error={errors.delivery}
                          isRtl={isRtl} touched={touched} lang={lang} />
                        <BookingField id="weight" label={l.weight} tip={lang === 'ar' ? 'مثال: 2.5' : 'e.g. 2.5'} type="number"
                          value={form.weight} onChange={(v: string) => handleChange('weight', v)} onBlur={() => handleBlur('weight')} error={errors.weight}
                          isRtl={isRtl} touched={touched} lang={lang} />
                        <BookingField id="notes" label={l.notes} tip={lang === 'ar' ? 'أي تعليمات خاصة للمندوب...' : 'Any special instructions...'} rows={2}
                          value={form.notes} onChange={(v: string) => handleChange('notes', v)} onBlur={() => handleBlur('notes')} error={errors.notes}
                          isRtl={isRtl} touched={touched} lang={lang} />
                      </motion.div>
                    )}
                  </div>

                  {apiError && (
                    <div className="mt-6 flex items-start gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  <div className="flex gap-4 mt-8">
                    {step === 2 && (
                      <button type="button" onClick={() => setStep(1)} 
                        className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all text-sm">
                        {l.back}
                      </button>
                    )}
                    <button type="submit" disabled={submitting} 
                      className={`py-4 rounded-xl font-bold text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 text-sm ${step === 1 ? 'w-full' : 'flex-[2]'}`}
                      style={{ backgroundColor: submitting ? '#ccc' : C.primary }}>
                      {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                      {step === 1 ? l.next : (submitting ? (lang === 'ar' ? 'جاري الحجز...' : 'Booking...') : l.confirm)}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function BookingField({ id, label, tip, type = 'text', value, onChange, onBlur, error, isRtl, touched, optional, rows }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="block text-sm font-bold text-gray-700">{label}</label>
        {optional && <span className="text-xs text-gray-400 font-medium">{isRtl ? 'اختياري' : 'Optional'}</span>}
      </div>
      {rows ? (
        <textarea id={id} rows={rows} value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
          placeholder={tip}
          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all resize-none ${error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-300'} ${isRtl ? 'text-right' : 'text-left'}`}
        />
      ) : (
        <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur}
          placeholder={tip}
          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all ${error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-gray-300'} ${isRtl ? 'text-right' : 'text-left'}`}
        />
      )}
      <AnimatePresence>
        {error && touched[id] && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
