#!/usr/bin/env python3
"""
Script to create retail analytics schema and seed data for Scout Analytics
"""
import os
import sys
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Add app directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.base import Base
from app.models.user import User  # Import existing models first
from app.models.retail import (  # Then import new models
    Region, Province, City, Store, Brand, Category, Product, 
    Customer, Transaction, TransactionItem, Inventory
)

def create_tables():
    """Create all tables"""
    print("Creating database tables...")
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

def seed_philippine_geography():
    """Seed Philippine geographic data"""
    print("Seeding Philippine geography...")
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Philippine Regions
        regions_data = [
            ("NCR", "National Capital Region"),
            ("CAR", "Cordillera Administrative Region"),
            ("R01", "Region I (Ilocos Region)"),
            ("R02", "Region II (Cagayan Valley)"),
            ("R03", "Region III (Central Luzon)"),
            ("R04A", "Region IV-A (CALABARZON)"),
            ("R04B", "Region IV-B (MIMAROPA)"),
            ("R05", "Region V (Bicol Region)"),
            ("R06", "Region VI (Western Visayas)"),
            ("R07", "Region VII (Central Visayas)"),
            ("R08", "Region VIII (Eastern Visayas)"),
            ("R09", "Region IX (Zamboanga Peninsula)"),
            ("R10", "Region X (Northern Mindanao)"),
            ("R11", "Region XI (Davao Region)"),
            ("R12", "Region XII (SOCCSKSARGEN)"),
            ("R13", "Region XIII (Caraga)"),
            ("BARMM", "Bangsamoro Autonomous Region in Muslim Mindanao")
        ]
        
        for code, name in regions_data:
            if not db.query(Region).filter(Region.code == code).first():
                region = Region(code=code, name=name)
                db.add(region)
        
        db.commit()
        
        # Sample provinces for major regions
        provinces_data = [
            ("MNL", "Metro Manila", "NCR"),
            ("BUL", "Bulacan", "R03"),
            ("PAM", "Pampanga", "R03"),
            ("BAT", "Bataan", "R03"),
            ("CAV", "Cavite", "R04A"),
            ("LAG", "Laguna", "R04A"),
            ("BAT2", "Batangas", "R04A"),
            ("RIZ", "Rizal", "R04A"),
            ("QUE", "Quezon", "R04A"),
            ("CEU", "Cebu", "R07"),
            ("BOH", "Bohol", "R07"),
            ("DAV", "Davao del Sur", "R11"),
            ("COM", "Compostela Valley", "R11"),
        ]
        
        for code, name, region_code in provinces_data:
            region = db.query(Region).filter(Region.code == region_code).first()
            if region and not db.query(Province).filter(Province.code == code).first():
                province = Province(code=code, name=name, region_id=region.id)
                db.add(province)
        
        db.commit()
        
        # Sample cities
        cities_data = [
            ("MKT", "Makati", "MNL"),
            ("BGC", "Taguig", "MNL"),
            ("QC", "Quezon City", "MNL"),
            ("MND", "Mandaluyong", "MNL"),
            ("PAS", "Pasig", "MNL"),
            ("BAC", "Bacoor", "CAV"),
            ("DAS", "Dasmariñas", "CAV"),
            ("STA", "Santa Rosa", "LAG"),
            ("CAL", "Calamba", "LAG"),
            ("CEB", "Cebu City", "CEU"),
            ("LAP", "Lapu-Lapu", "CEU"),
            ("DAV", "Davao City", "DAV"),
        ]
        
        for code, name, province_code in cities_data:
            province = db.query(Province).filter(Province.code == province_code).first()
            if province and not db.query(City).filter(City.code == code).first():
                city = City(code=code, name=name, province_id=province.id)
                db.add(city)
        
        db.commit()
        print("✅ Philippine geography seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding geography: {e}")
        raise
    finally:
        db.close()

