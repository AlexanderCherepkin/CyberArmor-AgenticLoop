from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, checkout, health, payments, products, profile, rfq

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(checkout.router, prefix="/checkout", tags=["checkout"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(profile.router, prefix="/users", tags=["users"])
api_router.include_router(rfq.router, prefix="/rfq", tags=["rfq"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
