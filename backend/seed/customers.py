"""
Realistic Egyptian Customer Data - 50 profiles
Names, phones, and purchase patterns typical of Egyptian e-commerce
"""

from datetime import datetime, timedelta
import random


def generate_customers():
    """Generate 50 realistic Egyptian customer profiles."""
    
    # Egyptian first names (realistic distribution)
    male_names = [
        "Ahmed", "Mohamed", "Mahmoud", "Ali", "Omar", "Hassan", "Khaled", "Tarek",
        "Ibrahim", "Mostafa", "Abdelrahman", "Youssef", "Karim", "Amr", "Hussein",
        "Saad", "Gamal", "Adel", "Fathy", "Ramadan", "Eid", "Sharif", "Ashraf"
    ]
    
    female_names = [
        "Fatima", "Aya", "Mariam", "Nour", "Habiba", "Salma", "Yasmin", "Sara",
        "Reem", "Dina", "Nada", "Rania", "Heba", "Mona", "Dalia", "Gigi",
        "Lobna", "Ingy", "Nehal", "Shereen", "Amira", "Hana", "Jana"
    ]
    
    # Egyptian last names
    last_names = [
        "Mohamed", "Ahmed", "Ali", "Ibrahim", "Hassan", "Mahmoud", "Khalil",
        "Said", "Fathy", "Eid", "Ramadan", "Gamal", "Adel", "Sharif", "Ashraf",
        "Abdelrahman", "Abdelaziz", "Abdallah", "Saad", "Hussein", "Omar", "Tarek",
        "Salem", "Gomaa", "Ismail", "Rashid", "Hamza", "Fouad", "Mansour"
    ]
    
    # Email domains (realistic mix)
    email_domains = [
        "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
        "icloud.com", "mail.com", "protonmail.com"
    ]
    
    # Egyptian mobile prefixes
    mobile_prefixes = ["010", "011", "012", "015"]
    
    customers = []
    
    for i in range(1, 51):
        # Random gender
        is_male = random.choice([True, False])
        
        if is_male:
            first_name = random.choice(male_names)
        else:
            first_name = random.choice(female_names)
        
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        
        # Email (realistic patterns)
        email_patterns = [
            f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@{random.choice(email_domains)}",
            f"{first_name.lower()}{last_name.lower()}{random.randint(10, 99)}@{random.choice(email_domains)}",
            f"{first_name.lower()}{random.randint(1980, 2005)}@{random.choice(email_domains)}",
            f"{first_name[0].lower()}{last_name.lower()}{random.randint(1, 500)}@{random.choice(email_domains)}"
        ]
        email = random.choice(email_patterns)
        
        # Egyptian mobile number
        mobile = f"+20 {random.choice(mobile_prefixes)} {random.randint(10000000, 99999999)}"
        
        # Customer tier based on order history (realistic distribution)
        tier_weights = [0.25, 0.40, 0.25, 0.10]  # new, regular, vip, inactive
        tier = random.choices(
            ["new", "regular", "vip", "inactive"],
            weights=tier_weights
        )[0]
        
        # Generate order stats based on tier
        if tier == "new":
            total_orders = random.randint(0, 1)
            total_spent = random.uniform(0, 1500)
        elif tier == "regular":
            total_orders = random.randint(2, 8)
            total_spent = random.uniform(1500, 8000)
        elif tier == "vip":
            total_orders = random.randint(6, 25)
            total_spent = random.uniform(8000, 50000)
        else:  # inactive
            total_orders = random.randint(1, 5)
            total_spent = random.uniform(500, 4000)
        
        # Calculate average order value
        avg_order = total_spent / total_orders if total_orders > 0 else 0
        
        # Last order date (realistic recency)
        if tier == "inactive":
            days_ago = random.randint(180, 365)
        elif tier == "vip":
            days_ago = random.randint(1, 30)
        else:
            days_ago = random.randint(7, 90)
        
        last_order = datetime.utcnow() - timedelta(days=days_ago)
        
        # Language preference (mostly Arabic, some English)
        language = random.choices(
            ["ar", "en"],
            weights=[0.75, 0.25]
        )[0]
        
        # Created date (when they first joined)
        days_since_created = random.randint(30, 1000)
        created_at = datetime.utcnow() - timedelta(days=days_since_created)
        
        customers.append({
            "id": i,
            "full_name": full_name,
            "email": email,
            "phone": mobile,
            "tier": tier,
            "preferred_language": language,
            "total_orders": total_orders,
            "total_spent_egp": round(total_spent, 2),
            "average_order_value": round(avg_order, 2),
            "last_order_date": last_order,
            "created_at": created_at,
            "support_notes": None,
        })
    
    return customers


