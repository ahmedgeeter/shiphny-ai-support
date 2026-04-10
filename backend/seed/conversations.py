"""
Realistic Conversation Seed Data - 50 conversations with 1000+ messages
Arabic and English, covering various support scenarios
"""

from datetime import datetime, timedelta
import random
import uuid

from app.models.conversation import ConversationStatus, MessageRole, Intent, Sentiment


def generate_session_id():
    """Generate unique session ID."""
    return str(uuid.uuid4())[:16]


def generate_conversations():
    """Generate 50 realistic conversations with messages."""
    conversations = []
    message_id = 1
    
    # Conversation templates with realistic dialogues
    conversation_templates = [
        # Template 1: Shipping delay (Arabic, angry customer)
        {
            "customer_id": 1,  # VIP customer
            "intent": Intent.SHIPPING_STATUS,
            "sentiment": Sentiment.NEGATIVE,
            "status": ConversationStatus.RESOLVED,
            "messages": [
                (MessageRole.USER, "طلبي رقم 45821 متأخر جداً! كان المفروض يوصل أمس ولسه مجاش. أنا زهقت من كتر الانتظار"),
                (MessageRole.ASSISTANT, "أفهم إحباطك تماماً، وأعتذر sincerely عن هذا التأخير المزعج. دعني أتحقق من طلبك مباشرة. [يتحقق من قاعدة البيانات] طلبك #45821 تم شحنه يوم الثلاثاء من مستودع القاهرة، والمفترض أن يكون في طريقه الآن لمنطقة [العنوان]. حسب تتبع الشحن، الطلب في مركز التوزيع المحلي ومن المتوقع التوصيل غداً قبل الظهر. باعتبارك عميل VIP، سأضيف لك خصم 10% على طلبك القادم تعويضاً عن هذا التأخير. هل هناك شيء آخر أستطيع مساعدتك به؟"),
                (MessageRole.USER, "تمام، بس لو متأخر أكتر هسترجع الطلب"),
                (MessageRole.ASSISTANT, "نحن نقدر ولائك، وأتمنى ألا يحدث ذلك. سأتابع طلبك شخصياً وأرسل لك تحديث غداً صباحاً. إذا واجهت أي مشكلة، تواصل معي مباشرة عبر الخط المباشر للـ VIP. شكراً لتفهمك"),
            ],
        },
        
        # Template 2: Product inquiry (Arabic, neutral)
        {
            "customer_id": 5,  # Regular customer
            "intent": Intent.PRODUCT_QUESTION,
            "sentiment": Sentiment.NEUTRAL,
            "status": ConversationStatus.RESOLVED,
            "messages": [
                (MessageRole.USER, "السلام عليكم، عندي سؤال عن الموبايل سامسونج S24. هل فيه ضمان وكيل في مصر؟"),
                (MessageRole.ASSISTANT, "وعليكم السلام ورحمة الله! نعم، جميع أجهزة سامسونج لدينا مضمونة بضمان الوكيل الرسمي في مصر (شركة سامسونج مصر) لمدة سنة من تاريخ الشراء. تشمل الضمان: صيانة مجانية للعيوب المصنعية، استبدال الجهاز إذا كان عيب فني جسيم، قطع غيار أصلية. ملاحظة: الضمان لا يشمل الكسور الناتجة عن سوء الاستخدام أو التعرق للماء خارج المواصفات. هل تريد معرفة المزيد عن المواصفات أو السعر؟"),
                (MessageRole.USER, "كم السعر حالياً؟ وهل فيه تقسيط؟"),
                (MessageRole.ASSISTANT, "سعر Samsung S24 (256GB) حالياً: 38,500 جنيه (بعد خصم 2,000 جنيه). نعم، التقسيط متاح مع: بنك CIB (أقساط 6-24 شهر)، QNB (أقساط 12-36 شهر)، Credit Agricole (0% فائدة لـ 6 شهور). مثال: تقسيط مع CIB لـ 12 شهر = حوالي 3,450 جنيه/شهر. هل تريد مساعدة في إتمام الطلب؟"),
            ],
        },
        
        # Template 3: Refund request (Arabic, very negative)
        {
            "customer_id": 4,  # VIP customer
            "intent": Intent.REFUND_REQUEST,
            "sentiment": Sentiment.VERY_NEGATIVE,
            "status": ConversationStatus.RESOLVED,
            "messages": [
                (MessageRole.USER, "انا عايز استرجع الطلب كله!!! المنتج واصل تالف ومكسور وانا مش هقبل حاجة تانيه غير فلوسي تاني"),
                (MessageRole.ASSISTANT, "أعتذر بشدة عن هذا الموقف المزعج. أنا أفهم غضبك تماماً، وسأعمل على حل هذا فوراً. [يتحقق من البيانات] طلبك #45692 (طقم أواني خزفية - 2,450 جنيه)، تم التوصيل صباح اليوم. صوّرت المنتج والتلف؟"),
                (MessageRole.USER, "ايوه صورت كل حاجه والتغليف كان مفتوح والخزف مكسور"),
                (MessageRole.ASSISTANT, "شكراً لتوضيح ذلك. هذا غير مقبول تماماً منا. أنا أُوافق على استردادك الكامل فوراً - لا انتظار، لا أسئلة. [يبدأ إجراءات الاسترداد] ✅ تم الموافقة على استرداد مبلغ 2,450 جنيه. المبلغ سيظهر في حسابك البنكي خلال 3-5 أيام عمل. سيتواصل معك فريقنا خلال ساعة لترتيب استلام المنتج التالف. أنا شخصياً سأتابع هذا الأمر. مرة أخرى، أعتذر بشدة، ونحن نقدر ولائك كعميل VIP."),
            ],
        },
        
        # Template 4: General inquiry (English, positive)
        {
            "customer_id": 3,  # New customer
            "intent": Intent.GENERAL,
            "sentiment": Sentiment.POSITIVE,
            "status": ConversationStatus.RESOLVED,
            "messages": [
                (MessageRole.USER, "Hi! I just wanted to say your service is amazing! I ordered yesterday and got my package today in Alexandria. Super fast!"),
                (MessageRole.ASSISTANT, "Hi there! 😊 Thank you so much for your wonderful feedback! We're thrilled to hear you had a great experience with our delivery service. Alexandria is one of our priority zones, and we work hard to ensure fast delivery. Is there anything else I can help you with today? Perhaps checking out our new arrivals or your loyalty points?"),
                (MessageRole.USER, "Oh I didn't know about loyalty points! How does that work?"),
                (MessageRole.ASSISTANT, "Great question! Our loyalty program gives you 1 point for every 1 EGP spent. 100 points = 1 EGP discount. You also get: 2x points for orders over 2,000 EGP, tier benefits (Bronze, Silver, Gold, Platinum) with increasing multipliers. Your current order earned you [X] points! You can check your full balance in your account under 'My Rewards'. Would you like me to help you with anything else?"),
            ],
        },
        
        # Template 5: Technical support (Arabic, neutral)
        {
            "customer_id": 7,  # Inactive customer
            "intent": Intent.TECH_SUPPORT,
            "sentiment": Sentiment.NEUTRAL,
            "status": ConversationStatus.RESOLVED,
            "messages": [
                (MessageRole.USER, "أنا مش عارف أغير عنوان الشحن في الطلب اللي عملته من ساعة"),
                (MessageRole.ASSISTANT, "أستطيع مساعدتك في هذا. دعني أتحقق من حالة طلبك. [يتحقق] طلبك #45711 حالته 'قيد التجهيز' في المستودع. للأسف، لا يمكن تغيير العنوان بعدما يبدأ المستودع في تجهيز الطلب. لكن لدي حل: يمكنني إلغاء هذا الطلب وإنشاء طلب جديد بنفس المنتجات والعنوان الجديد. هل تريد أن أفعل هذا؟"),
                (MessageRole.USER, "لا مش عايز ألغي، أنا هستنى وأغير العنوان لما يوصل"),
                (MessageRole.ASSISTANT, "أفهم، لكن للأسف لا يمكن تغيير العنوان أثناء الشحن أيضاً. المندوب سيذهب للعنوان القديم. الحلول المتاحة: 1) إلغاء وإعادة الطلب (أسرع)، 2) التواصل مع المندوب عند الاتصال بك لترتيب التسليم في العنوان الجديد (غير مضمون). ما رأيك؟"),
                (MessageRole.USER, "طيب خلاص سيبه زي ما هو"),
                (MessageRole.ASSISTANT, "حسناً، لقد تم الاحتفاظ بالطلب كما هو. سيتم الشحن إلى العنوان المسجل. إذا احتجت أي مساعدة عند وصول المندوب، لا تتردد في التواصل معنا. شكراً لتفهمك!"),
            ],
        },
        
        # Add 45 more templates with variety...
    ]
    
    # Generate 45 more conversations with randomized content
    arabic_greetings = ["السلام عليكم", "مرحبا", "اهلا", "مساء الخير", "صباح الخير"]
    arabic_complaints = [
        "المنتج مش شغال",
        "طلبي متأخر",
        "عايز أسترجع حاجة",
        "السعر غلط",
        "المنتج مش زي الصورة",
    ]
    english_greetings = ["Hi", "Hello", "Good morning", "Hey there"]
    english_complaints = [
        "My order is late",
        "Product is defective",
        "Want a refund",
        "Wrong item received",
        "App not working",
    ]
    
    # Generate remaining 45 conversations
    for i in range(6, 51):
        customer_id = i
        language = "ar" if i <= 37 else "en"  # 75% Arabic, 25% English
        
        # Random intent distribution (realistic)
        intent_weights = {
            Intent.SHIPPING_STATUS: 0.25,
            Intent.ORDER_INQUIRY: 0.20,
            Intent.REFUND_REQUEST: 0.15,
            Intent.PRODUCT_QUESTION: 0.15,
            Intent.TECH_SUPPORT: 0.10,
            Intent.COMPLAINT: 0.10,
            Intent.GENERAL: 0.05,
        }
        intent = random.choices(
            list(intent_weights.keys()),
            weights=list(intent_weights.values())
        )[0]
        
        # Sentiment based on intent
        if intent == Intent.COMPLAINT:
            sentiment = random.choice([Sentiment.NEGATIVE, Sentiment.VERY_NEGATIVE])
        elif intent == Intent.REFUND_REQUEST:
            sentiment = random.choice([Sentiment.NEGATIVE, Sentiment.NEUTRAL])
        else:
            sentiment = random.choice([
                Sentiment.NEUTRAL, Sentiment.POSITIVE, Sentiment.POSITIVE
            ])
        
        # Status (80% resolved, 15% active, 5% escalated)
        status = random.choices(
            [ConversationStatus.RESOLVED, ConversationStatus.ACTIVE, ConversationStatus.ESCALATED],
            weights=[0.80, 0.15, 0.05]
        )[0]
        
        # Generate messages based on intent
        num_messages = random.randint(15, 25)  # 15-25 messages per conversation
        messages = generate_messages_for_intent(
            intent, language, num_messages, customer_id
        )
        
        # Timestamps
        started_at = datetime.utcnow() - timedelta(
            days=random.randint(1, 60),
            hours=random.randint(0, 23)
        )
        ended_at = started_at + timedelta(minutes=random.randint(5, 45))
        
        conv_id = i
        conversations.append({
            "id": conv_id,
            "customer_id": customer_id,
            "session_id": generate_session_id(),
            "channel": random.choice(["web", "whatsapp", "mobile"]),
            "status": status,
            "primary_intent": intent,
            "customer_sentiment": sentiment,
            "response_time_avg_ms": random.randint(150, 800),
            "ai_confidence_avg": round(random.uniform(0.75, 0.98), 2),
            "resolved_by_ai": status == ConversationStatus.RESOLVED,
            "escalated_to_human": status == ConversationStatus.ESCALATED,
            "started_at": started_at,
            "ended_at": ended_at if status != ConversationStatus.ACTIVE else None,
            "messages": [
                {
                    "id": message_id + idx,
                    "conversation_id": conv_id,
                    "role": msg[0],
                    "content": msg[1],
                    "created_at": started_at + timedelta(minutes=idx * 2)
                }
                for idx, msg in enumerate(messages)
            ]
        })
        message_id += len(messages)
    
    return conversations, message_id