def seed_retail_data():
    """Seed retail reference data"""
    print("Seeding retail reference data...")
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Brands
        brands_data = [
            ("COKE", "Coca-Cola", "The Coca-Cola Company"),
            ("PEPSI", "Pepsi", "PepsiCo"),
            ("NESTLE", "Nestlé", "Nestlé Philippines"),
            ("UNILEVER", "Unilever", "Unilever Philippines"),
            ("P&G", "Procter & Gamble", "P&G Philippines"),
            ("COLGATE", "Colgate", "Colgate-Palmolive"),
            ("LUCKY_ME", "Lucky Me!", "Monde Nissin"),
            ("MARLBORO", "Marlboro", "Philip Morris"),
            ("TANDUAY", "Tanduay", "Tanduay Distillers"),
            ("ALASKA", "Alaska", "FrieslandCampina"),
        ]
        
        for code, name, manufacturer in brands_data:
            if not db.query(Brand).filter(Brand.code == code).first():
                brand = Brand(code=code, name=name, manufacturer=manufacturer)
                db.add(brand)
        
        db.commit()
        
        # Categories
        categories_data = [
            ("BEV", "Beverages", None),
            ("FOOD", "Food & Snacks", None),
            ("PERS_CARE", "Personal Care", None),
            ("HOUSEHOLD", "Household", None),
            ("TOBACCO", "Tobacco", None),
            ("ALCOHOL", "Alcoholic Beverages", None),
            ("DAIRY", "Dairy Products", None),
            # Sub-categories
            ("SOFT_DRINKS", "Soft Drinks", "BEV"),
            ("INSTANT_NOODLES", "Instant Noodles", "FOOD"),
            ("SHAMPOO", "Shampoo", "PERS_CARE"),
            ("SOAP", "Soap", "PERS_CARE"),
            ("DETERGENT", "Detergent", "HOUSEHOLD"),
        ]
        
        for code, name, parent_code in categories_data:
            if not db.query(Category).filter(Category.code == code).first():
                parent_id = None
                if parent_code:
                    parent = db.query(Category).filter(Category.code == parent_code).first()
                    if parent:
                        parent_id = parent.id
                
                category = Category(code=code, name=name, parent_id=parent_id)
                db.add(category)
        
        db.commit()
        
        # Products
        products_data = [
            ("COKE-1.5L", "Coca-Cola 1.5L", "COKE", "SOFT_DRINKS", 1.5, "L", 35.0, 55.0),
            ("PEPSI-1.5L", "Pepsi 1.5L", "PEPSI", "SOFT_DRINKS", 1.5, "L", 33.0, 52.0),
            ("LUCKY-PANCIT", "Lucky Me! Pancit Canton", "LUCKY_ME", "INSTANT_NOODLES", 80, "g", 8.0, 12.0),
            ("PALMOLIVE-SH", "Palmolive Shampoo 170ml", "UNILEVER", "SHAMPOO", 170, "ml", 45.0, 75.0),
            ("MARLBORO-RED", "Marlboro Red", "MARLBORO", "TOBACCO", 20, "sticks", 85.0, 120.0),
            ("TANDUAY-700", "Tanduay Rhum 700ml", "TANDUAY", "ALCOHOL", 700, "ml", 180.0, 250.0),
            ("ALASKA-EVAP", "Alaska Evaporated Milk 370ml", "ALASKA", "DAIRY", 370, "ml", 22.0, 35.0),
        ]
        
        for sku, name, brand_code, category_code, size, unit, cost, price in products_data:
            if not db.query(Product).filter(Product.sku == sku).first():
                brand = db.query(Brand).filter(Brand.code == brand_code).first()
                category = db.query(Category).filter(Category.code == category_code).first()
                
                if brand and category:
                    product = Product(
                        sku=sku, name=name, size=str(size), unit=unit,
                        brand_id=brand.id, category_id=category.id,
                        cost_price=cost, selling_price=price
                    )
                    db.add(product)
        
        db.commit()
        print("✅ Retail reference data seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding retail data: {e}")
        raise
    finally:
        db.close()

def seed_stores():
    """Seed store data"""
    print("Seeding store data...")
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Store locations with coordinates
        stores_data = [
            ("STORE-MKT01", "Scout Store Makati CBD", "NCR", "MKT", 14.5547, 121.0244),
            ("STORE-BGC01", "Scout Store BGC", "NCR", "BGC", 14.5507, 121.0467),
            ("STORE-QC01", "Scout Store QC North", "NCR", "QC", 14.6760, 121.0437),
            ("STORE-QC02", "Scout Store QC South", "NCR", "QC", 14.6042, 121.0268),
            ("STORE-CAV01", "Scout Store Bacoor", "R04A", "BAC", 14.4593, 120.9427),
            ("STORE-LAG01", "Scout Store Santa Rosa", "R04A", "STA", 14.3123, 121.1114),
            ("STORE-CEB01", "Scout Store Cebu IT Park", "R07", "CEB", 10.3282, 123.9018),
            ("STORE-CEB02", "Scout Store Cebu Ayala", "R07", "CEB", 10.3191, 123.9054),
            ("STORE-DAV01", "Scout Store Davao Downtown", "R11", "DAV", 7.0731, 125.6128),
            ("STORE-DAV02", "Scout Store Davao Mall", "R11", "DAV", 7.0947, 125.6145),
        ]
        
        for code, name, region_code, city_code, lat, lng in stores_data:
            if not db.query(Store).filter(Store.code == code).first():
                region = db.query(Region).filter(Region.code == region_code).first()
                city = db.query(City).filter(City.code == city_code).first()
                
                if region and city:
                    store = Store(
                        code=code, name=name, region_id=region.id, city_id=city.id,
                        latitude=lat, longitude=lng,
                        address=f"{name} Address, {city.name}"
                    )
                    db.add(store)
        
        db.commit()
        print("✅ Store data seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding stores: {e}")
        raise
    finally:
        db.close()

