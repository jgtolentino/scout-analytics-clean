from fastapi import APIRouter
from app.api.v1 import auth, users, retail, analytics, prd

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["scout-analytics"])
api_router.include_router(prd.router, prefix="/prd", tags=["documentation"])
api_router.include_router(retail.router, prefix="/retail", tags=["retail-data"])