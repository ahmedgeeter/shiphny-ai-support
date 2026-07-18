import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User } from 'lucide-react'
import { Translations, Language } from '../../translations'
import { C, API_BASE } from '../../utils/constants'

interface AuthPanelProps {
  isOpen: boolean
  onClose: () => void
  t: Translations
  lang: Language
  onToast: (toast: { message: string; type: 'success' | 'error' }) => void
  onLoginSuccess?: (role: string) => void
}

export function AuthPanel({ isOpen, onClose, t, lang, onToast, onLoginSuccess }: AuthPanelProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isRtl = lang === 'ar'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (isLogin) {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password: password })
        })
        
        if (res.ok) {
          const data = await res.json()
          localStorage.setItem('token', data.access_token)
          
          // Fetch user info to get role
          const meRes = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
          })
          let role = 'customer'
          if (meRes.ok) {
            const meData = await meRes.json()
            role = meData.role
          }

          onToast({ message: lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!', type: 'success' })
          onClose()
          if (onLoginSuccess) onLoginSuccess(role)
        } else {
          throw new Error('Login failed')
        }
      } else {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: fullName, role: 'customer' })
        })
        
        if (res.ok) {
          onToast({ message: lang === 'ar' ? 'تم إنشاء الحساب بنجاح! الرجاء تسجيل الدخول.' : 'Account created successfully! Please log in.', type: 'success' })
          setIsLogin(true)
        } else {
          throw new Error('Registration failed')
        }
      }
    } catch (err) {
      onToast({ message: lang === 'ar' ? 'حدث خطأ. الرجاء المحاولة مرة أخرى.' : 'An error occurred. Please try again.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 ${isRtl ? 'left-0' : 'right-0'} w-full max-w-md bg-white shadow-2xl z-[60] flex flex-col`}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLogin 
                  ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                  : (lang === 'ar' ? 'إنشاء حساب' : 'Create Account')
                }
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-gray-500 mb-8">
                {isLogin 
                  ? (lang === 'ar' ? 'قم بتسجيل الدخول لإدارة شحناتك' : 'Sign in to manage your shipments')
                  : (lang === 'ar' ? 'انضم إلينا للاستفادة من كافة المزايا' : 'Join us to unlock all features')
                }
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`block w-full rounded-xl border-gray-300 bg-gray-50 py-3 ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} text-gray-900 focus:border-red-500 focus:ring-red-500 sm:text-sm`}
                        placeholder={lang === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed'}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full rounded-xl border-gray-300 bg-gray-50 py-3 ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} text-gray-900 focus:border-red-500 focus:ring-red-500 sm:text-sm`}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`block w-full rounded-xl border-gray-300 bg-gray-50 py-3 ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} text-gray-900 focus:border-red-500 focus:ring-red-500 sm:text-sm`}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70"
                  style={{ backgroundColor: C.primary }}
                >
                  {isLoading 
                    ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                    : isLogin 
                      ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                      : (lang === 'ar' ? 'إنشاء حساب' : 'Create Account')
                  }
                </button>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 text-center">
              <p className="text-sm text-gray-600">
                {isLogin 
                  ? (lang === 'ar' ? 'ليس لديك حساب؟ ' : 'Don\'t have an account? ')
                  : (lang === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? ')
                }
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold hover:underline"
                  style={{ color: C.primary }}
                >
                  {isLogin 
                    ? (lang === 'ar' ? 'سجل الآن' : 'Sign up now')
                    : (lang === 'ar' ? 'تسجيل الدخول' : 'Sign in')
                  }
                </button>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
