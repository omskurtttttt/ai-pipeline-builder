from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class PipelineCreate(BaseModel):
    name: str = "Untitled Pipeline"
    description: Optional[str] = ""
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []


class PipelineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    nodes: Optional[list[dict[str, Any]]] = None
    edges: Optional[list[dict[str, Any]]] = None


class PipelineResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    nodes: list[dict[str, Any]]
    edges: list[dict[str, Any]]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class PipelineListItem(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}
