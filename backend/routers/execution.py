import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Pipeline
from schemas import ExecutionRequest, ExecutionResponse
from executor import execute_pipeline

router = APIRouter(prefix="/api/execute", tags=["execution"])


@router.post("", response_model=ExecutionResponse)
def execute_adhoc(req: ExecutionRequest):
    """Execute a pipeline directly from provided nodes/edges (no save required)."""
    result = execute_pipeline(req.nodes, req.edges)
    return result


@router.post("/{pipeline_id}", response_model=ExecutionResponse)
def execute_saved(pipeline_id: int, db: Session = Depends(get_db)):
    """Execute a previously saved pipeline by ID."""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    nodes = json.loads(pipeline.nodes_json)
    edges = json.loads(pipeline.edges_json)
    result = execute_pipeline(nodes, edges)
    return result
