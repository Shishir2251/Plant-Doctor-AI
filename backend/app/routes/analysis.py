from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import io
import cv2
import numpy as np
from PIL import Image
from app.services.gemini_service import analyse_plant_image
from app.models.schemas import AnalysisResponse