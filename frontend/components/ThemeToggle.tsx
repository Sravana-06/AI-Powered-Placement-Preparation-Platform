"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={
        className ||
        "fixed top-6 right-6 z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-3 rounded-full shadow-lg transition"
      }
    >
      {theme === "dark" ? (
        <Sun className="text-yellow-400" size={20} />
      ) : (
        <Moon className="text-slate-800 dark:text-white" size={20} />
      )}
    </button>
  );
}