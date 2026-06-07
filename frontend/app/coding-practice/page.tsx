import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import CodingInterview from "@/components/CodingInterview";

export default function CodingPracticePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white transition-colors">
      <Sidebar />
      <ThemeToggle />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-yellow-500 font-medium mb-2">
            Coding Interview Generator
          </p>
          <h1 className="text-5xl font-bold mb-4">Coding Practice</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Generate coding questions and receive AI-powered coding feedback.
          </p>

          <CodingInterview />
        </div>
      </main>
    </div>
  );
}