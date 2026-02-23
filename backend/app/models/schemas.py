from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    DISEASED = "diseased"
    UNKNOWN = "unknown"


class PlantAnalysisResult(BaseModel):
    status: HealthStatus
    plant_name: Optional[str] = None
    summary: str
    is_healthy: bool
    problems: Optional[List[str]] = []
    reasons: Optional[List[str]] = []
    solutions: Optional[List[str]] = []
    confidence: Optional[str] = None        # str — e.g. "High", "Medium", "Low"
    additional_tips: Optional[str] = None   # str — a plain text paragraph


class AnalysisResponse(BaseModel):
    success: bool
    result: Optional[PlantAnalysisResult] = None
    error: Optional[str] = None
    filename: Optional[str] = None
    file_type: Optional[str] = None