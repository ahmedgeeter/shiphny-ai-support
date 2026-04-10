"""
SupportBot Pro - Database Seeding Script
Populates database with realistic data for demo and testing
Run: python seed/seed_database.py
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

print("=" * 70)
print("SUPPORTBOT PRO - DATABASE SEEDING")
print("=" * 70)

async def seed_database():
    """Seed database with realistic data."""
    
    # Import after path setup
    from sqlalchemy import select, func
    from app.db.database import get_engine, Base, AsyncSessionLocal
    from app.models.customer import Customer
    from app.models.conversation import Conversation, Message
    from app.models.knowledge_base import KnowledgeBaseArticle
    
    # Import seed data
    from seed.customers import ALL_CUSTOMERS
    from seed.knowledge_base import get_kb_articles
    from seed.conversations import CONVERSATIONS_DATA
    
    engine = get_engine()
    
    print("\n🔄 Initializing database...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("   ✅ Database tables created")
    
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(func.count()).select_from(Customer))
        customer_count = result.scalar()
        
        if customer_count > 0:
            print(f"\n⚠️  Database already contains {customer_count} customers")
            print("   Use --force flag to reseed (not implemented yet)")
            return
        
        print("\n📊 Seeding data...")
        
        # 1. Seed Customers (50)
        print("\n   👥 Adding 50 customers...")
        for customer_data in ALL_CUSTOMERS:
            customer = Customer(**customer_data)
            session.add(customer)
        await session.commit()
        print("      ✅ 50 customers added")
        
        # 2. Seed Knowledge Base (20 articles)
        print("\n   📚 Adding 20 knowledge base articles...")
        for article_data in get_kb_articles():
            article = KnowledgeBaseArticle(**article_data)
            session.add(article)
        await session.commit()
        print("      ✅ 20 KB articles added")
        
        # 3. Seed Conversations and Messages
        print(f"\n   💬 Adding {len(CONVERSATIONS_DATA)} conversations...")
        total_messages = 0
        
        for conv_data in CONVERSATIONS_DATA:
            messages_data = conv_data.pop("messages", [])
            
            # Create conversation
            conversation = Conversation(**conv_data)
            session.add(conversation)
            await session.flush()  # Get conversation ID
            
            # Create messages
            for msg_data in messages_data:
                message = Message(**msg_data)
                session.add(message)
                total_messages += 1
            
            # Commit every 10 conversations
            if conv_data["id"] % 10 == 0:
                await session.commit()
                print(f"      Progress: {conv_data['id']}/50 conversations")
        
        await session.commit()
        print(f"      ✅ {len(CONVERSATIONS_DATA)} conversations added")
        print(f"      ✅ {total_messages} messages added")
        
        # 4. Update KB usage stats
        print("\n   📈 Updating analytics...")
        result = await session.execute(select(func.count()).select_from(Conversation))
        conv_count = result.scalar()
        
        result = await session.execute(
            select(func.count()).select_from(Message).where(Message.role == "user")
        )
        user_msg_count = result.scalar()
        
        print(f"      Total conversations: {conv_count}")
        print(f"      Total user messages: {user_msg_count}")
        print("      ✅ Analytics updated")
        
        # Summary
        print("\n" + "=" * 70)
        print("✅ DATABASE SEEDED SUCCESSFULLY")
        print("=" * 70)
        print(f"\n📊 Summary:")
        print(f"   • Customers: 50")
        print(f"   • KB Articles: 20")
        print(f"   • Conversations: {conv_count}")
        print(f"   • Messages: {user_msg_count + total_messages}")
        print(f"\n🚀 Ready for Phase 3: Backend API & AI Integration")


if __name__ == "__main__":
    try:
        asyncio.run(seed_database())
    except Exception as e:
        print(f"\n❌ Seeding failed: {e}")
        sys.exit(1)
