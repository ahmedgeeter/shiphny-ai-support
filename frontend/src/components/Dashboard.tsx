import { API_BASE } from '../api'
import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, Users, Clock, TrendingUp, 
  CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react'

interface DashboardStats {
  total_conversations: number
  total_customers: number
  avg_response_time_ms: number
  ai_confidence_avg: number
  resolved_count: number
  escalated_count: number
}

interface IntentData {
  intent: string
  count: number
  percentage: number
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [intents, setIntents] = useState<IntentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsRes = await fetch(`${API_BASE}/api/analytics/dashboard`)
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      // Fetch intents
      const intentsRes = await fetch(`${API_BASE}/api/analytics/intents`)
      if (intentsRes.ok) {
        const intentsData = await intentsRes.json()
        setIntents(intentsData)
      }
    } catch (err) {
      setError('فشل في تحميل البيانات. تأكد من تشغيل السيرفر.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
        <AlertCircle className="w-6 h-6" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          لوحة التحليلات
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          إحصائيات وتحليلات نظام الدعم
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Conversations */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">إجمالي المحادثات</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats.total_conversations.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats.total_customers.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">متوسط وقت الرد</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats.avg_response_time_ms.toFixed(0)} ms
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

          {/* AI Confidence */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">دقة الذكاء الاصطناعي</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {(stats.ai_confidence_avg * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">تم الحل</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.resolved_count.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Escalated */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">تم الترقية</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {stats.escalated_count.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intent Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          توزيع أنواع الاستفسارات
        </h3>
        
        {intents.length > 0 ? (
          <div className="space-y-3">
            {intents.map((intent) => (
              <div key={intent.intent}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {translateIntent(intent.intent)}
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {intent.count} ({intent.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${intent.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            لا توجد بيانات متاحة
          </p>
        )}
      </div>
    </div>
  )
}

function translateIntent(intent: string): string {
  const translations: Record<string, string> = {
    'shipping_status': 'حالة الشحن',
    'refund_request': 'طلب استرداد',
    'product_question': 'استفسار عن منتج',
    'complaint': 'شكوى',
    'tech_support': 'دعم فني',
    'general': 'عام',
    'order_inquiry': 'استفسار عن طلب',
    'feedback': 'تقييم',
  }
  return translations[intent] || intent
}
