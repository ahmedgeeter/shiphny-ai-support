"""Full end-to-end test: wrong data → clear rejection, correct data → full details shown."""
import urllib.request, json, sys, time

base = 'http://localhost:8000'

def post(url, body):
    data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    r = urllib.request.Request(url, data=data,
                               headers={'Content-Type': 'application/json'}, method='POST')
    try:
        resp = urllib.request.urlopen(r, timeout=20)
        return json.loads(resp.read()), resp.getcode()
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode('utf-8', errors='replace')), e.code

results = []

def check(label, ok, detail=''):
    results.append(('PASS' if ok else 'FAIL', label))
    print(f"[{'PASS' if ok else 'FAIL'}] {label}")
    if detail:
        print(f"       → {detail[:180]}")

# ── Create booking ──────────────────────────────────────────────
b, _ = post(f'{base}/api/bookings', {
    'sender_name': 'Dalya Hassan Samir',
    'sender_phone': '01055566677',
    'sender_email': 'ahmed@gmail.com',
    'pickup_address': '15 Mohandessen St Giza Egypt',
    'delivery_address': '7 Maadi Corniche Cairo Egypt',
    'service_type': 'Express',
    'weight_kg': 2.0,
})
ref = b.get('reference', '')
check('Create booking', bool(ref) and b.get('sender_email') == 'ahmed@gmail.com', f"ref={ref}")
if not ref:
    sys.exit(1)

print(f"\n  Booking: {ref} | email=ahmed@gmail.com | phone ends 6677")
print()

# ── Session 1: Wrong email → must get rejection message ─────────
s1 = f'test-s1-{int(time.time())}'
r1, _ = post(f'{base}/api/chat', {'message': f'عايز اعرف تفاصيل شحنة {ref}', 'session_id': s1, 'language': 'ar'})
check('S1-T1: Sara asks for identity', bool(r1.get('response')), r1['response'][:80])
time.sleep(0.8)

r2, _ = post(f'{base}/api/chat', {'message': 'ahmed123@gmail.com', 'session_id': s1, 'language': 'ar'})
reply2 = r2.get('response', '')
# Must NOT say "Checking now" alone AND must contain rejection words
stops_at_checking = reply2.strip().lower() in ['checking now...', '🔒 checking now...', 'جاري التحقق...', '🕒 جاري التحقق...']
bad_kw = ['قيد الانتظار','تم التأكيد','Express','Giza','Maadi','Corniche','Mohandessen','Dalya','2.0']
leaked = [w for w in bad_kw if w.lower() in reply2.lower()]
rejection_kw = ['غير صحيح','غير مطابق','عذر','حاول','19282','incorrect','don\'t match','sorry','try again','البيانات']
has_rejection = any(w.lower() in reply2.lower() for w in rejection_kw)

check('S1-T2: Wrong email → NOT "Checking now" alone', not stops_at_checking, reply2[:120])
check('S1-T2: Wrong email → no data leaked', not leaked, f"leaked={leaked}" if leaked else 'clean')
check('S1-T2: Wrong email → clear rejection message', has_rejection, reply2[:120])
time.sleep(0.8)

# ── Session 2: Correct email → must show real details ──────────
s2 = f'test-s2-{int(time.time())}'
r3, _ = post(f'{base}/api/chat', {'message': f'عايز اعرف تفاصيل شحنة {ref}', 'session_id': s2, 'language': 'ar'})
check('S2-T1: Sara asks for identity', bool(r3.get('response')), r3['response'][:80])
time.sleep(0.8)

r4, _ = post(f'{base}/api/chat', {'message': 'ahmed@gmail.com', 'session_id': s2, 'language': 'ar'})
reply4 = r4.get('response', '')
good_kw = ['Express', 'Giza', 'Maadi', 'Corniche', 'Mohandessen',
           'قيد الانتظار', 'تم', 'الشحنة', ref]
has_details = any(w.lower() in reply4.lower() for w in good_kw)
stops_at_checking2 = reply4.strip().lower() in ['checking now...', '🔒 checking now...', 'جاري التحقق...', '🕒 جاري التحقق...']

check('S2-T2: Correct email → shows shipment details', has_details, reply4[:200])
check('S2-T2: Correct email → NOT "Checking now" alone', not stops_at_checking2, reply4[:80])
time.sleep(0.8)

# ── Session 3: Phone last4 correct ──────────────────────────────
s3 = f'test-s3-{int(time.time())}'
post(f'{base}/api/chat', {'message': f'عايز اعرف حالة شحنتي {ref}', 'session_id': s3, 'language': 'ar'})
time.sleep(0.8)
r5, _ = post(f'{base}/api/chat', {'message': '6677', 'session_id': s3, 'language': 'ar'})
reply5 = r5.get('response', '')
has_details5 = any(w.lower() in reply5.lower() for w in ['Express','Giza','Maadi','قيد الانتظار','الشحنة', ref])
check('S3: Correct phone_last4 → shows details', has_details5, reply5[:200])
time.sleep(0.8)

# ── Session 4: Name correct ──────────────────────────────────────
s4 = f'test-s4-{int(time.time())}'
post(f'{base}/api/chat', {'message': f'عايز اعرف حالة شحنتي {ref}', 'session_id': s4, 'language': 'ar'})
time.sleep(0.8)
r6, _ = post(f'{base}/api/chat', {'message': 'Dalya Hassan', 'session_id': s4, 'language': 'ar'})
reply6 = r6.get('response', '')
has_details6 = any(w.lower() in reply6.lower() for w in ['Express','Giza','Maadi','قيد الانتظار','الشحنة', ref])
check('S4: Correct name → shows details', has_details6, reply6[:200])
time.sleep(0.8)

# ── Session 5: Follow-up after verify remembers ─────────────────
r7, _ = post(f'{base}/api/chat', {'message': 'امتى هتوصل؟', 'session_id': s2, 'language': 'ar'})
reply7 = r7.get('response', '')
asks_verify_again = any(w in reply7 for w in ['آخر 4','رقم الشحنة SH-12345678','share your shipment reference'])
check('S5: Follow-up in verified session → no re-verification', not asks_verify_again, reply7[:150])

# ── Summary ──────────────────────────────────────────────────────
print()
print('=' * 55)
failed = [l for s,l in results if s=='FAIL']
print(f"RESULT: {len(results)-len(failed)}/{len(results)} passed")
if failed:
    print("FAILED:")
    for l in failed:
        print(f"  ✗ {l}")
    sys.exit(1)
else:
    print("ALL TESTS PASSED ✅")
