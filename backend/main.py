import os
from dotenv import load_dotenv

# Load environment variables first before importing modules that depend on them
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.upload import router as upload_router
from backend.routes.keywords import router as keywords_router
from backend.routes.summary import router as summary_router
from backend.routes.chat import router as chat_router
from backend.routes.export import router as export_router

app = FastAPI(title="LectureLens API")

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router, prefix="/api")
app.include_router(keywords_router, prefix="/api")
app.include_router(summary_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(export_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "LectureLens API is running!"}