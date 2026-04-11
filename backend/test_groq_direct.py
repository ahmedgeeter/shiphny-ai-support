"""Test Groq API directly to see if it responds."""
import asyncio, os, sys
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()

async def test():
    import httpx
    api_key = os.getenv("GROQ_API_KEY")
    print(f"GROQ_API_KEY: {'SET ('+api_key[:8]+'...)' if api_key else 'NOT SET'}")
    
    if not api_key:
        print("No Groq key — will use fallback always")
        return

    messages = [
        {"role": "system", "content": "أنت سارة، موظفة خدمة عملاء شحني. الرد بالعربية."},
        {"role": "user", "content": "عايز اعرف حالة شحنتي SH-12345678"},
    ]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": "llama-3.3-70b-versatile", "messages": messages, "temperature": 0.7, "max_tokens": 300}
        )
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"Response: {data['choices'][0]['message']['content'][:200]}")
        else:
            print(f"Error: {r.text[:300]}")

async def test_gemini():
    import httpx
    gemini_key = os.getenv("GEMINI_API_KEY")
    print(f"\nGEMINI_API_KEY: {'SET ('+gemini_key[:8]+'...)' if gemini_key else 'NOT SET'}")
    if not gemini_key:
        return
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
    payload = {
        "system_instruction": {"parts": [{"text": "أنت سارة، موظفة خدمة عملاء شحني. الرد بالعربية المصرية بشكل ودي."}]},
        "contents": [
            {"role": "user", "parts": [{"text": "عايز اعرف حالة شحنتي SH-12345678"}]}
        ],
        "generationConfig": {"maxOutputTokens": 300, "temperature": 0.7},
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
        print(f"Gemini Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            print(f"Response: {data['candidates'][0]['content']['parts'][0]['text'][:200]}")
        else:
            print(f"Error: {r.text[:300]}")

asyncio.run(test())
asyncio.run(test_gemini())
