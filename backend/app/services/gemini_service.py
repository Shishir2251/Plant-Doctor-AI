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

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash"

ANALYSIS_PROMPT= """"
You are an PlantDoctor AI - an expert botanist and plant pathologist.

Carefully examine this plant image and perform a thorough health analysis.

Respond only with a valid JSON object(no markdown, no code blocks, just raw JSON)

{
  "is_healthy": true or false,
  "plant_name": "Identified plant name or 'Unknown Plant'",
  "status": "healthy" or "diseased" or "unknown",
  "summary": "A 1-2 sentence overall assessment",
  "confidence": "High / Medium / Low",
  "problems": ["List of detected problems, or empty array [] if healthy"],
  "reasons": ["List of visual reasons WHY each problem was detected — be specific about colors, spots, texture, wilting etc. Empty array if healthy"],
  "solutions": ["Step-by-step treatment and care instructions. Empty array if healthy"],
  "additional_tips": "Any extra care tips or prevention advice"
}

IMPORTANT RULES:
- If the plant looks perfectly healthy with no issues, set is_healthy=true, problems=[], reasons=[], solutions=[]
- Be specific: mention exact visual cues (yellowing leaves, brown spots, white powder, wilting stems etc.)
- Solutions must be actionable and practical
- If the image does not contain a plant, set status="unknown" and explain in summary
- Do NOT wrap JSON in ```json or any markdown
"""
def extract_json_from_response(text: str) -> dict:
    """Robustly extract JSON From Gemini's responssse."""
    
    try:
        return json.loads(text.strips())
    except json.JSONDecodeError:
        pass

    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    return{
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

    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured. Please add it to your .env file.")

    try:
        model = genai.GenerativeModel(MODEL_NAME)

        image = Image.open(io.BytesIO(image_bytes))

        response = model.generate_content(
            [ANALYSIS_PROMPT, image],
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,  
                max_output_tokens=1500,
            )
        )

        raw_text = response.text
        data = extract_json_from_response(raw_text)

        status = HealthStatus.HEALTHY if data.get("is_healthy") else HealthStatus.DISEASED
        if data.get("status") == "unknown":
            status = HealthStatus.UNKNOWN

        return PlantAnalysisResult(
            status=status,
            plant_name=data.get("plant_name", "Unknown Plant"),
            summary=data.get("summary", "No summary available."),
            is_healthy=data.get("is_healthy", False),
            problems=data.get("problems", []),
            reasons=data.get("reasons", []),
            solutions=data.get("solutions", []),
            confidence=data.get("confidence", "Medium"),
            additional_tips=data.get("additional_tips", "")
        )

    except Exception as e:
        raise RuntimeError(f"Gemini API error: {str(e)}")
    
async def analyse_video_frame(frame_bytes: bytes) -> PlantAnalysisResult:
    """Analyse the best frame extracted from a video."""
    return await analyse_plant_image(frame_bytes, mime_type="image/jpeg")
