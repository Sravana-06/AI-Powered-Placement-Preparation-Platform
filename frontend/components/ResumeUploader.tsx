"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type ResumeResult = {
  success: boolean;
  score: number;
  strengths: string[];
  improvements: string[];
  missingSkills: string[];
};

export default function ResumeUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [status, setStatus] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setResult(null);
      setStatus("");
    }
  }

  async function handleAnalyze() {
    if (!file) {
      alert("Please upload your resume first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setStatus("Analyzing resume with backend...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://ai-powered-placement-preparation-platform-production.up.railway.app/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
      localStorage.setItem("resumeReport", JSON.stringify(data));
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && data.success) {
        const { error } = await supabase.from("resume_reports").insert({
          user_id: user.id,
          score: data.score,
          strengths: data.strengths,
          improvements: data.improvements,
          missing_skills: data.missingSkills,
        });

        if (error) {
          console.error("Resume report save error:", error.message);
        }
      }

      if (data.success) {
        setStatus("✅ Resume analyzed successfully");
      } else {
        setStatus("⚠️ AI analysis failed or document is not a resume");
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Backend connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Upload Resume</h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Upload your resume PDF to get AI-powered score, strengths, improvements, and missing skills.
        </p>

        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 min-h-[230px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
  {fileName ? (
    <>
      <FileText className="text-blue-500 mb-4" size={46} />

      <p className="font-semibold mb-2 text-blue-500">
        File selected
      </p>

      <p className="text-sm text-slate-600 dark:text-slate-300 break-all max-w-md">
        {fileName}
      </p>

      <p className="text-xs text-slate-500 mt-3">
        Click again to change file
      </p>
    </>
  ) : (
    <>
      <Upload className="text-blue-500 mb-4" size={46} />

      <p className="font-medium mb-2">
        Click to upload resume
      </p>

      <p className="text-sm text-slate-500">
        PDF supported
      </p>
    </>
  )}

  <input
    type="file"
    accept=".pdf"
    className="hidden"
    onChange={handleFileChange}
  />
</label>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Analyzing Resume...
            </>
          ) : (
            "Analyze Resume"
          )}
        </button>

        {status && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {status}
          </p>
        )}
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">AI Resume Report</h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Your resume feedback will appear here after analysis.
        </p>

        {loading ? (
          <div className="h-[500px] flex items-center justify-center text-center bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={42} />
              <p className="text-blue-500 font-medium">AI is analyzing your resume...</p>
            </div>
          </div>
        ) : !result ? (
          <div className="h-[500px] flex items-center justify-center text-center bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <AlertCircle className="mx-auto mb-4 text-slate-400" size={42} />
              <p className="text-slate-500">Upload resume and click Analyze.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
              <p className="text-slate-500 mb-2">Resume Score</p>
              <h3 className="text-5xl font-bold text-blue-500">{result.score}%</h3>

              <div className="mt-4 w-full bg-slate-300 dark:bg-slate-800 h-3 rounded-full">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Strengths
              </h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                {result.strengths?.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-3">Improvements</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                {result.improvements?.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-3">Missing Skills</h3>
              <div className="flex flex-wrap gap-3">
                {result.missingSkills?.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}