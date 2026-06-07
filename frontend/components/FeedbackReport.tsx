"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart3,
  Brain,
  Code2,
  FileText,
  Target,
  TrendingUp,
  Loader2,
} from "lucide-react";

type ResumeRow = {
  score: number | null;
  strengths: string[] | null;
  improvements: string[] | null;
  missing_skills: string[] | null;
  created_at: string;
};

type ATSRow = {
  ats_score: number | null;
  matched_keywords: string[] | null;
  missing_keywords: string[] | null;
  suggestions: string[] | null;
  created_at: string;
};

type InterviewRow = {
  overall_technical: number | null;
  overall_communication: number | null;
  overall_confidence: number | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improvements: string[] | null;
  recommendation: string | null;
  created_at: string;
};

type CodingRow = {
  approach_score: number | null;
  optimization_score: number | null;
  code_clarity: number | null;
  error_explanation: string | null;
  how_to_fix: string | null;
  correct_approach: string | null;
  created_at: string;
};

export default function FeedbackReport() {
  const [loading, setLoading] = useState(true);
  const [resumeReports, setResumeReports] = useState<ResumeRow[]>([]);
  const [atsReports, setAtsReports] = useState<ATSRow[]>([]);
  const [interviewReports, setInterviewReports] = useState<InterviewRow[]>([]);
  const [codingReports, setCodingReports] = useState<CodingRow[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
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

    setResumeReports((resumeData || []) as ResumeRow[]);
    setAtsReports((atsData || []) as ATSRow[]);
    setInterviewReports((interviewData || []) as InterviewRow[]);
    setCodingReports((codingData || []) as CodingRow[]);
    setLoading(false);
  }

  const latestResume = resumeReports[0];
  const latestATS = atsReports[0];
  const latestInterview = interviewReports[0];
  const latestCoding = codingReports[0];

  const resumeScore = latestResume?.score || 0;
  const atsScore = latestATS?.ats_score || 0;

  const interviewScore = latestInterview
    ? Math.round(
        ((latestInterview.overall_technical || 0) +
          (latestInterview.overall_communication || 0) +
          (latestInterview.overall_confidence || 0)) /
          3
      )
    : 0;

  const codingScore = latestCoding
    ? Math.round(
        ((latestCoding.approach_score || 0) +
          (latestCoding.optimization_score || 0) +
          (latestCoding.code_clarity || 0)) /
          3
      )
    : 0;

  const availableScores = [
    resumeScore,
    atsScore,
    interviewScore,
    codingScore,
  ].filter((score) => score > 0);

  const overallReadiness =
    availableScores.length > 0
      ? Math.round(
          availableScores.reduce((sum, score) => sum + score, 0) /
            availableScores.length
        )
      : 0;

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="text-center">
          <Loader2
            className="animate-spin mx-auto mb-4 text-green-500"
            size={42}
          />
          <p className="text-slate-500">Loading performance history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Performance History</h1>
        <p className="text-slate-500 mt-2">
          Your saved preparation history from Resume Analyzer, ATS Checker, Mock
          Interview, and Coding Practice.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <ScoreCard icon={<Brain className="text-purple-500 mb-3" />} title="Interview Score" value={interviewScore} />
        <ScoreCard icon={<Code2 className="text-green-500 mb-3" />} title="Coding Score" value={codingScore} />
        <ScoreCard icon={<FileText className="text-blue-500 mb-3" />} title="Resume Score" value={resumeScore} />
        <ScoreCard icon={<Target className="text-pink-500 mb-3" />} title="ATS Score" value={atsScore} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold text-xl mb-4">Strengths</h2>

          <div className="h-[230px] overflow-y-auto pr-2">
            <ul className="space-y-3">
              {latestResume?.strengths?.slice(0, 3).map((item, index) => (
                <li key={`resume-strength-${index}`}>✅ {item}</li>
              ))}

              {latestInterview?.strengths?.slice(0, 3).map((item, index) => (
                <li key={`interview-strength-${index}`}>✅ {item}</li>
              ))}

              {!latestResume?.strengths?.length &&
                !latestInterview?.strengths?.length && (
                  <li className="text-slate-500">
                    No strengths available yet. Complete resume analysis or
                    mock interview first.
                  </li>
                )}
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold text-xl mb-4">Areas to Improve</h2>

          <div className="h-[230px] overflow-y-auto pr-2">
            <ul className="space-y-3">
              {latestResume?.improvements?.slice(0, 3).map((item, index) => (
                <li key={`resume-improve-${index}`}>⚠ {item}</li>
              ))}

              {latestInterview?.improvements?.slice(0, 3).map((item, index) => (
                <li key={`interview-improve-${index}`}>⚠ {item}</li>
              ))}

              {latestATS?.suggestions?.slice(0, 3).map((item, index) => (
                <li key={`ats-suggestion-${index}`}>⚠ {item}</li>
              ))}

              {latestCoding?.how_to_fix && (
                <li>⚠ {latestCoding.how_to_fix}</li>
              )}

              {!latestResume?.improvements?.length &&
                !latestInterview?.improvements?.length &&
                !latestATS?.suggestions?.length &&
                !latestCoding?.how_to_fix && (
                  <li className="text-slate-500">
                    No improvement data yet. Complete one module first.
                  </li>
                )}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <HistoryCard title="Resume Reports" count={resumeReports.length} />
        <HistoryCard title="ATS Checks" count={atsReports.length} />
        <HistoryCard title="Mock Interviews" count={interviewReports.length} />
        <HistoryCard title="Coding Attempts" count={codingReports.length} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
          <TrendingUp size={22} />
          Recommended Next Steps
        </h2>

        <ul className="space-y-3">
          {latestATS?.missing_keywords?.slice(0, 4).map((item, index) => (
            <li key={`missing-keyword-${index}`}>
              • Add or improve keyword: {item}
            </li>
          ))}

          {latestResume?.missing_skills?.slice(0, 4).map((item, index) => (
            <li key={`missing-skill-${index}`}>
              • Learn or highlight skill: {item}
            </li>
          ))}

          {latestCoding?.correct_approach && (
            <li>• Practice this coding approach: {latestCoding.correct_approach}</li>
          )}

          {!latestATS?.missing_keywords?.length &&
            !latestResume?.missing_skills?.length &&
            !latestCoding?.correct_approach && (
              <>
                <li>• Complete resume analysis</li>
                <li>• Check ATS score with a job description</li>
                <li>• Complete one mock interview</li>
                <li>• Submit one coding solution</li>
              </>
            )}
        </ul>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
          <BarChart3 size={22} />
          Overall Readiness
        </h2>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5">
          <div
            className="bg-green-500 h-5 rounded-full transition-all"
            style={{ width: `${overallReadiness}%` }}
          />
        </div>

        <p className="mt-4 font-semibold text-green-500">
          {overallReadiness
            ? `${overallReadiness}% Placement Ready`
            : "No performance data yet"}
        </p>
      </div>
    </div>
  );
}

function ScoreCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
      {icon}
      <h3 className="font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">
        {value ? `${value}%` : "No data"}
      </p>
    </div>
  );
}

function HistoryCard({ title, count }: { title: string; count: number }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
      <p className="text-slate-500 mb-2">{title}</p>
      <h3 className="text-3xl font-bold">{count}</h3>
      <p className="text-sm text-slate-500 mt-2">saved records</p>
    </div>
  );
}