def seed_sample_transactions():
    """Seed sample transaction data"""
    print("Seeding sample transaction data...")
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create sample customers
        customers_data = [
            ("CUST-001", "Juan Dela Cruz", "juan@email.com", "09171234567"),
            ("CUST-002", "Maria Santos", "maria@email.com", "09181234567"),
            ("CUST-003", "Pedro Rodriguez", "pedro@email.com", "09191234567"),
            ("CUST-004", "Ana Garcia", "ana@email.com", "09201234567"),
            ("CUST-005", "Luis Martinez", "luis@email.com", "09211234567"),
        ]
        
        for code, name, email, phone in customers_data:
            if not db.query(Customer).filter(Customer.customer_code == code).first():
                customer = Customer(customer_code=code, name=name, email=email, phone=phone)
                db.add(customer)
        
        db.commit()
        
        # Get all stores, products, and customers
        stores = db.query(Store).all()
        products = db.query(Product).all()
        customers = db.query(Customer).all()
        
        if not stores or not products:
            print("❌ No stores or products found. Please seed reference data first.")
            return
        
        # Generate transactions for the last 30 days
        transaction_count = 0
        start_date = datetime.now() - timedelta(days=30)
        
        for day in range(30):
            current_date = start_date + timedelta(days=day)
            
            # Generate 20-50 transactions per day
            daily_transactions = random.randint(20, 50)
            
            for _ in range(daily_transactions):
                store = random.choice(stores)
                customer = random.choice(customers) if random.random() > 0.3 else None  # 70% chance of customer
                
                transaction_code = f"TXN-{current_date.strftime('%Y%m%d')}-{transaction_count:06d}"
                transaction_count += 1
                
                # Create transaction
                transaction = Transaction(
                    transaction_code=transaction_code,
                    store_id=store.id,
                    customer_id=customer.id if customer else None,
                    transaction_date=current_date + timedelta(
                        hours=random.randint(8, 21),
                        minutes=random.randint(0, 59)
                    ),
                    total_amount=0,  # Will be calculated from items
                    payment_method=random.choice(["cash", "credit_card", "debit_card", "gcash", "paymaya"])
                )
                db.add(transaction)
                db.flush()  # Get transaction ID
                
                # Add transaction items
                num_items = random.randint(1, 5)
                total_amount = 0
                
                for _ in range(num_items):
                    product = random.choice(products)
                    quantity = random.randint(1, 3)
                    unit_price = float(product.selling_price)
                    total_price = quantity * unit_price
                    total_amount += total_price
                    
                    item = TransactionItem(
                        transaction_id=transaction.id,
                        product_id=product.id,
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=total_price
                    )
                    db.add(item)
                
                # Update transaction total
                transaction.total_amount = total_amount
        
        db.commit()
        print(f"✅ {transaction_count} sample transactions seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding transactions: {e}")
        raise
    finally:
        db.close()

def main():
    """Main setup function"""
    print("🚀 Setting up Scout Analytics retail database...")
    
    try:
        # Step 1: Create tables
        create_tables()
        
        # Step 2: Seed Philippine geography
        seed_philippine_geography()
        
        # Step 3: Seed retail reference data
        seed_retail_data()
        
        # Step 4: Seed stores
        seed_stores()
        
        # Step 5: Seed sample transactions
        seed_sample_transactions()
        
        print("🎉 Scout Analytics retail database setup completed successfully!")
        print("\n📊 Database contains:")
        print("  ✅ Philippine regional geography")
        print("  ✅ Retail brands, categories, and products")
        print("  ✅ Store locations across Philippines")
        print("  ✅ Sample transaction data (30 days)")
        print("\n🔗 API endpoints now available at /api/v1/")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()