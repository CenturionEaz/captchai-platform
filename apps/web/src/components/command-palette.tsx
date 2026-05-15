"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, LayoutDashboard, Cpu, Brain, BarChart3, Activity,
  GitBranch, Database, Zap, Settings, Sparkles, FlaskConical,
  ArrowRight, Command, User, LogOut, HelpCircle,
} from "lucide-react";

const commands = [
  { id: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard, href: "/dashboard", category: "Navigate" },
  { id: "analyze", label: "Analyze Challenge", icon: Cpu, href: "/dashboard/analyze", category: "Navigate" },
  { id: "generator", label: "CAPTCHA Generator", icon: Sparkles, href: "/dashboard/generator", category: "Navigate" },
  { id: "lab", label: "Research Lab", icon: FlaskConical, href: "/dashboard/lab", category: "Navigate" },
  { id: "learning", label: "Learning Engine", icon: Brain, href: "/dashboard/learning", category: "Navigate" },
  { id: "models", label: "Model Registry", icon: GitBranch, href: "/dashboard/models", category: "Navigate" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/dashboard/analytics", category: "Navigate" },
  { id: "activity", label: "Live Activity Feed", icon: Activity, href: "/dashboard/activity", category: "Navigate" },
  { id: "benchmarks", label: "Benchmarks", icon: Zap, href: "/dashboard/benchmarks", category: "Navigate" },
  { id: "training", label: "Training Jobs", icon: Brain, href: "/dashboard/training", category: "Navigate" },
  { id: "memory", label: "Vector Memory", icon: Database, href: "/dashboard/memory", category: "Navigate" },
  { id: "settings", label: "Settings", icon: Settings, href: "/dashboard/settings", category: "Navigate" },
  { id: "profile", label: "My Profile", icon: User, href: "/dashboard/settings/profile", category: "Account" },
  { id: "logout", label: "Sign Out", icon: LogOut, href: "/login", category: "Account" },
  { id: "docs", label: "Documentation", icon: HelpCircle, href: "/docs", category: "Help" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.trim()
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const grouped = filtered.reduce<Record<string, typeof commands>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const execute = useCallback((cmd: typeof commands[0]) => {
    onClose();
    setQuery("");
    router.push(cmd.href);
  }, [onClose, router]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter" && filtered[selected]) { execute(filtered[selected]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, selected, execute, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-xl"
            style={{
              background: "rgba(10, 18, 38, 0.98)",
              border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: 14,
              boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,212,255,0.08)",
              backdropFilter: "blur(24px)",
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                placeholder="Search commands, pages, models..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-600"
              />
              <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-slate-600 border border-white/[0.08] rounded px-1.5 py-0.5">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2 no-scrollbar">
              {filtered.length === 0 ? (
                <p className="text-center text-slate-600 text-sm py-8">No commands found for "{query}"</p>
              ) : (
                Object.entries(grouped).map(([category, cmds]) => {
                  let globalIdx = filtered.indexOf(cmds[0]);
                  return (
                    <div key={category} className="mb-1">
                      <p className="section-label px-2 py-1.5">{category}</p>
                      {cmds.map((cmd) => {
                        const idx = globalIdx++;
                        const isSelected = selected === idx;
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => execute(cmd)}
                            onMouseEnter={() => setSelected(idx)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                              isSelected
                                ? "bg-cyan-400/10 text-cyan-400"
                                : "text-slate-300 hover:bg-white/[0.04]"
                            }`}
                          >
                            <cmd.icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                            <span className="text-sm font-medium">{cmd.label}</span>
                            {isSelected && <ArrowRight className="w-3.5 h-3.5 ml-auto text-cyan-400/60" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.04] text-[10px] text-slate-600">
              <span className="flex items-center gap-1"><kbd className="border border-white/[0.08] rounded px-1">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="border border-white/[0.08] rounded px-1">↵</kbd> open</span>
              <span className="flex items-center gap-1"><kbd className="border border-white/[0.08] rounded px-1">ESC</kbd> close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
