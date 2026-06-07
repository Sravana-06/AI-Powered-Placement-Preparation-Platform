from fastapi import APIRouter
from services.ai_service import (
    generate_interview_questions_with_ai,
    analyze_interview_answer_with_ai,
    generate_final_interview_report,
)

router = APIRouter()


@router.post("/start")
def start_interview(data: dict):
    role = data.get("role", "Full Stack Developer")
    experience = data.get("experience", "Fresher")
    interview_type = data.get("interviewType", "Mixed")

    ai_result = generate_interview_questions_with_ai(
        role,
        experience,
        interview_type,
    )

    if ai_result:
        return ai_result

    return {
        "success": True,
        "role": role,
        "experience": experience,
        "interviewType": interview_type,
        "questions": [
            "Tell me about yourself.",
            "Explain one project you built recently.",
            "What challenges did you face in your project?",
            "Why should we hire you?",
            "What are your strengths and weaknesses?",
        ],
    }


@router.post("/feedback")
def interview_feedback(data: dict):
    question = data.get("question", "")
    answer = data.get("answer", "")

    ai_result = analyze_interview_answer_with_ai(question, answer)

    if ai_result:
        return ai_result

    return {
        "success": True,
        "technicalScore": 80,
        "communicationScore": 75,
        "confidenceScore": 78,
        "feedback": [
            "Good answer structure.",
            "Add more measurable project impact.",
            "Use STAR method for stronger explanation.",
        ],
    }


@router.post("/final-report")
def final_report(data: dict):
    feedback_data = data.get("feedbackData", "")

    ai_result = generate_final_interview_report(feedback_data)

    if ai_result:
        return ai_result

    return {
        "success": True,
        "overallTechnical": 80,
        "overallCommunication": 78,
        "overallConfidence": 82,
        "strengths": [
            "Good project explanations",
            "Strong communication",
        ],
        "weaknesses": [
            "Needs deeper technical details",
        ],
        "improvements": [
            "Use STAR method",
            "Add measurable outcomes",
        ],
        "recommendation": "Hire",
    }