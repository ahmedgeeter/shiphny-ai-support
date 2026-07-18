import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Wallet, Package, AlertCircle, Edit2, ShieldBan, ShieldCheck, X } from 'lucide-react'
import { Translations, Language } from '../translations'
import { API_BASE, C } from '../utils/constants'

interface AdminDashboardProps {
  t: Translations
  lang: Language
}

interface CustomerData {
  id: number
  email: string
  full_name: string
  role: string
  wallet_balance: number
  total_orders: number
  total_spent_egp: number
  tier: string
  is_active: boolean
}

interface ShipmentData {
  id: number
  tracking_number: string
  status: string
  destination: string
  estimated_delivery: string | null
}

export function AdminDashboard({ t, lang }: AdminDashboardProps) {
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null)
  const [showShipmentsModal, setShowShipmentsModal] = useState(false)
  const [customerShipments, setCustomerShipments] = useState<ShipmentData[]>([])
  const [loadingShipments, setLoadingShipments] = useState(false)
  
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [newBalance, setNewBalance] = useState('')

  const isRtl = lang === 'ar'

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/admin/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch customers or unauthorized')
      const data = await res.json()
      setCustomers(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleToggleStatus = async (customer: CustomerData) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/admin/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !customer.is_active })
      })
      if (!res.ok) throw new Error('Failed to update status')
      fetchCustomers()
    } catch (err) {
      alert('Error updating customer status')
    }
  }

  const handleUpdateBalance = async () => {
    if (!selectedCustomer) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/admin/customers/${selectedCustomer.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ wallet_balance: parseFloat(newBalance) })
      })
      if (!res.ok) throw new Error('Failed to update balance')
      setShowBalanceModal(false)
      fetchCustomers()
    } catch (err) {
      alert('Error updating customer balance')
    }
  }

  const openShipments = async (customer: CustomerData) => {
    setSelectedCustomer(customer)
    setShowShipmentsModal(true)
    setLoadingShipments(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/admin/customers/${customer.id}/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch shipments')
      const data = await res.json()
      setCustomerShipments(data)
    } catch (err) {
      alert('Error fetching shipments')
    } finally {
      setLoadingShipments(false)
    }
  }

  const updateShipmentStatus = async (shipmentId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/api/admin/shipments/${shipmentId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update shipment')
      
      // Update local state
      setCustomerShipments(prev => prev.map(s => s.id === shipmentId ? { ...s, status: newStatus } : s))
    } catch (err) {
      alert('Error updating shipment status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
        </div>
      </div>
    )
  }

  const totalBalance = customers.reduce((acc, c) => acc + c.wallet_balance, 0)
  const totalOrders = customers.reduce((acc, c) => acc + c.total_orders, 0)

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {lang === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-500">
            {lang === 'ar' ? 'إدارة النظام والعملاء بالكامل.' : 'Manage the entire system and customers.'}
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-[100px] -z-0" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-gray-500 font-medium mb-2">{lang === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{customers.length}</h3>
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-[100px] -z-0" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6 text-green-500">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-gray-500 font-medium mb-2">{lang === 'ar' ? 'أرصدة العملاء' : 'Total Balances'}</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{totalBalance.toFixed(2)}</h3>
            </div>
          </motion.div>

          <motion.div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-[100px] -z-0" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-500">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-gray-500 font-medium mb-2">{lang === 'ar' ? 'الطلبات في النظام' : 'System Orders'}</p>
              <h3 className="text-4xl font-extrabold text-gray-900">{totalOrders}</h3>
            </div>
          </motion.div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{lang === 'ar' ? 'قائمة العملاء' : 'Customers List'}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right" dir={isRtl ? 'rtl' : 'ltr'}>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">{lang === 'ar' ? 'الباقة' : 'Tier'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">{lang === 'ar' ? 'الطلبات' : 'Orders'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">{lang === 'ar' ? 'الرصيد' : 'Balance'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-500 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{c.full_name} <span className="text-xs text-gray-400 font-normal">({c.role})</span></div>
                      <div className="text-sm text-gray-500">{c.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${c.tier === 'platinum' ? 'bg-purple-100 text-purple-700' : c.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' : c.tier === 'silver' ? 'bg-gray-200 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                        {c.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{c.total_orders}</div>
                      <div className="text-xs text-gray-500">{c.total_spent_egp} EGP</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{c.wallet_balance} EGP</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.is_active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'موقوف' : 'Suspended')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setSelectedCustomer(c); setNewBalance(c.wallet_balance.toString()); setShowBalanceModal(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors tooltip"
                          title="Edit Balance"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openShipments(c)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors tooltip"
                          title="View Shipments"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(c)}
                          className={`p-2 rounded-xl transition-colors tooltip ${c.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={c.is_active ? "Suspend User" : "Activate User"}
                        >
                          {c.is_active ? <ShieldBan className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Balance Edit Modal */}
      <AnimatePresence>
        {showBalanceModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{lang === 'ar' ? 'تعديل الرصيد' : 'Edit Balance'}</h3>
                <button onClick={() => setShowBalanceModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-gray-500 mb-4">{selectedCustomer.full_name}</p>
              <input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500 outline-none" />
              <button onClick={handleUpdateBalance} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                {lang === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shipments Modal */}
      <AnimatePresence>
        {showShipmentsModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] p-6 w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{lang === 'ar' ? 'شحنات العميل' : 'Customer Shipments'} - {selectedCustomer.full_name}</h3>
                <button onClick={() => setShowShipmentsModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                {loadingShipments ? (
                  <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div></div>
                ) : customerShipments.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">{lang === 'ar' ? 'لا يوجد شحنات' : 'No shipments found'}</div>
                ) : (
                  <div className="space-y-4">
                    {customerShipments.map(s => (
                      <div key={s.id} className="p-4 border border-gray-100 bg-gray-50 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 items-center">
                        <div>
                          <p className="font-mono font-bold text-gray-900">{s.tracking_number}</p>
                          <p className="text-sm text-gray-500">{s.destination}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select 
                            value={s.status} 
                            onChange={(e) => updateShipmentStatus(s.id, e.target.value)}
                            className="bg-white border border-gray-200 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In_Transit">In_Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Canceled">Canceled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
