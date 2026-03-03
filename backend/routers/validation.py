from fastapi import APIRouter
from pydantic import BaseModel

from validator import validate_pipeline

router = APIRouter(prefix="/api/validate", tags=["validation"])


class ValidateRequest(BaseModel):
    nodes: list[dict]
    edges: list[dict]


@router.post("")
async def validate(req: ValidateRequest):
    """Validate a pipeline for common issues."""
    return validate_pipeline(req.nodes, req.edges)
