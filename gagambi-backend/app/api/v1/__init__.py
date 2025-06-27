from fastapi import APIRouter
from app.api.v1 import auth, users, retail

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(retail.router, prefix="", tags=["retail-analytics"])