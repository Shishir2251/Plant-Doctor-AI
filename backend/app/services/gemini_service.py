import google.generativeai as genai
import json
import re
from PIL import Image
import io
import os
from dotenv import load_dotenv
from app.models.schemas import PlantAnalysisResult, HealthStatus

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash"

ANALYSIS_PROMPT = """
You are PlantDoctor AI — an expert botanist and plant pathologist.

Carefully examine this plant image and perform a thorough health analysis.

Respond ONLY with a valid JSON object (no markdown, no code blocks, just raw JSON) in this exact structure:

{
  "is_healthy": true or false,
  "plant_name": "Identified plant name or 'Unknown Plant'",
  "status": "healthy" or "diseased" or "unknown",
  "summary": "A 1-2 sentence overall assessment",
  "confidence": "High or Medium or Low",
  "problems": ["problem 1", "problem 2"],
  "reasons": ["visual reason 1", "visual reason 2"],
  "solutions": ["step 1", "step 2", "step 3"],
  "additional_tips": "A single paragraph of extra care tips"
}

IMPORTANT RULES:
- is_healthy must be boolean true or false
- confidence must be a plain string: "High", "Medium", or "Low"
- problems, reasons, solutions must be JSON arrays of strings
- additional_tips must be a plain string paragraph, NOT an array
- If the plant is healthy, set is_healthy=true and use empty arrays [] for problems, reasons, solutions
- Be specific about visual cues: yellowing leaves, brown spots, white powder, wilting stems etc.
- If the image has no plant, set status="unknown" and explain in summary
- Do NOT wrap JSON in ```json or any markdown code blocks
"""


def ensure_str(value, fallback: str = "") -> str:
    """Guarantee a string — join list items if Gemini returned a list."""
    if value is None:
        return fallback
    if isinstance(value, list):
        return " ".join(str(v) for v in value)
    return str(value)


def ensure_list(value, fallback=None) -> list:
    """Guarantee a list — wrap single string if Gemini returned a string."""
    if fallback is None:
        fallback = []
    if value is None:
        return fallback
    if isinstance(value, list):
        return [str(v) for v in value]
    if isinstance(value, str) and value.strip():
        return [value]
    return fallback


def extract_json_from_response(text: str) -> dict:
    """Robustly extract JSON from Gemini's response."""
    # Strip markdown code fences if present
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)

    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Find the first {...} block
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    return {
        "is_healthy": False,
        "plant_name": "Unknown",
        "status": "unknown",
        "summary": "Could not parse AI response. Please try again.",
        "confidence": "Low",
        "problems": ["Analysis failed"],
        "reasons": ["The AI response was not in the expected format"],
        "solutions": ["Please re-upload the image and try again"],
        "additional_tips": ""
    }


async def analyse_plant_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> PlantAnalysisResult:
    """Send image to Gemini and get plant health analysis."""

    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        raise ValueError(
            "GEMINI_API_KEY is not set. "
            "Copy backend/.env.example to backend/.env and add your real key from "
            "https://aistudio.google.com/app/apikey"
        )

    try:
        model = genai.GenerativeModel(MODEL_NAME)
        image = Image.open(io.BytesIO(image_bytes))

        response = model.generate_content(
            [ANALYSIS_PROMPT, image],
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=1500,
            )
        )

        raw_text = response.text
        data = extract_json_from_response(raw_text)

        # Determine status
        is_healthy = bool(data.get("is_healthy", False))
        raw_status = data.get("status", "diseased" if not is_healthy else "healthy")
        if raw_status == "unknown":
            status = HealthStatus.UNKNOWN
        elif is_healthy:
            status = HealthStatus.HEALTHY
        else:
            status = HealthStatus.DISEASED

        # Coerce all fields to their expected types defensively
        return PlantAnalysisResult(
            status=status,
            plant_name=ensure_str(data.get("plant_name"), "Unknown Plant"),
            summary=ensure_str(data.get("summary"), "No summary available."),
            is_healthy=is_healthy,
            problems=ensure_list(data.get("problems")),
            reasons=ensure_list(data.get("reasons")),
            solutions=ensure_list(data.get("solutions")),
            confidence=ensure_str(data.get("confidence"), "Medium"),
            additional_tips=ensure_str(data.get("additional_tips"), ""),
        )

    except ValueError:
        raise

    except Exception as e:
        error_msg = str(e)
        if "API_KEY_INVALID" in error_msg or ("invalid" in error_msg.lower() and "key" in error_msg.lower()):
            raise RuntimeError(
                "Invalid Gemini API key. Check your key at https://aistudio.google.com/app/apikey"
            )
        elif "quota" in error_msg.lower() or "429" in error_msg:
            raise RuntimeError(
                "Gemini API rate limit reached (free tier: 15 req/min). Wait a moment and try again."
            )
        elif "SAFETY" in error_msg:
            raise RuntimeError(
                "Image was blocked by Gemini safety filters. Try a clearer photo of the plant."
            )
        else:
            raise RuntimeError(f"Gemini API error: {error_msg}")


async def analyse_video_frame(frame_bytes: bytes) -> PlantAnalysisResult:
    """Analyse the best frame extracted from a video."""
    return await analyse_plant_image(frame_bytes, mime_type="image/jpeg")