"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Brain,
  ArrowRight,
  CheckCircle,
  FileText,
  Target,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white transition-colors overflow-hidden">
      <ThemeToggle />

      <section className="relative min-h-screen px-6 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#bfdbfe_0,transparent_30%),radial-gradient(circle_at_bottom_right,#ddd6fe_0,transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,#1d4ed8_0,transparent_30%),radial-gradient(circle_at_bottom_right,#7c3aed_0,transparent_30%)] opacity-30" />

        <nav className="relative max-w-7xl mx-auto flex items-center justify-between pr-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-3 rounded-2xl">
              <Brain />
            </div>
            <h1 className="text-2xl font-bold">PrepAI</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="hover:text-blue-500">
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center min-h-[85vh]">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-500 mb-6">
              <Sparkles size={18} />
              AI-powered placement preparation
            </div>

            <h2 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
              Practice interviews with AI confidence.
            </h2>

            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl">
              PrepAI helps students improve resumes, check ATS scores, practice
              mock interviews, solve coding problems, and get instant AI feedback.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-xl font-medium flex items-center gap-2"
              >
                Start Free <ArrowRight size={18} />
              </Link>

              <Link
                href="/dashboard"
                className="border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 px-7 py-4 rounded-xl font-medium"
              >
                View Demo Dashboard
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-slate-600 dark:text-slate-300">
              {[
                "AI resume analysis",
                "ATS score checker",
                "Mock interview feedback",
                "Coding practice generator",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="grid gap-5">
              <div className="bg-slate-100 dark:bg-slate-950 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-blue-500" />
                  <p className="font-semibold">Resume Analyzer</p>
                </div>
                <div className="w-full bg-slate-300 dark:bg-slate-800 h-3 rounded-full">
                  <div className="bg-blue-600 h-3 rounded-full w-[85%]" />
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  Score improved to 85%
                </p>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-green-500" />
                  <p className="font-semibold">ATS Checker</p>
                </div>
                <div className="w-full bg-slate-300 dark:bg-slate-800 h-3 rounded-full">
                  <div className="bg-green-600 h-3 rounded-full w-[78%]" />
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  Keyword match 78%
                </p>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="text-purple-500" />
                  <p className="font-semibold">Mock Interview</p>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  “Improve answer structure using STAR method.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}