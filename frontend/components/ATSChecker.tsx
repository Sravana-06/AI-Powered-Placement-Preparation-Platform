"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import {
  Upload,
  FileText,
  Loader2,
  Target,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type ATSResult = {
  success: boolean;
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
};

const staticATSResult: ATSResult = {
  success: true,
  atsScore: 78,
  matchedKeywords: ["React", "Node.js", "Python", "AWS"],
  missingKeywords: ["Docker", "CI/CD", "Kubernetes"],
  suggestions: [
    "Add missing keywords naturally.",
    "Match resume summary with job role.",
    "Add measurable achievements.",
  ],
};

export default function ATSChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [backendStatus, setBackendStatus] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setResult(null);
      setBackendStatus("");
    }
  }

  async function handleCheck() {
    if (!file || !jobDescription.trim()) {
      alert("Please upload resume and paste job description.");
      return;
    }

    setLoading(true);
    setResult(null);
    setBackendStatus("Connecting to backend...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("https://ai-powered-placement-preparation-platform-production.up.railway.app/api/ats/check", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("ATS request failed");
      }

      const data: ATSResult = await response.json();

      setResult(data);
      localStorage.setItem("atsReport", JSON.stringify(data));

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && data.success) {
        const { error } = await supabase.from("ats_reports").insert({
          user_id: user.id,
          ats_score: data.atsScore,
          matched_keywords: data.matchedKeywords,
          missing_keywords: data.missingKeywords,
          suggestions: data.suggestions,
        });

        if (error) {
          console.error("ATS report save error:", error.message);
        }
      }

      setBackendStatus("✅ ATS backend connected successfully");
    } catch (error) {
      console.error("ATS backend error:", error);
      setResult(staticATSResult);
      localStorage.setItem("atsReport", JSON.stringify(staticATSResult));
      setBackendStatus("⚠️ Backend not connected, showing static demo result");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Upload Resume</h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Upload your resume and paste the job description to check ATS match.
        </p>

        <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 min-h-[230px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          {fileName ? (
            <>
              <FileText className="text-green-500 mb-4" size={44} />
              <p className="font-semibold mb-2 text-green-500">File selected</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 break-all max-w-md">
                {fileName}
              </p>
              <p className="text-xs text-slate-500 mt-3">
                Click again to change file
              </p>
            </>
          ) : (
            <>
              <Upload className="text-green-500 mb-4" size={44} />
              <p className="font-medium mb-2">Click to upload resume</p>
              <p className="text-sm text-slate-500">PDF supported</p>
            </>
          )}

          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="mt-6 w-full h-60 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 outline-none resize-none"
          placeholder="Paste job description here..."
        />

        <button
          onClick={handleCheck}
          disabled={loading}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Checking ATS Score...
            </>
          ) : (
            "Check ATS Score"
          )}
        </button>

        {backendStatus && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {backendStatus}
          </p>
        )}
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">ATS Report</h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Your resume-job match report will appear here.
        </p>

        {loading ? (
          <div className="h-[520px] flex items-center justify-center text-center bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <Loader2 className="animate-spin mx-auto mb-4 text-green-500" size={42} />
              <p className="text-green-500 font-medium">Checking ATS score...</p>
            </div>
          </div>
        ) : !result ? (
          <div className="h-[520px] flex items-center justify-center text-center bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <Target className="mx-auto mb-4 text-slate-400" size={42} />
              <p className="text-slate-500">
                Upload resume, paste job description, then check ATS score.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
              <p className="text-slate-500 mb-2">ATS Match Score</p>

              <h3 className="text-5xl font-bold text-green-500">
                {result.atsScore}%
              </h3>

              <div className="mt-4 w-full bg-slate-300 dark:bg-slate-800 h-3 rounded-full">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${result.atsScore}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                Matched Keywords
              </h3>

              <div className="flex flex-wrap gap-3">
                {result.matchedKeywords.map((item, index) => (
                  <span
                    key={index}
                    className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" size={20} />
                Missing Keywords
              </h3>

              <div className="flex flex-wrap gap-3">
                {result.missingKeywords.map((item, index) => (
                  <span
                    key={index}
                    className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-3">Suggestions</h3>

              <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                {result.suggestions.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}