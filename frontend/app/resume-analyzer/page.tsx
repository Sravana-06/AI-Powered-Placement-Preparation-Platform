import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import ResumeUploader from "@/components/ResumeUploader";

export default function ResumeAnalyzerPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white transition-colors">
      <Sidebar />
      <ThemeToggle />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-blue-500 font-medium mb-2">AI Resume Review</p>
          <h1 className="text-5xl font-bold mb-4">Resume Analyzer</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Upload your resume to get AI-powered scoring, strengths,
            improvements, and missing skills.
          </p>

          <ResumeUploader />
        </div>
      </main>
    </div>
  );
}