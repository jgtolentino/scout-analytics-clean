from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, extract
from datetime import datetime, timedelta

from app.models.retail import (
    Region, Province, City, Store, Brand, Category, Product, 
    Customer, Transaction, TransactionItem, Inventory
)
from app.schemas.retail import (
    RegionCreate, ProvinceCreate, CityCreate, StoreCreate,
    BrandCreate, CategoryCreate, ProductCreate, CustomerCreate,
    TransactionCreate, SalesByRegion, SalesByBrand, SalesByCategory,
    TopSellingProduct, StorePerformance, TransactionSummary, SalesTrend
)


class CRUDRegion:
    def get_all(self, db: Session) -> List[Region]:
        return db.query(Region).all()
    
    def get_by_code(self, db: Session, code: str) -> Optional[Region]:
        return db.query(Region).filter(Region.code == code).first()
    
    def create(self, db: Session, obj_in: RegionCreate) -> Region:
        db_obj = Region(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDProvince:
    def get_by_region(self, db: Session, region_id: int) -> List[Province]:
        return db.query(Province).filter(Province.region_id == region_id).all()
    
    def create(self, db: Session, obj_in: ProvinceCreate) -> Province:
        db_obj = Province(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDCity:
    def get_by_province(self, db: Session, province_id: int) -> List[City]:
        return db.query(City).filter(City.province_id == province_id).all()
    
    def create(self, db: Session, obj_in: CityCreate) -> City:
        db_obj = City(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDStore:
    def get_all(self, db: Session) -> List[Store]:
        return db.query(Store).filter(Store.is_active == True).all()
    
    def get_by_region(self, db: Session, region_id: int) -> List[Store]:
        return db.query(Store).filter(
            and_(Store.region_id == region_id, Store.is_active == True)
        ).all()
    
    def create(self, db: Session, obj_in: StoreCreate) -> Store:
        db_obj = Store(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDBrand:
    def get_all(self, db: Session) -> List[Brand]:
        return db.query(Brand).all()
    
    def create(self, db: Session, obj_in: BrandCreate) -> Brand:
        db_obj = Brand(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDCategory:
    def get_all(self, db: Session) -> List[Category]:
        return db.query(Category).all()
    
    def create(self, db: Session, obj_in: CategoryCreate) -> Category:
        db_obj = Category(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDProduct:
    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
        return db.query(Product).filter(Product.is_active == True).offset(skip).limit(limit).all()
    
    def get_by_category(self, db: Session, category_id: int) -> List[Product]:
        return db.query(Product).filter(
            and_(Product.category_id == category_id, Product.is_active == True)
        ).all()
    
    def create(self, db: Session, obj_in: ProductCreate) -> Product:
        db_obj = Product(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDCustomer:
    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
        return db.query(Customer).offset(skip).limit(limit).all()
    
    def get_by_code(self, db: Session, customer_code: str) -> Optional[Customer]:
        return db.query(Customer).filter(Customer.customer_code == customer_code).first()
    
    def create(self, db: Session, obj_in: CustomerCreate) -> Customer:
        db_obj = Customer(**obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDTransaction:
    def get_recent(self, db: Session, days: int = 30, skip: int = 0, limit: int = 100) -> List[Transaction]:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        return db.query(Transaction).filter(
            Transaction.transaction_date >= cutoff_date
        ).order_by(desc(Transaction.transaction_date)).offset(skip).limit(limit).all()
    
    def create(self, db: Session, obj_in: TransactionCreate) -> Transaction:
        # Create transaction
        transaction_data = obj_in.dict()
        items_data = transaction_data.pop('items', [])
        
        db_transaction = Transaction(**transaction_data)
        db.add(db_transaction)
        db.flush()  # Flush to get the ID
        
        # Create transaction items
        for item_data in items_data:
            db_item = TransactionItem(
                transaction_id=db_transaction.id,
                **item_data
            )
            db.add(db_item)
        
        db.commit()
        db.refresh(db_transaction)
        return db_transaction


class CRUDAnalytics:
    def get_sales_by_region(self, db: Session, start_date: datetime, end_date: datetime) -> List[SalesByRegion]:
        results = db.query(
            Region.code.label('region_code'),
            Region.name.label('region_name'),
            func.sum(Transaction.total_amount).label('total_sales'),
            func.count(Transaction.id).label('total_transactions'),
            func.count(func.distinct(Store.id)).label('total_stores')
        ).join(
            Store, Region.id == Store.region_id
        ).join(
            Transaction, Store.id == Transaction.store_id
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed'
            )
        ).group_by(
            Region.code, Region.name
        ).all()
        
        return [
            SalesByRegion(
                region_code=r.region_code,
                region_name=r.region_name,
                total_sales=float(r.total_sales or 0),
                total_transactions=r.total_transactions,
                total_stores=r.total_stores
            ) for r in results
        ]
    
    def get_sales_by_brand(self, db: Session, start_date: datetime, end_date: datetime) -> List[SalesByBrand]:
        results = db.query(
            Brand.code.label('brand_code'),
            Brand.name.label('brand_name'),
            func.sum(TransactionItem.total_price).label('total_sales'),
            func.sum(TransactionItem.quantity).label('total_quantity'),
            func.count(func.distinct(Transaction.id)).label('total_transactions')
        ).join(
            Product, Brand.id == Product.brand_id
        ).join(
            TransactionItem, Product.id == TransactionItem.product_id
        ).join(
            Transaction, TransactionItem.transaction_id == Transaction.id
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed'
            )
        ).group_by(
            Brand.code, Brand.name
        ).all()
        
        return [
            SalesByBrand(
                brand_code=r.brand_code,
                brand_name=r.brand_name,
                total_sales=float(r.total_sales or 0),
                total_quantity=float(r.total_quantity or 0),
                total_transactions=r.total_transactions
            ) for r in results
        ]
    
    def get_sales_by_category(self, db: Session, start_date: datetime, end_date: datetime) -> List[SalesByCategory]:
        results = db.query(
            Category.code.label('category_code'),
            Category.name.label('category_name'),
            func.sum(TransactionItem.total_price).label('total_sales'),
            func.sum(TransactionItem.quantity).label('total_quantity'),
            func.count(func.distinct(Transaction.id)).label('total_transactions')
        ).join(
            Product, Category.id == Product.category_id
        ).join(
            TransactionItem, Product.id == TransactionItem.product_id
        ).join(
            Transaction, TransactionItem.transaction_id == Transaction.id
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed'
            )
        ).group_by(
            Category.code, Category.name
        ).all()
        
        return [
            SalesByCategory(
                category_code=r.category_code,
                category_name=r.category_name,
                total_sales=float(r.total_sales or 0),
                total_quantity=float(r.total_quantity or 0),
                total_transactions=r.total_transactions
            ) for r in results
        ]
    
    def get_top_selling_products(self, db: Session, start_date: datetime, end_date: datetime, limit: int = 10) -> List[TopSellingProduct]:
        results = db.query(
            Product.sku,
            Product.name.label('product_name'),
            Brand.name.label('brand_name'),
            Category.name.label('category_name'),
            func.sum(TransactionItem.total_price).label('total_sales'),
            func.sum(TransactionItem.quantity).label('total_quantity'),
            func.count(func.distinct(Transaction.id)).label('total_transactions')
        ).join(
            Brand, Product.brand_id == Brand.id
        ).join(
            Category, Product.category_id == Category.id
        ).join(
            TransactionItem, Product.id == TransactionItem.product_id
        ).join(
            Transaction, TransactionItem.transaction_id == Transaction.id
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed'
            )
        ).group_by(
            Product.sku, Product.name, Brand.name, Category.name
        ).order_by(
            desc(func.sum(TransactionItem.total_price))
        ).limit(limit).all()
        
        return [
            TopSellingProduct(
                sku=r.sku,
                product_name=r.product_name,
                brand_name=r.brand_name,
                category_name=r.category_name,
                total_sales=float(r.total_sales or 0),
                total_quantity=float(r.total_quantity or 0),
                total_transactions=r.total_transactions
            ) for r in results
        ]
    
    def get_store_performance(self, db: Session, start_date: datetime, end_date: datetime) -> List[StorePerformance]:
        results = db.query(
            Store.code.label('store_code'),
            Store.name.label('store_name'),
            Region.name.label('region_name'),
            func.sum(Transaction.total_amount).label('total_sales'),
            func.count(Transaction.id).label('total_transactions'),
            func.avg(Transaction.total_amount).label('avg_basket_size')
        ).join(
            Region, Store.region_id == Region.id
        ).join(
            Transaction, Store.id == Transaction.store_id
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed'
            )
        ).group_by(
            Store.code, Store.name, Region.name
        ).all()
        
        return [
            StorePerformance(
                store_code=r.store_code,
                store_name=r.store_name,
                region_name=r.region_name,
                total_sales=float(r.total_sales or 0),
                total_transactions=r.total_transactions,
                avg_basket_size=float(r.avg_basket_size or 0)
            ) for r in results
        ]
    
    def get_transaction_summary(self, db: Session, start_date: datetime, end_date: datetime) -> TransactionSummary:
        # Main transaction stats
        transaction_stats = db.query(
            func.count(Transaction.id).label('total_transactions'),
            func.sum(Transaction.total_amount).label('total_sales'),
            func.avg(Transaction.total_amount).label('avg_basket_size')
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed'
            )
        ).first()
        
        # Average items per transaction
        avg_items = db.query(
            func.avg(func.count(TransactionItem.id))
        ).join(
            Transaction, TransactionItem.transaction_id == Transaction.id
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed'
            )
        ).group_by(Transaction.id).scalar() or 0
        
        # Unique customers and products
        unique_customers = db.query(
            func.count(func.distinct(Transaction.customer_id))
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed',
                Transaction.customer_id.isnot(None)
            )
        ).scalar() or 0
        
        unique_products = db.query(
            func.count(func.distinct(TransactionItem.product_id))
        ).join(
            Transaction, TransactionItem.transaction_id == Transaction.id
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed'
            )
        ).scalar() or 0
        
        return TransactionSummary(
            total_transactions=transaction_stats.total_transactions or 0,
            total_sales=float(transaction_stats.total_sales or 0),
            avg_basket_size=float(transaction_stats.avg_basket_size or 0),
            avg_items_per_transaction=float(avg_items),
            total_customers=unique_customers,
            total_products_sold=unique_products
        )
    
    def get_sales_trends(self, db: Session, start_date: datetime, end_date: datetime, granularity: str = 'day') -> List[SalesTrend]:
        # Determine date truncation based on granularity
        if granularity == 'day':
            date_trunc = func.date(Transaction.transaction_date)
        elif granularity == 'week':
            date_trunc = func.date_trunc('week', Transaction.transaction_date)
        elif granularity == 'month':
            date_trunc = func.date_trunc('month', Transaction.transaction_date)
        else:
            date_trunc = func.date(Transaction.transaction_date)
        
        results = db.query(
            date_trunc.label('date'),
            func.sum(Transaction.total_amount).label('total_sales'),
            func.count(Transaction.id).label('total_transactions'),
            func.avg(Transaction.total_amount).label('avg_basket_size')
        ).filter(
            and_(
                Transaction.transaction_date >= start_date,
                Transaction.transaction_date <= end_date,
                Transaction.status == 'completed'
            )
        ).group_by(
            date_trunc
        ).order_by(
            date_trunc
        ).all()
        
        return [
            SalesTrend(
                date=r.date,
                total_sales=float(r.total_sales or 0),
                total_transactions=r.total_transactions,
                avg_basket_size=float(r.avg_basket_size or 0)
            ) for r in results
        ]


# Create instances
region = CRUDRegion()
province = CRUDProvince()
city = CRUDCity()
store = CRUDStore()
brand = CRUDBrand()
category = CRUDCategory()
product = CRUDProduct()
customer = CRUDCustomer()
transaction = CRUDTransaction()
analytics = CRUDAnalytics()