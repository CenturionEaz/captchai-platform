"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Zap, Shield, BarChart3, Globe, ArrowRight, Github, ExternalLink, Eye, Cpu, Lock } from "lucide-react";

const features = [
  { icon: Brain, label: "AI-Powered Analysis", description: "OCR, audio transcription, slider analysis via multi-model orchestration", color: "cyan" },
  { icon: Zap, label: "Adaptive Learning", description: "Self-improving AI that learns from failures and corrections in real time", color: "purple" },
  { icon: BarChart3, label: "Analytics Dashboard", description: "Real-time heatmaps, confidence scoring, and learning progress metrics", color: "green" },
  { icon: Globe, label: "Multi-Platform", description: "Web app, Chrome extension, and desktop application support", color: "orange" },
  { icon: Shield, label: "Research-Grade Security", description: "Built for authorized research environments with ethical use enforcement", color: "red" },
  { icon: Cpu, label: "Vector Memory", description: "pgvector-powered mistake clustering and pattern recognition engine", color: "pink" },
];

const stats = [
  { value: "6+", label: "Challenge Types Analyzed" },
  { value: "3", label: "AI Model Pipelines" },
  { value: "Real-time", label: "WebSocket Streaming" },
  { value: "100%", label: "Research-Focused" },
];

const colorMap: Record<string, string> = {
  cyan: "badge-cyan",
  purple: "badge-purple",
  green: "badge-green",
  orange: "badge-orange",
  red: "badge-red",
  pink: "text-pink-400 bg-pink-400/10 border border-pink-400/20",
};

const iconColorMap: Record<string, string> = {
  cyan: "text-cyan-400",
  purple: "text-violet-400",
  green: "text-emerald-400",
  orange: "text-amber-400",
  red: "text-red-400",
  pink: "text-pink-400",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] cyber-grid overflow-x-hidden">
      {/* Background mesh */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-6 border-b border-white/[0.04] bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">CaptchaIQ</span>
            <span className="badge-cyan ml-2 text-[10px]">RESEARCH</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/CenturionEaz/captchai-platform" target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
              <Github className="w-4 h-4" /> GitHub
            </a>
            <Link href="/dashboard" className="btn-primary text-xs">
              Launch Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
          {/* Warning Badge */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 border border-amber-400/20 bg-amber-400/5 text-amber-400">
            <Lock className="w-3 h-3" />
            For Educational &amp; Security Research Use Only — See ETHICS.md
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            <span className="text-white">AI-Powered</span>
            <br />
            <span className="text-gradient-cyan">CAPTCHA Intelligence</span>
            <br />
            <span className="text-white">Research Platform</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A production-grade, self-learning AI research environment for studying CAPTCHA robustness, adversarial ML, and accessibility. Built with Next.js, FastAPI, and HuggingFace models.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary px-8 py-3 text-base">
              Open Research Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://github.com/CenturionEaz/captchai-platform" target="_blank" rel="noopener noreferrer" className="btn-secondary px-8 py-3 text-base">
              <Github className="w-4 h-4" /> View on GitHub
            </a>
          </motion.div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl w-full">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-5 text-center">
              <div className="text-2xl font-black text-gradient-cyan mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="section-label mb-4">Core Capabilities</div>
            <h2 className="text-4xl font-black text-white mb-4">Research-Grade AI Engine</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every component designed for extensibility, transparency, and academic rigor.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-card p-6 group cursor-default">
                <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${iconColorMap[f.color]}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold mb-2">{f.label}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto text-center">
          <div className="section-label mb-8">Technology Stack</div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Next.js 14", "FastAPI", "Python 3.11", "Supabase", "pgvector", "Tesseract OCR", "Whisper AI", "HuggingFace", "Docker", "Turborepo", "Framer Motion", "WebSockets"].map((tech) => (
              <span key={tech} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 border border-white/[0.06] bg-white/[0.03]">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Ethical Notice */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 border border-amber-400/20">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-amber-400 font-bold mb-2">Ethical Research Commitment</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  CaptchaIQ is strictly an educational and research tool. It must only be used against systems you own or have explicit written permission to test. Usage against third-party systems without authorization is a violation of the license and may constitute illegal activity. By using this software, you accept full personal responsibility for compliance with all applicable laws and platform policies.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <a href="/ethics" className="text-xs text-amber-400 hover:underline flex items-center gap-1">Ethics Policy <ExternalLink className="w-3 h-3" /></a>
                  <a href="/disclaimer" className="text-xs text-amber-400 hover:underline flex items-center gap-1">Disclaimer <ExternalLink className="w-3 h-3" /></a>
                  <a href="/acceptable-use" className="text-xs text-amber-400 hover:underline flex items-center gap-1">Acceptable Use <ExternalLink className="w-3 h-3" /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 text-sm">CaptchaIQ Platform</span>
            <span className="text-slate-600 text-xs">© 2024 Pratyaksh</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="https://github.com/CenturionEaz/captchai-platform" className="hover:text-slate-300 transition-colors">GitHub</a>
            <a href="/docs" className="hover:text-slate-300 transition-colors">Docs</a>
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
