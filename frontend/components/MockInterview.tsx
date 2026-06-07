"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Brain,
  Camera,
  CheckCircle,
  Loader2,
  MessageSquare,
  Mic,
  Send,
  Smile,
  Volume2,
  ArrowRight,
  RotateCcw,
  FileText,
  Video,
  VideoOff,
  MicOff,
} from "lucide-react";

type InterviewStartResult = {
  success: boolean;
  role: string;
  experience: string;
  interviewType: string;
  questions: string[];
};

type InterviewFeedback = {
  success: boolean;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  feedback: string[];
};

type FinalReport = {
  success: boolean;
  overallTechnical: number;
  overallCommunication: number;
  overallConfidence: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recommendation: string;
};

export default function MockInterview() {
  const [role, setRole] = useState("Full Stack Developer");
  const [experience, setExperience] = useState("Fresher");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [allFeedback, setAllFeedback] = useState<InterviewFeedback[]>([]);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [mediaError, setMediaError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    return () => {
      stopCamera();
      stopVoiceRecording();
    };
  }, []);

  async function startCamera() {
    try {
      setMediaError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
    } catch (error) {
      console.error(error);
      setMediaError("Camera permission denied or camera not available.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  }

  function startVoiceRecording() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMediaError(
        "Speech recognition is not supported in this browser. Please use Chrome."
      );
      return;
    }

    setMediaError("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();

      if (!transcript) return;

      setAnswer((prev) => {
        const cleanPrev = prev.trim();

        if (!cleanPrev) return transcript;

        if (cleanPrev.endsWith(transcript)) return cleanPrev;

        return `${cleanPrev} ${transcript}`;
      });
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setMediaError("Microphone permission denied or speech recognition failed.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stopVoiceRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setListening(false);
  }

  async function startInterview() {
    setLoading(true);
    setBackendStatus("Connecting to backend...");
    setFeedback(null);
    setAllFeedback([]);
    setFinalReport(null);
    setAnswer("");
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch("http://localhost:5000/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          experience,
          interviewType,
        }),
      });

      if (!response.ok) {
        throw new Error("Interview start API failed");
      }

      const data: InterviewStartResult = await response.json();

      setQuestions(data.questions || []);
      setInterviewStarted(true);
      setBackendStatus("✅ Backend connected successfully");
    } catch (error) {
      console.error("Interview backend error:", error);

      setQuestions([
        "Tell me about yourself.",
        "Explain one project you built recently.",
        "What challenges did you face in your project?",
        "Why should we hire you?",
        "What are your strengths and weaknesses?",
      ]);

      setInterviewStarted(true);
      setBackendStatus("⚠️ Backend not connected, showing static demo questions");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      alert("Please type or record your answer first.");
      return;
    }

    setFeedbackLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/interview/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: currentQuestion,
            answer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Interview feedback API failed");
      }

      const data: InterviewFeedback = await response.json();

      setFeedback(data);
      setAllFeedback((prev) => [...prev, data]);
    } catch (error) {
      console.error("Interview feedback error:", error);

      const staticFeedback: InterviewFeedback = {
        success: true,
        technicalScore: 80,
        communicationScore: 75,
        confidenceScore: 78,
        feedback: [
          "Good answer structure.",
          "Add more measurable project impact.",
          "Use STAR method for stronger explanation.",
        ],
      };

      setFeedback(staticFeedback);
      setAllFeedback((prev) => [...prev, staticFeedback]);
    } finally {
      setFeedbackLoading(false);
    }
  }

  async function finishInterview() {
    if (allFeedback.length === 0) {
      alert("Please answer at least one question before finishing.");
      return;
    }

    setReportLoading(true);
    setFinalReport(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/interview/final-report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            feedbackData: JSON.stringify(allFeedback),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Final report API failed");
      }

      const data: FinalReport = await response.json();

      setFinalReport(data);
      localStorage.setItem("interviewReport", JSON.stringify(data));

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && data.success) {
        const { error } = await supabase.from("interview_reports").insert({
          user_id: user.id,
          overall_technical: data.overallTechnical,
          overall_communication: data.overallCommunication,
          overall_confidence: data.overallConfidence,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          improvements: data.improvements,
          recommendation: data.recommendation,
        });

        if (error) {
          console.error("Interview report save error:", error.message);
        }
      }
    } catch (error) {
      console.error("Final report error:", error);

      const staticReport: FinalReport = {
        success: true,
        overallTechnical: averageTechnical,
        overallCommunication: averageCommunication,
        overallConfidence: averageConfidence,
        strengths: ["Good attempt", "Able to explain basic points"],
        weaknesses: ["Needs deeper technical detail"],
        improvements: [
          "Use STAR method",
          "Add measurable project impact",
          "Practice structured answers",
        ],
        recommendation: "Hire",
      };

      setFinalReport(staticReport);
      localStorage.setItem("interviewReport", JSON.stringify(staticReport));
    } finally {
      setReportLoading(false);
    }
  }

  function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setAnswer("");
      setFeedback(null);
      setFinalReport(null);
    }
  }

  function restartInterview() {
    stopCamera();
    stopVoiceRecording();

    setInterviewStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswer("");
    setFeedback(null);
    setAllFeedback([]);
    setFinalReport(null);
    setBackendStatus("");
    setMediaError("");
  }

  const averageTechnical =
    allFeedback.length > 0
      ? Math.round(
          allFeedback.reduce((sum, item) => sum + item.technicalScore, 0) /
            allFeedback.length
        )
      : 0;

  const averageCommunication =
    allFeedback.length > 0
      ? Math.round(
          allFeedback.reduce((sum, item) => sum + item.communicationScore, 0) /
            allFeedback.length
        )
      : 0;

  const averageConfidence =
    allFeedback.length > 0
      ? Math.round(
          allFeedback.reduce((sum, item) => sum + item.confidenceScore, 0) /
            allFeedback.length
        )
      : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-8 h-full min-h-0">
      <section className="h-full min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Interview Setup</h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Select role, experience, and interview type to start your AI mock
          interview.
        </p>

        <label className="block mb-2 text-slate-600 dark:text-slate-300">
          Target Role
        </label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-5 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none"
        >
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
          <option>Full Stack Developer</option>
          <option>AI/ML Engineer</option>
          <option>Data Analyst</option>
          <option>Cloud Engineer</option>
          <option>DevOps Engineer</option>
        </select>

        <label className="block mb-2 text-slate-600 dark:text-slate-300">
          Experience
        </label>

        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full mb-5 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none"
        >
          <option>Fresher</option>
          <option>Internship Level</option>
          <option>1 Year Experience</option>
          <option>2+ Years Experience</option>
        </select>

        <label className="block mb-2 text-slate-600 dark:text-slate-300">
          Interview Type
        </label>

        <select
          value={interviewType}
          onChange={(e) => setInterviewType(e.target.value)}
          className="w-full mb-6 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none"
        >
          <option>Mixed</option>
          <option>Technical</option>
          <option>HR</option>
          <option>Behavioral</option>
          <option>Project Based</option>
        </select>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setVoiceMode(false)}
            className={`rounded-xl p-4 text-left border transition ${
              !voiceMode
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            }`}
          >
            <MessageSquare className="mb-3" />
            <h3 className="font-semibold">Text Answer</h3>
            <p className="text-sm opacity-80 mt-1">Type your answer.</p>
          </button>

          <button
            onClick={() => setVoiceMode(true)}
            className={`rounded-xl p-4 text-left border transition ${
              voiceMode
                ? "bg-pink-600 text-white border-pink-600"
                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            }`}
          >
            <Mic className="mb-3" />
            <h3 className="font-semibold">Voice + Camera</h3>
            <p className="text-sm opacity-80 mt-1">
              Record answer and enable camera preview.
            </p>
          </button>
        </div>

        <button
          onClick={startInterview}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Generating Questions...
            </>
          ) : (
            <>
              <Brain size={18} />
              Start AI Mock Interview
            </>
          )}
        </button>

        {backendStatus && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            {backendStatus}
          </p>
        )}

        {allFeedback.length > 0 && (
          <div className="mt-6 bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
            <h3 className="font-bold mb-4">Overall Progress</h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                <p className="text-slate-500">Technical</p>
                <h4 className="text-2xl font-bold text-blue-500">
                  {averageTechnical}%
                </h4>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                <p className="text-slate-500">Communication</p>
                <h4 className="text-2xl font-bold text-green-500">
                  {averageCommunication}%
                </h4>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                <p className="text-slate-500">Confidence</p>
                <h4 className="text-2xl font-bold text-purple-500">
                  {averageConfidence}%
                </h4>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <Volume2 className="text-blue-500 mb-3" />
            <h3 className="font-semibold">Speech Analysis</h3>
            <p className="text-sm text-slate-500 mt-1">
              Current: speech-to-text. Later: fluency, pauses, filler words.
            </p>
          </div>

          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <Camera className="text-pink-500 mb-3" />
            <h3 className="font-semibold">Camera Access</h3>
            <p className="text-sm text-slate-500 mt-1">
              Current: camera preview. Later: eye contact and emotion analysis.
            </p>
          </div>
        </div>
      </section>

      <section className="h-full min-h-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Interview Room</h2>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Answer each question and receive AI feedback.
        </p>

        {!interviewStarted ? (
          <div className="h-[560px] flex items-center justify-center text-center bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <MessageSquare
                className="mx-auto mb-4 text-slate-400"
                size={42}
              />
              <p className="text-slate-500">
                Start an interview to generate your first question.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
              <p className="text-sm text-purple-500 font-medium mb-2">
                {role} • {experience} • {interviewType}
              </p>

              <h3 className="text-xl font-bold mb-3">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>

              <p className="text-slate-700 dark:text-slate-300">
                {currentQuestion}
              </p>
            </div>

            {voiceMode ? (
              <div className="space-y-5">
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-5">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Mic className="text-pink-500" size={22} />
                    Voice + Camera Interview Mode
                  </h3>

                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-64 bg-black rounded-2xl object-cover mb-4"
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={cameraOn ? stopCamera : startCamera}
                      className={`py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 ${
                        cameraOn
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-pink-600 hover:bg-pink-700"
                      }`}
                    >
                      {cameraOn ? (
                        <>
                          <VideoOff size={18} />
                          Stop Camera
                        </>
                      ) : (
                        <>
                          <Video size={18} />
                          Start Camera
                        </>
                      )}
                    </button>

                    <button
                      onClick={
                        listening ? stopVoiceRecording : startVoiceRecording
                      }
                      className={`py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 ${
                        listening
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {listening ? (
                        <>
                          <MicOff size={18} />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic size={18} />
                          Start Recording
                        </>
                      )}
                    </button>
                  </div>

                  {mediaError && (
                    <p className="mt-4 text-sm text-red-500">{mediaError}</p>
                  )}

                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    Your speech will be converted into text below. You can edit
                    the answer before submitting.
                  </p>
                </div>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full h-44 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 outline-none resize-none"
                  placeholder="Your spoken answer will appear here..."
                />
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full h-44 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 outline-none resize-none"
                placeholder="Type your answer here..."
              />
            )}

            <button
              onClick={submitAnswer}
              disabled={feedbackLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              {feedbackLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Evaluating Answer...
                </>
              ) : (
                <>
                  Submit Answer <Send size={18} />
                </>
              )}
            </button>

            {feedback && (
              <div className="space-y-5">
                <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    AI Feedback Report
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                      <p className="text-slate-500">Technical</p>
                      <h4 className="text-2xl font-bold text-blue-500">
                        {feedback.technicalScore}%
                      </h4>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                      <p className="text-slate-500">Communication</p>
                      <h4 className="text-2xl font-bold text-green-500">
                        {feedback.communicationScore}%
                      </h4>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                      <p className="text-slate-500">Confidence</p>
                      <h4 className="text-2xl font-bold text-purple-500">
                        {feedback.confidenceScore}%
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-950 rounded-2xl p-5">
                  <h3 className="font-bold mb-3">Improvement Suggestions</h3>

                  <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                    {feedback.feedback.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex >= questions.length - 1}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={finishInterview}
                    disabled={reportLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    {reportLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Finishing...
                      </>
                    ) : (
                      <>
                        Finish <FileText size={18} />
                      </>
                    )}
                  </button>

                  <button
                    onClick={restartInterview}
                    className="bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    Restart <RotateCcw size={18} />
                  </button>
                </div>
              </div>
            )}

            {finalReport && (
              <div className="space-y-5 bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <FileText className="text-green-500" size={22} />
                  Final Interview Report
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                    <p className="text-slate-500">Overall Technical</p>
                    <h4 className="text-2xl font-bold text-blue-500">
                      {finalReport.overallTechnical}%
                    </h4>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                    <p className="text-slate-500">Overall Communication</p>
                    <h4 className="text-2xl font-bold text-green-500">
                      {finalReport.overallCommunication}%
                    </h4>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl">
                    <p className="text-slate-500">Overall Confidence</p>
                    <h4 className="text-2xl font-bold text-purple-500">
                      {finalReport.overallConfidence}%
                    </h4>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Recommendation</h4>
                  <p className="text-green-500 font-semibold">
                    {finalReport.recommendation}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
                    <h4 className="font-bold mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {finalReport.strengths.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
                    <h4 className="font-bold mb-2">Weaknesses</h4>
                    <ul className="space-y-1">
                      {finalReport.weaknesses.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
                    <h4 className="font-bold mb-2">Improvements</h4>
                    <ul className="space-y-1">
                      {finalReport.improvements.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}