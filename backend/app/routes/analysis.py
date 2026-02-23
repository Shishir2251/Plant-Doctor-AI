from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import io
import tempfile
import cv2
import numpy as np
from PIL import Image
from app.services.gemini_service import analyse_plant_image, analyse_video_frame
from app.models.schemas import AnalysisResponse

router = APIRouter(prefix="/api/analyse", tags=["analysis"])

MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", 20)) * 1024 * 1024

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/avi", "video/quicktime", "video/x-msvideo", "video/webm"}


def validate_file_size(file_bytes: bytes):
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB."
        )


def extract_best_frame(video_bytes: bytes) -> bytes:
    """Write video to a real temp file, extract the sharpest frame, return as JPEG bytes."""

    # Write to a named temp file with delete=False so OpenCV can open it by path
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".mp4")
    try:
        # Write bytes using the file descriptor, then close it before OpenCV opens it
        with os.fdopen(tmp_fd, "wb") as f:
            f.write(video_bytes)
        # tmp_fd is now closed — OpenCV can open the path safely on Windows

        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file. Please try a different format (MP4 recommended).")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            # Fallback: just grab the very first readable frame
            ret, frame = cap.read()
            cap.release()
            if not ret or frame is None:
                raise ValueError("Could not read any frames from the video.")
            best_frame = frame
        else:
            best_frame = None
            best_laplacian = -1

            # Sample up to 10 evenly spaced frames and pick the sharpest
            sample_count = min(10, total_frames)
            positions = [int(total_frames * i / sample_count) for i in range(sample_count)]

            for pos in positions:
                cap.set(cv2.CAP_PROP_POS_FRAMES, pos)
                ret, frame = cap.read()
                if not ret or frame is None:
                    continue
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
                if sharpness > best_laplacian:
                    best_laplacian = sharpness
                    best_frame = frame

            cap.release()

            if best_frame is None:
                raise ValueError("Could not extract any usable frame from the video.")

        # Convert BGR → RGB → JPEG bytes
        rgb = cv2.cvtColor(best_frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)
        buf = io.BytesIO()
        pil_img.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    finally:
        # Always clean up the temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


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
        validate_file_size(file_bytes)

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
        validate_file_size(file_bytes)

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