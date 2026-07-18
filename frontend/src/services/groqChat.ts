/**
 * Direct Groq AI Service — runs entirely in the browser.
 * Falls back to backend if VITE_GROQ_API_KEY is not set.
 *
 * System prompt: Sara, Shiphny customer service agent.
 * General questions → answered immediately (NO verification required).
 * Specific shipment tracking → verification flow.
 */

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined
const GROQ_MODEL = 'llama-3.1-8b-instant'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// ─── Knowledge Base ───────────────────────────────────────────────────────────
const KB = `
=== شحني Express — معلومات الشركة ===
- الخط الساخن: 19282 (24 ساعة)
- واتساب: 01001928200
- الموقع: shiphny.com
- البريد: support@shiphny.com

=== أسعار الشحن (قياسي / سريع) ===
- القاهرة / الجيزة / القليوبية: 35 ج / 45 ج
- الإسكندرية والدلتا (البحيرة، الغربية، المنوفية، الدقهلية، الشرقية، دمياط): 40 ج / 55 ج
- القناة (بورسعيد، الإسماعيلية، السويس): 40 ج / 55 ج
- الصعيد (الفيوم، بني سويف، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان): 50 ج / 70 ج
- المحافظات الحدودية (مطروح، البحر الأحمر، سيناء، الوادي الجديد): 60 ج / 85 ج
- شحن مجاني فوق 500 ج (القاهرة الكبرى فقط)
- أسعار الشركات تبدأ من 25 ج/شحنة

=== أوقات التوصيل ===
- القاهرة الكبرى: نفس اليوم (قبل 12 ظهراً) أو اليوم التالي
- الإسكندرية والدلتا: 1-2 يوم عمل
- الصعيد: 2-3 أيام عمل
- المحافظات الحدودية: 3-5 أيام عمل
- لا يوجد توصيل يوم الجمعة

=== التغطية ===
نغطي جميع محافظات مصر الـ 27.

=== التتبع ===
- رقم التتبع يبدأ بـ SH- متبوع بـ 8 أرقام
- تتبع عبر: shiphny.com/track أو الخط الساخن 19282

=== سياسة الإرجاع ===
- خلال 14 يوم من تاريخ الاستلام
- استرداد المبلغ خلال 3-5 أيام عمل
- إرجاع مجاني لعيب المصنع
- رسوم 15 ج لرفض الاستلام بدون سبب

=== طرق الدفع ===
كاش عند الاستلام، فودافون كاش، تحويل بنكي، فيزا/ماستركارد، فوري.

=== التأمين ===
- مجاني حتى 2,000 ج
- ممتد حتى 50,000 ج (1% من قيمة الشحنة)

=== حلول الشركات ===
خصومات حتى 40%، مدير حساب مخصص، ربط API، أسعار من 25 ج/شحنة.
`

function buildSystemPrompt(lang: 'ar' | 'en'): string {
  if (lang === 'ar') {
    return `أنت سارة، موظفة خدمة عملاء محترفة في شركة شحني للشحن في مصر.

قواعد الرد:
- ردودك قصيرة وودية بالعربية المصرية مع إيموجي مناسب.
- استخدم المعلومات من قاعدة المعرفة فقط.
- للأسئلة خارج نطاقك: حوّل للخط الساخن 19282.

== قاعدة أساسية ==

✅ الأسئلة العامة — أجب فوراً بدون طلب أي بيانات:
   • أسعار الشحن، مناطق التغطية، أوقات التوصيل
   • طرق الدفع، سياسة الإرجاع، التأمين
   • معلومات الشركة، حلول الشركات
   • أي سؤال عام عن الخدمة

🔒 تتبع شحنة بعينها فقط (حين يسأل العميل عن شحنة يملكها):
   • اطلب رقم الشحنة (يبدأ بـ SH-) إن لم يذكره
   • ثم اطلب التحقق: آخر 4 أرقام موبايل أو الاسم أو البريد
   • لا تخترع بيانات شحنة أبداً

${KB}`
  } else {
    return `You are Sara, a professional customer service agent at Shiphny Express, Egypt's #1 shipping company.

Rules:
- Be friendly, concise, use appropriate emojis.
- Only use info from the knowledge base.
- Out-of-scope questions: refer to hotline 19282.

== CRITICAL RULE ==

✅ GENERAL questions — answer IMMEDIATELY, no personal info needed:
   • Shipping prices, coverage areas, delivery times
   • Payment methods, return policy, insurance
   • Company info, business solutions
   • Any general service question

🔒 ONLY for a SPECIFIC shipment the customer owns:
   • Ask for the SH- tracking number if not given
   • Then verify identity: last 4 digits of mobile, name, or email
   • NEVER invent shipment details

${KB}`
  }
}

export type ChatRole = 'user' | 'assistant'
export interface ChatMessage { role: ChatRole; content: string }

/**
 * Send a message to Groq directly from the browser.
 * Returns the assistant reply string.
 */
export async function sendGroqMessage(
  userMessage: string,
  history: ChatMessage[],
  lang: 'ar' | 'en' = 'ar'
): Promise<string> {
  if (!GROQ_KEY) {
    throw new Error('NO_GROQ_KEY')
  }

  const messages = [
    { role: 'system', content: buildSystemPrompt(lang) },
    // Few-shot: general question answered directly
    {
      role: 'user',
      content: lang === 'ar' ? 'كم سعر الشحن للإسكندرية؟' : 'What is the shipping price to Alexandria?',
    },
    {
      role: 'assistant',
      content:
        lang === 'ar'
          ? 'سعر الشحن للإسكندرية 40 ج.م (قياسي) أو 55 ج.م (سريع) 😊 هل تحتاج حاجة تانية؟'
          : 'Shipping to Alexandria costs 40 EGP (standard) or 55 EGP (express) 😊 Anything else?',
    },
    // Few-shot: tracking → verification
    {
      role: 'user',
      content: lang === 'ar' ? 'عايز اعرف حالة شحنتي SH-12345678' : 'Where is my shipment SH-12345678?',
    },
    {
      role: 'assistant',
      content:
        lang === 'ar'
          ? 'أهلاً! عشان أوريك تفاصيل SH-12345678، محتاج أتحقق من هويتك بإحدى الطرق:\n1. آخر 4 أرقام من موبايلك\n2. اسمك الأول والثاني\n3. بريدك الإلكتروني المسجّل 🔒'
          : "Hi! To show details for SH-12345678, I need to verify your identity:\n1. Last 4 digits of your mobile\n2. First and last name\n3. Registered email 🔒",
    },
    // Actual conversation history (last 10 turns)
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ]

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 600,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
