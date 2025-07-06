from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# Base schemas
class RegionBase(BaseModel):
    code: str = Field(..., max_length=20)
    name: str = Field(..., max_length=255)


class RegionCreate(RegionBase):
    pass


class RegionUpdate(RegionBase):
    code: Optional[str] = None
    name: Optional[str] = None


class Region(RegionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Province schemas
class ProvinceBase(BaseModel):
    code: str = Field(..., max_length=20)
    name: str = Field(..., max_length=255)
    region_id: int


class ProvinceCreate(ProvinceBase):
    pass


class Province(ProvinceBase):
    id: int
    created_at: datetime
    region: Optional[Region] = None

    class Config:
        from_attributes = True


# City schemas
class CityBase(BaseModel):
    code: str = Field(..., max_length=20)
    name: str = Field(..., max_length=255)
    province_id: int


class CityCreate(CityBase):
    pass


class City(CityBase):
    id: int
    created_at: datetime
    province: Optional[Province] = None

    class Config:
        from_attributes = True


# Store schemas
class StoreBase(BaseModel):
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region_id: int
    city_id: int
    is_active: bool = True


class StoreCreate(StoreBase):
    pass


class Store(StoreBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    region: Optional[Region] = None
    city: Optional[City] = None

    class Config:
        from_attributes = True


# Brand schemas
class BrandBase(BaseModel):
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    manufacturer: Optional[str] = None


class BrandCreate(BrandBase):
    pass


class Brand(BrandBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Category schemas
class CategoryBase(BaseModel):
    code: str = Field(..., max_length=50)
    name: str = Field(..., max_length=255)
    parent_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Product schemas
class ProductBase(BaseModel):
    sku: str = Field(..., max_length=100)
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    size: Optional[str] = None
    unit: Optional[str] = None
    brand_id: int
    category_id: int
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    brand: Optional[Brand] = None
    category: Optional[Category] = None

    class Config:
        from_attributes = True


# Customer schemas
class CustomerBase(BaseModel):
    customer_code: str = Field(..., max_length=50)
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None


class CustomerCreate(CustomerBase):
    pass


class Customer(CustomerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Transaction Item schemas
class TransactionItemBase(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    total_price: float
    discount_amount: float = 0.0


class TransactionItemCreate(TransactionItemBase):
    pass


class TransactionItem(TransactionItemBase):
    id: int
    transaction_id: int
    created_at: datetime
    product: Optional[Product] = None

    class Config:
        from_attributes = True


# Transaction schemas
class TransactionBase(BaseModel):
    transaction_code: str = Field(..., max_length=100)
    store_id: int
    customer_id: Optional[int] = None
    transaction_date: datetime
    total_amount: float
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    payment_method: Optional[str] = None
    status: str = 'completed'


class TransactionCreate(TransactionBase):
    items: List[TransactionItemCreate] = []


class Transaction(TransactionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    store: Optional[Store] = None
    customer: Optional[Customer] = None
    items: List[TransactionItem] = []

    class Config:
        from_attributes = True


# Analytics response schemas
class SalesByRegion(BaseModel):
    region_code: str
    region_name: str
    total_sales: float
    total_transactions: int
    total_stores: int
    growth_rate: Optional[float] = None


class SalesByBrand(BaseModel):
    brand_code: str
    brand_name: str
    total_sales: float
    total_quantity: float
    total_transactions: int
    market_share: Optional[float] = None


class SalesByCategory(BaseModel):
    category_code: str
    category_name: str
    total_sales: float
    total_quantity: float
    total_transactions: int


class TopSellingProduct(BaseModel):
    sku: str
    product_name: str
    brand_name: str
    category_name: str
    total_sales: float
    total_quantity: float
    total_transactions: int


class StorePerformance(BaseModel):
    store_code: str
    store_name: str
    region_name: str
    total_sales: float
    total_transactions: int
    avg_basket_size: float
    sales_growth: Optional[float] = None


class TransactionSummary(BaseModel):
    total_transactions: int
    total_sales: float
    avg_basket_size: float
    avg_items_per_transaction: float
    total_customers: int
    total_products_sold: int


class SalesTrend(BaseModel):
    date: datetime
    total_sales: float
    total_transactions: int
    avg_basket_size: float


class RFMSegment(BaseModel):
    customer_id: str
    customer_name: str
    recency: int
    frequency: int
    monetary: float
    segment: str
    clv: float
    loyalty_score: int