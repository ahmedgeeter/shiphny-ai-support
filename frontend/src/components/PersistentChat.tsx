import React, { useState, useRef, useEffect } from 'react'
import { Send, User, Headphones, Loader2, AlertCircle, X, MessageCircle, Minimize2, Maximize2 } from 'lucide-react'
import { translations, Language } from '../translations'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface PersistentChatProps {
  apiStatus: 'checking' | 'online' | 'offline'
  lang: Language
}

const STORAGE_KEY = 'shiphny_chat_history'
const SESSION_KEY = 'shiphny_chat_session'

export function PersistentChat({ apiStatus, lang }: PersistentChatProps) {
  const t = translations[lang].chat
  const isRtl = lang === 'ar'

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        } catch (e) { console.error('Failed to parse chat history:', e) }
      }
    }
    return [{ id: 'welcome', role: 'assistant', content: t.welcomeMessage, timestamp: new Date() }]
  })

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem(SESSION_KEY)
    return null
  })
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [escalated, setEscalated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (sessionId && typeof window !== 'undefined') localStorage.setItem(SESSION_KEY, sessionId)
  }, [sessionId])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [messages, isOpen, isMinimized])

  useEffect(() => {
    if (isOpen && !isMinimized && !isLoading) inputRef.current?.focus()
  }, [isOpen, isMinimized, isLoading])

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          customer_id: 1,
          session_id: sessionId,
          language: lang
        })
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      if (data.session_id) setSessionId(data.session_id)
      if (data.escalated) setEscalated(true)

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }])
      if (!isOpen || isMinimized) setUnreadCount(prev => prev + 1)
    } catch (err) {
      console.error('Chat error:', err)
      setError(t.serverOffline)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = () => { setIsOpen(true); setIsMinimized(false); setUnreadCount(0) }
  const handleMinimize = () => setIsMinimized(prev => !prev)
  const handleClose = () => { setIsOpen(false); setIsMinimized(false) }

  const clearHistory = () => {
    const msg = lang === 'ar' ? 'هل أنت متأكد من مسح سجل المحادثة؟' : 'Clear chat history?'
    if (confirm(msg)) {
      setMessages([{ id: 'welcome', role: 'assistant', content: t.welcomeMessage, timestamp: new Date() }])
      setSessionId(null)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(SESSION_KEY)
    }
  }

  const isOffline = apiStatus === 'offline'

  /* ── CLOSED STATE: floating button ── */
  if (!isOpen) {
    return (
      <>
        {/* Floating button */}
        <button onClick={handleOpen}
          className="fixed bottom-5 left-5 z-50 group"
          aria-label={isRtl ? 'فتح المحادثة' : 'Open chat'}>
          <div className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
               style={{ backgroundColor: '#E0442E' }}>
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Help pill - hidden on mobile to avoid clutter */}
        <div className="fixed bottom-5 right-5 z-40 hidden sm:flex items-center gap-2 bg-white rounded-full shadow-lg px-3 py-2 border border-gray-100">
          <span className="text-xs text-gray-600">{isRtl ? 'تحتاج مساعدة؟' : 'Need help?'}</span>
          <button onClick={handleOpen}
            className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
            style={{ backgroundColor: '#E0442E' }}>
            {isRtl ? 'اسأل سارة' : 'Ask Sara'}
          </button>
        </div>
      </>
    )
  }

  /* ── OPEN STATE: fixed-size chat window ── */
  return (
    <div
      className="fixed z-50"
      style={{
        bottom: '1.25rem',
        left: '1.25rem',
        width: 'min(360px, calc(100vw - 2.5rem))',
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300"
        style={{ height: isMinimized ? '56px' : 'min(500px, calc(100vh - 7rem))' }}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-3 py-2.5 flex items-center justify-between"
          style={{ backgroundColor: '#E0442E' }}
          onClick={isMinimized ? handleMinimize : undefined}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">{t.title}</p>
              <p className="text-white/80 text-xs flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${isOffline ? 'bg-red-300' : 'bg-green-400 animate-pulse'}`} />
                {isOffline ? t.offline : t.online}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {!isMinimized && (
              <button onClick={e => { e.stopPropagation(); clearHistory() }}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title={t.clearChat}>
                <AlertCircle className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); handleMinimize() }}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={e => { e.stopPropagation(); handleClose() }}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Body (only when not minimized) ── */}
        {!isMinimized && (
          <>
            {/* Escalation banner */}
            {escalated && (
              <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 bg-amber-50 border-b border-amber-200">
                <span className="text-amber-600 text-sm">🔴</span>
                <p className="text-xs text-amber-700 font-medium">
                  {isRtl
                    ? 'تم تحويل محادثتك لمشرف متخصص — سيتواصل معك خلال دقائق على الرقم المسجل.'
                    : 'Your chat has been escalated to a specialist — they will contact you shortly.'}
                </p>
              </div>
            )}

            {/* Messages scroll area - flex-1 so it fills remaining space */}
            <div
              className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gray-50"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {messages.map(msg => (
                <div key={msg.id}
                  className={`flex gap-2 items-end ${
                    msg.role === 'user'
                      ? (isRtl ? 'flex-row' : 'flex-row-reverse')
                      : (isRtl ? 'flex-row-reverse' : 'flex-row')
                  }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-200' : 'bg-red-100'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-3.5 h-3.5 text-gray-600" />
                      : <Headphones className="w-3.5 h-3.5 text-red-600" />}
                  </div>
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gray-800 text-white rounded-bl-none'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-br-none'
                  } ${isRtl ? 'text-right' : 'text-left'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs mt-0.5 block opacity-60">
                      {msg.timestamp.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                    <Headphones className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <div className="bg-white px-3 py-2 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-600 rounded-xl text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            <div className="flex-shrink-0 px-2.5 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-hide">
              {t.suggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s.query)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700 text-xs rounded-full whitespace-nowrap border border-gray-200 hover:border-red-200 transition-all flex-shrink-0">
                  {s.text}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 p-2.5 bg-white border-t border-gray-200">
              {isOffline ? (
                <p className="text-center text-xs text-gray-500 py-1.5">{t.serverOffline}</p>
              ) : (
                <form onSubmit={handleSubmit} className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    className={`flex-1 min-w-0 px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${isRtl ? 'text-right' : 'text-left'}`}
                  />
                  <button type="submit" disabled={!input.trim() || isLoading}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-white rounded-xl disabled:opacity-40 transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: '#E0442E' }}>
                    <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
