"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabaseClient";
import {
  Brain,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Signup successful. Please check your email if confirmation is enabled."
    );
    setLoading(false);

    setTimeout(() => {
      router.push("/auth/login");
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white flex items-center justify-center px-6 transition-colors">
      <ThemeToggle />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <section className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-purple-700 via-blue-800 to-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Brain />
            </div>
            <h1 className="text-2xl font-bold">PrepAI</h1>
          </div>

          <div>
            <h2 className="text-5xl font-bold leading-tight mb-5">
              Start your placement preparation today.
            </h2>
            <p className="text-purple-100">
              Build confidence with AI mock interviews, resume analysis, ATS scoring, and coding practice.
            </p>
          </div>

          <p className="text-sm text-purple-100">
            Your AI-powered career preparation partner.
          </p>
        </section>

        <section className="p-8 md:p-12">
          <p className="text-purple-500 font-medium mb-2">Sign Up</p>
          <h2 className="text-4xl font-bold mb-3">Create your account</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Join PrepAI and start preparing smarter.
          </p>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">
                Full name
              </label>

              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4">
                <User size={18} className="text-slate-400" />

                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={fullName}
                  autoComplete="name"
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent outline-none py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">
                Email address
              </label>

              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4">
                <Mail size={18} className="text-slate-400" />

                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none py-3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">
                Password
              </label>

              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4">
                <Lock size={18} className="text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Create a password"
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent outline-none py-3"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {message && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {message}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating account...
                </>
              ) : (
                <>
                  Sign Up <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-purple-500 hover:text-purple-400"
            >
              Login
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}