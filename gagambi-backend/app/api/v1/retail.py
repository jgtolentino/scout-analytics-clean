from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import retail as crud
from app.schemas import retail as schemas

router = APIRouter()

# Geography endpoints
@router.get("/geography/regions", response_model=List[schemas.Region])
def get_regions(db: Session = Depends(get_db)):
    """Get all regions."""
    return crud.region.get_all(db)


@router.get("/geography/provinces", response_model=List[schemas.Province])
def get_provinces(
    region_id: Optional[int] = Query(None, description="Filter by region ID"),
    db: Session = Depends(get_db)
):
    """Get provinces, optionally filtered by region."""
    if region_id:
        return crud.province.get_by_region(db, region_id=region_id)
    return []


@router.get("/geography/cities", response_model=List[schemas.City])
def get_cities(
    province_id: Optional[int] = Query(None, description="Filter by province ID"),
    db: Session = Depends(get_db)
):
    """Get cities, optionally filtered by province."""
    if province_id:
        return crud.city.get_by_province(db, province_id=province_id)
    return []


# Store endpoints
@router.get("/stores/by-region", response_model=List[schemas.Store])
def get_stores_by_region(
    region_id: Optional[int] = Query(None, description="Filter by region ID"),
    db: Session = Depends(get_db)
):
    """Get stores by region."""
    if region_id:
        return crud.store.get_by_region(db, region_id=region_id)
    return crud.store.get_all(db)


@router.get("/stores/performance", response_model=List[schemas.StorePerformance])
def get_store_performance(
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    db: Session = Depends(get_db)
):
    """Get store performance metrics."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.analytics.get_store_performance(db, start_date=start_date, end_date=end_date)


# Sales analytics endpoints
@router.get("/sales/by-region", response_model=List[schemas.SalesByRegion])
def get_sales_by_region(
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    db: Session = Depends(get_db)
):
    """Get sales data aggregated by region."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.analytics.get_sales_by_region(db, start_date=start_date, end_date=end_date)


@router.get("/sales/by-brand", response_model=List[schemas.SalesByBrand])
def get_sales_by_brand(
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    db: Session = Depends(get_db)
):
    """Get sales data aggregated by brand."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.analytics.get_sales_by_brand(db, start_date=start_date, end_date=end_date)


@router.get("/sales/by-category", response_model=List[schemas.SalesByCategory])
def get_sales_by_category(
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    db: Session = Depends(get_db)
):
    """Get sales data aggregated by category."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.analytics.get_sales_by_category(db, start_date=start_date, end_date=end_date)


@router.get("/sales/trends", response_model=List[schemas.SalesTrend])
def get_sales_trends(
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    granularity: str = Query("day", description="Granularity: day, week, month"),
    db: Session = Depends(get_db)
):
    """Get sales trends over time."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.analytics.get_sales_trends(
        db, start_date=start_date, end_date=end_date, granularity=granularity
    )


# Product endpoints
@router.get("/products/top-selling", response_model=List[schemas.TopSellingProduct])
def get_top_selling_products(
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    limit: int = Query(10, description="Number of top products to return"),
    db: Session = Depends(get_db)
):
    """Get top selling products."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.analytics.get_top_selling_products(
        db, start_date=start_date, end_date=end_date, limit=limit
    )


@router.get("/products/by-category", response_model=List[schemas.Product])
def get_products_by_category(
    category_id: int = Query(..., description="Category ID"),
    db: Session = Depends(get_db)
):
    """Get products by category."""
    return crud.product.get_by_category(db, category_id=category_id)


@router.get("/products/brand-performance", response_model=List[schemas.SalesByBrand])
def get_brand_performance(
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    db: Session = Depends(get_db)
):
    """Get brand performance metrics."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.analytics.get_sales_by_brand(db, start_date=start_date, end_date=end_date)


# Transaction endpoints
@router.get("/transactions/summary", response_model=schemas.TransactionSummary)
def get_transaction_summary(
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    db: Session = Depends(get_db)
):
    """Get transaction summary statistics."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.analytics.get_transaction_summary(db, start_date=start_date, end_date=end_date)


@router.get("/transactions/trends", response_model=List[schemas.SalesTrend])
def get_transaction_trends(
    start_date: Optional[datetime] = Query(None, description="Start date for analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for analysis"),
    granularity: str = Query("day", description="Granularity: day, week, month"),
    db: Session = Depends(get_db)
):
    """Get transaction trends over time."""
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.analytics.get_sales_trends(
        db, start_date=start_date, end_date=end_date, granularity=granularity
    )


# CRUD endpoints for data management
@router.post("/regions", response_model=schemas.Region)
def create_region(
    region: schemas.RegionCreate,
    db: Session = Depends(get_db)
):
    """Create a new region."""
    # Check if region code already exists
    existing = crud.region.get_by_code(db, code=region.code)
    if existing:
        raise HTTPException(status_code=400, detail="Region code already exists")
    
    return crud.region.create(db, obj_in=region)


@router.post("/stores", response_model=schemas.Store)
def create_store(
    store: schemas.StoreCreate,
    db: Session = Depends(get_db)
):
    """Create a new store."""
    return crud.store.create(db, obj_in=store)


@router.post("/brands", response_model=schemas.Brand)
def create_brand(
    brand: schemas.BrandCreate,
    db: Session = Depends(get_db)
):
    """Create a new brand."""
    return crud.brand.create(db, obj_in=brand)


@router.post("/categories", response_model=schemas.Category)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db)
):
    """Create a new category."""
    return crud.category.create(db, obj_in=category)


@router.post("/products", response_model=schemas.Product)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    """Create a new product."""
    return crud.product.create(db, obj_in=product)


@router.post("/customers", response_model=schemas.Customer)
def create_customer(
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db)
):
    """Create a new customer."""
    # Check if customer code already exists
    existing = crud.customer.get_by_code(db, customer_code=customer.customer_code)
    if existing:
        raise HTTPException(status_code=400, detail="Customer code already exists")
    
    return crud.customer.create(db, obj_in=customer)


@router.post("/transactions", response_model=schemas.Transaction)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a new transaction with items."""
    return crud.transaction.create(db, obj_in=transaction)


# List endpoints
@router.get("/brands", response_model=List[schemas.Brand])
def get_brands(db: Session = Depends(get_db)):
    """Get all brands."""
    return crud.brand.get_all(db)


@router.get("/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    """Get all categories."""
    return crud.category.get_all(db)


@router.get("/products", response_model=List[schemas.Product])
def get_products(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """Get products with pagination."""
    return crud.product.get_all(db, skip=skip, limit=limit)


@router.get("/customers", response_model=List[schemas.Customer])
def get_customers(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """Get customers with pagination."""
    return crud.customer.get_all(db, skip=skip, limit=limit)


@router.get("/transactions", response_model=List[schemas.Transaction])
def get_transactions(
    days: int = Query(30, description="Number of recent days to fetch"),
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(100, description="Maximum number of records to return"),
    db: Session = Depends(get_db)
):
    """Get recent transactions with pagination."""
    return crud.transaction.get_recent(db, days=days, skip=skip, limit=limit)