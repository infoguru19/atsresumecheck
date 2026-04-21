import os
import re
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from parser import extract_text_from_file
from scorer import score_resume

app = FastAPI(title="ATS Resume Checker API", version="1.0.0")

# CORS — allow your Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://atsresumecheck.vercel.app",
        "http://localhost:5173",  # local dev
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
}

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@app.get("/")
async def root():
    return {"status": "ATS Resume Checker API is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5MB limit."
        )

    ext = ALLOWED_TYPES[file.content_type]
    tmp_path = None

    try:
        # Write to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        # Extract text
        text = extract_text_from_file(tmp_path, ext)

        if not text or len(text.strip()) < 50:
            raise HTTPException(
                status_code=422,
                detail="Could not extract readable text from the resume. Ensure it is not a scanned image-only PDF."
            )

        # Score the resume
        result = score_resume(text)
        return JSONResponse(content=result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
    finally:
        # ALWAYS delete the temp file — no storage
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
