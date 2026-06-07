from fastapi import APIRouter
import random
from services.ai_service import (
    generate_coding_question_with_ai,
    analyze_coding_solution_with_ai,
)

router = APIRouter()
RECENT_QUESTIONS = []


LOCAL_QUESTIONS = [
    {
        "topic": "Arrays",
        "difficulty": "Easy",
        "platformStyle": "LeetCode",
        "problem": "Second Largest Distinct Element",
        "statement": "Given an integer array, find the second largest distinct element. If it does not exist, return -1.",
        "explanation": "Track largest and second largest distinct values in one pass.",
        "hint": "Ignore duplicates while updating largest and second largest.",
        "inputFormat": "nums = integer array",
        "outputFormat": "Return second largest distinct element.",
        "inputExample": "nums = [12, 35, 1, 10, 34, 1]",
        "expectedOutput": "34",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)",
        "constraints": ["1 <= n <= 10^5"],
    },
    {
        "topic": "Arrays",
        "difficulty": "Medium",
        "platformStyle": "LeetCode",
        "problem": "Subarray Sum Equals Target",
        "statement": "Given an array and target, count continuous subarrays whose sum equals target.",
        "explanation": "Use prefix sum and hashmap.",
        "hint": "Check how many times currentSum - target appeared before.",
        "inputFormat": "nums = integer array, target = integer",
        "outputFormat": "Return count.",
        "inputExample": "nums = [1, 2, 3, -2, 5], target = 5",
        "expectedOutput": "3",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "constraints": ["1 <= n <= 10^5"],
    },
    {
        "topic": "Strings",
        "difficulty": "Easy",
        "platformStyle": "LeetCode",
        "problem": "First Non-Repeating Character",
        "statement": "Given a string, return the first character that appears only once. If none exists, return -1.",
        "explanation": "Count character frequency, then scan again.",
        "hint": "Use hashmap or frequency array.",
        "inputFormat": "s = string",
        "outputFormat": "Return character or -1.",
        "inputExample": 's = "leetcode"',
        "expectedOutput": "l",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)",
        "constraints": ["1 <= len(s) <= 10^5"],
    },
    {
        "topic": "Searching",
        "difficulty": "Medium",
        "platformStyle": "LeetCode",
        "problem": "Search in Rotated Sorted Array",
        "statement": "Given a rotated sorted array and target, return the index of target. If not found, return -1.",
        "explanation": "Use modified binary search.",
        "hint": "One half is always sorted.",
        "inputFormat": "nums = rotated sorted array, target = integer",
        "outputFormat": "Return index or -1.",
        "inputExample": "nums = [4,5,6,7,0,1,2], target = 0",
        "expectedOutput": "4",
        "timeComplexity": "O(log n)",
        "spaceComplexity": "O(1)",
        "constraints": ["1 <= n <= 10^5"],
    },
    {
        "topic": "Dynamic Programming",
        "difficulty": "Medium",
        "platformStyle": "LeetCode",
        "problem": "Maximum Sum Non-Adjacent",
        "statement": "Given an array, find the maximum sum such that no two selected elements are adjacent.",
        "explanation": "At each index, choose current + previous non-adjacent or skip current.",
        "hint": "Use include/exclude DP.",
        "inputFormat": "nums = integer array",
        "outputFormat": "Return maximum sum.",
        "inputExample": "nums = [3, 2, 7, 10]",
        "expectedOutput": "13",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(1)",
        "constraints": ["1 <= n <= 10^5"],
    },
]


def pick_local_question(topic: str, difficulty: str):
    exact = [
        q for q in LOCAL_QUESTIONS
        if q["topic"] == topic and q["difficulty"] == difficulty
    ]

    topic_only = [
        q for q in LOCAL_QUESTIONS
        if q["topic"] == topic
    ]

    difficulty_only = [
        q for q in LOCAL_QUESTIONS
        if q["difficulty"] == difficulty
    ]

    pool = exact or topic_only or difficulty_only or LOCAL_QUESTIONS

    available = [
        q for q in pool
        if q["problem"] not in RECENT_QUESTIONS
    ]

    if not available:
        RECENT_QUESTIONS.clear()
        available = pool

    selected = random.choice(available)

    RECENT_QUESTIONS.append(selected["problem"])
    if len(RECENT_QUESTIONS) > 10:
        RECENT_QUESTIONS.pop(0)

    return selected


