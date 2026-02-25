import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Pipeline
from schemas import PipelineCreate, PipelineUpdate, PipelineResponse, PipelineListItem

router = APIRouter(prefix="/api/pipelines", tags=["pipelines"])


@router.post("", response_model=PipelineResponse)
def create_pipeline(pipeline: PipelineCreate, db: Session = Depends(get_db)):
    db_pipeline = Pipeline(
        name=pipeline.name,
        description=pipeline.description,
        nodes_json=json.dumps(pipeline.nodes),
        edges_json=json.dumps(pipeline.edges),
    )
    db.add(db_pipeline)
    db.commit()
    db.refresh(db_pipeline)
    return _to_response(db_pipeline)


@router.get("", response_model=list[PipelineListItem])
def list_pipelines(db: Session = Depends(get_db)):
    pipelines = db.query(Pipeline).order_by(Pipeline.updated_at.desc()).all()
    return pipelines


@router.get("/{pipeline_id}", response_model=PipelineResponse)
def get_pipeline(pipeline_id: int, db: Session = Depends(get_db)):
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return _to_response(pipeline)


@router.put("/{pipeline_id}", response_model=PipelineResponse)
def update_pipeline(pipeline_id: int, pipeline: PipelineUpdate, db: Session = Depends(get_db)):
    db_pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not db_pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    if pipeline.name is not None:
        db_pipeline.name = pipeline.name
    if pipeline.description is not None:
        db_pipeline.description = pipeline.description
    if pipeline.nodes is not None:
        db_pipeline.nodes_json = json.dumps(pipeline.nodes)
    if pipeline.edges is not None:
        db_pipeline.edges_json = json.dumps(pipeline.edges)

    db.commit()
    db.refresh(db_pipeline)
    return _to_response(db_pipeline)


@router.delete("/{pipeline_id}")
def delete_pipeline(pipeline_id: int, db: Session = Depends(get_db)):
    db_pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not db_pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    db.delete(db_pipeline)
    db.commit()
    return {"message": "Pipeline deleted", "id": pipeline_id}


def _to_response(pipeline: Pipeline) -> dict:
    """Convert ORM model to response dict, parsing JSON strings."""
    return {
        "id": pipeline.id,
        "name": pipeline.name,
        "description": pipeline.description,
        "nodes": json.loads(pipeline.nodes_json),
        "edges": json.loads(pipeline.edges_json),
        "created_at": pipeline.created_at,
        "updated_at": pipeline.updated_at,
    }
