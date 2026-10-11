import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db
from .routes import health, cities, aqi, forecast, models_info

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("aerosense.main")


# Ensure database tables exist on module load as well as lifespan
init_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing AeroSense AI database and services...")
    init_db()
    logger.info("AeroSense AI backend started successfully.")
    yield
    logger.info("AeroSense AI backend shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Air Quality Monitoring, Machine Learning Forecasting, and 3D Visualization Backend API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware with explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router)
app.include_router(cities.router)
app.include_router(aqi.router)
app.include_router(forecast.router)
app.include_router(models_info.router)


@app.get("/", tags=["Root"])
def root_info():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health",
        "status": "operational",
        "description": "Visit /docs for the interactive OpenAPI documentation suite.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