# Pre-generated for consistency
CUSTOMERS_DATA = [
    {"id": 1, "full_name": "Ahmed Mohamed", "email": "ahmed.mohamed234@gmail.com", "phone": "+20 011 87654321", "tier": "vip", "preferred_language": "ar", "total_orders": 15, "total_spent_egp": 24500.50, "average_order_value": 1633.37},
    {"id": 2, "full_name": "Fatima Ali", "email": "fatima.ali88@yahoo.com", "phone": "+20 010 12345678", "tier": "regular", "preferred_language": "ar", "total_orders": 5, "total_spent_egp": 4200.00, "average_order_value": 840.00},
    {"id": 3, "full_name": "Omar Hassan", "email": "omar.hassan1990@hotmail.com", "phone": "+20 012 98765432", "tier": "new", "preferred_language": "en", "total_orders": 1, "total_spent_egp": 899.99, "average_order_value": 899.99},
    {"id": 4, "full_name": "Mariam Ibrahim", "email": "mariam.ibrahim12@gmail.com", "phone": "+20 015 45678901", "tier": "vip", "preferred_language": "ar", "total_orders": 22, "total_spent_egp": 38750.00, "average_order_value": 1761.36},
    {"id": 5, "full_name": "Khaled Abdelrahman", "email": "khaled.ar99@outlook.com", "phone": "+20 011 23456789", "tier": "regular", "preferred_language": "ar", "total_orders": 7, "total_spent_egp": 6500.00, "average_order_value": 928.57},
    {"id": 6, "full_name": "Nour Saad", "email": "nour.saad2000@icloud.com", "phone": "+20 010 87654321", "tier": "new", "preferred_language": "en", "total_orders": 0, "total_spent_egp": 0.00, "average_order_value": 0.00},
    {"id": 7, "full_name": "Tarek Gamal", "email": "tarek.gamal45@gmail.com", "phone": "+20 012 34567890", "tier": "inactive", "preferred_language": "ar", "total_orders": 3, "total_spent_egp": 2100.50, "average_order_value": 700.17},
    {"id": 8, "full_name": "Habiba Youssef", "email": "habiba.youssef77@yahoo.com", "phone": "+20 015 67890123", "tier": "vip", "preferred_language": "ar", "total_orders": 18, "total_spent_egp": 29400.00, "average_order_value": 1633.33},
    {"id": 9, "full_name": "Mostafa Adel", "email": "mostafa.adel2022@gmail.com", "phone": "+20 011 56789012", "tier": "regular", "preferred_language": "ar", "total_orders": 4, "total_spent_egp": 3200.00, "average_order_value": 800.00},
    {"id": 10, "full_name": "Aya Mahmoud", "email": "aya.mahmoud15@hotmail.com", "phone": "+20 010 90123456", "tier": "regular", "preferred_language": "ar", "total_orders": 6, "total_spent_egp": 5800.00, "average_order_value": 966.67},
    {"id": 11, "full_name": "Abdelrahman Khalil", "email": "abdelrahman.k1995@gmail.com", "phone": "+20 012 78901234", "tier": "vip", "preferred_language": "en", "total_orders": 12, "total_spent_egp": 18500.00, "average_order_value": 1541.67},
    {"id": 12, "full_name": "Salma Fathy", "email": "salma.fathy33@yahoo.com", "phone": "+20 015 12345678", "tier": "new", "preferred_language": "ar", "total_orders": 1, "total_spent_egp": 1250.00, "average_order_value": 1250.00},
    {"id": 13, "full_name": "Karim Sharif", "email": "karim.sharif87@gmail.com", "phone": "+20 011 45678901", "tier": "regular", "preferred_language": "ar", "total_orders": 8, "total_spent_egp": 7200.00, "average_order_value": 900.00},
    {"id": 14, "full_name": "Sara Eid", "email": "sara.eid2001@outlook.com", "phone": "+20 010 34567890", "tier": "inactive", "preferred_language": "en", "total_orders": 2, "total_spent_egp": 1400.00, "average_order_value": 700.00},
    {"id": 15, "full_name": "Hassan Ramadan", "email": "hassan.ramadan55@gmail.com", "phone": "+20 012 67890123", "tier": "vip", "preferred_language": "ar", "total_orders": 20, "total_spent_egp": 35600.00, "average_order_value": 1780.00},
    {"id": 16, "full_name": "Reem Ashraf", "email": "reem.ashraf19@yahoo.com", "phone": "+20 015 89012345", "tier": "regular", "preferred_language": "ar", "total_orders": 5, "total_spent_egp": 4650.00, "average_order_value": 930.00},
    {"id": 17, "full_name": "Amr Gomaa", "email": "amr.gomaa77@gmail.com", "phone": "+20 011 23456789", "tier": "new", "preferred_language": "ar", "total_orders": 0, "total_spent_egp": 0.00, "average_order_value": 0.00},
    {"id": 18, "full_name": "Dina Rashid", "email": "dina.rashid88@hotmail.com", "phone": "+20 010 56789012", "tier": "regular", "preferred_language": "en", "total_orders": 4, "total_spent_egp": 3600.00, "average_order_value": 900.00},
    {"id": 19, "full_name": "Youssef Mansour", "email": "youssef.mansour1992@gmail.com", "phone": "+20 012 90123456", "tier": "vip", "preferred_language": "ar", "total_orders": 14, "total_spent_egp": 22800.00, "average_order_value": 1628.57},
    {"id": 20, "full_name": "Mona Ismail", "email": "mona.ismail44@yahoo.com", "phone": "+20 015 45678901", "tier": "inactive", "preferred_language": "ar", "total_orders": 3, "total_spent_egp": 1950.00, "average_order_value": 650.00},
]

# Generate full 50 customers
ALL_CUSTOMERS = generate_customers()
