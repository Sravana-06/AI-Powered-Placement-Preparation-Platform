"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  LayoutDashboard,
  FileText,
  Target,
  MessageSquare,
  Code,
  Settings,
  Sparkles,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume Analyzer", href: "/resume-analyzer", icon: FileText },
  { name: "ATS Checker", href: "/ats-checker", icon: Target },
  { name: "Mock Interview", href: "/mock-interview", icon: MessageSquare },
  { name: "Coding Practice", href: "/coding-practice", icon: Code },
  { name: "Performance History", href: "/performance-history", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [fullName, setFullName] = useState("PrepAI User");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
        setFullName(user.user_metadata?.full_name || "PrepAI User");
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside
      className={`relative h-screen shrink-0 overflow-visible ${
        collapsed ? "w-24" : "w-72"
      } bg-white text-slate-950 border-r border-slate-200 dark:bg-slate-950 dark:text-white dark:border-slate-800 p-6 transition-all duration-300 flex flex-col`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-8 right-[-16px] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className="flex items-center gap-3 mb-10 shrink-0">
        <div className="bg-blue-600 p-2 rounded-xl text-white">
          <Sparkles size={22} />
        </div>

        {!collapsed && <h1 className="text-2xl font-bold">PrepAI</h1>}
      </div>

      <nav className="space-y-3 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.name : ""}
              className={`flex items-center ${
                collapsed ? "justify-center" : "gap-3"
              } p-3 rounded-xl transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 pt-5">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-3"
          } p-3 rounded-xl bg-slate-100 dark:bg-slate-900`}
          title="Profile"
        >
          <UserCircle className="text-blue-500 shrink-0" size={28} />

          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold truncate">{fullName}</p>
              <p className="text-xs text-slate-500 truncate">{email}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`mt-3 w-full flex items-center ${
            collapsed ? "justify-center" : "gap-3"
          } p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition`}
          title="Logout"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}