import React from 'react'
import { MessageSquare, BarChart3, Wifi, WifiOff } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
  apiStatus: 'checking' | 'online' | 'offline'
  activeTab: 'chat' | 'dashboard'
  onTabChange: (tab: 'chat' | 'dashboard') => void
}

export function Layout({ children, apiStatus, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  SupportBot Pro
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AI Customer Support
                </p>
              </div>
            </div>

            {/* API Status */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                apiStatus === 'online' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : apiStatus === 'checking'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {apiStatus === 'online' ? (
                  <Wifi className="w-4 h-4" />
                ) : apiStatus === 'checking' ? (
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span>
                  {apiStatus === 'online' ? 'Online' : apiStatus === 'checking' ? 'Checking...' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 -mb-px mt-4">
            <button
              onClick={() => onTabChange('chat')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat Demo
            </button>
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            SupportBot Pro v1.0.0 • Powered by Groq AI (Llama 3.1 70B)
          </p>
        </div>
      </footer>
    </div>
  )
}
