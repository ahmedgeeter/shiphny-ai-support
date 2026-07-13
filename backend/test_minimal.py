"""Minimal focused test — one session, step by step with DB inspection."""
import asyncio, urllib.request, json, time, sys
sys.path.insert(0, '.')

base = 'http://localhost:8000'

def post(url, body):
    data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    r = urllib.request.Request(url, data=data,
                               headers={'Content-Type': 'application/json'}, method='POST')
    try:
        return json.loads(urllib.request.urlopen(r, timeout=60).read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode('utf-8', errors='replace'))

async def show_db(session_id, label):
    from app.db.database import AsyncSessionLocal
    from app.models.conversation import Conversation, Message
    from sqlalchemy import select
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Conversation).where(Conversation.session_id == session_id))
        conv = res.scalar_one_or_none()
        if not conv:
            print(f"  [{label}] No conversation in DB!")
            return
        res2 = await db.execute(select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at))
        msgs = res2.scalars().all()
        print(f"  [{label}] conv_id={conv.id}, {len(msgs)} msgs:")
        for m in msgs:
            print(f"    [{m.role.value:10}] {m.content[:70].replace(chr(10),' ')}")

# Create booking
b = post(f'{base}/api/bookings', {
    'sender_name': 'Dalya Hassan Samir', 'sender_phone': '01055566677',
    'sender_email': 'ahmed@gmail.com',
    'pickup_address': '15 Mohandessen St Giza Egypt',
    'delivery_address': '7 Maadi Corniche Cairo Egypt',
    'service_type': 'Express', 'weight_kg': 2.0,
})
ref = b['reference']
print(f"Booking: {ref}")
print()

session = f'min-{int(time.time())}'

# T1
r1 = post(f'{base}/api/chat', {'message': f'عايز اعرف حالة الشحنة {ref}', 'session_id': session, 'language': 'ar'})
print(f"T1 reply: {r1['response'][:150]}")
asyncio.run(show_db(session, 'after T1'))
time.sleep(0.8)
print()

# T2 — correct email
r2 = post(f'{base}/api/chat', {'message': 'ahmed@gmail.com', 'session_id': session, 'language': 'ar'})
print(f"T2 reply: {r2['response'][:300]}")
asyncio.run(show_db(session, 'after T2'))
print()

# Evaluate
reply2 = r2['response']
good_kw = ['Express', 'Giza', 'Maadi', 'Corniche', 'Mohandessen', 'قيد الانتظار', 'تم', ref, '2.0']
leaked = any(w.lower() in reply2.lower() for w in good_kw)
if leaked:
    print("[PASS] Correct email → shipment details shown ✅")
else:
    print("[FAIL] Correct email → details NOT shown ❌")
    print(f"       Full reply: {reply2}")
