const envUrl = import.meta.env.VITE_API_URL
export const API_BASE = (envUrl && envUrl !== 'undefined' ? envUrl : 'https://shiphny-ai-support.onrender.com').replace(/\/+$/, '')
