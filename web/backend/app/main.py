from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

app = FastAPI(
    title="LegalDocRAG API",
    description="Production-ready RAG system for legal documents",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api/v1", tags=["rag"])

@app.on_event("startup")
async def startup_event():
    logger.info("Starting LegalDocRAG API")
    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down LegalDocRAG API")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)