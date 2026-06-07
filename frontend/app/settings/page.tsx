"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabaseClient";
import {
  User,
  Lock,
  Bell,
  Palette,
  Brain,
  Shield,
  Download,
  Trash2,
  LogOut,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setEmail(user.email || "");
    setFullName(user.user_metadata?.full_name || "PrepAI User");
    setTargetRole(user.user_metadata?.target_role || "Full Stack Developer");
    setExperienceLevel(user.user_metadata?.experience_level || "Fresher");
    setLoading(false);
  }

  async function saveProfile() {
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        target_role: targetRole,
        experience_level: experienceLevel,
      },
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
      return;
    }

    setMessage("✅ Profile updated successfully");
  }

  async function updatePassword() {
    if (!newPassword.trim()) {
      setMessage("Please enter a new password.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
      return;
    }

    setNewPassword("");
    setMessage("✅ Password updated successfully");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={42} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white transition-colors">
      <Sidebar />
      <ThemeToggle />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-3">Settings</h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your account, security, notifications, appearance, and AI preferences.
              </p>
            </div>

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {message && (
            <p className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm">
              {message}
            </p>
          )}

          <div className="space-y-6">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <User className="text-blue-500" /> Account
              </h2>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block mb-2 text-sm text-slate-500">Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-slate-500">Email</label>
                  <input
                    value={email}
                    disabled
                    className="w-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-slate-500">Target Role</label>
                  <input
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-slate-500">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none"
                  >
                    <option>Student</option>
                    <option>Fresher</option>
                    <option>Internship Level</option>
                    <option>Experienced</option>
                  </select>
                </div>
              </div>

              <button
                onClick={saveProfile}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
              >
                Save Profile
              </button>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <Lock className="text-purple-500" /> Security
              </h2>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none"
                placeholder="Enter new password"
              />

              <button
                onClick={updatePassword}
                className="mt-5 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
              >
                Update Password
              </button>
            </section>

            <section className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                  <Bell className="text-yellow-500" /> Notifications
                </h2>

                <div className="space-y-4">
                  {[
                    "Resume analysis updates",
                    "ATS score alerts",
                    "Mock interview reminders",
                    "Weekly progress report",
                  ].map((item) => (
                    <label key={item} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                  <Palette className="text-pink-500" /> Appearance
                </h2>

                <p className="text-sm text-slate-500 mb-4">
                  Use the floating button to switch dark/light mode.
                </p>

                <select className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none">
                  <option>Blue Accent</option>
                  <option>Purple Accent</option>
                  <option>Green Accent</option>
                </select>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <Brain className="text-blue-500" /> AI Preferences
              </h2>

              <div className="grid md:grid-cols-3 gap-5">
                <select className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none">
                  <option>Detailed Feedback</option>
                  <option>Short Feedback</option>
                  <option>Strict Interviewer Mode</option>
                </select>

                <select className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none">
                  <option>Medium Difficulty</option>
                  <option>Easy Difficulty</option>
                  <option>Hard Difficulty</option>
                </select>

                <select className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 outline-none">
                  <option>Full Stack Developer</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>AI/ML Engineer</option>
                </select>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <Shield className="text-green-500" /> Privacy & Data
              </h2>

              <div className="space-y-4 mb-6">
                {[
                  "Save resume analysis history",
                  "Save mock interview history",
                  "Allow AI personalization",
                ].map((item) => (
                  <label key={item} className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </label>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2">
                  <Download size={18} /> Export Data
                </button>

                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2">
                  <Trash2 size={18} /> Delete Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}