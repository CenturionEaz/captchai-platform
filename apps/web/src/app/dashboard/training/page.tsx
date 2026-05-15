"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Play, Pause, CheckCircle2, XCircle, Clock, RefreshCw, Plus, ChevronDown, BarChart2, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

type JobStatus = "running" | "queued" | "complete" | "failed" | "paused";

interface TrainingJob {
  id: string;
  model: string;
  dataset: string;
  status: JobStatus;
  progress: number;
  accuracy: { before: number; current: number };
  loss: number;
  epoch: { current: number; total: number };
  samplesUsed: number;
  startedAt: string;
  eta: string;
  trigger: string;
}

const JOBS: TrainingJob[] = [
  { id: "job-1001", model: "CaptchaIQ OCR v3", dataset: "ocr-corrections-2024-05", status: "running", progress: 67, accuracy: { before: 89.2, current: 91.7 }, loss: 0.18, epoch: { current: 7, total: 10 }, samplesUsed: 2841, startedAt: "2h ago", eta: "43m", trigger: "threshold" },
  { id: "job-1002", model: "CaptchaIQ Vision v2", dataset: "image-grid-v4-augmented", status: "queued", progress: 0, accuracy: { before: 92.1, current: 92.1 }, loss: 0.22, epoch: { current: 0, total: 15 }, samplesUsed: 0, startedAt: "—", eta: "~2h", trigger: "manual" },
  { id: "job-1003", model: "CaptchaIQ Audio v1", dataset: "audio-corrections-weekly", status: "complete", progress: 100, accuracy: { before: 84.1, current: 87.3 }, loss: 0.14, epoch: { current: 20, total: 20 }, samplesUsed: 1482, startedAt: "Yesterday", eta: "—", trigger: "scheduled" },
  { id: "job-1004", model: "CaptchaIQ Slider v1", dataset: "slider-edge-cases", status: "failed", progress: 34, accuracy: { before: 95.8, current: 95.8 }, loss: 0.31, epoch: { current: 5, total: 15 }, samplesUsed: 711, startedAt: "3h ago", eta: "—", trigger: "manual" },
];

const lossHistory = Array.from({ length: 10 }, (_, i) => ({
  epoch: i + 1,
  ocr: Math.max(0.1, 0.45 - i * 0.03 + (Math.random() - 0.5) * 0.02),
  vision: Math.max(0.12, 0.38 - i * 0.025 + (Math.random() - 0.5) * 0.015),
}));

const statusConfig: Record<JobStatus, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  running: { color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/30", icon: RefreshCw, label: "RUNNING" },
  queued: { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30", icon: Clock, label: "QUEUED" },
  complete: { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30", icon: CheckCircle2, label: "COMPLETE" },
  failed: { color: "text-red-400", bg: "bg-red-400/10 border-red-400/30", icon: XCircle, label: "FAILED" },
  paused: { color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/30", icon: Pause, label: "PAUSED" },
};

export default function TrainingPage() {
  const [expandedJob, setExpandedJob] = useState<string | null>("job-1001");

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-400" /> Training Jobs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">AI model training management · Experiment tracking · Job orchestration</p>
        </div>
        <button className="btn-primary text-sm gap-2">
          <Plus className="w-4 h-4" /> New Training Job
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Jobs", value: "1", color: "cyan" },
          { label: "Queued", value: "1", color: "amber" },
          { label: "Completed", value: "1", color: "emerald" },
          { label: "Failed", value: "1", color: "red" },
        ].map((k) => (
          <div key={k.label} className="glass-card p-4 text-center">
            <div className={`text-2xl font-black ${k.color === "cyan" ? "text-cyan-400" : k.color === "amber" ? "text-amber-400" : k.color === "emerald" ? "text-emerald-400" : "text-red-400"}`}>{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Loss Chart */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white mb-4">Active Training Loss Curves</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={lossHistory}>
            <XAxis dataKey="epoch" tick={{ fontSize: 10 }} label={{ value: "Epoch", position: "insideBottom", offset: -3, fontSize: 10 }} />
            <YAxis domain={[0, 0.5]} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} formatter={(v: number) => v.toFixed(3)} />
            <Line type="monotone" dataKey="ocr" stroke="#00d4ff" strokeWidth={2} dot={false} name="OCR v3" />
            <Line type="monotone" dataKey="vision" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Vision v2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Job List */}
      <div className="space-y-3">
        {JOBS.map((job) => {
          const cfg = statusConfig[job.status];
          const expanded = expandedJob === job.id;
          return (
            <div key={job.id} className="glass-card overflow-hidden">
              <button onClick={() => setExpandedJob(expanded ? null : job.id)} className="w-full p-5 text-left">
                <div className="flex items-center gap-4">
                  {/* Status */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                    <cfg.icon className={`w-3 h-3 ${job.status === "running" ? "animate-spin" : ""}`} />
                    {cfg.label}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{job.model}</div>
                    <div className="text-xs text-slate-500">{job.dataset} · Triggered by {job.trigger}</div>
                  </div>
                  {/* Progress */}
                  <div className="hidden md:block w-32 text-right">
                    <div className="text-xs text-slate-500 mb-1">{job.progress}%</div>
                    <div className="h-1.5 rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${job.progress}%` }} />
                    </div>
                  </div>
                  {/* ETA */}
                  <div className="hidden md:block text-right">
                    <div className="text-xs text-slate-500">ETA</div>
                    <div className="text-sm font-semibold text-white">{job.eta}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
              </button>

              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0 }}
                  className="border-t border-white/[0.04] px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Epoch", value: `${job.epoch.current}/${job.epoch.total}` },
                    { label: "Samples Used", value: job.samplesUsed.toLocaleString() },
                    { label: "Loss", value: job.loss.toFixed(3) },
                    { label: "Accuracy Δ", value: `${job.accuracy.before}% → ${job.accuracy.current}%` },
                    { label: "Job ID", value: job.id },
                    { label: "Started", value: job.startedAt },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-[10px] text-slate-600">{s.label}</div>
                      <div className="text-sm font-semibold text-white mt-0.5">{s.value}</div>
                    </div>
                  ))}
                  <div className="col-span-full flex gap-2 mt-2">
                    {job.status === "running" && <button className="btn-secondary text-xs py-1.5 px-3"><Pause className="w-3 h-3" /> Pause</button>}
                    {job.status === "failed" && <button className="btn-secondary text-xs py-1.5 px-3"><RefreshCw className="w-3 h-3" /> Retry</button>}
                    {job.status === "queued" && <button className="btn-secondary text-xs py-1.5 px-3"><Play className="w-3 h-3" /> Run Now</button>}
                    <button className="btn-ghost text-xs py-1.5 px-3"><BarChart2 className="w-3 h-3" /> Logs</button>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
