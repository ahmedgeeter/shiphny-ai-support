import asyncio
import sys
import os
import random
from datetime import datetime, timedelta

# Ensure backend directory is in sys.path so we can import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import get_engine, Base, AsyncSessionLocal
from app.models.customer import Customer
from app.models.shipment import Shipment, ShipmentStatus
from app.models.invoice import Invoice, InvoiceStatus

# Dummy Data
CUSTOMERS = [
    {"name": "Ahmed Youssef", "company_name": "TechFlow Egypt", "email": "ahmed.y@techflow.eg", "wallet_balance": 1500.00},
    {"name": "Mona Ibrahim", "company_name": "Desert Traders", "email": "mona@deserttraders.com", "wallet_balance": 250.00},
    {"name": "Karim Hassan", "company_name": "Cairo Logistics", "email": "karim.h@cairologistics.eg", "wallet_balance": 5000.00},
    {"name": "Dina Mahmoud", "company_name": "Nile Retail", "email": "dina.m@nileretail.com", "wallet_balance": 0.00},
    {"name": "Omar Fathy", "company_name": "Sphinx Imports", "email": "omar@sphinximports.eg", "wallet_balance": 320.50},
]

DESTINATIONS = ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Sharm El-Sheikh", "Hurghada"]


async def main():
    print(" Initializing Database and Creating Tables...")
    engine = get_engine()
    async with engine.begin() as conn:
        # For testing purposes, create tables using Base.metadata.create_all
        await conn.run_sync(Base.metadata.create_all)
    print(" Tables Created/Verified.\n")

    print(" Seeding Mock Data...\n")
    
    summary = []

    async with AsyncSessionLocal() as session:
        for idx, c_data in enumerate(CUSTOMERS):
            # Create Customer
            customer = Customer(
                name=c_data["name"],
                company_name=c_data["company_name"],
                email=c_data["email"],
                wallet_balance=c_data["wallet_balance"]
            )
            session.add(customer)
            await session.flush() # flush to get customer ID
            
            customer_summary = {
                "email": customer.email,
                "name": customer.name,
                "shipments": [],
                "invoices": []
            }

            # Generate 2-3 shipments
            num_shipments = random.randint(2, 3)
            for s_idx in range(num_shipments):
                tracking = f"SHP-{customer.id}00{s_idx + 1}-{random.randint(1000, 9999)}"
                status = random.choice(list(ShipmentStatus))
                
                shipment = Shipment(
                    tracking_number=tracking,
                    customer_id=customer.id,
                    status=status,
                    destination=random.choice(DESTINATIONS),
                    estimated_delivery=datetime.utcnow() + timedelta(days=random.randint(1, 10))
                )
                session.add(shipment)
                customer_summary["shipments"].append(f"{tracking} ({status.value})")
                
            # Generate 1-2 invoices
            num_invoices = random.randint(1, 2)
            for i_idx in range(num_invoices):
                status = random.choice(list(InvoiceStatus))
                amount = round(random.uniform(50.0, 2000.0), 2)
                
                invoice = Invoice(
                    customer_id=customer.id,
                    amount=amount,
                    status=status,
                    due_date=datetime.utcnow() + timedelta(days=random.randint(5, 30))
                )
                session.add(invoice)
                await session.flush()
                customer_summary["invoices"].append(f"INV-{invoice.id} (${amount} - {status.value})")
                
            summary.append(customer_summary)
            
        # Commit all records
        await session.commit()
        print(" Data seeded successfully!\n")

    # Print nicely formatted summary
    print("=" * 60)
    print(" SEED DATA SUMMARY FOR AI TOOL-CALLING TESTING")
    print("=" * 60)
    
    for c in summary:
        print(f"\n Customer: {c['name']} | Email: {c['email']}")
        print(f"    Shipments:")
        for shp in c["shipments"]:
            print(f"      - {shp}")
        print(f"    Invoices:")
        for inv in c["invoices"]:
            print(f"      - {inv}")
            
    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
