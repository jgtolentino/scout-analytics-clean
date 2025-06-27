from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db

router = APIRouter()

@router.get("/scout-analytics", response_model=Dict[str, Any])
def get_scout_analytics_data(db: Session = Depends(get_db)):
    """
    Single unified endpoint providing all Scout Analytics data.
    This serves as the data abstraction layer (DAL) for the entire dashboard.
    """
    
    # Mock data that matches Scout Analytics requirements
    # In production, this would query the database and return real data
    analytics_data = {
        "overview": {
            "total_sales": 20200000,
            "total_transactions": 52101,
            "active_stores": 138,
            "avg_basket_size": 387,
            "growth_rate": 12.5
        },
        
        "geographic_analytics": {
            "sales_by_region": [
                {"region_code": "NCR", "region_name": "National Capital Region", "total_sales": 8500000, "total_transactions": 18500, "stores": 45},
                {"region_code": "R03", "region_name": "Central Luzon", "total_sales": 3200000, "total_transactions": 9800, "stores": 28},
                {"region_code": "R04A", "region_name": "CALABARZON", "total_sales": 4100000, "total_transactions": 12200, "stores": 32},
                {"region_code": "R07", "region_name": "Central Visayas", "total_sales": 2800000, "total_transactions": 7800, "stores": 18},
                {"region_code": "R11", "region_name": "Davao Region", "total_sales": 1600000, "total_transactions": 3801, "stores": 15}
            ],
            "store_locations": [
                {"store_id": "STORE-MKT01", "name": "Scout Store Makati CBD", "lat": 14.5547, "lng": 121.0244, "sales": 850000},
                {"store_id": "STORE-BGC01", "name": "Scout Store BGC", "lat": 14.5507, "lng": 121.0467, "sales": 920000},
                {"store_id": "STORE-QC01", "name": "Scout Store QC North", "lat": 14.6760, "lng": 121.0437, "sales": 780000}
            ]
        },
        
        "financial_metrics": {
            "revenue_breakdown": {
                "gross_revenue": 20200000,
                "net_revenue": 18500000,
                "profit_margin": 0.285,
                "monthly_growth": 0.125
            },
            "sales_trends": [
                {"date": "2024-12-01", "sales": 650000, "transactions": 1680},
                {"date": "2024-12-02", "sales": 720000, "transactions": 1850},
                {"date": "2024-12-03", "sales": 580000, "transactions": 1520}
            ]
        },
        
        "product_intelligence": {
            "bcg_matrix": [
                {"name": "Coke 1.5L", "market_share": 28, "growth_rate": 22, "revenue": 3200000, "category": "Beverages", "quadrant": "star"},
                {"name": "Lucky Me! Pancit Canton", "market_share": 35, "growth_rate": 8, "revenue": 2100000, "category": "Food", "quadrant": "cash_cow"},
                {"name": "Palmolive Shampoo", "market_share": 8, "growth_rate": 25, "revenue": 850000, "category": "Personal Care", "quadrant": "question_mark"},
                {"name": "Marlboro Red", "market_share": 15, "growth_rate": -5, "revenue": 680000, "category": "Tobacco", "quadrant": "dog"}
            ],
            "top_products": [
                {"sku": "COKE-1.5L", "name": "Coca-Cola 1.5L", "sales": 3200000, "units_sold": 58182},
                {"sku": "LUCKY-PANCIT", "name": "Lucky Me! Pancit Canton", "sales": 2100000, "units_sold": 175000},
                {"sku": "PALMOLIVE-SH", "name": "Palmolive Shampoo 170ml", "sales": 850000, "units_sold": 11333}
            ]
        },
        
        "customer_intelligence": {
            "rfm_segments": [
                {"customer_id": "C001", "name": "Juan Dela Cruz", "recency": 5, "frequency": 15, "monetary": 850000, "segment": "Champions", "clv": 2500000, "loyalty_score": 95},
                {"customer_id": "C002", "name": "Maria Santos", "recency": 12, "frequency": 8, "monetary": 450000, "segment": "Loyal Customers", "clv": 1200000, "loyalty_score": 78},
                {"customer_id": "C003", "name": "Pedro Rodriguez", "recency": 25, "frequency": 3, "monetary": 120000, "segment": "At Risk", "clv": 350000, "loyalty_score": 45}
            ],
            "customer_metrics": {
                "total_customers": 12850,
                "active_customers": 8920,
                "avg_clv": 1250000,
                "retention_rate": 0.73
            }
        },
        
        "store_analytics": [
            {"store_code": "STORE-MKT01", "name": "Scout Store Makati CBD", "region": "NCR", "sales": 850000, "transactions": 2100, "avg_basket": 405, "growth": 15.2},
            {"store_code": "STORE-BGC01", "name": "Scout Store BGC", "region": "NCR", "sales": 920000, "transactions": 2350, "avg_basket": 391, "growth": 22.8},
            {"store_code": "STORE-QC01", "name": "Scout Store QC North", "region": "NCR", "sales": 780000, "transactions": 1890, "avg_basket": 413, "growth": 8.5}
        ]
    }
    
    return analytics_data