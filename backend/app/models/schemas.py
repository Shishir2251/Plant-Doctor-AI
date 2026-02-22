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
    summary : str
    is_healthy: bool
    problems: Optional[List[str]] = None
    reasons: Optional[List[str]] = None
    solutions: Optional[List[str]] = None
    confidence: Optional[List[str]] = None
    additional_tips: Optional[List[str]] = None

class AnalysisResponse(BaseModel):
    success: bool
    result: Optional[PlantAnalysisResult]= None
    error: Optional[str] = None
    filename: Optional[List[str]] = None
    file_type: Optional[List[str]] = None
