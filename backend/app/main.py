from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, users, events, categories, venues, registrations, attendance, certificates, notifications, favorites, feedback, analytics, ai, admin

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex="https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Routers will be included here
app.include_router(auth.router, prefix=settings.API_V1_STR + "/auth", tags=["auth"])
app.include_router(users.router, prefix=settings.API_V1_STR + "/users", tags=["users"])
app.include_router(events.router, prefix=settings.API_V1_STR + "/events", tags=["events"])
app.include_router(categories.router, prefix=settings.API_V1_STR + "/categories", tags=["categories"])
app.include_router(venues.router, prefix=settings.API_V1_STR + "/venues", tags=["venues"])
app.include_router(registrations.router, prefix=settings.API_V1_STR + "/registrations", tags=["registrations"])
app.include_router(attendance.router, prefix=settings.API_V1_STR + "/attendance", tags=["attendance"])
app.include_router(certificates.router, prefix=settings.API_V1_STR + "/certificates", tags=["certificates"])
app.include_router(notifications.router, prefix=settings.API_V1_STR + "/notifications", tags=["notifications"])
app.include_router(favorites.router, prefix=settings.API_V1_STR + "/favorites", tags=["favorites"])
app.include_router(feedback.router, prefix=settings.API_V1_STR + "/feedback", tags=["feedback"])
app.include_router(analytics.router, prefix=settings.API_V1_STR + "/analytics", tags=["analytics"])
app.include_router(ai.router, prefix=settings.API_V1_STR + "/ai", tags=["ai"])
app.include_router(admin.router, prefix=settings.API_V1_STR + "/admin", tags=["admin"])

@app.get("/")
def root():
    return {"message": "Welcome to CampusConnect API"}
