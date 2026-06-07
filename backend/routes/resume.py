from fastapi import APIRouter, UploadFile, File
import pdfplumber
from services.ai_service import analyze_resume_with_ai

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        text = ""

        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""

        if not text.strip():
            return {
                "success": False,
                "score": 0,
                "strengths": [],
                "improvements": ["Could not extract text from this PDF."],
                "missingSkills": [],
            }

        ai_result = analyze_resume_with_ai(text)

        if ai_result:
            return ai_result

        return {
            "success": False,
            "score": 0,
            "strengths": ["PDF text was extracted successfully."],
            "improvements": [
                "AI analysis is not active. Check Gemini API key or Gemini error in terminal.",
                "This is fallback only, not real resume analysis.",
            ],
            "missingSkills": [],
        }

    except Exception as e:
        return {
            "success": False,
            "score": 0,
            "strengths": [],
            "improvements": [f"Resume upload failed: {str(e)}"],
            "missingSkills": [],
        }