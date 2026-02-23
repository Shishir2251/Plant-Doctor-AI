from fastapi import FastAPI
from fastapi.middleware import cors
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from app.routes.analysis import router as analysis_router

load_dotenv




ALLOWED_ORIGINS = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")

app = FastAPI(
    title="Plant Doctor AI",
    description="AI-powered plant health analysis using Google Gemini Vision",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analysis_router)

@app.get("/api/health")
async def health_check():
    api_key_set = bool (os.getenv("GEMINI_API_KEY", "").strip())
    return JSONResponse({
        "status": "ok",
        "service": "Plant Doctor AI",
        "gemini_api_configured": api_key_set,
        "message": "Backend is running!" if api_key_set else "⚠️ GEMINI_API_KEY not set in .env"
    })

@app.get("/")
async def root():
    return {"message": "🌿 Plant Doctor AI Backend is running. Visit /docs for API documentation."}