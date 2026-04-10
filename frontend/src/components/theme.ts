// Professional logistics company theme
export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#2563eb', // Main brand color
      600: '#1d4ed8',
      700: '#1e40af',
      800: '#1e3a8a',
      900: '#172554',
    },
    secondary: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308', // Accent color
      600: '#ca8a04',
    },
    accent: '#f97316', // Orange for CTAs
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  fonts: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    arabic: 'Noto Sans Arabic, Inter, sans-serif',
  },
} as const;

// Company info
export const company = {
  name: 'FastShip Egypt',
  arabicName: 'فاست شيب مصر',
  tagline: 'خدمة توصيل سريعة وموثوقة لجميع أنحاء الجمهورية',
  founded: 2019,
  employees: '500+',
  customers: '50,000+',
  deliveries: '1M+',
  coverage: '27 محافظة',
};
