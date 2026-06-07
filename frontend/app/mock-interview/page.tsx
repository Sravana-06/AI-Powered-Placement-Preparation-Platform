import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import MockInterview from "@/components/MockInterview";

export default function MockInterviewPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white transition-colors">
      <Sidebar />
      <ThemeToggle />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <p className="text-purple-500 font-medium mb-2">
            AI Mock Interviewer
          </p>

          <h1 className="text-5xl font-bold mb-4">Mock Interview</h1>

          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Generate role-based interview questions, answer one-by-one, and get AI feedback.
          </p>

          <div className="flex-1 min-h-0">
            <MockInterview />
          </div>
        </div>
      </main>
    </div>
  );
}