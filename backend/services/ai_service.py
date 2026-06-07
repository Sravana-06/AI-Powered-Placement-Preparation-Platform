import os
import json
import traceback
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("========== GEMINI DEBUG ==========")
print("Loaded Key:", api_key is not None)
print("==================================")

client = genai.Client(api_key=api_key) if api_key else None


def clean_json_response(text: str):
    cleaned = text.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```", "").strip()

    return json.loads(cleaned)


def analyze_resume_with_ai(resume_text: str):
    if not client:
        print("Gemini API key missing")
        return None

    prompt = f"""
You are a professional ATS resume reviewer and career mentor.

Analyze the uploaded document.

First decide whether it is actually a resume.

Return ONLY valid JSON. Do not include markdown.

If it is a resume, return:
{{
  "success": true,
  "score": number,
  "strengths": [
    "...",
    "...",
    "..."
  ],
  "improvements": [
    "...",
    "...",
    "..."
  ],
  "missingSkills": [
    "...",
    "...",
    "..."
  ]
}}

If it is NOT a resume, return:
{{
  "success": false,
  "score": 0,
  "strengths": [],
  "improvements": [
    "This document does not appear to be a resume. Please upload a resume PDF."
  ],
  "missingSkills": []
}}

Resume evaluation rules:
- Score must be realistic from 0 to 100.
- Check ATS friendliness.
- Check clarity of summary.
- Check skills section.
- Check projects.
- Check experience/internship section.
- Check education section.
- Check grammar and formatting.
- Check whether project impact is quantified.
- Check whether resume is suitable for fresher/internship/job applications.
- Mention missing technical skills based on the resume content.
- Give practical improvements, not generic suggestions.
- Keep each point short and clear.

Document text:
{resume_text}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        print("========== RESUME GEMINI RAW RESPONSE ==========")
        print(response.text)

        parsed = clean_json_response(response.text)

        print("========== RESUME GEMINI SUCCESS ==========")

        return parsed

    except Exception as e:
        print("========== RESUME GEMINI ERROR ==========")
        print(e)
        traceback.print_exc()
        return None


def analyze_ats_with_ai(resume_text: str, job_description: str):
    if not client:
        print("Gemini API key missing")
        return None

    prompt = f"""
You are an ATS resume screening expert.

Compare the resume with the job description and calculate a realistic ATS match score.

Return ONLY valid JSON. Do not include markdown.

JSON FORMAT:
{{
  "success": true,
  "atsScore": number,
  "matchedKeywords": [
    "...",
    "..."
  ],
  "missingKeywords": [
    "...",
    "..."
  ],
  "suggestions": [
    "...",
    "...",
    "..."
  ]
}}

Evaluation Rules:
- atsScore must be from 0 to 100.
- Match technical skills, tools, programming languages, frameworks, cloud platforms, databases, and soft skills.
- matchedKeywords must include keywords clearly present in resume and relevant to job description.
- missingKeywords must include important job description keywords missing from resume.
- suggestions must explain how to improve resume-job match.
- Do not invent skills that are not in the resume.
- Keep keywords short and clean.
- Keep suggestions practical and student-friendly.
- If resume text or job description is missing, return low score and explain in suggestions.

Resume Text:
{resume_text}

Job Description:
{job_description}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        print("========== ATS GEMINI RAW RESPONSE ==========")
        print(response.text)

        return clean_json_response(response.text)

    except Exception as e:
        print("========== ATS GEMINI ERROR ==========")
        print(e)
        return None


def generate_interview_questions_with_ai(role: str, experience: str, interview_type: str):
    if not client:
        return None

    prompt = f"""
You are an expert interviewer.

Generate 5 realistic mock interview questions.

Return ONLY valid JSON:
{{
  "success": true,
  "role": "{role}",
  "experience": "{experience}",
  "interviewType": "{interview_type}",
  "questions": ["...", "...", "...", "...", "..."]
}}

Target Role: {role}
Experience Level: {experience}
Interview Type: {interview_type}

Rules:
- Questions must match the selected role.
- Questions must match the experience level.
- If interview type is Technical, ask technical/project questions.
- If interview type is HR, ask HR questions.
- If interview type is Behavioral, ask STAR-method questions.
- If interview type is Project Based, ask project explanation questions.
- If interview type is Mixed, include technical, HR, behavioral, and project questions.
- Avoid repeating generic questions every time.
- Make questions useful for campus placement preparation.
- Return only JSON. No markdown.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return clean_json_response(response.text)

    except Exception as e:
        print("Interview Question Gemini Error:", e)
        return None


def analyze_interview_answer_with_ai(question: str, answer: str):
    if not client:
        return None

    prompt = f"""
You are a professional mock interview evaluator.

Evaluate the candidate answer like a real interviewer.

Return ONLY valid JSON:
{{
  "success": true,
  "technicalScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "feedback": [
    "...",
    "...",
    "..."
  ]
}}

Question:
{question}

Candidate Answer:
{answer}

Evaluation rules:
- technicalScore should check correctness, depth, examples, and clarity.
- communicationScore should check structure, grammar, flow, and explanation quality.
- confidenceScore should check confidence, directness, and completeness.
- If answer is too short, give lower scores.
- If answer is vague, mention what details are missing.
- Give feedback in simple student-friendly language.
- Suggest STAR method where useful.
- Mention how to improve the answer.
- Return only JSON. No markdown.
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return clean_json_response(response.text)

    except Exception as e:
        print("Interview Feedback Gemini Error:", e)
        return None


def generate_coding_question_with_ai(topic: str, difficulty: str, language: str):
    if not client:
        return None

    import random
    import time

    unique_seed = f"{topic}-{difficulty}-{language}-{time.time()}-{random.randint(1000,9999)}"

    prompt = f"""
You are an expert coding problem creator.

Generate ONE fresh coding problem.

IMPORTANT:
- Do NOT repeat previous/common problems.
- Do NOT generate Two Sum, Second Largest, Fibonacci, Palindrome, Reverse String.
- Use this random seed to force uniqueness: {unique_seed}
- Generate a different problem every time.
- Problem must match topic: {topic}
- Difficulty must match: {difficulty}
- Language selected: {language}
- Randomly choose LeetCode style or CodeChef style.

Return ONLY valid JSON.

{{
  "success": true,
  "platformStyle": "LeetCode",
  "topic": "{topic}",
  "difficulty": "{difficulty}",
  "language": "{language}",
  "problem": "...",
  "statement": "...",
  "explanation": "...",
  "hint": "...",
  "timeComplexity": "...",
  "spaceComplexity": "...",
  "inputFormat": "...",
  "outputFormat": "...",
  "inputExample": "...",
  "expectedOutput": "...",
  "constraints": [
    "...",
    "..."
  ]
}}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        print("========== CODING QUESTION GEMINI RAW RESPONSE ==========")
        print(response.text)

        return clean_json_response(response.text)

    except Exception as e:
        print("Coding Question Gemini Error:", e)
        traceback.print_exc()
        return None


def analyze_coding_solution_with_ai(
    problem: str,
    solution: str,
    language: str,
):
    if not client:
        return None

    prompt = f"""
You are a strict senior coding interviewer and online judge evaluator.

Analyze the candidate's submitted code and execution result.

Return ONLY valid JSON. Do not include markdown.

JSON FORMAT:
{{
  "success": true,
  "result": "Correct" or "Incorrect" or "Needs Review",
  "errorType": "None" or "Syntax Error" or "Runtime Error" or "Logical Error" or "Output Mismatch" or "Problem/Testcase Issue",
  "errorExplanation": "...",
  "howToFix": "...",
  "correctApproach": "...",
  "approachScore": number,
  "optimizationScore": number,
  "codeClarity": number
}}

STRICT RULES:
- If the candidate output matches the expected output, result must be "Correct" and errorType must be "None".
- If execution has syntax error or runtime error, result must be "Incorrect".
- If candidate output does not match expected output, result must be "Incorrect" unless the expected output itself is logically wrong.
- If the expected output is wrong or inconsistent with the custom input/problem, result must be "Needs Review" and errorType must be "Problem/Testcase Issue".
- Never return result "Correct" with errorType "Output Mismatch".
- Never say code is correct while also saying output mismatch.
- Scores must be realistic from 0 to 100.
- If result is Correct, approachScore, optimizationScore, and codeClarity should usually be 75 or above.
- If result is Incorrect, explain the exact issue clearly.
- If it is a testcase/problem issue, explain that the generated expected output may be wrong.

Problem and Execution Context:
{problem}

Language:
{language}

Candidate Solution:
{solution}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        print("========== CODING FEEDBACK GEMINI RAW RESPONSE ==========")
        print(response.text)

        return clean_json_response(response.text)

    except Exception as e:
        print("Coding Feedback Gemini Error:", e)
        return None
    
def generate_final_interview_report(feedback_data: str):
    if not client:
        return None

    prompt = f"""
You are a senior interviewer.

Based on all interview feedback, generate a final report.

Return ONLY valid JSON:

{{
  "success": true,
  "overallTechnical": number,
  "overallCommunication": number,
  "overallConfidence": number,
  "strengths": [
    "...",
    "..."
  ],
  "weaknesses": [
    "...",
    "..."
  ],
  "improvements": [
    "...",
    "..."
  ],
  "recommendation": "Strong Hire"
}}

Interview Feedback:
{feedback_data}
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return clean_json_response(response.text)

    except Exception as e:
        print("Final Report Gemini Error:", e)
        return None