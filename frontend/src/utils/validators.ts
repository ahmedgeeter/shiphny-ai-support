export const VALIDATORS = {
  name: (v: string) => {
    if (!v.trim()) return { ar: 'الاسم مطلوب', en: 'Name is required' }
    if (v.trim().length < 3) return { ar: 'الاسم يجب أن يكون 3 أحرف على الأقل', en: 'Name must be at least 3 characters' }
    if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(v.trim())) return { ar: 'الاسم يجب أن يحتوي على حروف فقط', en: 'Name must contain letters only' }
    return null
  },
  phone: (v: string) => {
    const digits = v.replace(/\D/g, '')
    if (!digits) return { ar: 'رقم الهاتف مطلوب', en: 'Phone is required' }
    if (digits.length < 10) return { ar: 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل', en: 'Phone must be at least 10 digits' }
    if (digits.length > 13) return { ar: 'رقم الهاتف يجب أن لا يتجاوز 13 رقم', en: 'Phone must not exceed 13 digits' }
    if (!/^(01|002|0020|\+20)/.test(digits.startsWith('0') ? '0' + digits : digits) && digits.length === 11) {}
    return null
  },
  pickup: (v: string) => {
    if (!v.trim()) return { ar: 'عنوان الاستلام مطلوب', en: 'Pickup address is required' }
    if (v.trim().length < 10) return { ar: 'يرجى كتابة عنوان تفصيلي (الشارع، المنطقة، المحافظة)', en: 'Please enter a detailed address (street, area, city)' }
    return null
  },
  delivery: (v: string) => {
    if (!v.trim()) return { ar: 'عنوان التوصيل مطلوب', en: 'Delivery address is required' }
    if (v.trim().length < 10) return { ar: 'يرجى كتابة عنوان تفصيلي (الشارع، المنطقة، المحافظة)', en: 'Please enter a detailed address (street, area, city)' }
    return null
  },
  weight: (v: string) => {
    if (!v) return null // optional
    const n = parseFloat(v)
    if (isNaN(n) || n <= 0) return { ar: 'الوزن يجب أن يكون رقماً موجباً', en: 'Weight must be a positive number' }
    if (n > 1000) return { ar: 'الوزن لا يمكن أن يتجاوز 1000 كجم', en: 'Weight cannot exceed 1000 kg' }
    return null
  },
}
