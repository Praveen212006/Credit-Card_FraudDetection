"""
CreditGuard AI - Dataset Router
Dataset exploration and analytics endpoints.
"""

from fastapi import APIRouter, Query, HTTPException
from app.services.dataset_service import dataset_service

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])


@router.get("/overview")
async def get_dataset_overview():
    """Complete dataset summary and statistics."""
    if not dataset_service.is_loaded:
        raise HTTPException(status_code=503, detail="Dataset not loaded")
    return dataset_service.get_overview()


@router.get("/records")
async def get_dataset_records(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=10, le=200, description="Records per page"),
    class_filter: int = Query(None, ge=0, le=1, description="Filter by class (0=legit, 1=fraud)"),
):
    """Paginated dataset records for the explorer table."""
    if not dataset_service.is_loaded:
        raise HTTPException(status_code=503, detail="Dataset not loaded")
    return dataset_service.get_records(
        page=page,
        page_size=page_size,
        class_filter=class_filter,
    )


@router.get("/distribution")
async def get_distribution():
    """Chart data: class distribution, amount histogram, time distribution."""
    if not dataset_service.is_loaded:
        raise HTTPException(status_code=503, detail="Dataset not loaded")
    return dataset_service.get_distribution_data()


@router.get("/correlation")
async def get_correlation():
    """Correlation matrix for selected features."""
    if not dataset_service.is_loaded:
        raise HTTPException(status_code=503, detail="Dataset not loaded")
    return dataset_service.get_correlation_matrix()
