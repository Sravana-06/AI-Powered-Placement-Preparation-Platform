"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import DashboardCard from "@/components/DashboardCard";
import { supabase } from "@/lib/supabaseClient";
import {
  FileText,
  Target,
  MessageSquare,
  Code,
  Bell,
  TrendingUp,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";

const features = [
  {
    title: "Resume Analyzer",
    href: "/resume-analyzer",
    icon: <FileText size={30} />,
    color: "text-blue-500",
    description: "Upload your resume and get AI-powered suggestions.",
    status: "Working",
  },
  {
    title: "ATS Checker",
    href: "/ats-checker",
    icon: <Target size={30} />,
    color: "text-green-500",
    description: "Compare resume with job description and check keyword match.",
    status: "Working",
  },
  {
    title: "Mock Interview",
    href: "/mock-interview",
    icon: <MessageSquare size={30} />,
    color: "text-purple-500",
    description: "Practice AI interview questions with voice and camera mode.",
    status: "Working",
  },
  {
    title: "Coding Practice",
    href: "/coding-practice",
    icon: <Code size={30} />,
    color: "text-yellow-500",
    description: "Generate coding questions, run code, and get AI feedback.",
    status: "Working",
  },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [resumeScore, setResumeScore] = useState(0);
  const [atsScore, setAtsScore] = useState(0);
  const [interviewScore, setInterviewScore] = useState(0);
  const [codingScore, setCodingScore] = useState(0);

  const [resumeCount, setResumeCount] = useState(0);
  const [atsCount, setAtsCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [codingCount, setCodingCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: resumeData } = await supabase
      .from("resume_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: atsData } = await supabase
      .from("ats_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: interviewData } = await supabase
      .from("interview_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: codingData } = await supabase
      .from("coding_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const latestResume = resumeData?.[0];
    const latestATS = atsData?.[0];
    const latestInterview = interviewData?.[0];
    const latestCoding = codingData?.[0];

    setResumeScore(latestResume?.score || 0);
    setAtsScore(latestATS?.ats_score || 0);

    if (latestInterview) {
      setInterviewScore(
        Math.round(
          ((latestInterview.overall_technical || 0) +
            (latestInterview.overall_communication || 0) +
            (latestInterview.overall_confidence || 0)) /
            3
        )
      );
    }

    if (latestCoding) {
      setCodingScore(
        Math.round(
          ((latestCoding.approach_score || 0) +
            (latestCoding.optimization_score || 0) +
            (latestCoding.code_clarity || 0)) /
            3
        )
      );
    }

    setResumeCount(resumeData?.length || 0);
    setAtsCount(atsData?.length || 0);
    setInterviewCount(interviewData?.length || 0);
    setCodingCount(codingData?.length || 0);

    setLoading(false);
  }

  const progressItems = [
    ["Resume Improvement", resumeScore],
    ["ATS Optimization", atsScore],
    ["Interview Confidence", interviewScore],
    ["Coding Practice", codingScore],
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white transition-colors">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-10 pr-16">
            <div>
              <p className="text-blue-500 font-medium mb-2">Welcome back 👋</p>
              <h1 className="text-5xl font-bold">PrepAI Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-3">
                Your complete AI-powered placement preparation workspace.
              </p>
            </div>

            <div className="relative flex items-center gap-3">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl"
              >
                <Bell size={22} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {resumeCount + atsCount + interviewCount + codingCount}
                 </span>
                </button>

                <ThemeToggle className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-lg transition" />

                {notificationOpen && (
                  <div className="absolute right-0 top-16 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50">
                    <h3 className="font-bold mb-4">Notifications</h3>

                    <div className="space-y-3 text-sm">
                      <p>✅ Resume reports saved: {resumeCount}</p>
                      <p>✅ ATS checks saved: {atsCount}</p>
                      <p>✅ Mock interviews saved: {interviewCount}</p>
                      <p>✅ Coding attempts saved: {codingCount}</p>
                    </div>
                  </div>
                )}
              </div>
          </div>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={42} />
                <p className="text-slate-500">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-4 gap-6 mb-10">
                <DashboardCard title="Resume Score" value={resumeScore ? `${resumeScore}%` : "No data"} icon={<FileText size={22} />} color="bg-blue-600" count={resumeCount} />
                <DashboardCard title="ATS Score" value={atsScore ? `${atsScore}%` : "No data"} icon={<Target size={22} />} color="bg-green-600" count={atsCount} />
                <DashboardCard title="Interview Score" value={interviewScore ? `${interviewScore}%` : "No data"} icon={<MessageSquare size={22} />} color="bg-purple-600" count={interviewCount} />
                <DashboardCard title="Coding Score" value={codingScore ? `${codingScore}%` : "No data"} icon={<Code size={22} />} color="bg-yellow-600" count={codingCount} />
              </div>

              <div className="grid lg:grid-cols-4 gap-6 mb-10">
                {features.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:scale-[1.02] transition group"
                  >
                    <div className={`${item.color} mb-4`}>{item.icon}</div>

                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition" />
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                      {item.description}
                    </p>

                    <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full">
                      <CheckCircle size={13} />
                      {item.status}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
                    <TrendingUp className="text-blue-500" />
                    Performance Progress
                  </h3>

                  {progressItems.map(([label, value]) => (
                    <div key={label} className="mb-5">
                      <div className="flex justify-between mb-2 text-sm">
                        <span>{label}</span>
                        <span>{value ? `${value}%` : "No data"}</span>
                      </div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full">
                        <div
                          className="h-3 bg-blue-600 rounded-full"
                          style={{ width: `${value || 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </section>

                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
                    <Sparkles className="text-purple-500" />
                    AI Insights
                  </h3>

                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>✅ Resume reports saved: {resumeCount}</p>
                    <p>✅ ATS checks saved: {atsCount}</p>
                    <p>✅ Mock interviews saved: {interviewCount}</p>
                    <p>✅ Coding attempts saved: {codingCount}</p>
                  </div>
                </section>
              </div>

              <section className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
                  <CalendarCheck className="text-green-500" />
                  Today&apos;s Practice Plan
                </h3>

                <div className="grid md:grid-cols-4 gap-4 text-slate-700 dark:text-slate-300">
                  <p>1. Analyze resume</p>
                  <p>2. Check ATS score</p>
                  <p>3. Complete mock interview</p>
                  <p>4. Solve coding problem</p>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}