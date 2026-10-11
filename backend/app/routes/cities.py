from typing import List
from fastapi import APIRouter, Query
from ..schemas import CityItem
from ..services.aqi_service import aqi_service

router = APIRouter(prefix="/api/cities", tags=["Cities"])


@router.get("/search", response_model=List[CityItem])
def search_cities(q: str = Query("", description="City or country name to search")):
    return aqi_service.get_cities(q)


@router.get("", response_model=List[CityItem])
def list_cities():
    return aqi_service.get_cities()
