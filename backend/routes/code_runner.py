import ast
import re
import requests
from fastapi import APIRouter

router = APIRouter()

JUDGE0_URL = "https://ce.judge0.com/submissions"

LANGUAGE_IDS = {
    "C": 50,
    "C++": 54,
    "Java": 62,
    "Python": 71,
}


def parse_value(value: str):
    value = value.strip()

    try:
        return ast.literal_eval(value)
    except Exception:
        pass

    try:
        return int(value)
    except Exception:
        pass

    try:
        return float(value)
    except Exception:
        pass

    return value.strip('"').strip("'")


def parse_leetcode_input(stdin: str):
    stdin = stdin.strip()

    if not stdin:
        return []

    values = []

    assignment_pattern = r"([A-Za-z_]\w*)\s*=\s*(.*?)(?=\n[A-Za-z_]\w*\s*=|\s*,\s*[A-Za-z_]\w*\s*=|$)"
    matches = re.findall(assignment_pattern, stdin, flags=re.DOTALL)

    if matches:
      for _, value in matches:
          values.append(parse_value(value))
      return values

    try:
        parsed = ast.literal_eval(stdin)
        if isinstance(parsed, tuple):
            return list(parsed)
        return [parsed]
    except Exception:
        return [stdin]


def detect_python_method_name(source_code: str):
    match = re.search(r"def\s+([A-Za-z_]\w*)\s*\(", source_code)
    return match.group(1) if match else None


def wrap_python_leetcode_code(source_code: str, stdin: str):
    method_name = detect_python_method_name(source_code)

    if not method_name:
        return source_code, stdin

    values = parse_leetcode_input(stdin)
    args = ", ".join(repr(value) for value in values)

    wrapped_code = f"""
{source_code}

if __name__ == "__main__":
    obj = Solution()
    result = obj.{method_name}({args})
    print(result)
"""

    return wrapped_code, ""


def validate_java_code(source_code: str):
    if "public class Main" not in source_code:
        return (
            False,
            "Java code must contain: public class Main with public static void main(String[] args).",
        )

    if "public static void main" not in source_code:
        return (
            False,
            "Java code must contain main method: public static void main(String[] args).",
        )

    return True, ""


def validate_c_cpp_code(source_code: str):
    if "main(" not in source_code:
        return False, "C/C++ code must contain int main() function."

    return True, ""


@router.post("/run")
def run_code(data: dict):
    source_code = data.get("sourceCode", "")
    language = data.get("language", "Python")
    stdin = data.get("stdin", "")
    mode = data.get("mode", "auto")

    language_id = LANGUAGE_IDS.get(language)

    if not language_id:
        return {
            "success": False,
            "status": "Unsupported Language",
            "output": "",
            "error": f"{language} is not supported.",
            "time": "",
            "memory": 0,
        }

    final_source_code = source_code
    final_stdin = stdin

    if language == "Python" and mode == "auto":
        if "class Solution" in source_code:
            final_source_code, final_stdin = wrap_python_leetcode_code(
                source_code, stdin
            )

    if language == "Java":
        valid, message = validate_java_code(source_code)

        if not valid:
            return {
                "success": False,
                "status": "Invalid Java Structure",
                "output": "",
                "error": message,
                "time": "",
                "memory": 0,
            }

    if language in ["C", "C++"]:
        valid, message = validate_c_cpp_code(source_code)

        if not valid:
            return {
                "success": False,
                "status": f"Invalid {language} Structure",
                "output": "",
                "error": message,
                "time": "",
                "memory": 0,
            }

    payload = {
        "source_code": final_source_code,
        "language_id": language_id,
        "stdin": final_stdin,
    }

    try:
        response = requests.post(
            f"{JUDGE0_URL}?base64_encoded=false&wait=true",
            json=payload,
            timeout=20,
        )

        result = response.json()

        return {
            "success": True,
            "status": result.get("status", {}).get("description", ""),
            "output": result.get("stdout") or "",
            "error": result.get("stderr") or result.get("compile_output") or "",
            "time": result.get("time") or "",
            "memory": result.get("memory") or 0,
        }

    except Exception as e:
        return {
            "success": False,
            "status": "Execution Failed",
            "output": "",
            "error": str(e),
            "time": "",
            "memory": 0,
        }