@router.post("/generate")
def generate_coding_question(data: dict):
    topic = data.get("topic", "Arrays")
    difficulty = data.get("difficulty", "Easy")
    language = data.get("language", "Python")

    try:
        ai_result = generate_coding_question_with_ai(topic, difficulty, language)

        if ai_result and ai_result.get("success"):
            ai_result["language"] = language
            return ai_result

    except Exception as e:
        print("Gemini question generation failed. Using local question bank.")
        print(e)

    q = pick_local_question(topic, difficulty)

    return {
        "success": True,
        "topic": q["topic"],
        "difficulty": q["difficulty"],
        "language": language,
        "platformStyle": q["platformStyle"],
        "problem": q["problem"],
        "statement": q["statement"],
        "explanation": q["explanation"],
        "hint": q["hint"],
        "timeComplexity": q["timeComplexity"],
        "spaceComplexity": q["spaceComplexity"],
        "inputFormat": q["inputFormat"],
        "outputFormat": q["outputFormat"],
        "inputExample": q["inputExample"],
        "expectedOutput": q["expectedOutput"],
        "constraints": q["constraints"],
    }


@router.post("/feedback")
def coding_feedback(data: dict):
    problem = data.get("problem", "")
    solution = data.get("solution", "")
    language = data.get("language", "Python")
    execution_status = data.get("executionStatus", "")
    execution_output = (data.get("executionOutput", "") or "").strip()
    execution_error = (data.get("executionError", "") or "").strip()
    custom_input = data.get("customInput", "")
    expected_output = (data.get("expectedOutput", "") or "").strip()

    full_problem_context = f"""
Problem:
{problem}

Custom Input:
{custom_input}

Expected Output:
{expected_output}

Execution Status:
{execution_status}

User Output:
{execution_output}

Execution Error:
{execution_error}
"""

    try:
        ai_result = analyze_coding_solution_with_ai(
            full_problem_context,
            solution,
            language,
        )

        if ai_result and ai_result.get("success"):
            return ai_result

    except Exception as e:
        print("Gemini coding feedback failed. Using local fallback.")
        print(e)

    if execution_error:
        return {
            "success": True,
            "result": "Incorrect",
            "errorType": "Runtime / Syntax Error",
            "errorExplanation": execution_error,
            "howToFix": "Fix the error shown in the execution result and run again.",
            "correctApproach": "First make sure the program executes successfully.",
            "approachScore": 40,
            "optimizationScore": 40,
            "codeClarity": 50,
        }

    if expected_output and execution_output == expected_output:
        return {
            "success": True,
            "result": "Correct",
            "errorType": "None",
            "errorExplanation": "Your output matches the expected output.",
            "howToFix": "No fix needed.",
            "correctApproach": "Your solution produces the expected output for the given example.",
            "approachScore": 90,
            "optimizationScore": 85,
            "codeClarity": 85,
        }

    if execution_status == "Executed Successfully":
        return {
            "success": True,
            "result": "Needs Review",
            "errorType": "Output Not Verified",
            "errorExplanation": "Your code executed successfully. If you changed the custom input, compare your output manually with the correct output for that input.",
            "howToFix": "Run multiple test cases and compare outputs.",
            "correctApproach": "Verify the logic using the problem explanation and sample cases.",
            "approachScore": 70,
            "optimizationScore": 70,
            "codeClarity": 75,
        }

    return {
        "success": True,
        "result": "Needs Review",
        "errorType": "Not Executed",
        "errorExplanation": "Run the code first before submitting.",
        "howToFix": "Click Run Code, check output, then submit again.",
        "correctApproach": "Complete and execute the solution first.",
        "approachScore": 60,
        "optimizationScore": 60,
        "codeClarity": 70,
    }