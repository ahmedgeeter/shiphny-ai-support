export const C = {
  primary: '#E0442E',
  primaryDark: '#C73A28',
  primaryLight: '#FEF2F0',
  secondary: '#2D3E50',
  accent: '#F59E0B',
  success: '#10B981',
}

export type Page = 'home' | 'tracking' | 'services' | 'about' | 'contact' | 'support' | 'dashboard' | 'admin'
export type Language = 'ar' | 'en'
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
