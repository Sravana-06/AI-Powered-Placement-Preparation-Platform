"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Editor from "@monaco-editor/react";
import {
  Brain,
  Loader2,
  Play,
  Terminal,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type CodingResult = {
  success: boolean;
  topic: string;
  difficulty: string;
  language?: string;
  problem: string;
  statement: string;
  explanation?: string;
  hint: string;
  timeComplexity: string;
  spaceComplexity: string;
  inputExample?: string;
  expectedOutput?: string;
  platformStyle?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string[];
};

type RunResult = {
  success: boolean;
  status: string;
  output: string;
  error: string;
  time: string;
  memory: number;
};

type FeedbackResult = {
  success: boolean;
  result: string;
  errorType: string;
  errorExplanation: string;
  howToFix: string;
  correctApproach: string;
  approachScore: number;
  optimizationScore: number;
  codeClarity: number;
};

const getStarterCode = (lang: string) => {
  switch (lang) {
    case "Python":
      return "# Write your solution here...";
    case "Java":
      return "// Write your solution here...";
    case "C":
      return "/* Write your solution here... */";
    case "C++":
      return "// Write your solution here...";
    default:
      return "";
  }
};

export default function CodingInterview() {
  const [topic, setTopic] = useState("Arrays");
  const [difficulty, setDifficulty] = useState("Easy");
  const [language, setLanguage] = useState("Python");
  const [problem, setProblem] = useState<CodingResult | null>(null);
  const [solution, setSolution] = useState(getStarterCode("Python"));
  const [customInput, setCustomInput] = useState("");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);

  const editorLanguage =
    language === "C++"
      ? "cpp"
      : language === "C"
      ? "c"
      : language.toLowerCase();

  async function generateProblem() {
    setLoading(true);
    setProblem(null);
    setRunResult(null);
    setFeedback(null);
    setSolution(getStarterCode(language));
    setCustomInput("");

    try {
      const res = await fetch("http://localhost:5000/api/coding/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, language }),
      });

      const data = await res.json();
      setProblem(data);
      setCustomInput(data.inputExample || "");
    } catch {
      setProblem({
        success: true,
        topic,
        difficulty,
        language,
        problem: "Second Largest Element",
        statement:
          "Given an array of integers, find and print the second largest distinct element.",
        explanation:
          "You need to find the largest and second largest distinct values in the array.",
        hint: "Track largest and second largest while traversing the array.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        inputExample: "[12, 35, 1, 10, 34, 1]",
        expectedOutput: "34",
      });
      setCustomInput("[12, 35, 1, 10, 34, 1]");
    } finally {
      setLoading(false);
    }
  }

  async function runCode() {
    if (!solution.trim()) {
      alert("Please write code first.");
      return;
    }

    setRunning(true);
    setRunResult(null);

    try {
      const res = await fetch("http://localhost:5000/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: solution,
          language,
          stdin: customInput,
        }),
      });

      const data: RunResult = await res.json();

      if (data.error) {
        data.status = data.status || "Error";
      } else {
        data.status = "Executed Successfully";
      }

      setRunResult(data);
    } catch {
      setRunResult({
        success: false,
        status: "Execution Failed",
        output: "",
        error: "Backend code runner failed.",
        time: "",
        memory: 0,
      });
    } finally {
      setRunning(false);
    }
  }

  async function submitSolution() {
    if (!solution.trim()) {
      alert("Please write code first.");
      return;
    }

    setChecking(true);

    try {
      const res = await fetch("http://localhost:5000/api/coding/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problem?.problem,
          solution,
          language,
          customInput,
          expectedOutput: problem?.expectedOutput || "",
          executionStatus: runResult?.status || "",
          executionOutput: runResult?.output || "",
          executionError: runResult?.error || "",
        }),
      });

      const data: FeedbackResult = await res.json();

      setFeedback(data);
      localStorage.setItem("codingReport", JSON.stringify(data));

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && data.success) {
        const { error } = await supabase.from("coding_reports").insert({
          user_id: user.id,
          approach_score: data.approachScore,
          optimization_score: data.optimizationScore,
          code_clarity: data.codeClarity,
          result: data.result,
          error_type: data.errorType,
          error_explanation: data.errorExplanation,
          how_to_fix: data.howToFix,
          correct_approach: data.correctApproach,
        });

        if (error) {
          console.error("Coding report save error:", error.message);
        }
      }
    } catch {
      const staticFeedback: FeedbackResult = {
        success: true,
        result: "Needs Review",
        errorType: "Review Error",
        errorExplanation: "Could not get AI feedback.",
        howToFix: "Check backend and Gemini API.",
        correctApproach: "Run the code first and compare the output.",
        approachScore: 60,
        optimizationScore: 60,
        codeClarity: 60,
      };

      setFeedback(staticFeedback);
      localStorage.setItem("codingReport", JSON.stringify(staticFeedback));
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-2xl font-bold">Generate Coding Question</h2>
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          Choose topic, difficulty, and language.
        </p>

        <div className="grid gap-5 md:grid-cols-4">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="rounded-xl border p-3 dark:bg-slate-950"
          >
            <option>Arrays</option>
            <option>Strings</option>
            <option>Linked List</option>
            <option>Stack</option>
            <option>Queue</option>
            <option>Trees</option>
            <option>Graphs</option>
            <option>Sorting</option>
            <option>Searching</option>
            <option>Recursion</option>
            <option>Dynamic Programming</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-xl border p-3 dark:bg-slate-950"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select
            value={language}
            onChange={(e) => {
              const lang = e.target.value;
              setLanguage(lang);
              setSolution(getStarterCode(lang));
            }}
            className="rounded-xl border p-3 dark:bg-slate-950"
          >
            <option>C</option>
            <option>C++</option>
            <option>Java</option>
            <option>Python</option>
          </select>

          <button
            onClick={generateProblem}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-yellow-600 py-3 font-medium text-white hover:bg-yellow-700"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Brain size={18} />
            )}
            {loading ? "Generating..." : "Generate Question"}
          </button>
        </div>
      </section>

      {!problem ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          Generate a coding question to begin.
        </div>
      ) : (
        <div className="grid gap-8 xl:grid-cols-2 h-[calc(100vh-120px)]">
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 overflow-y-auto">
            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
              <p className="mb-2 font-medium text-yellow-500">
                {problem.topic} • {problem.difficulty} • {language}
              </p>
              <h3 className="mb-3 text-2xl font-bold">{problem.problem}</h3>
              <p>{problem.statement}</p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
              <h3 className="mb-2 font-bold">Explanation</h3>
              <p>{problem.explanation || "Explanation not provided."}</p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
              <h3 className="mb-2 font-bold">Platform Style</h3>
              <p>{problem.platformStyle || "CodeChef"}</p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
              <h3 className="mb-2 font-bold">Hint</h3>
              <p>{problem.hint}</p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
              <h3 className="mb-2 font-bold">Input Format</h3>
              <p>{problem.inputFormat || "Not provided"}</p>

              <h3 className="mt-4 mb-2 font-bold">Output Format</h3>
              <p>{problem.outputFormat || "Not provided"}</p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
              <h3 className="mb-2 font-bold">Expected Complexity</h3>
              <p>Time Complexity: {problem.timeComplexity}</p>
              <p>Space Complexity: {problem.spaceComplexity}</p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
              <h3 className="mb-2 font-bold">Constraints</h3>

              <ul className="space-y-1">
                {problem.constraints?.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
              <h3 className="mb-4 font-bold">Example</h3>
              <p className="font-semibold">Input:</p>
              <pre className="mb-4 whitespace-pre-wrap">
                {problem.inputExample}
              </pre>
              <p className="font-semibold">Output:</p>
              <pre className="whitespace-pre-wrap">
                {problem.expectedOutput}
              </pre>
            </div>
          </section>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 overflow-y-auto">
            <h2 className="text-2xl font-bold">Code Editor</h2>

            <div className="overflow-hidden rounded-xl border">
              <Editor
                height="380px"
                language={editorLanguage}
                value={solution}
                onChange={(value) => setSolution(value || "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">Custom Input</label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="h-24 w-full resize-none rounded-xl border p-3 font-mono dark:bg-slate-950"
                placeholder="Enter custom input here..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={runCode}
                disabled={running}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-white"
              >
                {running ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Play size={18} />
                )}
                {running ? "Running..." : "Run Code"}
              </button>

              <button
                onClick={submitSolution}
                disabled={checking}
                className="rounded-xl bg-blue-600 py-3 text-white"
              >
                {checking ? "Checking..." : "Submit Solution"}
              </button>
            </div>

            {runResult && (
              <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
                <h3 className="mb-4 flex items-center gap-2 font-bold">
                  <Terminal size={20} /> Execution Result
                </h3>

                <div
                  className={`mb-4 rounded-xl p-4 font-bold ${
                    runResult.error
                      ? "bg-red-900 text-red-300"
                      : "bg-green-900 text-green-300"
                  }`}
                >
                  {runResult.error
                    ? runResult.status || "Error"
                    : "Executed Successfully"}
                </div>

                <p className="font-semibold">Input Used:</p>
                <pre className="mb-4 rounded-xl bg-black p-3 text-blue-300 whitespace-pre-wrap">
                  {customInput || "No input"}
                </pre>

                <p className="font-semibold">Your Output:</p>
                <pre className="mb-4 rounded-xl bg-black p-3 text-green-300 whitespace-pre-wrap">
                  {runResult.output || "No output"}
                </pre>

                {runResult.error && (
                  <>
                    <p className="font-semibold text-red-500">Error:</p>
                    <pre className="rounded-xl bg-black p-3 text-red-300 whitespace-pre-wrap">
                      {runResult.error}
                    </pre>
                  </>
                )}

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                    <p className="text-sm text-slate-500">Time</p>
                    <p className="font-bold">{runResult.time || "N/A"}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 dark:bg-slate-900">
                    <p className="text-sm text-slate-500">Memory</p>
                    <p className="font-bold">
                      {runResult.memory || "N/A"} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {feedback && (
              <div className="space-y-5">
                <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
                  <h3 className="mb-4 flex items-center gap-2 font-bold">
                    <CheckCircle className="text-green-500" size={20} />
                    AI Code Analysis
                  </h3>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-4 dark:bg-slate-900">
                      <p className="text-slate-500">Approach</p>
                      <h4 className="text-2xl font-bold text-blue-500">
                        {feedback.approachScore}%
                      </h4>
                    </div>

                    <div className="rounded-xl bg-white p-4 dark:bg-slate-900">
                      <p className="text-slate-500">Optimization</p>
                      <h4 className="text-2xl font-bold text-green-500">
                        {feedback.optimizationScore}%
                      </h4>
                    </div>

                    <div className="rounded-xl bg-white p-4 dark:bg-slate-900">
                      <p className="text-slate-500">Code Clarity</p>
                      <h4 className="text-2xl font-bold text-purple-500">
                        {feedback.codeClarity}%
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-950">
                  <h3 className="mb-3 flex items-center gap-2 font-bold">
                    <AlertTriangle className="text-yellow-500" size={20} />
                    Error Analysis
                  </h3>
                  <p>
                    <strong>Result:</strong> {feedback.result}
                  </p>
                  <p>
                    <strong>Error Type:</strong> {feedback.errorType}
                  </p>
                  <p>
                    <strong>Explanation:</strong> {feedback.errorExplanation}
                  </p>
                  <p>
                    <strong>How to fix:</strong> {feedback.howToFix}
                  </p>
                  <p>
                    <strong>Correct Approach:</strong>{" "}
                    {feedback.correctApproach}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}