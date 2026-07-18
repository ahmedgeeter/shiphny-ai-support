import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Wallet, ShoppingBag, Truck, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react'
import { Translations, Language } from '../translations'
import { API_BASE, C } from '../utils/constants'

interface DashboardPageProps {
  t: Translations
  lang: Language
}

interface UserData {
  id: number
  email: string
  full_name: string
  role: string
}

interface ShipmentData {
  id: number
  tracking_number: string
  status: string
  destination: string
  estimated_delivery: string | null
}

interface DashboardData {
  user: UserData
  balance: number
  total_orders: number
  shipments: ShipmentData[]
}

export function DashboardPage({ t, lang }: DashboardPageProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDestination, setNewDestination] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const isRtl = lang === 'ar'

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError(lang === 'ar' ? 'الرجاء تسجيل الدخول أولاً' : 'Please log in first')
        setLoading(false)
        return
      }
      
      const res = await fetch(`${API_BASE}/api/auth/me/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [lang])

  const handleCreateShipment = async () => {
    if (!newDestination.trim()) return
    setIsCreating(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/auth/me/shipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destination: newDestination })
      })
      if (!res.ok) throw new Error('Failed to create shipment')
      
      setShowCreateModal(false)
      setNewDestination('')
      await fetchData() // Refresh dashboard data to show new shipment
    } catch (err) {
      alert(lang === 'ar' ? 'حدث خطأ أثناء إنشاء الشحنة' : 'Error creating shipment')
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className={`mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 ${isRtl ? 'sm:flex-row-reverse text-right' : 'text-left'}`}>
          <div className="w-full">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {lang === 'ar' ? 'مرحباً،' : 'Welcome,'} {data.user.full_name}
            </h1>
            <p className="text-gray-500">
              {lang === 'ar' ? 'إليك نظرة عامة على حسابك وشحناتك.' : 'Here is an overview of your account and shipments.'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-[100px] -z-0" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-gray-500 font-medium mb-2">{lang === 'ar' ? 'الرصيد الحالي' : 'Current Balance'}</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{data.balance} <span className="text-xl text-gray-400 font-bold">{lang === 'ar' ? 'ج.م' : 'EGP'}</span></h3>
            </div>
          </motion.div>

          {/* Orders Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -z-0" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-gray-500 font-medium mb-2">{lang === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{data.total_orders}</h3>
            </div>
          </motion.div>

          {/* Active Shipments Stat Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-[100px] -z-0" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-500">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-gray-500 font-medium mb-2">{lang === 'ar' ? 'الشحنات النشطة' : 'Active Shipments'}</p>
              <h3 className="text-4xl font-extrabold text-gray-900">
                {data.shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Canceled').length}
              </h3>
            </div>
          </motion.div>
        </div>

        {/* Shipments List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{lang === 'ar' ? 'شحناتي' : 'My Shipments'}</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
            >
              {lang === 'ar' ? 'إنشاء شحنة جديدة' : 'Create Shipment'}
            </button>
          </div>

          {data.shipments.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{lang === 'ar' ? 'لا توجد شحنات' : 'No shipments found'}</h3>
              <p className="text-gray-500 mb-6">
                {lang === 'ar' ? 'لم تقم بإنشاء أي شحنات حتى الآن.' : 'You haven\'t created any shipments yet.'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-colors"
              >
                {lang === 'ar' ? 'إنشاء أول شحنة' : 'Create First Shipment'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {data.shipments.map((shipment) => (
                  <div key={shipment.id} className="p-6 sm:p-8 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium mb-1">
                            {lang === 'ar' ? 'رقم التتبع' : 'Tracking Number'}
                          </p>
                          <p className="text-lg font-bold text-gray-900 font-mono tracking-wider">{shipment.tracking_number}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 w-full sm:w-auto">
                        <div>
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">{lang === 'ar' ? 'الوجهة' : 'Destination'}</span>
                          </div>
                          <p className="font-semibold text-gray-900">{shipment.destination}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">{lang === 'ar' ? 'موعد التوصيل' : 'Est. Delivery'}</span>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : (lang === 'ar' ? 'غير محدد' : 'TBD')}
                          </p>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold w-full sm:w-auto text-center ${
                            shipment.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                            shipment.status === 'In_Transit' ? 'bg-blue-50 text-blue-600' :
                            shipment.status === 'Canceled' ? 'bg-gray-100 text-gray-600' :
                            'bg-yellow-50 text-yellow-600'
                          }`}>
                            {shipment.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={isRtl ? 'rtl' : 'ltr'}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {lang === 'ar' ? 'إنشاء شحنة جديدة' : 'Create New Shipment'}
            </h3>
            <p className="text-gray-500 mb-6">
              {lang === 'ar' ? 'سيتم خصم 150 ج.م من رصيدك.' : '150 EGP will be deducted from your balance.'}
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {lang === 'ar' ? 'الوجهة (العنوان)' : 'Destination (Address)'}
                </label>
                <input 
                  type="text" 
                  value={newDestination} 
                  onChange={e => setNewDestination(e.target.value)} 
                  placeholder={lang === 'ar' ? 'مثال: القاهرة، مدينة نصر' : 'e.g. Cairo, Nasr City'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                disabled={isCreating}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button 
                onClick={handleCreateShipment} 
                className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={isCreating || !newDestination.trim()}
              >
                {isCreating ? (lang === 'ar' ? 'جاري الإنشاء...' : 'Creating...') : (lang === 'ar' ? 'تأكيد وإنشاء' : 'Confirm & Create')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}
