import { API_BASE } from '../api'
import React, { useState, useRef, useEffect } from 'react'
import { Send, User, Headphones, Loader2, AlertCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWidgetProps {
  apiStatus: 'checking' | 'online' | 'offline'
}

export function ChatWidget({ apiStatus }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'مرحباً! 👋 أنا سارة، مساعدتك الذكية في شحني.\n\nكيف يمكنني مساعدتك؟',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || apiStatus !== 'online') return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          customer_id: 1,
          session_id: sessionId,
          language: 'ar'
        })
      })

      if (!response.ok) throw new Error('Failed to get response')
      const data = await response.json()
      if (data.session_id) setSessionId(data.session_id)

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }])
    } catch {
      setError('عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsLoading(false)
    }
  }

  const isOffline = apiStatus === 'offline'

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col" style={{ height: 'min(580px, calc(100vh - 12rem))' }}>
        {/* Header */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4" style={{ backgroundColor: '#E0442E' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">سارة - مساعدة العملاء</h2>
              <p className="text-white/80 text-xs sm:text-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-300' : 'bg-green-400 animate-pulse'}`} />
                {isOffline ? 'غير متصل' : 'متصل الآن · دعم 24/7'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50" dir="rtl">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2 items-end ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-red-100'}`}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-gray-600" />
                  : <Headphones className="w-4 h-4 text-red-600" />}
              </div>
              <div className={`max-w-[80%] px-3 py-2.5 rounded-2xl text-sm text-right ${
                msg.role === 'user'
                  ? 'bg-gray-800 text-white rounded-bl-none'
                  : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-br-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <span className="text-xs mt-0.5 block opacity-50">
                  {msg.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-red-600" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick topics */}
        <div className="flex-shrink-0 px-3 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
          {[
            { text: '📦 تتبع شحنة', q: 'كيف أتابع شحنتي؟' },
            { text: '💰 الأسعار', q: 'كم سعر الشحن؟' },
            { text: '🗺️ التغطية', q: 'هل توصلون لأسوان؟' },
            { text: '🔄 الإرجاع', q: 'كيف أرجع شحنة؟' },
          ].map((item, i) => (
            <button key={i} onClick={() => setInput(item.q)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 text-xs rounded-full whitespace-nowrap border border-gray-200 hover:border-red-200 transition-all flex-shrink-0">
              {item.text}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-white border-t border-gray-200">
          {isOffline ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm py-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>السيرفر غير متصل. يرجى تشغيل Backend أولاً.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 flex-row-reverse">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button type="submit" disabled={!input.trim() || isLoading}
                className="flex-shrink-0 px-3 sm:px-5 py-2.5 text-white rounded-xl font-medium disabled:opacity-40 transition-all flex items-center gap-2 hover:opacity-90 active:scale-95"
                style={{ backgroundColor: '#E0442E' }}>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">إرسال</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