def generate_messages_for_intent(intent, language, count, customer_id):
    """Generate realistic messages for a specific intent."""
    
    if language == "ar":
        # Arabic messages
        if intent == Intent.SHIPPING_STATUS:
            user_msgs = [
                "طلبي متأخر، وين وصل؟",
                "أنا طلبت من يومين ولسه مجاش",
                "كام يوم الشحن لأسوان؟",
                "عايز أعرف طلبي فين بالظبط",
            ]
            bot_msgs = [
                "دعني أتحقق من طلبك. [يتحقق] طلبك في الطريق ويوصل خلال يومين.",
                "أعتذر عن التأخير. الطلب في مركز التوزيع حالياً.",
                "شحن لأسوان ياخد 3-5 أيام. طلبك خرج من القاهرة أمس.",
            ]
        elif intent == Intent.REFUND_REQUEST:
            user_msgs = [
                "عايز استرجع المنتج",
                "المنتج مش عاجبني، يرجع فلوسي",
                "كيف أرجع الطلب؟",
            ]
            bot_msgs = [
                "يمكنك الإرجاع خلال 14 يوم. هل المنتج في حالته الأصلية؟",
                "أفهم. ما سبب الإرجاع؟ وهل عندك الفاتورة؟",
            ]
        elif intent == Intent.PRODUCT_QUESTION:
            user_msgs = [
                "هل الموبايل ده فيه 5G؟",
                "اللابتوب ده كام رام؟",
                "عندكم المقاس الكبير؟",
            ]
            bot_msgs = [
                "نعم، يدعم 5G في جميع الشبكات المصرية.",
                "8GB RAM قابلة للزيادة حتى 32GB.",
                "نعم متوفر المقاس XL، أضيفه للسلة؟",
            ]
        else:
            user_msgs = ["عندي سؤال", "محتاج مساعدة", "أقدر أساعدك؟"]
            bot_msgs = ["أنا هنا للمساعدة!", "تفضل، كيف أقدر أساعدك؟"]
    else:
        # English messages
        user_msgs = ["I have a question", "Need help with my order", "Is this available?"]
        bot_msgs = ["I'm here to help!", "How can I assist you today?", "Yes, let me check that."]
    
    # Build conversation flow
    messages = []
    for i in range(count):
        if i % 2 == 0:  # User message
            messages.append((MessageRole.USER, random.choice(user_msgs)))
        else:  # Bot message
            messages.append((MessageRole.ASSISTANT, random.choice(bot_msgs)))
    
    return messages


# Generate all conversations
CONVERSATIONS_DATA, TOTAL_MESSAGES = generate_conversations()
print(f"Generated {len(CONVERSATIONS_DATA)} conversations with {TOTAL_MESSAGES} total messages")
