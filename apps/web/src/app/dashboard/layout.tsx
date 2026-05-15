"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, LayoutDashboard, Cpu, BarChart3, Brain, Activity,
  Settings, ChevronLeft, ChevronRight, GitBranch, Layers,
  Zap, Database, Terminal, Shield, Bell, Search, User,
  Wifi, HardDrive, Clock, Sparkles, FlaskConical,
  LogOut, ChevronDown,
} from "lucide-react";
import { CommandPalette } from "@/components/command-palette";
import { NotificationPanel } from "@/components/notification-panel";

const navSections = [
  {
    label: "Research",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
      { href: "/dashboard/analyze", icon: Cpu, label: "Analyze Challenge" },
      { href: "/dashboard/generator", icon: Sparkles, label: "CAPTCHA Generator" },
      { href: "/dashboard/lab", icon: FlaskConical, label: "Research Lab" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/dashboard/learning", icon: Brain, label: "Learning Engine" },
      { href: "/dashboard/models", icon: GitBranch, label: "Model Registry" },
      { href: "/dashboard/training", icon: Zap, label: "Training Jobs" },
      { href: "/dashboard/memory", icon: Database, label: "Vector Memory" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
      { href: "/dashboard/activity", icon: Activity, label: "Live Feed" },
      { href: "/dashboard/benchmarks", icon: Layers, label: "Benchmarks" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/terminal", icon: Terminal, label: "Research CLI" },
      { href: "/dashboard/settings", icon: Settings, label: "Settings" },
    ],
  },
];

function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();
  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 248 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col h-full border-r border-white/[0.04] bg-[#0a1628]/80 backdrop-blur-xl overflow-hidden"
    >
      <div className="h-16 flex items-center px-4 border-b border-white/[0.04] shrink-0">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="font-bold text-white text-sm tracking-tight leading-none">CaptchaIQ</div>
              <div className="text-[10px] text-cyan-400 font-medium tracking-widest mt-0.5">RESEARCH v2</div>
            </motion.div>
          )}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && <div className="section-label px-2 mb-2">{section.label}</div>}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${active ? "bg-cyan-400/10 text-cyan-400 border-l-2 border-cyan-400" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`}>
                    <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-cyan-400" : ""}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {!collapsed && (
        <div className="p-4 border-t border-white/[0.04] space-y-2">
          <div className="section-label mb-2">System</div>
          {[{ icon: Wifi, label: "API" }, { icon: HardDrive, label: "DB" }, { icon: Clock, label: "Models" }].map((s) => (
            <div key={s.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-500"><s.icon className="w-3 h-3" />{s.label}</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#10b981]" />
                <span className="text-emerald-400">OK</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-10 rounded-r-md bg-[#1e293b] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-[#334155] transition-all z-10">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}

function TopBar({ onCmdK }: { onCmdK: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  return (
    <header className="h-16 border-b border-white/[0.04] bg-[#020617]/50 backdrop-blur-xl flex items-center px-6 gap-4 shrink-0 relative z-30">
      <button onClick={onCmdK}
        className="flex-1 max-w-md flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-500 hover:border-cyan-400/20 hover:bg-white/[0.06] transition-all text-xs">
        <Search className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Search commands, pages, models...</span>
        <kbd className="hidden sm:flex items-center border border-white/[0.06] rounded px-1 text-[10px]">⌘K</kbd>
      </button>
      <div className="flex items-center gap-2 ml-auto relative">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-medium text-emerald-400">Research Mode</span>
        </div>
        <div className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            className="relative p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-slate-300 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 border border-[#020617]" />
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
        <div className="relative">
          <button onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-white/[0.05] transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
          <AnimatePresence>
            {userOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 top-full mt-2 w-52 z-50 rounded-xl border border-white/[0.08] overflow-hidden"
                  style={{ background: "rgba(10,18,38,0.98)", backdropFilter: "blur(24px)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-sm font-semibold text-white">Researcher</p>
                    <p className="text-xs text-slate-500">researcher@lab.edu</p>
                  </div>
                  <div className="p-1.5">
                    <Link href="/dashboard/settings" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/[0.05]">
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </Link>
                    <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10">
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      <div className="hidden md:flex h-full">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onCmdK={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
