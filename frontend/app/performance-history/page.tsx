import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import FeedbackReport from "@/components/FeedbackReport";

export default function PerformanceHistoryPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white transition-colors">
      <Sidebar />
      <ThemeToggle />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-green-500 font-medium mb-2">
            Performance Analytics
          </p>

          <h1 className="text-5xl font-bold mb-4">
            Performance History
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mb-8">
            View your coding, interview, resume, and ATS performance history in one place.
          </p>

          <FeedbackReport />
        </div>
      </main>
    </div>
  );
}