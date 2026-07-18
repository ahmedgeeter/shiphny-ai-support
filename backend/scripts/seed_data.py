import asyncio
import os
import sys
from datetime import datetime, timedelta
import random

# Add backend directory to sys.path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import AsyncSessionLocal, init_db
from app.models.customer import Customer, RoleEnum, CustomerTier
from app.models.shipment import Shipment, ShipmentStatus
from app.core.security import get_password_hash

# Try to import faker, if not present fallback to static generation
try:
    from faker import Faker
    fake = Faker(['ar_EG', 'en_US'])
except ImportError:
    print("Faker not installed. Run `pip install faker` inside the container to use realistic names.")
    fake = None

async def seed_db():
    await init_db()
    
    async with AsyncSessionLocal() as db:
        print("Starting seed process...")
        
        # 1. Ensure Admin exists
        result = await db.execute(select(Customer).where(Customer.email == "admin@shiphny.com"))
        admin = result.scalars().first()
        if not admin:
            print("Creating admin user (admin@shiphny.com / admin123)...")
            admin = Customer(
                email="admin@shiphny.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                role=RoleEnum.ADMIN,
                is_active=True,
                wallet_balance=0.0
            )
            db.add(admin)
        else:
            print("Admin user already exists.")
            
        # 2. Generate 20 random customers
        print("Generating 20 fake customers and their shipments...")
        statuses = list(ShipmentStatus)
        cities = ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Hurghada", "Sharm El-Sheikh", "Mansoura", "Tanta"]
        
        for i in range(20):
            if fake:
                name = fake.name()
                email = fake.unique.email()
                phone = fake.phone_number()
            else:
                name = f"Fake Customer {i}"
                email = f"customer{i}@example.com"
                phone = "01000000000"
                
            customer = Customer(
                email=email,
                hashed_password=get_password_hash("password123"),
                full_name=name,
                phone=phone,
                role=RoleEnum.CUSTOMER,
                is_active=random.choice([True, True, True, False]), # 25% chance of being inactive
                wallet_balance=round(random.uniform(0, 5000), 2),
                total_orders=random.randint(0, 50),
                total_spent_egp=round(random.uniform(0, 20000), 2),
                tier=random.choice(list(CustomerTier))
            )
            db.add(customer)
            await db.flush() # To get customer.id
            
            # Generate 2-5 shipments for each customer
            num_shipments = random.randint(2, 5)
            for j in range(num_shipments):
                status = random.choice(statuses)
                tracking = f"SHP-{customer.id}-{j}-{random.randint(1000, 9999)}"
                
                est_delivery = datetime.utcnow() + timedelta(days=random.randint(1, 14))
                if status == ShipmentStatus.DELIVERED:
                    est_delivery = datetime.utcnow() - timedelta(days=random.randint(1, 14))
                    
                shipment = Shipment(
                    tracking_number=tracking,
                    customer_id=customer.id,
                    status=status,
                    destination=random.choice(cities),
                    estimated_delivery=est_delivery
                )
                db.add(shipment)
                
        await db.commit()
        print("Seed completed successfully! Added 20 customers with shipments.")

if __name__ == "__main__":
    asyncio.run(seed_db())
