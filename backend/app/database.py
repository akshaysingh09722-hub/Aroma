import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# Setup engine with appropriate parameters for SQLite vs Postgres
database_url = settings.DATABASE_URL
connect_args = {}

if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    database_url,
    connect_args=connect_args,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency for database session lifecycle management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes tables on startup without requiring an external migration runner."""
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
