from fastapi import APIRouter, UploadFile, File, Form
import pdfplumber
from services.ai_service import analyze_ats_with_ai

router = APIRouter()


@router.post("/check")
async def check_ats(
    file: UploadFile = File(...),
    jobDescription: str = Form(...)
):
    try:
        resume_text = ""

        with pdfplumber.open(file.file) as pdf:
            for page in pdf.pages:
                resume_text += page.extract_text() or ""

        if not resume_text.strip():
            return {
                "success": False,
                "atsScore": 0,
                "matchedKeywords": [],
                "missingKeywords": [],
                "suggestions": ["Could not extract text from resume PDF."],
            }

        ai_result = analyze_ats_with_ai(resume_text, jobDescription)

        if ai_result:
            return ai_result

        return {
            "success": False,
            "atsScore": 0,
            "matchedKeywords": [],
            "missingKeywords": [],
            "suggestions": [
                "AI ATS analysis failed. Check Gemini API error in terminal."
            ],
        }

    except Exception as e:
        return {
            "success": False,
            "atsScore": 0,
            "matchedKeywords": [],
            "missingKeywords": [],
            "suggestions": [f"ATS check failed: {str(e)}"],
        }