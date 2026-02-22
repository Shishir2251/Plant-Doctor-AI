from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import io
import cv2
import numpy as np
from PIL import Image
from app.services.gemini_service import analyse_plant_image, analyse_video_frame
from app.models.schemas import AnalysisResponse


router = APIRouter(prefix="/api/analyse", tags=["analysis"])

MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", 20))* 1024 * 1024

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/avi", "video/quicktime", "video/x-msvideo", "video/webm"}

def Validate_file_size(file_bytes: bytes):
    if len (file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large, Maximum Size is {MAX_FILE_SIZE//(1024*1024)}MB."
        )
def extract_best_frame (video_bytes:bytes)-> bytes:
    """Extract the sharpest frame from a video for analysis"""
    nparr = np.frombuffer(video_bytes, np.uint8)

    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
       tmp.write(video_bytes)
       tmp_path = tmp.name

    try:
        cap = cv2.VideoCapture(tmp_path)
        total_frames= int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        best_frame = None
        best_laplacian = -1
        sample_positions = [int(total_frames * i /10) for i in range (1,10)]

        for pos in sample_positions:
            cap.set(cv2.CAP_PROP_POS_FRAMES, pos)
            ret, frame = cap.read()
            if not ret:
                continue
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var > best_laplacian:
                best_laplacian = laplacian_var
                best_frame = frame
        cap.release()

        if best_frame is None:
            raise ValueError("Could not extract any frame from video")
        
        rgb_frame = cv2.cvtColor(best_frame, cv2.COLOR_BGR2RGB)
        PIL_img = Image.fromarray(rgb_frame)

        buf = io.BytesIO
        PIL_img.save(buf, format = "JPEG", quality =90)
        return buf.getvalue()
    
    finally:
        os.unlink(tmp_path)

@router.post("/image", response_model=AnalysisResponse)
async def analyse_image(file: UploadFile = File(...)):
    """Analyse a plant image and return health diagnosis."""

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: JPEG, PNG, WebP, GIF."
        )

    try:
        file_bytes = await file.read()
        Validate_file_size(file_bytes)

        result = await analyse_plant_image(file_bytes, mime_type=file.content_type)

        return AnalysisResponse(
            success=True,
            result=result,
            filename=file.filename,
            file_type="image"
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@router.post("/video", response_model=AnalysisResponse)
async def analyse_video(file: UploadFile = File(...)):
    """Extract best frame from video and analyse the plant."""

    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: MP4, AVI, MOV, WebM."
        )

    try:
        file_bytes = await file.read()
        Validate_file_size(file_bytes)

        frame_bytes = extract_best_frame(file_bytes)

        result = await analyse_video_frame(frame_bytes)

        return AnalysisResponse(
            success=True,
            result=result,
            filename=file.filename,
            file_type="video"
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")