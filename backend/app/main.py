from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import (
    auth,
    users,
    locations,
    properties,
    units,
    photos,
    amenities,
    bookings,
    payments,
    reviews,
    wishlists,
    messages,
    admin,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="RESTful Backend API for SarPanah (سرپناه) Accommodation Reservation System",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under API v1 prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(properties.router, prefix=settings.API_V1_STR)
app.include_router(units.router, prefix=settings.API_V1_STR)
app.include_router(photos.router, prefix=settings.API_V1_STR)
app.include_router(amenities.router, prefix=settings.API_V1_STR)
app.include_router(bookings.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(wishlists.router, prefix=settings.API_V1_STR)
app.include_router(messages.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to SarPanah API",
        "docs": "/docs",
        "version": "1.0.0",
    }
